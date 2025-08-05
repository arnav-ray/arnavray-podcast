// Enhanced Automated Podcast Generation Function for Netlify
const RSS_SOURCES = {
  "ai-tech": {
    "en": [
      "https://techcrunch.com/feed/",
      "https://feeds.arstechnica.com/arstechnica/index",
      "https://www.theverge.com/rss/index.xml",
      "https://www.wired.com/feed/rss",
      "https://venturebeat.com/feed/",
      "https://thenextweb.com/feed/"
    ],
    "de": [
      "https://www.heise.de/rss/heise-atom.xml",
      "https://www.golem.de/rss/golem-de-atom.xml",
      "https://t3n.de/rss.xml",
      "https://www.computerwoche.de/rss/computerwoche.xml",
      "https://www.netzwelt.de/rss/news.xml",
      "https://www.pc-welt.de/rss/pcwelt-alle.xml"
    ]
  },
  "finance-business": {
    "en": [
      "https://feeds.bloomberg.com/markets/news.rss",
      "https://feeds.reuters.com/reuters/businessNews",
      "https://feeds.marketwatch.com/marketwatch/topstories/",
      "https://www.cnbc.com/id/10001147/device/rss/rss.html",
      "https://feeds.wsj.com/wsj/xml/rss/3_7085.xml"
    ],
    "de": [
      "https://www.handelsblatt.com/contentexport/feed/top-themen",
      "https://www.manager-magazin.de/rss",
      "https://www.wiwo.de/contentexport/feed/rss/schlagzeilen",
      "https://www.faz.net/rss/aktuell/wirtschaft/",
      "https://www.sueddeutsche.de/wirtschaft/rss"
    ]
  },
  "leadership-strategy": {
    "en": [
      "https://hbr.org/feed",
      "https://feeds.feedburner.com/fastcompany/headlines",
      "https://feeds.inc.com/home/updates",
      "https://www.mckinsey.com/insights/rss",
      "https://sloanreview.mit.edu/feed/"
    ],
    "de": [
      "https://www.manager-magazin.de/rss/ressort-unternehmen.xml",
      "https://www.impulse.de/feed.rss",
      "https://www.brandeins.de/rss.xml",
      "https://www.capital.de/karriere/feed/rss",
      "https://www.gruenderszene.de/feed"
    ]
  },
  "science-innovation": {
    "en": [
      "https://www.sciencedaily.com/rss/all.xml",
      "https://feeds.nature.com/nature/rss/current",
      "https://www.newscientist.com/feed/home/",
      "https://phys.org/rss-feed/",
      "https://feeds.sciencemag.org/rss/news_current.xml"
    ],
    "de": [
      "https://www.spektrum.de/alias/rss/spektrum-de-rss-feed/996406",
      "https://www.wissenschaft.de/feed/",
      "https://www.scinexx.de/feed/",
      "https://www.mpg.de/rss",
      "https://idw-online.de/de/news.rss"
    ]
  },
  "sunday-specials": {
    "en": [
      "https://lifehacker.com/rss",
      "https://www.vox.com/rss/index.xml",
      "https://feeds.mashable.com/Mashable",
      "https://www.mentalfloss.com/feed",
      "https://www.atlasobscura.com/feeds/latest"
    ],
    "de": [
      "https://www.stern.de/feed/alle-nachrichten/",
      "https://rss.sueddeutsche.de/rss/Topthemen",
      "https://www.spiegel.de/schlagzeilen/tops/index.rss",
      "https://www.zeit.de/index/feed",
      "https://www.faz.net/rss/aktuell/"
    ]
  }
};

// German-specific trending keywords for better relevance
const TRENDING_KEYWORDS = {
  en: [
    'ai', 'chatgpt', 'crypto', 'tesla', 'apple', 'google', 'microsoft',
    'breakthrough', 'scandal', 'billion', 'million', 'record', 'first',
    'revolutionary', 'disrupting', 'shocking', 'exclusive', 'breaking'
  ],
  de: [
    'ki', 'künstliche intelligenz', 'bitcoin', 'tesla', 'apple', 'google',
    'durchbruch', 'skandal', 'milliarden', 'millionen', 'rekord', 'erstmals',
    'revolutionär', 'erschütternd', 'exklusiv', 'eilmeldung', 'corona',
    'klimawandel', 'energiewende', 'digitalisierung', 'startup'
  ]
};

