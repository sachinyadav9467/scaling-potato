import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAssignmentsForDate } from '../utils/data.js';
import { formatDate, getWeekDates, addWeeksToDate, subWeeksFromDate, isSameDate } from '../utils/dateUtils.js';
import { getWeeklyMetrics } from '../utils/metrics.js';
import { getCourse } from '../utils/data.js';
import MetricsCard from '../components/MetricsCard.jsx';
import { Link } from 'react-router-dom';

const WeeklyView = () => {
  const { currentDate, setCurrentDate } = useApp();
  const weekDates = getWeekDates(currentDate);
  const metrics = getWeeklyMetrics(currentDate);

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeksFromDate(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeksToDate(currentDate, 1));
  };

  const handleThisWeek = () => {
    setCurrentDate(new Date());
  };

  const isCurrentWeek = weekDates.some(date => isSameDate(date, new Date()));

  const getWorkloadDensity = (date) => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    const assignments = getAssignmentsForDate(dateStr);
    return assignments.length;
  };

  const getDensityColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-100';
    if (count <= 4) return 'bg-yellow-100';
    if (count <= 6) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                Week of {formatDate(weekDates[0], 'MMM dd')} - {formatDate(weekDates[6], 'MMM dd, yyyy')}
              </h2>
              {!isCurrentWeek && (
                <button
                  onClick={handleThisWeek}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  Go to This Week
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <MetricsCard title="Weekly Metrics" metrics={metrics} type="weekly" />

      {/* Week Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {weekDates.map((date, index) => {
            const dateStr = formatDate(date, 'yyyy-MM-dd');
            const dayAssignments = getAssignmentsForDate(dateStr);
            const density = getWorkloadDensity(date);
            const isToday = isSameDate(date, new Date());
            const isPast = date < new Date() && !isToday;

            return (
              <div
                key={index}
                className={`p-3 min-h-[200px] ${isPast ? 'bg-gray-50' : 'bg-white'} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="mb-2">
                  <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {formatDate(date, 'EEE')}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {formatDate(date, 'd')}
                  </p>
                </div>

                <div className={`w-full h-2 rounded mb-2 ${getDensityColor(density)}`} />

                <div className="space-y-1">
                  {dayAssignments.slice(0, 3).map(assignment => {
                    const course = getCourse(assignment.courseId);
                    return (
                      <Link
                        key={assignment.id}
                        to="/"
                        onClick={() => setCurrentDate(date)}
                        className="block text-xs p-1 rounded truncate hover:bg-gray-100 transition-colors"
                        style={{
                          backgroundColor: `${course?.color}20`,
                          color: course?.color
                        }}
                        title={assignment.title}
                      >
                        {assignment.title}
                      </Link>
                    );
                  })}
                  {dayAssignments.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{dayAssignments.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Workload */}
      {metrics.courseWorkload && Object.keys(metrics.courseWorkload).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Course Workload</h3>
          <div className="space-y-2">
            {Object.entries(metrics.courseWorkload).map(([courseId, count]) => {
              const course = getCourse(courseId);
              return (
                <div key={courseId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: course?.color }}
                    />
                    <span className="text-sm text-gray-700">{course?.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count} assignments</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyView;
