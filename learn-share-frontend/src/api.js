import axios from "axios";

export const API_BASE = "http://localhost:5001/api"; // ✅ must include /api

// Auth APIs
export const loginUser = (data) => axios.post(`${API_BASE}/auth/login`, data);
export const signupUser = (data) => axios.post(`${API_BASE}/auth/signup`, data);

// Teachers API
export const fetchTeachers = () => axios.get(`${API_BASE}/teachers`);

// Skills API
export const fetchSkills = () => axios.get(`${API_BASE}/skills`);