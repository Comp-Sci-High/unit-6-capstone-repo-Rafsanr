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
}

module.exports = ContentFetcher;
