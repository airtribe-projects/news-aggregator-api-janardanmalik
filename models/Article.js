const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  urlToImage: {
    type: String
  },
  publishedAt: {
    type: Date,
    required: true
  },
  source: {
    id: String,
    name: {
      type: String,
      required: true
    }
  },
  author: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']
  },
  language: {
    type: String,
    default: 'en'
  },
  country: {
    type: String,
    default: 'us'
  },
  tags: [String],
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  readCount: {
    type: Number,
    default: 0
  },
  bookmarkCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ source: 1 });
articleSchema.index({ tags: 1 });

module.exports = mongoose.model('Article', articleSchema);
