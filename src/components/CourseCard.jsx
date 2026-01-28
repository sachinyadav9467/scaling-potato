import React from 'react';
import { useApp } from '../context/AppContext';
import { getAssignmentsByCourse } from '../utils/data.js';
import { getAssignmentsForDate } from '../utils/data.js';
import { getDaysUntilDue, isOverdue } from '../utils/dateUtils.js';

const CourseCard = ({ course, date }) => {
  const { setSelectedCourse } = useApp();
  const dateStr = date.toISOString().split('T')[0];
  const dayAssignments = getAssignmentsForDate(dateStr);
  const courseAssignments = dayAssignments.filter(a => a.courseId === course.id);
  const pending = courseAssignments.filter(a => 
    a.status === 'not_started' || a.status === 'in_progress'
  ).length;
  const completed = courseAssignments.filter(a => 
    a.status === 'submitted' || a.status === 'reviewed'
  ).length;
  const total = courseAssignments.length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const nextAssignment = courseAssignments
    .filter(a => a.status !== 'submitted' && a.status !== 'reviewed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const handleClick = () => {
    setSelectedCourse(course);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${course.color}20`, color: course.color }}
          >
            {course.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{course.name}</h3>
            <p className="text-xs text-gray-500">{course.tutor}</p>
          </div>
        </div>
        {pending > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            {pending} pending
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Completion</span>
          <span className="font-medium text-gray-900">{Math.round(completionRate)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${completionRate}%`, backgroundColor: course.color }}
          />
        </div>

        {nextAssignment && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-1">Next: {nextAssignment.title}</p>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${
                isOverdue(nextAssignment.dueDate)
                  ? 'text-red-600'
                  : getDaysUntilDue(nextAssignment.dueDate) <= 2
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}>
                {isOverdue(nextAssignment.dueDate)
                  ? 'Overdue'
                  : `${getDaysUntilDue(nextAssignment.dueDate)} days left`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
