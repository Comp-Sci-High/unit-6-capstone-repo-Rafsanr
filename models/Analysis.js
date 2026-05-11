const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: null,
    },
    contentType: {
      type: String,
      enum: ["url", "text"],
      required: true,
    },
    score: {
      type: Number,
      min: 1,
      max: 100,
      required: true,
    },
    breakdown: {
      ageScore: { type: Number, min: 1, max: 100 },
      credibilityScore: { type: Number, min: 1, max: 100 },
      contentQualityScore: { type: Number, min: 1, max: 100 },
      sourceTrustScore: { type: Number, min: 1, max: 100 },
    },
    metadata: {
      title: String,
      description: String,
      publicationDate: Date,
      lastModified: Date,
      domain: String,
      hasSSL: Boolean,
      wordCount: Number,
      sentenceCount: Number,
      externalLinks: Number,
      hasAuthor: Boolean,
      updateFrequencyIndicators: {
        type: Number,
        default: 0,
      },
    },
    factors: [String],
    reasoning: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
