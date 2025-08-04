// Automated Podcast Generation Function for Netlify
const RSS_SOURCES = {
  "ai-tech": {
    "en": [
      "https://techcrunch.com/feed/",
      "https://feeds.arstechnica.com/arstechnica/index",
      "https://www.theverge.com/rss/index.xml"
    ],
    "de": [
      "https://www.heise.de/rss/heise-atom.xml",
      "https://rss.golem.de/rss.php?feed=ATOM1.0"
    ]
  },
  "business": {
    "en": [
      "https://feeds.reuters.com/reuters/businessNews"
    ],
    "de": [
      "https://www.handelsblatt.com/contentexport/feed/technik"
    ]
  },
  "science": {
    "en": [
      "https://www.sciencedaily.com/rss/computers_math.xml"
    ],
    "de": [
      "https://www.spektrum.de/alias/rss/spektrum-de-rss-feed/996406"
    ]
  },
  "health": {
    "en": [
      "https://www.medicalnewstoday.com/rss"
    ],
    "de": [
      "https://www.apotheken-umschau.de/rss/"
    ]
  },
  "politics": {
    "en": [
      "https://feeds.reuters.com/reuters/politicsNews"
    ],
    "de": [
      "https://www.tagesschau.de/xml/rss2/"
    ]
  }
};

