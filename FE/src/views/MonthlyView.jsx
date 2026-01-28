import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, getMonthDates, addMonthsToDate, subMonthsFromDate, isSameDate, startOfMonth, endOfMonth } from '../utils/dateUtils';
import { getMonthlyMetrics } from '../utils/metrics';
import { metricsAPI } from '../services/api';
import MetricsCard from '../components/MetricsCard';
import { Link } from 'react-router-dom';

const MonthlyView = () => {
  const { currentDate, setCurrentDate, assignments, getAssignmentsForDate, getCourse } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [dayAssignmentsMap, setDayAssignmentsMap] = useState({});
  const monthStart = startOfMonth(currentDate);
  const monthDates = getMonthDates(currentDate);

  // Get first day of week for the month start
  const firstDayOfWeek = monthStart.getDay();
  const daysBeforeMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0

  const handlePreviousMonth = () => {
    setCurrentDate(subMonthsFromDate(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonthsToDate(currentDate, 1));
  };

  const handleThisMonth = () => {
    setCurrentDate(new Date());
  };

  const isCurrentMonth = isSameDate(monthStart, startOfMonth(new Date()));

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await metricsAPI.getMonthly(year, month);
        setMetrics(response);
      } catch (error) {
        console.error('Error loading monthly metrics:', error);
        // Fallback to client-side calculation
        const calculated = getMonthlyMetrics(assignments, currentDate);
        setMetrics(calculated);
      }
    };
    loadMetrics();
  }, [currentDate, assignments]);

  // Load assignments for each day in the month
  useEffect(() => {
    const loadDayAssignments = async () => {
      const assignmentsMap = {};
      for (const date of monthDates) {
        try {
          const dayAssignments = await getAssignmentsForDate(date);
          assignmentsMap[formatDate(date, 'yyyy-MM-dd')] = Array.isArray(dayAssignments) ? dayAssignments : [];
        } catch (error) {
          console.error('Error loading assignments for date:', error);
          assignmentsMap[formatDate(date, 'yyyy-MM-dd')] = [];
        }
      }
      setDayAssignmentsMap(assignmentsMap);
    };
    loadDayAssignments();
  }, [currentDate, getAssignmentsForDate]);

  const getAssignmentDensity = (date) => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    const dayAssignments = dayAssignmentsMap[dateStr] || [];
    return dayAssignments.length;
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 4) return 'bg-yellow-300';
    if (count <= 6) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getCompletionRate = (date) => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    const dayAssignments = dayAssignmentsMap[dateStr] || [];
    if (dayAssignments.length === 0) return 0;
    const completed = dayAssignments.filter(a => 
      a.status === 'submitted' || a.status === 'reviewed'
    ).length;
    return (completed / dayAssignments.length) * 100;
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before month start
  for (let i = 0; i < daysBeforeMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add month days
  monthDates.forEach(date => {
    calendarDays.push(date);
  });

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {formatDate(currentDate, 'MMMM yyyy')}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={handleThisMonth}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  Go to This Month
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && <MetricsCard title="Monthly Metrics" metrics={metrics} type="monthly" />}

      {/* Calendar Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">Assignment Density</h3>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-100 rounded" />
              <span>0</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-200 rounded" />
              <span>1-2</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-300 rounded" />
              <span>3-4</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-400 rounded" />
              <span>5-6</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>7+</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const density = getAssignmentDensity(date);
            const completionRate = getCompletionRate(date);
            const isToday = isSameDate(date, new Date());
            const isPast = date < new Date() && !isToday;

            return (
              <Link
                key={formatDate(date, 'yyyy-MM-dd')}
                to="/daily"
                onClick={() => setCurrentDate(date)}
                className={`aspect-square p-2 rounded border transition-all hover:shadow-md ${
                  isToday ? 'ring-2 ring-blue-500' : 'border-gray-200'
                } ${isPast ? 'opacity-60' : ''}`}
                title={`${formatDate(date, 'MMM dd')}: ${density} assignments, ${Math.round(completionRate)}% complete`}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-xs font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {formatDate(date, 'd')}
                  </span>
                  <div className={`flex-1 rounded ${getHeatmapColor(density)}`} />
                  {completionRate > 0 && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Course Difficulty */}
      {metrics && metrics.courseDifficulty && Object.keys(metrics.courseDifficulty).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Course Difficulty Index</h3>
          <div className="space-y-3">
            {Object.entries(metrics.courseDifficulty).map(([courseId, stats]) => {
              const course = getCourse(courseId);
              return (
                <div key={courseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: course?.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{course?.name}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      stats.difficulty === 'high' ? 'bg-red-100 text-red-700' :
                      stats.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {stats.difficulty}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="text-gray-900">{Math.round(stats.completionRate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Delay Rate</span>
                      <span className="text-gray-900">{Math.round(stats.delayRate)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;
