import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getDaysUntilDue, isOverdue, formatDate } from '../utils/dateUtils';
import { ASSIGNMENT_TYPES, ASSIGNMENT_STATUS, SUBMISSION_TYPES } from '../types/index';
import { FileText, Upload, Clock, Paperclip, Eye, Trash2, ChevronDown, ChevronUp, File, X, Save } from 'lucide-react';
import { submissionsAPI, assignmentsAPI } from '../services/api';

const AssignmentCard = ({ assignment, date, onUpdate }) => {
  const { userRole, getCourse, addSubmission, updateAssignment, deleteAssignment, getSubmissionsByAssignment } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [submissionContent, setSubmissionContent] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(assignment.status);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [uploadingNote, setUploadingNote] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedbackText, setFeedbackText] = useState(assignment.feedback || '');
  const [scoreValue, setScoreValue] = useState(assignment.score || '');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const fileInputRef = React.useRef(null);

  const course = getCourse(assignment.courseId);
  const dueDateObj = new Date(assignment.dueDate);
  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
  const overdue = isOverdue(assignment.dueDate);
  
  // Get submission info
  const submissions = getSubmissionsByAssignment(assignment.id);
  const submission = submissions?.[0] || null;
  const submissionDate = submission?.createdAt ? new Date(submission.createdAt) : null;
  const attachmentCount = submission?.fileUrl ? 1 : 0;

  // Load assignment notes when expanded
  useEffect(() => {
    if (isExpanded) {
      loadNotes();
    }
  }, [isExpanded, assignment.id]);

  // Pre-fill submission content if submission exists
  useEffect(() => {
    if (submission && !isEditing) {
      if (submission.submissionType === SUBMISSION_TYPES.TEXT) {
        setSubmissionContent(submission.content || '');
      } else if (submission.submissionType === SUBMISSION_TYPES.LINK) {
        setSubmissionContent(submission.linkUrl || '');
      }
    }
  }, [submission, isEditing]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const response = await assignmentsAPI.getNotes(assignment.id);
      setNotes(response.notes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
      // Don't show error for notes, just log it
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleNoteUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Allow PDF and DOC/DOCX files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Also check file extension as fallback
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      const errorMsg = 'Only PDF and Word documents (.pdf, .doc, .docx) are allowed for notes';
      console.error(errorMsg, { type: file.type, extension: fileExtension });
      setError(errorMsg);
      e.target.value = '';
      return;
    }

    setError('');
    setUploadingNote(true);
    console.log('Uploading note for assignment:', assignment.id);
    
    try {
      const newNote = await assignmentsAPI.addNote(assignment.id, file, file.name);
      console.log('Note uploaded successfully:', newNote);
      setNotes(prev => [newNote, ...prev]);
      e.target.value = '';
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error uploading note:', err);
      const errorMessage = err.message || err.error?.message || 'Failed to upload note. Please try again.';
      setError(errorMessage);
      alert(`Upload failed: ${errorMessage}`); // Show alert for debugging
    } finally {
      setUploadingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setError('');
    try {
      await assignmentsAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err.message || 'Failed to delete note. Please try again.');
    }
  };

  const handleSaveCompletionNotes = async () => {
    if (!completionNotes.trim()) {
      setError('Please enter completion notes');
      return;
    }

    setError('');
    setSavingNotes(true);
    try {
      // Save completion notes as a text submission or update assignment
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      
      // Create or update submission with completion notes
      if (submission) {
        await submissionsAPI.update(submission.id, { content: completionNotes });
      } else {
        await addSubmission({
          assignmentId: assignment.id,
          date: dateStr,
          submissionType: SUBMISSION_TYPES.TEXT,
          content: completionNotes,
        });
      }
      
      setError('');
      alert('Completion notes saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save completion notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      [ASSIGNMENT_STATUS.NOT_STARTED]: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
      [ASSIGNMENT_STATUS.IN_PROGRESS]: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
      [ASSIGNMENT_STATUS.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
      [ASSIGNMENT_STATUS.REVIEWED]: { label: 'Reviewed', color: 'bg-green-100 text-green-700' }
    };
    const status = statusMap[assignment.status] || statusMap[ASSIGNMENT_STATUS.NOT_STARTED];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
        {status.label}
      </span>
    );
  };

  const getTypeBadge = () => {
    const typeMap = {
      [ASSIGNMENT_TYPES.ONE_TIME]: { label: 'One-time', color: 'bg-purple-100 text-purple-700' },
      [ASSIGNMENT_TYPES.DAILY]: { label: 'Daily', color: 'bg-blue-100 text-blue-700' },
      [ASSIGNMENT_TYPES.WEEKLY]: { label: 'Weekly', color: 'bg-indigo-100 text-indigo-700' },
      [ASSIGNMENT_TYPES.MONTHLY]: { label: 'Monthly', color: 'bg-pink-100 text-pink-700' }
    };
    const type = typeMap[assignment.type] || typeMap[ASSIGNMENT_TYPES.ONE_TIME];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${type.color}`}>
        {type.label}
      </span>
    );
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validate content based on submission type
    if (assignment.submissionType === SUBMISSION_TYPES.TEXT) {
      if (!submissionContent || !submissionContent.trim()) {
        setError('Please enter your submission content');
        return;
      }
    } else if (assignment.submissionType === SUBMISSION_TYPES.LINK) {
      if (!submissionContent || !submissionContent.trim()) {
        setError('Please enter a valid URL');
        return;
      }
      // Basic URL validation
      try {
        new URL(submissionContent);
      } catch (e) {
        setError('Please enter a valid URL');
        return;
      }
    }
    
    setUploading(true);
    try {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      
      const submissionData = {
        assignmentId: assignment.id,
        date: dateStr,
        submissionType: assignment.submissionType,
      };

      if (assignment.submissionType === SUBMISSION_TYPES.TEXT) {
        submissionData.content = submissionContent.trim();
      } else if (assignment.submissionType === SUBMISSION_TYPES.LINK) {
        submissionData.linkUrl = submissionContent.trim();
      }

      await addSubmission(submissionData);
      await updateAssignment(assignment.id, { status: ASSIGNMENT_STATUS.SUBMITTED });
      
      setSubmissionStatus(ASSIGNMENT_STATUS.SUBMITTED);
      setIsEditing(false);
      setSubmissionContent(''); // Clear the submission content after successful submission
      if (onUpdate) {
        onUpdate(assignment.id, { status: ASSIGNMENT_STATUS.SUBMITTED });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const response = await submissionsAPI.uploadFile(file, assignment.id, dateStr);
      
      await addSubmission({
        assignmentId: assignment.id,
        date: dateStr,
        submissionType: SUBMISSION_TYPES.FILE,
        fileUrl: response.fileUrl,
      });
      
      await updateAssignment(assignment.id, { status: ASSIGNMENT_STATUS.SUBMITTED });
      setSubmissionStatus(ASSIGNMENT_STATUS.SUBMITTED);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(assignment.id, { status: ASSIGNMENT_STATUS.SUBMITTED });
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateAssignment(assignment.id, { status: newStatus });
      setSubmissionStatus(newStatus);
      if (onUpdate) {
        onUpdate(assignment.id, { status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    setError('');
    setDeleting(true);
    try {
      await deleteAssignment(assignment.id);
      if (onUpdate) {
        onUpdate(assignment.id, { deleted: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to delete assignment. Please try again.');
      setDeleting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() && !scoreValue) {
      setError('Please provide feedback or score');
      return;
    }

    setError('');
    setSubmittingFeedback(true);
    try {
      const updates = {
        status: ASSIGNMENT_STATUS.REVIEWED,
      };
      
      if (feedbackText.trim()) {
        updates.feedback = feedbackText.trim();
      }
      
      if (scoreValue !== '' && scoreValue !== null) {
        const score = parseInt(scoreValue, 10);
        if (isNaN(score) || score < 0 || score > 100) {
          setError('Score must be between 0 and 100');
          setSubmittingFeedback(false);
          return;
        }
        updates.score = score;
      }

      await updateAssignment(assignment.id, updates);
      setSubmissionStatus(ASSIGNMENT_STATUS.REVIEWED);
      if (onUpdate) {
        onUpdate(assignment.id, updates);
      }
      alert('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Format due date display
  const formatDueDate = () => {
    try {
      const due = new Date(assignment.dueDate);
      return formatDate(due, 'EEEE, MMM dd, yyyy');
    } catch (e) {
      return assignment.dueDate;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
          <span
            className="px-3 py-1.5 text-xs font-medium rounded-full flex items-center space-x-1.5"
            style={{ backgroundColor: `${course?.color}20`, color: course?.color }}
          >
            <span>{course?.icon}</span>
            <span>{course?.name}</span>
          </span>
            {getTypeBadge()}
          </div>
          <div className="flex items-center space-x-2">
          {getStatusBadge()}
            {userRole === 'tutor' && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 border border-red-200"
                title="Delete assignment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
        {assignment.description && (
          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
        )}

        {/* Due Date - Always visible */}
        <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-100">
          <span className="text-gray-600 flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Due Date:</span>
          </span>
          <span className={`font-medium ${
            overdue ? 'text-red-600' : daysUntilDue <= 2 ? 'text-orange-600' : 'text-gray-900'
          }`}>
            {formatDueDate()}
            {overdue && <span className="ml-2 text-xs">(Overdue)</span>}
            {!overdue && daysUntilDue <= 2 && daysUntilDue >= 0 && (
              <span className="ml-2 text-xs">({daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'} left)</span>
            )}
          </span>
        </div>
          </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

          {/* Student Features - Always Visible */}
        {userRole === 'student' && (
            <>
              {/* Status Selector */}
              <div className="border-t border-gray-200 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Status</label>
                <select
                  value={submissionStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={ASSIGNMENT_STATUS.NOT_STARTED}>Not Started</option>
                  <option value={ASSIGNMENT_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={ASSIGNMENT_STATUS.SUBMITTED}>Submitted</option>
                </select>
              </div>

              {/* Completion Description/Notes */}
              <div className="border-t border-gray-200 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes / Description
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add your completion notes, progress updates, or any description about this assignment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="4"
                />
                <button
                  onClick={handleSaveCompletionNotes}
                  disabled={savingNotes || !completionNotes.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>

              {/* PDF/DOC Notes Section */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Attached Notes (PDF/DOC)</span>
                    {notes.length > 0 && (
                      <span className="text-xs text-gray-500">({notes.length} file{notes.length !== 1 ? 's' : ''})</span>
                    )}
                  </h4>
          <div>
                    <input
                      ref={fileInputRef}
                      id={`note-upload-${assignment.id}`}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleNoteUpload}
                      className="hidden"
                      disabled={uploadingNote}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        console.log('Attach File button clicked');
                        e.preventDefault();
                        e.stopPropagation();
                        if (!uploadingNote) {
                          if (fileInputRef.current) {
                            console.log('File input found, clicking...', fileInputRef.current.id);
                            fileInputRef.current.click();
                          } else {
                            console.error('File input ref is null');
                            // Fallback: try to find by ID
                            const input = document.getElementById(`note-upload-${assignment.id}`);
                            if (input) {
                              console.log('Found input by ID, clicking...');
                              input.click();
                            } else {
                              console.error('Could not find file input element');
                            }
                          }
                        } else {
                          console.log('Upload already in progress');
                        }
                      }}
                      disabled={uploadingNote}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="h-3 w-3 mr-1.5" />
                      {uploadingNote ? 'Uploading...' : 'Attach File'}
                    </button>
                  </div>
                </div>

                {loadingNotes ? (
                  <div className="text-sm text-gray-500 text-center py-2">Loading notes...</div>
                ) : notes.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded p-3">
                    No files attached yet. Click "Attach File" to upload PDF or Word documents.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <File className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 truncate"
                            title={note.fileName}
                          >
                            {note.fileName}
                          </a>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({note.fileSize ? `${(note.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'})
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                          title="Delete note"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Section */}
            {!isEditing ? (
                <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {submission 
                  ? 'Resubmit' 
                  : assignment.status === ASSIGNMENT_STATUS.IN_PROGRESS 
                    ? 'Continue Submission' 
                    : 'Start Submission'}
              </button>
              {submission && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You can resubmit to update your submission
                </p>
              )}
                </div>
            ) : isEditing ? (
                <div className="border-t border-gray-200 pt-3 space-y-2">
                {assignment.submissionType === SUBMISSION_TYPES.TEXT && (
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter your submission..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows="4"
                  />
                )}
                {assignment.submissionType === SUBMISSION_TYPES.FILE && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload file</p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id={`file-upload-${assignment.id}`}
                      disabled={uploading}
                    />
                    <label
                      htmlFor={`file-upload-${assignment.id}`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                  </div>
                )}
                {assignment.submissionType === SUBMISSION_TYPES.LINK && (
                  <input
                    type="url"
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter submission URL..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {uploading ? (submission ? 'Resubmitting...' : 'Submitting...') : (submission ? 'Resubmit' : 'Submit')}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={uploading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                {assignment.feedback && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-gray-900 mb-1">Teacher's Remark:</p>
                    <p className="text-sm text-gray-700 mb-2">{assignment.feedback}</p>
                    {assignment.score !== null && (
                      <p className="text-sm font-semibold text-gray-900">
                        Score: {assignment.score}/100
                      </p>
                    )}
                  </div>
                )}
                
                  {submission && (
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View Submission</span>
                </button>
            )}
          </div>
              )}
            </>
        )}

          {/* Teacher Feedback Section */}
        {userRole === 'tutor' && (assignment.status === ASSIGNMENT_STATUS.SUBMITTED || assignment.status === ASSIGNMENT_STATUS.REVIEWED) && (
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {assignment.status === ASSIGNMENT_STATUS.REVIEWED ? 'Update Feedback' : 'Add Feedback'}
              </label>
            <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Add feedback for the student..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="3"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                placeholder="Score"
                min="0"
                max="100"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-sm text-gray-500">/ 100</span>
              <button 
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {submittingFeedback ? 'Submitting...' : (assignment.status === ASSIGNMENT_STATUS.REVIEWED ? 'Update Feedback' : 'Submit Feedback')}
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AssignmentCard;
