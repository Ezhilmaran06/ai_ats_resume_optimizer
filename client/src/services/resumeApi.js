import api from './api';
import { normalizeResumeData } from '../utils/normalizers';

export const resumeApi = {
  async getAllResumes() {
    const res = await api.get('/resumes');
    const items = res.data?.data || res.data?.resumes || [];
    return Array.isArray(items) ? items.map(normalizeResumeData) : [];
  },

  async getResumeById(id) {
    const res = await api.get(`/resumes/${id}`);
    const data = res.data?.data || res.data?.resume || res.data;
    return normalizeResumeData(data);
  },

  async createResume(payload) {
    const res = await api.post('/resumes', payload);
    return normalizeResumeData(res.data);
  },

  async updateResume(id, payload) {
    const res = await api.put(`/resumes/${id}`, payload);
    return normalizeResumeData(res.data);
  },

  async deleteResume(id) {
    const res = await api.delete(`/resumes/${id}`);
    return res.data;
  },

  async uploadResume(formData) {
    const res = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return {
      ...res.data,
      resume: normalizeResumeData(res.data.resume || res.data.data?.resume)
    };
  },

  async duplicateResume(id) {
    const res = await api.post(`/resumes/${id}/duplicate`);
    return normalizeResumeData(res.data);
  }
};

export default resumeApi;
