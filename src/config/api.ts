// src/config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://mintmoments.onrender.com' 
    : 'http://localhost:3001');

export { API_BASE_URL };