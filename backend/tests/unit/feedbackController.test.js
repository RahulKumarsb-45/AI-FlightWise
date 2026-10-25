const { submitFeedback, getFeedbackSummary, _inMemoryFeedbackStore } = require('../../src/controllers/feedbackController');

describe('feedbackController', () => {
  beforeEach(() => {
    _inMemoryFeedbackStore.length = 0;
  });

  test('submits feedback successfully and stores entry', async () => {
    const req = {
      body: {
        isHelpful: true,
        recommendationRank: 1,
        searchContext: { origin: 'DEL', destination: 'LHR' },
      },
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      user: { id: 'usr-123' },
    };

    let statusCode = null;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResult = data;
          },
        };
      },
    };
    const next = jest.fn();

    await submitFeedback(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusCode).toBe(201);
    expect(jsonResult.status).toBe('success');
    expect(jsonResult.data).toHaveProperty('id');
  });

  test('rejects duplicate feedback within dedup window with 429', async () => {
    const req = {
      body: {
        isHelpful: false,
        recommendationRank: 2,
        reason: 'price_too_high',
      },
      headers: {},
      socket: { remoteAddress: '127.0.0.2' },
      user: { id: 'usr-duplicate-test' },
    };

    const res = {
      status: () => ({ json: () => {} }),
    };
    const next1 = jest.fn();
    const next2 = jest.fn();

    await submitFeedback(req, res, next1);
    expect(next1).not.toHaveBeenCalled();

    // Immediate repeat click
    await submitFeedback(req, res, next2);
    expect(next2).toHaveBeenCalled();
    const error = next2.mock.calls[0][0];
    expect(error.statusCode).toBe(429);
    expect(error.errorCode).toBe('DUPLICATE_FEEDBACK');
  });

  test('getFeedbackSummary returns calculated metrics', async () => {
    _inMemoryFeedbackStore.push(
      { isHelpful: true, reason: null },
      { isHelpful: true, reason: null },
      { isHelpful: false, reason: 'price_too_high' }
    );

    let jsonResult = null;
    const res = {
      status: () => ({
        json: (data) => {
          jsonResult = data;
        },
      }),
    };
    const next = jest.fn();

    await getFeedbackSummary({}, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(jsonResult.status).toBe('success');
    expect(jsonResult.data.total).toBe(3);
    expect(jsonResult.data.helpfulCount).toBe(2);
    expect(jsonResult.data.unhelpfulCount).toBe(1);
    expect(jsonResult.data.helpfulRate).toBe(67);
  });
});
