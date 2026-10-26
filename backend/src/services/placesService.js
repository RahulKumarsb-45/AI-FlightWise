const axios = require('axios');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const { placesCache } = require('../cache/memoryCache');
const logger = require('../logger/logger');

// ============================================================
// CACHE
// ============================================================

// Prevent duplicate concurrent requests for the same coordinates
const inFlightRequests = new Map();

async function getFromCache(cacheKey) {
  return placesCache.get(cacheKey) || null;
}

async function writeToCache(cacheKey, value, ttlMs) {
  placesCache.set(
    cacheKey,
    value,
    ttlMs
  );
}

// ============================================================
// GEOAPIFY
// ============================================================

const BASE_URL =
  'https://api.geoapify.com/v2/places';

const CACHE_TTL_MS =
  config.places.cacheTtlHours *
  60 *
  60 *
  1000;

const DEFAULT_RADIUS_METERS = 5000;
const ATTRACTIONS_RADIUS_METERS = 10000;

// ============================================================
// LOCAL IMAGES
// ============================================================

const LOCAL_IMAGE_COUNT = 10;

// Country image sets:
//
// 1 = Australia
// 2 = Japan
// 3 = New Zealand
// 4 = Singapore
//
const COUNTRY_IMAGE_INDEX = {
  au: 1,
  jp: 2,
  nz: 3,
  sg: 4,
};

// Agar koi doosra country ho jiske liye
// dedicated image set nahi hai, Australia set
// fallback ke roop mein use hoga.
// Isse broken image nahi aayegi.
const FALLBACK_COUNTRY_IMAGE_INDEX = 1;

const LOCAL_IMAGE_PATHS = {
  hotel: (countryIndex, imageIndex) =>
    `/images/hotels/hotel-${countryIndex}-${imageIndex}.jpg`,

  restaurant: (countryIndex, imageIndex) =>
    `/images/restaurants/restaurant-${countryIndex}-${imageIndex}.jpg`,

  attraction: (countryIndex, imageIndex) =>
    `/images/things-to-do/thing-${countryIndex}-${imageIndex}.jpg`,
};

function getCountryImageIndex(countryCode) {
  if (!countryCode) {
    return FALLBACK_COUNTRY_IMAGE_INDEX;
  }

  const normalizedCode =
    String(countryCode).trim().toLowerCase();

  return (
    COUNTRY_IMAGE_INDEX[normalizedCode] ||
    FALLBACK_COUNTRY_IMAGE_INDEX
  );
}

function getLocalImageUrl(
  imageType,
  countryIndex,
  resultIndex
) {
  if (!LOCAL_IMAGE_PATHS[imageType]) {
    return null;
  }

  const imageIndex =
    (resultIndex % LOCAL_IMAGE_COUNT) + 1;

  return LOCAL_IMAGE_PATHS[imageType](
    countryIndex,
    imageIndex
  );
}

// ============================================================
// API KEY
// ============================================================

function requireApiKey() {
  if (!config.places.apiKey) {
    throw new AppError(
      'Places data is not configured. Set GEOAPIFY_API_KEY in .env.',
      500,
      'PLACES_NOT_CONFIGURED'
    );
  }
}

// ============================================================
// PLACE CATEGORIES
// ============================================================

const PLACE_CATEGORIES = {
  hotels: [
    'accommodation.hotel',
    'accommodation.guest_house',
    'accommodation.hostel',
  ],

  restaurants: [
    'catering.restaurant',
    'catering.cafe',
    'catering.fast_food',
  ],

  attractions: [
    'tourism.attraction',
    'tourism.sights',
    'entertainment',
    'heritage',
  ],
};

// ============================================================
// NORMALIZE PLACE
// ============================================================

function normalizePlace(properties) {
  if (!properties) {
    return {
      id: null,
      name: 'Unknown',
      address: null,
      rating: null,
      ratingCount: 0,
      priceLevel: null,
      openNow: null,
      mapsUri: null,
      location: null,
      countryCode: null,
      photoName: null,
      imageUrl: null,
    };
  }

  const lat =
    properties.lat ??
    properties.latitude ??
    null;

  const lon =
    properties.lon ??
    properties.longitude ??
    null;

  const address =
    properties.formatted ||
    properties.address_line1 ||
    properties.address_line2 ||
    null;

  return {
    id:
      properties.place_id ||
      properties.datasource?.raw?.place_id ||
      null,

    name:
      properties.name ||
      properties.address_line1 ||
      'Unknown',

    address,

    rating:
      properties.rating ??
      properties.datasource?.raw?.rating ??
      null,

    ratingCount:
      properties.rating_count ??
      properties.datasource?.raw?.rating_count ??
      0,

    priceLevel:
      properties.price_level ??
      null,

    openNow:
      properties.open_now ??
      null,

    mapsUri:
      lat !== null && lon !== null
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        : null,

    location:
      lat !== null && lon !== null
        ? {
            lat,
            lon,
          }
        : null,

    countryCode:
      properties.country_code ||
      properties.datasource?.raw?.country_code ||
      null,

    photoName: null,

    imageUrl: null,
  };
}

