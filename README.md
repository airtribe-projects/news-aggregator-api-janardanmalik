# News Aggregator API

A comprehensive RESTful API for a personalized news aggregator built with Node.js, Express.js, MongoDB, and JWT authentication. This API integrates with multiple news sources and provides personalized news experiences based on user preferences.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📰 **Multi-Source News Integration** - NewsAPI, GNews, NewsCatcher APIs
- 🎯 **Personalized News** - User preferences and keyword-based filtering
- 💾 **Article Management** - Save, bookmark, rate, and add notes to articles
- ⚡ **Caching** - Redis-like caching for improved performance
- 🛡️ **Security** - Rate limiting, input validation, and security headers
- 📊 **Analytics** - User statistics and article metrics
- 🧪 **Testing** - Comprehensive test suite with Jest

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator
- **Caching**: node-cache
- **Testing**: Jest, Supertest
- **External APIs**: NewsAPI, GNews, NewsCatcher

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- API keys for news services (optional but recommended)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news-aggregator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/news-aggregator
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # News APIs (optional)
   NEWS_API_KEY=your-newsapi-key
   GNEWS_API_KEY=your-gnews-key
   NEWSCATCHER_API_KEY=your-newscatcher-key
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user profile | Yes |
| POST | `/refresh` | Refresh JWT token | Yes |
| POST | `/logout` | Logout user | Yes |

#### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| GET | `/preferences` | Get user preferences | Yes |
| PUT | `/preferences` | Update user preferences | Yes |
| PUT | `/password` | Change password | Yes |
| DELETE | `/account` | Deactivate account | Yes |
| GET | `/stats` | Get user statistics | Yes |

#### News Routes (`/api/news`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/headlines` | Get news headlines | Optional |
| GET | `/search` | Search news articles | Optional |
| GET | `/category/:category` | Get news by category | Optional |
| GET | `/trending` | Get trending news | Optional |
| GET | `/categories` | Get available categories | No |
| GET | `/countries` | Get available countries | No |

#### Article Routes (`/api/articles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/save` | Save article | Yes |
| POST | `/:id/bookmark` | Bookmark/unbookmark article | Yes |
| POST | `/:id/read` | Mark article as read | Yes |
| POST | `/:id/rate` | Rate article (1-5) | Yes |
| POST | `/:id/notes` | Add notes to article | Yes |
| GET | `/saved` | Get saved articles | Yes |
| GET | `/bookmarked` | Get bookmarked articles | Yes |
| GET | `/:id` | Get article details | Optional |
| DELETE | `/:id` | Remove saved article | Yes |

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "janardan malik",
  "email": "janardan0665.be21@chitkara.edu.in",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "preferences": {
      "categories": [],
      "sources": [],
      "keywords": [],
      "language": "en",
      "country": "us"
    }
  }
}
```

#### Get News Headlines
```bash
GET /api/news/headlines?country=us&category=technology&pageSize=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "title": "Latest Tech News",
        "description": "Breaking technology news...",
        "url": "https://example.com/article",
        "urlToImage": "https://example.com/image.jpg",
        "publishedAt": "2023-09-01T10:00:00Z",
        "source": {
          "name": "Tech News"
        },
        "author": "John Doe"
      }
    ],
    "totalResults": 100,
    "source": "newsapi"
  },
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalResults": 100,
    "totalPages": 10
  }
}
```

#### Save Article
```bash
POST /api/articles/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Article Title",
  "url": "https://example.com/article",
  "description": "Article description",
  "source": {
    "name": "News Source"
  },
  "author": "Author Name",
  "category": "technology"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/news-aggregator` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `NEWS_API_KEY` | NewsAPI.org API key | Optional |
| `GNEWS_API_KEY` | GNews API key | Optional |
| `NEWSCATCHER_API_KEY` | NewsCatcher API key | Optional |

### News API Setup

1. **NewsAPI.org** (100 requests/day free)
   - Sign up at [newsapi.org](https://newsapi.org)
   - Get your API key
   - Add to `.env` as `NEWS_API_KEY`

2. **GNews API** (100 requests/day free)
   - Sign up at [gnews.io](https://gnews.io)
   - Get your API key
   - Add to `.env` as `GNEWS_API_KEY`

3. **NewsCatcher API** (2000 requests/month free)
   - Sign up at [newscatcher.ai](https://newscatcher.ai)
   - Get your API key
   - Add to `.env` as `NEWSCATCHER_API_KEY`

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## API Rate Limiting

The API includes rate limiting to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Set `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` in `.env`

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request validation with express-validator
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure token-based authentication

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [] // Validation errors (if applicable)
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name news-aggregator

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-production-secret
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test cases for usage examples

## Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Social features (sharing, comments)
- [ ] Mobile app integration
- [ ] Machine learning recommendations
- [ ] Multi-language support
- [ ] Advanced caching with Redis
