// This file now serves as a compatibility layer for components that still reference these functions
// All actual data operations should go through the AppContext which uses the API

import { useApp } from '../context/AppContext';

// Re-export context functions for backward compatibility
export const useDataUtils = () => {
  const context = useApp();
  return {
    getCourse: context.getCourse,
    getAssignment: context.getAssignment,
    getAssignmentsForDate: context.getAssignmentsForDate,
    getSubmissionsByAssignment: context.getSubmissionsByAssignment,
  };
};

// Client-side helper for filtering assignments by date
// This is used as a fallback when API is not available
export const getAssignmentsForDate = (assignments, date) => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

  return assignments.filter((assignment) => {
    if (assignment.type === 'one-time') {
      return assignment.assignedDate <= dateStr && assignment.dueDate >= dateStr;
    }

    if (assignment.type === 'daily') {
      return assignment.assignedDate <= dateStr && assignment.dueDate >= dateStr;
    }

    if (assignment.type === 'weekly') {
      if (assignment.scheduleRule?.daysOfWeek) {
        return (
          assignment.scheduleRule.daysOfWeek.includes(dayOfWeek) &&
          assignment.assignedDate <= dateStr &&
          assignment.dueDate >= dateStr
        );
      }
    }

    if (assignment.type === 'monthly') {
      const assignedDate = new Date(assignment.assignedDate);
      const dayOfMonth = dateObj.getDate();
      return (
        dayOfMonth === assignedDate.getDate() &&
        assignment.assignedDate <= dateStr &&
        assignment.dueDate >= dateStr
      );
    }

    return false;
  });
};

// Helper to get course by ID from array
export const getCourse = (courses, id) => {
  return courses.find((c) => c.id === id);
};

// Helper to get assignment by ID from array
export const getAssignment = (assignments, id) => {
  return assignments.find((a) => a.id === id);
};

// Helper to get assignments by course ID
export const getAssignmentsByCourse = (assignments, courseId) => {
  return assignments.filter((a) => a.courseId === courseId);
};
