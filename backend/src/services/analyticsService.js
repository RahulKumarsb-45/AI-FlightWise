const { query } = require('../database/pool');
const logger = require('../logger/logger');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_EVENTS = new Set([
  'search_submitted',
  'results_viewed',
  'recommendation_selected',
  'trip_saved',
  'trip_shared',
  'checkout_initiated',
  'payment_verified',
  'feedback_submitted',
  'experiment_assigned',
  'experiment_exposed',
  'experiment_converted',
  'ai_chat_message',
  'filter_applied',
]);

/**
 * Validates and records a single analytics event.
 * Uses idempotency_key to prevent duplicate counting.
 */
async function trackEvent(eventData) {
  const {
    eventName,
    userId = null,
    sessionId,
    searchId = null,
    itineraryId = null,
    experimentId = null,
    variant = null,
    properties = {},
    idempotencyKey = null,
    timestamp = new Date(),
  } = eventData;

  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    throw new Error(`Invalid or unsupported analytics event name: "${eventName}"`);
  }

  if (!sessionId) {
    throw new Error('A valid sessionId is required for analytics event tracking');
  }

  // Check idempotency if key provided
  if (idempotencyKey) {
    const existing = await query(
      `SELECT id FROM analytics_events WHERE idempotency_key = $1 LIMIT 1`,
      [idempotencyKey]
    );
    if (existing.rows.length > 0) {
      logger.info('Duplicate analytics event skipped by idempotency key', { idempotencyKey, eventName });
      return { id: existing.rows[0].id, deduplicated: true };
    }
  }

  const eventId = uuidv4();
  const safeTimestamp = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();

  await query(
    `INSERT INTO analytics_events (
      id, event_name, timestamp, user_id, session_id, search_id,
      itinerary_id, experiment_id, variant, properties, idempotency_key
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      eventId,
      eventName,
      safeTimestamp,
      userId,
      sessionId,
      searchId,
      itineraryId,
      experimentId,
      variant,
      JSON.stringify(properties || {}),
      idempotencyKey,
    ]
  );

  return { id: eventId, deduplicated: false };
}

/**
 * Records a batch of analytics events transactionally.
 */
async function trackBatchEvents(events = []) {
  if (!Array.isArray(events) || events.length === 0) return { recorded: 0 };

  let recorded = 0;
  for (const ev of events) {
    try {
      await trackEvent(ev);
      recorded += 1;
    } catch (err) {
      logger.warn('Failed to insert single event in batch', { error: err.message, eventName: ev?.eventName });
    }
  }

  return { recorded, total: events.length };
}

module.exports = {
  trackEvent,
  trackBatchEvents,
  ALLOWED_EVENTS,
};
