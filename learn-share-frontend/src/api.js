import axios from "axios";

export const API_BASE = "http://localhost:5001/api"; // ✅ must include /api

// Create axios instance with base URL and auth interceptor
export const api = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const loginUser = (data) => axios.post(`${API_BASE}/auth/login`, data);
export const signupUser = (data) => axios.post(`${API_BASE}/auth/signup`, data);

// User APIs
export const fetchUser = (userId) => api.get(`/users/${userId}`);
export const updateUserRole = (role) => api.patch("/users/role", { role });

// Connection APIs
export const sendConnectionRequest = (userId, targetUserId) =>
  api.post("/connection/send", { userId, targetUserId });
export const acceptConnectionRequest = (targetUserId, fromUserId) =>
  api.post("/connection/accept", { targetUserId, fromUserId });
export const rejectConnectionRequest = (targetUserId, fromUserId) =>
  api.post("/connection/reject", { targetUserId, fromUserId });
export const disconnectConnection = (userId, targetUserId) =>
  api.post("/connection/disconnect", { userId, targetUserId });
export const fetchReceivedRequests = (userId) =>
  api.get(`/connection/received/${userId}`);
export const fetchUserConnections = (userId) =>
  api.get(`/connection/user/${userId}`);

// Teachers API
export const fetchTeachers = () => api.get(`/teachers`);

// Skills API
export const fetchSkills = () => api.get(`/skills`);

// Chat API
export const fetchChatHistory = (userId, otherUserId) =>
  api.get(`/chat/history?userId=${userId}&otherUserId=${otherUserId}`);
