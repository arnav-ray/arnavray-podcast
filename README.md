# 🎧 Daily AI Podcasts

An automated podcast generation system that creates daily podcasts in 5 categories with spicy commentary, hot takes, and insider insights in both English and German.

🌐 **Live Demo**: [https://podcast.arnavray.ca](https://podcast.arnavray.ca)

## ✨ Features

### 🎯 5 Premium Categories
1. **AI & Tech** - Cutting-edge technology, AI breakthroughs, startup drama
2. **Finance & Business** - Market moves, IPOs, mergers, financial scandals  
3. **Leadership & Strategy** - CEO insights, management trends, strategic thinking
4. **Science & Innovation** - Research breakthroughs, scientific discoveries
5. **Sunday Specials** - Lifestyle, humor, culture, weekend vibes

### 🌍 Multilingual Support
- **English (EN)** - British/American voices with personality
- **German (DE)** - Native German speakers with authentic pronunciation
- Content sourced from top publications in each language
- Separate hosts and experts for each language

### 🔥 Key Features
- **Dynamic Voice Modulation** - Different pitch/rate for host vs expert
- **Hot Takes & Humor** - Spicy commentary and witty banter
- **Article Scoring** - AI ranks articles by relevance and engagement
- **Dark Mode** - Toggle between light and dark themes
- **Episode Archive** - Store up to 30 episodes per category
- **Full Transcripts** - View complete dialogue transcripts
- **Source Links** - Click through to original articles

## 🚀 Technology Stack

- **Frontend**: Astro.js
- **Backend**: Netlify Functions (Serverless)
- **Hosting**: Netlify
- **Text-to-Speech**: Web Speech API
- **Storage**: LocalStorage for episode history
- **RSS Parsing**: Custom parser for news feeds

## 📰 Content Sources

### English Sources
- TechCrunch, The Verge, Wired, Ars Technica
- Bloomberg, Reuters, CNBC, Wall Street Journal
- Harvard Business Review, Fast Company, McKinsey
- Nature, Science Daily, New Scientist
- Vox, Lifehacker, Mental Floss

### German Sources  
- Heise, Golem, t3n, Computerwoche
- Handelsblatt, Manager Magazin, WirtschaftsWoche
- FAZ, Süddeutsche Zeitung, Der Spiegel, Die Zeit
- Spektrum, Max Planck Institute, Wissenschaft.de
- Stern, capital, Impulse

## 🎙️ Voice Configuration

### English Voices
- **Host**: Female voice (Alex Rivera) - Higher pitch, faster pace
- **Expert**: Male voice (Various experts) - Lower pitch, slower pace

### German Voices
- **Host**: Male voice (Markus Weber) - Natural German accent
- **Expert**: Female voice (Various experts) - Natural German accent

**Important**: For proper German voice support, ensure German language pack is installed in your operating system.

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Netlify CLI (optional)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/podcast-generator.git
cd podcast-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Deployment to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

Or use Netlify CLI:
```bash
netlify deploy --prod
```

## 📱 Usage

### Generating Episodes

1. Visit the website
2. Toggle language (EN/DE) using the slider
3. Click "Generate Today's Episode" in any category
4. Episode appears in the tile with:
   - Play/Stop controls
   - Full transcript
   - Article sources with scores

### Playback Controls

- **▶️ Play**: Starts dialogue with voice modulation
- **⏹️ Stop**: Stops current playback
- **📝 Transcript**: Toggle transcript visibility
- **🌙/☀️**: Toggle dark/light mode

### Episode Storage

- Episodes are stored locally in browser
- Up to 30 episodes per category
- Persists across sessions
- Clear browser data to reset

## 🔧 Configuration

### Adding New RSS Sources

Edit `netlify/functions/generate-podcast.js`:

```javascript
const RSS_SOURCES = {
  "category-name": {
    "en": [
      "https://example.com/rss",
      // Add more English sources
    ],
    "de": [
      "https://example.de/rss",
      // Add more German sources
    ]
  }
}
```

### Adjusting Voice Settings

Modify voice configurations in `src/pages/index.astro`:

```javascript
const VOICE_CONFIG = {
  de: {
    host: { 
      rate: 0.95,  // Speaking speed
      pitch: 1.1,  // Voice pitch
      gender: 'male',
      preferredVoices: ['Stefan', 'Hans']
    }
  }
}
```

### Customizing Hot Takes

Edit hot takes in `netlify/functions/generate-podcast.js`:

```javascript
const HOT_TAKES = {
  en: {
    "ai-tech": [
      "Your custom hot take here!"
    ]
  }
}
```

## 🐛 Troubleshooting

### German Voices Sound Wrong

**Problem**: German text spoken with English accent

**Solution**: 
1. Install German language pack in Windows/macOS
2. Check available voices in browser console
3. Ensure `de-DE` voices are available
4. Restart browser after installing language pack

### Dark Mode Not Working

**Problem**: Theme doesn't change

**Solution**:
1. Clear browser cache
2. Check localStorage for theme setting
3. Ensure JavaScript is enabled

### No Episodes Generating

**Problem**: Generation fails

**Solution**:
1. Check browser console for errors
2. Verify RSS feeds are accessible
3. Check Netlify function logs
4. Ensure network connectivity

## 🎯 Future Enhancements

- [ ] Real TTS API integration (ElevenLabs, Amazon Polly)
- [ ] Scheduled episode generation via cron
- [ ] RSS feed generation for podcast apps
- [ ] MP3 download functionality
- [ ] User accounts and preferences
- [ ] Integration with german.arnavray.ca
- [ ] More languages (Spanish, French, etc.)
- [ ] Custom categories per user
- [ ] Email newsletter integration
- [ ] Analytics and listening stats

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👤 Author

**Arnav Ray**
- Website: [arnavray.ca](https://arnavray.ca)
- German Learning: [german.arnavray.ca](https://german.arnavray.ca)
- Podcast: [podcast.arnavray.ca](https://podcast.arnavray.ca)

## 🙏 Acknowledgments

- RSS feed providers for content
- Web Speech API for TTS
- Netlify for hosting
- Astro.js for framework

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: arnav@arnavray.ca

---

Built with ❤️ for language learners and news enthusiasts
