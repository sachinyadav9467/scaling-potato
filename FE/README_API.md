# API Integration Guide

This document describes how the frontend integrates with the backend API.

## Setup

1. Create a `.env` file in the FE directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

For production:
```env
VITE_API_BASE_URL=https://api.dailylearningtracker.com/v1
```

## Authentication

The app uses JWT-based authentication:
- Access tokens are stored in localStorage
- Tokens are automatically refreshed when expired
- Users are redirected to login if authentication fails

## API Service Layer

All API calls are handled through `src/services/api.js` which provides:
- `authAPI` - Authentication endpoints
- `coursesAPI` - Course management
- `assignmentsAPI` - Assignment management
- `submissionsAPI` - Submission handling
- `metricsAPI` - Metrics and analytics
- `usersAPI` - User profile management

## Context Integration

The `AppContext` (`src/context/AppContext.jsx`) manages:
- User authentication state
- Courses, assignments, and submissions data
- Loading and error states
- API operations (CRUD)

## Protected Routes

All main routes are protected by the `ProtectedRoute` component which:
- Checks authentication status
- Shows loading state
- Redirects to login if not authenticated

## Error Handling

API errors are handled at multiple levels:
1. API service layer catches network errors
2. Context layer handles API response errors
3. Components display user-friendly error messages

## Data Flow

1. User action triggers API call through context
2. Context calls appropriate API service method
3. API service makes HTTP request with authentication
4. Response is processed and state is updated
5. Components re-render with new data

## File Uploads

File uploads use `submissionsAPI.uploadFile()` which:
- Uses FormData for multipart uploads
- Returns file URL for storage
- Handles upload progress (can be extended)

## Notes

- All dates are in `YYYY-MM-DD` format
- All API responses follow the contract in `API_CONTRACT.md`
- The app gracefully falls back to client-side filtering if API fails
