import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { ASSIGNMENT_TYPES, SUBMISSION_TYPES } from '../types/index.js';

const AddAssignmentModal = ({ onClose }) => {
  const { addNewAssignment, courses } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: courses.length > 0 ? courses[0].id : '',
    type: 'one-time',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    submissionType: 'text',
    scheduleRule: null,
    daysOfWeek: [] // For weekly assignments
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.title && formData.courseId && formData.dueDate) {
      // Validate weekly assignments require daysOfWeek
      if (formData.type === 'weekly' && (!formData.daysOfWeek || formData.daysOfWeek.length === 0)) {
        setError('Please select at least one day of the week for weekly assignments.');
        return;
      }
      
      setLoading(true);
      try {
        const assignment = {
          title: formData.title,
          description: formData.description || '',
          courseId: formData.courseId,
          type: formData.type,
          assignedDate: formData.assignedDate,
          dueDate: formData.dueDate,
          submissionType: formData.submissionType,
          status: 'not_started',
          feedback: null,
          score: null
        };
        
        // Add schedule rule only for weekly assignments with valid daysOfWeek
        if (formData.type === 'weekly' && formData.daysOfWeek && formData.daysOfWeek.length > 0) {
          assignment.scheduleRule = { daysOfWeek: formData.daysOfWeek };
        }
        // For non-weekly assignments, don't include scheduleRule at all
        
        await addNewAssignment(assignment);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to create assignment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Assignment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={ASSIGNMENT_TYPES.ONE_TIME}>One-time</option>
                <option value={ASSIGNMENT_TYPES.DAILY}>Daily</option>
                <option value={ASSIGNMENT_TYPES.WEEKLY}>Weekly</option>
                <option value={ASSIGNMENT_TYPES.MONTHLY}>Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Date *
              </label>
              <input
                type="date"
                value={formData.assignedDate}
                onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission Type *
            </label>
            <select
              value={formData.submissionType}
              onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={SUBMISSION_TYPES.TEXT}>Text</option>
              <option value={SUBMISSION_TYPES.FILE}>File</option>
              <option value={SUBMISSION_TYPES.LINK}>Link</option>
            </select>
          </div>

          {/* Days of Week selector for weekly assignments */}
          {formData.type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week * (Select at least one)
              </label>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { value: 0, label: 'Sun' },
                  { value: 1, label: 'Mon' },
                  { value: 2, label: 'Tue' },
                  { value: 3, label: 'Wed' },
                  { value: 4, label: 'Thu' },
                  { value: 5, label: 'Fri' },
                  { value: 6, label: 'Sat' },
                ].map((day) => (
                  <label
                    key={day.value}
                    className={`flex items-center justify-center p-2 border-2 rounded-md cursor-pointer transition-colors ${
                      formData.daysOfWeek?.includes(day.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek?.includes(day.value) || false}
                      onChange={(e) => {
                        const currentDays = formData.daysOfWeek || [];
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            daysOfWeek: [...currentDays, day.value],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            daysOfWeek: currentDays.filter((d) => d !== day.value),
                          });
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssignmentModal;
