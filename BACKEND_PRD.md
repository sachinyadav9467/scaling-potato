# Product Requirements Document (PRD)
## Daily Learning Tracker - Backend System

**Version:** 1.0.0  
**Date:** 2024  
**Status:** Draft

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Stories](#user-stories)
4. [Functional Requirements](#functional-requirements)
5. [Technical Requirements](#technical-requirements)
6. [Data Models & Database Schema](#data-models--database-schema)
7. [Business Logic](#business-logic)
8. [API Endpoints Summary](#api-endpoints-summary)
9. [Security Requirements](#security-requirements)
10. [Performance Requirements](#performance-requirements)
11. [Non-Functional Requirements](#non-functional-requirements)
12. [Implementation Phases](#implementation-phases)

---

## Executive Summary

The Daily Learning Tracker Backend is a RESTful API service that powers a learning management application. It enables students and tutors to manage courses, assignments, submissions, and track learning progress through comprehensive metrics and analytics.

### Key Objectives
- Provide secure, scalable API endpoints for course and assignment management
- Support role-based access control (Student and Tutor)
- Implement complex scheduling logic for recurring assignments
- Deliver real-time metrics and analytics
- Ensure data integrity and consistency

---

## Product Overview

### Purpose
The backend system serves as the data layer and business logic engine for the Daily Learning Tracker application, handling all CRUD operations, authentication, authorization, and complex calculations for metrics.

### Target Users
- **Students**: Primary users who track assignments and submit work
- **Tutors**: Users who create courses, assign tasks, and provide feedback

### Core Features
1. User authentication and authorization
2. Course management (CRUD operations)
3. Assignment management with scheduling
4. Submission handling
5. Metrics and analytics calculation
6. File upload and storage

---

## User Stories

### Authentication & Authorization
- **US-1**: As a user, I want to register with email and password so I can access the system
- **US-2**: As a user, I want to login so I can access my courses and assignments
- **US-3**: As a user, I want my session to persist so I don't have to login repeatedly
- **US-4**: As a system, I want to validate user permissions so only authorized users can perform actions

### Course Management
- **US-5**: As a tutor, I want to create courses with start/end dates so I can organize learning content
- **US-6**: As a tutor, I want to add video URLs and attachments to courses so students can access resources
- **US-7**: As a user, I want to view all my courses so I can see what I'm enrolled in
- **US-8**: As a tutor, I want to update course details so I can keep information current
- **US-9**: As a tutor, I want to delete courses so I can remove outdated content
- **US-10**: As a system, I want to delete all assignments when a course is deleted to maintain data integrity

### Assignment Management
- **US-11**: As a tutor, I want to create assignments with different types (one-time, daily, weekly, monthly) so I can schedule various tasks
- **US-12**: As a tutor, I want to set due dates for assignments so students know deadlines
- **US-13**: As a user, I want to view assignments for a specific date so I can plan my day
- **US-14**: As a system, I want to automatically generate recurring assignments based on schedule rules
- **US-15**: As a tutor, I want to update assignment status and provide feedback so students can improve
- **US-16**: As a tutor, I want to assign scores to submissions so I can grade work

### Submission Management
- **US-17**: As a student, I want to submit assignments in different formats (text, file, link) so I can provide work flexibly
- **US-18**: As a student, I want to update my submissions so I can make corrections
- **US-19**: As a student, I want to track my submission status so I know what's been reviewed
- **US-20**: As a tutor, I want to view all submissions for an assignment so I can review work

### Metrics & Analytics
- **US-21**: As a user, I want to see daily metrics so I can track my progress
- **US-22**: As a user, I want to see weekly workload distribution so I can plan better
- **US-23**: As a user, I want to see monthly analytics so I can understand long-term trends
- **US-24**: As a user, I want to see course difficulty metrics so I can identify challenging areas

---

## Functional Requirements

### FR-1: Authentication System
- **FR-1.1**: Implement JWT-based authentication
- **FR-1.2**: Support user registration with email validation
- **FR-1.3**: Support password hashing (bcrypt with salt rounds ≥ 10)
- **FR-1.4**: Implement token refresh mechanism
- **FR-1.5**: Token expiration: Access token (15 minutes), Refresh token (7 days)
- **FR-1.6**: Implement logout functionality (token blacklisting)

### FR-2: Course Management
- **FR-2.1**: CRUD operations for courses
- **FR-2.2**: Validate course dates (endDate > startDate)
- **FR-2.3**: Support multiple video URLs and attachments per course
- **FR-2.4**: Cascade delete: Delete all assignments when course is deleted
- **FR-2.5**: Validate course ownership (only creator can modify/delete)
- **FR-2.6**: Support course color and icon customization

### FR-3: Assignment Management
- **FR-3.1**: CRUD operations for assignments
- **FR-3.2**: Support four assignment types:
  - **One-time**: Single occurrence between assignedDate and dueDate
  - **Daily**: Appears every day between assignedDate and dueDate
  - **Weekly**: Appears on specified days of week (scheduleRule.daysOfWeek)
  - **Monthly**: Appears on same day of month between assignedDate and dueDate
- **FR-3.3**: Validate assignment dates (dueDate ≥ assignedDate)
- **FR-3.4**: Support schedule rules for weekly assignments (daysOfWeek: 0-6)
- **FR-3.5**: Auto-generate assignment instances for recurring types
- **FR-3.6**: Support assignment status workflow: not_started → in_progress → submitted → reviewed
- **FR-3.7**: Support feedback and scoring (0-100) for reviewed assignments
- **FR-3.8**: Filter assignments by date, course, status, type

### FR-4: Submission Management
- **FR-4.1**: CRUD operations for submissions
- **FR-4.2**: Support three submission types: text, file, link
- **FR-4.3**: Validate submission type matches assignment submissionType
- **FR-4.4**: Link submissions to assignments and dates
- **FR-4.5**: Update assignment status to "submitted" when submission is created
- **FR-4.6**: Support file upload with size limits (max 10MB per file)
- **FR-4.7**: Store file URLs in cloud storage (S3, Azure Blob, etc.)

### FR-5: Metrics Calculation
- **FR-5.1**: Calculate daily metrics:
  - Total assignments
  - Completed assignments
  - Pending assignments
  - Overdue assignments
  - Completion rate percentage
- **FR-5.2**: Calculate weekly metrics:
  - All daily metrics aggregated
  - Course workload distribution
- **FR-5.3**: Calculate monthly metrics:
  - All daily metrics aggregated
  - Consistency score
  - Course difficulty index (based on completion rate and delay rate)
- **FR-5.4**: Support custom date range metrics
- **FR-5.5**: Cache metrics for performance (TTL: 5 minutes)

### FR-6: Data Validation
- **FR-6.1**: Validate all input data (required fields, formats, ranges)
- **FR-6.2**: Validate date formats (YYYY-MM-DD)
- **FR-6.3**: Validate email formats
- **FR-6.4**: Validate color codes (hex format)
- **FR-6.5**: Validate score ranges (0-100)
- **FR-6.6**: Validate file types and sizes

---

## Technical Requirements

### TR-1: Technology Stack
- **Programming Language**: Node.js (v18+) or Python (v3.10+)
- **Framework**: Express.js (Node.js) or FastAPI (Python)
- **Database**: PostgreSQL (v14+) for primary data
- **Cache**: Redis for session management and caching
- **File Storage**: AWS S3, Azure Blob Storage, or similar
- **ORM/ODM**: Prisma (Node.js) or SQLAlchemy (Python)

### TR-2: Database Requirements
- **TR-2.1**: Use relational database (PostgreSQL)
- **TR-2.2**: Implement proper indexing:
  - Index on userId, courseId, assignmentId, date fields
  - Composite indexes for common queries
- **TR-2.3**: Use foreign keys with cascade delete where appropriate
- **TR-2.4**: Implement database migrations
- **TR-2.5**: Use connection pooling

### TR-3: API Requirements
- **TR-3.1**: RESTful API design
- **TR-3.2**: JSON request/response format
- **TR-3.3**: Support pagination (default: 50 items, max: 100)
- **TR-3.4**: Implement rate limiting (100 requests/minute per user)
- **TR-3.5**: Support CORS for frontend integration
- **TR-3.6**: API versioning (v1, v2, etc.)

### TR-4: Security Requirements
- **TR-4.1**: HTTPS only in production
- **TR-4.2**: JWT token signing with RS256 or HS256
- **TR-4.3**: Password hashing with bcrypt (salt rounds ≥ 10)
- **TR-4.4**: Input sanitization to prevent SQL injection
- **TR-4.5**: XSS protection
- **TR-4.6**: CSRF protection
- **TR-4.7**: Role-based access control (RBAC)

### TR-5: Performance Requirements
- **TR-5.1**: API response time < 200ms (p95)
- **TR-5.2**: Support concurrent users: 1000+
- **TR-5.3**: Database query optimization
- **TR-5.4**: Implement caching for metrics (Redis)
- **TR-5.5**: Async file upload processing

### TR-6: Monitoring & Logging
- **TR-6.1**: Log all API requests and responses
- **TR-6.2**: Log errors with stack traces
- **TR-6.3**: Monitor API performance metrics
- **TR-6.4**: Alert on errors (error rate > 1%)
- **TR-6.5**: Track user activity

---

## Data Models & Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'tutor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Courses Table
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color
    icon VARCHAR(10) NOT NULL, -- Emoji
    tutor VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    video_urls JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date > start_date)
);

CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_dates ON courses(start_date, end_date);
```

### Assignments Table
```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('one-time', 'daily', 'weekly', 'monthly')),
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('text', 'file', 'link')),
    status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'reviewed')),
    schedule_rule JSONB, -- {daysOfWeek: [1,3,5]} for weekly type
    feedback TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (due_date >= assigned_date)
);

CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_dates ON assignments(assigned_date, due_date);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_type ON assignments(type);
```

### Submissions Table
```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT, -- For text submissions
    file_url VARCHAR(500), -- For file submissions
    link_url VARCHAR(500), -- For link submissions
    submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('text', 'file', 'link')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, date, user_id)
);

CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_date ON submissions(date);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

---

## Business Logic

### BL-1: Assignment Scheduling Logic

#### One-time Assignment
- Appears on all dates between `assignedDate` and `dueDate` (inclusive)
- Single instance, no recurrence

#### Daily Assignment
- Appears on every day between `assignedDate` and `dueDate` (inclusive)
- No schedule rules needed

#### Weekly Assignment
- Appears only on days specified in `scheduleRule.daysOfWeek`
- Days: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
- Must fall between `assignedDate` and `dueDate`
- Example: `daysOfWeek: [1, 3, 5]` = Monday, Wednesday, Friday

#### Monthly Assignment
- Appears on the same day of month as `assignedDate`
- Only if that date falls between `assignedDate` and `dueDate`
- Example: If assignedDate is 2024-01-15, appears on 15th of each month

### BL-2: Assignment Status Workflow
1. **not_started** → Initial state when assignment is created
2. **in_progress** → When student starts working (can be set manually or when submission draft is saved)
3. **submitted** → When student submits work (automatic when submission is created)
4. **reviewed** → When tutor provides feedback/score

### BL-3: Metrics Calculation Logic

#### Daily Metrics
```
total = count(assignments for date)
completed = count(assignments with status 'submitted' or 'reviewed')
pending = total - completed
overdue = count(assignments where dueDate < today AND status != 'submitted' AND status != 'reviewed')
completionRate = (completed / total) * 100
```

#### Weekly Metrics
- Aggregate all daily metrics for the week
- Calculate course workload: count assignments per courseId

#### Monthly Metrics
- Aggregate all daily metrics for the month
- Calculate consistency score: (totalCompleted / totalAssignments) * 100
- Calculate course difficulty:
  - completionRate = (completed / total) * 100
  - delayRate = (delayed / total) * 100
  - difficulty = 'high' if delayRate > 30, 'medium' if delayRate > 10, 'low' otherwise

### BL-4: Cascade Delete Rules
- When a course is deleted → Delete all associated assignments
- When an assignment is deleted → Delete all associated submissions
- When a user is deleted → Delete all associated courses, assignments, and submissions

### BL-5: File Upload Logic
- Accept file uploads via multipart/form-data
- Validate file type and size (max 10MB)
- Upload to cloud storage (S3/Azure Blob)
- Return file URL for storage in database
- Support file deletion when submission is deleted

---

## API Endpoints Summary

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (blacklist token)

### Courses
- `GET /courses` - List all courses
- `GET /courses/{id}` - Get course by ID
- `POST /courses` - Create course
- `PATCH /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course

### Assignments
- `GET /assignments` - List assignments (with filters)
- `GET /assignments/{id}` - Get assignment by ID
- `GET /assignments/date/{date}` - Get assignments for date
- `POST /assignments` - Create assignment
- `PATCH /assignments/{id}` - Update assignment
- `DELETE /assignments/{id}` - Delete assignment

### Submissions
- `GET /submissions` - List submissions (with filters)
- `GET /submissions/{id}` - Get submission by ID
- `POST /submissions` - Create submission
- `PATCH /submissions/{id}` - Update submission
- `DELETE /submissions/{id}` - Delete submission
- `POST /submissions/upload` - Upload file for submission

### Metrics
- `GET /metrics/daily/{date}` - Daily metrics
- `GET /metrics/weekly/{date}` - Weekly metrics
- `GET /metrics/monthly/{year}/{month}` - Monthly metrics
- `GET /metrics/range` - Custom range metrics

### Users
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update user profile

---

## Security Requirements

### SEC-1: Authentication
- Use JWT with RS256 or HS256 algorithm
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days
- Store refresh tokens in database
- Implement token blacklisting for logout

### SEC-2: Authorization
- Role-based access control (RBAC)
- Students can only modify their own submissions
- Tutors can create/modify/delete courses and assignments
- Validate resource ownership before modifications

### SEC-3: Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement input validation and sanitization
- Prevent SQL injection, XSS, CSRF attacks

### SEC-4: File Security
- Validate file types (whitelist approach)
- Scan files for malware
- Limit file size (10MB max)
- Store files in private buckets with signed URLs

---

## Performance Requirements

### PERF-1: Response Times
- API response time: < 200ms (p95)
- Database query time: < 50ms (p95)
- File upload processing: < 2s

### PERF-2: Scalability
- Support 1000+ concurrent users
- Handle 10,000+ requests per minute
- Database connection pooling (min: 10, max: 100)

### PERF-3: Caching
- Cache metrics for 5 minutes
- Cache user sessions in Redis
- Cache frequently accessed courses/assignments

---

## Non-Functional Requirements

### NFR-1: Reliability
- Uptime: 99.9% (8.76 hours downtime/year)
- Database backup: Daily automated backups
- Disaster recovery: RTO < 4 hours, RPO < 1 hour

### NFR-2: Maintainability
- Code documentation
- API documentation (OpenAPI/Swagger)
- Database migration scripts
- Logging and monitoring

### NFR-3: Testability
- Unit test coverage: ≥ 80%
- Integration test coverage: ≥ 70%
- API endpoint testing
- Load testing

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Database setup and schema
- Authentication system
- Basic CRUD for courses
- Basic CRUD for assignments

### Phase 2: Core Features (Week 3-4)
- Assignment scheduling logic
- Submission management
- File upload functionality
- Basic metrics calculation

### Phase 3: Advanced Features (Week 5-6)
- Advanced metrics (weekly, monthly, custom range)
- Caching implementation
- Performance optimization
- Security hardening

### Phase 4: Testing & Deployment (Week 7-8)
- Comprehensive testing
- Load testing
- Documentation
- Deployment and monitoring setup

---

## Success Criteria

1. ✅ All API endpoints implemented and tested
2. ✅ Authentication and authorization working correctly
3. ✅ Assignment scheduling logic working for all types
4. ✅ Metrics calculations accurate
5. ✅ Performance meets requirements (< 200ms p95)
6. ✅ Security requirements met
7. ✅ Documentation complete
8. ✅ System deployed and monitored

---

## Appendix

### A. Glossary
- **Assignment**: A task assigned to a student with a due date
- **Course**: A collection of assignments and learning resources
- **Submission**: Student's work submitted for an assignment
- **Metrics**: Calculated statistics about assignments and progress
- **Schedule Rule**: Configuration for recurring assignments

### B. References
- [API Contract Document](./API_CONTRACT.md)
- Frontend Application Repository
- JWT Best Practices
- RESTful API Design Guidelines

---

**Document Status**: Draft - Ready for Review  
**Next Review Date**: TBD  
**Owner**: Backend Development Team
