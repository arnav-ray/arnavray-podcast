// Enhanced Automated Podcast Generation Function for Netlify
const RSS_SOURCES = {
  "ai-tech": {
    "en": [
      "https://techcrunch.com/feed/",
      "https://feeds.arstechnica.com/arstechnica/index",
      "https://www.theverge.com/rss/index.xml",
      "https://www.wired.com/feed/rss",
      "https://venturebeat.com/feed/",
      "https://thenextweb.com/feed/",
      "https://feeds.feedburner.com/TheHackersNews"
    ],
    "de": [
      "https://www.heise.de/rss/heise-atom.xml",
      "https://rss.golem.de/rss.php?feed=ATOM1.0",
      "https://www.computerbild.de/rss/tests.xml",
      "https://t3n.de/rss.xml",
      "https://www.chip.de/rss/rss_overblick.xml"
    ]
  },
  "finance-business": {
    "en": [
      "https://feeds.bloomberg.com/markets/news.rss",
      "https://feeds.reuters.com/reuters/businessNews",
      "https://feeds.fortune.com/fortune/finance",
      "https://www.cnbc.com/id/10001147/device/rss/rss.html",
      "https://feeds.wsj.com/wsj/xml/rss/3_7085.xml",
      "https://feeds.ft.com/rss/home"
    ],
    "de": [
      "https://www.handelsblatt.com/contentexport/feed/top-themen",
      "https://www.manager-magazin.de/rss",
      "https://www.wiwo.de/contentexport/feed/rss/schlagzeilen",
      "https://www.capital.de/feed/rss",
      "https://www.finance-magazin.de/feed/"
    ]
  },
  "leadership-strategy": {
    "en": [
      "https://hbr.org/feed",
      "https://feeds.feedburner.com/fastcompany/headlines",
      "https://feeds.inc.com/home/updates",
      "https://www.mckinsey.com/insights/rss",
      "https://knowledge.wharton.upenn.edu/feed/",
      "https://sloanreview.mit.edu/feed/"
    ],
    "de": [
      "https://www.manager-magazin.de/rss/ressort-unternehmen.xml",
      "https://www.capital.de/karriere/feed/rss",
      "https://www.impulse.de/feed.rss",
      "https://www.brandeins.de/rss.xml"
    ]
  },
  "science-innovation": {
    "en": [
      "https://www.sciencedaily.com/rss/computers_math.xml",
      "https://feeds.nature.com/nature/rss/current",
      "https://www.newscientist.com/feed/home/",
      "https://phys.org/rss-feed/",
      "https://feeds.sciencemag.org/rss/news_current.xml",
      "https://feeds.popsci.com/c/34567/f/632419/index.rss"
    ],
    "de": [
      "https://www.spektrum.de/alias/rss/spektrum-de-rss-feed/996406",
      "https://www.wissenschaft.de/feed/",
      "https://www.scinexx.de/feed/",
      "https://www.forschung-und-lehre.de/rss",
      "https://www.laborpraxis.vogel.de/rss/news.xml"
    ]
  },
  "sunday-specials": {
    "en": [
      "https://lifehacker.com/rss",
      "https://www.vox.com/rss/index.xml",
      "https://feeds.mashable.com/Mashable",
      "https://www.buzzfeed.com/world.xml",
      "https://www.mentalfloss.com/feed",
      "https://feeds.howstuffworks.com/DailyStuffPodcast"
    ],
    "de": [
      "https://www.stern.de/feed/alle-nachrichten/",
      "https://rss.sueddeutsche.de/rss/Panorama",
      "https://www.welt.de/feeds/section/vermischtes.rss",
      "https://www.bento.de/rss/feed.rss",
      "https://www.jetzt.de/rss"
    ]
  }
};

