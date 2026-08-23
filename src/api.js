import axios from 'axios';

// Export BASE URL agar bisa dipanggil oleh komponen lain
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Menggunakan variabel API_BASE_URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Otomatis tempelkan Authorization Token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;