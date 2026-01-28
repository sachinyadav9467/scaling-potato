import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validateUpdateUser } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/me', validateUpdateUser, async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(422).json({
          error: {
            code: 'DUPLICATE_RESOURCE',
            message: 'Email already in use'
          }
        });
      }

      updateData.email = email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export default router;
