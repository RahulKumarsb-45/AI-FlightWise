const { pool, query } = require('../../src/database/pool');

const airportService = require('../../src/providers/airport/airportService');

const TABLES = [
  'analytics_events',
  'customer_feedback',
  'ai_messages',
  'ai_conversations',
  'price_alerts',
  'search_history',
  'saved_trips',
  'trip_shares',
  'trips',
  'payment_transactions',
  'subscriptions',
  'sessions',
  'user_preferences',
  'users',
];

async function resetDb() {
  await query(`TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
  if (airportService && typeof airportService.clearExternalCache === 'function') {
    airportService.clearExternalCache();
  }
}

async function closeDb() {
  await pool.end();
}

module.exports = { resetDb, closeDb };
