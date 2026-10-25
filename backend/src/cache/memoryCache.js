/**
 * Lightweight in-process cache with TTL for single-instance
 * deployments and for data that's cheap to recompute.
 */
class MemoryCache {
  constructor() {
    this.store = new Map(); // key -> { value, expiresAt }
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// In-memory cache singletons
const staticCache = new MemoryCache();
const weatherCache = new MemoryCache();
const placesCache = new MemoryCache();
const flightMemoryCache = new MemoryCache();

module.exports = {
  MemoryCache,
  staticCache,
  weatherCache,
  placesCache,
  flightMemoryCache,
};
