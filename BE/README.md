# Daily Learning Tracker - Backend API

Backend API server for the Daily Learning Tracker application, built with Node.js, Express, and PostgreSQL.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 📚 Course management (CRUD operations)
- 📝 Assignment management with scheduling (one-time, daily, weekly, monthly)
- 📤 Submission handling (text, file, link)
- 📊 Metrics and analytics (daily, weekly, monthly, custom range)
- 👤 User profile management
- 🛡️ Rate limiting and security middleware
- ✅ Input validation and error handling

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `CORS_ORIGIN`: Frontend URL for CORS

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create course
- `PATCH /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Delete course

### Assignments
- `GET /api/v1/assignments` - Get assignments (with filters)
- `GET /api/v1/assignments/:id` - Get assignment by ID
- `GET /api/v1/assignments/date/:date` - Get assignments for date
- `POST /api/v1/assignments` - Create assignment
- `PATCH /api/v1/assignments/:id` - Update assignment
- `DELETE /api/v1/assignments/:id` - Delete assignment

### Submissions
- `GET /api/v1/submissions` - Get submissions (with filters)
- `GET /api/v1/submissions/:id` - Get submission by ID
- `POST /api/v1/submissions` - Create submission
- `PATCH /api/v1/submissions/:id` - Update submission
- `DELETE /api/v1/submissions/:id` - Delete submission

### Metrics
- `GET /api/v1/metrics/daily/:date` - Get daily metrics
- `GET /api/v1/metrics/weekly/:date` - Get weekly metrics
- `GET /api/v1/metrics/monthly/:year/:month` - Get monthly metrics
- `GET /api/v1/metrics/range` - Get custom range metrics

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update user profile

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:

- **User**: User accounts with roles (student/tutor)
- **Course**: Learning courses with start/end dates
- **Assignment**: Tasks with scheduling rules
- **Submission**: Student submissions for assignments
- **RefreshToken**: JWT refresh tokens

## Project Structure

```
BE/
├── src/
│   ├── config/
│   │   └── database.js          # Prisma client configuration
│   ├── middleware/
│   │   ├── auth.js               # Authentication middleware
│   │   └── errorHandler.js       # Error handling middleware
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── courses.js            # Course routes
│   │   ├── assignments.js        # Assignment routes
│   │   ├── submissions.js        # Submission routes
│   │   ├── metrics.js            # Metrics routes
│   │   └── users.js              # User routes
│   ├── services/
│   │   ├── assignmentService.js  # Assignment business logic
│   │   └── metricsService.js     # Metrics calculation logic
│   ├── utils/
│   │   ├── jwt.js                # JWT utilities
│   │   ├── validation.js         # Validation middleware
│   │   └── dateUtils.js          # Date utility functions
│   └── server.js                 # Main server file
├── prisma/
│   └── schema.prisma             # Database schema
├── .env.example                  # Environment variables example
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Security Features

- JWT authentication with access and refresh tokens
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting (100 requests/minute)
- Input validation and sanitization
- CORS configuration
- Error handling with proper status codes

## Development

### Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Testing

Health check endpoint:
```bash
curl http://localhost:3000/health
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

ISC
