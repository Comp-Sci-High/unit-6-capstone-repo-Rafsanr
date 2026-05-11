# UpToDate - Information Freshness & Accuracy Scorer

A backend service that analyzes the freshness and accuracy of information found on the internet. It accepts URLs or text input and returns a score from 1-100, where 1 indicates extremely outdated/inaccurate information and 100 indicates very accurate and up-to-date content.

## Project Structure

```
├── index.js                    # Main server entry point
├── package.json                # Dependencies
├── models/
│   └── Analysis.js             # MongoDB schema for storing analyses
├── routes/
│   └── api.js                  # API endpoints
├── utils/
│   ├── contentFetcher.js       # Fetches and parses web content
│   ├── analyzer.js             # Analyzes content for key metrics
│   └── scorer.js               # Scoring algorithm
├── views/
│   └── index.ejs               # Frontend interface
└── public/                     # Static assets
```

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Ensure MongoDB is connected (update connection string in `index.js` if needed)

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### 1. Analyze URL
**POST** `/api/analyze-url`

Analyzes content from a URL and returns a freshness/accuracy score.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "_id": "...",
  "url": "https://example.com/article",
  "score": 78,
  "breakdown": {
    "ageScore": 85,
    "credibilityScore": 75,
    "contentQualityScore": 80,
    "sourceTrustScore": 70
  },
  "metadata": {
    "title": "Article Title",
    "description": "...",
    "publicationDate": "2024-05-01T00:00:00.000Z",
    "domain": "example.com",
    "hasSSL": true,
    "wordCount": 1500,
    "sentenceCount": 45,
    "externalLinks": 12,
    "hasAuthor": true
  },
  "factors": [
    "✅ Content is recent",
    "✅ Secure website (HTTPS)",
    "✅ Multiple external references",
    "✅ Comprehensive content"
  ],
  "reasoning": "Age Score: 85/100 | Credibility Score: 75/100 | Quality Score: 80/100 | Trust Score: 70/100"
}
```

### 2. Analyze Text
**POST** `/api/analyze-text`

Analyzes plain text content and returns a score.

**Request:**
```json
{
  "text": "Your text content here..."
}
```

**Response:** Same format as analyze-url

### 3. Get Analysis History
**GET** `/api/history`

Retrieves the last 50 analyses performed.

**Response:**
```json
[
  {
    "_id": "...",
    "url": "...",
    "score": 78,
    "createdAt": "2024-05-11T10:00:00.000Z"
  },
  ...
]
```

### 4. Get Specific Analysis
**GET** `/api/analysis/:id`

Retrieves a specific analysis by ID.

**Response:** Full analysis object

### 5. Score Details (Without Saving)
**POST** `/api/score-details`

Generates scoring details without saving to database.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```
OR
```json
{
  "text": "Your text content..."
}
```

**Response:** Score breakdown with details

### 6. Delete Analysis
**DELETE** `/api/analysis/:id`

Deletes a specific analysis record.

## Scoring Methodology

The final score is a weighted average of four key metrics:

### 1. **Age Score** (30% weight)
- Measures how recent the content is
- Recent content (0-7 days): 95/100
- Fresh content (7-30 days): 85/100
- Current content (30-90 days): 70/100
- Aging content (90-180 days): 55/100
- Old content (180-365 days): 40/100
- Very old content (2+ years): 15-25/100

### 2. **Credibility Score** (25% weight)
- **Domain Security**: SSL/HTTPS provides +15 points
- **Trusted Domains**: .edu, .gov, .org, .ac.uk: +20 points
- **News Sources**: Recognized news outlets: +15 points
- **Author Information**: Author presence: +10 points
- **External Links**: 10+ external references: +15 points
- **Platform Reputation**: Wikipedia, ResearchGate, ArXiv: +18-20 points

### 3. **Content Quality Score** (25% weight)
- **Comprehensiveness**: Word count (more = better quality)
  - 3000+ words: +25 points
  - 1500-3000 words: +20 points
  - 500-1500 words: +10 points
  - <100 words: -15 points
- **Grammar & Language**: Quality of writing
- **Title Quality**: Well-crafted, descriptive titles: +8 points

### 4. **Source Trust Score** (20% weight)
- **Citations**: Referenced sources and citations
  - 20+ citations: +25 points
  - 5-20 citations: +15 points
  - 1-5 citations: +8 points
- **Professional Standards**: SSL, author info: +15 points
- **Mobile-Friendly**: Modern, responsive design: +5 points

## Key Features

✅ **Multi-Source Analysis**: Accept URLs or text input
✅ **Comprehensive Scoring**: 4-factor weighted scoring algorithm
✅ **Metadata Extraction**: Automatically parse titles, dates, authors
✅ **Content Analysis**: Grammar, structure, and language quality assessment
✅ **Citation Tracking**: Count and evaluate references
✅ **Database Storage**: Store all analyses for history and comparison
✅ **Detailed Breakdown**: Provides reasoning for every score
✅ **Key Factors**: Human-readable insights on what affected the score

## Database Schema

The `Analysis` model stores:
- URL or text content
- Final score (1-100)
- Breakdown scores (age, credibility, quality, trust)
- Metadata (title, author, publication date, etc.)
- Key factors and reasoning
- Timestamps

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Page Analysis**: Cheerio (HTML parsing), Axios (HTTP requests)
- **Frontend**: EJS templates with vanilla JavaScript

## Error Handling

The API provides clear error messages:
- Invalid URL format
- Network errors when fetching URLs
- Missing required fields
- Database errors

## Future Enhancements

- [ ] Machine learning-based content scoring
- [ ] Multi-language support
- [ ] Fact-checking integration (with external APIs)
- [ ] Misinformation detection
- [ ] Trending topic analysis
- [ ] Source verification with databases
- [ ] Real-time web monitoring
- [ ] API rate limiting and authentication
- [ ] Advanced analytics dashboard
- [ ] Comparison with similar content profiles

## Testing

To test an endpoint manually using curl:

```bash
# Test analyze-url
curl -X POST http://localhost:3000/api/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.bbc.com/news"}'

# Test analyze-text
curl -X POST http://localhost:3000/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text":"The earth is flat according to recent studies..."}'

# Get history
curl http://localhost:3000/api/history
```

## Notes

- MongoDB connection string is currently hardcoded; consider using environment variables
- Content fetching timeout is set to 10 seconds
- Text content is limited to 10,000 characters when stored
- The scoring algorithm is rule-based; ML integration could improve accuracy
