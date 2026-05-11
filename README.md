# 📰 UpToDate - Information Freshness & Accuracy Scorer

A powerful backend service that analyzes and scores the freshness and accuracy of information found on the internet. Submit any URL or text and receive a detailed score from 1-100, where 1 indicates extremely outdated/inaccurate information and 100 indicates very accurate and up-to-date content.

## 🎯 Overview

UpToDate helps users quickly assess the reliability and freshness of online information by analyzing:

- **Publication Date** → How recent is the content?
- **Source Credibility** → From a trusted domain?
- **Content Quality** → Well-written and comprehensive?
- **External References** → Properly cited sources?
- **Author Information** → Clear attribution?
- **Website Security** → HTTPS/SSL protected?

## ✨ Features

✅ **Dual Input Modes**
- Analyze any website URL (http/https)
- Or paste text content directly

✅ **Comprehensive Scoring Algorithm**
- 4-factor weighted analysis
- Detailed breakdown of each component
- Transparent reasoning for every score

✅ **Rich Metadata Extraction**
- Automatic title, description extraction
- Publication/modification date detection
- Author information identification
- Citation and reference counting

✅ **Content Analysis**
- Grammar and language quality assessment
- Word count and readability analysis
- External link evaluation
- Citation pattern recognition

✅ **Automatic MLA Citation Generation** 🆕
- Formats analyzed sources in MLA style
- Extracts up to 20 referenced sources
- One-click copy to clipboard
- Smart detection of academic, news, and web sources

✅ **History & Storage**
- All analyses stored in MongoDB
- Quick access to past scores
- Comparison between similar content

✅ **User-Friendly Web Interface**
- Beautiful, responsive design
- Real-time analysis
- Visual score representation
- Key factors highlighting
- Citation display and management

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14 or higher
- **MongoDB** (free tier available at MongoDB Atlas)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd unit-6-capstone-repo-Rafsanr

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The server runs on `http://localhost:3000`

### Test It Out

Visit the web interface:
```
http://localhost:3000
```

Or test via curl:
```bash
curl -X POST http://localhost:3000/api/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.bbc.com/news"}'
```

## 📊 Scoring Breakdown

### 4-Factor Weighted Scoring

| Factor | Weight | How It's Scored |
|--------|--------|-----------------|
| **Age Score** | 30% | Recent (0-7 days: 95) → Very Old (2+ years: 15) |
| **Credibility Score** | 25% | Domain (.edu/.gov: +20), SSL: +15, Author: +10, Links: +15 |
| **Content Quality Score** | 25% | Word count (3000+: +25), Grammar quality (+15%), Structure |
| **Source Trust Score** | 20% | Citations (20+: +25), Professional standards, Mobile-friendly (+5) |

### Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| **75-100** | ✅ Excellent | Trustworthy, recent, well-researched content |
| **50-74** | 🟡 Good | Generally reliable, but may be outdated or lack citations |
| **25-49** | ⚠️ Fair | Contains some outdated info, limited sources |
| **1-24** | ❌ Poor | Likely outdated, unreliable, or inaccurate |

## 🔌 API Reference

### Analyze URL
**POST** `/api/analyze-url`
```json
{
  "url": "https://example.com/article"
}
```

### Analyze Text
**POST** `/api/analyze-text`
```json
{
  "text": "Your text content here..."
}
```

### Get History
**GET** `/api/history`

### Get Analysis by ID
**GET** `/api/analysis/:id`

### Delete Analysis
**DELETE** `/api/analysis/:id`

See [README_API.md](./README_API.md) for complete API documentation.

## 📁 Project Structure

