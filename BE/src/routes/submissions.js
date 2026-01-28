import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validateCreateSubmission, validateSubmissionId } from '../utils/validation.js';
import { formatDate } from '../utils/dateUtils.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all submissions with filters
router.get('/', async (req, res, next) => {
  try {
    const { assignmentId, date, page = 1, limit = 50 } = req.query;

    const where = { userId: req.user.id };
    if (assignmentId) where.assignmentId = assignmentId;
    if (date) where.date = new Date(date);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              courseId: true
            }
          }
        }
      }),
      prisma.submission.count({ where })
    ]);

    res.json({
      submissions: submissions.map(submission => ({
        id: submission.id,
        assignmentId: submission.assignmentId,
        date: formatDate(submission.date),
        content: submission.content,
        fileUrl: submission.fileUrl,
        linkUrl: submission.linkUrl,
        submissionType: submission.submissionType,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString()
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

// Get submission by ID
router.get('/:submissionId', validateSubmissionId, async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            courseId: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission not found'
        }
      });
    }

    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this submission'
        }
      });
    }

    res.json({
      id: submission.id,
      assignmentId: submission.assignmentId,
      date: formatDate(submission.date),
      content: submission.content,
      fileUrl: submission.fileUrl,
      linkUrl: submission.linkUrl,
      submissionType: submission.submissionType,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Create submission
router.post('/', validateCreateSubmission, async (req, res, next) => {
  try {
    const { assignmentId, date, content, fileUrl, linkUrl, submissionType } = req.body;

    // Validate assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return res.status(404).json({
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }
      });
    }

    // Validate submission type matches assignment
    if (assignment.submissionType !== submissionType) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Submission type must be ${assignment.submissionType}`,
          details: {
            fields: {
              submissionType: [`Submission type must match assignment type: ${assignment.submissionType}`]
            }
          }
        }
      });
    }

    // Validate required fields based on submission type (additional validation after express-validator)
    if (submissionType === 'text') {
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content is required for text submissions',
            details: {
              fields: {
                content: ['Content is required for text submissions']
              }
            }
          }
        });
      }
    }

    if (submissionType === 'file') {
      if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File URL is required for file submissions',
            details: {
              fields: {
                fileUrl: ['File URL is required for file submissions']
              }
            }
          }
        });
      }
    }

    if (submissionType === 'link') {
      if (!linkUrl || typeof linkUrl !== 'string' || !linkUrl.trim()) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Link URL is required for link submissions',
            details: {
              fields: {
                linkUrl: ['Link URL is required for link submissions']
              }
            }
          }
        });
      }
      // Validate URL format
      try {
        new URL(linkUrl.trim());
      } catch (e) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Link URL must be a valid URL',
            details: {
              fields: {
                linkUrl: ['Link URL must be a valid URL']
              }
            }
          }
        });
      }
    }

    // Check if submission already exists for this date - allow resubmissions
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_date_userId: {
          assignmentId,
          date: new Date(date),
          userId: req.user.id
        }
      }
    });

    let submission;
    
    if (existingSubmission) {
      // Update existing submission (allow resubmission)
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: submissionType === 'text' ? content.trim() : null,
          fileUrl: submissionType === 'file' ? fileUrl.trim() : null,
          linkUrl: submissionType === 'link' ? linkUrl.trim() : null,
          submissionType
        }
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          userId: req.user.id,
          assignmentId,
          date: new Date(date),
          content: submissionType === 'text' ? content.trim() : null,
          fileUrl: submissionType === 'file' ? fileUrl.trim() : null,
          linkUrl: submissionType === 'link' ? linkUrl.trim() : null,
          submissionType
        }
      });
    }

    // Update assignment status to 'submitted'
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: 'submitted' }
    });

    res.status(existingSubmission ? 200 : 201).json({
      id: submission.id,
      assignmentId: submission.assignmentId,
      date: formatDate(submission.date),
      content: submission.content,
      fileUrl: submission.fileUrl,
      linkUrl: submission.linkUrl,
      submissionType: submission.submissionType,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString()
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(422).json({
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Submission already exists for this date'
        }
      });
    }
    next(error);
  }
});

// Update submission
router.patch('/:submissionId', validateSubmissionId, async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { content, fileUrl, linkUrl } = req.body;

    // Check if submission exists and user owns it
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission not found'
        }
      });
    }

    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this submission'
        }
      });
    }

    const updateData = {};
    if (content !== undefined && submission.submissionType === 'text') {
      updateData.content = content;
    }
    if (fileUrl !== undefined && submission.submissionType === 'file') {
      updateData.fileUrl = fileUrl;
    }
    if (linkUrl !== undefined && submission.submissionType === 'link') {
      updateData.linkUrl = linkUrl;
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData
    });

    res.json({
      id: updatedSubmission.id,
      assignmentId: updatedSubmission.assignmentId,
      date: formatDate(updatedSubmission.date),
      content: updatedSubmission.content,
      fileUrl: updatedSubmission.fileUrl,
      linkUrl: updatedSubmission.linkUrl,
      submissionType: updatedSubmission.submissionType,
      createdAt: updatedSubmission.createdAt.toISOString(),
      updatedAt: updatedSubmission.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Delete submission
router.delete('/:submissionId', validateSubmissionId, async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    // Check if submission exists and user owns it
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission not found'
        }
      });
    }

    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this submission'
        }
      });
    }

    await prisma.submission.delete({
      where: { id: submissionId }
    });

    res.json({
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
