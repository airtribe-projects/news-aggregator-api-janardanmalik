const request = require('supertest');
const app = require('../server');

describe('News Routes', () => {
  describe('GET /api/news/headlines', () => {
    it('should get news headlines without authentication', async () => {
      const response = await request(app)
        .get('/api/news/headlines')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.articles).toBeDefined();
      expect(Array.isArray(response.body.data.articles)).toBe(true);
    });

    it('should get news headlines with query parameters', async () => {
      const response = await request(app)
        .get('/api/news/headlines?country=us&category=technology&pageSize=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.pageSize).toBe(5);
    });

    it('should fail with invalid category', async () => {
      const response = await request(app)
        .get('/api/news/headlines?category=invalid')
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with invalid page size', async () => {
      const response = await request(app)
        .get('/api/news/headlines?pageSize=200')
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/news/search', () => {
    it('should search news with query', async () => {
      const response = await request(app)
        .get('/api/news/search?q=technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.searchQuery).toBe('technology');
    });

    it('should fail without search query', async () => {
      const response = await request(app)
        .get('/api/news/search')
        .expect(400);

      expect(response.body.error).toBe('Search query is required');
    });
  });

  describe('GET /api/news/category/:category', () => {
    it('should get news by valid category', async () => {
      const response = await request(app)
        .get('/api/news/category/technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('technology');
    });

    it('should fail with invalid category', async () => {
      const response = await request(app)
        .get('/api/news/category/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid category');
    });
  });

  describe('GET /api/news/trending', () => {
    it('should get trending news', async () => {
      const response = await request(app)
        .get('/api/news/trending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.trending).toBeDefined();
      expect(Array.isArray(response.body.data.trending)).toBe(true);
    });
  });

  describe('GET /api/news/categories', () => {
    it('should get available categories', async () => {
      const response = await request(app)
        .get('/api/news/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeDefined();
      expect(Array.isArray(response.body.data.categories)).toBe(true);
      expect(response.body.data.categories.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/news/countries', () => {
    it('should get available countries', async () => {
      const response = await request(app)
        .get('/api/news/countries')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.countries).toBeDefined();
      expect(Array.isArray(response.body.data.countries)).toBe(true);
      expect(response.body.data.countries.length).toBeGreaterThan(0);
    });
  });
});
