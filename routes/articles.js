const express = require('express');
const Article = require('../models/Article');
const UserArticle = require('../models/UserArticle');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const { body } = require('express-validator');


const router = express.Router();

// Save article
router.post('/save', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('description').optional(),
  body('content').optional(),
  body('urlToImage').optional().isURL().withMessage('Valid image URL required'),
  body('publishedAt').optional().isISO8601().withMessage('Valid date required'),
  body('source').notEmpty().withMessage('Source is required'),
  body('author').optional(),
  body('category').optional().isIn(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']),
  body('language').optional().isLength({ min: 2, max: 2 }),
  body('country').optional().isLength({ min: 2, max: 2 }),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const articleData = req.body;
    const userId = req.user._id;

    // Check if article already exists
    let article = await Article.findOne({ url: articleData.url });
    
    if (!article) {
      // Create new article
      article = new Article({
        ...articleData,
        publishedAt: articleData.publishedAt ? new Date(articleData.publishedAt) : new Date()
      });
      await article.save();
    }

    // Check if user has already saved this article
    const existingUserArticle = await UserArticle.findOne({
      user: userId,
      article: article._id
    });

    if (existingUserArticle) {
      return res.status(400).json({
        error: 'Article already saved',
        message: 'This article has already been saved to your collection'
      });
    }

    // Create user-article relationship
    const userArticle = new UserArticle({
      user: userId,
      article: article._id,
      isBookmarked: false
    });
    await userArticle.save();

    // Update article bookmark count
    article.bookmarkCount += 1;
    await article.save();

    // Add to user's saved articles
    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedArticles: article._id }
    });

    res.status(201).json({
      message: 'Article saved successfully',
      article: {
        id: article._id,
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt
      }
    });
  } catch (error) {
    console.error('Save article error:', error);
    res.status(500).json({
      error: 'Failed to save article',
      message: 'An error occurred while saving the article'
    });
  }
});

// Bookmark article
router.post('/:id/bookmark', auth, validateObjectId, async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Find or create user-article relationship
    let userArticle = await UserArticle.findOne({
      user: userId,
      article: articleId
    });

    if (!userArticle) {
      // Create new relationship
      userArticle = new UserArticle({
        user: userId,
        article: articleId,
        isBookmarked: true
      });
      await userArticle.save();

      // Add to user's bookmarked articles
      await User.findByIdAndUpdate(userId, {
        $addToSet: { bookmarkedArticles: articleId }
      });

      // Update article bookmark count
      article.bookmarkCount += 1;
      await article.save();
    } else {
      // Toggle bookmark status
      userArticle.isBookmarked = !userArticle.isBookmarked;
      await userArticle.save();

      if (userArticle.isBookmarked) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { bookmarkedArticles: articleId }
        });
        article.bookmarkCount += 1;
      } else {
        await User.findByIdAndUpdate(userId, {
          $pull: { bookmarkedArticles: articleId }
        });
        article.bookmarkCount = Math.max(0, article.bookmarkCount - 1);
      }
      await article.save();
    }

    res.json({
      message: userArticle.isBookmarked ? 'Article bookmarked' : 'Article unbookmarked',
      isBookmarked: userArticle.isBookmarked
    });
  } catch (error) {
    console.error('Bookmark article error:', error);
    res.status(500).json({
      error: 'Failed to bookmark article',
      message: 'An error occurred while bookmarking the article'
    });
  }
});

// Mark article as read
router.post('/:id/read', auth, validateObjectId, async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Find or create user-article relationship
    let userArticle = await UserArticle.findOne({
      user: userId,
      article: articleId
    });

    if (!userArticle) {
      userArticle = new UserArticle({
        user: userId,
        article: articleId,
        isRead: true,
        readAt: new Date()
      });
    } else {
      userArticle.isRead = true;
      userArticle.readAt = new Date();
    }

    await userArticle.save();

    // Update article read count
    article.readCount += 1;
    await article.save();

    res.json({
      message: 'Article marked as read',
      readAt: userArticle.readAt
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark article as read',
      message: 'An error occurred while marking the article as read'
    });
  }
});

// Rate article
router.post('/:id/rate', auth, validateObjectId, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;
    const { rating } = req.body;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Find or create user-article relationship
    let userArticle = await UserArticle.findOne({
      user: userId,
      article: articleId
    });

    if (!userArticle) {
      userArticle = new UserArticle({
        user: userId,
        article: articleId,
        rating: rating
      });
    } else {
      userArticle.rating = rating;
    }

    await userArticle.save();

    res.json({
      message: 'Article rated successfully',
      rating: userArticle.rating
    });
  } catch (error) {
    console.error('Rate article error:', error);
    res.status(500).json({
      error: 'Failed to rate article',
      message: 'An error occurred while rating the article'
    });
  }
});

