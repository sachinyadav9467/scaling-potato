import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateDate, validateMonthlyMetrics, validateRangeMetrics } from '../utils/validation.js';
import {
  getDailyMetrics,
  getWeeklyMetrics,
  getMonthlyMetrics,
  getRangeMetrics
} from '../services/metricsService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get daily metrics
router.get('/daily/:date', validateDate, async (req, res, next) => {
  try {
    const { date } = req.params;
    const metrics = await getDailyMetrics(req.user.id, date, req.user.role);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Get weekly metrics
router.get('/weekly/:date', validateDate, async (req, res, next) => {
  try {
    const { date } = req.params;
    const metrics = await getWeeklyMetrics(req.user.id, date, req.user.role);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Get monthly metrics
router.get('/monthly/:year/:month', validateMonthlyMetrics, async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const metrics = await getMonthlyMetrics(req.user.id, parseInt(year), parseInt(month));
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Get custom range metrics
router.get('/range', validateRangeMetrics, async (req, res, next) => {
  try {
    const { startDate, endDate, courseId } = req.query;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(422).json({
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'End date must be after start date'
        }
      });
    }

    const metrics = await getRangeMetrics(req.user.id, startDate, endDate, courseId || null);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

export default router;
