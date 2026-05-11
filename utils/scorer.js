const ContentAnalyzer = require("./analyzer");

class Scorer {
  static scoreContent(metadata, text) {
    const scores = {
      ageScore: this.calculateAgeScore(metadata.publicationDate),
      credibilityScore: this.calculateCredibilityScore(metadata),
      contentQualityScore: this.calculateContentQualityScore(metadata, text),
      sourceTrustScore: this.calculateSourceTrustScore(metadata),
    };

    // Weighted average
    const weights = {
      ageScore: 0.3,
      credibilityScore: 0.25,
      contentQualityScore: 0.25,
      sourceTrustScore: 0.2,
    };

    const finalScore = Math.round(
      scores.ageScore * weights.ageScore +
        scores.credibilityScore * weights.credibilityScore +
        scores.contentQualityScore * weights.contentQualityScore +
        scores.sourceTrustScore * weights.sourceTrustScore
    );

    return {
      score: Math.max(1, Math.min(100, finalScore)),
      breakdown: scores,
      reasoning: this.generateReasoning(scores, metadata),
      factors: this.identifyKeyFactors(metadata, scores),
    };
  }

  static calculateAgeScore(publicationDate) {
    if (!publicationDate) {
      return 40; // No date found = lower score
    }

    const now = new Date();
    const ageInDays = (now - new Date(publicationDate)) / (1000 * 60 * 60 * 24);

    // Scoring based on age
    // 0 days = 100, 30 days = 90, 90 days = 75, 1 year = 60, 2+ years = 40
    if (ageInDays <= 7) return 95;
    if (ageInDays <= 30) return 85;
    if (ageInDays <= 90) return 70;
    if (ageInDays <= 180) return 55;
    if (ageInDays <= 365) return 40;
    if (ageInDays <= 730) return 25;
    return 15; // Very old
  }

  static calculateCredibilityScore(metadata) {
    let score = 50;

    // SSL certificate (trustworthy domain)
    if (metadata.hasSSL) score += 15;

    // Domain analysis
    const trustedDomains = [
      "edu",
      "gov",
      "ac.uk",
      "org",
      "sci-hub",
      "researchgate",
      "medium.com",
      "wikipedia.org",
    ];
    const domain = metadata.domain || "";

    if (trustedDomains.some((d) => domain.includes(d))) score += 20;
    if (
      domain.includes("news") ||
      domain.includes("bbc") ||
      domain.includes("reuters") ||
      domain.includes("bbc")
    )
      score += 15;

    // Author presence
    if (metadata.hasAuthor) score += 10;

    // External links (indicates research/sources)
    if (metadata.externalLinks > 10) score += 15;
    else if (metadata.externalLinks > 5) score += 8;

    // Publishing platform reputation
    if (domain.includes("wikipedia")) score += 20;
    if (domain.includes("arxiv") || domain.includes("researchgate"))
      score += 18;

    return Math.min(100, score);
  }

  static calculateContentQualityScore(metadata, text) {
    let score = 50;

    // Word count indicates thoroughness
    const wordCount = metadata.wordCount || 0;
    if (wordCount > 3000) score += 25;
    else if (wordCount > 1500) score += 20;
    else if (wordCount > 500) score += 10;
    else if (wordCount < 100) score -= 15;

    // Sentence structure quality
    const sentenceCount = metadata.sentenceCount || 0;
    const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
    if (avgSentenceLength > 8 && avgSentenceLength < 20) score += 10;

    // Grammar and language quality
    const grammarScore = ContentAnalyzer.assessGrammarQuality(text);
    score += grammarScore * 0.15; // 15% weight to grammar

    // Title quality
    const titleLength = (metadata.title || "").length;
    if (titleLength > 20 && titleLength < 100) score += 8;

    return Math.min(100, score);
  }

  static calculateSourceTrustScore(metadata) {
    let score = 50;

    // References/citations
    if (metadata.cites > 20) score += 25;
    else if (metadata.cites > 5) score += 15;
    else if (metadata.cites > 0) score += 8;

    // Professional design indicators
    if (metadata.description && metadata.description.length > 50) score += 10;

    // Mobile-friendly indicator (good sites are responsive)
    score += 5; // Assume modern sites are mostly mobile-friendly

    // Consistency with guidelines (SSL, author, proper structure)
    if (metadata.hasSSL && metadata.hasAuthor) score += 15;

    // Update frequency signals
    if (metadata.updateFrequencyIndicators > 5) score += 10;

    return Math.min(100, score);
  }

  static identifyKeyFactors(metadata, scores) {
    const factors = [];

    // Age factors
    if (scores.ageScore < 40) {
      factors.push("⚠️ Content is quite old");
    } else if (scores.ageScore > 80) {
      factors.push("✅ Content is recent");
    }

    // Credibility factors
    if (metadata.hasSSL) factors.push("✅ Secure website (HTTPS)");
    if (metadata.hasAuthor) factors.push("✅ Author information provided");
    else factors.push("⚠️ No author information found");

    if (metadata.externalLinks > 10) {
      factors.push("✅ Multiple external references");
    }

    // Quality factors
    if (metadata.wordCount > 2000) {
      factors.push("✅ Comprehensive content");
    } else if (metadata.wordCount < 300) {
      factors.push("⚠️ Content is quite brief");
    }

    if (metadata.cites > 10) factors.push("✅ Multiple citations/references");

    // Domain factors
    if (metadata.domain?.includes("edu") || metadata.domain?.includes("gov")) {
      factors.push("✅ Educational/Government source");
    }

    if (metadata.domain?.includes("wikipedia")) {
      factors.push("✅ Community-verified source");
    }

    return factors;
  }

  static generateReasoning(scores, metadata) {
    const reasons = [];

    reasons.push(
      `Age Score: ${scores.ageScore}/100 - ${metadata.publicationDate ? `Last published ${this.getDaysDiff(metadata.publicationDate)} days ago` : "Publication date not found"}`
    );
    reasons.push(
      `Credibility Score: ${scores.credibilityScore}/100 - Source domain: ${metadata.domain} (${metadata.hasSSL ? "Secure" : "Not secure"})`
    );
    reasons.push(
      `Quality Score: ${scores.contentQualityScore}/100 - ${metadata.wordCount} words, ${metadata.sentenceCount} sentences`
    );
    reasons.push(
      `Trust Score: ${scores.sourceTrustScore}/100 - ${metadata.externalLinks} external links, ${metadata.cites || 0} citations`
    );

    return reasons.join(" | ");
  }

  static getDaysDiff(date) {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

module.exports = Scorer;