```
UpToDate/
├── index.js                    # Main server entry point
├── package.json                # Dependencies
├── models/
│   └── Analysis.js             # MongoDB schema
├── routes/
│   └── api.js                  # API endpoints
├── utils/
│   ├── contentFetcher.js       # Fetch & parse web pages
│   ├── analyzer.js             # Extract metrics & statistics
│   └── scorer.js               # Scoring algorithm
├── views/
│   └── index.ejs               # Web interface
├── public/                     # Static assets
├── README.md                   # This file
├── README_API.md               # Detailed API documentation
└── EXAMPLES.md                 # Usage examples & examples
```

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Web Scraping**: Axios + Cheerio
- **Frontend**: EJS templates + Vanilla JavaScript
- **NLP**: Natural language processing for content analysis

## 📚 Documentation

- **[README_API.md](./README_API.md)** - Complete API reference and schema details
- **[EXAMPLES.md](./EXAMPLES.md)** - Usage examples, curl commands, troubleshooting
- **[MLA_CITATIONS_GUIDE.md](./MLA_CITATIONS_GUIDE.md)** - MLA citation feature documentation
- **[.env.example](./.env.example)** - Environment variable template

## 🎨 Web Interface

The frontend provides three main tabs:

1. **URL Analysis** - Paste any link and get scoring details
2. **Text Analysis** - Analyze plain text or pasted content
3. **History** - View all previous analyses with timestamps

### Features
- Visual score representation with color coding
- Detailed breakdown charts
- Key factors with positive/warning indicators
- **MLA Citation display** with copy-to-clipboard functionality
- Referenced sources list with automatic citations
- Responsive mobile-friendly design

## 💡 Scoring Logic

### Age Score Calculation
```
0-7 days old      → 95/100
7-30 days old     → 85/100
30-90 days old    → 70/100
90-180 days old   → 55/100
180-365 days old  → 40/100
1-2 years old     → 25/100
2+ years old      → 15/100
No date found     → 40/100
```

### Credibility Boost Examples
- `.edu` or `.gov` domain: +20 points
- News outlets (BBC, Reuters): +15 points
- Academic platforms (ArXiv, ResearchGate): +18 points
- Has author information: +10 points
- 10+ external links: +15 points
- HTTPS/SSL secure: +15 points

### Content Quality Factors
- Word count (3000+: excellent, <100: poor)
- Grammar and writing quality
- Title descriptiveness
- Sentence structure variety

## 🔧 Configuration

### Customize Scoring Weights
Edit `/utils/scorer.js`:
```javascript
const weights = {
  ageScore: 0.30,
  credibilityScore: 0.25,
  contentQualityScore: 0.25,
  sourceTrustScore: 0.20
};
```

### Add Trusted Domains
Edit `/utils/scorer.js` → `calculateCredibilityScore()`:
```javascript
const trustedDomains = [
  "edu", "gov", "org", "yoursite.com"
];
```

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Verify connection string in `index.js`
- Check MongoDB Atlas IP whitelist
- Ensure database credentials are correct

**Failed to Fetch URL**
- URL might require authentication
- Website may block scrapers
- Check 10-second timeout

**Invalid URL Format**
- Must start with `http://` or `https://`

See [EXAMPLES.md](./EXAMPLES.md#troubleshooting) for more help.

## 🔐 Security Notes

- MongoDB credentials should be in `.env` for production
- Consider adding rate limiting
- Implement authentication for production use
- Validate and sanitize all inputs
- Use environment variables for sensitive data

## 📈 Future Enhancements

- [ ] Machine learning-based scoring
- [ ] Multi-language support
- [ ] Real-time fact-checking API integration
- [ ] Misinformation detection
- [ ] Trending topic analysis
- [ ] Advanced analytics dashboard
- [ ] Comparison reports
- [ ] API authentication & rate limiting
- [ ] Scheduled content re-analysis
- [ ] Export functionality (PDF, CSV)

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Scoring algorithm refinement
- Additional metadata extraction
- Multi-language support
- Performance optimization
- UI/UX enhancements

## 📝 License

This project is part of the Unit 6 Capstone. 

## 👨‍💻 Author

Built as a capstone project for efficient information verification.

---

**Built with ❤️ to help you stay informed with UpToDate! 📰**
