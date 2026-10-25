jest.mock('../../src/database/pool');

const { query } = require('../../src/database/pool');
const flightCache = require('../../src/cache/flightCache');
const { flightMemoryCache } = require('../../src/cache/memoryCache');

afterEach(() => {
  flightMemoryCache.clear();
  jest.resetAllMocks();
});

const SEARCH_PARAMS = {
  originIata: 'DEL',
  destinationIata: 'BOM',
  departureDate: '2026-11-01',
  returnDate: null,
  adults: 1,
  cabinClass: 'economy',
  provider: 'mock',
};

const OFFERS = [{ price: 4200, provider: 'mock' }];

describe('flightCache.buildCacheKey', () => {
  test('is deterministic for identical params', () => {
    const a = flightCache.buildCacheKey(SEARCH_PARAMS);
    const b = flightCache.buildCacheKey({ ...SEARCH_PARAMS });
    expect(a).toBe(b);
  });

  test('differs when any param changes', () => {
    const a = flightCache.buildCacheKey(SEARCH_PARAMS);
    const b = flightCache.buildCacheKey({ ...SEARCH_PARAMS, adults: 2 });
    expect(a).not.toBe(b);
  });
});

describe('flightCache.getCached — Memory L0 / Postgres L1', () => {
  test('returns the in-memory value directly without touching Postgres on a memory hit', async () => {
    flightMemoryCache.set(flightCache.buildCacheKey(SEARCH_PARAMS), OFFERS, 60000);

    const result = await flightCache.getCached(SEARCH_PARAMS);

    expect(result).toEqual(OFFERS);
    expect(query).not.toHaveBeenCalled();
  });

  test('queries Postgres when memory cache misses, and backfills memory', async () => {
    query.mockResolvedValue({ rows: [{ response_json: OFFERS }] });

    const result = await flightCache.getCached(SEARCH_PARAMS);

    expect(result).toEqual(OFFERS);
    expect(query).toHaveBeenCalledTimes(1);

    // Second call hits memory without querying Postgres
    query.mockClear();
    const second = await flightCache.getCached(SEARCH_PARAMS);
    expect(second).toEqual(OFFERS);
    expect(query).not.toHaveBeenCalled();
  });

  test('returns null when neither memory nor Postgres has the entry', async () => {
    query.mockResolvedValue({ rows: [] });

    const result = await flightCache.getCached(SEARCH_PARAMS);

    expect(result).toBeNull();
  });

  test('a Postgres read failure is swallowed and returns null instead of throwing', async () => {
    query.mockRejectedValue(new Error('connection terminated'));

    const result = await flightCache.getCached(SEARCH_PARAMS);

    expect(result).toBeNull();
  });
});

describe('flightCache.setCached — write-through', () => {
  test('writes to memory and Postgres', async () => {
    query.mockResolvedValue({ rows: [] });

    await flightCache.setCached(SEARCH_PARAMS, OFFERS);

    expect(flightMemoryCache.get(flightCache.buildCacheKey(SEARCH_PARAMS))).toEqual(OFFERS);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('a Postgres write failure is swallowed rather than thrown, keeping memory populated', async () => {
    query.mockRejectedValue(new Error('unique_violation'));

    await expect(flightCache.setCached(SEARCH_PARAMS, OFFERS)).resolves.not.toThrow();
    expect(flightMemoryCache.get(flightCache.buildCacheKey(SEARCH_PARAMS))).toEqual(OFFERS);
  });
});

describe('flightCache.purgeExpired', () => {
  test('deletes expired rows and returns count', async () => {
    query.mockResolvedValue({ rowCount: 5 });

    const count = await flightCache.purgeExpired();

    expect(count).toBe(5);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM flight_cache'));
  });
});
