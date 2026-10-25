/**
 * Geoapify Places — unit tests for the Places SERVICE layer
 * (src/services/placesService.js).
 *
 * Calls real service functions with mocked axios and caches, isolating
 * the tests from external network calls and databases.
 */

jest.mock('axios');
const axios = require('axios');


const placesService = require('../../src/services/placesService');
const config = require('../../src/config/env');
const AppError = require('../../src/utils/AppError');
const { placesCache } = require('../../src/cache/memoryCache');

const BASE_URL = 'https://api.geoapify.com/v2/places';

const ORIGINAL_API_KEY = config.places.apiKey;
const TEST_API_KEY = 'fake-test-geoapify-key';

const DEL = { lat: 28.556, lon: 77.1 };

beforeEach(() => {
  jest.clearAllMocks();
  placesCache.clear();
  config.places.apiKey = TEST_API_KEY;
});


afterAll(() => {
  config.places.apiKey = ORIGINAL_API_KEY;
});

function placesSuccess(features = []) {
  return {
    data: {
      features,
    },
  };
}

function hotelFeature(overrides = {}) {
  return {
    properties: {
      place_id: 'hotel1',
      name: 'Grand Hotel',
      formatted: '123 Main St',
      rating: 4.5,
      rating_count: 200,
      price_level: 'PRICE_LEVEL_MODERATE',
      open_now: true,
      lat: 28.6,
      lon: 77.2,
      country_code: 'au',
      ...overrides,
    },
  };
}

function restaurantFeature(overrides = {}) {
  return {
    properties: {
      place_id: 'rest1',
      name: 'Tasty Bites',
      formatted: '456 Food St',
      rating: 4.2,
      rating_count: 80,
      price_level: 'PRICE_LEVEL_INEXPENSIVE',
      open_now: false,
      lat: 28.55,
      lon: 77.11,
      country_code: 'au',
      ...overrides,
    },
  };
}

function attractionFeature(overrides = {}) {
  return {
    properties: {
      place_id: 'attr1',
      name: 'Historic Fort',
      formatted: '789 Heritage Rd',
      rating: 4.8,
      rating_count: 5000,
      price_level: null,
      open_now: true,
      lat: 28.65,
      lon: 77.23,
      country_code: 'au',
      ...overrides,
    },
  };
}

// ---------------------------------------------------------------------
// 1. HOTELS
// ---------------------------------------------------------------------
describe('placesService.getNearbyHotels', () => {
  test('successful search returns normalized hotel data', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([hotelFeature()]));

    const result = await placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });

    expect(result).toEqual([
      {
        id: 'hotel1',
        name: 'Grand Hotel',
        address: '123 Main St',
        rating: 4.5,
        ratingCount: 200,
        priceLevel: 'PRICE_LEVEL_MODERATE',
        openNow: true,
        mapsUri: 'https://www.google.com/maps/search/?api=1&query=28.6,77.2',
        location: { lat: 28.6, lon: 77.2 },
        countryCode: 'au',
        photoName: '/images/hotels/hotel-1-1.jpg',
        imageUrl: '/images/hotels/hotel-1-1.jpg',
      },
    ]);
  });

  test('calls Geoapify with the correct query parameters', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([]));

    await placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });

    expect(axios.get).toHaveBeenCalledTimes(1);
    const [url, options] = axios.get.mock.calls[0];
    expect(url).toBe(BASE_URL);
    expect(options.params).toEqual({
      categories: 'accommodation.hotel,accommodation.guest_house,accommodation.hostel',
      filter: `circle:${DEL.lon},${DEL.lat},5000`,
      bias: `proximity:${DEL.lon},${DEL.lat}`,
      limit: 10,
      apiKey: config.places.apiKey,
    });
    expect(options.timeout).toBe(10000);
  });

  test('empty results from the provider resolve to an empty array, not an error', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([]));

    const result = await placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });

    expect(result).toEqual([]);
  });

  test('missing API configuration rejects with 500 PLACES_NOT_CONFIGURED and never calls the provider', async () => {
    config.places.apiKey = undefined;

    await expect(placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon })).rejects.toMatchObject({
      statusCode: 500,
      errorCode: 'PLACES_NOT_CONFIGURED',
      message: expect.stringContaining('Set GEOAPIFY_API_KEY in .env'),
    });
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('provider 401/403 maps to 502 PLACES_PROVIDER_ERROR with invalid key message', async () => {
    const providerError = new Error('Request failed with status code 403');
    providerError.response = { status: 403, data: { message: 'Invalid API key' } };
    axios.get.mockRejectedValueOnce(providerError);

    await expect(placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon })).rejects.toMatchObject({
      statusCode: 502,
      errorCode: 'PLACES_PROVIDER_ERROR',
      message: 'Geoapify API key is invalid or not authorized.',
    });
  });

  test('generic provider failure maps to 502 PLACES_PROVIDER_ERROR', async () => {
    const providerError = new Error('Network timeout');
    providerError.response = { status: 500, data: {} };
    axios.get.mockRejectedValueOnce(providerError);

    await expect(placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon })).rejects.toMatchObject({
      statusCode: 502,
      errorCode: 'PLACES_PROVIDER_ERROR',
      message: 'Could not fetch nearby places right now.',
    });
  });

  test('cache hit: subsequent call for the same coordinates does not call axios again', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([hotelFeature()]));

    const first = await placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });
    const second = await placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});

