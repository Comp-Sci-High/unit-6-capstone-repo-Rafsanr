# UpToDate Backend - Quick Start & Examples

## Setup & Running

### Prerequisites
- Node.js 14+
- MongoDB Account (Atlas recommended)
- npm or yarn

### Quick Start

1. **Clone and Install**
```bash
npm install
```

2. **Update MongoDB Connection** (if using different credentials)
   - Edit the connection string in `index.js` → `startServer()` function
   - Or create a `.env` file with `MONGODB_URI`

3. **Start Server**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

4. **Test the API**
   - Open browser: `http://localhost:3000`
   - Or test via curl/Postman

---

## API Usage Examples

### Example 1: Analyze a News Article

```bash
curl -X POST http://localhost:3000/api/analyze-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.bbc.com/news/science_and_environment"
  }'
```

**Expected Response:**
```json
{
  "score": 82,
  "breakdown": {
    "ageScore": 90,
    "credibilityScore": 85,
    "contentQualityScore": 80,
    "sourceTrustScore": 75
  },
  "factors": [
    "✅ Content is recent",
    "✅ Secure website (HTTPS)",
    "✅ Educational/Government source",
    "✅ Multiple external references"
  ]
}
```

---

### Example 2: Analyze Text Content

```bash
curl -X POST http://localhost:3000/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Climate change is real and backed by 97% of scientific consensus. Multiple sources including NASA, NOAA, and the IPCC have documented rising global temperatures over the past century. Recent studies in 2024 show accelerating changes in polar ice regions."
  }'
```

**Expected Score:** 75-85 (Good - comprehensive, recent references)

---

### Example 3: Analyze Academic Paper

```bash
curl -X POST http://localhost:3000/api/analyze-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://arxiv.org/abs/2405.10571"
  }'
```

**Expected Response:**
- High credibility score (academic source)
- Good quality score (technical content)
- May have lower age score if older paper

---

### Example 4: Analyze Outdated Information

```bash
curl -X POST http://localhost:3000/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Windows 95 is the latest operating system, released in 1995. It features revolutionary graphical user interface..."
  }'
```

**Expected Score:** 20-35 (Poor - extremely outdated)

---

### Example 5: Get Analysis History

```bash
curl http://localhost:3000/api/history
```

**Response:** Array of recent analyses with scores

---

## Scoring Examples

### High Score (80+)
- Recent publication date (within 1-2 weeks)
- From .edu, .gov, or news domain
- Comprehensive content (2000+ words)
- Multiple citations and references
- Professional author information
- HTTPS/SSL secure

**Example:** Academic journal article, recent government report, established news outlet

### Medium Score (50-79)
- Moderately recent (1-6 months old)
- Mixed credibility sources
- Decent length and structure
- Some citations present
- May lack author details

**Example:** Blog post, wiki page, average news article

### Low Score (1-49)
- Very old content (1+ year)
- Unknown or untrusted source
- Poor grammar/structure
- Few or no citations
- Contradicts established facts
- May contain misinformation

**Example:** Abandoned blog, outdated wiki, social media posts

---

## Response Structure

All successful responses include:

```json
{
  "_id": "MongoDB ID",
  "url": "https://example.com",
  "score": 75,
  "breakdown": {
    "ageScore": 80,
    "credibilityScore": 70,
    "contentQualityScore": 75,
    "sourceTrustScore": 70
  },
  "metadata": {
    "title": "Article Title",
    "description": "...",
    "publicationDate": "2024-05-01T...",
    "domain": "example.com",
    "hasSSL": true,
    "wordCount": 1500,
    "sentenceCount": 45,
    "externalLinks": 12,
    "hasAuthor": true
  },
  "factors": [
    "✅ Content is recent",
    "✅ Secure website (HTTPS)"
  ],
  "reasoning": "Age: 80/100 | Credibility: 70/100...",
  "createdAt": "2024-05-11T10:00:00.000Z"
}
```

---

## Frontend Usage

The web interface (`http://localhost:3000`) provides:

1. **URL Analysis Tab**
   - Paste any URL
   - See score, breakdown, and factors
   - Results saved to history

2. **Text Analysis Tab**
   - Paste any text content
   - Analyzed without external fetching
   - Good for evaluating specific claims

3. **History Tab**
   - View all previous analyses
   - Quick reference of past scores
   - Timestamps for tracking

---

## Advanced Configuration

### Modify Scoring Weights

Edit `utils/scorer.js` → `scoreContent()` function:

```javascript
const weights = {
  ageScore: 0.35,        // 35% weight
  credibilityScore: 0.25, // 25% weight
  contentQualityScore: 0.25,
  sourceTrustScore: 0.15
};
```

### Add Trusted Domains

Edit `utils/scorer.js` → `calculateCredibilityScore()`:

```javascript
const trustedDomains = [
  "edu", "gov", "org",
  "yoursite.com",  // Add custom domain
  "trustedpartner.org"
];
```

### Adjust Age Score Thresholds

Edit `utils/scorer.js` → `calculateAgeScore()`:

```javascript
if (ageInDays <= 14) return 100;  // Change from 7 to 14 days
if (ageInDays <= 60) return 80;   // Adjust as needed
```

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
- Check internet connection
- Verify MongoDB credentials in `index.js`
- Ensure IP whitelist in MongoDB Atlas

### Issue: "Failed to fetch URL"
- URL may be blocked or behind authentication
- Server timeout (10 seconds)
- Website may not allow web scraping

### Issue: "Invalid URL format"
- Ensure URL starts with `http://` or `https://`
- Check for typos

### Issue: "Analysis not found"
- Verify the analysis ID is correct
- Check that analysis hasn't been deleted

---

## Development Notes

- Add `console.log()` statements in `utils/` files to debug scoring
- Use MongoDB Compass to view the database
- Test with Postman or Insomnia for API testing
- Consider using nodemon for auto-restart during development

---

## Next Steps

- [ ] Add authentication (JWT)
- [ ] Rate limiting for production
- [ ] Add caching for frequently analyzed URLs
- [ ] Implement real-time fact-checking API integration
- [ ] Add ML-based content classification
- [ ] Setup CI/CD pipeline
- [ ] Add monitoring and logging
