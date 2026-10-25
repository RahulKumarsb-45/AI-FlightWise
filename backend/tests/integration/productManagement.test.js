const request = require('supertest');
const app = require('../../src/app');
const { calculateRiceScore } = require('../../src/services/copilotService');
const { pool } = require('../../src/database/pool');

describe('Product Management & AI Decision Intelligence Integration Suite', () => {
  afterAll(async () => {
    // Clean up test events/records created during this suite
    try {
      await pool.query("DELETE FROM analytics_events WHERE session_id LIKE 'test_pm_%'");
      await pool.query("DELETE FROM customer_feedback WHERE title LIKE 'Test Feedback %'");
      await pool.query("DELETE FROM prds WHERE title LIKE 'Test PRD %'");
      await pool.query("DELETE FROM roadmap_items WHERE title LIKE 'Test Feature %'");
      await pool.query("DELETE FROM decision_log WHERE title LIKE 'Test Decision %'");
      await pool.query("DELETE FROM experiment_exposures WHERE session_id LIKE 'test_exp_%'");
      await pool.query("DELETE FROM experiment_assignments WHERE session_id LIKE 'test_exp_%'");
    } catch {
      // Safe teardown
    }
  });

  describe('1. Analytics Telemetry & Ingestion', () => {
    test('POST /api/analytics/events records single event with validation and idempotency', async () => {
      const idempotencyKey = `idem_${Date.now()}`;
      const payload = {
        eventName: 'search_submitted',
        sessionId: 'test_pm_session_1',
        properties: { origin: 'DEL', destination: 'BOM', travelers: 1 },
        idempotencyKey,
      };

      // First call
      const res1 = await request(app)
        .post('/api/analytics/events')
        .send(payload)
        .expect(200);

      expect(res1.body.status).toBe('success');
      expect(res1.body.data).toHaveProperty('id');
      expect(res1.body.data.deduplicated).toBe(false);

      // Repeat call with identical idempotencyKey
      const res2 = await request(app)
        .post('/api/analytics/events')
        .send(payload)
        .expect(200);

      expect(res2.body.status).toBe('success');
      expect(res2.body.data.deduplicated).toBe(true);
    });

    test('POST /api/analytics/events rejects invalid payload without eventName', async () => {
      const res = await request(app)
        .post('/api/analytics/events')
        .send({ sessionId: 'test_pm_session_invalid' })
        .expect(400);

      expect(res.body.status).toBe('error');
    });

    test('POST /api/analytics/batch ingests multiple events in one transaction', async () => {
      const batchPayload = {
        sessionId: 'test_pm_session_batch',
        events: [
          { eventName: 'results_viewed', properties: { count: 3 } },
          { eventName: 'recommendation_selected', properties: { rank: 1 } },
        ],
      };

      const res = await request(app)
        .post('/api/analytics/batch')
        .send(batchPayload)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.recorded).toBe(2);
    });
  });

  describe('2. Product Analytics Dashboard & Funnel', () => {
    test('GET /api/analytics/dashboard returns calculated KPIs and conversion funnel', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('kpis');
      expect(res.body.data).toHaveProperty('funnel');
      expect(res.body.data).toHaveProperty('isDemo', false);

      const kpis = res.body.data.kpis;
      expect(kpis).toHaveProperty('searchVolume');
      expect(kpis).toHaveProperty('uniqueSearchSessions');
      expect(kpis).toHaveProperty('resultsViewRate');
      expect(kpis).toHaveProperty('recommendationSelectRate');

      const funnel = res.body.data.funnel;
      expect(Array.isArray(funnel)).toBe(true);
      expect(funnel.length).toBe(6);
      expect(funnel[0].stage).toBe('Search Submitted');
      expect(funnel[5].stage).toBe('Payment Completed');
    });

    test('GET /api/analytics/dashboard?demo=true returns clearly labeled synthetic mode', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard?demo=true')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.isDemo).toBe(true);
      expect(res.body.data.kpis.searchVolume).toBeGreaterThan(0);
    });

    test('GET /api/analytics/export returns valid Markdown analytical report', async () => {
      const res = await request(app)
        .get('/api/analytics/export')
        .expect(200);

      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.text).toContain('# AI FlightWise — Product Analytics & Funnel Report');
      expect(res.text).toContain('## Conversion Funnel Drop-off Analysis');
    });
  });

  describe('3. Customer Feedback Intelligence', () => {
    let createdFeedbackId = null;

    test('POST /api/feedback/customer creates new verified user feedback record', async () => {
      const res = await request(app)
        .post('/api/feedback/customer')
        .send({
          comment: 'Experiencing slow search when selecting 5 flexible dates',
          category: 'flight_search',
          sentiment: 'negative',
          severity: 'high',
          theme: 'flexible_dates',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('new');
      createdFeedbackId = res.body.data.id;
    });

    test('GET /api/feedback/customer lists feedback with category filtering', async () => {
      const res = await request(app)
        .get('/api/feedback/customer?category=flight_search')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.feedback)).toBe(true);
      expect(res.body.data.feedback.some((f) => f.id === createdFeedbackId)).toBe(true);
    });

    test('PATCH /api/feedback/customer/:id/status updates status transition', async () => {
      const res = await request(app)
        .patch(`/api/feedback/customer/${createdFeedbackId}/status`)
        .send({ status: 'reviewed' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('reviewed');
    });

    test('GET /api/feedback/themes aggregates thematic pain-point clusters', async () => {
      const res = await request(app)
        .get('/api/feedback/themes')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.themes)).toBe(true);
      expect(res.body.data.themes[0]).toHaveProperty('theme');
      expect(res.body.data.themes[0]).toHaveProperty('totalFeedback');
    });
  });

  describe('5. AI PM Copilot & PRD Management', () => {
    let createdPrdId = null;

    test('RICE unit calculation follows formula: (R * I * C) / E', () => {
      const rice = calculateRiceScore({ reach: 5000, impact: 2, confidence: 80, effort: 4 });
      // (5000 * 2 * 0.8) / 4 = 8000 / 4 = 2000
      expect(rice.score).toBe(2000);
      expect(rice.formula).toContain('5000');
    });

    test('POST /api/copilot/rice computes valid RICE score with validation', async () => {
      const res = await request(app)
        .post('/api/copilot/rice')
        .send({ reach: 1000, impact: 3, confidence: 75, effort: 2 })
        .expect(200);

      expect(res.body.status).toBe('success');
      // (1000 * 3 * 0.75) / 2 = 2250 / 2 = 1125
      expect(res.body.data.score).toBe(1125);
    });

    test('GET /api/copilot/evidence gathers cross-functional platform metrics', async () => {
      const res = await request(app)
        .get('/api/copilot/evidence')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('feedback');
      expect(res.body.data).toHaveProperty('analytics');
      expect(res.body.data).toHaveProperty('evaluation');
      expect(res.body.data).toHaveProperty('activeExperiments');
    });

    test('POST /api/copilot/prds creates and persists complete PRD', async () => {
      const res = await request(app)
        .post('/api/copilot/prds')
        .send({
          title: 'Test PRD AI Explainability',
          problemStatement: 'Users do not understand why a flight is recommended over a cheaper direct flight.',
          goals: ['Increase recommendation selection rate by 15%'],
          solution: 'Show explicit price, duration, and stop trade-offs.',
          userStories: ['As a traveler, I want to see why this option was picked.'],
          metrics: { primary: 'Recommendation Selection Rate' },
          status: 'draft',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      createdPrdId = res.body.data.id;
    });

    test('GET /api/copilot/prds/:id/export exports structured Markdown PRD', async () => {
      const res = await request(app)
        .get(`/api/copilot/prds/${createdPrdId}/export`)
        .expect(200);

      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.text).toContain('# Test PRD AI Explainability');
      expect(res.text).toContain('## Problem Statement');
    });
  });

  describe('6. Product Roadmap & Decision Log Workspaces', () => {
    let createdRoadmapId = null;
    let createdDecisionId = null;

    test('POST /api/roadmap creates prioritized roadmap item with calculated RICE', async () => {
      const res = await request(app)
        .post('/api/roadmap')
        .send({
          title: 'Test Feature: AI Price Prediction Alert',
          description: 'Notify users 48 hours before fares are predicted to jump',
          stage: 'now',
          priority: 'high',
          reach: 8000,
          impact: 3,
          confidence: 85,
          effort: 4,
          owner: 'Intern PM',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      // RICE: (8000 * 3 * 0.85) / 4 = 5100
      expect(Number(res.body.data.rice_score)).toBe(5100);
      createdRoadmapId = res.body.data.id;
    });

    test('GET /api/roadmap lists items filtered by stage', async () => {
      const res = await request(app)
        .get('/api/roadmap?stage=now')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((i) => i.id === createdRoadmapId)).toBe(true);
    });

    test('GET /api/roadmap/export exports Markdown roadmap', async () => {
      const res = await request(app)
        .get('/api/roadmap/export')
        .expect(200);

      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.text).toContain('# AI FlightWise — Product Roadmap');
    });

    test('POST /api/decisions creates Architecture & Product Decision Record (ADR)', async () => {
      const res = await request(app)
        .post('/api/decisions')
        .send({
          title: 'Test Decision: Shift to SHA-256 Experiment Bucketing',
          problem: 'Need deterministic assignment without third-party vendor lock-in.',
          decision: 'Implement SHA-256 hash modulus 100 on userId/sessionId.',
          alternatives: ['LaunchDarkly (expensive)', 'In-memory cookie (ephemeral)'],
          rationale: 'Zero latency, deterministic across devices, no Redis needed.',
          expectedOutcome: '100% assignment stability with zero vendor cost.',
          owner: 'Tech Lead / PM',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      createdDecisionId = res.body.data.id;
    });

    test('GET /api/decisions/export exports Markdown decision log', async () => {
      const res = await request(app)
        .get('/api/decisions/export')
        .expect(200);

      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.text).toContain('# AI FlightWise — Product Decision Log');
    });
  });
});
