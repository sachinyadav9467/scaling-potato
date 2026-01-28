import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import VideoPlayer from './VideoPlayer';
import VideoNotes from './VideoNotes';
import { formatDate } from '../../utils/dateUtils';

const VideoCard = ({ video }) => {
  const { getCourse, markVideoAsWatched, getVideoNotes } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const course = getCourse(video.courseId);

  useEffect(() => {
    const loadNotes = async () => {
      setLoadingNotes(true);
      try {
        const videoNotes = await getVideoNotes(video.id);
        setNotes(videoNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setLoadingNotes(false);
      }
    };
    // Only load notes when video player is opened (isPlaying) to reduce API calls
    if (isPlaying) {
      loadNotes();
    }
  }, [video.id, isPlaying, getVideoNotes]);

  const handleWatch = async () => {
    if (!video.watched) {
      try {
        await markVideoAsWatched(video.id);
      } catch (error) {
        console.error('Error marking video as watched:', error);
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Video Header - Always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className="px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1"
                style={{ backgroundColor: `${course?.color}20`, color: course?.color }}
              >
                <span>{course?.icon}</span>
                <span>{course?.name}</span>
              </span>
              {video.watched && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Watched</span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{video.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(video.date, 'MMM dd, yyyy')}</span>
              </span>
              {video.duration && (
                <span className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>{formatDuration(video.duration)}</span>
                </span>
              )}
            </div>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content - Video Player and Notes */}
      {isExpanded && (
        <>
          {/* Video Player */}
          {isPlaying ? (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <VideoPlayer
                videoUrl={video.videoUrl}
                onEnded={handleWatch}
                onClose={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <div 
              className="relative bg-gray-900 aspect-video flex items-center justify-center cursor-pointer group"
              onClick={() => setIsPlaying(true)}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-opacity">
                  <Play className="h-8 w-8 text-gray-900 ml-1" fill="currentColor" />
                </div>
                <span className="text-white text-sm font-medium">Click to play</span>
              </div>
            </div>
          )}

          {/* Video Notes */}
          {notes.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <VideoNotes videoId={video.id} notes={notes} />
            </div>
          )}

          {/* Watch Button */}
          {!isPlaying && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleWatch}
                disabled={video.watched}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  video.watched
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {video.watched ? (
                  <span className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Marked as Watched</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Mark as Watched</span>
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoCard;
