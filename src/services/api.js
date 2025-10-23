import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"; // ต้องตรงกับ port server

// =================== Auth ===================
export const register = (name, email, password) =>
  axios.post(`${API_URL}/register`, { name, email, password });

export const verifyOTP = (email, otpInput) =>
  axios.post(`${API_URL}/verify-otp`, { email, otpInput });

export const login = (email, password) =>
  axios.post(`${API_URL}/login`, { email, password });

export const getProfile = (id) => axios.get(`${API_URL}/profile/${id}`);

export const updateProfile = (id, data) =>
  axios.put(`${API_URL}/profile/${id}`, data);

// ใช้ endpoint เดียวกับ updateProfile สำหรับตอนนี้
export const updatePassword = (id, data) =>
  axios.put(`${API_URL}/profile/${id}`, { ...data, type: 'password' });

// ใช้ endpoint เดียวกับ updateProfile สำหรับตอนนี้
export const deleteAccount = (id) =>
  axios.put(`${API_URL}/profile/${id}`, { type: 'delete' });

// =================== Appointments ===================
export const createAppointment = (userId, data) =>
  axios.post(`${API_URL}/appointments/user/${userId}`, data);

export const createAppointmentByStaff = (data) =>
  axios.post(`${API_URL}/appointments/staff`, data);

export const getUserAppointments = (userId) =>
  axios.get(`${API_URL}/appointments/user/${userId}`);

export const getAllAppointments = (page = 1, limit = 10, status = '', search = '') =>
  axios.get(`${API_URL}/appointments?page=${page}&limit=${limit}&status=${status}&search=${search}`);

export const getAppointmentById = (id) =>
  axios.get(`${API_URL}/appointments/${id}`);

export const updateAppointmentByUser = (appointmentId, data) =>
  axios.put(`${API_URL}/appointments/${appointmentId}`, data);

export const updateAppointmentStatus = (adminId, appointmentId, newStatus) =>
  axios.put(`${API_URL}/appointments/status/${adminId}/${appointmentId}`, { newStatus });

// Admin update appointment status (simplified)
export const updateAppointmentStatusAdmin = (appointmentId, status) =>
  axios.put(`${API_URL}/admin/appointments/${appointmentId}/status`, { status });

export const deleteAppointment = (id) =>
  axios.delete(`${API_URL}/appointments/${id}`);

// =================== Locations ===================
export const getProvinces = () => axios.get(`${API_URL}/locations/provinces`);

export const getDistricts = (province) =>
  axios.get(`${API_URL}/locations/districts/${province}`);

export const getSubdistricts = (district) =>
  axios.get(`${API_URL}/locations/subdistricts/${district}`);

export const getHospitals = () => axios.get(`${API_URL}/locations/hospitals`);

export const getLocations = () => axios.get(`${API_URL}/locations`);

// =================== Users (สำหรับ Staff เลือกผู้ใช้) ===================
export const getUsers = () => axios.get(`${API_URL}/users`);

// =================== Admin User Management ===================
export const getAllUsers = () => axios.get(`${API_URL}/admin/users`);

export const updateUser = (userId, data) =>
  axios.put(`${API_URL}/admin/users/${userId}`, data);

export const createUser = (data) =>
  axios.post(`${API_URL}/admin/users`, data);

export const deleteUser = (userId) =>
  axios.delete(`${API_URL}/admin/users/${userId}`);

// =================== Statistics & Reports ===================
export const getStatistics = (period = 'month') =>
  axios.get(`${API_URL}/admin/statistics?period=${period}`);

export const getSystemHealth = () =>
  axios.get(`${API_URL}/health`);

export const downloadPDFReport = (period = 'month') =>
  axios.get(`${API_URL}/admin/reports/pdf?period=${period}`, {
    responseType: 'blob'
  });
