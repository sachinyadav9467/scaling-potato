import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, getPreviousDay, getNextDay, isSameDate } from '../utils/dateUtils';
import VideoCard from '../components/videos/VideoCard';
import VideoMetrics from '../components/videos/VideoMetrics';
import AddVideoModal from '../components/videos/AddVideoModal';

const DailyVideosView = () => {
  const {
    currentDate,
    setCurrentDate,
    courses,
    getVideosForDate,
    getCourse,
    userRole,
  } = useApp();
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const dateVideos = await getVideosForDate(currentDate);
      setVideos(dateVideos);

      // Group videos by course
      const grouped = {};
      dateVideos.forEach((video) => {
        if (!grouped[video.courseId]) {
          grouped[video.courseId] = [];
        }
        grouped[video.courseId].push(video);
      });
      setGroupedVideos(grouped);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
      setGroupedVideos({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [currentDate, refreshKey]); // Refresh when date or key changes

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePreviousDay = () => {
    setCurrentDate(getPreviousDay(currentDate));
  };

  const handleNextDay = () => {
    setCurrentDate(getNextDay(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = isSameDate(currentDate, new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {formatDate(currentDate, 'EEEE, MMMM dd, yyyy')}
                </h2>
              </div>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Go to Today
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Show Add Video button for both students and tutors */}
            <button
              onClick={() => setShowAddVideoModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Video</span>
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Metrics */}
      <VideoMetrics videos={videos} />

      {/* Videos by Course */}
      {Object.keys(groupedVideos).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos for This Date</h3>
          <p className="text-gray-600">
            There are no videos scheduled for {formatDate(currentDate, 'MMMM dd, yyyy')}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVideos).map(([courseId, courseVideos]) => {
            const course = getCourse(courseId);
            if (!course) return null;

            return (
              <div key={courseId} className="space-y-4">
                {/* Course Header */}
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${course.color}20`, color: course.color }}
                  >
                    {course.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.tutor}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      {courseVideos.length} video{courseVideos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Videos List */}
                <div className="space-y-4">
                  {courseVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <AddVideoModal
          date={currentDate}
          onClose={() => {
            setShowAddVideoModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

export default DailyVideosView;