// ============================================================
// GEOAPIFY SEARCH
// ============================================================

async function searchNearby({
  lat,
  lon,
  categories,
  cacheKeyPrefix,
  radiusMeters = DEFAULT_RADIUS_METERS,
  maxResults = 10,
  imageType = null,
}) {
  requireApiKey();

  // New cache version.
  const cacheKey =
    `${cacheKeyPrefix}:v4-local-images:` +
    `${lat.toFixed(3)},${lon.toFixed(3)}`;

  // ==========================================================
  // 1. IN-MEMORY CACHE
  // ==========================================================

  const cached = await getFromCache(
    cacheKey,
    CACHE_TTL_MS
  );

  if (cached) {
    return cached;
  }

  // ==========================================================
  // 2. PREVENT DUPLICATE REQUESTS
  // ==========================================================

  const existingRequest =
    inFlightRequests.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  // ==========================================================
  // 3. CREATE ONE REQUEST
  // ==========================================================

  const requestPromise = (async () => {
    try {
      // ======================================================
      // GEOAPIFY CALL
      //
      // IMPORTANT:
      // This is the ONLY external API call here.
      // No Foursquare / Google image API is called.
      // ======================================================

      const response = await axios.get(
        BASE_URL,
        {
          params: {
            categories:
              categories.join(','),

            filter:
              `circle:${lon},${lat},${radiusMeters}`,

            bias:
              `proximity:${lon},${lat}`,

            limit: Math.min(
              maxResults,
              20
            ),

            apiKey:
              config.places.apiKey,
          },

          timeout: 10000,
        }
      );

      const features =
        response.data?.features || [];

      // ======================================================
      // NORMALIZE PLACES
      // ======================================================

      const results =
        features
          .map(
            (feature) =>
              normalizePlace(
                feature.properties
              )
          )
          .filter(
            (place) =>
              place.name
          )
          .slice(
            0,
            maxResults
          );

      // ======================================================
      // ADD LOCAL IMAGES
      //
      // NO API CALL HERE.
      // These are files from frontend/public/images.
      // ======================================================

      const finalResults =
        results.map(
          (place, index) => {
            const countryIndex =
              getCountryImageIndex(
                place.countryCode
              );

            const localImage =
              getLocalImageUrl(
                imageType,
                countryIndex,
                index
              );

            return {
              ...place,

              photoName:
                localImage,

              imageUrl:
                localImage,
            };
          }
        );

      // ======================================================
      // SAVE RESULT TO BOTH CACHES
      // ======================================================

      await writeToCache(
        cacheKey,
        finalResults,
        CACHE_TTL_MS
      );

      return finalResults;

    } catch (err) {
      const status =
        err.response?.status;

      const providerMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      if (
        status === 401 ||
        status === 403
      ) {
        logger.warn(
          'Geoapify Places authentication failed',
          {
            status,
            error:
              providerMessage,
          }
        );

        throw new AppError(
          'Geoapify API key is invalid or not authorized.',
          502,
          'PLACES_PROVIDER_ERROR'
        );
      }

      logger.warn(
        'Geoapify nearby search failed',
        {
          lat,
          lon,
          categories,
          status,
          error:
            providerMessage,
        }
      );

      throw new AppError(
        'Could not fetch nearby places right now.',
        502,
        'PLACES_PROVIDER_ERROR'
      );
    }
  })();

  // Register immediately so another identical request
  // gets the same Promise.
  inFlightRequests.set(
    cacheKey,
    requestPromise
  );

  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(
      cacheKey
    );
  }
}

// ============================================================
// GOOGLE PLACES PROVIDER INTEGRATION
// ============================================================

function isGooglePlaces() {
  if (config.places.provider === 'google') return true;
  if (config.places.provider === 'geoapify') return false;
  if (typeof config.places.apiKey === 'string' && config.places.apiKey.includes('google')) return true;
  return false;
}

function normalizeGooglePlace(place, category) {
  return {
    id: place.id || '',
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    priceLevel: place.priceLevel ?? null,
    openNow: place.currentOpeningHours?.openNow ?? null,
    mapsUri: place.googleMapsUri || null,
    location: place.location || null,
    lat: place.location?.latitude ?? null,
    lon: place.location?.longitude ?? null,
    photos: place.photos || [],
    description: place.editorialSummary?.text || null,
    category: place.primaryTypeDisplayName?.text || category || null,
  };
}

