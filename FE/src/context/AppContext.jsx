import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, coursesAPI, assignmentsAPI, submissionsAPI, metricsAPI, videosAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoNotes, setVideoNotes] = useState({}); // {videoId: [notes]}
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coursesData, assignmentsData, submissionsData] = await Promise.all([
        coursesAPI.getAll(),
        assignmentsAPI.getAll(),
        submissionsAPI.getAll(),
      ]);

      setCourses(coursesData.courses || []);
      setAssignments(assignmentsData.assignments || []);
      setSubmissions(submissionsData.submissions || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message);
      // Don't throw - allow app to continue even if API fails
    } finally {
      setLoading(false);
    }
  };

  // Initialize user from localStorage
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUser = authAPI.getCurrentUser();
        const hasToken = authAPI.isAuthenticated();
        
        if (savedUser && hasToken) {
          setUser(savedUser);
          setUserRole(savedUser.role);
          // Load data in background, don't block UI
          loadInitialData().catch(err => {
            console.error('Failed to load initial data:', err);
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
        // Clear invalid auth data
        try {
          authAPI.logout();
        } catch (logoutErr) {
          console.error('Logout error:', logoutErr);
        }
      } finally {
        // Always set loading to false so UI can render
        setLoading(false);
      }
    };

    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Course operations
  const updateCourseData = async (courseId, updates) => {
    try {
      const updated = await coursesAPI.update(courseId, updates);
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? updated : course))
      );
      return updated;
    } catch (err) {
      console.error('Error updating course:', err);
      throw err;
    }
  };

  const addNewCourse = async (courseData) => {
    try {
      const newCourse = await coursesAPI.create(courseData);
      setCourses((prev) => [...prev, newCourse]);
      return newCourse;
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  };

  const removeCourseById = async (courseId) => {
    try {
      await coursesAPI.delete(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      // Reload assignments as they may have been deleted
      const assignmentsData = await assignmentsAPI.getAll();
      setAssignments(assignmentsData.assignments || []);
      return true;
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  };

  // Assignment operations
  const addNewAssignment = async (assignmentData) => {
    try {
      const newAssignment = await assignmentsAPI.create(assignmentData);
      setAssignments((prev) => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      console.error('Error creating assignment:', err);
      throw err;
    }
  };

  const updateAssignment = async (assignmentId, updates) => {
    try {
      const updated = await assignmentsAPI.update(assignmentId, updates);
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId ? updated : assignment
        )
      );
      return updated;
    } catch (err) {
      console.error('Error updating assignment:', err);
      throw err;
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await assignmentsAPI.delete(assignmentId);
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== assignmentId)
      );
      return true;
    } catch (err) {
      console.error('Error deleting assignment:', err);
      throw err;
    }
  };

  // Submission operations
  const addSubmission = async (submissionData) => {
    try {
      const newSubmission = await submissionsAPI.create(submissionData);
      setSubmissions((prev) => [...prev, newSubmission]);
      // Update assignment status to submitted
      if (submissionData.assignmentId) {
        await updateAssignment(submissionData.assignmentId, {
          status: 'submitted',
        });
      }
      return newSubmission;
    } catch (err) {
      console.error('Error creating submission:', err);
      throw err;
    }
  };

  const updateSubmission = async (submissionId, updates) => {
    try {
      const updated = await submissionsAPI.update(submissionId, updates);
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === submissionId ? updated : submission
        )
      );
      return updated;
    } catch (err) {
      console.error('Error updating submission:', err);
      throw err;
    }
  };

  // Get assignments for a specific date (client-side filtering for now)
  const getAssignmentsForDate = async (date) => {
    try {
      // Format date in local timezone using formatDate utility to avoid timezone shifts
      const dateStr = typeof date === 'string' ? date : formatDate(date, 'yyyy-MM-dd');
      const response = await assignmentsAPI.getByDate(dateStr);
      return response.assignments || [];
    } catch (err) {
      console.error('Error fetching assignments for date:', err);
      // Fallback to client-side filtering
      const dateStr = typeof date === 'string' ? date : formatDate(date, 'yyyy-MM-dd');
      return assignments.filter((assignment) => {
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();

        if (assignment.type === 'one-time') {
          return assignment.assignedDate <= dateStr && assignment.dueDate >= dateStr;
        }

        if (assignment.type === 'daily') {
          return assignment.assignedDate <= dateStr && assignment.dueDate >= dateStr;
        }

        if (assignment.type === 'weekly') {
          if (assignment.scheduleRule?.daysOfWeek) {
            return (
              assignment.scheduleRule.daysOfWeek.includes(dayOfWeek) &&
              assignment.assignedDate <= dateStr &&
              assignment.dueDate >= dateStr
            );
          }
        }

        if (assignment.type === 'monthly') {
          const assignedDate = new Date(assignment.assignedDate);
          const dayOfMonth = dateObj.getDate();
          return (
            dayOfMonth === assignedDate.getDate() &&
            assignment.assignedDate <= dateStr &&
            assignment.dueDate >= dateStr
          );
        }

        return false;
      });
    }
  };

  // Get course by ID
  const getCourse = (courseId) => {
    return courses.find((c) => c.id === courseId);
  };

  // Get assignment by ID
  const getAssignment = (assignmentId) => {
    return assignments.find((a) => a.id === assignmentId);
  };

  // Get submissions by assignment ID
  const getSubmissionsByAssignment = (assignmentId) => {
    return submissions.filter((s) => s.assignmentId === assignmentId);
  };

  // Video operations - memoize to prevent unnecessary re-renders
  const getVideosForDate = useCallback(async (date) => {
    try {
      // Format date in local timezone using formatDate utility to avoid timezone shifts
      const dateStr = typeof date === 'string' ? date : formatDate(date, 'yyyy-MM-dd');
      const response = await videosAPI.getAll({ date: dateStr });
      return response.videos || [];
    } catch (err) {
      console.error('Error fetching videos for date:', err);
      return [];
    }
  }, []);

  const getVideosForCourse = async (courseId) => {
    try {
      const response = await videosAPI.getAll({ courseId });
      return response.videos || [];
    } catch (err) {
      console.error('Error fetching videos for course:', err);
      return [];
    }
  };

  const markVideoAsWatched = async (videoId) => {
    try {
      const updated = await videosAPI.markWatched(videoId);
      setVideos((prev) =>
        prev.map((video) => (video.id === videoId ? updated : video))
      );
      return updated;
    } catch (err) {
      console.error('Error marking video as watched:', err);
      throw err;
    }
  };

  const addVideo = async (videoData) => {
    try {
      const newVideo = await videosAPI.create(videoData);
      setVideos((prev) => [...prev, newVideo]);
      return newVideo;
    } catch (err) {
      console.error('Error creating video:', err);
      throw err;
    }
  };

  const updateVideo = async (videoId, updates) => {
    try {
      const updated = await videosAPI.update(videoId, updates);
      setVideos((prev) =>
        prev.map((video) => (video.id === videoId ? updated : video))
      );
      return updated;
    } catch (err) {
      console.error('Error updating video:', err);
      throw err;
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      await videosAPI.delete(videoId);
      setVideos((prev) => prev.filter((video) => video.id !== videoId));
      return true;
    } catch (err) {
      console.error('Error deleting video:', err);
      throw err;
    }
  };

  const getVideoNotes = useCallback(async (videoId) => {
    try {
      // Return cached notes if available
      if (videoNotes[videoId]) {
        return videoNotes[videoId];
      }
      const response = await videosAPI.getNotes(videoId);
      const notes = response.notes || [];
      setVideoNotes((prev) => ({ ...prev, [videoId]: notes }));
      return notes;
    } catch (err) {
      console.error('Error fetching video notes:', err);
      return [];
    }
  }, [videoNotes]);

  const addVideoNote = async (videoId, noteData) => {
    try {
      const newNote = await videosAPI.addNote(videoId, noteData);
      setVideoNotes((prev) => ({
        ...prev,
        [videoId]: [...(prev[videoId] || []), newNote],
      }));
      return newNote;
    } catch (err) {
      console.error('Error adding video note:', err);
      throw err;
    }
  };

  const deleteVideoNote = async (noteId, videoId) => {
    try {
      await videosAPI.deleteNote(noteId);
      setVideoNotes((prev) => ({
        ...prev,
        [videoId]: (prev[videoId] || []).filter((note) => note.id !== noteId),
      }));
      return true;
    } catch (err) {
      console.error('Error deleting video note:', err);
      throw err;
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setUserRole('student');
      setCourses([]);
      setAssignments([]);
      setSubmissions([]);
      setVideos([]);
      setVideoNotes({});
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const value = {
    // User
    user,
    setUser,
    userRole,
    setUserRole,
    loading,
    error,
    setError,

    // Courses
    courses,
    setCourses,
    updateCourseData,
    addNewCourse,
    removeCourseById,
    getCourse,

    // Assignments
    assignments,
    setAssignments,
    addNewAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForDate,
    getAssignment,

    // Submissions
    submissions,
    setSubmissions,
    addSubmission,
    updateSubmission,
    getSubmissionsByAssignment,

    // Videos
    videos,
    setVideos,
    getVideosForDate,
    getVideosForCourse,
    markVideoAsWatched,
    addVideo,
    updateVideo,
    deleteVideo,
    videoNotes,
    getVideoNotes,
    addVideoNote,
    deleteVideoNote,

    // UI State
    currentDate,
    setCurrentDate,
    selectedCourse,
    setSelectedCourse,

    // Auth
    handleLogout,
    loadInitialData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
