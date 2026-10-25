import { api } from '@/lib/apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const evalService = {
  async getLatestEvaluation() {
    const res = await api.get('/evaluations/latest');
    return {
      report: res.data || null,
      runStatus: res.runStatus || { isRunning: false },
    };
  },

  async getEvaluationHistory(limit = 15, offset = 0) {
    const res = await api.get(`/evaluations/history?limit=${limit}&offset=${offset}`);
    return res.data;
  },

  async getEvaluationById(id) {
    const res = await api.get(`/evaluations/${id}`);
    return res.data;
  },

  async triggerEvaluationRun(provider = 'offline') {
    const res = await api.post('/evaluations/run', { provider });
    return res.data;
  },

  getExportUrl(id = 'latest') {
    return `${API_BASE_URL}/evaluations/export/${id}`;
  },
};
