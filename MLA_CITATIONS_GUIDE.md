# UpToDate - MLA Citation Feature Documentation

## Overview

The UpToDate backend now includes an **automatic MLA citation generator** that formats analyzed sources according to Modern Language Association (MLA) standards. This feature helps users properly cite the information they analyze.

## What is MLA Format?

MLA (Modern Language Association) is a standard citation format commonly used in humanities, languages, and social sciences. It provides a consistent way to cite sources.

### Basic MLA Format Components:
- **Author(s)**: Person or organization who created the content
- **Title**: Name of the webpage, article, or publication
- **Website/Publication**: Name of the larger work
- **Publisher**: Organization responsible for publishing
- **Publication Date**: When the content was published
- **URL**: Web address of the source
- **Access Date**: When you accessed the source

## Features

### 1. Automatic Page Citation
Every analyzed URL generates an MLA citation for the page itself:

```
BBC. "Climate Change Index." BBC News, 5 May 2024, https://www.bbc.com/climate-change-index. Accessed 11 May 2026.
```

### 2. Referenced Sources Citations
Up to 20 external sources cited on the page are automatically extracted and formatted:

```
Harvard University. "Climate News." Harvard University Official Site, 2024, https://news.harvard.edu. Accessed 11 May 2026.
```

### 3. Smart Source Type Detection
The citation formatter automatically detects and formats:
- **Academic sources** (ArXiv, ResearchGate, JSTOR)
- **News articles** (BBC, Reuters, CNN, AP News)
- **General web pages** (blogs, websites, wikis)
- **Educational content** (.edu domains)
- **Government resources** (.gov domains)

### 4. One-Click Copy Function
Users can copy any citation to clipboard with a single click.

## API Endpoints

### Analyze URL with Citations
**POST** `/api/analyze-url`

**Response includes:**
```json
{
  "score": 82,
  "pageCitation": "BBC. \"Title.\" BBC News, [date], [URL]. Accessed [date].",
  "citations": [
    {
      "url": "https://example.com/source",
      "title": "Source Title",
      "citation": "Author. \"Title.\" Publication, Date, URL. Accessed Date."
    },
    ...
  ]
}
```

### Score Details with Citations
**POST** `/api/score-details`

Returns full scoring breakdown including citations.

## Citation Types

### Type 1: Website Citation
```
Author/Organization. "Page Title." Website Name, Publisher, Publication Date, URL. Accessed Access Date.
```

**Example:**
```
BBC. "Global Climate Report." BBC News, 1 May 2024, https://www.bbc.com/climate. Accessed 11 May 2026.
```

### Type 2: News Article Citation
```
Author. "Article Title." Publication Name, Publication Date, URL.
```

**Example:**
```
Reuters Staff. "Climate Change Accelerates." Reuters, 10 May 2024, https://www.reuters.com/climate.
```

### Type 3: Academic Source Citation
```
Author(s). "Paper/Article Title." Date, URL.
```

**Example:**
```
Smith, J., et al. "Climate Modeling Approaches." 2024, https://arxiv.org/abs/2405.12345.
```

## Web Interface

### MLA Citation Display
When you analyze a URL or text, the results now show:

1. **Main Citation** - Citation for the page being analyzed
2. **Referenced Sources** - Up to 10 extracted sources with their MLA citations
3. **Copy Button** - Click to copy any citation to clipboard

### Citation Section Features:
- 🔗 Direct links to referenced sources
- 📊 Numbered sources for easy reference
- 📋 Copy-to-clipboard functionality
- 🎨 Professional formatting with serif font (Georgia)
- ✅ Full URL and access date information

## How It Works

### Step 1: URL Analysis
When you submit a URL, the analyzer:
1. Fetches the page content
2. Extracts metadata (title, author, publication date)
3. Identifies external links and citations
4. Generates MLA citations

### Step 2: Source Extraction
The system extracts:
- External hyperlinks with their anchor text
- Citation sections and references
- Author information
- Publication dates

### Step 3: Citation Generation
Each source is formatted as:
- Recognized publishers are properly credited
- Dates are formatted as "Day Month Year"
- URLs are included for web sources
- Access date is added automatically

## Examples

### Example 1: BBC News Article
**Input URL:** `https://www.bbc.com/news/science_and_environment`

**Generated Citation:**
```
BBC. "Science and Environment." BBC News, 11 May 2026, 
https://www.bbc.com/news/science_and_environment. 
Accessed 11 May 2026.
```

### Example 2: Academic Paper
**Input URL:** `https://arxiv.org/abs/2405.10571`

**Generated Citation:**
```
Cornell University. "Abstract 2405.10571." arXiv, 2024, 
https://arxiv.org/abs/2405.10571. 
Accessed 11 May 2026.
```

### Example 3: Wikipedia Article
**Input URL:** `https://en.wikipedia.org/wiki/Climate_Change`

