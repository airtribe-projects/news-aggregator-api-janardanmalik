const axios = require('axios');
const { cacheService } = require('./cache');

class NewsAPIService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.gnewsApiKey = process.env.GNEWS_API_KEY;
    this.newscatcherApiKey = process.env.NEWSCATCHER_API_KEY;
  }

  // NewsAPI.org integration
  async getNewsFromNewsAPI(query = {}) {
    if (!this.newsApiKey) {
      throw new Error('NewsAPI key not configured');
    }

    const {
      q = '',
      category = '',
      country = 'us',
      language = 'en',
      page = 1,
      pageSize = 20
    } = query;

    const cacheKey = { q, category, country, language, page, pageSize, source: 'newsapi' };
    const cachedData = cacheService.getCachedNews(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const params = {
        apiKey: this.newsApiKey,
        page,
        pageSize,
        language,
        country
      };

      if (q) params.q = q;
      if (category) params.category = category;

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params,
        timeout: 10000
      });

      const data = {
        articles: response.data.articles || [],
        totalResults: response.data.totalResults || 0,
        source: 'newsapi'
      };

      cacheService.cacheNews(cacheKey, data, 300); // Cache for 5 minutes
      return data;
    } catch (error) {
      console.error('NewsAPI error:', error.message);
      throw new Error('Failed to fetch news from NewsAPI');
    }
  }

  // GNews API integration
  async getNewsFromGNews(query = {}) {
    if (!this.gnewsApiKey) {
      throw new Error('GNews API key not configured');
    }

    const {
      q = '',
      category = '',
      country = 'us',
      language = 'en',
      page = 1,
      pageSize = 20
    } = query;

    const cacheKey = { q, category, country, language, page, pageSize, source: 'gnews' };
    const cachedData = cacheService.getCachedNews(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const params = {
        apikey: this.gnewsApiKey,
        max: pageSize,
        lang: language,
        country: country
      };

      if (q) params.q = q;
      if (category) params.category = category;

      const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
        params,
        timeout: 10000
      });

      const data = {
        articles: response.data.articles || [],
        totalResults: response.data.totalArticles || 0,
        source: 'gnews'
      };

      cacheService.cacheNews(cacheKey, data, 300);
      return data;
    } catch (error) {
      console.error('GNews API error:', error.message);
      throw new Error('Failed to fetch news from GNews');
    }
  }

  // NewsCatcher API integration
  async getNewsFromNewsCatcher(query = {}) {
    if (!this.newscatcherApiKey) {
      throw new Error('NewsCatcher API key not configured');
    }

    const {
      q = '',
      category = '',
      country = 'us',
      language = 'en',
      page = 1,
      pageSize = 20
    } = query;

    const cacheKey = { q, category, country, language, page, pageSize, source: 'newscatcher' };
    const cachedData = cacheService.getCachedNews(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const params = {
        api_key: this.newscatcherApiKey,
        page_size: pageSize,
        page: page,
        lang: language,
        country: country
      };

      if (q) params.q = q;
      if (category) params.topic = category;

      const response = await axios.get('https://api.newscatcher.com/v1/search', {
        params,
        timeout: 10000
      });

      const data = {
        articles: response.data.articles || [],
        totalResults: response.data.total_hits || 0,
        source: 'newscatcher'
      };

      cacheService.cacheNews(cacheKey, data, 300);
      return data;
    } catch (error) {
      console.error('NewsCatcher API error:', error.message);
      throw new Error('Failed to fetch news from NewsCatcher');
    }
  }

  // Aggregate news from multiple sources
  async getAggregatedNews(query = {}) {
    const results = [];
    const errors = [];

    // Try each API in order of preference
    const apis = [
      () => this.getNewsFromNewsAPI(query),
      () => this.getNewsFromGNews(query),
      () => this.getNewsFromNewsCatcher(query)
    ];

    for (const apiCall of apis) {
      try {
        const result = await apiCall();
        results.push(result);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (results.length === 0) {
      throw new Error(`All news APIs failed: ${errors.join(', ')}`);
    }

    // Combine results from all successful APIs
    const combinedArticles = [];
    let totalResults = 0;

    results.forEach(result => {
      combinedArticles.push(...result.articles);
      totalResults += result.totalResults;
    });

    // Remove duplicates based on URL
    const uniqueArticles = combinedArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.url === article.url)
    );

    return {
      articles: uniqueArticles,
      totalResults,
      sources: results.map(r => r.source),
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Get personalized news based on user preferences
  async getPersonalizedNews(userPreferences, query = {}) {
    const personalizedQuery = {
      ...query,
      category: query.category || (userPreferences.categories && userPreferences.categories[0]),
      country: query.country || userPreferences.country || 'us',
      language: query.language || userPreferences.language || 'en'
    };

    // Add user keywords to search query
    if (userPreferences.keywords && userPreferences.keywords.length > 0) {
      const keywordQuery = userPreferences.keywords.join(' OR ');
      personalizedQuery.q = query.q ? `${query.q} AND (${keywordQuery})` : keywordQuery;
    }

    return this.getAggregatedNews(personalizedQuery);
  }
}

module.exports = new NewsAPIService();
