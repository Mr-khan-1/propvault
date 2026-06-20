import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  sendOTP: (email, userType) =>
    api.post('/auth/send-otp', { email, userType }),
  
  verifyOTP: (email, otp, userType, userData) =>
    api.post('/auth/verify-otp', { email, otp, userType, userData }),
  
  login: (email, password, userType) =>
    api.post('/auth/login', { email, password, userType }),
  
  verifyToken: () =>
    api.post('/auth/verify-token'),
};

// Properties API calls
export const propertyAPI = {
  getAllProperties: (filters = {}) =>
    api.get('/properties', { params: filters }),
  
  getSingleProperty: (id) =>
    api.get(`/properties/${id}`),
  
  addToFavorites: (propertyId) =>
    api.post(`/properties/${propertyId}/favorites`),
  
  removeFromFavorites: (propertyId) =>
    api.delete(`/properties/${propertyId}/favorites`),
  
  sendInquiry: (propertyId, message, inquiryType) =>
    api.post('/properties/inquiry/send', { propertyId, message, inquiryType }),
  
  addReview: (propertyId, rating, comment) =>
    api.post(`/properties/${propertyId}/reviews`, { rating, comment }),
  
  getReviews: (propertyId) =>
    api.get(`/properties/${propertyId}/reviews`),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  getAgents: (filters = {}) =>
    api.get('/admin/agents', { params: filters }),
  
  getAgent: (id) =>
    api.get(`/admin/agents/${id}`),
  
  approveAgent: (id) =>
    api.patch(`/admin/agents/${id}/approve`),
  
  rejectAgent: (id, reason) =>
    api.patch(`/admin/agents/${id}/reject`, { reason }),
  
  suspendAgent: (id, reason) =>
    api.patch(`/admin/agents/${id}/suspend`, { reason }),
  
  getUsers: (filters = {}) =>
    api.get('/admin/users', { params: filters }),
  
  getProperties: (filters = {}) =>
    api.get('/admin/properties', { params: filters }),
  
  getInquiries: (filters = {}) =>
    api.get('/admin/inquiries', { params: filters }),
  
  generateReport: (reportType, startDate, endDate) =>
    api.post('/admin/reports/generate', { reportType, startDate, endDate }),
};

// Agent API calls
export const agentAPI = {
  getDashboard: () =>
    api.get('/agent/dashboard'),
  
  getMyProperties: (filters = {}) =>
    api.get('/agent/properties/my-properties', { params: filters }),
  
  createProperty: (propertyData) =>
    api.post('/agent/properties', propertyData),
  
  updateProperty: (id, propertyData) =>
    api.patch(`/agent/properties/${id}`, propertyData),
  
  deleteProperty: (id) =>
    api.delete(`/agent/properties/${id}`),
  
  getMyInquiries: (filters = {}) =>
    api.get('/agent/inquiries', { params: filters }),
  
  respondToInquiry: (id, message, scheduledDate) =>
    api.patch(`/agent/inquiries/${id}/respond`, { message, scheduledDate }),
  
  updateProfile: (profileData) =>
    api.patch('/agent/profile', profileData),
};

// User API calls
export const userAPI = {
  getDashboard: () =>
    api.get('/user/dashboard'),
  
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (profileData) =>
    api.patch('/user/profile', profileData),
  
  getMyInquiries: (filters = {}) =>
    api.get('/user/inquiries', { params: filters }),
  
  getInquiry: (inquiryId) =>
    api.get(`/user/inquiries/${inquiryId}`),
  
  sendMessage: (inquiryId, message) =>
    api.patch(`/user/inquiries/${inquiryId}/message`, { message }),
  
  getFavorites: (filters = {}) =>
    api.get('/user/favorites', { params: filters }),
};

export default api;
