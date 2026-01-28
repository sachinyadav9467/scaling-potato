import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';
import { body, param } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation helpers
const validateVideoId = validate([param('videoId').isUUID().withMessage('Invalid video ID')]);
const validateNoteId = validate([param('noteId').isUUID().withMessage('Invalid note ID')]);
const validateCreateNote = validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('fileUrl').notEmpty().withMessage('File URL is required'),
  body('fileName').notEmpty().withMessage('File name is required'),
  body('fileSize').optional().isInt({ min: 0 }).withMessage('File size must be a positive integer')
]);

// Get all notes for a video - Students and tutors can view notes
router.get('/:videoId/notes', validateVideoId, async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { id: userId, role } = req.user;

    // Check if video exists
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

    // Both students and tutors can view notes
    // No permission check needed for viewing

    const notes = await prisma.videoNote.findMany({
      where: { videoId },
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
    });

    res.json({
      notes: notes.map(note => ({
        id: note.id,
        videoId: note.videoId,
        userId: note.userId,
        title: note.title,
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        fileSize: note.fileSize,
        creator: note.user,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      })),
      total: notes.length
    });
  } catch (error) {
    next(error);
  }
});

// Create note for a video - Only tutors can add notes
router.post('/:videoId/notes', authorize('tutor'), validateVideoId, validateCreateNote, async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { title, fileUrl, fileName, fileSize } = req.body;

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

    // Only tutors who own the course can add notes
    if (video.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only add notes to videos in courses you own'
        }
      });
    }

    const note = await prisma.videoNote.create({
      data: {
        videoId,
        userId: req.user.id, // Set creator as current user (tutor)
        title,
        fileUrl,
        fileName,
        fileSize: fileSize || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      id: note.id,
      videoId: note.videoId,
      userId: note.userId,
      title: note.title,
      fileUrl: note.fileUrl,
      fileName: note.fileName,
      fileSize: note.fileSize,
      creator: note.user,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Delete video note - Only tutors can delete notes
router.delete('/:noteId', authorize('tutor'), validateNoteId, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Check if note exists and user owns the course
    const note = await prisma.videoNote.findUnique({
      where: { id: noteId },
      include: {
        video: {
          include: {
            course: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    });

    if (!note) {
      return res.status(404).json({
        error: {
          code: 'NOTE_NOT_FOUND',
          message: 'Note not found'
        }
      });
    }

    // Only tutors who own the course can delete notes
    if (note.video.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete notes from videos in courses you own'
        }
      });
    }

    await prisma.videoNote.delete({
      where: { id: noteId }
    });

    res.json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
