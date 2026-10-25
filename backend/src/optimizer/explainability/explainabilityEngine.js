/**
 * TEMPLATE-BASED EXPLAINABILITY & DECISION INTELLIGENCE
 * (per architecture decision: search-result explanations and trade-off comparisons
 * are rule/template-based and deterministic — free, instant, grounded in real fields.)
 */

function formatInr(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Explains why `candidate` ranked where it did, primarily by comparing it
 * against the next-best alternative on whichever dimension the requested
 * preference cares about most.
 */
function explainCandidate(candidate, allCandidates, preference = 'balanced') {
  const rank = allCandidates.findIndex((c) => c === candidate);
  const reasons = [];

  if (rank === 0) {
    reasons.push(buildTopPickReason(candidate, allCandidates, preference));
  } else {
    const topPick = allCandidates[0];
    reasons.push(buildComparisonReason(candidate, topPick));
  }

  if (candidate.totalStops === 0) {
    reasons.push('This is a direct flight with no layovers.');
  } else if (candidate.totalStops === 1) {
    reasons.push('This itinerary has one layover.');
  } else {
    reasons.push(`This itinerary has ${candidate.totalStops} layovers.`);
  }

  const nonPrimaryAirports = [candidate.originAirport, ...(candidate.destinationAirports || [])]
    .filter((a) => a && a.isPrimary === false);
  if (nonPrimaryAirports.length > 0) {
    const names = nonPrimaryAirports.map((a) => `${a.city} (${a.iata})`).join(', ');
    reasons.push(`Uses a nearby airport (${names}) instead of the main one — often cheaper for a short extra journey.`);
  }

  return reasons.join(' ');
}

function buildTopPickReason(candidate, allCandidates, preference) {
  const preferenceLabel =
    { cheapest: 'lowest price', fastest: 'shortest travel time', balanced: 'best overall balance of price and time' }[
      preference
    ] || 'best overall value';

  if (allCandidates.length === 1) {
    return `Recommended: ${formatInr(candidate.totalPriceInr)}, ${formatDuration(candidate.totalDurationMinutes)} total travel time.`;
  }

  return `Top pick for ${preferenceLabel} — ${formatInr(candidate.totalPriceInr)} total, ${formatDuration(candidate.totalDurationMinutes)} travel time.`;
}

function buildComparisonReason(candidate, topPick) {
  const priceDiff = candidate.totalPriceInr - topPick.totalPriceInr;
  const durationDiffMinutes = candidate.totalDurationMinutes - topPick.totalDurationMinutes;

  const parts = [];

  if (priceDiff > 0) {
    parts.push(`costs ${formatInr(priceDiff)} more than the top pick`);
  } else if (priceDiff < 0) {
    parts.push(`costs ${formatInr(Math.abs(priceDiff))} less than the top pick`);
  }

  if (Math.abs(durationDiffMinutes) >= 15) {
    if (durationDiffMinutes < 0) {
      parts.push(`saves ${formatDuration(Math.abs(durationDiffMinutes))}`);
    } else {
      parts.push(`takes ${formatDuration(durationDiffMinutes)} longer`);
    }
  }

  if (candidate.totalStops < topPick.totalStops) {
    parts.push('has fewer layovers');
  } else if (candidate.totalStops > topPick.totalStops) {
    parts.push('has more layovers');
  }

  if (parts.length === 0) {
    return 'A comparable alternative to the top pick.';
  }

  const joined = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} but ${parts[parts.length - 1]}`;
  return `This option ${joined}.`;
}

/**
 * Explains category picks (cheapest / fastest / balanced) relative to each other —
 * used on the results page's "compare" view.
 */
function explainCategoryPicks({ cheapest, fastest, balanced }) {
  if (!cheapest || !fastest) return {};

  const priceSavings = fastest.totalPriceInr - cheapest.totalPriceInr;
  const timeCost = cheapest.totalDurationMinutes - fastest.totalDurationMinutes;

  return {
    cheapest: `${formatInr(cheapest.totalPriceInr)} — the lowest price found, but ${formatDuration(Math.abs(timeCost))} slower than the fastest option.`,
    fastest: `${formatDuration(fastest.totalDurationMinutes)} — the quickest way to get there, for ${formatInr(Math.abs(priceSavings))} more than the cheapest option.`,
    balanced: balanced
      ? `${formatInr(balanced.totalPriceInr)}, ${formatDuration(balanced.totalDurationMinutes)} — the best trade-off between price and travel time.`
      : undefined,
  };
}

/**
 * Builds structured Decision Intelligence for a recommendation.
 * Grounded in actual prices, durations, stops, and airport metadata.
 */
function buildDecisionIntelligence(candidate, allCandidates = [], preference = 'balanced', categories = {}) {
  const rank = allCandidates.findIndex((c) => c === candidate);
  const cheapest =
    categories.cheapest ||
    allCandidates.reduce((min, c) => (!min || c.totalPriceInr < min.totalPriceInr ? c : min), null);
  const fastest =
    categories.fastest ||
    allCandidates.reduce((min, c) => (!min || c.totalDurationMinutes < min.totalDurationMinutes ? c : min), null);

  const priceDiffVsCheapest = cheapest ? candidate.totalPriceInr - cheapest.totalPriceInr : 0;
  const timeDiffVsFastest = fastest ? candidate.totalDurationMinutes - fastest.totalDurationMinutes : 0;

  const advantages = [];
  const disadvantages = [];

  // Price advantages & trade-offs
  if (priceDiffVsCheapest === 0) {
    advantages.push('Guaranteed lowest flight price across all evaluated routes.');
  } else if (priceDiffVsCheapest > 0) {
    disadvantages.push(`Costs ${formatInr(priceDiffVsCheapest)} more than the cheapest available option.`);
  }

  // Duration advantages & trade-offs
  if (timeDiffVsFastest === 0) {
    advantages.push('Fastest itinerary found — shortest total transit time.');
  } else if (timeDiffVsFastest >= 15) {
    disadvantages.push(`Adds ${formatDuration(timeDiffVsFastest)} of additional transit time compared to fastest option.`);
  }

  // Stops advantages & trade-offs
  if (candidate.totalStops === 0) {
    advantages.push('Direct non-stop flight: no layovers, minimum travel stress.');
  } else if (candidate.totalStops === 1) {
    advantages.push('Single convenient layover.');
  } else {
    disadvantages.push(`Includes ${candidate.totalStops} layovers, increasing total trip complexity.`);
  }

  // Airport convenience
  const nonPrimary = [candidate.originAirport, ...(candidate.destinationAirports || [])].filter(
    (a) => a && a.isPrimary === false
  );
  if (nonPrimary.length > 0) {
    const names = nonPrimary.map((a) => `${a.city} (${a.iata})`).join(', ');
    advantages.push(`Utilizes regional airport (${names}) which lowers base airfare.`);
    disadvantages.push(`Requires ground transit to secondary airport (${names}).`);
  } else {
    advantages.push('Departs and arrives at primary international airport hubs.');
  }

  // Persona recommendation
  let bestSuitedFor = 'Travelers seeking a balanced trade-off between price and schedule.';
  if (candidate === categories.cheapest || (rank === 0 && preference === 'cheapest') || priceDiffVsCheapest === 0) {
    bestSuitedFor = 'Budget-conscious travelers & solo backpackers prioritizing maximum cash savings.';
  } else if (candidate === categories.fastest || (rank === 0 && preference === 'fastest') || timeDiffVsFastest === 0) {
    bestSuitedFor = 'Business travelers, families with young children, and travelers prioritizing speed and convenience.';
  } else if (candidate === categories.balanced || rank === 0) {
    bestSuitedFor = 'Smart travelers seeking optimal value: comfortable flight times without extreme layovers or excessive cost.';
  }

  const whySelected = explainCandidate(candidate, allCandidates, preference);

  let comparisonWithAlternative = 'Top balanced choice for your itinerary.';
  const topAlternative = allCandidates.find((c) => c !== candidate) || allCandidates[0];
  if (topAlternative && topAlternative !== candidate) {
    comparisonWithAlternative = buildComparisonReason(candidate, topAlternative);
  }

  return {
    whySelected,
    advantages: advantages.slice(0, 4),
    disadvantages: disadvantages.slice(0, 4),
    bestSuitedFor,
    comparisonWithAlternative,
    metrics: {
      priceInr: candidate.totalPriceInr,
      durationMinutes: candidate.totalDurationMinutes,
      stops: candidate.totalStops,
      priceDiffVsCheapestInr: priceDiffVsCheapest,
      timeDiffVsFastestMinutes: timeDiffVsFastest,
      isDirect: candidate.totalStops === 0,
    },
  };
}

/**
 * Builds a side-by-side trade-off matrix across the primary recommendation categories.
 */
function buildTradeoffMatrix(categories = {}, recommendations = []) {
  const options = [];

  const cheapest = categories.cheapest || recommendations[0];
  const fastest = categories.fastest || recommendations[0];
  const balanced = categories.balanced || recommendations[0];

  if (cheapest) {
    options.push({
      category: 'cheapest',
      title: 'Cheapest Option',
      badge: 'Maximum Savings',
      priceInr: cheapest.totalPriceInr,
      durationMinutes: cheapest.totalDurationMinutes,
      stops: cheapest.totalStops,
      whySelected: 'Optimized for lowest out-of-pocket airfare.',
      bestSuitedFor: 'Budget-first travelers and students.',
      primaryAirport: (cheapest.originAirport?.isPrimary ?? true) && (cheapest.destinationAirports?.every(a => a.isPrimary ?? true) ?? true),
      tradeoffHighlight: fastest && cheapest !== fastest
        ? `Saves ${formatInr(fastest.totalPriceInr - cheapest.totalPriceInr)} vs fastest, but adds ${formatDuration(cheapest.totalDurationMinutes - fastest.totalDurationMinutes)}.`
        : 'Lowest fare available.',
    });
  }

  if (fastest && fastest !== cheapest) {
    options.push({
      category: 'fastest',
      title: 'Fastest Route',
      badge: 'Shortest Travel Time',
      priceInr: fastest.totalPriceInr,
      durationMinutes: fastest.totalDurationMinutes,
      stops: fastest.totalStops,
      whySelected: 'Optimized to minimize transit time and layover delays.',
      bestSuitedFor: 'Time-sensitive travelers, business, and families.',
      primaryAirport: (fastest.originAirport?.isPrimary ?? true) && (fastest.destinationAirports?.every(a => a.isPrimary ?? true) ?? true),
      tradeoffHighlight: cheapest
        ? `Saves ${formatDuration(cheapest.totalDurationMinutes - fastest.totalDurationMinutes)} vs cheapest, for ${formatInr(fastest.totalPriceInr - cheapest.totalPriceInr)} more.`
        : 'Quickest itinerary.',
    });
  }

  if (balanced && balanced !== cheapest && balanced !== fastest) {
    options.push({
      category: 'balanced',
      title: 'Best Balanced Option',
      badge: 'Recommended Trade-off',
      priceInr: balanced.totalPriceInr,
      durationMinutes: balanced.totalDurationMinutes,
      stops: balanced.totalStops,
      whySelected: 'Curated sweet-spot between competitive price and sensible flight time.',
      bestSuitedFor: 'Most travelers looking for stress-free travel without overpaying.',
      primaryAirport: (balanced.originAirport?.isPrimary ?? true) && (balanced.destinationAirports?.every(a => a.isPrimary ?? true) ?? true),
      tradeoffHighlight: 'The recommended middle ground with optimal score.',
    });
  }

  return {
    options,
    summary:
      cheapest && fastest && cheapest !== fastest
        ? `Fastest option costs ${formatInr(fastest.totalPriceInr - cheapest.totalPriceInr)} more to save ${formatDuration(cheapest.totalDurationMinutes - fastest.totalDurationMinutes)} of transit time.`
        : 'All route options evaluated.',
  };
}

module.exports = {
  explainCandidate,
  explainCategoryPicks,
  buildDecisionIntelligence,
  buildTradeoffMatrix,
  formatInr,
  formatDuration,
};
