import React, { useState } from 'react';
import { X } from 'lucide-react';

const VideoPlayer = ({ videoUrl, onEnded, onClose }) => {
  const [error, setError] = useState(null);

  // Handle video ended event
  const handleVideoEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <div className="relative w-full">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={videoUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setError('Failed to load video')}
          onEnded={handleVideoEnded}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
