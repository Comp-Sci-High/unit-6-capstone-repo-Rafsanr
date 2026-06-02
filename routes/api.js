const express = require("express");
const router = express.Router();
const Analysis = require("../models/Analysis");
const ContentAnalyzer = require("../utils/analyzer");
const Scorer = require("../utils/scorer");
const ContentFetcher = require("../utils/contentFetcher");
const MLACitationFormatter = require("../utils/mlaCitations");

// Analyze a URL
router.post("/analyze-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!ContentFetcher.isValidURL(url)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check if analysis already exists
    const existingAnalysis = await Analysis.findOne({ url });
    if (existingAnalysis) {
      return res.status(200).json(existingAnalysis);
    }

    // Fetch and analyze the URL
    const { text, metadata, citations } = await ContentAnalyzer.analyzeURL(url);

    // Generate citation for the page itself
    const pageCitation = ContentAnalyzer.generateSelfCitation(metadata, url);

    // Score the content
    const { score, breakdown, reasoning, factors } = Scorer.scoreContent(
      metadata,
      text
    );

    // Save to database
    const analysis = new Analysis({
      url,
      content: text.substring(0, 10000), // Limit stored text to 10k chars
      contentType: "url",
      score,
      breakdown,
      metadata,
      factors,
      reasoning,
      citations: citations.map((c) => ({
        url: c.url,
        title: c.title,
        citation: c.citation,
      })),
      pageCitation: pageCitation,
    });

    await analysis.save();

    res.status(201).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to analyze URL",
      details: error.message,
    });
  }
});

// Analyze plain text
router.post("/analyze-text", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text content is required" });
    }

    // Analyze text
    const metadata = ContentAnalyzer.analyzeText(text);
    metadata.domain = "text-input";
    metadata.hasSSL = false;
    metadata.hasAuthor = false;

    // Score the content
    const { score, breakdown, reasoning, factors } = Scorer.scoreContent(
      metadata,
      text
    );

    // For text input, create a generic citation format
    const textCitation =
      "Unknown Author. \"Submitted Text Content.\" Online Source, " +
      new Date().getFullYear() +
      ", Submitted for Analysis.";

    // Save to database
    const analysis = new Analysis({
      url: `text-${Date.now()}`,
      content: text.substring(0, 10000),
      contentType: "text",
      score,
      breakdown,
      metadata,
      factors,
      reasoning,
      pageCitation: textCitation,
      citations: [],
    });

    await analysis.save();

    res.status(201).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to analyze text",
      details: error.message,
    });
  }
});

// Get analysis history
router.get("/history", async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(analyses);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve history",
      details: error.message,
    });
  }
});

// Get specific analysis
router.get("/analysis/:id", async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve analysis",
      details: error.message,
    });
  }
});

// Advanced scoring details
router.post("/score-details", async (req, res) => {
  try {
    const { url, text } = req.body;

    let metadata, scoreContent, pageCitation, citations = [];

    if (url) {
      if (!ContentFetcher.isValidURL(url)) {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      const { text: fetchedText, metadata: fetchedMetadata, citations: fetchedCitations } =
        await ContentAnalyzer.analyzeURL(url);
      metadata = fetchedMetadata;
      scoreContent = fetchedText;
      pageCitation = ContentAnalyzer.generateSelfCitation(fetchedMetadata, url);
      citations = fetchedCitations || [];
    } else if (text) {
      metadata = ContentAnalyzer.analyzeText(text);
      scoreContent = text;
      pageCitation =
        "Unknown Author. \"Submitted Text Content.\" Online Source, " +
        new Date().getFullYear() +
        ", Submitted for Analysis.";
    } else {
      return res
        .status(400)
        .json({ error: "Either URL or text is required" });
    }

    const result = Scorer.scoreContent(metadata, scoreContent);

    res.json({
      score: result.score,
      breakdown: result.breakdown,
      factors: result.factors,
      reasoning: result.reasoning,
      metadata,
      pageCitation,
      citations: citations.map((c) => ({
        url: c.url,
        title: c.title,
        citation: c.citation,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate score details",
      details: error.message,
    });
  }
});

// Delete analysis
router.delete("/analysis/:id", async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json({ message: "Analysis deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete analysis",
      details: error.message,
    });
  }
});

// Update analysis (for admin panel)
router.put("/analysis/:id", async (req, res) => {
  try {
    const { contentType, url, content, score, breakdown, reasoning, pageCitation } = req.body;

    if (!contentType || !score) {
      return res.status(400).json({ error: "Content type and score are required" });
    }

    if (score < 1 || score > 100) {
      return res.status(400).json({ error: "Score must be between 1 and 100" });
    }

    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Update fields
    analysis.contentType = contentType;
    if (contentType === "url") {
      analysis.url = url || analysis.url;
    } else if (contentType === "text") {
      analysis.content = content || analysis.content;
    }

    analysis.score = score;
    if (breakdown) {
      analysis.breakdown = {
        ageScore: breakdown.ageScore || analysis.breakdown?.ageScore || 50,
        credibilityScore: breakdown.credibilityScore || analysis.breakdown?.credibilityScore || 50,
        contentQualityScore: breakdown.contentQualityScore || analysis.breakdown?.contentQualityScore || 50,
        sourceTrustScore: breakdown.sourceTrustScore || analysis.breakdown?.sourceTrustScore || 50,
      };
    }

    if (reasoning) analysis.reasoning = reasoning;
    if (pageCitation) analysis.pageCitation = pageCitation;

    await analysis.save();

    res.json({
      message: "Analysis updated successfully",
      analysis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to update analysis",
      details: error.message,
    });
  }
});

// Create analysis directly (for admin panel)
router.post("/analysis", async (req, res) => {
  try {
    const { contentType, url, content, score, breakdown, reasoning, pageCitation } = req.body;

    if (!contentType || !score) {
      return res.status(400).json({ error: "Content type and score are required" });
    }

    if (score < 1 || score > 100) {
      return res.status(400).json({ error: "Score must be between 1 and 100" });
    }

    if (contentType === "url" && !url) {
      return res.status(400).json({ error: "URL is required for URL type analysis" });
    }

    if (contentType === "text" && !content) {
      return res.status(400).json({ error: "Content is required for text type analysis" });
    }

    const analysis = new Analysis({
      url: contentType === "url" ? url : `text-${Date.now()}`,
      content: contentType === "text" ? content : null,
      contentType,
      score,
      breakdown: breakdown || {
        ageScore: 50,
        credibilityScore: 50,
        contentQualityScore: 50,
        sourceTrustScore: 50,
      },
      reasoning: reasoning || "Admin-created analysis",
      pageCitation: pageCitation || null,
      factors: [],
      metadata: {},
    });

    await analysis.save();

    res.status(201).json({
      message: "Analysis created successfully",
      analysis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create analysis",
      details: error.message,
    });
  }
});

module.exports = router;
