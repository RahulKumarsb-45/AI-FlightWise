/**
 * Lightweight, privacy-conscious client-side A/B experimentation helper.
 *
 * Designed for product experimentation without third-party tracking bloat:
 *  - Stable variant assignment per anonymous visitor ID.
 *  - URL override support for QA/testing (?exp_<name>=variant).
 *  - Integrated with our sanitized analytics funnel (experiment_assigned event).
 *  - Safe fallback to control when experiments are disabled.
 */

import { trackExperimentAssigned } from './analytics';

const EXPERIMENTS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTS !== 'false';

// Simple deterministic hash to map string -> integer [0, 99]
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

function getOrCreateAnonymousId() {
  if (typeof window === 'undefined') return 'server_render_anon';

  try {
    let anonId = localStorage.getItem('flightwise_anon_id');
    if (!anonId) {
      anonId = 'anon_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
      localStorage.setItem('flightwise_anon_id', anonId);
    }
    return anonId;
  } catch {
    return 'fallback_anon_id';
  }
}

/**
 * Assigns or retrieves the variant for a given experiment.
 *
 * @param {string} experimentName - e.g. 'recommendation_presentation'
 * @param {Array<{ id: string, weight: number }>} variants - e.g. [{ id: 'control', weight: 50 }, { id: 'variant_matrix', weight: 50 }]
 * @returns {string} assigned variant id
 */
export function getExperimentVariant(
  experimentName = 'recommendation_presentation',
  variants = [
    { id: 'control', weight: 50 },
    { id: 'variant_matrix', weight: 50 },
  ]
) {
  if (!EXPERIMENTS_ENABLED) return variants[0]?.id || 'control';

  // Check URL query override for testing (e.g. ?exp_tradeoff=variant_matrix)
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const overrideKey = `exp_${experimentName.replace(/_/g, '')}`;
      const urlOverride = urlParams.get(overrideKey) || urlParams.get(`exp_${experimentName}`);
      if (urlOverride && variants.some((v) => v.id === urlOverride)) {
        return urlOverride;
      }
    } catch {
      // URL parsing failed, proceed to hashed assignment
    }
  }

  const anonId = getOrCreateAnonymousId();
  const hashVal = simpleHash(`${experimentName}:${anonId}`);

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (hashVal < cumulative) {
      if (typeof window !== 'undefined') {
        trackExperimentAssigned({
          experimentName,
          variantId: variant.id,
        });
      }
      return variant.id;
    }
  }

  return variants[0]?.id || 'control';
}