**Generated Citation:**
```
Wikimedia Foundation. "Climate Change." Wikipedia, 
May 2026, https://en.wikipedia.org/wiki/Climate_Change. 
Accessed 11 May 2026.
```

## Supported Domains with Special Handling

The system recognizes and properly formats citations for:

| Domain | Format As |
|--------|-----------|
| bbc.com, bbc.co.uk | BBC News |
| reuters.com | Reuters |
| apnews.com | Associated Press News |
| theguardian.com | The Guardian |
| nytimes.com | The New York Times |
| washingtonpost.com | The Washington Post |
| wikipedia.org | Wikipedia |
| arxiv.org | arXiv |
| researchgate.net | ResearchGate |
| jstor.org | JSTOR |
| sciencedirect.com | ScienceDirect |
| nature.com | Nature |
| scholar.google.com | Google Scholar |

## Technical Implementation

### Files Involved:
1. **utils/mlaCitations.js** - MLA citation formatter class
2. **utils/analyzer.js** - Extracts sources and generates citations
3. **utils/contentFetcher.js** - Fetches external sources
4. **models/Analysis.js** - MongoDB schema for citations
5. **routes/api.js** - API endpoints returning citations
6. **views/index.ejs** - Web interface with citation display

### Citation Formatter Methods:

```javascript
// Generate citation based on type
MLACitationFormatter.generateCitation(metadata)

// Format specific types
MLACitationFormatter.formatWebSource(metadata)
MLACitationFormatter.formatArticle(metadata)
MLACitationFormatter.formatAcademicSource(metadata)

// Extract from web
MLACitationFormatter.extractAndFormatLinks($)
```

## Using Citations

### For Essays and Papers:
1. Analyze the source URL
2. Copy the exact MLA citation provided
3. Paste into your "Works Cited" page
4. Maintain alphabetical order by author's last name

### For Reference Tracking:
1. Copy citations to your citation manager (Zotero, Mendeley, etc.)
2. Use them consistently throughout your work
3. Keep access date recorded for accountability

### For Academic Integrity:
- Always include full citations
- Don't plagiarize content from analyzed sources
- Use citations to give proper credit
- Include page numbers if available

## Citation Format Guidelines

### MLA Works Cited Page Format:
```
Works Cited

Author Last Name, First Name. "Title of Webpage." 
  Website Name, Publisher, Date, URL. Accessed Date.

---

Hanging indentation:
- First line: at left margin
- Subsequent lines: indented 0.5 inches
```

### Multiple Authors:
```
Smith, John, and Jane Doe. "Title." Website, 2024, URL. Accessed Date.
```

### No Author:
```
"Article Title." Website Name, Date, URL. Accessed Date.
```

## Limitations & Notes

⚠️ **Important Limitations:**

1. **Author Detection**: If author info isn't available on the page, organization name is used
2. **Publication Date**: Some websites don't display publication dates clearly
3. **Source Extraction**: Limited to links present on the page
4. **Maximum Sources**: System extracts up to 20 sources per page
5. **Format Detection**: Best effort classification based on domain analysis

## Best Practices

✅ **Do:**
- Copy citations as-is for accuracy
- Verify author/publisher names are correct
- Keep access dates current
- Use consistent formatting

❌ **Don't:**
- Modify citation format manually
- Remove access dates
- Assume automatically detected authors are always correct
- Use citations as a replacement for reading sources

## Future Enhancements

- [ ] APA citation format support
- [ ] Chicago manual of style format
- [ ] Harvard referencing style
- [ ] Direct integration with citation managers (Zotero, Mendeley)
- [ ] Batch citation export
- [ ] Citation filtering/searching
- [ ] Multi-language support
- [ ] Citation verification

## Troubleshooting

**Problem: Citation shows "Unknown Author"**
- Solution: The page may not have author information. Add author manually if known.

**Problem: Missing publication date**
- Solution: Check page metadata. Some sites don't publish modification dates.

**Problem: URL not working in citation**
- Solution: Verify the URL is correct. Copy directly from analysis results.

**Problem: Too many sources extracted**
- Solution: System limits to 10 displayed sources. Full list available in API response.

## API Response Example

```json
{
  "pageCitation": "BBC. \"Climate Change Index.\" BBC News, 11 May 2026, https://www.bbc.com/news. Accessed 11 May 2026.",
  "citations": [
    {
      "url": "https://example.com/source1",
      "title": "Climate Science Facts",
      "citation": "Smith, J. \"Climate Science.\" Scientific Journal, 2024, https://example.com/source1. Accessed 11 May 2026."
    },
    {
      "url": "https://example.com/source2", 
      "title": "Global Temperature Trends",
      "citation": "National Weather Service. \"Temperature Data.\" NOAA, 2024, https://example.com/source2. Accessed 11 May 2026."
    }
  ]
}
```

---

**Built to help you cite accurately and ethically! 📚**
