import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';
import { body, param, query } from 'express-validator';
import { formatDate } from '../utils/dateUtils.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation helpers
const validateVideoId = validate([param('videoId').isUUID().withMessage('Invalid video ID')]);
const validateCreateVideo = validate([
  body('courseId').isUUID().withMessage('Valid course ID is required'),
  body('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
  body('title').notEmpty().withMessage('Title is required'),
  body('videoUrl').notEmpty().withMessage('Video URL is required'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer')
]);
const validateUpdateVideo = validate([
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('videoUrl').optional().notEmpty().withMessage('Video URL cannot be empty'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer')
]);

// Get all videos with filters
router.get('/', async (req, res, next) => {
  try {
    const { courseId, date, page = 1, limit = 50 } = req.query;
    const { id: userId, role } = req.user;

    const where = {};
    if (courseId) where.courseId = courseId;
    
    // Date filtering - handle timezone properly by parsing date string directly
    if (date) {
      // Parse date string (YYYY-MM-DD) directly to avoid timezone issues
      const [year, month, day] = date.split('-').map(Number);
      // Create date in UTC to avoid timezone shifts
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
      where.date = {
        gte: startOfDay,
        lt: endOfDay
      };
    }

    // Role-based filtering
    if (role === 'tutor') {
      // Tutors see videos from courses they own
      where.course = {
        userId: userId
      };
    }
    // Students see all videos (no additional filter needed)

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              userId: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          _count: {
            select: { notes: true }
          }
        }
      }),
      prisma.video.count({ where })
    ]);

    res.json({
      videos: videos.map(video => ({
        id: video.id,
        courseId: video.courseId,
        date: formatDate(video.date),
        title: video.title,
        videoUrl: video.videoUrl,
        duration: video.duration,
        watched: video.watched,
        watchedAt: video.watchedAt ? video.watchedAt.toISOString() : null,
        notesCount: video._count.notes,
        course: video.course,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString()
      })),
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get videos for a specific date
router.get('/date/:date', validate([param('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format')]), async (req, res, next) => {
  try {
    const { date } = req.params;
    const { id: userId, role } = req.user;

    // Date filtering - handle timezone properly by parsing date string directly
    // Parse date string (YYYY-MM-DD) directly to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    // Create date in UTC to avoid timezone shifts
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
    
    const where = {
      date: {
        gte: startOfDay,
        lt: endOfDay
      }
    };

    // Role-based filtering
    if (role === 'tutor') {
      // Tutors see videos from courses they own
      where.course = {
        userId: userId
      };
    }
    // Students can see all videos (no additional filter needed)

    const videos = await prisma.video.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            userId: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: { notes: true }
        }
      },
      orderBy: {
        course: { name: 'asc' }
      }
    });

    res.json({
      date,
      videos: videos.map(video => ({
        id: video.id,
        courseId: video.courseId,
        userId: video.userId,
        date: formatDate(video.date),
        title: video.title,
        videoUrl: video.videoUrl,
        duration: video.duration,
        watched: video.watched,
        watchedAt: video.watchedAt ? video.watchedAt.toISOString() : null,
        notesCount: video._count.notes,
        course: video.course,
        creator: video.user,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString()
      })),
      total: videos.length
    });
  } catch (error) {
    next(error);
  }
});

