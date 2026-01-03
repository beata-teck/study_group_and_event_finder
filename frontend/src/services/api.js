// API Service - Frontend API client
// Update API_BASE_URL to match your XAMPP backend location
const API_BASE_URL = 'http://localhost/study-group-finder-backend/api';

// Helper function to handle API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const config = {
    ...options,
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  register: (userData) => 
    apiCall('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () =>
    apiCall('auth.php', {
      method: 'GET',
    }),

  logout: () =>
    apiCall('auth.php', {
      method: 'DELETE',
    }),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    apiCall('users.php', {
      method: 'GET',
    }),

  updateProfile: (profileData) =>
    apiCall('users.php', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  deleteAccount: () =>
    apiCall('users.php', {
      method: 'DELETE',
    }),
};

// Events API
export const eventsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    
    const query = params.toString();
    return apiCall(`events.php${query ? '?' + query : ''}`, {
      method: 'GET',
    });
  },

  getById: (id) =>
    apiCall(`events.php?id=${id}`, {
      method: 'GET',
    }),

  create: (eventData) =>
    apiCall('events.php', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  update: (id, eventData) =>
    apiCall(`events.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  delete: (id) =>
    apiCall(`events.php?id=${id}`, {
      method: 'DELETE',
    }),
};

// Joined Events API
export const joinedEventsAPI = {
  getJoined: (past = false) =>
    apiCall(`joined_events.php${past ? '?past=true' : ''}`, {
      method: 'GET',
    }),

  join: (eventId) =>
    apiCall('joined_events.php', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId }),
    }),

  leave: (eventId) =>
    apiCall(`joined_events.php?event_id=${eventId}`, {
      method: 'DELETE',
    }),
};

// Comments API
export const commentsAPI = {
  getByEvent: (eventId) =>
    apiCall(`comments.php?event_id=${eventId}`, {
      method: 'GET',
    }),

  create: (eventId, text) =>
    apiCall('comments.php', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, text }),
    }),

  delete: (commentId) =>
    apiCall(`comments.php?id=${commentId}`, {
      method: 'DELETE',
    }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (unreadOnly = false) =>
    apiCall(`notifications.php${unreadOnly ? '?unread=true' : ''}`, {
      method: 'GET',
    }),

  markAsRead: (notificationId) =>
    apiCall(`notifications.php?id=${notificationId}`, {
      method: 'PUT',
    }),

  delete: (notificationId) =>
    apiCall(`notifications.php?id=${notificationId}`, {
      method: 'DELETE',
    }),
};