import React, { useState, useEffect } from 'react';
import { X, Video, Paperclip, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCourse } from '../utils/data.js';
import { formatDate } from '../utils/dateUtils.js';

const CourseDetailModal = ({ courseId, onClose }) => {
  const { updateCourseData, courses, removeCourseById, setSelectedCourse } = useApp();
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newAttachment, setNewAttachment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Get the current course from context to ensure we have the latest data
  const course = courseId ? courses.find(c => c.id === courseId) || getCourse(courseId) : null;

  // Update local state when course changes in context
  useEffect(() => {
    if (courseId) {
      const updatedCourse = courses.find(c => c.id === courseId) || getCourse(courseId);
      if (updatedCourse) {
        // Force re-render by updating state if needed
      }
    }
  }, [courses, courseId]);

  if (!course) return null;

  const handleAddVideoUrl = () => {
    if (newVideoUrl.trim()) {
      const currentCourse = courses.find(c => c.id === course.id) || course;
      const updatedVideoUrls = [...(currentCourse.videoUrls || []), newVideoUrl.trim()];
      updateCourseData(course.id, { videoUrls: updatedVideoUrls });
      setNewVideoUrl('');
    }
  };

  const handleRemoveVideoUrl = (index) => {
    const currentCourse = courses.find(c => c.id === course.id) || course;
    const updatedVideoUrls = (currentCourse.videoUrls || []).filter((_, i) => i !== index);
    updateCourseData(course.id, { videoUrls: updatedVideoUrls });
  };

  const handleAddAttachment = () => {
    if (newAttachment.trim()) {
      const currentCourse = courses.find(c => c.id === course.id) || course;
      const updatedAttachments = [...(currentCourse.attachments || []), newAttachment.trim()];
      updateCourseData(course.id, { attachments: updatedAttachments });
      setNewAttachment('');
    }
  };

  const handleRemoveAttachment = (index) => {
    const currentCourse = courses.find(c => c.id === course.id) || course;
    const updatedAttachments = (currentCourse.attachments || []).filter((_, i) => i !== index);
    updateCourseData(course.id, { attachments: updatedAttachments });
  };

  const handleDeleteCourse = () => {
    if (removeCourseById(course.id)) {
      setSelectedCourse(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${course.color}20`, color: course.color }}
            >
              {course.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
              <p className="text-sm text-gray-500">{course.tutor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Dates */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Course Duration</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Start:</span> {formatDate(course.startDate, 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="font-medium">End:</span> {formatDate(course.endDate, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          {/* Video URLs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Video URLs</span>
              </h3>
            </div>
            <div className="space-y-2">
              {course.videoUrls && course.videoUrls.length > 0 ? (
                (course.videoUrls || []).map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 truncate mr-2"
                    >
                      {url}
                    </a>
                    <button
                      onClick={() => handleRemoveVideoUrl(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No video URLs added yet</p>
              )}
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Enter video URL..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddVideoUrl();
                    }
                  }}
                />
                <button
                  onClick={handleAddVideoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Paperclip className="h-4 w-4" />
                <span>Attachments</span>
              </h3>
            </div>
            <div className="space-y-2">
              {course.attachments && course.attachments.length > 0 ? (
                (course.attachments || []).map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 truncate mr-2"
                    >
                      {attachment}
                    </a>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No attachments added yet</p>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  placeholder="Enter attachment URL or name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAttachment();
                    }
                  }}
                />
                <button
                  onClick={handleAddAttachment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Course</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{course.name}</strong>? This action cannot be undone and will also delete all assignments associated with this course.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailModal;