// Simple RSS parser (no external dependencies)
async function parseRSSFeed(url) {
  try {
    console.log(`Fetching RSS from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastBot/1.0)'
      }
    });
    
    if (!response.ok) {
      console.log(`RSS fetch failed: ${response.status} for ${url}`);
      return [];
    }
    
    const xmlText = await response.text();
    console.log(`RSS content length: ${xmlText.length} chars from ${url}`);
    
    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 3) {
      const item = match[1];
      
      // Extract title
      const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
      
      // Extract description
      const descMatch = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i);
      const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim().replace(/<[^>]*>/g, '') : '';
      
      // Extract link
      const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/i);
      const link = linkMatch ? linkMatch[1].trim() : '';
      
      // Extract publication date
      const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
      
      if (title && description) {
        items.push({
          title: title.substring(0, 100),
          description: description.substring(0, 300),
          link,
          pubDate,
          source: new URL(url).hostname
        });
        console.log(`Parsed article: ${title.substring(0, 50)}...`);
      }
    }
    
    console.log(`Found ${items.length} articles from ${url}`);
    return items;
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

// Generate podcast script in dialogue format
function generateDialogueScript(articles, bunch, language) {
  const hosts = {
    en: { main: "Alex", expert: "Dr. Sarah" },
    de: { main: "Michael", expert: "Dr. Schmidt" }
  };
  
  const greetings = {
    en: {
      intro: `Welcome to ${bunch.replace('-', ' ').toUpperCase()} Daily. I'm ${hosts.en.main}, and I'm here with ${hosts.en.expert}.`,
      transition: "Let's dive into today's top stories."
    },
    de: {
      intro: `Willkommen zu ${bunch.replace('-', ' ').toUpperCase()} Daily. Ich bin ${hosts.de.main}, und hier ist ${hosts.de.expert}.`,
      transition: "Schauen wir uns die wichtigsten Nachrichten von heute an."
    }
  };
  
  const currentGreeting = greetings[language] || greetings.en;
  const currentHosts = hosts[language] || hosts.en;
  
  let script = `${currentHosts.main}: ${currentGreeting.intro} ${currentGreeting.transition}\n\n`;
  
  articles.forEach((article, index) => {
    script += `${currentHosts.main}: ${currentHosts.expert}, let's talk about "${article.title}". What's your take on this?\n\n`;
    
    script += `${currentHosts.expert}: ${article.description} `;
    
    if (language === 'en') {
      script += `This is particularly interesting because it shows how rapidly this field is evolving. The implications for businesses and consumers could be significant.\n\n`;
      
      if (index === articles.length - 1) {
        script += `${currentHosts.main}: Great insights. Any final thoughts for our listeners?\n\n`;
        script += `${currentHosts.expert}: I'd say keep an eye on this space. These developments are happening fast, and they'll likely impact how we work and live.\n\n`;
        script += `${currentHosts.main}: Excellent. That's your ${bunch} update for today. Thanks for listening, and we'll see you tomorrow!\n\n`;
      } else {
        script += `${currentHosts.main}: Fascinating. What should people be watching for next?\n\n`;
        script += `${currentHosts.expert}: The key thing to monitor is how this develops over the coming weeks. This could set important precedents.\n\n`;
      }
    } else {
      script += `Das ist besonders interessant, weil es zeigt, wie schnell sich dieses Feld entwickelt. Die Auswirkungen für Unternehmen und Verbraucher könnten erheblich sein.\n\n`;
      
      if (index === articles.length - 1) {
        script += `${currentHosts.main}: Großartige Einblicke. Haben Sie abschließende Gedanken für unsere Hörer?\n\n`;
        script += `${currentHosts.expert}: Ich würde sagen, behalten Sie diesen Bereich im Auge. Diese Entwicklungen passieren schnell und werden wahrscheinlich beeinflussen, wie wir arbeiten und leben.\n\n`;
        script += `${currentHosts.main}: Ausgezeichnet. Das war Ihr ${bunch} Update für heute. Danke fürs Zuhören, wir sehen uns morgen!\n\n`;
      } else {
        script += `${currentHosts.main}: Faszinierend. Worauf sollten die Leute als nächstes achten?\n\n`;
        script += `${currentHosts.expert}: Das Wichtigste ist zu beobachten, wie sich das in den kommenden Wochen entwickelt. Das könnte wichtige Präzedenzfälle schaffen.\n\n`;
      }
    }
  });
  
  return script;
}

// Main function handler
export const handler = async (event, context) => {
  try {
    console.log('Starting automated podcast generation...');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Parse query parameters
    const params = new URLSearchParams(event.rawQuery || '');
    const requestedBunch = params.get('bunch') || 'ai-tech';
    const requestedLang = params.get('lang') || 'en';
    const generateAll = params.get('all') === 'true';
    
    console.log(`Processing: bunch=${requestedBunch}, lang=${requestedLang}, generateAll=${generateAll}`);
    
    const results = [];
    
    if (generateAll) {
      // Generate for all bunches and languages
      for (const [bunch, languages] of Object.entries(RSS_SOURCES)) {
        for (const [lang, sources] of Object.entries(languages)) {
          console.log(`Processing ${bunch}-${lang}...`);
          const episode = await generateEpisode(bunch, lang, sources, today);
          results.push(episode);
        }
      }
    } else {
      // Generate for specific bunch and language
      const sources = RSS_SOURCES[requestedBunch]?.[requestedLang];
      if (!sources) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: `No sources found for ${requestedBunch}-${requestedLang}`,
            availableBunches: Object.keys(RSS_SOURCES),
            availableLanguages: Object.keys(RSS_SOURCES[Object.keys(RSS_SOURCES)[0]] || {})
          })
        };
      }
      
      const episode = await generateEpisode(requestedBunch, requestedLang, sources, today);
      results.push(episode);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        generated: results.length,
        episodes: results,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error in podcast generation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Generate a single episode
async function generateEpisode(bunch, language, sources, date) {
  try {
    console.log(`Fetching articles for ${bunch}-${language}...`);
    
    // Fetch articles from all sources
    const allArticles = [];
    for (const source of sources) {
      try {
        const articles = await parseRSSFeed(source);
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Failed to fetch from ${source}:`, error);
        // Continue with other sources
      }
    }
    
    // Take top 3 articles
    const topArticles = allArticles.slice(0, 3);
    
    if (topArticles.length === 0) {
      console.log(`No articles found for ${bunch}-${language}`);
      return {
        id: `${bunch}-${language}-${date}`,
        bunch,
        language,
        date,
        title: `${bunch.toUpperCase()} Daily - ${date}`,
        description: 'No new articles available today.',
        script: 'No content available for today. Please try again later.',
        duration: '0:30',
        articles: []
      };
    }
    
    console.log(`Found ${topArticles.length} articles for ${bunch}-${language}`);
    
    // Generate dialogue script
    const script = generateDialogueScript(topArticles, bunch, language);
    
    // Calculate estimated duration (average speaking rate: 150 words/minute)
    const wordCount = script.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 150);
    const duration = `${estimatedMinutes}:00`;
    
    // Create episode object
    const episode = {
      id: `${bunch}-${language}-${date}`,
      bunch,
      language,
      date,
      title: `${bunch.replace('-', ' ').toUpperCase()} Daily - ${new Date(date).toLocaleDateString()}`,
      description: `Today's top ${bunch.replace('-', ' ')} stories: ${topArticles.map(a => a.title).join(', ')}`,
      script,
      duration,
      articles: topArticles,
      audioUrl: null, // Will be generated later with TTS
      rssUrl: `https://podcast.arnavray.ca/${bunch}/${language}/rss.xml`
    };
    
    console.log(`Generated episode: ${episode.title}`);
    return episode;
    
  } catch (error) {
    console.error(`Error generating episode for ${bunch}-${language}:`, error);
    return {
      id: `${bunch}-${language}-${date}`,
      bunch,
      language,
      date,
      title: `${bunch.toUpperCase()} Daily - ${date}`,
      description: 'Error generating episode.',
      script: 'Error occurred during generation. Please try again later.',
      duration: '0:30',
      articles: [],
      error: error.message
    };
  }
}
