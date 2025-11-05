# News Aggregator API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The News Aggregator API provides a comprehensive RESTful interface for managing personalized news content. It supports user authentication, news aggregation from multiple sources, article management, and personalized recommendations.

**Base URL**: `http://localhost:3000/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`

## Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string (3-30 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 6 chars, must contain uppercase, lowercase, number)"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email",
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

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email",
    "preferences": "user-preferences",
    "lastLogin": "2023-09-01T10:00:00Z"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string (optional)",
  "email": "string (optional)"
}
```

#### Get User Preferences
```http
GET /api/users/preferences
Authorization: Bearer <token>
```

#### Update User Preferences
```http
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "categories": ["business", "technology"],
    "sources": ["source1", "source2"],
    "keywords": ["AI", "blockchain"],
    "language": "en",
    "country": "us"
  }
}
```

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string (min 6 chars)"
}
```

#### Get User Statistics
```http
GET /api/users/stats
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "stats": {
    "totalSavedArticles": 25,
    "totalBookmarkedArticles": 10,
    "accountCreated": "2023-09-01T10:00:00Z",
    "lastLogin": "2023-09-01T15:30:00Z",
    "preferences": {
      "categories": 3,
      "sources": 2,
      "keywords": 5
    }
  }
}
```

#### Deactivate Account
```http
DELETE /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "string"
}
```

### News Endpoints

#### Get News Headlines
```http
GET /api/news/headlines?q=query&category=category&country=us&language=en&page=1&pageSize=20
Authorization: Bearer <token> (optional)
```

**Query Parameters**:
- `q`: Search query (optional)
- `category`: business, entertainment, general, health, science, sports, technology
- `country`: 2-letter country code (us, gb, ca, etc.)
- `language`: 2-letter language code (en, es, fr, etc.)
- `page`: Page number (1-100)
- `pageSize`: Results per page (1-100)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "title": "Article Title",
        "description": "Article description",
        "url": "https://example.com/article",
        "urlToImage": "https://example.com/image.jpg",
        "publishedAt": "2023-09-01T10:00:00Z",
        "source": {
          "name": "Source Name"
        },
        "author": "Author Name"
      }
    ],
    "totalResults": 100,
    "source": "newsapi"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalResults": 100,
    "totalPages": 5
  }
}
```

#### Search News
```http
GET /api/news/search?q=search-term&category=category&country=us&language=en&page=1&pageSize=20
Authorization: Bearer <token> (optional)
```

#### Get News by Category
```http
GET /api/news/category/{category}?country=us&language=en&page=1&pageSize=20
Authorization: Bearer <token> (optional)
```

#### Get Trending News
```http
GET /api/news/trending?country=us&language=en&pageSize=10
Authorization: Bearer <token> (optional)
```

#### Get Available Categories
```http
GET /api/news/categories
```

#### Get Available Countries
```http
GET /api/news/countries
```

### Article Management Endpoints

#### Save Article
```http
POST /api/articles/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string (required)",
  "url": "string (required, valid URL)",
  "description": "string (optional)",
  "content": "string (optional)",
  "urlToImage": "string (optional, valid URL)",
  "publishedAt": "string (optional, ISO 8601 date)",
  "source": {
    "name": "string (required)"
  },
  "author": "string (optional)",
  "category": "string (optional, valid category)",
  "language": "string (optional, 2-char code)",
  "country": "string (optional, 2-char code)",
  "tags": ["string"] (optional)
}
```

#### Bookmark Article
```http
POST /api/articles/{id}/bookmark
Authorization: Bearer <token>
```

#### Mark Article as Read
```http
POST /api/articles/{id}/read
Authorization: Bearer <token>
```

#### Rate Article
```http
POST /api/articles/{id}/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": "number (1-5)"
}
```

#### Add Notes to Article
```http
POST /api/articles/{id}/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "string (max 500 chars)"
}
```

#### Get Saved Articles
```http
GET /api/articles/saved?page=1&pageSize=20&category=category&isBookmarked=true&isRead=false
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Results per page (default: 20)
- `category`: Filter by category
- `isBookmarked`: Filter by bookmark status (true/false)
- `isRead`: Filter by read status (true/false)