// Scoring system for article relevance and engagement
function scoreArticle(article) {
  let score = 0;
  const title = article.title.toLowerCase();
  const desc = article.description.toLowerCase();
  
  // Trending keywords (updated weekly in production)
  const trendingKeywords = [
    'ai', 'chatgpt', 'crypto', 'tesla', 'apple', 'google', 'microsoft',
    'breakthrough', 'scandal', 'billion', 'million', 'record', 'first',
    'revolutionary', 'disrupting', 'shocking', 'exclusive', 'breaking'
  ];
  
  // Check for trending keywords
  trendingKeywords.forEach(keyword => {
    if (title.includes(keyword)) score += 3;
    if (desc.includes(keyword)) score += 1;
  });
  
  // Favor recent articles
  const pubDate = new Date(article.pubDate);
  const hoursOld = (Date.now() - pubDate) / (1000 * 60 * 60);
  if (hoursOld < 6) score += 5;
  else if (hoursOld < 24) score += 3;
  else if (hoursOld < 72) score += 1;
  
  // Length preference (not too short, not too long)
  if (desc.length > 100 && desc.length < 500) score += 2;
  
  // Engagement indicators
  if (title.includes('?')) score += 1; // Questions engage readers
  if (title.match(/\d+/)) score += 1; // Numbers attract attention
  
  return score;
}

// Enhanced RSS parser
async function parseRSSFeed(url) {
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
    console.log(`RSS content length: ${xmlText.length} chars from ${url}`);
    
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 10) {
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
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
      
      if (title && description) {
        const article = {
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          link,
          pubDate,
          source: new URL(url).hostname
        };
        
        // Calculate engagement score
        article.score = scoreArticle(article);
        
        items.push(article);
        console.log(`Parsed article: ${title.substring(0, 50)}... (score: ${article.score})`);
      }
    }
    
    // Sort by score and return top articles
    return items.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

// Hot takes and humor generators
const HOT_TAKES = {
  "ai-tech": {
    en: [
      "This is giving me serious 'we're living in the future' vibes!",
      "Plot twist of the century right here, folks!",
      "Someone's definitely getting a strongly-worded email about this.",
      "Well, that escalated quickly!",
      "The tech bros are either crying or buying champagne right now.",
      "This is why we can't have nice things in Silicon Valley.",
      "I'm not saying it's revolutionary, but... okay, it's revolutionary.",
      "Someone call the venture capitalists, they're going to lose their minds!"
    ],
    de: [
      "Das ist ja mal wieder typisch Silicon Valley!",
      "Tja, das haben die Experten wohl nicht kommen sehen.",
      "Irgendwo weint gerade ein Startup-Gründer.",
      "Das wird noch interessant werden!",
      "Die Technik-Elite dreht gerade komplett durch.",
      "Willkommen in der Zukunft, meine Damen und Herren!",
      "Das ist der Stoff, aus dem Tech-Träume gemacht sind."
    ]
  },
  "finance-business": {
    en: [
      "Someone's yacht payment just got a lot more complicated!",
      "The Wall Street boys are sweating bullets right now.",
      "This is what happens when MBAs run wild!",
      "I can hear the champagne corks popping from here.",
      "That's going to leave a mark on someone's portfolio!",
      "The market is having a proper tantrum today.",
      "Someone's definitely updating their LinkedIn profile after this."
    ],
    de: [
      "Da wird jemand heute Abend viel Wein brauchen!",
      "Die Börse macht wieder ihr eigenes Ding.",
      "Irgendwo weint gerade ein Fondsmanager.",
      "Das wird teuer, sehr teuer!",
      "Die Analysten hatten mal wieder keine Ahnung.",
      "Willkommen im Casino, äh, ich meine an der Börse!"
    ]
  },
  "leadership-strategy": {
    en: [
      "That's MBA-speak for 'we have no idea what we're doing'!",
      "Someone read too many business books this weekend.",
      "This is why consultants drive Porsches!",
      "The C-suite is about to get spicy!",
      "That's a bold strategy, Cotton. Let's see if it pays off!",
      "Someone's been watching too much Succession.",
      "The corporate world just got a reality check!"
    ],
    de: [
      "Das riecht nach teuren Beratern!",
      "Jemand hat wohl zu viele Management-Bücher gelesen.",
      "Die Chefetage wird das lieben... oder auch nicht.",
      "Das ist mal wieder typisch Corporate!",
      "Da hat jemand zu viel Harvard Business Review gelesen."
    ]
  },
  "science-innovation": {
    en: [
      "Science just said 'hold my beer' to fiction!",
      "The peer reviewers must have had a field day with this one!",
      "This is what happens when you give scientists too much coffee.",
      "Someone's Nobel Prize acceptance speech just got more interesting!",
      "The laws of physics are having an identity crisis right now.",
      "This discovery is chef's kiss level brilliant!",
      "Science nerds around the world are losing their minds!"
    ],
    de: [
      "Die Wissenschaft hat mal wieder alle überrascht!",
      "Das wird die Lehrbücher umschreiben!",
      "Irgendwo jubelt gerade ein Doktorand.",
      "Die Peer-Reviewer hatten sicher Spaß dabei!",
      "Wissenschaft ist einfach der Wahnsinn!"
    ]
  },
  "sunday-specials": {
    en: [
      "This is the content we didn't know we needed!",
      "Well, that's enough internet for today!",
      "This is why aliens won't talk to us.",
      "Someone had too much time on their hands!",
      "The internet remains undefeated in weirdness.",
      "This is peak human behavior right here!",
      "I'm not even mad, I'm impressed!"
    ],
    de: [
      "Das Internet ist wieder mal unbesiegbar!",
      "Genug Internet für heute!",
      "Menschen sind schon komisch.",
      "Das ist der Inhalt, den wir verdienen!",
      "Warum bin ich nicht überrascht?"
    ]
  }
};