async function searchNearbyGoogle({ lat, lon, type, radiusMeters, maxResults = 10, cacheKeyPrefix }) {
  requireApiKey();

  const cacheKey = `${cacheKeyPrefix}:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = (async () => {
    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          includedTypes: [type],
          maxResultCount: maxResults,
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: lon,
              },
              radius: radiusMeters,
            },
          },
        },
        {
          headers: {
            'X-Goog-Api-Key': config.places.apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.googleMapsUri,places.location,places.photos,places.editorialSummary,places.primaryTypeDisplayName',
          },
          timeout: 10000,
        }
      );

      if (!response || !response.data) {
        throw new AppError('Could not fetch nearby places right now.', 502, 'PLACES_PROVIDER_ERROR');
      }

      const places = response.data.places;
      if (!Array.isArray(places)) {
        return [];
      }

      const results = places.map((p) => normalizeGooglePlace(p, type));
      await writeToCache(cacheKey, results, CACHE_TTL_MS);
      return results;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        throw new AppError('Google Places API key is invalid or not authorized.', 502, 'PLACES_PROVIDER_ERROR');
      }
      throw new AppError('Could not fetch nearby places right now.', 502, 'PLACES_PROVIDER_ERROR');
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

// ============================================================
// HOTELS
// ============================================================

async function getNearbyHotels({
  lat,
  lon,
}) {
  if (isGooglePlaces()) {
    return searchNearbyGoogle({
      lat,
      lon,
      type: 'hotel',
      radiusMeters: DEFAULT_RADIUS_METERS,
      maxResults: 10,
      cacheKeyPrefix: 'hotels',
    });
  }

  return searchNearby({
    lat,
    lon,

    categories:
      PLACE_CATEGORIES.hotels,

    cacheKeyPrefix:
      'hotels',

    radiusMeters:
      DEFAULT_RADIUS_METERS,

    maxResults:
      10,

    imageType:
      'hotel',
  });
}

// ============================================================
// RESTAURANTS
// ============================================================

async function getNearbyRestaurants({
  lat,
  lon,
}) {
  if (isGooglePlaces()) {
    return searchNearbyGoogle({
      lat,
      lon,
      type: 'restaurant',
      radiusMeters: DEFAULT_RADIUS_METERS,
      maxResults: 10,
      cacheKeyPrefix: 'restaurants',
    });
  }

  return searchNearby({
    lat,
    lon,

    categories:
      PLACE_CATEGORIES.restaurants,

    cacheKeyPrefix:
      'restaurants',

    radiusMeters:
      DEFAULT_RADIUS_METERS,

    maxResults:
      10,

    imageType:
      'restaurant',
  });
}

// ============================================================
// TOURIST ATTRACTIONS
// ============================================================

async function getTouristAttractions({
  lat,
  lon,
}) {
  if (isGooglePlaces()) {
    return searchNearbyGoogle({
      lat,
      lon,
      type: 'tourist_attraction',
      radiusMeters: ATTRACTIONS_RADIUS_METERS,
      maxResults: 10,
      cacheKeyPrefix: 'attractions',
    });
  }

  return searchNearby({
    lat,
    lon,

    categories:
      PLACE_CATEGORIES.attractions,

    cacheKeyPrefix:
      'attractions',

    radiusMeters:
      ATTRACTIONS_RADIUS_METERS,

    maxResults:
      10,

    imageType:
      'attraction',
  });
}

// ============================================================
// PHOTOS
// ============================================================

async function getPhotoBytes({ photoName, maxWidthPx = 400 } = {}) {
  if (!isGooglePlaces() || !photoName || !photoName.startsWith('places/')) {
    return null;
  }
  requireApiKey();
  try {
    const url = `https://places.googleapis.com/v1/${photoName}/media`;
    const response = await axios.get(url, {
      params: {
        maxWidthPx,
        key: config.places.apiKey,
      },
      responseType: 'arraybuffer',
    });
    return {
      data: response.data,
      contentType: response.headers?.['content-type'] || 'image/jpeg',
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      throw new AppError('Google Places API key is invalid or not authorized.', 502, 'PLACES_PROVIDER_ERROR');
    }
    throw new AppError('Could not fetch place photo.', 502, 'PLACES_PROVIDER_ERROR');
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getNearbyHotels,
  getNearbyRestaurants,
  getTouristAttractions,
  getPhotoBytes,
};