const mongoose = require('mongoose');

const userArticleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure unique combination of user and article
userArticleSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('UserArticle', userArticleSchema);