// Get video by ID
router.get('/:videoId', validateVideoId, async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              userId: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          notes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found'
        }
      });
    }

    // Check permissions: Students can view all videos, Tutors can view videos from their courses
    if (req.user.role === 'tutor' && video.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this video'
        }
      });
    }

    res.json({
      id: video.id,
      courseId: video.courseId,
      date: formatDate(video.date),
      title: video.title,
      videoUrl: video.videoUrl,
      duration: video.duration,
      watched: video.watched,
      watchedAt: video.watchedAt ? video.watchedAt.toISOString() : null,
      course: video.course,
      userId: video.userId,
      creator: video.user,
      notes: video.notes.map(note => ({
        id: note.id,
        title: note.title,
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        fileSize: note.fileSize,
        userId: note.userId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      })),
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Create video - Both students and tutors can create
router.post('/', authenticate, validateCreateVideo, async (req, res, next) => {
  try {
    const { courseId, date, title, videoUrl, duration } = req.body;

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    // Role-based permission checks
    if (req.user.role === 'tutor') {
      // Tutors can only add videos to courses they own
      if (course.userId !== req.user.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to add videos to this course'
          }
        });
      }
    }
    // Students can add videos to any course (for self-study)

    // Validate date is within course date range (optional check, can be relaxed)
    const videoDate = new Date(date);
    if (course.startDate && course.endDate) {
      if (videoDate < course.startDate || videoDate > course.endDate) {
        // Warn but don't block - allow flexibility
        console.warn(`Video date ${formatDate(videoDate)} is outside course range ${formatDate(course.startDate)} - ${formatDate(course.endDate)}`);
      }
    }

    const video = await prisma.video.create({
      data: {
        courseId,
        userId: req.user.id, // Set creator as current user (tutor)
        date: videoDate,
        title,
        videoUrl,
        duration: duration || null,
        watched: false
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    res.status(201).json({
      id: video.id,
      courseId: video.courseId,
      userId: video.userId,
      date: formatDate(video.date),
      title: video.title,
      videoUrl: video.videoUrl,
      duration: video.duration,
      watched: video.watched,
      watchedAt: null,
      course: video.course,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString()
    });
  } catch (error) {
    if (error.code === 'P2002') {
      // Handle unique constraint violation (courseId, date, userId)
      return res.status(422).json({
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'You have already created a video for this course on this date. You can create videos for different dates or different courses.'
        }
      });
    }
    next(error);
  }
});

// Update video - Only tutors who own the course can update
router.patch('/:videoId', authorize('tutor'), validateVideoId, validateUpdateVideo, async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Check if video exists and user owns the course
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        course: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found'
        }
      });
    }

    // Only tutor who owns the course can update
    if (video.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this video'
        }
      });
    }

    const updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.videoUrl) updateData.videoUrl = req.body.videoUrl;
    if (req.body.duration !== undefined) updateData.duration = req.body.duration;

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    res.json({
      id: updatedVideo.id,
      courseId: updatedVideo.courseId,
      date: formatDate(updatedVideo.date),
      title: updatedVideo.title,
      videoUrl: updatedVideo.videoUrl,
      duration: updatedVideo.duration,
      watched: updatedVideo.watched,
      watchedAt: updatedVideo.watchedAt ? updatedVideo.watchedAt.toISOString() : null,
      course: updatedVideo.course,
      createdAt: updatedVideo.createdAt.toISOString(),
      updatedAt: updatedVideo.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Mark video as watched - Students and tutors can mark videos as watched
router.patch('/:videoId/watched', validateVideoId, async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            userId: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found'
        }
      });
    }

    // Both students and tutors can mark videos as watched
    // No permission check needed for watched status

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        watched: true,
        watchedAt: new Date()
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    res.json({
      id: updatedVideo.id,
      courseId: updatedVideo.courseId,
      date: formatDate(updatedVideo.date),
      title: updatedVideo.title,
      videoUrl: updatedVideo.videoUrl,
      duration: updatedVideo.duration,
      watched: updatedVideo.watched,
      watchedAt: updatedVideo.watchedAt.toISOString(),
      course: updatedVideo.course,
      createdAt: updatedVideo.createdAt.toISOString(),
      updatedAt: updatedVideo.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Delete video - Only tutors who own the course can delete
router.delete('/:videoId', authorize('tutor'), validateVideoId, async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Check if video exists and user owns the course
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        course: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found'
        }
      });
    }

    if (video.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this video'
        }
      });
    }

    await prisma.video.delete({
      where: { id: videoId }
    });

    res.json({
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
