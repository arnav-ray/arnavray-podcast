import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fetch from 'node-fetch';
import { Storage } from '@google-cloud/storage';
import { Buffer } from 'node:buffer';

async function getSheetsDoc() {
  const credsJson = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
  const creds = JSON.parse(credsJson);
  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
}

const getPrompt = (lang, bunch, summary) => {
  const prompts = {
    en: `Create a natural, 800-word podcast conversation script between a curious host named "Jamie" and a knowledgeable expert named "Dr. Lin". The topic is "${bunch}". Base the conversation on this summary: "${summary}".`,
    de: `Erstellen Sie ein natürliches, 800 Wörter langes Podcast-Gesprächsskript zwischen einem neugierigen Moderator namens "Jamie" und einem sachkundigen Experten namens "Dr. Lin". Das Thema ist "${bunch}". Basieren Sie das Gespräch auf dieser Zusammenfassung: "${summary}".`,
  };
  return prompts[lang] || prompts['en'];
};

const getVoice = (lang) => {
    return {
        en: { languageCode: "en-US", name: "en-US-Journey-D" },
        de: { languageCode: "de-DE", name: "de-DE-Wavenet-B" },
    }[lang] || { languageCode: "en-US", name: "en-US-Journey-D" };
};

export const handler = async () => {
  let jobRow;
  try {
    const doc = await getSheetsDoc();
    const sheet = doc.sheetsByTitle["Topics"];
    const logSheet = doc.sheetsByTitle["Audio_Log"];
    const now = new Date();
    const rows = await sheet.getRows();
    jobRow = rows.find(r => r.get("Automation Status") === "Pending" && new Date(r.get("Scheduled Date")) <= now);
    if (!jobRow) {
      return { statusCode: 200, body: "No pending jobs scheduled." };
    }
    const headline = jobRow.get("Headline");
    jobRow.set("Automation Status", "Processing");
    await jobRow.save();
    const prompt = getPrompt(jobRow.get("Language"), jobRow.get("Bunch"), jobRow.get("Summary"));
    const scriptRes = await fetch("https://openrouter.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-4o", messages: [{ role: "user", content: prompt }] }),
    });
    if (!scriptRes.ok) throw new Error(`OpenRouter API failed: ${await scriptRes.text()}`);
    const scriptData = await scriptRes.json();
    const script = scriptData.choices[0].message.content;
    const ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: script },
        voice: getVoice(jobRow.get("Language")),
        audioConfig: { audioEncoding: "MP3" },
      }),
    });
    if (!ttsRes.ok) throw new Error(`Google TTS API failed: ${await ttsRes.text()}`);
    const tts = await ttsRes.json();
    const storage = new Storage({ projectId: process.env.GCP_PROJECT_ID });
    const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET_NAME);
    const fileId = `ep_${Date.now()}_${jobRow.get("Bunch").toLowerCase().replace(/\s/g, '-')}_${jobRow.get("Language")}`;
    const file = bucket.file(`${fileId}.mp3`);
    await file.save(Buffer.from(tts.audioContent, "base64"), { metadata: { contentType: "audio/mpeg" }, public: true });
    const publicUrl = `https://storage.googleapis.com/${process.env.GCP_STORAGE_BUCKET_NAME}/${fileId}.mp3`;
    await logSheet.addRow({
      "Episode ID": fileId, "Publish Date": now.toISOString(), "Headline": headline,
      "Bunch": jobRow.get("Bunch"), "Language": jobRow.get("Language"), "MP3 URL": publicUrl,
      "Script": script, "Word Count": script.split(" ").length,
    });
    jobRow.set("Automation Status", "Complete");
    await jobRow.save();
    return { statusCode: 200, body: "Success" };
  } catch (error) {
    if (jobRow) {
      jobRow.set("Automation Status", "Error");
      jobRow.set("Error Message", error.message);
      await jobRow.save();
    }
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
