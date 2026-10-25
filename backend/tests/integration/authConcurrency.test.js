const request = require('supertest');
const app = require('../../src/app');
const { query } = require('../../src/database/pool');
const { resetDb, closeDb } = require('../helpers/db');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});

describe('Authentication Concurrency & Grace Window Verification', () => {
  const validUser = {
    name: 'Concurrent User',
    email: 'concurrent@example.com',
    password: 'Password123!',
  };

  test('Concurrent refresh requests: first rotates session, second within grace window does not blanket revoke user', async () => {
    // 1. Register & login
    await request(app).post('/api/auth/register').send(validUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: validUser.password,
    });
    expect(loginRes.status).toBe(200);

    const initialCookie = loginRes.headers['set-cookie'];
    expect(initialCookie).toBeDefined();

    // 2. Fire 2 refresh requests nearly simultaneously with initial cookie
    const [resA, resB] = await Promise.all([
      request(app).post('/api/auth/refresh').set('Cookie', initialCookie),
      request(app).post('/api/auth/refresh').set('Cookie', initialCookie),
    ]);

    // One of them must succeed with 200 (rotated)
    const successRes = resA.status === 200 ? resA : resB;
    const concurrentRes = resA.status === 200 ? resB : resA;

    expect(successRes.status).toBe(200);
    expect(successRes.body.data.accessToken).toBeDefined();

    // The concurrent request with the already-rotated token should be rejected
    expect(concurrentRes.status).toBe(401);
    expect(concurrentRes.body.errorCode).toBe('AUTH_REFRESH_REUSE_DETECTED');

    // 3. Crucial verification: The newly rotated session from successRes MUST NOT be revoked!
    const newCookie = successRes.headers['set-cookie'];
    expect(newCookie).toBeDefined();

    // Verify the new access token can query /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${successRes.body.data.accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(validUser.email);

    // Verify the new refresh cookie can be rotated again (session remains alive and valid)
    const secondRefreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', newCookie);
    expect(secondRefreshRes.status).toBe(200);
    expect(secondRefreshRes.body.data.accessToken).toBeDefined();
  });

  test('Replay attack outside grace window revokes all sessions for that user family', async () => {
    // 1. Register & login
    await request(app).post('/api/auth/register').send(validUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: validUser.password,
    });
    const initialCookie = loginRes.headers['set-cookie'];

    // 2. Rotate the session normally
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', initialCookie);
    expect(refreshRes.status).toBe(200);
    const validRotatedCookie = refreshRes.headers['set-cookie'];

    // 3. Manually age the revoked session past the 30s grace window (e.g. 5 minutes ago)
    await query(
      `UPDATE sessions SET revoked_at = now() - INTERVAL '5 minutes' WHERE revoked = true`
    );

    // 4. Attack: replay the old initial cookie outside grace window
    const replayRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', initialCookie);
    expect(replayRes.status).toBe(401);
    expect(replayRes.body.errorCode).toBe('AUTH_REFRESH_REUSE_DETECTED');

    // 5. Verify security: Blanket revocation must have revoked even the active session
    const subsequentRefresh = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', validRotatedCookie);
    expect(subsequentRefresh.status).toBe(401);
  });
});
