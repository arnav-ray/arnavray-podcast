import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Buffer } from 'node:buffer';

const SPREADSHEET_ID = import.meta.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_BASE64 = import.meta.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export async function getPodcastEpisodes() {
  try {
    if (!SERVICE_ACCOUNT_BASE64 || !SPREADSHEET_ID) {
      throw new Error("Missing Google Sheet credentials in environment variables.");
    }
    const credsJson = Buffer.from(SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const creds = JSON.parse(credsJson);
    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Audio_Log'];
    const rows = await sheet.getRows();
    const episodes = rows.map(row => ({
        id: row.get('Episode ID'),
        publishDate: row.get('Publish Date'),
        headline: row.get('Headline'),
        bunch: row.get('Bunch'),
        language: row.get('Language'),
        mp3Url: row.get('MP3 URL'),
        script: row.get('Script'),
        slug: slugify(row.get('Headline'))
    }));
    return episodes.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
  } catch (error) {
    console.error("Error fetching episodes from Google Sheet:", error.message);
    return [];
  }
}
