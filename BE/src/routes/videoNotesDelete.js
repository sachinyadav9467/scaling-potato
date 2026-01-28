import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';
import { param } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation helper
const validateNoteId = validate([param('noteId').isUUID().withMessage('Invalid note ID')]);

// Delete note
router.delete('/:noteId', validateNoteId, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Check if note exists and user owns the video's course
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

    if (note.video.course.userId !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this note'
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
