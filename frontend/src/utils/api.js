import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/auth')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  sendOTP: (email, userType) => api.post('/auth/send-otp', { email, userType }),
  verifyOTP: (email, otp, userType, userData) => api.post('/auth/verify-otp', { email, otp, userType, userData }),
  login: (email, password, userType) => api.post('/auth/login', { email, password, userType }),
  getMe: () => api.get('/auth/me'),
};

export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getOne: (id) => api.get(`/properties/${id}`),
  sendInquiry: (data) => api.post('/properties/inquiry', data),
  addFavorite: (id) => api.post(`/properties/${id}/favorites`),
  removeFavorite: (id) => api.delete(`/properties/${id}/favorites`),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  agents: (params) => api.get('/admin/agents', { params }),
  approveAgent: (id) => api.patch(`/admin/agents/${id}/approve`),
  rejectAgent: (id) => api.patch(`/admin/agents/${id}/reject`),
  suspendAgent: (id) => api.patch(`/admin/agents/${id}/suspend`),
  unsuspendAgent: (id) => api.patch(`/admin/agents/${id}/unsuspend`),
  users: () => api.get('/admin/users'),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  properties: () => api.get('/admin/properties'),
  deleteProperty: (id) => api.delete(`/admin/properties/${id}`),
  inquiries: () => api.get('/admin/inquiries'),
};

export const agentAPI = {
  dashboard: () => api.get('/agent/dashboard'),
  myProperties: () => api.get('/agent/properties/my'),
  browseProperties: (params) => api.get('/agent/properties/browse', { params }),
  createProperty: (data) => api.post('/agent/properties', data),
  updateProperty: (id, data) => api.patch(`/agent/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/agent/properties/${id}`),
  inquiries: () => api.get('/agent/inquiries'),
  respondInquiry: (id, data) => api.patch(`/agent/inquiries/${id}/respond`, data),
  updateProfile: (data) => api.patch('/agent/profile', data),
};

export const userAPI = {
  dashboard: () => api.get('/user/dashboard'),
  profile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  inquiries: () => api.get('/user/inquiries'),
  favorites: () => api.get('/user/favorites'),
};

export default api;
