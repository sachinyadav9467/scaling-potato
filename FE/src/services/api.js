// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get refresh token from localStorage
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Save tokens to localStorage
const saveTokens = (token, refreshToken) => {
  localStorage.setItem('authToken', token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && token) {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        // Retry the original request with new token
        config.headers.Authorization = `Bearer ${getAuthToken()}`;
        const retryResponse = await fetch(url, config);
        return handleResponse(retryResponse);
      } else {
        // Refresh failed, redirect to login
        clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    return handleResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Handle API response
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = {
      status: response.status,
      message: data?.error?.message || data?.message || 'An error occurred',
      code: data?.error?.code || 'UNKNOWN_ERROR',
      details: data?.error?.details || {},
    };
    throw error;
  }

  return data;
};

// Refresh auth token
const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      saveTokens(data.token, data.refreshToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token && response.user) {
      saveTokens(response.token, response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  register: async (email, password, name, role = 'student') => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    
    if (response.token && response.user) {
      saveTokens(response.token, response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// Courses API
export const coursesAPI = {
  getAll: async (userId = null) => {
    const params = userId ? `?userId=${userId}` : '';
    return apiRequest(`/courses${params}`);
  },

  getById: async (courseId) => {
    return apiRequest(`/courses/${courseId}`);
  },

  create: async (courseData) => {
    return apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  update: async (courseId, updates) => {
    return apiRequest(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  delete: async (courseId) => {
    return apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
};

// Assignments API
export const assignmentsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/assignments${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (assignmentId) => {
    return apiRequest(`/assignments/${assignmentId}`);
  },

  getByDate: async (date) => {
    return apiRequest(`/assignments/date/${date}`);
  },

  create: async (assignmentData) => {
    return apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  update: async (assignmentId, updates) => {
    return apiRequest(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  delete: async (assignmentId) => {
    return apiRequest(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  },

  getNotes: async (assignmentId) => {
    return apiRequest(`/assignments/${assignmentId}/notes`);
  },

  addNote: async (assignmentId, file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    const token = getAuthToken();
    const url = `${API_BASE_URL}/assignments/${assignmentId}/notes`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    return handleResponse(response);
  },

  deleteNote: async (noteId) => {
    return apiRequest(`/assignments/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

// Submissions API
export const submissionsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/submissions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (submissionId) => {
    return apiRequest(`/submissions/${submissionId}`);
  },

  create: async (submissionData) => {
    return apiRequest('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  update: async (submissionId, updates) => {
    return apiRequest(`/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  delete: async (submissionId) => {
    return apiRequest(`/submissions/${submissionId}`, {
      method: 'DELETE',
    });
  },

  uploadFile: async (file, assignmentId, date) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);
    formData.append('date', date);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/submissions/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  },
};

// Metrics API
export const metricsAPI = {
  getDaily: async (date) => {
    return apiRequest(`/metrics/daily/${date}`);
  },

  getWeekly: async (date) => {
    return apiRequest(`/metrics/weekly/${date}`);
  },

  getMonthly: async (year, month) => {
    return apiRequest(`/metrics/monthly/${year}/${month}`);
  },

  getCustomRange: async (startDate, endDate, courseId = null) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    if (courseId) {
      params.append('courseId', courseId);
    }
    return apiRequest(`/metrics/range?${params.toString()}`);
  },
};

// Users API
export const usersAPI = {
  getCurrent: async () => {
    return apiRequest('/users/me');
  },

  update: async (updates) => {
    return apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// Videos API
export const videosAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/videos${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/videos/${id}`);
  },

  create: async (data) => {
    return apiRequest('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiRequest(`/videos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiRequest(`/videos/${id}`, {
      method: 'DELETE',
    });
  },

  markWatched: async (id) => {
    return apiRequest(`/videos/${id}/watched`, {
      method: 'PATCH',
    });
  },

  getNotes: async (videoId) => {
    return apiRequest(`/videos/${videoId}/notes`);
  },

  addNote: async (videoId, data) => {
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.title) {
      formData.append('title', data.title);
    }

    const token = getAuthToken();
    const url = `${API_BASE_URL}/videos/${videoId}/notes`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  deleteNote: async (noteId) => {
    return apiRequest(`/video-notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

export default {
  authAPI,
  coursesAPI,
  assignmentsAPI,
  submissionsAPI,
  metricsAPI,
  usersAPI,
  videosAPI,
};
