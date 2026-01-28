import React from 'react';
import { Video, CheckCircle, TrendingUp } from 'lucide-react';

const VideoMetrics = ({ videos = [] }) => {
  const totalVideos = videos.length;
  const watchedVideos = videos.filter(v => v.watched).length;
  const pendingVideos = totalVideos - watchedVideos;
  const progressPercentage = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Videos Watched */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Video className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm text-gray-600">Videos Watched</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {watchedVideos}/{totalVideos}
        </p>
      </div>

      {/* Learning Progress */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm text-gray-600">Learning Progress</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Pending Videos */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-sm text-gray-600">Pending Videos</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{pendingVideos}</p>
      </div>

      {/* Total Videos */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm text-gray-600">Total Videos</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
      </div>
    </div>
  );
};

export default VideoMetrics;