// Add notes to article
router.post('/:id/notes', auth, validateObjectId, [
  body('notes').isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;
    const { notes } = req.body;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Find or create user-article relationship
    let userArticle = await UserArticle.findOne({
      user: userId,
      article: articleId
    });

    if (!userArticle) {
      userArticle = new UserArticle({
        user: userId,
        article: articleId,
        notes: notes
      });
    } else {
      userArticle.notes = notes;
    }

    await userArticle.save();

    res.json({
      message: 'Notes added successfully',
      notes: userArticle.notes
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({
      error: 'Failed to add notes',
      message: 'An error occurred while adding notes to the article'
    });
  }
});

// Get user's saved articles
router.get('/saved', auth, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      category = '',
      isBookmarked = '',
      isRead = ''
    } = req.query;

    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // Build query
    let query = { user: userId };
    
    if (isBookmarked === 'true') {
      query.isBookmarked = true;
    } else if (isBookmarked === 'false') {
      query.isBookmarked = false;
    }

    if (isRead === 'true') {
      query.isRead = true;
    } else if (isRead === 'false') {
      query.isRead = false;
    }

    // Get user articles with article details
    const userArticles = await UserArticle.find(query)
      .populate('article')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    // Filter by category if specified
    let filteredArticles = userArticles;
    if (category) {
      filteredArticles = userArticles.filter(ua => ua.article.category === category);
    }

    const totalCount = await UserArticle.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles: filteredArticles.map(ua => ({
          id: ua.article._id,
          title: ua.article.title,
          description: ua.article.description,
          url: ua.article.url,
          urlToImage: ua.article.urlToImage,
          publishedAt: ua.article.publishedAt,
          source: ua.article.source,
          author: ua.article.author,
          category: ua.article.category,
          isBookmarked: ua.isBookmarked,
          isRead: ua.isRead,
          readAt: ua.readAt,
          rating: ua.rating,
          notes: ua.notes,
          savedAt: ua.createdAt
        })),
        totalCount,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(totalCount / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('Get saved articles error:', error);
    res.status(500).json({
      error: 'Failed to fetch saved articles',
      message: 'An error occurred while fetching your saved articles'
    });
  }
});

// Get user's bookmarked articles
router.get('/bookmarked', auth, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      category = ''
    } = req.query;

    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // Build query
    let query = { user: userId, isBookmarked: true };

    // Get user articles with article details
    const userArticles = await UserArticle.find(query)
      .populate('article')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    // Filter by category if specified
    let filteredArticles = userArticles;
    if (category) {
      filteredArticles = userArticles.filter(ua => ua.article.category === category);
    }

    const totalCount = await UserArticle.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles: filteredArticles.map(ua => ({
          id: ua.article._id,
          title: ua.article.title,
          description: ua.article.description,
          url: ua.article.url,
          urlToImage: ua.article.urlToImage,
          publishedAt: ua.article.publishedAt,
          source: ua.article.source,
          author: ua.article.author,
          category: ua.article.category,
          rating: ua.rating,
          notes: ua.notes,
          bookmarkedAt: ua.updatedAt
        })),
        totalCount,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(totalCount / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('Get bookmarked articles error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookmarked articles',
      message: 'An error occurred while fetching your bookmarked articles'
    });
  }
});

// Get article details
router.get('/:id', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?._id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    let userArticle = null;
    if (userId) {
      userArticle = await UserArticle.findOne({
        user: userId,
        article: articleId
      });
    }

    res.json({
      success: true,
      data: {
        id: article._id,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source,
        author: article.author,
        category: article.category,
        language: article.language,
        country: article.country,
        tags: article.tags,
        sentiment: article.sentiment,
        readCount: article.readCount,
        bookmarkCount: article.bookmarkCount,
        userInteraction: userArticle ? {
          isBookmarked: userArticle.isBookmarked,
          isRead: userArticle.isRead,
          readAt: userArticle.readAt,
          rating: userArticle.rating,
          notes: userArticle.notes
        } : null
      }
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      error: 'Failed to fetch article',
      message: 'An error occurred while fetching the article'
    });
  }
});

// Remove saved article
router.delete('/:id', auth, validateObjectId, async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    // Find user-article relationship
    const userArticle = await UserArticle.findOne({
      user: userId,
      article: articleId
    });

    if (!userArticle) {
      return res.status(404).json({
        error: 'Article not found in your collection'
      });
    }

    // Remove from user's saved articles
    await User.findByIdAndUpdate(userId, {
      $pull: { 
        savedArticles: articleId,
        bookmarkedArticles: articleId
      }
    });

    // Update article bookmark count
    const article = await Article.findById(articleId);
    if (article) {
      article.bookmarkCount = Math.max(0, article.bookmarkCount - 1);
      await article.save();
    }

    // Delete user-article relationship
    await UserArticle.findByIdAndDelete(userArticle._id);

    res.json({
      message: 'Article removed from your collection'
    });
  } catch (error) {
    console.error('Remove article error:', error);
    res.status(500).json({
      error: 'Failed to remove article',
      message: 'An error occurred while removing the article'
    });
  }
});

module.exports = router;
