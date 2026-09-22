import api from './api';

export const authApi = {
  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateDetails(name, email) {
    const res = await api.put('/auth/updatedetails', { name, email });
    return res.data;
  },

  async updatePassword(currentPassword, newPassword) {
    const res = await api.put('/auth/updatepassword', { currentPassword, newPassword });
    return res.data;
  }
};

export default authApi;
