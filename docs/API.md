# Timebox API Documentation

## Overview

This document provides comprehensive documentation for the Timebox API endpoints. All endpoints require authentication via Supabase session cookies.

**Base URL:** `/api`

**Authentication:** All requests must include valid Supabase session cookies. Unauthenticated requests will receive a `401 Unauthorized` response.

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Create Timebox](#create-timebox)
  - [List Timeboxes](#list-timeboxes)
  - [Get Timebox](#get-timebox)
  - [Update Timebox](#update-timebox)
  - [Delete Timebox](#delete-timebox)
- [Error Responses](#error-responses)
- [Data Models](#data-models)

## Authentication

### Email/Password Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
});
```

### Email/Password Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123',
});
```

### Google OAuth Sign In

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

## Endpoints

### Create Timebox

Creates a new timebox for the authenticated user.

**Endpoint:** `POST /api/timeboxes`

**Request Headers:**
```
Content-Type: application/json
Cookie: sb-<project>-auth-token=<session-token>
```

**Request Body:**
```json
{
  "title": "Deep Work Session",
  "description": "Focus on MVP implementation",
  "start_at": "2026-01-08T09:00:00Z",
  "end_at": "2026-01-08T10:00:00Z",
  "status": "scheduled"
}
```

**Request Body Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Title of the timebox (1-200 characters) |
| description | string | No | Detailed description of the timebox |
| start_at | string (ISO 8601) | Yes | Start time in ISO 8601 format |
| end_at | string (ISO 8601) | Yes | End time in ISO 8601 format |
| status | enum | No | One of: `scheduled`, `in_progress`, `completed`, `canceled` (default: `scheduled`) |

**Success Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deep Work Session",
  "description": "Focus on MVP implementation",
  "start_at": "2026-01-08T09:00:00.000Z",
  "end_at": "2026-01-08T10:00:00.000Z",
  "duration_minutes": 60,
  "status": "scheduled",
  "created_at": "2026-01-08T08:00:00.000Z",
  "updated_at": "2026-01-08T08:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/timeboxes \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<project>-auth-token=<session-token>" \
  -d '{
    "title": "Deep Work Session",
    "description": "Focus on MVP implementation",
    "start_at": "2026-01-08T09:00:00Z",
    "end_at": "2026-01-08T10:00:00Z",
    "status": "scheduled"
  }'
```

---

### List Timeboxes

Retrieves a list of timeboxes for the authenticated user with optional filtering and pagination.

**Endpoint:** `GET /api/timeboxes`

**Request Headers:**
```
Cookie: sb-<project>-auth-token=<session-token>
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| from | string (ISO 8601) | No | - | Filter timeboxes starting from this date/time |
| to | string (ISO 8601) | No | - | Filter timeboxes ending before this date/time |
| limit | integer | No | 50 | Maximum number of results to return (1-100) |

**Success Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Deep Work Session",
    "description": "Focus on MVP implementation",
    "start_at": "2026-01-08T09:00:00.000Z",
    "end_at": "2026-01-08T10:00:00.000Z",
    "duration_minutes": 60,
    "status": "scheduled",
    "created_at": "2026-01-08T08:00:00.000Z",
    "updated_at": "2026-01-08T08:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Team Meeting",
    "description": "Sprint planning",
    "start_at": "2026-01-08T14:00:00.000Z",
    "end_at": "2026-01-08T15:00:00.000Z",
    "duration_minutes": 60,
    "status": "scheduled",
    "created_at": "2026-01-08T08:30:00.000Z",
    "updated_at": "2026-01-08T08:30:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

**Examples:**

```bash
# Get all timeboxes
curl http://localhost:3000/api/timeboxes \
  -H "Cookie: sb-<project>-auth-token=<session-token>"

# Get timeboxes for a specific date range
curl "http://localhost:3000/api/timeboxes?from=2026-01-08T00:00:00Z&to=2026-01-08T23:59:59Z" \
  -H "Cookie: sb-<project>-auth-token=<session-token>"

# Get limited number of timeboxes
curl "http://localhost:3000/api/timeboxes?limit=10" \
  -H "Cookie: sb-<project>-auth-token=<session-token>"
```

---

### Get Timebox

Retrieves a single timebox by ID. Only the owner can access their timebox.

**Endpoint:** `GET /api/timeboxes/:id`

**Request Headers:**
```
Cookie: sb-<project>-auth-token=<session-token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The timebox ID |

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deep Work Session",
  "description": "Focus on MVP implementation",
  "start_at": "2026-01-08T09:00:00.000Z",
  "end_at": "2026-01-08T10:00:00.000Z",
  "duration_minutes": 60,
  "status": "scheduled",
  "created_at": "2026-01-08T08:00:00.000Z",
  "updated_at": "2026-01-08T08:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Timebox not found or not owned by user
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl http://localhost:3000/api/timeboxes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: sb-<project>-auth-token=<session-token>"
```

---

### Update Timebox

Updates an existing timebox. Only the owner can update their timebox.

**Endpoint:** `PUT /api/timeboxes/:id`

**Request Headers:**
```
Content-Type: application/json
Cookie: sb-<project>-auth-token=<session-token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The timebox ID |

**Request Body:**
All fields are optional. Only provided fields will be updated.

```json
{
  "title": "Updated Deep Work Session",
  "description": "Updated description",
  "start_at": "2026-01-08T10:00:00Z",
  "end_at": "2026-01-08T11:30:00Z",
  "status": "in_progress"
}
```

**Request Body Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Title of the timebox (1-200 characters) |
| description | string | No | Detailed description of the timebox |
| start_at | string (ISO 8601) | No | Start time in ISO 8601 format |
| end_at | string (ISO 8601) | No | End time in ISO 8601 format |
| status | enum | No | One of: `scheduled`, `in_progress`, `completed`, `canceled` |

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Updated Deep Work Session",
  "description": "Updated description",
  "start_at": "2026-01-08T10:00:00.000Z",
  "end_at": "2026-01-08T11:30:00.000Z",
  "duration_minutes": 90,
  "status": "in_progress",
  "created_at": "2026-01-08T08:00:00.000Z",
  "updated_at": "2026-01-08T09:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Timebox not found or not owned by user
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X PUT http://localhost:3000/api/timeboxes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<project>-auth-token=<session-token>" \
  -d '{
    "status": "completed"
  }'
```

---

### Delete Timebox

Deletes a timebox. Only the owner can delete their timebox.

**Endpoint:** `DELETE /api/timeboxes/:id`

**Request Headers:**
```
Cookie: sb-<project>-auth-token=<session-token>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The timebox ID |

**Success Response (204 No Content):**
```
(empty response body)
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Timebox not found or not owned by user
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/timeboxes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: sb-<project>-auth-token=<session-token>"
```

---

## Error Responses

All error responses follow a consistent format:

### Common Error Response Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### Validation Error Response (400)
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "제목은 필수입니다",
      "path": ["title"]
    }
  ]
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded with no response body |
| 400 | Bad Request - Invalid request data or validation error |
| 401 | Unauthorized - Authentication required or session expired |
| 403 | Forbidden - User doesn't have permission to access resource |
| 404 | Not Found - Resource doesn't exist or user doesn't own it |
| 409 | Conflict - Request conflicts with current state |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error occurred |

## Data Models

### Timebox

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier for the timebox |
| user_id | UUID | ID of the user who owns this timebox |
| title | string | Title of the timebox (1-200 characters) |
| description | string \| null | Optional detailed description |
| start_at | string (ISO 8601) | Start time of the timebox |
| end_at | string (ISO 8601) | End time of the timebox |
| duration_minutes | number | Calculated duration in minutes (read-only) |
| status | enum | Current status: `scheduled`, `in_progress`, `completed`, or `canceled` |
| created_at | string (ISO 8601) | Timestamp when the timebox was created |
| updated_at | string (ISO 8601) | Timestamp when the timebox was last updated |

### Profile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | User ID (references auth.users) |
| email | string | User's email address |
| nickname | string \| null | Optional user nickname |
| created_at | string (ISO 8601) | Timestamp when profile was created |
| updated_at | string (ISO 8601) | Timestamp when profile was last updated |

## Rate Limiting

Currently, there are no explicit rate limits enforced on the API. However, Supabase may enforce connection limits and rate limits at the database level.

## Security

### Row Level Security (RLS)

All database tables have Row Level Security enabled:

- **Profiles**: Users can only view, insert, update, and delete their own profile
- **Timeboxes**: Users can only view, insert, update, and delete their own timeboxes

### Authentication

- All API endpoints require a valid Supabase session
- Sessions are managed via secure HTTP-only cookies
- OAuth tokens are exchanged for sessions via the `/auth/callback` endpoint
- Sessions automatically refresh when needed via middleware

### Data Privacy

- User data is isolated via RLS policies
- Email addresses are only visible to the account owner
- No cross-user data access is possible via the API

## Support

For issues, questions, or feature requests, please contact the development team or create an issue in the project repository.
