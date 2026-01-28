import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCourse } from '../utils/data.js';
import { getDaysUntilDue, isOverdue, formatDate } from '../utils/dateUtils.js';
import { ASSIGNMENT_TYPES, ASSIGNMENT_STATUS, SUBMISSION_TYPES } from '../types/index.js';
import { FileText, Link as LinkIcon, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AssignmentCard = ({ assignment, date, onUpdate }) => {
  const { userRole } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(assignment.status);

  const course = getCourse(assignment.courseId);
  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
  const overdue = isOverdue(assignment.dueDate);

  const getStatusIcon = () => {
    switch (assignment.status) {
      case ASSIGNMENT_STATUS.SUBMITTED:
      case ASSIGNMENT_STATUS.REVIEWED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case ASSIGNMENT_STATUS.IN_PROGRESS:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      [ASSIGNMENT_STATUS.NOT_STARTED]: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
      [ASSIGNMENT_STATUS.IN_PROGRESS]: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
      [ASSIGNMENT_STATUS.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
      [ASSIGNMENT_STATUS.REVIEWED]: { label: 'Reviewed', color: 'bg-green-100 text-green-700' }
    };
    const status = statusMap[assignment.status] || statusMap[ASSIGNMENT_STATUS.NOT_STARTED];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
        {status.label}
      </span>
    );
  };

  const getTypeBadge = () => {
    const typeMap = {
      [ASSIGNMENT_TYPES.ONE_TIME]: { label: 'One-time', color: 'bg-purple-100 text-purple-700' },
      [ASSIGNMENT_TYPES.DAILY]: { label: 'Daily', color: 'bg-blue-100 text-blue-700' },
      [ASSIGNMENT_TYPES.WEEKLY]: { label: 'Weekly', color: 'bg-indigo-100 text-indigo-700' },
      [ASSIGNMENT_TYPES.MONTHLY]: { label: 'Monthly', color: 'bg-pink-100 text-pink-700' }
    };
    const type = typeMap[assignment.type] || typeMap[ASSIGNMENT_TYPES.ONE_TIME];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${type.color}`}>
        {type.label}
      </span>
    );
  };

  const handleSubmit = () => {
    if (onUpdate) {
      onUpdate(assignment.id, {
        status: ASSIGNMENT_STATUS.SUBMITTED,
        submissionContent
      });
      setSubmissionStatus(ASSIGNMENT_STATUS.SUBMITTED);
      setIsEditing(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (onUpdate) {
      onUpdate(assignment.id, { status: newStatus });
      setSubmissionStatus(newStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className="px-2 py-1 text-xs font-medium rounded"
              style={{ backgroundColor: `${course?.color}20`, color: course?.color }}
            >
              {course?.name}
            </span>
            {getTypeBadge()}
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Due Date</span>
          <span className={`font-medium ${
            overdue ? 'text-red-600' : daysUntilDue <= 2 ? 'text-orange-600' : 'text-gray-900'
          }`}>
            {formatDate(assignment.dueDate, 'MMM dd, yyyy')}
            {overdue ? ' (Overdue)' : daysUntilDue <= 2 ? ` (${daysUntilDue} days left)` : ''}
          </span>
        </div>

        {userRole === 'student' && (
          <div>
            {!isEditing && assignment.status !== ASSIGNMENT_STATUS.SUBMITTED && assignment.status !== ASSIGNMENT_STATUS.REVIEWED ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {assignment.status === ASSIGNMENT_STATUS.IN_PROGRESS ? 'Continue Submission' : 'Start Submission'}
              </button>
            ) : isEditing ? (
              <div className="space-y-2">
                {assignment.submissionType === SUBMISSION_TYPES.TEXT && (
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter your submission..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows="4"
                  />
                )}
                {assignment.submissionType === SUBMISSION_TYPES.FILE && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload file</p>
                    <input type="file" className="hidden" />
                  </div>
                )}
                {assignment.submissionType === SUBMISSION_TYPES.LINK && (
                  <input
                    type="url"
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter submission URL..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      handleStatusChange(ASSIGNMENT_STATUS.IN_PROGRESS);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p>Status: {assignment.status === ASSIGNMENT_STATUS.REVIEWED ? 'Reviewed' : 'Submitted'}</p>
                {assignment.feedback && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="font-medium">Feedback:</p>
                    <p>{assignment.feedback}</p>
                    {assignment.score !== null && (
                      <p className="mt-1">Score: {assignment.score}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {userRole === 'tutor' && assignment.status === ASSIGNMENT_STATUS.SUBMITTED && (
          <div className="space-y-2">
            <textarea
              placeholder="Add feedback..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="3"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Score"
                min="0"
                max="100"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                Submit Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