// Enhanced host configurations for proper German speakers
const HOSTS = {
  en: {
    "ai-tech": { main: "Alex Rivera", expert: "Dr. Sarah Chen" },
    "finance-business": { main: "Alex Rivera", expert: "Dr. Marcus Sterling" },
    "leadership-strategy": { main: "Alex Rivera", expert: "Dr. Victoria Hamilton" },
    "science-innovation": { main: "Alex Rivera", expert: "Dr. Emma Watson" },
    "sunday-specials": { main: "Alex Rivera", expert: "Jordan Blake" }
  },
  de: {
    "ai-tech": { main: "Markus Weber", expert: "Dr. Anna Fischer" },
    "finance-business": { main: "Markus Weber", expert: "Dr. Klaus Hoffmann" },
    "leadership-strategy": { main: "Markus Weber", expert: "Dr. Julia Schneider" },
    "science-innovation": { main: "Markus Weber", expert: "Dr. Stefan Mueller" },
    "sunday-specials": { main: "Markus Weber", expert: "Lisa Bauer" }
  }
};

// Scoring system for article relevance
function scoreArticle(article, language) {
  let score = 0;
  const title = article.title.toLowerCase();
  const desc = article.description.toLowerCase();
  const keywords = TRENDING_KEYWORDS[language] || TRENDING_KEYWORDS.en;
  
  // Check for trending keywords
  keywords.forEach(keyword => {
    if (title.includes(keyword)) score += 3;
    if (desc.includes(keyword)) score += 1;
  });
  
  // Favor recent articles
  const pubDate = new Date(article.pubDate);
  const hoursOld = (Date.now() - pubDate) / (1000 * 60 * 60);
  if (hoursOld < 6) score += 5;
  else if (hoursOld < 24) score += 3;
  else if (hoursOld < 72) score += 1;
  
  // Length preference
  if (desc.length > 100 && desc.length < 500) score += 2;
  
  // Engagement indicators
  if (title.includes('?')) score += 1;
  if (title.match(/\d+/)) score += 1;
  
  return score;
}

