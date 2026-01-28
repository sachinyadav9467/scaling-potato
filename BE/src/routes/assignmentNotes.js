import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'assignment-note-' + uniqueSuffix + ext);
  }
});

// File filter - PDF and Word documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed for assignment notes'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation helpers
const validateAssignmentId = validate([param('assignmentId').isUUID().withMessage('Invalid assignment ID')]);
const validateNoteId = validate([param('noteId').isUUID().withMessage('Invalid note ID')]);

// Get all notes for an assignment
// Students can view their own notes, tutors can view all notes for assignments in their courses
router.get('/:assignmentId/notes', validateAssignmentId, async (req, res, next) => {
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

    // Build where clause based on role
    const where = { assignmentId };
    if (role === 'student') {
      // Students can only see their own notes
      where.userId = userId;
    } else if (role === 'tutor') {
      // Tutors can see all notes for assignments in their courses
      if (assignment.course.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view notes for assignments in your courses'
          }
        });
      }
    }

    const notes = await prisma.assignmentNote.findMany({
      where,
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
        assignmentId: note.assignmentId,
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

// Create note for an assignment - Only students can add notes
router.post('/:assignmentId/notes', validateAssignmentId, upload.single('file'), async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { id: userId, role } = req.user;

    console.log('POST /assignments/:assignmentId/notes - Request received', {
      assignmentId,
      userId,
      role,
      hasFile: !!req.file,
      fileInfo: req.file ? { name: req.file.originalname, type: req.file.mimetype, size: req.file.size } : null
    });

    // Only students can add notes
    if (role !== 'student') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only students can add notes to assignments'
        }
      });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File is required (PDF or Word document)'
        }
      });
    }

    // Check if assignment exists
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

    // Construct file URL
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    console.log('Creating assignment note in database...');
    
    try {
      const note = await prisma.assignmentNote.create({
        data: {
          assignmentId,
          userId,
          title: req.body.title || req.file.originalname,
          fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size
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

      console.log('Assignment note created successfully:', note.id);

      res.status(201).json({
        id: note.id,
        assignmentId: note.assignmentId,
        userId: note.userId,
        title: note.title,
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        fileSize: note.fileSize,
        creator: note.user,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      });
    } catch (dbError) {
      console.error('Database error creating assignment note:', dbError);
      // If table doesn't exist, provide helpful error
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        return res.status(500).json({
          error: {
            code: 'DATABASE_ERROR',
            message: 'Assignment notes table does not exist. Please run database migration: npx prisma migrate dev'
          }
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error in POST /assignments/:assignmentId/notes:', error);
    next(error);
  }
});

// Delete assignment note - Students can delete their own notes, tutors can delete any note in their courses
// Note: This route should be mounted separately to avoid conflicts with /assignments/:assignmentId
// For now, we'll use /notes/:noteId pattern
router.delete('/notes/:noteId', validateNoteId, async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { id: userId, role } = req.user;

    // Check if note exists
    const note = await prisma.assignmentNote.findUnique({
      where: { id: noteId },
      include: {
        assignment: {
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

    // Permission check
    if (role === 'student') {
      // Students can only delete their own notes
      if (note.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only delete your own notes'
          }
        });
      }
    } else if (role === 'tutor') {
      // Tutors can delete notes for assignments in their courses
      if (note.assignment.course.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only delete notes for assignments in your courses'
          }
        });
      }
    }

    // Delete the file from filesystem
    const filePath = path.join(uploadsDir, path.basename(note.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.assignmentNote.delete({
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