// Generate spicy dialogue script with humor and hot takes
function generateEnhancedDialogueScript(articles, bunch, language) {
  const hosts = {
    en: { 
      main: "Alex Rivera", 
      expert: "Dr. Sarah Chen",
      style: "witty and energetic"
    },
    de: { 
      main: "Michael Brenner", 
      expert: "Dr. Lisa Schmidt",
      style: "scharfsinnig und dynamisch"
    }
  };
  
  const greetings = {
    en: {
      intros: [
        `Welcome back to ${bunch.replace('-', ' ').toUpperCase()} Daily, where we serve the news with a side of sass! I'm ${hosts.en.main}, your slightly caffeinated host.`,
        `Good morning, afternoon, or whatever time you're procrastinating! This is ${bunch.replace('-', ' ').toUpperCase()} Daily. I'm ${hosts.en.main}, and I've had way too much coffee.`,
        `Welcome to ${bunch.replace('-', ' ').toUpperCase()} Daily, the show that makes your commute slightly less boring. I'm ${hosts.en.main}, and I promise to make this worth your time.`
      ],
      transitions: [
        "Let's dive into today's circus, shall we?",
        "Buckle up, because today's news is wilder than my weekend.",
        "Get ready for some stories that'll make you question reality."
      ]
    },
    de: {
      intros: [
        `Willkommen zu ${bunch.replace('-', ' ').toUpperCase()} Daily, wo wir die Nachrichten mit einer Prise Wahnsinn servieren! Ich bin ${hosts.de.main}.`,
        `Guten Tag, oder wann auch immer Sie das hören! Hier ist ${bunch.replace('-', ' ').toUpperCase()} Daily. Ich bin ${hosts.de.main}, und ich hatte definitiv zu viel Kaffee.`
      ],
      transitions: [
        "Tauchen wir ein in das heutige Chaos!",
        "Schnallen Sie sich an, die heutigen News sind verrückter als mein Wochenende.",
        "Bereiten Sie sich auf Geschichten vor, die Sie sprachlos machen werden."
      ]
    }
  };
  
  const currentGreeting = greetings[language] || greetings.en;
  const currentHosts = hosts[language] || hosts.en;
  const hotTakes = HOT_TAKES[bunch][language] || HOT_TAKES[bunch].en;
  
  // Random intro selection
  const intro = currentGreeting.intros[Math.floor(Math.random() * currentGreeting.intros.length)];
  const transition = currentGreeting.transitions[Math.floor(Math.random() * currentGreeting.transitions.length)];
  
  let script = `${currentHosts.main}: ${intro} And joining me is the brilliant ${currentHosts.expert}, who's here to add some actual intelligence to my hot takes.\n\n`;
  
  script += `${currentHosts.expert}: Thanks ${currentHosts.main.split(' ')[0]}! Though I think your hot takes are getting spicier by the day.\n\n`;
  
  script += `${currentHosts.main}: Well, speaking of spicy... ${transition}\n\n`;
  
  articles.forEach((article, index) => {
    // Add variety to introductions
    const introductions = language === 'en' ? [
      `Alright ${currentHosts.expert.split(' ')[1]}, this one's a doozy:`,
      `Get this,`,
      `Hold onto your coffee,`,
      `You're going to love this:`,
      `Plot twist incoming:`
    ] : [
      `Also ${currentHosts.expert.split(' ')[1]}, das hier ist der Hammer:`,
      `Hör dir das an:`,
      `Halt dich fest:`,
      `Das wirst du lieben:`
    ];
    
    const randomIntro = introductions[Math.floor(Math.random() * introductions.length)];
    
    script += `${currentHosts.main}: ${randomIntro} "${article.title}". ${hotTakes[Math.floor(Math.random() * hotTakes.length)]}\n\n`;
    
    script += `${currentHosts.expert}: ${article.description} `;
    
    // Add analysis with personality
    if (language === 'en') {
      const analyses = [
        `What's fascinating here is the timing. This couldn't have come at a more interesting moment.`,
        `The implications are huge. We're talking about a complete paradigm shift in how we think about this.`,
        `This is exactly what industry insiders have been whispering about for months.`,
        `The real story here isn't what they're saying - it's what they're NOT saying.`,
        `This is going to ruffle some feathers in high places, mark my words.`
      ];
      
      script += analyses[Math.floor(Math.random() * analyses.length)] + `\n\n`;
      
      // Add banter
      const banters = [
        `${currentHosts.main}: Did you just use 'paradigm shift' unironically? That's peak expert behavior right there!\n\n${currentHosts.expert}: Hey, at least I didn't compare it to a Netflix show this time!`,
        `${currentHosts.main}: See, this is why you have the PhD and I have the jokes.\n\n${currentHosts.expert}: Your jokes need a PhD to understand them sometimes!`,
        `${currentHosts.main}: I love how you make even the wildest news sound reasonable.\n\n${currentHosts.expert}: And I love how you make reasonable news sound wild!`
      ];
      
      if (index < articles.length - 1) {
        script += banters[Math.floor(Math.random() * banters.length)] + `\n\n`;
      }
    } else {
      const analyses = [
        `Was hier wirklich fasziniert, ist das Timing. Das hätte nicht zu einem spannenderen Zeitpunkt kommen können.`,
        `Die Auswirkungen sind enorm. Wir sprechen hier von einem kompletten Umdenken.`,
        `Das ist genau das, worüber Insider seit Monaten munkeln.`,
        `Die wahre Geschichte ist nicht das, was sie sagen - sondern was sie NICHT sagen.`
      ];
      
      script += analyses[Math.floor(Math.random() * analyses.length)] + `\n\n`;
      
      if (index < articles.length - 1) {
        script += `${currentHosts.main}: Du klingst schon wieder wie ein Lehrbuch!\n\n`;
        script += `${currentHosts.expert}: Und du klingst wie ein aufgeregter Podcast-Host!\n\n`;
      }
    }
  });
  
  // Epic closing
  if (language === 'en') {
    script += `${currentHosts.main}: And that's your daily dose of ${bunch.replace('-', ' ')} madness! Any final wisdom bombs, ${currentHosts.expert.split(' ')[1]}?\n\n`;
    script += `${currentHosts.expert}: Just remember: in a world of hot takes and breaking news, sometimes the smartest move is to wait for the dust to settle. But where's the fun in that?\n\n`;
    script += `${currentHosts.main}: Spoken like a true expert who secretly loves the chaos! That's all for today, folks. Remember to stay curious, stay skeptical, and stay slightly caffeinated. This has been ${bunch.replace('-', ' ').toUpperCase()} Daily. We'll be back tomorrow with more news, more takes, and probably more coffee. Peace out!\n\n`;
  } else {
    script += `${currentHosts.main}: Und das war eure tägliche Dosis ${bunch.replace('-', ' ')} Wahnsinn! Noch ein letzter Weisheitsspruch, ${currentHosts.expert.split(' ')[1]}?\n\n`;
    script += `${currentHosts.expert}: Denkt daran: In einer Welt voller heißer Takes und Breaking News ist manchmal das Klügste, abzuwarten. Aber wo bleibt da der Spaß?\n\n`;
    script += `${currentHosts.main}: Gesprochen wie eine wahre Expertin, die heimlich das Chaos liebt! Das war's für heute. Bleibt neugierig, bleibt skeptisch und trinkt genug Kaffee. Das war ${bunch.replace('-', ' ').toUpperCase()} Daily. Bis morgen!\n\n`;
  }
  
  return script;
}

