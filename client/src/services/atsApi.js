import api from './api';
import { normalizeATSData } from '../utils/normalizers';

export const atsApi = {
  async analyzeAts(resumeId, jobId = null) {
    const payload = { resumeId };
    if (jobId) payload.jobId = jobId;
    const res = await api.post('/ats/analyze', payload);
    const data = res.data?.data || res.data?.report || res.data;
    return {
      ...res.data,
      data: normalizeATSData(data)
    };
  },

  async recalculateScore(resume, role = null) {
    const res = await api.post('/ai/resume/recalculate', { resume, role });
    const data = res.data?.data || res.data;
    return normalizeATSData(data);
  }
};

export default atsApi;
