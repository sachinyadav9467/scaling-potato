import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAssignmentsForDate as filterAssignmentsByDate } from '../utils/data';
import { formatDate, getPreviousDay, getNextDay, isSameDate } from '../utils/dateUtils';
import { metricsAPI } from '../services/api';
import AssignmentCard from '../components/AssignmentCard';
import CourseCard from '../components/CourseCard';
import CourseDetailModal from '../components/CourseDetailModal';
import AddCourseModal from '../components/AddCourseModal';
import AddAssignmentModal from '../components/AddAssignmentModal';
import MetricsCard from '../components/MetricsCard';

const DailyView = () => {
  const {
    currentDate,
    setCurrentDate,
    courses,
    assignments,
    getAssignmentsForDate,
    getCourse,
    updateAssignment,
    selectedCourse,
    setSelectedCourse,
    loading,
    userRole,
  } = useApp();
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [dayAssignments, setDayAssignments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const dateStr = formatDate(currentDate, 'yyyy-MM-dd');

  const loadData = async () => {
    try {
      const [assignmentsData, metricsData] = await Promise.all([
        getAssignmentsForDate(currentDate),
        metricsAPI.getDaily(dateStr),
      ]);
      setDayAssignments(assignmentsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading daily data:', error);
      // Fallback to client-side filtering
      const filtered = filterAssignmentsByDate(assignments, dateStr);
      setDayAssignments(filtered);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate, refreshKey]); // Refresh when date or key changes

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Group assignments by course
  const assignmentsByCourse = {};
  dayAssignments.forEach(assignment => {
    if (!assignmentsByCourse[assignment.courseId]) {
      assignmentsByCourse[assignment.courseId] = [];
    }
    assignmentsByCourse[assignment.courseId].push(assignment);
  });

  const handlePreviousDay = () => {
    setCurrentDate(getPreviousDay(currentDate));
  };

  const handleNextDay = () => {
    setCurrentDate(getNextDay(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAssignmentUpdate = async (assignmentId, updates) => {
    try {
      // If assignment was deleted, remove it from the list
      if (updates.deleted) {
        setDayAssignments(prev => prev.filter(a => a.id !== assignmentId));
        return;
      }
      
      await updateAssignment(assignmentId, updates);
      // Reload assignments for the current date
      const assignmentsData = await getAssignmentsForDate(currentDate);
      setDayAssignments(assignmentsData);
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const isToday = isSameDate(currentDate, new Date());

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {formatDate(currentDate, 'EEEE, MMMM dd, yyyy')}
              </h2>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  Go to Today
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && <MetricsCard title="Daily Metrics" metrics={metrics} type="daily" />}

      {/* Course Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Courses Overview</h3>
          {userRole === 'tutor' && (
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Course</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              date={currentDate}
              assignments={dayAssignments}
            />
          ))}
        </div>
      </div>

      {/* Assignments by Course */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
          {userRole === 'tutor' && (
            <button
              onClick={() => setShowAddAssignmentModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Assignment</span>
            </button>
          )}
        </div>
        {Object.keys(assignmentsByCourse).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No assignments for this day</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(assignmentsByCourse).map(([courseId, courseAssignments]) => {
              const course = getCourse(courseId);
              return (
                <div key={courseId}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: course?.color }}
                    />
                    <h4 className="text-md font-semibold text-gray-900">{course?.name}</h4>
                    <span className="text-sm text-gray-500">
                      ({courseAssignments.length} {courseAssignments.length === 1 ? 'assignment' : 'assignments'})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {courseAssignments.map(assignment => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        date={currentDate}
                        onUpdate={handleAssignmentUpdate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          courseId={selectedCourse.id}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <AddCourseModal
          onClose={() => {
            setShowAddCourseModal(false);
            handleRefresh();
          }}
        />
      )}

      {/* Add Assignment Modal */}
      {showAddAssignmentModal && (
        <AddAssignmentModal
          onClose={() => {
            setShowAddAssignmentModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

export default DailyView;
