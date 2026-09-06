import { create } from 'zustand';
import api from '../api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  // 1. TAMBAHAN METHOD REGISTER
  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/register', formData);
      const resData = response.data;

      if (resData.success) {
        const { user, token } = resData.data;

        // Simpan token & user ke LocalStorage jika register langsung auto-login
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token });
        }

        return true;
      } else {
        set({ error: resData.message || 'Pendaftaran gagal' });
        return false;
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : 'Terjadi kesalahan koneksi');

      set({ error: errorMsg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/login', credentials);
      const resData = response.data;

      if (resData.success) {
        const { user, token } = resData.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, token });

        return true;
      } else {
        set({ error: resData.message || 'Login gagal' });
        return false;
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Terjadi kesalahan koneksi',
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchUser: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) set({ user });
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, error: null });
    }
  },
}));