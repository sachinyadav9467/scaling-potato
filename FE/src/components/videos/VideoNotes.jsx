import React from 'react';
import { FileText, Download, Paperclip } from 'lucide-react';

const VideoNotes = ({ videoId, notes }) => {
  if (!notes || notes.length === 0) {
    return null;
  }

  const handleDownload = (note) => {
    if (note.fileUrl) {
      window.open(note.fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-3">
        <Paperclip className="h-4 w-4 text-gray-600" />
        <h4 className="text-sm font-medium text-gray-900">
          Notes ({notes.length})
        </h4>
      </div>
      <div className="space-y-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {note.title || note.fileName}
                </p>
                {note.fileSize && (
                  <p className="text-xs text-gray-500">
                    {(note.fileSize / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDownload(note)}
              className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 flex-shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoNotes;
