import { api } from '@/lib/apiClient';

export const evalService = {
  async getLatestEvaluation() {
    const res = await api.get('/evaluations/latest');
    return res.data;
  },

  async triggerEvaluationRun() {
    const res = await api.post('/evaluations/run');
    return res.data;
  },
};
