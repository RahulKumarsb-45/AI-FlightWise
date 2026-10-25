const crypto = require('crypto');
const { query } = require('../database/pool');
const config = require('../config/env');
const logger = require('../logger/logger');
const { flightMemoryCache } = require('./memoryCache');

const TTL_MS = config.cache.flightTtlMinutes * 60 * 1000;

function buildCacheKey({ originIata, destinationIata, departureDate, returnDate, adults, cabinClass, provider }) {
  const raw = [originIata, destinationIata, departureDate, returnDate || '', adults, cabinClass, provider].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Two-layer lookup: in-process memory first (fastest, this instance only),
 * then Postgres (durable source of truth).
 *
 * A Postgres hit backfills memory so subsequent requests on this instance
 * are served without another database round trip.
 */
async function getCached(params) {
  const key = buildCacheKey(params);

  const memHit = flightMemoryCache.get(key);
  if (memHit !== null) return memHit;

  try {
    const result = await query(
      `SELECT response_json FROM flight_cache WHERE cache_key = $1 AND expires_at > now()`,
      [key]
    );
    if (result.rows.length === 0) return null;
    const offers = result.rows[0].response_json;

    flightMemoryCache.set(key, offers, TTL_MS);
    return offers;
  } catch (err) {
    logger.warn('Flight cache read failed, proceeding without cache', { error: err.message });
    return null;
  }
}

/**
 * Write-through: memory for speed, Postgres for durability.
 */
async function setCached(params, offers) {
  const key = buildCacheKey(params);

  flightMemoryCache.set(key, offers, TTL_MS);

  try {
    const expiresAt = new Date(Date.now() + TTL_MS);
    await query(
      `INSERT INTO flight_cache (cache_key, response_json, provider, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cache_key) DO UPDATE
         SET response_json = EXCLUDED.response_json,
             expires_at = EXCLUDED.expires_at,
             created_at = now()`,
      [key, JSON.stringify(offers), params.provider, expiresAt]
    );
  } catch (err) {
    logger.warn('Flight cache write failed, continuing without caching this result', { error: err.message });
  }
}

/**
 * Deletes expired rows. Intended to be called by a scheduled cron job.
 */
async function purgeExpired() {
  const result = await query(`DELETE FROM flight_cache WHERE expires_at <= now()`);
  logger.info('Flight cache purge complete', { deletedRows: result.rowCount });
  return result.rowCount;
}

module.exports = { getCached, setCached, purgeExpired, buildCacheKey };
