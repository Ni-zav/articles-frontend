Article Backend API

Version: 1.0.0
OpenAPI: 3.0

Overview
This API manages articles, categories, authentication, and media uploads.

Base URL
Project: https://test-fe.mysellerpintar.com/api
Local: http://localhost:3000

Authentication
Use JWT Bearer tokens for protected endpoints.
Header:
Authorization: Bearer <token>

Roles
- User
- Admin

Error Model
- 400 Bad Request — Invalid input.
- 401 Unauthorized — Missing/invalid token.
- 403 Forbidden — Insufficient role/ownership.
- 404 Not Found — Resource does not exist.
- 500 Server Error — Unexpected error.

Articles

GET /articles — List articles
Description
Retrieve a paginated list of articles with optional filters and sorting.

Query Parameters
- articleId (string, optional)
- userId (string, optional)
- title (string, optional)
- category (string, optional) — category id or name, depending on backend
- createdAtStart (string, date, optional) — ISO date (YYYY-MM-DD)
- createdAtEnd (string, date, optional) — ISO date (YYYY-MM-DD)
- sortBy (string, optional) — e.g., createdAt, title
- sortOrder (string, optional) — asc | desc
- page (integer, optional, default: 1)
- limit (integer, optional, default: 10)

Responses
200 OK
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "userId": "string",
      "categoryId": "string",
      "createdAt": "2025-08-01T14:16:52.305Z",
      "updatedAt": "2025-08-01T14:16:52.305Z",
      "category": {
        "id": "string",
        "name": "string",
        "userId": "string",
        "createdAt": "2025-08-01T14:16:52.305Z",
        "updatedAt": "2025-08-01T14:16:52.305Z"
      },
      "user": {
        "id": "string",
        "username": "string",
        "role": "User"
      }
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 10
}

POST /articles — Create article
Description
Create a new article. Requires authentication (User or Admin).

Request Body
{
  "title": "string",
  "content": "string",
  "categoryId": "string"
}

Responses
200 OK
{
  "id": "string",
  "title": "string",
  "content": "string",
  "userId": "string",
  "categoryId": "string",
  "createdAt": "2025-08-01T14:16:52.308Z",
  "updatedAt": "2025-08-01T14:16:52.308Z",
  "category": {
    "id": "string",
    "name": "string",
    "userId": "string",
    "createdAt": "2025-08-01T14:16:52.308Z",
    "updatedAt": "2025-08-01T14:16:52.308Z"
  },
  "user": {
    "id": "string",
    "username": "string",
    "role": "User"
  }
}
401 Unauthorized

GET /articles/{id} — Get by ID
Description
Fetch a single article by its ID.

Path Parameters
- id (string, required) — The article ID

Responses
200 OK
{
  "id": "string",
  "title": "string",
  "content": "string",
  "userId": "string",
  "categoryId": "string",
  "createdAt": "2025-08-01T14:16:52.310Z",
  "updatedAt": "2025-08-01T14:16:52.310Z",
  "category": {
    "id": "string",
    "name": "string",
    "userId": "string",
    "createdAt": "2025-08-01T14:16:52.310Z",
    "updatedAt": "2025-08-01T14:16:52.310Z"
  },
  "user": {
    "id": "string",
    "username": "string",
    "role": "User"
  }
}
404 Not Found

PUT /articles/{id} — Update article
Description
Update an existing article. Requires authentication and proper permissions (owner or Admin).

Path Parameters
- id (string, required)

Request Body
{
  "title": "string",
  "content": "string",
  "categoryId": "string"
}

Responses
200 OK
{
  "id": "string",
  "title": "string",
  "content": "string",
  "userId": "string",
  "categoryId": "string",
  "createdAt": "2025-08-01T14:16:52.313Z",
  "updatedAt": "2025-08-01T14:16:52.313Z",
  "category": {
    "id": "string",
    "name": "string",
    "userId": "string",
    "createdAt": "2025-08-01T14:16:52.313Z",
    "updatedAt": "2025-08-01T14:16:52.313Z"
  },
  "user": {
    "id": "string",
    "username": "string",
    "role": "User"
  }
}
401 Unauthorized
403 Forbidden
404 Not Found