// Main function handler
export const handler = async (event, context) => {
  try {
    console.log('Starting enhanced podcast generation...');
    
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
    
    // Sort by score and take top 3-5 articles
    const sortedArticles = allArticles.sort((a, b) => b.score - a.score);
    const topArticles = sortedArticles.slice(0, Math.min(5, Math.max(3, sortedArticles.length)));
    
    if (topArticles.length === 0) {
      console.log(`No articles found for ${bunch}-${language}`);
      return {
        id: `${bunch}-${language}-${date}`,
        bunch,
        language,
        date,
        title: `${bunch.replace('-', ' ').toUpperCase()} Daily - ${date}`,
        description: 'No new articles available today.',
        script: 'No content available for today. Please try again later.',
        duration: '0:30',
        articles: [],
        engagementLevel: 'LOW'
      };
    }
    
    console.log(`Found ${topArticles.length} high-scoring articles for ${bunch}-${language}`);
    
    // Generate enhanced dialogue script
    const script = generateEnhancedDialogueScript(topArticles, bunch, language);
    
    // Calculate estimated duration (average speaking rate: 150 words/minute)
    const wordCount = script.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 150);
    const duration = `${estimatedMinutes}:00`;
    
    // Determine engagement level based on article scores
    const avgScore = topArticles.reduce((sum, a) => sum + a.score, 0) / topArticles.length;
    const engagementLevel = avgScore > 10 ? 'VERY HIGH' : avgScore > 7 ? 'HIGH' : avgScore > 4 ? 'MEDIUM' : 'LOW';
    
    // Create episode object
    const episode = {
      id: `${bunch}-${language}-${date}`,
      bunch,
      language,
      date,
      title: `${bunch.replace('-', ' ').toUpperCase()} Daily - ${new Date(date).toLocaleDateString()} 🔥`,
      description: `Today's hottest ${bunch.replace('-', ' ')} stories with spicy commentary: ${topArticles.slice(0, 3).map(a => a.title.split(' ').slice(0, 5).join(' ')).join(' | ')}...`,
      script,
      duration,
      articles: topArticles.map(a => ({
        title: a.title,
        description: a.description,
        link: a.link,
        source: a.source,
        score: a.score
      })),
      audioUrl: null, // Will be generated later with TTS
      rssUrl: `https://podcast.arnavray.ca/${bunch}/${language}/rss.xml`,
      engagementLevel,
      totalScore: topArticles.reduce((sum, a) => sum + a.score, 0)
    };
    
    console.log(`Generated episode: ${episode.title} (Engagement: ${engagementLevel})`);
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
      error: error.message,
      engagementLevel: 'ERROR'
    };
  }
}