#### Get Bookmarked Articles
```http
GET /api/articles/bookmarked?page=1&pageSize=20&category=category
Authorization: Bearer <token>
```

#### Get Article Details
```http
GET /api/articles/{id}
Authorization: Bearer <token> (optional)
```

#### Remove Saved Article
```http
DELETE /api/articles/{id}
Authorization: Bearer <token>
```

## Data Models

### User Model
```json
{
  "id": "ObjectId",
  "username": "string (unique, 3-30 chars)",
  "email": "string (unique, valid email)",
  "password": "string (hashed)",
  "preferences": {
    "categories": ["string"],
    "sources": ["string"],
    "keywords": ["string"],
    "language": "string (default: en)",
    "country": "string (default: us)"
  },
  "savedArticles": ["ObjectId"],
  "bookmarkedArticles": ["ObjectId"],
  "isActive": "boolean (default: true)",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Article Model
```json
{
  "id": "ObjectId",
  "title": "string (required)",
  "description": "string",
  "content": "string",
  "url": "string (unique, required)",
  "urlToImage": "string",
  "publishedAt": "Date (required)",
  "source": {
    "id": "string",
    "name": "string (required)"
  },
  "author": "string",
  "category": "string (enum)",
  "language": "string (default: en)",
  "country": "string (default: us)",
  "tags": ["string"],
  "sentiment": "string (enum: positive, negative, neutral)",
  "readCount": "number (default: 0)",
  "bookmarkCount": "number (default: 0)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### UserArticle Model
```json
{
  "id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "article": "ObjectId (ref: Article)",
  "isBookmarked": "boolean (default: false)",
  "isRead": "boolean (default: false)",
  "readAt": "Date",
  "rating": "number (1-5)",
  "notes": "string (max 500 chars)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Error Codes

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### Common Error Messages
- `"Access denied. No token provided."` - Missing authentication token
- `"Invalid token."` - Invalid or malformed JWT token
- `"Token expired."` - JWT token has expired
- `"User already exists"` - Email or username already registered
- `"Invalid credentials"` - Wrong email/password combination
- `"Validation failed"` - Request validation errors
- `"Article not found"` - Article doesn't exist
- `"Route not found"` - Invalid endpoint

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP address
- **Configurable**: Set via environment variables
- **Response**: `429 Too Many Requests` when limit exceeded

## Examples

### Complete User Flow

1. **Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

2. **Login User**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

3. **Update Preferences**
```bash
curl -X PUT http://localhost:3000/api/users/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "preferences": {
      "categories": ["technology", "business"],
      "keywords": ["AI", "blockchain"],
      "country": "us",
      "language": "en"
    }
  }'
```

4. **Get Personalized News**
```bash
curl -X GET "http://localhost:3000/api/news/headlines?category=technology&pageSize=10" \
  -H "Authorization: Bearer <token>"
```

5. **Save Article**
```bash
curl -X POST http://localhost:3000/api/articles/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "AI Breakthrough",
    "url": "https://example.com/ai-news",
    "description": "Latest AI developments",
    "source": {"name": "Tech News"},
    "category": "technology"
  }'
```

6. **Bookmark Article**
```bash
curl -X POST http://localhost:3000/api/articles/64f8a1b2c3d4e5f6a7b8c9d0/bookmark \
  -H "Authorization: Bearer <token>"
```

7. **Get Saved Articles**
```bash
curl -X GET "http://localhost:3000/api/articles/saved?page=1&pageSize=20" \
  -H "Authorization: Bearer <token>"
```

### Error Handling Example

```bash
# Invalid request
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "invalid-email",
    "password": "123"
  }'
```

**Response (400)**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "username",
      "message": "Username must be between 3 and 30 characters"
    },
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```
