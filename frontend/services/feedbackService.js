import { api } from '@/lib/apiClient';

export const feedbackService = {
  async submitFeedback({ isHelpful, recommendationRank, reason, comment, searchContext }) {
    const res = await api.post('/feedback', {
      isHelpful,
      recommendationRank,
      reason,
      comment,
      searchContext,
    });
    return res.data;
  },

  async getFeedbackSummary() {
    const res = await api.get('/feedback/summary');
    return res.data;
  },
};
