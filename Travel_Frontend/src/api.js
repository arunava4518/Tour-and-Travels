const API_BASE = 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Don't treat login endpoint 401s as session expired
    if (response.status === 401 && !endpoint.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', { 
    method: 'POST', 
    body: credentials 
  }),
  register: (userData) => apiRequest('/auth/register', { 
    method: 'POST', 
    body: userData 
  }),
  adminLogin: (credentials) => apiRequest('/auth/admin/login', { 
    method: 'POST', 
    body: credentials 
  }),
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => apiRequest('/bookings', { 
    method: 'POST', 
    body: bookingData 
  }),
  getUserBookings: () => apiRequest('/bookings'),
  getAllBookings: () => apiRequest('/bookings'),
  update: (id, updates) => apiRequest(`/bookings/${id}`, { 
    method: 'PUT', 
    body: updates 
  }),
  delete: (id) => apiRequest(`/bookings/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  update: (id, updates) => apiRequest(`/users/${id}`, { 
    method: 'PUT', 
    body: updates 
  }),
  delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};