DELETE /articles/{id} — Delete article
Description
Delete an article by ID. Requires authentication and proper permissions (owner or Admin).

Path Parameters
- id (string, required)

Responses
200 OK — Article deleted
401 Unauthorized
403 Forbidden
404 Not Found

Auth

POST /auth/register — Register
Description
Create a new user account.

Request Body
{
  "username": "string",
  "password": "string",
  "role": "User"
}

Responses
201 Created
{
  "username": "string",
  "password": "string",
  "role": "User",
  "createdAt": "2025-08-01T14:16:52.317Z",
  "updatedAt": "2025-08-01T14:16:52.317Z"
}
400 Bad Request

POST /auth/login — Login
Description
Authenticate a user and receive a JWT.

Request Body
{
  "username": "string",
  "password": "string"
}

Responses
200 OK
{
  "token": "string"
}
401 Invalid credentials

GET /auth/profile — Profile
Description
Return the authenticated user's profile.

Responses
200 OK
{
  "id": "string",
  "username": "string",
  "role": "string"
}
401 Unauthorized

Categories

GET /categories — List categories
Description
Retrieve categories with pagination and search.

Query Parameters
- page (integer, optional, default: 1) — Page number
- limit (integer, optional, default: 10) — Items per page
- search (string, optional) — Filter by category name

Responses
200 OK
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "userId": "string",
      "createdAt": "2025-08-01T14:16:52.321Z",
      "updatedAt": "2025-08-01T14:16:52.321Z"
    }
  ],
  "totalData": 0,
  "currentPage": 1,
  "totalPages": 0
}

POST /categories — Create category
Description
Create a new category. Requires authentication (User or Admin).

Request Body
{
  "name": "string"
}

Responses
200 OK
{
  "id": "string",
  "name": "string",
  "userId": "string",
  "createdAt": "2025-08-01T14:16:52.324Z",
  "updatedAt": "2025-08-01T14:16:52.324Z"
}
401 Unauthorized
403 Forbidden

PUT /categories/{id} — Update category
Description
Update a category. Requires authentication and proper permissions.

Path Parameters
- id (string, required)

Request Body
{
  "name": "string"
}

Responses
200 OK
{
  "id": "string",
  "name": "string",
  "userId": "string",
  "createdAt": "2025-08-01T14:16:52.326Z",
  "updatedAt": "2025-08-01T14:16:52.326Z"
}
401 Unauthorized
403 Forbidden
404 Not Found

DELETE /categories/{id} — Delete category
Description
Delete a category. Requires authentication and proper permissions.

Path Parameters
- id (string, required)

Responses
200 OK — Category deleted
401 Unauthorized
403 Forbidden
404 Not Found

Upload

POST /upload — Upload image to S3
Description
Authenticated Admins can upload an image to S3.

Request Body (multipart/form-data)
- image (string, binary) — The image file to upload

Responses
200 OK
{
  "imageUrl": "https://your-s3-bucket.amazonaws.com/uploads/image123.jpg"
}
401 Unauthorized — Missing or invalid JWT token
403 Forbidden — User is not an admin
500 Server Error — Failed to upload image

Schemas

User
{
  "id": "string",
  "username": "string",
  "role": "User" | "Admin"
}

Category
{
  "id": "string",
  "name": "string",
  "userId": "string",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}

CategoryInput
{
  "name": "string" // required
}

Article
{
  "id": "string",
  "title": "string",
  "content": "string",
  "userId": "string",
  "categoryId": "string",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)",
  "category": {
    "id": "string",
    "name": "string",
    "userId": "string",
    "createdAt": "string (date-time)",
    "updatedAt": "string (date-time)"
  },
  "user": {
    "id": "string",
    "username": "string",
    "role": "User" | "Admin"
  }
}

ArticleInput
{
  "title": "string",      // required
  "content": "string",    // required
  "categoryId": "string"  // required
}

Notes
- All timestamps are ISO 8601 strings.
- Pagination defaults may vary by environment; override via query params.
- Protected routes require Authorization header with a valid JWT token.
