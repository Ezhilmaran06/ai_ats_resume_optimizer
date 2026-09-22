import api from './api';
import { normalizeRoleData, normalizeMatchData } from '../utils/normalizers';

export const roleApi = {
  async analyzeRole(rolePayload) {
    const res = await api.post('/ai/role/analyze', rolePayload);
    const roleData = normalizeRoleData(res.data);
    return {
      ...res.data,
      role: roleData,
      data: res.data?.data || roleData
    };
  },

  async analyzeMatch(resume, role) {
    const res = await api.post('/ai/match/analyze', { resume, role });
    const matchData = normalizeMatchData(res.data);
    return {
      ...res.data,
      match: matchData,
      data: res.data?.data || matchData
    };
  }
};

export default roleApi;
