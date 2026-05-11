class MLACitationFormatter {
  /**
   * Formats a website/article source in MLA style
   * MLA Format: Author(s). "Title of Webpage." Title of Website, Publisher, Date of Publication, URL. Accessed Date.
   */
  static formatWebSource(metadata) {
    const author = this.extractAuthor(metadata);
    const title = metadata.title || "Untitled Page";
    const website = this.extractWebsiteName(metadata.domain);
    const publisher = this.extractPublisher(metadata.domain);
    const date = this.formatDate(metadata.publicationDate);
    const url = metadata.url || "";
    const accessedDate = this.formatDate(new Date());

    let citation = "";

    if (author) {
      citation = `${author}. `;
    }

    citation += `"${title}." `;

    if (website) {
      citation += `${website}, `;
    }

    if (publisher) {
      citation += `${publisher}, `;
    }

    if (date) {
      citation += `${date}, `;
    }

    citation += `${url}. Accessed ${accessedDate}.`;

    return citation;
  }

  /**
   * Formats an article in MLA style
   * MLA Format: Author(s). "Title of Article." Title of Journal/Magazine, Volume, Issue, Year, Page Numbers, DOI/URL.
   */
  static formatArticle(metadata) {
    const author = this.extractAuthor(metadata);
    const title = metadata.title || "Untitled Article";
    const publication = this.extractPublisher(metadata.domain);
    const date = this.formatDate(metadata.publicationDate);
    const url = metadata.url || "";

    let citation = "";

    if (author) {
      citation = `${author}. `;
    }

    citation += `"${title}." `;

    if (publication) {
      citation += `${publication}, `;
    }

    if (date) {
      citation += `${date}, `;
    }

    citation += url;

    return citation;
  }

  /**
   * Formats an academic/research source in MLA style
   * MLA Format: Author(s). "Title of Paper." Title of Conference/Journal, Year, Page Numbers, DOI/URL.
   */
  static formatAcademicSource(metadata) {
    const author = this.extractAuthor(metadata);
    const title = metadata.title || "Untitled Paper";
    const date = this.formatYear(metadata.publicationDate);
    const url = metadata.url || "";

    let citation = "";

    if (author) {
      citation = `${author}. `;
    }

    citation += `"${title}." `;

    if (date) {
      citation += `${date}, `;
    }

    citation += url;

    return citation;
  }

  /**
   * Extracts author name from metadata
   */
  static extractAuthor(metadata) {
    // Try various author indicators
    if (metadata.author) {
      return metadata.author;
    }

    if (metadata.authorName) {
      return metadata.authorName;
    }

    // Try to extract from byline or author field
    if (metadata.byline) {
      return metadata.byline;
    }

    // If no specific author, use company/organization
    if (metadata.organization) {
      return metadata.organization;
    }

    // Use domain name as last resort
    if (metadata.domain) {
      const parts = metadata.domain.split(".");
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    return null;
  }

  /**
   * Extracts website/publication name from domain
   */
  static extractWebsiteName(domain) {
    if (!domain) return "";

    const siteNames = {
      "bbc.com": "BBC News",
      "bbc.co.uk": "BBC News",
      "reuters.com": "Reuters",
      "apnews.com": "Associated Press News",
      "theguardian.com": "The Guardian",
      "nytimes.com": "The New York Times",
      "washingtonpost.com": "The Washington Post",
      "cnn.com": "CNN",
      "foxnews.com": "Fox News",
      "wikipedia.org": "Wikipedia",
      "github.com": "GitHub",
      "medium.com": "Medium",
      "arxiv.org": "arXiv",
      "researchgate.net": "ResearchGate",
      "scholar.google.com": "Google Scholar",
      "jstor.org": "JSTOR",
      "sciencedirect.com": "ScienceDirect",
      "nature.com": "Nature",
      "science.org": "Science",
    };

    // Check if domain matches known sites
    for (const [key, value] of Object.entries(siteNames)) {
      if (domain.includes(key)) {
        return value;
      }
    }

    // Extract from domain name
    const parts = domain.split(".");
    if (parts[0] === "www") {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }

    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }

  /**
   * Extracts publisher name
   */
  static extractPublisher(domain) {
    if (!domain) return "";

    const publishers = {
      "bbc.com": "BBC",
      "bbc.co.uk": "BBC",
      "reuters.com": "Thomson Reuters",
      "apnews.com": "AP",
      "theguardian.com": "Guardian Media Group",
      "nytimes.com": "The Times Company",
      "washingtonpost.com": "Bezos Expeditions",
      "cnn.com": "Warner Bros. Discovery",
      "foxnews.com": "Fox Corporation",
      "wikipedia.org": "Wikimedia Foundation",
      "medium.com": "A Medium Corporation",
      "arxiv.org": "Cornell University",
      "researchgate.net": "ResearchGate GmbH",
      "jstor.org": "JSTOR",
      "nature.com": "Springer Nature",
      "science.org": "American Association for the Advancement of Science",
    };

    for (const [key, value] of Object.entries(publishers)) {
      if (domain.includes(key)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Formats date as "Day Month Year" for MLA
   */
  static formatDate(date) {
    if (!date) return null;

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (error) {
      return null;
    }
  }

  /**
   * Formats date as just year for MLA
   */
  static formatYear(date) {
    if (!date) return null;

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.getFullYear().toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Determines the best MLA format based on content type
   */
  static determineCitationType(metadata, domain) {
    if (!domain) {
      return "web";
    }

    // Academic sources
    if (
      domain.includes("arxiv") ||
      domain.includes("researchgate") ||
      domain.includes("scholar.google") ||
      domain.includes("jstor") ||
      domain.includes("sciencedirect") ||
      domain.includes("nature.com") ||
      domain.includes("science.org")
    ) {
      return "academic";
    }

    // News sites
    if (
      domain.includes("news") ||
      domain.includes("bbc") ||
      domain.includes("reuters") ||
      domain.includes("apnews") ||
      domain.includes("cnn") ||
      domain.includes("fox") ||
      domain.includes("guardian") ||
      domain.includes("nytimes") ||
      domain.includes("washingtonpost")
    ) {
      return "article";
    }

    // Default to web
    return "web";
  }

  /**
   * Generates MLA citation based on content type
   */
  static generateCitation(metadata) {
    const domain = metadata.domain || "";
    const type = this.determineCitationType(metadata, domain);

    switch (type) {
      case "academic":
        return this.formatAcademicSource(metadata);
      case "article":
        return this.formatArticle(metadata);
      case "web":
      default:
        return this.formatWebSource(metadata);
    }
  }

  /**
   * Generates a works cited section for multiple sources
   */
  static generateWorksCited(citations) {
    if (!citations || citations.length === 0) {
      return "";
    }

    // Sort alphabetically by first author's last name
    const sorted = citations.sort((a, b) => {
      const aFirstChar = (a.metadata || a).charAt(0).toLowerCase();
      const bFirstChar = (b.metadata || b).charAt(0).toLowerCase();
      return aFirstChar.localeCompare(bFirstChar);
    });

    let worksCited = "Works Cited\n";
    worksCited += "============\n\n";

    sorted.forEach((citation, index) => {
      const text =
        typeof citation === "string" ? citation : citation.metadata;
      // MLA format uses hanging indentation
      const lines = text.split("\n");
      const firstLine = lines[0];
      const remainingLines = lines.slice(1).map((line) => "    " + line);

      worksCited += firstLine + "\n";
      if (remainingLines.length > 0) {
        worksCited += remainingLines.join("\n") + "\n";
      }

      if (index < sorted.length - 1) {
        worksCited += "\n";
      }
    });

    return worksCited;
  }

  /**
   * Extracts links from HTML and formats them
   */
  static extractAndFormatLinks($) {
    const links = [];
    const seenUrls = new Set();

    $("a[href]").each((i, element) => {
      try {
        const href = $(element).attr("href");
        const text = $(element).text().trim();

        // Skip if we've seen this URL
        if (seenUrls.has(href)) return;
        seenUrls.add(href);

        // Skip short links and fragments
        if (!href || href.length < 4 || href.startsWith("#")) return;

        // Convert relative URLs to absolute (if domain is available)
        let absoluteUrl = href;
        if (href.startsWith("/")) {
          // Would need domain info to make absolute
          return;
        }

        links.push({
          url: absoluteUrl,
          text: text.substring(0, 100),
          title: $(element).attr("title") || text,
        });
      } catch (error) {
        // Skip invalid links
      }
    });

    return links;
  }
}

module.exports = MLACitationFormatter;
