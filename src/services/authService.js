import api from './api';

export const authService = {
  async login(mobileNumber, password) {
    const res = await api.post('/auth/login', { mobileNumber, password });
    const { token, ...user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return res.data;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async forgotPassword(identifier) {
    const res = await api.post('/auth/forgot-password', { identifier });
    return res.data;
  },

  async changePassword(payload) {
    const res = await api.post('/auth/change-password', payload);
    if (res.data?.token) {
      const { token, ...user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      const currentUser = this.getCurrentUser() || {};
      localStorage.setItem('user', JSON.stringify({ ...currentUser, mustChangePassword: false }));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
