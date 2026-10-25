'use client';

import { useState } from 'react';
import { ChevronDown, MapPin, Plane, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatInr, formatDuration, formatTime, formatIndianDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { trackSelectFlight, trackRecommendationExpanded } from '@/lib/analytics';
import { RecommendationFeedback } from './RecommendationFeedback';

function RouteHeadline({ legs, originAirport, destinationAirports }) {
  const cities = [originAirport.city, ...destinationAirports.map((a) => a.city)];
  // multi-city circuits return to origin; single-destination trips don't repeat it
  const isCircuit = legs.length > destinationAirports.length;
  const path = isCircuit ? [...cities, originAirport.city] : cities;

  return (
    <div className="flex flex-wrap items-center gap-1.5 font-display text-lg text-ink-900">
      {path.map((city, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          {city}
          {idx < path.length - 1 && <span className="text-ink-300">→</span>}
        </span>
      ))}
    </div>
  );
}

function LegDetail({ leg, offer }) {
  if (!offer) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-ink-400">
        <Plane className="h-3.5 w-3.5" aria-hidden="true" /> {leg.fromIata} → {leg.toIata} — no offer found
      </div>
    );
  }

  const segments = offer.outbound || [];

  return (
    <div className="border-t border-ink-100 py-3 first:border-t-0">
      <div className="flex items-center justify-between text-xs text-ink-400">
        <span>{formatIndianDate(leg.date)}</span>
        <span>
          {offer.stops === 0 ? 'Direct' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`} ·{' '}
          {formatDuration(offer.totalDurationMinutes)}
        </span>
      </div>
      <div className="mt-1.5 space-y-1.5">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-700">
              <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-600">
                {seg.airline}{seg.flightNumber?.replace(seg.airline, '')}
              </span>
              {seg.fromIata} {formatTime(seg.departureTime)} → {seg.toIata} {formatTime(seg.arrivalTime)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-sm text-ink-500">{formatInr(offer.priceInr)}</p>
    </div>
  );
}

function RecommendationCard({ recommendation, rank, highlight, experimentVariant = 'control' }) {
  const [expanded, setExpanded] = useState(false);
  const isVariant = experimentVariant === 'variant';
  const {
    legs,
    legOffers,
    originAirport,
    destinationAirports,
    totalPriceInr,
    totalDurationMinutes,
    totalStops,
    explanation,
    decisionIntelligence,
  } = recommendation;

  const usesNearbyAirport = !originAirport.isPrimary || destinationAirports.some((a) => !a.isPrimary);

  function handleToggleExpanded() {
    setExpanded((e) => {
      const next = !e;
      if (next) {
        trackSelectFlight({
          rank,
          isTopPick: rank === 1,
          usesNearbyAirport,
          experimentId: 'flight_recommendation_tradeoffs',
          variant: experimentVariant,
        });
        trackRecommendationExpanded({ rank, isTopPick: rank === 1, usesNearbyAirport });
      }
      return next;
    });
  }

  const advantages = decisionIntelligence?.advantages || [];
  const disadvantages = decisionIntelligence?.disadvantages || [];
  const bestSuitedFor = decisionIntelligence?.bestSuitedFor || null;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-soft transition-all duration-200 hover:shadow-premium sm:p-6',
        highlight ? 'border-electric-400 ring-2 ring-electric-400/25' : 'border-ink-100/90'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {rank === 1 && <Badge variant="electric">Top pick</Badge>}
            {usesNearbyAirport && (
              <Badge variant="cyan">
                <MapPin className="h-3 w-3" aria-hidden="true" /> Nearby airport
              </Badge>
            )}
          </div>
          <div className="mt-2.5">
            <RouteHeadline legs={legs} originAirport={originAirport} destinationAirports={destinationAirports} />
          </div>
          <p className="mt-1 text-sm text-ink-400">
            {totalStops === 0 ? 'Direct' : `${totalStops} stop${totalStops > 1 ? 's' : ''}`} ·{' '}
            {formatDuration(totalDurationMinutes)} total
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-3xl font-bold text-navy-950">{formatInr(totalPriceInr)}</p>
          <p className="text-xs text-ink-400 mt-0.5">all travelers included</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-ink-50/80 border border-ink-100/70 px-4 py-3 text-sm leading-relaxed text-ink-700">{explanation}</p>

      {/* Experiment Variant: Explicit AI Trade-off Analysis */}
      {isVariant && (
        <div className="mt-3.5 rounded-xl border border-electric-300 bg-gradient-to-r from-electric-50/90 to-indigo-50/70 p-4 shadow-sm" data-testid="experiment-variant-tradeoff">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-electric-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI Trade-Off Analysis (Experiment Variant)
            </span>
            <span className="text-xs font-mono font-medium text-electric-800">
              {totalStops === 0 ? 'Direct Route Advantage' : `${totalStops} Stop Route Efficiency`}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-lg bg-white/80 p-2.5 border border-electric-200/60">
              <span className="block font-medium text-ink-500 text-[11px] uppercase tracking-wider">Price Efficiency</span>
              <span className="mt-0.5 block font-bold text-navy-950 font-mono text-sm">{formatInr(totalPriceInr)}</span>
              <span className="text-[11px] text-ink-600">Calculated value for all travelers</span>
            </div>
            <div className="rounded-lg bg-white/80 p-2.5 border border-electric-200/60">
              <span className="block font-medium text-ink-500 text-[11px] uppercase tracking-wider">Travel Time</span>
              <span className="mt-0.5 block font-bold text-navy-950 text-sm">{formatDuration(totalDurationMinutes)}</span>
              <span className="text-[11px] text-ink-600">Door-to-door transit time</span>
            </div>
            <div className="rounded-lg bg-white/80 p-2.5 border border-electric-200/60">
              <span className="block font-medium text-ink-500 text-[11px] uppercase tracking-wider">Stop Trade-Off</span>
              <span className="mt-0.5 block font-bold text-navy-950 text-sm">
                {totalStops === 0 ? '0 Transfers' : `${totalStops} Layover${totalStops > 1 ? 's' : ''}`}
              </span>
              <span className="text-[11px] text-ink-600">
                {totalStops === 0 ? 'Maximum comfort & speed' : 'Optimized balance of cost & rest'}
              </span>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-electric-950 leading-relaxed font-medium">
            💡 <strong>Trade-off Breakdown:</strong> Compared across all potential flight combinations, this itinerary balances total journey duration against ticket price to minimize layover penalties.
          </p>
        </div>
      )}

      {/* Decision Intelligence Advantages & Trade-offs */}
      {(advantages.length > 0 || disadvantages.length > 0) && (
        <div className="mt-3.5 grid gap-3 sm:grid-cols-2 text-xs">
          {advantages.length > 0 && (
            <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200/80">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                Key Advantages:
              </span>
              <ul className="space-y-1 text-emerald-800">
                {advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {disadvantages.length > 0 && (
            <div className="rounded-xl bg-amber-50/80 p-3.5 border border-amber-200/80">
              <span className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
                Trade-offs to Consider:
              </span>
              <ul className="space-y-1 text-amber-800">
                {disadvantages.map((dis, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {bestSuitedFor && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-600">
          <Sparkles className="h-3.5 w-3.5 text-electric-600 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-navy-900 font-semibold">Best suited for: </strong>
            {bestSuitedFor}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggleExpanded}
        className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-electric-600 hover:text-electric-700 transition-colors"
      >
        {expanded ? 'Hide' : 'Show'} flight details
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="mt-2">
          {legs.map((leg, idx) => (
            <LegDetail key={idx} leg={leg} offer={legOffers?.[idx]?.[0]} />
          ))}
        </div>
      )}

      {/* User Recommendation Feedback */}
      <RecommendationFeedback rank={rank} recommendation={recommendation} />
    </div>
  );
}

export { RecommendationCard };

