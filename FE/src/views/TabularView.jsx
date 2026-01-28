import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/dateUtils';
import { ASSIGNMENT_TYPES, ASSIGNMENT_STATUS } from '../types/index';
import { Search, Filter, Download } from 'lucide-react';

const TabularView = () => {
  const { courses, assignments, currentDate, setCurrentDate, getCourse } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Get all assignments across all dates (for power users)
  const allAssignments = assignments.map(assignment => {
    const course = getCourse(assignment.courseId);
    return {
      ...assignment,
      courseName: course?.name || 'Unknown',
      courseColor: course?.color || '#gray'
    };
  });

  // Apply filters
  const filteredAssignments = allAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !courseFilter || assignment.courseId === courseFilter;
    const matchesStatus = !statusFilter || assignment.status === statusFilter;
    const matchesType = !typeFilter || assignment.type === typeFilter;

    return matchesSearch && matchesCourse && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      [ASSIGNMENT_STATUS.NOT_STARTED]: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
      [ASSIGNMENT_STATUS.IN_PROGRESS]: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
      [ASSIGNMENT_STATUS.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
      [ASSIGNMENT_STATUS.REVIEWED]: { label: 'Reviewed', color: 'bg-green-100 text-green-700' }
    };
    const statusInfo = statusMap[status] || statusMap[ASSIGNMENT_STATUS.NOT_STARTED];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      [ASSIGNMENT_TYPES.ONE_TIME]: { label: 'One-time', color: 'bg-purple-100 text-purple-700' },
      [ASSIGNMENT_TYPES.DAILY]: { label: 'Daily', color: 'bg-blue-100 text-blue-700' },
      [ASSIGNMENT_TYPES.WEEKLY]: { label: 'Weekly', color: 'bg-indigo-100 text-indigo-700' },
      [ASSIGNMENT_TYPES.MONTHLY]: { label: 'Monthly', color: 'bg-pink-100 text-pink-700' }
    };
    const typeInfo = typeMap[type] || typeMap[ASSIGNMENT_TYPES.ONE_TIME];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Course', 'Assignment', 'Schedule Type', 'Status', 'Due Date', 'Submission', 'Feedback', 'Score'].join(','),
      ...filteredAssignments.map(a => [
        formatDate(a.assignedDate, 'yyyy-MM-dd'),
        a.courseName,
        `"${a.title}"`,
        a.type,
        a.status,
        formatDate(a.dueDate, 'yyyy-MM-dd'),
        a.status === ASSIGNMENT_STATUS.SUBMITTED || a.status === ASSIGNMENT_STATUS.REVIEWED ? 'Yes' : 'No',
        a.feedback || '',
        a.score !== null ? a.score : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignments-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {Object.values(ASSIGNMENT_STATUS).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {Object.values(ASSIGNMENT_TYPES).map(type => (
              <option key={type} value={type}>
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map(assignment => {
                  const overdue = isOverdue(assignment.dueDate);
                  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                  
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(assignment.assignedDate, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: assignment.courseColor }}
                          />
                          <span className="text-sm text-gray-900">{assignment.courseName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          {assignment.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {assignment.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(assignment.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(assignment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(assignment.dueDate, 'MMM dd, yyyy')}
                        </div>
                        <div className={`text-xs ${
                          overdue ? 'text-red-600' : daysUntilDue <= 2 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {overdue ? 'Overdue' : `${daysUntilDue} days left`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.status === ASSIGNMENT_STATUS.SUBMITTED || 
                         assignment.status === ASSIGNMENT_STATUS.REVIEWED ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {assignment.feedback ? (
                          <div>
                            <div className="truncate max-w-xs">{assignment.feedback}</div>
                            {assignment.score !== null && (
                              <div className="text-xs font-medium text-gray-700 mt-1">
                                Score: {assignment.score}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredAssignments.length}</span> of{' '}
            <span className="font-medium text-gray-900">{allAssignments.length}</span> assignments
          </p>
        </div>
      </div>
    </div>
  );
};

export default TabularView;
