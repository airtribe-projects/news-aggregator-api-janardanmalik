const express = require('express');
const newsApiService = require('../utils/newsApi');
const { optionalAuth } = require('../middleware/auth');
const { validateNewsQuery } = require('../middleware/validation');

const router = express.Router();

// Get news headlines
router.get('/headlines', optionalAuth, validateNewsQuery, async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      country = 'us',
      language = 'en',
      page = 1,
      pageSize = 20
    } = req.query;

    const query = {
      q,
      category,
      country,
      language,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    let newsData;

    // If user is authenticated, get personalized news
    if (req.user) {
      newsData = await newsApiService.getPersonalizedNews(req.user.preferences, query);
    } else {
      newsData = await newsApiService.getAggregatedNews(query);
    }

    res.json({
      success: true,
      data: newsData,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalResults: newsData.totalResults,
        totalPages: Math.ceil(newsData.totalResults / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch news',
      message: error.message || 'An error occurred while fetching news'
    });
  }
});

// Search news
router.get('/search', optionalAuth, validateNewsQuery, async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      country = 'us',
      language = 'en',
      page = 1,
      pageSize = 20
    } = req.query;

    if (!q.trim()) {
      return res.status(400).json({
        error: 'Search query is required',
        message: 'Please provide a search term'
      });
    }

    const query = {
      q: q.trim(),
      category,
      country,
      language,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    let newsData;

    // If user is authenticated, get personalized search results
    if (req.user) {
      newsData = await newsApiService.getPersonalizedNews(req.user.preferences, query);
    } else {
      newsData = await newsApiService.getAggregatedNews(query);
    }

    res.json({
      success: true,
      data: newsData,
      searchQuery: q,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalResults: newsData.totalResults,
        totalPages: Math.ceil(newsData.totalResults / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('News search error:', error);
    res.status(500).json({
      error: 'Failed to search news',
      message: error.message || 'An error occurred while searching news'
    });
  }
});

// Get news by category
router.get('/category/:category', optionalAuth, validateNewsQuery, async (req, res) => {
  try {
    const { category } = req.params;
    const {
      country = 'us',
      language = 'en',
      page = 1,
      pageSize = 20
    } = req.query;

    const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const query = {
      category,
      country,
      language,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    let newsData;

    // If user is authenticated, get personalized news for category
    if (req.user) {
      newsData = await newsApiService.getPersonalizedNews(req.user.preferences, query);
    } else {
      newsData = await newsApiService.getAggregatedNews(query);
    }

    res.json({
      success: true,
      data: newsData,
      category,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalResults: newsData.totalResults,
        totalPages: Math.ceil(newsData.totalResults / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('Category news fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch category news',
      message: error.message || 'An error occurred while fetching category news'
    });
  }
});

// Get trending topics
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const {
      country = 'us',
      language = 'en',
      pageSize = 10
    } = req.query;

    // Get trending news (using general category for trending)
    const query = {
      category: 'general',
      country,
      language,
      page: 1,
      pageSize: parseInt(pageSize)
    };

    let newsData;

    if (req.user) {
      newsData = await newsApiService.getPersonalizedNews(req.user.preferences, query);
    } else {
      newsData = await newsApiService.getAggregatedNews(query);
    }

    // Extract trending topics from articles
    const trendingTopics = newsData.articles
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source?.name
      }))
      .slice(0, parseInt(pageSize));

    res.json({
      success: true,
      data: {
        trending: trendingTopics,
        totalResults: trendingTopics.length
      }
    });
  } catch (error) {
    console.error('Trending news fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch trending news',
      message: error.message || 'An error occurred while fetching trending news'
    });
  }
});

// Get available categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'business', name: 'Business', description: 'Business and financial news' },
    { id: 'entertainment', name: 'Entertainment', description: 'Entertainment and celebrity news' },
    { id: 'general', name: 'General', description: 'General news and current events' },
    { id: 'health', name: 'Health', description: 'Health and medical news' },
    { id: 'science', name: 'Science', description: 'Science and technology news' },
    { id: 'sports', name: 'Sports', description: 'Sports news and updates' },
    { id: 'technology', name: 'Technology', description: 'Technology and innovation news' }
  ];

  res.json({
    success: true,
    data: { categories }
  });
});

// Get available countries
router.get('/countries', (req, res) => {
  const countries = [
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' },
    { code: 'in', name: 'India' },
    { code: 'jp', name: 'Japan' },
    { code: 'br', name: 'Brazil' },
    { code: 'mx', name: 'Mexico' }
  ];

  res.json({
    success: true,
    data: { countries }
  });
});

module.exports = router;
