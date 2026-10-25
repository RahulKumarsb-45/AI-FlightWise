import { api } from './apiClient';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || '';
export const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID);
const SESSION_STORAGE_KEY = 'fw_session_id';

function sanitizeParams(params = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      clean[key] = type === 'string' && value.length > 100 ? value.slice(0, 100) : value;
    }
  }
  return clean;
}

function callGtag(...args) {
  if (!isAnalyticsEnabled) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag(...args);
  } catch {
    // Analytics must never break the app — swallow and move on.
  }
}

/**
 * Returns or generates a persistent anonymous or session UUID.
 */
export function getOrCreateSessionId() {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return 'server_session';
  try {
    let sessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'fallback_session';
  }
}

/**
 * Records a page_view for a client-side route change.
 */
export function trackPageView(url) {
  if (!url) return;
  callGtag('event', 'page_view', {
    page_path: url,
  });
}

/**
 * Tracks a product analytics event to the backend API (PostgreSQL analytics_events)
 * and Google Analytics (if configured).
 * Never throws or disrupts user interactions.
 */
export async function trackEvent(eventName, properties = {}, extra = {}) {
  if (!eventName || typeof eventName !== 'string') return;

  // 1. Send to Google Analytics (legacy)
  callGtag('event', eventName, sanitizeParams(properties));

  // 2. Persist to PostgreSQL backend analytics_events
  try {
    const sessionId = getOrCreateSessionId();
    await api.post('/analytics/events', {
      eventName,
      sessionId,
      properties: sanitizeParams(properties),
      searchId: extra.searchId || null,
      itineraryId: extra.itineraryId || null,
      experimentId: extra.experimentId || null,
      variant: extra.variant || null,
      idempotencyKey: extra.idempotencyKey || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Fail safe: Telemetry error never blocks user actions
  }
}

// ---------------------------------------------------------------------------
// Named helpers for the app's user actions
// ---------------------------------------------------------------------------

export function trackFlightSearch({ origin, destinations, tripType, travelers, preference, dateFlexible, nearbyAirportsEnabled } = {}) {
  trackEvent('search_submitted', {
    origin,
    destination: Array.isArray(destinations) ? destinations.join(',') : destinations,
    trip_type: tripType,
    passengers: travelers,
    preference,
    date_flexible: Boolean(dateFlexible),
    nearby_airports_enabled: Boolean(nearbyAirportsEnabled),
  });
}

export function trackSearchSubmitted({ origin, destinations, tripType, travelers, preference, hasBudget } = {}) {
  trackEvent('search_submitted', {
    origin,
    destinations: Array.isArray(destinations) ? destinations.join(',') : destinations,
    trip_type: tripType,
    travelers,
    preference,
    has_budget: Boolean(hasBudget),
  });
}

export function trackResultsViewed({ recommendationCount, hasTopPick, tripType } = {}) {
  trackEvent('results_viewed', {
    recommendation_count: recommendationCount,
    has_top_pick: Boolean(hasTopPick),
    trip_type: tripType,
  });
}

export function trackSelectFlight({ rank, isTopPick, usesNearbyAirport, experimentId, variant } = {}) {
  trackEvent('recommendation_selected', {
    rank,
    is_top_pick: Boolean(isTopPick),
    uses_nearby_airport: Boolean(usesNearbyAirport),
    experiment_id: experimentId,
    variant,
  }, { experimentId, variant });
}

export function trackRecommendationExpanded({ rank, isTopPick, usesNearbyAirport, category } = {}) {
  trackEvent('recommendation_selected', {
    rank,
    is_top_pick: Boolean(isTopPick),
    uses_nearby_airport: Boolean(usesNearbyAirport),
    category: category || 'standard',
  });
}

export function trackItinerarySaved({ tripId, action = 'save' } = {}) {
  trackEvent('trip_saved', {
    trip_id: tripId,
    action,
  }, { itineraryId: tripId });
}

export function trackItineraryShared({ tripId } = {}) {
  trackEvent('trip_shared', {
    trip_id: tripId,
  }, { itineraryId: tripId });
}

export function trackBeginCheckout({ plan, valueInr } = {}) {
  trackEvent('checkout_initiated', {
    plan,
    currency: 'INR',
    value: valueInr,
  });
}

export function trackPurchase({ plan, valueInr, orderId } = {}) {
  trackEvent('payment_verified', {
    plan,
    currency: 'INR',
    value: valueInr,
    transaction_id: orderId,
  }, { idempotencyKey: `pay_${orderId}` });
}

export function trackRecommendationFeedbackSubmitted({ isHelpful, reason, hasComment } = {}) {
  trackEvent('feedback_submitted', {
    is_helpful: Boolean(isHelpful),
    reason: reason || 'none',
    has_comment: Boolean(hasComment),
  });
}

export function trackExperimentAssigned({ experimentName, variantId } = {}) {
  trackEvent('experiment_assigned', {
    experiment_name: experimentName,
    variant_id: variantId,
  }, { experimentId: experimentName, variant: variantId });
}

export function trackExperimentExposed({ experimentName, variantId } = {}) {
  trackEvent('experiment_exposed', {
    experiment_name: experimentName,
    variant_id: variantId,
  }, { experimentId: experimentName, variant: variantId });
}

export function trackAIAgentMessage({ action, success, page = 'ai-agent' } = {}) {
  trackEvent('ai_chat_message', {
    action,
    success: Boolean(success),
    page,
  });
}

export function trackHotelSearch({ iataCode, resultCount } = {}) {
  trackEvent('hotel_search', { iata_code: iataCode, result_count: resultCount });
}

export function trackSelectHotel({ iataCode, hasRating } = {}) {
  trackEvent('select_hotel', { iata_code: iataCode, has_rating: Boolean(hasRating) });
}

export function trackRestaurantSearch({ iataCode, resultCount } = {}) {
  trackEvent('restaurant_search', { iata_code: iataCode, result_count: resultCount });
}

export function trackSelectRestaurant({ iataCode, hasRating } = {}) {
  trackEvent('select_restaurant', { iata_code: iataCode, has_rating: Boolean(hasRating) });
}

export function trackAttractionSearch({ iataCode, resultCount } = {}) {
  trackEvent('attraction_search', { iata_code: iataCode, result_count: resultCount });
}

export function trackSelectAttraction({ iataCode, hasRating } = {}) {
  trackEvent('select_attraction', { iata_code: iataCode, has_rating: Boolean(hasRating) });
}

export function trackTradeoffCompared({ category, total_options_compared } = {}) {
  trackEvent('tradeoff_compared', { category, total_options_compared: total_options_compared || 3 });
}

export function trackItineraryExported({ format = 'pdf', hasHotels, hasAttractions } = {}) {
  trackEvent('itinerary_exported', { format, has_hotels: Boolean(hasHotels), has_attractions: Boolean(hasAttractions) });
}

export function trackCopilotMessageSent({ action = 'chat', success = true } = {}) {
  trackEvent('copilot_message_sent', { action, success: Boolean(success) });
}

export function trackLogin({ method } = {}) {
  trackEvent('login', { method });
}

export function trackSignUp({ method } = {}) {
  trackEvent('sign_up', { method });
}

export const analytics = {
  track: trackEvent,
  getSessionId: getOrCreateSessionId,
};
