# API Contract Document
## Daily Learning Tracker - Backend API Specification

**Version:** 1.0.0  
**Base URL:** `https://api.dailylearningtracker.com/v1`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Courses API](#courses-api)
3. [Assignments API](#assignments-api)
4. [Submissions API](#submissions-api)
5. [Metrics API](#metrics-api)
6. [User Management](#user-management)
7. [Error Handling](#error-handling)
8. [Data Models](#data-models)

---

## Authentication

### Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response (200 OK):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "student" | "tutor"
  }
}
```

### Register
**POST** `/auth/register`

Request Body:
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "student" | "tutor"
}
```

Response (201 Created):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "student" | "tutor"
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

Request Body:
```json
{
  "refreshToken": "string"
}
```

Response (200 OK):
```json
{
  "token": "new_jwt_token_here"
}
```

---

## Courses API

### Get All Courses
**GET** `/courses`

Headers:
- `Authorization: Bearer {token}`

Query Parameters:
- `userId` (optional): Filter courses by user ID

Response (200 OK):
```json
{
  "courses": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "icon": "string",
      "tutor": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "videoUrls": ["string"],
      "attachments": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "total": "number"
}
```

### Get Course by ID
**GET** `/courses/{courseId}`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "id": "string",
  "name": "string",
  "color": "string",
  "icon": "string",
  "tutor": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "videoUrls": ["string"],
  "attachments": ["string"],
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Create Course
**POST** `/courses`

Headers:
- `Authorization: Bearer {token}`

Request Body:
```json
{
  "name": "string (required)",
  "color": "string (required, hex color)",
  "icon": "string (required, emoji)",
  "tutor": "string (required)",
  "startDate": "YYYY-MM-DD (required)",
  "endDate": "YYYY-MM-DD (required)",
  "videoUrls": ["string"] (optional),
  "attachments": ["string"] (optional)
}
```

Response (201 Created):
```json
{
  "id": "string",
  "name": "string",
  "color": "string",
  "icon": "string",
  "tutor": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "videoUrls": ["string"],
  "attachments": ["string"],
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Update Course
**PATCH** `/courses/{courseId}`

Headers:
- `Authorization: Bearer {token}`

Request Body (all fields optional):
```json
{
  "name": "string",
  "color": "string",
  "icon": "string",
  "tutor": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "videoUrls": ["string"],
  "attachments": ["string"]
}
```

Response (200 OK):
```json
{
  "id": "string",
  "name": "string",
  "color": "string",
  "icon": "string",
  "tutor": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "videoUrls": ["string"],
  "attachments": ["string"],
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Delete Course
**DELETE** `/courses/{courseId}`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "message": "Course deleted successfully",
  "deletedAssignmentsCount": "number"
}
```

---

## Assignments API

### Get All Assignments
**GET** `/assignments`

Headers:
- `Authorization: Bearer {token}`

Query Parameters:
- `courseId` (optional): Filter by course ID
- `status` (optional): Filter by status (`not_started`, `in_progress`, `submitted`, `reviewed`)
- `type` (optional): Filter by type (`one-time`, `daily`, `weekly`, `monthly`)
- `date` (optional): Get assignments for specific date (YYYY-MM-DD)
- `startDate` (optional): Filter assignments starting from date
- `endDate` (optional): Filter assignments ending before date
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

Response (200 OK):
```json
{
  "assignments": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "courseId": "string",
      "type": "one-time" | "daily" | "weekly" | "monthly",
      "assignedDate": "YYYY-MM-DD",
      "dueDate": "YYYY-MM-DD",
      "submissionType": "text" | "file" | "link",
      "status": "not_started" | "in_progress" | "submitted" | "reviewed",
      "scheduleRule": {
        "daysOfWeek": [1, 3, 5]
      } | null,
      "feedback": "string" | null,
      "score": "number" | null,
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

### Get Assignment by ID
**GET** `/assignments/{assignmentId}`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "courseId": "string",
  "type": "one-time" | "daily" | "weekly" | "monthly",
  "assignedDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "submissionType": "text" | "file" | "link",
  "status": "not_started" | "in_progress" | "submitted" | "reviewed",
  "scheduleRule": {
    "daysOfWeek": [1, 3, 5]
  } | null,
  "feedback": "string" | null,
  "score": "number" | null,
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Get Assignments for Date
**GET** `/assignments/date/{date}`

Headers:
- `Authorization: Bearer {token}`

Path Parameters:
- `date`: Date in YYYY-MM-DD format

Response (200 OK):
```json
{
  "date": "YYYY-MM-DD",
  "assignments": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "courseId": "string",
      "type": "one-time" | "daily" | "weekly" | "monthly",
      "assignedDate": "YYYY-MM-DD",
      "dueDate": "YYYY-MM-DD",
      "submissionType": "text" | "file" | "link",
      "status": "not_started" | "in_progress" | "submitted" | "reviewed",
      "scheduleRule": {
        "daysOfWeek": [1, 3, 5]
      } | null,
      "feedback": "string" | null,
      "score": "number" | null
    }
  ],
  "total": "number"
}
```

### Create Assignment
**POST** `/assignments`

Headers:
- `Authorization: Bearer {token}`

Request Body:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "courseId": "string (required)",
  "type": "one-time" | "daily" | "weekly" | "monthly (required)",
  "assignedDate": "YYYY-MM-DD (required)",
  "dueDate": "YYYY-MM-DD (required)",
  "submissionType": "text" | "file" | "link (required)",
  "scheduleRule": {
    "daysOfWeek": [1, 3, 5]
  } (required for weekly type, optional for others)
}
```

Response (201 Created):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "courseId": "string",
  "type": "one-time" | "daily" | "weekly" | "monthly",
  "assignedDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "submissionType": "text" | "file" | "link",
  "status": "not_started",
  "scheduleRule": {
    "daysOfWeek": [1, 3, 5]
  } | null,
  "feedback": null,
  "score": null,
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Update Assignment
**PATCH** `/assignments/{assignmentId}`

Headers:
- `Authorization: Bearer {token}`

Request Body (all fields optional):
```json
{
  "title": "string",
  "description": "string",
  "status": "not_started" | "in_progress" | "submitted" | "reviewed",
  "dueDate": "YYYY-MM-DD",
  "feedback": "string",
  "score": "number"
}
```

Response (200 OK):
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "courseId": "string",
  "type": "one-time" | "daily" | "weekly" | "monthly",
  "assignedDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "submissionType": "text" | "file" | "link",
  "status": "not_started" | "in_progress" | "submitted" | "reviewed",
  "scheduleRule": {
    "daysOfWeek": [1, 3, 5]
  } | null,
  "feedback": "string" | null,
  "score": "number" | null,
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Delete Assignment
**DELETE** `/assignments/{assignmentId}`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "message": "Assignment deleted successfully"
}
```

---

## Submissions API

### Get Submissions
**GET** `/submissions`

Headers:
- `Authorization: Bearer {token}`

Query Parameters:
- `assignmentId` (optional): Filter by assignment ID
- `date` (optional): Filter by submission date (YYYY-MM-DD)
- `page` (optional): Page number
- `limit` (optional): Items per page

Response (200 OK):
```json
{
  "submissions": [
    {
      "id": "string",
      "assignmentId": "string",
      "date": "YYYY-MM-DD",
      "content": "string",
      "fileUrl": "string" | null,
      "linkUrl": "string" | null,
      "submissionType": "text" | "file" | "link",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

### Get Submission by ID
**GET** `/submissions/{submissionId}`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "id": "string",
  "assignmentId": "string",
  "date": "YYYY-MM-DD",
  "content": "string",
  "fileUrl": "string" | null,
  "linkUrl": "string" | null,
  "submissionType": "text" | "file" | "link",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Create Submission
**POST** `/submissions`

Headers:
- `Authorization: Bearer {token}`

Request Body:
```json
{
  "assignmentId": "string (required)",
  "date": "YYYY-MM-DD (required)",
  "content": "string (required for text type)",
  "fileUrl": "string (required for file type)",
  "linkUrl": "string (required for link type)",
  "submissionType": "text" | "file" | "link (required)"
}
```

Response (201 Created):
```json
{
  "id": "string",
  "assignmentId": "string",
  "date": "YYYY-MM-DD",
  "content": "string",
  "fileUrl": "string" | null,
  "linkUrl": "string" | null,
  "submissionType": "text" | "file" | "link",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Update Submission
**PATCH** `/submissions/{submissionId}`

Headers:
- `Authorization: Bearer {token}`

Request Body (all fields optional):
```json
{
  "content": "string",
  "fileUrl": "string",
  "linkUrl": "string"
}
```

Response (200 OK):
```json
{
  "id": "string",
  "assignmentId": "string",
  "date": "YYYY-MM-DD",
  "content": "string",
  "fileUrl": "string" | null,
  "linkUrl": "string" | null,
  "submissionType": "text" | "file" | "link",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Delete Submission
**DELETE** `/submissions/{submissionId}`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "message": "Submission deleted successfully"
}
```

---

## Metrics API

### Get Daily Metrics
**GET** `/metrics/daily/{date}`

Headers:
- `Authorization: Bearer {token}`

Path Parameters:
- `date`: Date in YYYY-MM-DD format

Response (200 OK):
```json
{
  "date": "YYYY-MM-DD",
  "total": "number",
  "completed": "number",
  "pending": "number",
  "overdue": "number",
  "completionRate": "number (percentage)"
}
```

### Get Weekly Metrics
**GET** `/metrics/weekly/{date}`

Headers:
- `Authorization: Bearer {token}`

Path Parameters:
- `date`: Any date in the week (YYYY-MM-DD format)

Response (200 OK):
```json
{
  "weekStart": "YYYY-MM-DD",
  "weekEnd": "YYYY-MM-DD",
  "total": "number",
  "completed": "number",
  "pending": "number",
  "overdue": "number",
  "completionRate": "number (percentage)",
  "courseWorkload": {
    "courseId": "number of assignments"
  }
}
```

### Get Monthly Metrics
**GET** `/metrics/monthly/{year}/{month}`

Headers:
- `Authorization: Bearer {token}`

Path Parameters:
- `year`: Year (YYYY)
- `month`: Month (1-12)

Response (200 OK):
```json
{
  "year": "number",
  "month": "number",
  "total": "number",
  "completed": "number",
  "consistencyScore": "number (percentage)",
  "courseDifficulty": {
    "courseId": {
      "completionRate": "number (percentage)",
      "delayRate": "number (percentage)",
      "difficulty": "low" | "medium" | "high"
    }
  }
}
```

### Get Custom Range Metrics
**GET** `/metrics/range`

Headers:
- `Authorization: Bearer {token}`

Query Parameters:
- `startDate`: Start date (YYYY-MM-DD, required)
- `endDate`: End date (YYYY-MM-DD, required)
- `courseId`: Filter by course ID (optional)

Response (200 OK):
```json
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "total": "number",
  "completed": "number",
  "pending": "number",
  "completionRate": "number (percentage)"
}
```

---

## User Management

### Get Current User
**GET** `/users/me`

Headers:
- `Authorization: Bearer {token}`

Response (200 OK):
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "student" | "tutor",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Update User Profile
**PATCH** `/users/me`

Headers:
- `Authorization: Bearer {token}`

Request Body (all fields optional):
```json
{
  "name": "string",
  "email": "string"
}
```

Response (200 OK):
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "student" | "tutor",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} (optional, additional error details)
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PATCH, DELETE requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission for the action
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Error Codes

- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid authentication token
- `AUTH_EXPIRED`: Authentication token expired
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `COURSE_NOT_FOUND`: Course not found
- `ASSIGNMENT_NOT_FOUND`: Assignment not found
- `SUBMISSION_NOT_FOUND`: Submission not found
- `INVALID_DATE`: Invalid date format
- `INVALID_DATE_RANGE`: Invalid date range
- `DUPLICATE_RESOURCE`: Resource already exists
- `SERVER_ERROR`: Internal server error

### Example Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "title": ["Title is required"],
        "dueDate": ["Due date must be after assigned date"]
      }
    }
  }
}
```

---

## Data Models

### Course Model
```typescript
interface Course {
  id: string;
  name: string;
  color: string; // Hex color code
  icon: string; // Emoji
  tutor: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  videoUrls: string[];
  attachments: string[];
  userId: string; // Owner of the course
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Assignment Model
```typescript
interface Assignment {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  type: 'one-time' | 'daily' | 'weekly' | 'monthly';
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  submissionType: 'text' | 'file' | 'link';
  status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed';
  scheduleRule: {
    daysOfWeek: number[]; // 0-6, 0 = Sunday
  } | null;
  feedback: string | null;
  score: number | null; // 0-100
  userId: string; // Creator of the assignment
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Submission Model
```typescript
interface Submission {
  id: string;
  assignmentId: string;
  date: string; // YYYY-MM-DD
  content: string | null; // For text submissions
  fileUrl: string | null; // For file submissions
  linkUrl: string | null; // For link submissions
  submissionType: 'text' | 'file' | 'link';
  userId: string; // Submitter
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per user
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

---

## Pagination

All list endpoints support pagination using query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## Notes

1. All dates should be in `YYYY-MM-DD` format
2. All datetime fields should be in ISO 8601 format
3. All IDs are UUIDs (string format)
4. All endpoints require authentication unless specified otherwise
5. File uploads should use multipart/form-data and return a file URL
6. The backend should handle assignment scheduling logic (daily, weekly, monthly)
7. When a course is deleted, all associated assignments should be deleted (cascade delete)
8. When an assignment is deleted, associated submissions should be deleted (cascade delete)
