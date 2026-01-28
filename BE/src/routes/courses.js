import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateCourse, validateUpdateCourse, validateCourseId } from '../utils/validation.js';
import { formatDate } from '../utils/dateUtils.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all courses
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { role } = req.user;

    const where = {};
    if (userId) {
      // If userId is specified, filter by that user
      where.userId = userId;
    } else {
      // Role-based filtering
      if (role === 'tutor') {
        // Tutors see only their own courses by default
        where.userId = req.user.id;
      } else if (role === 'student') {
        // Students see all courses (they need to select courses when creating videos/assignments)
        // No filter - return all courses
      }
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      courses: courses.map(course => ({
        id: course.id,
        name: course.name,
        color: course.color,
        icon: course.icon,
        tutor: course.tutor,
        startDate: formatDate(course.startDate),
        endDate: formatDate(course.endDate),
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString()
      })),
      total: courses.length
    });
  } catch (error) {
    next(error);
  }
});

// Get course by ID
router.get('/:courseId', validateCourseId, async (req, res, next) => {
  try {
    const { courseId } = req.params;

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

    res.json({
      id: course.id,
      name: course.name,
      color: course.color,
      icon: course.icon,
      tutor: course.tutor,
      startDate: formatDate(course.startDate),
      endDate: formatDate(course.endDate),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Create course
router.post('/', validateCreateCourse, async (req, res, next) => {
  try {
    const { name, color, icon, tutor, startDate, endDate } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'End date must be after start date',
          details: {
            fields: {
              endDate: ['End date must be after start date']
            }
          }
        }
      });
    }

    const course = await prisma.course.create({
      data: {
        userId: req.user.id,
        name,
        color,
        icon,
        tutor,
        startDate: start,
        endDate: end
      }
    });

    res.status(201).json({
      id: course.id,
      name: course.name,
      color: course.color,
      icon: course.icon,
      tutor: course.tutor,
      startDate: formatDate(course.startDate),
      endDate: formatDate(course.endDate),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Update course
router.patch('/:courseId', validateCourseId, validateUpdateCourse, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and user owns it
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

    if (course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this course'
        }
      });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.color) updateData.color = req.body.color;
    if (req.body.icon) updateData.icon = req.body.icon;
    if (req.body.tutor) updateData.tutor = req.body.tutor;

    if (req.body.startDate || req.body.endDate) {
      const startDate = req.body.startDate ? new Date(req.body.startDate) : course.startDate;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : course.endDate;

      if (endDate <= startDate) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'End date must be after start date'
          }
        });
      }

      if (req.body.startDate) updateData.startDate = startDate;
      if (req.body.endDate) updateData.endDate = endDate;
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData
    });

    res.json({
      id: updatedCourse.id,
      name: updatedCourse.name,
      color: updatedCourse.color,
      icon: updatedCourse.icon,
      tutor: updatedCourse.tutor,
      startDate: formatDate(updatedCourse.startDate),
      endDate: formatDate(updatedCourse.endDate),
      createdAt: updatedCourse.createdAt.toISOString(),
      updatedAt: updatedCourse.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Delete course
router.delete('/:courseId', validateCourseId, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and user owns it
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { assignments: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    if (course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this course'
        }
      });
    }

    // Delete course (cascade delete will handle assignments)
    await prisma.course.delete({
      where: { id: courseId }
    });

    res.json({
      message: 'Course deleted successfully',
      deletedAssignmentsCount: course._count.assignments
    });
  } catch (error) {
    next(error);
  }
});

export default router;
