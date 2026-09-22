import api from './api';

export const optimizerApi = {
  async generateOptimizationPlan(resumeId, jobId) {
    const res = await api.post('/matching/optimize', { resumeId, jobId });
    return res.data;
  },

  async applySuggestions(resumeId, acceptedSuggestions) {
    const res = await api.post('/matching/apply-suggestions', {
      resumeId,
      acceptedSuggestions
    });
    return res.data;
  },

  async optimizeDirect(resume, role) {
    const res = await api.post('/ai/resume/optimize', { resume, role });
    return res.data;
  }
};

export default optimizerApi;
