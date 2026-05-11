const ContentFetcher = require("./contentFetcher");

class ContentAnalyzer {
  static async analyzeURL(url) {
    try {
      const { html, $ } = await ContentFetcher.fetchURL(url);

      const text = ContentFetcher.extractText($);
      const metadata = ContentFetcher.extractMetadata(url, $);

      const stats = {
        wordCount: this.countWords(text),
        sentenceCount: this.countSentences(text),
        externalLinks: ContentFetcher.countExternalLinks($),
        hasReferences: this.hasReferences($),
        cites: this.extractCitationCount($),
      };

      return {
        text,
        metadata: { ...metadata, ...stats },
        dom: $,
      };
    } catch (error) {
      throw error;
    }
  }

  static analyzeText(text) {
    return {
      wordCount: this.countWords(text),
      sentenceCount: this.countSentences(text),
      grammarScore: this.assessGrammarQuality(text),
      contentLength: text.length,
    };
  }

  static countWords(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  static countSentences(text) {
    if (!text) return 0;
    const sentences = text.match(/[.!?]+/g);
    return sentences ? sentences.length : 0;
  }

  static assessGrammarQuality(text) {
    if (!text) return 50;

    let score = 80;
    const issues = 0;

    // Check for common grammar patterns (basic assessment)
    const tooManyCapitals = (text.match(/[A-Z]/g) || []).length / text.length;
    if (tooManyCapitals > 0.5) score -= 10;

    // Check for excessive punctuation
    if ((text.match(/[!?]{2,}/g) || []).length > 5) score -= 10;

    // Check sentence length variety (good writing has varied lengths)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = this.calculateVariance(lengths);

    if (avgLength > 30 || avgLength < 5) score -= 5;
    if (variance < 2) score -= 5;

    return Math.max(1, Math.min(100, score));
  }

  static calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance =
      numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  static hasReferences($) {
    const hasFootnotes = $("[id*='footnote']").length > 0;
    const hasBibliography =
      $("*:contains('References')").length > 0 ||
      $("*:contains('Bibliography')").length > 0;
    const hasCitations = $("cite").length > 0;

    return hasFootnotes || hasBibliography || hasCitations;
  }

  static extractCitationCount($) {
    return (
      ($("cite").length || 0) +
      ($("[id*='ref']").length || 0) +
      ($("sup").length || 0)
    );
  }

  static hasAuthorInfo($) {
    return (
      $("[rel='author']").length > 0 ||
      $(".author").length > 0 ||
      $("[itemprop='author']").length > 0 ||
      $("meta[name='author']").length > 0
    );
  }
}

module.exports = ContentAnalyzer;
