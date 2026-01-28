import prisma from '../config/database.js';
import { formatDate, parseDate, getWeekRange, getMonthRange, shouldGenerateAssignment } from '../utils/dateUtils.js';

export const getDailyMetrics = async (userId, date, userRole = null) => {
  const targetDate = parseDate(date);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Build where clause based on role
  const where = {
    assignedDate: { lte: targetDate },
    dueDate: { gte: targetDate }
  };

  // Role-based filtering
  if (userRole === 'tutor') {
    // Tutors see assignments they created
    where.userId = userId;
  }
  // Students see all assignments (no userId filter)

  // Get all assignments that could appear on this date
  const allAssignments = await prisma.assignment.findMany({
    where
  });

  // Filter assignments that should appear on this date
  const assignments = allAssignments.filter(a => shouldGenerateAssignment(a, date));

  // Get submissions for this date
  const submissions = await prisma.submission.findMany({
    where: {
      userId,
      date: targetDate
    },
    select: { assignmentId: true }
  });

  const submittedAssignmentIds = new Set(submissions.map(s => s.assignmentId));

  const total = assignments.length;
  const completed = assignments.filter(a => 
    a.status === 'submitted' || a.status === 'reviewed' || submittedAssignmentIds.has(a.id)
  ).length;
  const pending = total - completed;
  const overdue = assignments.filter(a => {
    const dueDate = parseDate(a.dueDate);
    return dueDate < today && 
           a.status !== 'submitted' && 
           a.status !== 'reviewed' && 
           !submittedAssignmentIds.has(a.id);
  }).length;

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    date: formatDate(targetDate),
    total,
    completed,
    pending,
    overdue,
    completionRate: Math.round(completionRate * 100) / 100
  };
};

export const getWeeklyMetrics = async (userId, date, userRole = null) => {
  const { weekStart, weekEnd } = getWeekRange(date);
  const start = parseDate(weekStart);
  const end = parseDate(weekEnd);
  // Set end to end of day (23:59:59)
  end.setUTCHours(23, 59, 59, 999);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Build where clause based on role
  // Find assignments that overlap with the week range
  // An assignment overlaps if: assignedDate <= weekEnd AND dueDate >= weekStart
  const where = {
    assignedDate: { lte: end },
    dueDate: { gte: start }
  };

  // Role-based filtering
  if (userRole === 'tutor') {
    // Tutors see assignments they created
    where.userId = userId;
  }
  // Students see all assignments (no userId filter)

  // Get all assignments in the week range
  const allAssignments = await prisma.assignment.findMany({
    where,
    include: { course: true }
  });

  // Generate assignments for each day in the week
  const assignmentsByDate = {};
  const currentDate = new Date(start);
  // Reset end to start of day for iteration
  const weekEndDate = parseDate(weekEnd);
  weekEndDate.setUTCHours(0, 0, 0, 0);
  
  while (currentDate <= weekEndDate) {
    const dateStr = formatDate(currentDate);
    assignmentsByDate[dateStr] = allAssignments.filter(a => shouldGenerateAssignment(a, dateStr));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // Get all submissions in the week
  // For students, get their own submissions for assignments in the week
  // For tutors, get all submissions for their assignments
  const submissionWhere = {
    date: { gte: start, lte: end }
  };
  
  if (userRole === 'tutor') {
    // Tutors see all submissions for assignments they created
    submissionWhere.assignment = {
      userId: userId
    };
  } else {
    // Students see their own submissions for assignments in the week
    submissionWhere.userId = userId;
    const assignmentIds = allAssignments.map(a => a.id);
    if (assignmentIds.length > 0) {
      submissionWhere.assignmentId = { in: assignmentIds };
    } else {
      // No assignments, so no submissions
      submissionWhere.assignmentId = { in: [] };
    }
  }
  
  const submissions = await prisma.submission.findMany({
    where: submissionWhere,
    select: { assignmentId: true, date: true, userId: true }
  });

  const submissionsByDate = {};
  submissions.forEach(s => {
    const dateStr = formatDate(s.date);
    if (!submissionsByDate[dateStr]) {
      submissionsByDate[dateStr] = new Set();
    }
    submissionsByDate[dateStr].add(s.assignmentId);
  });

  let total = 0;
  let completed = 0;
  let pending = 0;
  let overdue = 0;
  const courseWorkload = {};

  Object.keys(assignmentsByDate).forEach(dateStr => {
    const assignments = assignmentsByDate[dateStr];
    const submittedIds = submissionsByDate[dateStr] || new Set();
    const dateObj = parseDate(dateStr);

    assignments.forEach(assignment => {
      total++;
      
      // Track course workload
      if (!courseWorkload[assignment.courseId]) {
        courseWorkload[assignment.courseId] = 0;
      }
      courseWorkload[assignment.courseId]++;

      const isCompleted = assignment.status === 'submitted' || 
                          assignment.status === 'reviewed' || 
                          submittedIds.has(assignment.id);

      if (isCompleted) {
        completed++;
      } else {
        pending++;
        const dueDate = parseDate(assignment.dueDate);
        if (dueDate < today) {
          overdue++;
        }
      }
    });
  });

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    weekStart,
    weekEnd,
    total,
    completed,
    pending,
    overdue,
    completionRate: Math.round(completionRate * 100) / 100,
    courseWorkload
  };
};

