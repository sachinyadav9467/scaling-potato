import { getWeekDates, getMonthDates, isOverdue, getDaysUntilDue } from './dateUtils.js';
import { getAssignmentsForDate as filterAssignmentsByDate } from './data.js';

// Helper function to filter assignments by date
const getAssignmentsForDate = (assignments, date) => {
  return filterAssignmentsByDate(assignments, date);
};

export const getDailyMetrics = (assignments, date) => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const dayAssignments = getAssignmentsForDate(assignments, dateStr);
  const completed = dayAssignments.filter(a => a.status === 'submitted' || a.status === 'reviewed').length;
  const overdue = dayAssignments.filter(a => isOverdue(a.dueDate)).length;
  
  return {
    total: dayAssignments.length,
    completed,
    pending: dayAssignments.length - completed,
    overdue,
    completionRate: dayAssignments.length > 0 ? (completed / dayAssignments.length) * 100 : 0
  };
};

export const getWeeklyMetrics = (assignments, date) => {
  const weekDates = getWeekDates(date);
  const allAssignments = [];
  let totalCompleted = 0;
  let totalOverdue = 0;
  
  weekDates.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    const dayAssignments = getAssignmentsForDate(assignments, dateStr);
    allAssignments.push(...dayAssignments);
    totalCompleted += dayAssignments.filter(a => a.status === 'submitted' || a.status === 'reviewed').length;
    totalOverdue += dayAssignments.filter(a => isOverdue(a.dueDate)).length;
  });
  
  const courseWorkload = {};
  allAssignments.forEach(a => {
    courseWorkload[a.courseId] = (courseWorkload[a.courseId] || 0) + 1;
  });
  
  return {
    total: allAssignments.length,
    completed: totalCompleted,
    pending: allAssignments.length - totalCompleted,
    overdue: totalOverdue,
    completionRate: allAssignments.length > 0 ? (totalCompleted / allAssignments.length) * 100 : 0,
    courseWorkload
  };
};

export const getMonthlyMetrics = (assignments, date) => {
  const monthDates = getMonthDates(date);
  const allAssignments = [];
  let totalCompleted = 0;
  
  monthDates.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    const dayAssignments = getAssignmentsForDate(assignments, dateStr);
    allAssignments.push(...dayAssignments);
    totalCompleted += dayAssignments.filter(a => a.status === 'submitted' || a.status === 'reviewed').length;
  });
  
  const courseDifficulty = {};
  const courseStats = {};
  
  allAssignments.forEach(a => {
    if (!courseStats[a.courseId]) {
      courseStats[a.courseId] = { total: 0, completed: 0, delayed: 0 };
    }
    courseStats[a.courseId].total++;
    if (a.status === 'submitted' || a.status === 'reviewed') {
      courseStats[a.courseId].completed++;
    }
    if (isOverdue(a.dueDate) && a.status !== 'submitted' && a.status !== 'reviewed') {
      courseStats[a.courseId].delayed++;
    }
  });
  
  Object.keys(courseStats).forEach(courseId => {
    const stats = courseStats[courseId];
    const delayRate = stats.total > 0 ? (stats.delayed / stats.total) * 100 : 0;
    courseDifficulty[courseId] = {
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      delayRate,
      difficulty: delayRate > 30 ? 'high' : delayRate > 10 ? 'medium' : 'low'
    };
  });
  
  const consistencyScore = monthDates.length > 0 && allAssignments.length > 0
    ? (totalCompleted / allAssignments.length) * 100 
    : 0;
  
  return {
    total: allAssignments.length,
    completed: totalCompleted,
    consistencyScore,
    courseDifficulty
  };
};

export const getCustomRangeMetrics = (assignments, startDate, endDate, courseFilter = null) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  const allAssignments = [];
  let totalCompleted = 0;
  
  dates.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    const dayAssignments = getAssignmentsForDate(assignments, dateStr);
    const filtered = courseFilter 
      ? dayAssignments.filter(a => a.courseId === courseFilter)
      : dayAssignments;
    allAssignments.push(...filtered);
    totalCompleted += filtered.filter(a => a.status === 'submitted' || a.status === 'reviewed').length;
  });
  
  return {
    total: allAssignments.length,
    completed: totalCompleted,
    pending: allAssignments.length - totalCompleted,
    completionRate: allAssignments.length > 0 ? (totalCompleted / allAssignments.length) * 100 : 0,
    dateRange: { start: startDate, end: endDate }
  };
};
