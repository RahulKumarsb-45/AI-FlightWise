import { api } from '@/lib/apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const productService = {
  // Analytics
  async getDashboardAnalytics({ startDate, endDate, demo = false } = {}) {
    let url = `/analytics/dashboard?demo=${demo ? 'true' : 'false'}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const res = await api.get(url);
    return res.data;
  },

  getAnalyticsExportUrl({ startDate, endDate, demo = false } = {}) {
    let url = `${API_BASE_URL}/analytics/export?demo=${demo ? 'true' : 'false'}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return url;
  },

  // Feedback
  async getCustomerFeedback({ category, status, theme, search, limit = 20, offset = 0 } = {}) {
    let url = `/feedback/customer?limit=${limit}&offset=${offset}`;
    if (category) url += `&category=${category}`;
    if (status) url += `&status=${status}`;
    if (theme) url += `&theme=${theme}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await api.get(url);
    return res.data;
  },

  async getFeedbackThemes() {
    const res = await api.get('/feedback/themes');
    return res.data;
  },

  async updateFeedbackStatus(id, status) {
    const res = await api.patch(`/feedback/customer/${id}/status`, { status });
    return res.data;
  },

  async submitCustomerFeedback(payload) {
    const res = await api.post('/feedback/customer', payload);
    return res.data;
  },

  // Copilot & PRD
  async getCopilotEvidence() {
    const res = await api.get('/copilot/evidence');
    return res.data;
  },

  async computeRiceScore(payload) {
    const res = await api.post('/copilot/rice', payload);
    return res.data;
  },

  async generateCopilotArtifact({ prompt, mode = 'opportunity', inputContext = {} }) {
    const res = await api.post('/copilot/generate', { prompt, mode, inputContext });
    return res.data;
  },

  async listPrds(status) {
    const url = status ? `/copilot/prds?status=${status}` : '/copilot/prds';
    const res = await api.get(url);
    return res.data;
  },

  async getPrd(id) {
    const res = await api.get(`/copilot/prds/${id}`);
    return res.data;
  },

  async savePrd(payload) {
    const res = await api.post('/copilot/prds', payload);
    return res.data;
  },

  async updatePrd(id, payload) {
    const res = await api.put(`/copilot/prds/${id}`, payload);
    return res.data;
  },

  async deletePrd(id) {
    const res = await api.delete(`/copilot/prds/${id}`);
    return res;
  },

  getPrdExportUrl(id) {
    return `${API_BASE_URL}/copilot/prds/${id}/export`;
  },

  // Roadmap
  async listRoadmapItems({ stage, priority, status } = {}) {
    let url = '/roadmap';
    const params = [];
    if (stage) params.push(`stage=${stage}`);
    if (priority) params.push(`priority=${priority}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await api.get(url);
    return res.data;
  },

  async createRoadmapItem(payload) {
    const res = await api.post('/roadmap', payload);
    return res.data;
  },

  async updateRoadmapItem(id, payload) {
    const res = await api.put(`/roadmap/${id}`, payload);
    return res.data;
  },

  async deleteRoadmapItem(id) {
    const res = await api.delete(`/roadmap/${id}`);
    return res;
  },

  getRoadmapExportUrl() {
    return `${API_BASE_URL}/roadmap/export`;
  },

  // Decisions
  async listDecisions() {
    const res = await api.get('/decisions');
    return res.data;
  },

  async createDecision(payload) {
    const res = await api.post('/decisions', payload);
    return res.data;
  },

  async updateDecision(id, payload) {
    const res = await api.put(`/decisions/${id}`, payload);
    return res.data;
  },

  async deleteDecision(id) {
    const res = await api.delete(`/decisions/${id}`);
    return res;
  },

  getDecisionsExportUrl() {
    return `${API_BASE_URL}/decisions/export`;
  },
};