export const getMonthlyMetrics = async (userId, year, month) => {
  const { startDate, endDate } = getMonthRange(year, month);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Get all assignments in the month
  const allAssignments = await prisma.assignment.findMany({
    where: {
      userId,
      OR: [
        { assignedDate: { lte: end }, dueDate: { gte: start } }
      ]
    },
    include: { 
      course: true,
      submissions: {
        where: {
          date: { gte: start, lte: end }
        }
      }
    }
  });

  // Generate assignments for each day in the month
  const assignmentsByDate = {};
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = formatDate(d);
    assignmentsByDate[dateStr] = allAssignments.filter(a => shouldGenerateAssignment(a, dateStr));
  }

  let total = 0;
  let totalCompleted = 0;
  const courseStats = {};

  Object.keys(assignmentsByDate).forEach(dateStr => {
    const assignments = assignmentsByDate[dateStr];
    assignments.forEach(assignment => {
      total++;
      
      if (!courseStats[assignment.courseId]) {
        courseStats[assignment.courseId] = {
          total: 0,
          completed: 0,
          delayed: 0
        };
      }

      courseStats[assignment.courseId].total++;
      
      const isCompleted = assignment.status === 'submitted' || 
                          assignment.status === 'reviewed' ||
                          assignment.submissions.length > 0;

      if (isCompleted) {
        totalCompleted++;
        courseStats[assignment.courseId].completed++;
      } else {
        const dueDate = parseDate(assignment.dueDate);
        if (dueDate < today) {
          courseStats[assignment.courseId].delayed++;
        }
      }
    });
  });

  const consistencyScore = total > 0 ? (totalCompleted / total) * 100 : 0;

  // Calculate course difficulty
  const courseDifficulty = {};
  Object.keys(courseStats).forEach(courseId => {
    const stats = courseStats[courseId];
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    const delayRate = stats.total > 0 ? (stats.delayed / stats.total) * 100 : 0;
    
    let difficulty = 'low';
    if (delayRate > 30) {
      difficulty = 'high';
    } else if (delayRate > 10) {
      difficulty = 'medium';
    }

    courseDifficulty[courseId] = {
      completionRate: Math.round(completionRate * 100) / 100,
      delayRate: Math.round(delayRate * 100) / 100,
      difficulty
    };
  });

  return {
    year,
    month,
    total,
    completed: totalCompleted,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    courseDifficulty
  };
};

export const getRangeMetrics = async (userId, startDate, endDate, courseId = null) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const where = {
    userId,
    OR: [
      { assignedDate: { lte: end }, dueDate: { gte: start } }
    ]
  };

  if (courseId) {
    where.courseId = courseId;
  }

  const allAssignments = await prisma.assignment.findMany({
    where,
    include: {
      submissions: {
        where: {
          date: { gte: start, lte: end }
        }
      }
    }
  });

  // Generate assignments for each day in the range
  const assignmentsByDate = {};
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = formatDate(d);
    assignmentsByDate[dateStr] = allAssignments.filter(a => shouldGenerateAssignment(a, dateStr));
  }

  let total = 0;
  let completed = 0;
  let pending = 0;

  Object.keys(assignmentsByDate).forEach(dateStr => {
    const assignments = assignmentsByDate[dateStr];
    assignments.forEach(assignment => {
      total++;
      
      const isCompleted = assignment.status === 'submitted' || 
                          assignment.status === 'reviewed' ||
                          assignment.submissions.length > 0;

      if (isCompleted) {
        completed++;
      } else {
        pending++;
      }
    });
  });

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    startDate,
    endDate,
    total,
    completed,
    pending,
    completionRate: Math.round(completionRate * 100) / 100
  };
};
