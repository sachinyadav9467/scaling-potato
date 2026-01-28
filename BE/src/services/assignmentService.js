import prisma from '../config/database.js';
import { shouldGenerateAssignment, formatDate } from '../utils/dateUtils.js';

export const getAssignmentsForDate = async (userId, date, userRole = null) => {
  const where = {
    assignedDate: { lte: new Date(date) },
    dueDate: { gte: new Date(date) }
  };
  
  // Role-based filtering
  if (userRole === 'tutor') {
    // Tutors see assignments they created
    where.userId = userId;
  }
  // Students see all assignments (no userId filter)
  
  const assignments = await prisma.assignment.findMany({
    where,
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

  // Filter by assignment type logic
  const filteredAssignments = assignments.filter(assignment => {
    return shouldGenerateAssignment(assignment, date);
  });

  return filteredAssignments.map(assignment => ({
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
  }));
};

export const getAssignmentsWithFilters = async (userId, filters, userRole = null) => {
  const {
    courseId,
    status,
    type,
    date,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = filters;

  const where = {};
  
  // Role-based filtering
  if (userRole === 'tutor') {
    // Tutors see assignments they created
    where.userId = userId;
  }
  // Students see all assignments (no userId filter)

  if (courseId) where.courseId = courseId;
  if (status) where.status = status;
  if (type) where.type = type;
  if (date) {
    where.assignedDate = { lte: new Date(date) };
    where.dueDate = { gte: new Date(date) };
  }
  if (startDate) where.assignedDate = { gte: new Date(startDate) };
  if (endDate) where.dueDate = { lte: new Date(endDate) };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = Math.min(parseInt(limit), 100);

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
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
    }),
    prisma.assignment.count({ where })
  ]);

  return {
    assignments: assignments.map(assignment => ({
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
    })),
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};
