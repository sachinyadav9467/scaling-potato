import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import assignmentsRoutes from './routes/assignments.js';
import submissionsRoutes from './routes/submissions.js';
import metricsRoutes from './routes/metrics.js';
import usersRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import videosRoutes from './routes/videos.js';
import videoNotesRoutes from './routes/videoNotes.js';
import videoNotesDeleteRoutes from './routes/videoNotesDelete.js';
import assignmentNotesRoutes from './routes/assignmentNotes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (in production, use cloud storage)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to API routes
app.use('/api/v1', limiter);

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info endpoint for debugging
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Daily Learning Tracker API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      courses: '/api/v1/courses',
      assignments: '/api/v1/assignments',
      submissions: '/api/v1/submissions',
      videos: '/api/v1/videos',
      metrics: '/api/v1/metrics',
      users: '/api/v1/users'
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
// Note: More specific routes should be mounted before less specific ones
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/assignments', assignmentsRoutes);
app.use('/api/v1/assignments', assignmentNotesRoutes); // Assignment notes routes (uses /assignments/:assignmentId/notes)
app.use('/api/v1/submissions/upload', uploadRoutes); // Mount before /submissions
app.use('/api/v1/submissions', submissionsRoutes);
app.use('/api/v1/videos', videosRoutes);
app.use('/api/v1/videos', videoNotesRoutes); // Video notes routes (uses /videos/:videoId/notes)
app.use('/api/v1/video-notes', videoNotesDeleteRoutes); // Delete note route (uses /video-notes/:noteId)
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/users', usersRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
