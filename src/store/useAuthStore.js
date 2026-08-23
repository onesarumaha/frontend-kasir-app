import { create } from 'zustand';
import api from '../api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/login', credentials);
      const resData = response.data;

      if (resData.success) {
        const { user, token } = resData.data;

        // 1. Simpan ke LocalStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 2. Set State
        set({ user, token, loading: false });

        return true; // <-- WAJIB return true agar 'if (success)' di Login.jsx berjalan
      } else {
        set({ error: resData.message || 'Login gagal', loading: false });
        return false;
      }
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Terjadi kesalahan koneksi', 
        loading: false 
      });
      return false;
    }
  },

  fetchUser: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) set({ user });
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));
