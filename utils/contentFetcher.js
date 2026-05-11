const axios = require("axios");
const cheerio = require("cheerio");

class ContentFetcher {
  static async fetchURL(url) {
    try {
      // Validate URL format
      if (!this.isValidURL(url)) {
        throw new Error("Invalid URL format");
      }

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      return {
        html,
        $,
        statusCode: response.status,
        headers: response.headers,
      };
    } catch (error) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }

  static extractMetadata(url, $) {
    const metadata = {
      title:
        $("meta[property='og:title']").attr("content") ||
        $("title").text() ||
        "No title",
      description:
        $("meta[property='og:description']").attr("content") ||
        $("meta[name='description']").attr("content") ||
        "No description",
      publicationDate: this.extractDate(
        $("meta[property='article:published_time']").attr("content") ||
          $("meta[name='publish_date']").attr("content") ||
          $("time").attr("datetime")
      ),
      lastModified: this.extractDate(
        $("meta[property='article:modified_time']").attr("content") ||
          $("meta[name='last-modified']").attr("content")
      ),
      domain: new URL(url).hostname,
      hasSSL: url.startsWith("https"),
      hasAuthor: !!($("[rel='author']").length > 0),
    };

    return metadata;
  }

  static extractText($) {
    // Remove script and style tags
    $("script, style").remove();

    // Get text content
    const text = $("body").text().trim();

    return text;
  }

  static extractDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static countExternalLinks($) {
    const links = $("a[href]");
    let externalCount = 0;

    links.each((i, element) => {
      const href = $(element).attr("href");
      if (href && (href.startsWith("http") || href.startsWith("//"))) {
        externalCount++;
      }
    });

    return externalCount;
  }

  /**
   * Extracts external sources/citations from the page
   */
  static extractExternalSources($, pageUrl) {
    const sources = [];
    const seenUrls = new Set();

    // Find all external links
    $("a[href]").each((i, element) => {
      try {
        let href = $(element).attr("href");
        const text = $(element).text().trim();

        // Skip fragments and empty links
        if (!href || href.startsWith("#") || !text || seenUrls.has(href)) {
          return;
        }

        // Convert relative URLs to absolute
        if (href.startsWith("/")) {
          const baseUrl = new URL(pageUrl);
          href = baseUrl.protocol + "//" + baseUrl.host + href;
        }

        // Only include external links
        if (href.startsWith("http")) {
          seenUrls.add(href);
          sources.push({
            url: href,
            title: text.substring(0, 200),
            domain: new URL(href).hostname,
          });
        }
      } catch (error) {
        // Skip invalid URLs
      }
    });

    // Also extract from citations/references
    const refElements = $('[id*="ref"], [id*="citation"], .reference, .citation, .sources');
    refElements.each((i, element) => {
      const links = $(element).find("a[href]");
      links.each((j, link) => {
        try {
          let href = $(link).attr("href");
          const text = $(link).text().trim();

          if (href && text && !seenUrls.has(href)) {
            if (href.startsWith("/")) {
              const baseUrl = new URL(pageUrl);
              href = baseUrl.protocol + "//" + baseUrl.host + href;
            }

            seenUrls.add(href);
            sources.push({
              url: href,
              title: text.substring(0, 200),
              domain: new URL(href).hostname,
              isCitation: true,
            });
          }
        } catch (error) {
          // Skip invalid URLs
        }
      });
    });

    return sources.slice(0, 20); // Limit to 20 sources
  }
}

module.exports = ContentFetcher;
