const NodeCache = require('node-cache');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects for better performance
});

// Cache keys
const CACHE_KEYS = {
  NEWS: 'news',
  USER_PREFERENCES: 'user_preferences',
  ARTICLES: 'articles'
};

const getCacheKey = (key, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return paramString ? `${key}:${paramString}` : key;
};

const cacheService = {
  // Get data from cache
  get: (key, params = {}) => {
    const cacheKey = getCacheKey(key, params);
    return cache.get(cacheKey);
  },

  // Set data in cache
  set: (key, data, ttl = null, params = {}) => {
    const cacheKey = getCacheKey(key, params);
    return cache.set(cacheKey, data, ttl);
  },

  // Delete specific cache entry
  del: (key, params = {}) => {
    const cacheKey = getCacheKey(key, params);
    return cache.del(cacheKey);
  },

  // Clear all cache
  clear: () => {
    return cache.flushAll();
  },

  // Get cache stats
  getStats: () => {
    return cache.getStats();
  },

  // Cache news data
  cacheNews: (query, data, ttl = 300) => {
    return cacheService.set(CACHE_KEYS.NEWS, data, ttl, query);
  },

  // Get cached news data
  getCachedNews: (query) => {
    return cacheService.get(CACHE_KEYS.NEWS, query);
  },

  // Cache user preferences
  cacheUserPreferences: (userId, preferences, ttl = 600) => {
    return cacheService.set(CACHE_KEYS.USER_PREFERENCES, preferences, ttl, { userId });
  },

  // Get cached user preferences
  getCachedUserPreferences: (userId) => {
    return cacheService.get(CACHE_KEYS.USER_PREFERENCES, { userId });
  },

  // Clear user-specific cache
  clearUserCache: (userId) => {
    cacheService.del(CACHE_KEYS.USER_PREFERENCES, { userId });
  }
};

module.exports = { cacheService, CACHE_KEYS };