// ---------------------------------------------------------------------
// 2. RESTAURANTS
// ---------------------------------------------------------------------
describe('placesService.getNearbyRestaurants', () => {
  test('successful search returns normalized restaurant data', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([restaurantFeature()]));

    const result = await placesService.getNearbyRestaurants({ lat: DEL.lat, lon: DEL.lon });

    expect(result).toEqual([
      {
        id: 'rest1',
        name: 'Tasty Bites',
        address: '456 Food St',
        rating: 4.2,
        ratingCount: 80,
        priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
        openNow: false,
        mapsUri: 'https://www.google.com/maps/search/?api=1&query=28.55,77.11',
        location: { lat: 28.55, lon: 77.11 },
        countryCode: 'au',
        photoName: '/images/restaurants/restaurant-1-1.jpg',
        imageUrl: '/images/restaurants/restaurant-1-1.jpg',
      },
    ]);
  });

  test('calls Geoapify with restaurant categories', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([]));

    await placesService.getNearbyRestaurants({ lat: DEL.lat, lon: DEL.lon });

    expect(axios.get).toHaveBeenCalledTimes(1);
    const [, options] = axios.get.mock.calls[0];
    expect(options.params.categories).toBe('catering.restaurant,catering.cafe,catering.fast_food');
    expect(options.params.filter).toBe(`circle:${DEL.lon},${DEL.lat},5000`);
  });
});

// ---------------------------------------------------------------------
// 3. TOURIST ATTRACTIONS
// ---------------------------------------------------------------------
describe('placesService.getTouristAttractions', () => {
  test('successful search returns normalized attraction data with 10km radius', async () => {
    axios.get.mockResolvedValueOnce(placesSuccess([attractionFeature()]));

    const result = await placesService.getTouristAttractions({ lat: DEL.lat, lon: DEL.lon });

    expect(result).toEqual([
      {
        id: 'attr1',
        name: 'Historic Fort',
        address: '789 Heritage Rd',
        rating: 4.8,
        ratingCount: 5000,
        priceLevel: null,
        openNow: true,
        mapsUri: 'https://www.google.com/maps/search/?api=1&query=28.65,77.23',
        location: { lat: 28.65, lon: 77.23 },
        countryCode: 'au',
        photoName: '/images/things-to-do/thing-1-1.jpg',
        imageUrl: '/images/things-to-do/thing-1-1.jpg',
      },
    ]);

    expect(axios.get).toHaveBeenCalledTimes(1);
    const [, options] = axios.get.mock.calls[0];
    expect(options.params.categories).toBe('tourism.attraction,tourism.sights,entertainment,heritage');
    expect(options.params.filter).toBe(`circle:${DEL.lon},${DEL.lat},10000`);
  });
});

// ---------------------------------------------------------------------
// 4. PHOTO BYTES (Backward Compatibility)
// ---------------------------------------------------------------------
describe('placesService.getPhotoBytes', () => {
  test('returns null for backward compatibility without making network calls', async () => {
    const result = await placesService.getPhotoBytes({ photoName: 'some_photo' });
    expect(result).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------
// 5. SECURITY & DEDUPLICATION
// ---------------------------------------------------------------------
describe('placesService — security and concurrency', () => {
  test('provider errors never leak the configured API key in thrown AppError', async () => {
    const providerError = new Error('Provider error with key');
    providerError.response = { status: 500, data: { message: `failed with ${config.places.apiKey}` } };
    axios.get.mockRejectedValueOnce(providerError);

    let caught;
    try {
      await placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(AppError);
    expect(caught.message).not.toContain(config.places.apiKey);
    expect(caught.errorCode).toBe('PLACES_PROVIDER_ERROR');
  });

  test('concurrent requests for the same coordinates share the in-flight promise', async () => {
    let resolveRequest;
    axios.get.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const promise1 = placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });
    const promise2 = placesService.getNearbyHotels({ lat: DEL.lat, lon: DEL.lon });

    await new Promise((resolve) => setImmediate(resolve));

    expect(axios.get).toHaveBeenCalledTimes(1);

    resolveRequest(placesSuccess([hotelFeature()]));

    const [res1, res2] = await Promise.all([promise1, promise2]);
    expect(res1).toEqual(res2);
    expect(axios.get).toHaveBeenCalledTimes(1);

  });
});
