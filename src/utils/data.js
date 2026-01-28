// Mock data storage (in a real app, this would be API calls)
let courses = [
  { 
    id: '1', 
    name: 'Mathematics', 
    color: '#3B82F6', 
    icon: '📐', 
    tutor: 'Dr. Smith', 
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    videoUrls: [],
    attachments: []
  },
  { 
    id: '2', 
    name: 'English', 
    color: '#10B981', 
    icon: '📚', 
    tutor: 'Ms. Johnson', 
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    videoUrls: [],
    attachments: []
  },
  { 
    id: '3', 
    name: 'Science', 
    color: '#F59E0B', 
    icon: '🔬', 
    tutor: 'Mr. Brown', 
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    videoUrls: [],
    attachments: []
  }
];

let assignments = [
  {
    id: '1',
    title: 'Algebra Homework',
    description: 'Complete exercises 1-10',
    courseId: '1',
    type: 'daily',
    assignedDate: '2024-01-01',
    dueDate: '2024-01-15',
    submissionType: 'text',
    status: 'in_progress',
    scheduleRule: { daysOfWeek: [1, 3, 5] }, // Monday, Wednesday, Friday
    feedback: null,
    score: null
  },
  {
    id: '2',
    title: 'Essay Writing',
    description: 'Write a 500-word essay on climate change',
    courseId: '2',
    type: 'one-time',
    assignedDate: '2024-01-10',
    dueDate: '2024-01-20',
    submissionType: 'file',
    status: 'not_started',
    scheduleRule: null,
    feedback: null,
    score: null
  }
];

let submissions = {};

// Helper functions
export const getCourses = () => courses;
export const getCourse = (id) => courses.find(c => c.id === id);
export const addCourse = (course) => {
  const newCourse = { 
    ...course, 
    id: Date.now().toString(),
    videoUrls: course.videoUrls || [],
    attachments: course.attachments || []
  };
  courses.push(newCourse);
  return newCourse;
};
export const updateCourse = (id, updates) => {
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates };
    return courses[index];
  }
  return null;
};
export const removeCourse = (id) => {
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    // Remove all assignments associated with this course
    const assignmentIndices = [];
    assignments.forEach((assignment, idx) => {
      if (assignment.courseId === id) {
        assignmentIndices.push(idx);
      }
    });
    // Remove assignments in reverse order to maintain correct indices
    assignmentIndices.reverse().forEach(idx => {
      assignments.splice(idx, 1);
    });
    
    // Remove the course
    courses.splice(index, 1);
    return true;
  }
  return false;
};

export const getAssignments = () => assignments;
export const getAssignment = (id) => assignments.find(a => a.id === id);
export const getAssignmentsByCourse = (courseId) => assignments.filter(a => a.courseId === courseId);
export const addAssignment = (assignment) => {
  const newAssignment = { ...assignment, id: Date.now().toString() };
  assignments.push(newAssignment);
  return newAssignment;
};
export const updateAssignment = (id, updates) => {
  const index = assignments.findIndex(a => a.id === id);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updates };
    return assignments[index];
  }
  return null;
};

export const getSubmissions = () => submissions;
export const getSubmission = (assignmentId, date) => {
  const key = `${assignmentId}-${date}`;
  return submissions[key] || null;
};
export const saveSubmission = (assignmentId, date, submission) => {
  const key = `${assignmentId}-${date}`;
  submissions[key] = { ...submission, assignmentId, date };
  return submissions[key];
};

// Generate assignments for a specific date based on schedule rules
export const getAssignmentsForDate = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return assignments.filter(assignment => {
    if (assignment.type === 'one-time') {
      return assignment.assignedDate <= date && assignment.dueDate >= date;
    }
    
    if (assignment.type === 'daily') {
      return assignment.assignedDate <= date && assignment.dueDate >= date;
    }
    
    if (assignment.type === 'weekly') {
      if (assignment.scheduleRule?.daysOfWeek) {
        return assignment.scheduleRule.daysOfWeek.includes(dayOfWeek) &&
               assignment.assignedDate <= date &&
               assignment.dueDate >= date;
      }
    }
    
    if (assignment.type === 'monthly') {
      const assignedDate = new Date(assignment.assignedDate);
      const dayOfMonth = dateObj.getDate();
      return dayOfMonth === assignedDate.getDate() &&
             assignment.assignedDate <= date &&
             assignment.dueDate >= date;
    }
    
    return false;
  });
};
