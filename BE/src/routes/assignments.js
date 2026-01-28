import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateCreateAssignment, validateUpdateAssignment, validateAssignmentId, validateDate } from '../utils/validation.js';
import { getAssignmentsForDate, getAssignmentsWithFilters } from '../services/assignmentService.js';
import { formatDate } from '../utils/dateUtils.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all assignments with filters
router.get('/', async (req, res, next) => {
  try {
    const result = await getAssignmentsWithFilters(req.user.id, req.query, req.user.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get assignments for specific date
router.get('/date/:date', validateDate, async (req, res, next) => {
  try {
    const { date } = req.params;
    const assignments = await getAssignmentsForDate(req.user.id, date, req.user.role);

    res.json({
      date,
      assignments,
      total: assignments.length
    });
  } catch (error) {
    next(error);
  }
});

// Get assignment by ID
router.get('/:assignmentId', validateAssignmentId, async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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

    if (!assignment) {
      return res.status(404).json({
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }
      });
    }

    if (assignment.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this assignment'
        }
      });
    }

    res.json({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      type: assignment.type,
      assignedDate: formatDate(assignment.assignedDate),
      dueDate: formatDate(assignment.dueDate),
      submissionType: assignment.submissionType,
      status: assignment.status,
      scheduleRule: assignment.scheduleRule,
      feedback: assignment.feedback,
      score: assignment.score,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Create assignment - Only tutors can create
router.post('/', authorize('tutor'), validateCreateAssignment, async (req, res, next) => {
  try {
    const {
      title,
      description,
      courseId,
      type,
      assignedDate,
      dueDate,
      submissionType,
      scheduleRule
    } = req.body;

    // Validate course exists and user owns it
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

    // Only tutors can create assignments, and only for courses they own
    if (course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only create assignments for courses you own'
        }
      });
    }

    // Validate date range
    const assigned = new Date(assignedDate);
    const due = new Date(dueDate);

    if (due < assigned) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Due date must be after or equal to assigned date',
          details: {
            fields: {
              dueDate: ['Due date must be after or equal to assigned date']
            }
          }
        }
      });
    }

    // Validate schedule rule for weekly type
    if (type === 'weekly' && (!scheduleRule || !scheduleRule.daysOfWeek || !Array.isArray(scheduleRule.daysOfWeek))) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Schedule rule with daysOfWeek is required for weekly assignments',
          details: {
            fields: {
              scheduleRule: ['Schedule rule with daysOfWeek array is required for weekly type']
            }
          }
        }
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        userId: req.user.id,
        courseId,
        title,
        description,
        type,
        assignedDate: assigned,
        dueDate: due,
        submissionType,
        scheduleRule: scheduleRule || null,
        status: 'not_started'
      }
    });

    res.status(201).json({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      type: assignment.type,
      assignedDate: formatDate(assignment.assignedDate),
      dueDate: formatDate(assignment.dueDate),
      submissionType: assignment.submissionType,
      status: assignment.status,
      scheduleRule: assignment.scheduleRule,
      feedback: null,
      score: null,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Update assignment
router.patch('/:assignmentId', validateAssignmentId, validateUpdateAssignment, async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { id: userId, role } = req.user;

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }
      });
    }

    // Role-based permission checks
    if (role === 'tutor') {
      // Tutors can only update assignments in courses they own
      if (assignment.course.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only modify assignments in courses you own'
          }
        });
      }
    } else if (role === 'student') {
      // Students can only update status (for submission)
      const allowedFields = ['status'];
      const requestedFields = Object.keys(req.body);
      const invalidFields = requestedFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: `Students can only update status. Invalid fields: ${invalidFields.join(', ')}`
          }
        });
      }
    }

    const updateData = {};
    if (req.body.title && role === 'tutor') updateData.title = req.body.title;
    if (req.body.description !== undefined && role === 'tutor') updateData.description = req.body.description;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.feedback !== undefined && role === 'tutor') updateData.feedback = req.body.feedback;
    if (req.body.score !== undefined && role === 'tutor') updateData.score = req.body.score;

    if (req.body.dueDate) {
      const due = new Date(req.body.dueDate);
      if (due < assignment.assignedDate) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Due date must be after or equal to assigned date'
          }
        });
      }
      updateData.dueDate = due;
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData
    });

    res.json({
      id: updatedAssignment.id,
      title: updatedAssignment.title,
      description: updatedAssignment.description,
      courseId: updatedAssignment.courseId,
      type: updatedAssignment.type,
      assignedDate: formatDate(updatedAssignment.assignedDate),
      dueDate: formatDate(updatedAssignment.dueDate),
      submissionType: updatedAssignment.submissionType,
      status: updatedAssignment.status,
      scheduleRule: updatedAssignment.scheduleRule,
      feedback: updatedAssignment.feedback,
      score: updatedAssignment.score,
      createdAt: updatedAssignment.createdAt.toISOString(),
      updatedAt: updatedAssignment.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Delete assignment - Only tutors can delete
router.delete('/:assignmentId', authorize('tutor'), validateAssignmentId, async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    // Check if assignment exists and user owns the course
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }
      });
    }

    // Only tutors who own the course can delete
    if (assignment.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete assignments from courses you own'
        }
      });
    }

    // Delete assignment (cascade delete will handle submissions)
    await prisma.assignment.delete({
      where: { id: assignmentId }
    });

    res.json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
