import axios from 'axios';

// Get the base URL from environment or fallback to '/api'
const rawBase = import.meta.env.VITE_API_BASE_URL || '/api';

// Ensure the base URL always ends with '/api'
const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

console.log('🔧 API Base URL:', baseURL); // Helps debug

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
