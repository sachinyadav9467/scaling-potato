import React from 'react';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, Video, FileText } from 'lucide-react';

const MetricsCard = ({ title, metrics, type = 'daily' }) => {
  const renderDailyMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Video className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm text-gray-600">Videos Watched</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {metrics.watched || 0}/{metrics.total || 0}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-sm text-gray-600">Submitted</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {metrics.completed || 0}/{metrics.total || 0}
        </p>
        {metrics.total > 0 && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${((metrics.completed || 0) / metrics.total) * 100}%` }}
            />
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm text-gray-600">Learning Progress</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {metrics.completionRate ? Math.round(metrics.completionRate) : 0}%
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-sm text-gray-600">Pending Tasks</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{metrics.pending || 0}</p>
      </div>
    </div>
  );

  const renderCompletionRate = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Completion Rate</span>
        </div>
        <span className="text-2xl font-bold text-blue-600">
          {metrics.completionRate ? Math.round(metrics.completionRate) : 0}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${metrics.completionRate || 0}%` }}
        />
      </div>
    </div>
  );

  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      {type === 'daily' && renderDailyMetrics()}
      {type === 'weekly' && (
        <>
          {renderDailyMetrics()}
          {renderCompletionRate()}
        </>
      )}
      {type === 'monthly' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Consistency Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {metrics.consistencyScore ? Math.round(metrics.consistencyScore) : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Completed</p>
              <p className="text-2xl font-bold text-green-600">{metrics.completed || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
