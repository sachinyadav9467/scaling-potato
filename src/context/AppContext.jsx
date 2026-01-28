import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCourses, getAssignments, getSubmissions, updateCourse, addCourse, removeCourse, addAssignment } from '../utils/data.js';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('student'); // 'student' or 'tutor'
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    // Load initial data
    setCourses(getCourses());
    setAssignments(getAssignments());
    setSubmissions(getSubmissions());
  }, []);

  const updateCourseData = (courseId, updates) => {
    const updated = updateCourse(courseId, updates);
    if (updated) {
      setCourses([...getCourses()]);
    }
    return updated;
  };

  const addNewCourse = (course) => {
    const newCourse = addCourse(course);
    setCourses([...getCourses()]);
    return newCourse;
  };

  const removeCourseById = (courseId) => {
    const removed = removeCourse(courseId);
    if (removed) {
      setCourses([...getCourses()]);
      setAssignments(getAssignments());
    }
    return removed;
  };

  const addNewAssignment = (assignment) => {
    const newAssignment = addAssignment(assignment);
    setAssignments([...getAssignments()]);
    return newAssignment;
  };

  const updateAssignments = (newAssignments) => {
    setAssignments(newAssignments);
  };

  const updateSubmissions = (newSubmissions) => {
    setSubmissions(newSubmissions);
  };

  const value = {
    userRole,
    setUserRole,
    courses,
    setCourses,
    updateCourseData,
    addNewCourse,
    removeCourseById,
    assignments,
    setAssignments,
    addNewAssignment,
    updateAssignments,
    submissions,
    setSubmissions,
    updateSubmissions,
    currentDate,
    setCurrentDate,
    selectedCourse,
    setSelectedCourse
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
