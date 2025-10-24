import axios from "axios";
import { generateCSRFToken } from "../utils/security.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"; // ต้องตรงกับ port server

// 🛡️ Create axios instance with security defaults
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// 🛡️ Request interceptor for CSRF protection
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token to requests
    const csrfToken = generateCSRFToken();
    config.headers['X-CSRF-Token'] = csrfToken;
    
    // Add user token if available
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🛡️ Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common security errors
    if (error.response?.status === 401) {
      // Unauthorized - clear user data and redirect to login
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.warn('Access denied');
    }
    
    return Promise.reject(error);
  }
);

// =================== Auth ===================
export const register = (name, email, password) =>
  apiClient.post(`/register`, { name, email, password });

export const verifyOTP = (email, otpInput) =>
  apiClient.post(`/verify-otp`, { email, otpInput });

export const login = (email, password) =>
  apiClient.post(`/login`, { email, password });

export const getProfile = (id) => apiClient.get(`/profile/${id}`);

export const updateProfile = (id, data) =>
  apiClient.put(`/profile/${id}`, data);

// ใช้ endpoint เดียวกับ updateProfile สำหรับตอนนี้
export const updatePassword = (id, data) =>
  apiClient.put(`/profile/${id}`, { ...data, type: 'password' });

// ใช้ endpoint เดียวกับ updateProfile สำหรับตอนนี้
export const deleteAccount = (id) =>
  apiClient.put(`/profile/${id}`, { type: 'delete' });

// =================== Appointments ===================
export const createAppointment = (userId, data) =>
  apiClient.post(`/appointments/user/${userId}`, data);

export const createAppointmentByStaff = (data) =>
  apiClient.post(`/appointments/staff`, data);

export const getUserAppointments = (userId) =>
  apiClient.get(`/appointments/user/${userId}`);

export const getAllAppointments = (page = 1, limit = 10, status = '', search = '') =>
  apiClient.get(`/appointments?page=${page}&limit=${limit}&status=${status}&search=${search}`);

export const getAppointmentById = (id) =>
  apiClient.get(`/appointments/${id}`);

export const updateAppointmentByUser = (appointmentId, data) =>
  apiClient.put(`/appointments/${appointmentId}`, data);

export const updateAppointmentStatus = (adminId, appointmentId, newStatus) =>
  apiClient.put(`/appointments/status/${adminId}/${appointmentId}`, { newStatus });

// Admin update appointment status (simplified)
export const updateAppointmentStatusAdmin = (appointmentId, status) =>
  apiClient.put(`/admin/appointments/${appointmentId}/status`, { status });

export const deleteAppointment = (id) =>
  apiClient.delete(`/appointments/${id}`);

// =================== Locations ===================
export const getProvinces = () => apiClient.get(`/locations/provinces`);

export const getDistricts = (province) =>
  apiClient.get(`/locations/districts/${province}`);

export const getSubdistricts = (district) =>
  apiClient.get(`/locations/subdistricts/${district}`);

export const getHospitals = () => apiClient.get(`/locations/hospitals`);

export const getLocations = () => apiClient.get(`/locations`);

// =================== Users (สำหรับ Staff เลือกผู้ใช้) ===================
export const getUsers = () => apiClient.get(`/users`);

// =================== Admin User Management ===================
export const getAllUsers = () => apiClient.get(`/admin/users`);

export const updateUser = (userId, data) =>
  apiClient.put(`/admin/users/${userId}`, data);

export const createUser = (data) =>
  apiClient.post(`/admin/users`, data);

export const deleteUser = (userId) =>
  apiClient.delete(`/admin/users/${userId}`);

// =================== Statistics & Reports ===================
export const getStatistics = (period = 'month') =>
  apiClient.get(`/admin/statistics?period=${period}`);

export const getSystemHealth = () =>
  apiClient.get(`/health`);

export const downloadPDFReport = (period = 'month') =>
  apiClient.get(`/admin/reports/pdf?period=${period}`, {
    responseType: 'blob'
  });
