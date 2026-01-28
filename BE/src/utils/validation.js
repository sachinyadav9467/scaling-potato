import { body, param, query, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            fields: errors.array().reduce((acc, err) => {
              acc[err.path] = acc[err.path] || [];
              acc[err.path].push(err.msg);
              return acc;
            }, {})
          }
        }
      });
    }

    next();
  };
};

// Auth validations
export const validateLogin = validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]);

export const validateRegister = validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['student', 'tutor']).withMessage('Role must be either student or tutor')
]);

export const validateRefresh = validate([
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
]);

// Course validations
export const validateCreateCourse = validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('icon').notEmpty().withMessage('Icon is required'),
  body('tutor').notEmpty().withMessage('Tutor is required'),
  body('startDate').isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate').isISO8601().withMessage('End date must be in YYYY-MM-DD format')
]);

export const validateUpdateCourse = validate([
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('startDate').optional().isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate').optional().isISO8601().withMessage('End date must be in YYYY-MM-DD format')
]);

export const validateCourseId = validate([
  param('courseId').isUUID().withMessage('Invalid course ID')
]);

// Assignment validations
export const validateCreateAssignment = validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('courseId').isUUID().withMessage('Valid course ID is required'),
  body('type').isIn(['one-time', 'daily', 'weekly', 'monthly']).withMessage('Type must be one-time, daily, weekly, or monthly'),
  body('assignedDate').isISO8601().withMessage('Assigned date must be in YYYY-MM-DD format'),
  body('dueDate').isISO8601().withMessage('Due date must be in YYYY-MM-DD format'),
  body('submissionType').isIn(['text', 'file', 'link']).withMessage('Submission type must be text, file, or link'),
  body('scheduleRule').optional().isObject().withMessage('Schedule rule must be an object')
]);

export const validateUpdateAssignment = validate([
  body('status').optional().isIn(['not_started', 'in_progress', 'submitted', 'reviewed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be in YYYY-MM-DD format'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
]);

export const validateAssignmentId = validate([
  param('assignmentId').isUUID().withMessage('Invalid assignment ID')
]);

export const validateDate = validate([
  param('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format')
]);

// Submission validations
export const validateCreateSubmission = validate([
  body('assignmentId').isUUID().withMessage('Valid assignment ID is required'),
  body('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
  body('submissionType').isIn(['text', 'file', 'link']).withMessage('Submission type must be text, file, or link'),
  body('content')
    .custom((value, { req }) => {
      if (req.body.submissionType === 'text') {
        if (!value || typeof value !== 'string' || !value.trim()) {
          throw new Error('Content is required for text submissions');
        }
      }
      return true;
    }),
  body('fileUrl')
    .custom((value, { req }) => {
      if (req.body.submissionType === 'file') {
        if (!value || typeof value !== 'string' || !value.trim()) {
          throw new Error('File URL is required for file submissions');
        }
      }
      return true;
    }),
  body('linkUrl')
    .custom((value, { req }) => {
      if (req.body.submissionType === 'link') {
        if (!value || typeof value !== 'string' || !value.trim()) {
          throw new Error('Link URL is required for link submissions');
        }
        // Basic URL validation
        try {
          new URL(value.trim());
        } catch (e) {
          throw new Error('Link URL must be a valid URL');
        }
      }
      return true;
    })
]);

export const validateSubmissionId = validate([
  param('submissionId').isUUID().withMessage('Invalid submission ID')
]);

// Metrics validations
export const validateMonthlyMetrics = validate([
  param('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  param('month').isInt({ min: 1, max: 12 }).withMessage('Invalid month')
]);

export const validateRangeMetrics = validate([
  query('startDate').isISO8601().withMessage('Start date must be in YYYY-MM-DD format'),
  query('endDate').isISO8601().withMessage('End date must be in YYYY-MM-DD format')
]);

// User validations
export const validateUpdateUser = validate([
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
]);