// Enhanced RSS parser
async function parseRSSFeed(url, language) {
  try {
    console.log(`Fetching RSS from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastBot/2.0)'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`RSS fetch failed: ${response.status} for ${url}`);
      return [];
    }
    
    const xmlText = await response.text();
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 10) {
      const item = match[1];
      
      const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
      
      const descMatch = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i);
      const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim().replace(/<[^>]*>/g, '') : '';
      
      const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/i);
      const link = linkMatch ? linkMatch[1].trim() : '';
      
      const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
      
      if (title && description) {
        const article = {
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          link,
          pubDate,
          source: new URL(url).hostname
        };
        
        article.score = scoreArticle(article, language);
        items.push(article);
      }
    }
    
    return items.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

// Language-specific hot takes
const HOT_TAKES = {
  en: {
    "ai-tech": [
      "This is giving me serious 'we're living in the future' vibes!",
      "Plot twist of the century right here, folks!",
      "The tech world just got a reality check!",
      "Silicon Valley is either celebrating or panicking right now.",
      "This changes everything we thought we knew!",
      "Someone's definitely updating their LinkedIn after this."
    ],
    "finance-business": [
      "Wall Street is having a moment!",
      "That's going to shake up some portfolios!",
      "The market gods have spoken!",
      "Someone's yacht payment just got interesting.",
      "This is why we can't have nice things in finance!",
      "Breaking: Economists confused, water still wet."
    ],
    "leadership-strategy": [
      "That's MBA-speak for 'hold my coffee'!",
      "The C-suite drama continues!",
      "Leadership 101: How to shake things up!",
      "This is what disruption looks like!",
      "Corporate chess at its finest!",
      "Someone read the room perfectly."
    ],
    "science-innovation": [
      "Science just dropped the mic!",
      "The future is now, apparently!",
      "Peer reviewers must be having a field day!",
      "This is why I love science!",
      "Mind = officially blown!",
      "Nobel Prize committee taking notes!"
    ],
    "sunday-specials": [
      "This is peak humanity right here!",
      "Well, that's enough internet for today!",
      "The world remains undefeated in weirdness!",
      "This is why aliens won't visit us!",
      "Plot twist: humans are strange!",
      "I'm not even surprised anymore!"
    ]
  },
  de: {
    "ai-tech": [
      "Das ist ja der Hammer!",
      "Willkommen in der Zukunft, meine Freunde!",
      "Die Tech-Welt steht Kopf!",
      "Das wird noch spannend werden!",
      "Silicon Valley auf Deutsch!",
      "Da haben die Ingenieure wieder gezaubert!"
    ],
    "finance-business": [
      "Die Börse macht wieder verrückte Sachen!",
      "Das wird teuer, Leute!",
      "Die Wirtschaftsbosse schwitzen!",
      "Typisch Finanzwelt!",
      "Da freut sich der Steuerberater!",
      "Die unsichtbare Hand des Marktes schlägt zu!"
    ],
    "leadership-strategy": [
      "Führungskräfte aufgepasst!",
      "Das nenne ich mal Strategie!",
      "Die Chefetage dreht durch!",
      "Typisch deutsches Management!",
      "Da hat jemand mitgedacht!",
      "Disruption auf Deutsch!"
    ],
    "science-innovation": [
      "Die Wissenschaft hat wieder zugeschlagen!",
      "Forschung at its best!",
      "Das ist nobelpreisverdächtig!",
      "Deutsche Gründlichkeit zahlt sich aus!",
      "Die Zukunft wird fantastisch!",
      "Wahnsinn, was heute möglich ist!"
    ],
    "sunday-specials": [
      "Das ist typisch Sonntag!",
      "Menschen sind schon komisch!",
      "Das Leben schreibt die besten Geschichten!",
      "Verrückte Welt!",
      "Das glaubt mir keiner!",
      "Nur in Deutschland möglich!"
    ]
  }
};

// Generate engaging dialogue script
function generateDialogueScript(articles, bunch, language) {
  const hosts = HOSTS[language][bunch];
  const hotTakes = HOT_TAKES[language][bunch];
  
  let script = "";
  
  if (language === 'en') {
    script = `${hosts.main}: Welcome to ${bunch.replace('-', ' ').toUpperCase()} Daily! I'm ${hosts.main}, and joining me is ${hosts.expert}. We've got some incredible stories today that'll make you question everything!\n\n`;
    
    script += `${hosts.expert}: Thanks ${hosts.main.split(' ')[0]}! I've been diving deep into today's news, and let me tell you, it's a wild ride!\n\n`;
    
    script += `${hosts.main}: Let's jump right in! ${hotTakes[0]}\n\n`;
    
  } else {
    script = `${hosts.main}: Willkommen zu ${bunch.replace('-', ' ').toUpperCase()} Daily! Ich bin ${hosts.main}, und bei mir ist ${hosts.expert}. Wir haben heute unglaubliche Geschichten, die euch vom Hocker hauen werden!\n\n`;
    
    script += `${hosts.expert}: Danke ${hosts.main.split(' ')[0]}! Ich habe mich durch die heutigen Nachrichten gewühlt, und ich sage euch: Es ist der absolute Wahnsinn!\n\n`;
    
    script += `${hosts.main}: Dann legen wir mal los! ${hotTakes[0]}\n\n`;
  }
  
  articles.forEach((article, index) => {
    const randomTake = hotTakes[Math.floor(Math.random() * hotTakes.length)];
    
    if (language === 'en') {
      script += `${hosts.main}: Our ${index === 0 ? 'top story' : 'next story'}: "${article.title}". ${randomTake}\n\n`;
      
      script += `${hosts.expert}: ${article.description} This is particularly significant because it shows how rapidly things are evolving in this space. The implications here are massive!\n\n`;
      
      if (index < articles.length - 1) {
        script += `${hosts.main}: Absolutely mind-blowing! And speaking of game-changers...\n\n`;
      }
    } else {
      script += `${hosts.main}: ${index === 0 ? 'Unsere Top-Story' : 'Die nächste Geschichte'}: "${article.title}". ${randomTake}\n\n`;
      
      script += `${hosts.expert}: ${article.description} Das ist besonders bedeutsam, weil es zeigt, wie schnell sich die Dinge in diesem Bereich entwickeln. Die Auswirkungen sind enorm!\n\n`;
      
      if (index < articles.length - 1) {
        script += `${hosts.main}: Absolut verrückt! Und apropos Wendepunkte...\n\n`;
      }
    }
  });
  
  // Closing
  if (language === 'en') {
    script += `${hosts.main}: And that's your ${bunch.replace('-', ' ')} update for today! ${hosts.expert.split(' ')[1]}, any final thoughts?\n\n`;
    script += `${hosts.expert}: Just remember: in a world of constant change, staying informed is your superpower. Keep questioning, keep learning!\n\n`;
    script += `${hosts.main}: Brilliantly said! This has been ${bunch.replace('-', ' ').toUpperCase()} Daily. Until tomorrow, stay curious and stay awesome!\n\n`;
  } else {
    script += `${hosts.main}: Und das war euer ${bunch.replace('-', ' ')} Update für heute! ${hosts.expert.split(' ')[1]}, noch ein Schlusswort?\n\n`;
    script += `${hosts.expert}: Denkt daran: In einer Welt des ständigen Wandels ist Informiert-Sein eure Superkraft. Bleibt neugierig, bleibt kritisch!\n\n`;
    script += `${hosts.main}: Perfekt gesagt! Das war ${bunch.replace('-', ' ').toUpperCase()} Daily. Bis morgen, bleibt neugierig und bleibt großartig!\n\n`;
  }
  
  return script;
}

// Get all episodes (for history/index)
async function getAllEpisodes() {
  // In production, this would query a database
  // For now, return empty array
  return [];
}

// Main handler
export const handler = async (event, context) => {
  try {
    console.log('Starting podcast generation...');
    
    const today = new Date().toISOString().split('T')[0];
    const params = new URLSearchParams(event.rawQuery || '');
    const requestedBunch = params.get('bunch');
    const requestedLang = params.get('lang');
    const action = params.get('action');
    
    // Handle different actions
    if (action === 'history') {
      const episodes = await getAllEpisodes();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          episodes
        })
      };
    }
    
    if (!requestedBunch || !requestedLang) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Missing required parameters: bunch and lang',
          availableBunches: Object.keys(RSS_SOURCES),
          availableLanguages: ['en', 'de']
        })
      };
    }
    
    const sources = RSS_SOURCES[requestedBunch]?.[requestedLang];
    if (!sources) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: `Invalid bunch or language: ${requestedBunch}-${requestedLang}`
        })
      };
    }
    
    // Generate episode
    console.log(`Generating ${requestedBunch} episode in ${requestedLang}...`);
    
    // Fetch articles from all sources
    const allArticles = [];
    for (const source of sources) {
      const articles = await parseRSSFeed(source, requestedLang);
      allArticles.push(...articles);
    }
    
    // Sort by score and take top articles
    const topArticles = allArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(4, allArticles.length));
    
    if (topArticles.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'No articles found'
        })
      };
    }
    
    // Generate script
    const script = generateDialogueScript(topArticles, requestedBunch, requestedLang);
    
    // Calculate duration
    const wordCount = script.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 150);
    
    const episode = {
      id: `${requestedBunch}-${requestedLang}-${today}`,
      bunch: requestedBunch,
      language: requestedLang,
      date: today,
      title: `${requestedBunch.replace('-', ' ').toUpperCase()} Daily - ${new Date().toLocaleDateString()}`,
      description: topArticles.slice(0, 3).map(a => a.title.split(' ').slice(0, 5).join(' ')).join(' | '),
      script,
      duration: `${estimatedMinutes}:00`,
      articles: topArticles,
      totalScore: topArticles.reduce((sum, a) => sum + a.score, 0),
      hosts: HOSTS[requestedLang][requestedBunch]
    };
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        episode
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};
