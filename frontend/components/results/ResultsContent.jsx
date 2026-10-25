'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueries } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Heart, HeartOff } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { placesService } from '@/services/placesService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { OptimizerLoadingState } from './OptimizerLoadingState';
import { CategorySummary } from './CategorySummary';
import { BudgetInsightCard } from './BudgetInsightCard';
import { ExpenseCalculatorCard } from './ExpenseCalculatorCard';
import { RecommendationCard } from './RecommendationCard';
import { WeatherCard } from './WeatherCard';
import { NearbyPlacesCard } from './NearbyPlacesCard';
import { TouristAttractionsCard } from './TouristAttractionsCard';
import { TripTimelineCard } from './TripTimelineCard';
import { PdfExportButton } from './PdfExportButton';
import { ShareTripButton } from '@/components/trips/ShareTripButton';
import { TradeoffMatrixCard } from './TradeoffMatrixCard';
import { Button } from '@/components/ui/Button';
import { formatIndianDate } from '@/utils/format';
import { estimateAttractionsCostInr } from '@/utils/attractionsEstimate';
import { computeExpenseBreakdown } from '@/utils/expenseCalculator';
import { trackResultsViewed, trackItinerarySaved, getOrCreateSessionId } from '@/lib/analytics';
import { productService } from '@/services/productService';

function parseSearchParamsToRequest(searchParams) {
  const origin = searchParams.get('origin');
  const destinationsRaw = searchParams.get('destinations');
  const departureDate = searchParams.get('departureDate');

  if (!origin || !destinationsRaw || !departureDate) return null;

  const body = {
    originIata: origin,
    destinationCountries: destinationsRaw.split(',').filter(Boolean),
    departureDate,
    dateFlexible: searchParams.get('dateFlexible') === 'true',
    travelers: Number(searchParams.get('travelers') || 1),
    preference: searchParams.get('preference') || 'balanced',
    nearbyAirportsEnabled: searchParams.get('nearbyAirportsEnabled') !== 'false',
  };

  const returnDate = searchParams.get('returnDate');
  if (returnDate) body.returnDate = returnDate;

  const budgetInr = searchParams.get('budgetInr');
  if (budgetInr) body.budgetInr = Number(budgetInr);

  return body;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestBody = parseSearchParamsToRequest(searchParams);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['optimize', requestBody],
    queryFn: () => tripService.optimize(requestBody),
    enabled: !!requestBody,
    retry: false,
  });

  const topRecommendation = data?.recommendations?.[0];
  const topDestinationIata = topRecommendation?.destinationAirports?.[0]?.iata;

  const tripNights = topRecommendation?.budgetInsight?.nights ?? topRecommendation?.livingCostEstimate?.nights ?? null;

  const { data: attractionsData, isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['places', 'attractions', topDestinationIata],
    queryFn: () => placesService.getAttractions(topDestinationIata),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: Boolean(topDestinationIata) && Boolean(tripNights),
  });

  const attractionsEstimate = tripNights
    ? estimateAttractionsCostInr(attractionsData?.attractions, tripNights)
    : null;

  const { data: hotelsData } = useQuery({
    queryKey: ['places', 'hotels', topDestinationIata],
    queryFn: () => placesService.getHotels(topDestinationIata),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: Boolean(topDestinationIata),
  });

  const { data: restaurantsData } = useQuery({
    queryKey: ['places', 'restaurants', topDestinationIata],
    queryFn: () => placesService.getRestaurants(topDestinationIata),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: Boolean(topDestinationIata),
  });

  const destinationAirports = topRecommendation?.destinationAirports || [];
  const uniqueDestinations = useMemo(() => {
    const seen = new Set();
    return destinationAirports.filter((dest) => {
      if (!dest?.iata || seen.has(dest.iata)) return false;
      seen.add(dest.iata);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topRecommendation]);

  const hotelsQueries = useQueries({
    queries: uniqueDestinations.map((dest) => ({
      queryKey: ['places', 'hotels', dest.iata],
      queryFn: () => placesService.getHotels(dest.iata),
      staleTime: 60 * 60 * 1000,
      retry: false,
      enabled: Boolean(dest.iata),
    })),
  });
  const attractionsQueries = useQueries({
    queries: uniqueDestinations.map((dest) => ({
      queryKey: ['places', 'attractions', dest.iata],
      queryFn: () => placesService.getAttractions(dest.iata),
      staleTime: 60 * 60 * 1000,
      retry: false,
      enabled: Boolean(dest.iata),
    })),
  });
  const restaurantsQueries = useQueries({
    queries: uniqueDestinations.map((dest) => ({
      queryKey: ['places', 'restaurants', dest.iata],
      queryFn: () => placesService.getRestaurants(dest.iata),
      staleTime: 60 * 60 * 1000,
      retry: false,
      enabled: Boolean(dest.iata),
    })),
  });

  const placesByDestination = useMemo(() => {
    const map = {};
    uniqueDestinations.forEach((dest, i) => {
      map[dest.iata] = {
        hotels: hotelsQueries[i]?.data?.hotels,
        attractions: attractionsQueries[i]?.data?.attractions,
        restaurants: restaurantsQueries[i]?.data?.restaurants,
      };
    });
    return map;
  }, [uniqueDestinations, hotelsQueries, attractionsQueries, restaurantsQueries]);

  const expenseBreakdown = topRecommendation
    ? computeExpenseBreakdown({
        flightCostInr: topRecommendation.totalPriceInr,
        budgetInsight: topRecommendation.budgetInsight,
        livingCostEstimate: topRecommendation.livingCostEstimate,
        attractionsEstimate,
        travelers: requestBody.travelers,
      })
    : null;

  async function handleSaveToggle() {
    if (!data?.tripId) return;
    setSaving(true);
    try {
      if (saved) {
        await tripService.unsaveTrip(data.tripId);
        setSaved(false);
        trackItinerarySaved({ tripId: data.tripId, action: 'unsave' });
        toast({ variant: 'info', title: 'Removed from saved trips' });
      } else {
        await tripService.saveTrip(data.tripId);
        setSaved(true);
        trackItinerarySaved({ tripId: data.tripId, action: 'save' });
        toast({ variant: 'success', title: 'Trip saved', description: 'Find it anytime in your dashboard.' });
      }
    } catch (err) {
      toast({ variant: 'error', title: 'Could not update saved trips', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!requestBody) {
    return (
      <EmptyState
        title="Missing search details"
        description="We couldn't find enough information to run a search."
        onBack={() => router.push('/search')}
      />
    );
  }

  if (isLoading) return <OptimizerLoadingState />;

  if (isError) {
    return (
      <EmptyState
        title="Search didn't go through"
        description={error?.message || 'Something went wrong while optimizing your trip.'}
        onBack={() => router.push('/search')}
      />
    );
  }

  const { recommendations = [], categories = {}, meta = {} } = data || {};

  if (recommendations.length === 0) {
    const isMultiCountry = (requestBody.destinationCountries?.length || 0) > 1;
    const countriesWithNoAirports = meta.countriesWithNoAirports || [];
    const noOffersFetchedAtAll =
      (meta.permutations?.totalAfterCap ?? 0) > 0 && (meta.pruning?.totalBeforePruning ?? 0) === 0;
    const budgetWasTheReason = requestBody.budgetInr && (meta.pruning?.reasons?.overBudget ?? 0) > 0;

    const empty =
      countriesWithNoAirports.length > 0
        ? {
            title: "We're missing airport data for one of your countries",
            description: `We don't have any usable airports for ${countriesWithNoAirports.join(
              ', '
            )} yet, so a complete route couldn't be built. Try removing that country or picking a different one.`,
          }
        : noOffersFetchedAtAll
        ? {
            title: "We couldn't find any flights for this search",
            description:
              "Our flight search didn't return any offers for this route/date — this isn't a budget problem. Try again in a bit, or try a different route or date.",
          }
        : budgetWasTheReason
        ? {
            title: 'No trips matched your budget',
            description:
              meta.budgetSuggestion?.message ||
              'Try raising your budget, adding flexible dates, or allowing nearby airports.',
          }
        : isMultiCountry
        ? {
            title: 'No complete multi-country itinerary was found',
            description:
              'No complete multi-country itinerary was found for the selected countries and dates. Try different dates, countries, or enable nearby airports.',
          }
        : {
            title: 'No trips found',
            description: 'Try flexible dates or allowing nearby airports.',
          };

    return <EmptyState title={empty.title} description={empty.description} onBack={() => router.push('/search')} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm text-ink-900">
            {requestBody.originIata} → {requestBody.destinationCountries.join(', ')}
          </h1>
          <p className="mt-1 text-sm text-ink-500 flex flex-wrap items-center gap-1.5">
            <span>
              {formatIndianDate(requestBody.departureDate)}
              {requestBody.returnDate && ` – ${formatIndianDate(requestBody.returnDate)}`} · {requestBody.travelers}{' '}
              traveler{requestBody.travelers > 1 ? 's' : ''}
            </span>
            <span className="text-ink-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-600 bg-paper-100 px-2.5 py-0.5 rounded-full border border-ink-200">
              Source: {meta?.flightProvider === 'ignav' ? 'Live IGNAV GDS Inventory' : 'Calibrated market pricing model'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {topRecommendation && (
            <PdfExportButton
              recommendation={topRecommendation}
              hotels={hotelsData?.hotels}
              attractions={attractionsData?.attractions}
              restaurants={restaurantsData?.restaurants}
              destinationCity={recommendations[0]?.destinationAirports?.[0]?.city}
              placesByDestination={placesByDestination}
              expenseBreakdown={expenseBreakdown}
              filename={`trip-${requestBody.originIata}-${requestBody.destinationCountries.join('-')}-${requestBody.departureDate}.pdf`}
            />
          )}
          {isAuthenticated && data?.tripId && (
            <Button variant="outline" loading={saving} onClick={handleSaveToggle}>
              {saved ? <HeartOff className="h-4 w-4" aria-hidden="true" /> : <Heart className="h-4 w-4" aria-hidden="true" />}
              {saved ? 'Unsave' : 'Save trip'}
            </Button>
          )}
          {isAuthenticated && data?.tripId && <ShareTripButton tripId={data.tripId} />}
          {!isAuthenticated && (
            <p className="text-sm text-ink-500">
              <button onClick={() => router.push('/login')} className="text-electric-600 font-semibold hover:underline">
                Login
              </button>{' '}
              to save this trip
            </p>
          )}
        </div>
      </div>

      <CategorySummary categories={categories} />

      <TradeoffMatrixCard
        matrix={data?.tradeoffMatrix}
        categories={categories}
        recommendations={recommendations}
      />

      {recommendations[0]?.budgetInsight && (
        <BudgetInsightCard
          insight={recommendations[0].budgetInsight}
          suggestion={meta.budgetSuggestion}
          attractionsEstimate={attractionsEstimate}
          isLoadingAttractions={isLoadingAttractions}
        />
      )}

      {expenseBreakdown && (
        <ExpenseCalculatorCard breakdown={expenseBreakdown} isLoadingAttractions={isLoadingAttractions} />
      )}

      {recommendations[0]?.destinationAirports?.[0] && (
        <div className="grid gap-4 sm:grid-cols-2">
          <WeatherCard
            iataCode={recommendations[0].destinationAirports[0].iata}
            city={recommendations[0].destinationAirports[0].city}
          />
          <NearbyPlacesCard
            iataCode={recommendations[0].destinationAirports[0].iata}
            city={recommendations[0].destinationAirports[0].city}
          />
        </div>
      )}

      {uniqueDestinations.slice(1).map((dest) => (
        <NearbyPlacesCard key={dest.iata} iataCode={dest.iata} city={dest.city} />
      ))}

      {uniqueDestinations.map((dest) => (
        <TouristAttractionsCard key={dest.iata} iataCode={dest.iata} city={dest.city} />
      ))}

      {topRecommendation && (
        <TripTimelineCard
          recommendation={topRecommendation}
          hotels={hotelsData?.hotels}
          attractions={attractionsData?.attractions}
          restaurants={restaurantsData?.restaurants}
          destinationCity={recommendations[0]?.destinationAirports?.[0]?.city}
          placesByDestination={placesByDestination}
        />
      )}

      <div>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-ink-400">
          Top {recommendations.length} recommendations
        </h2>
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <RecommendationCard
              key={idx}
              recommendation={rec}
              rank={idx + 1}
              highlight={idx === 0}
            />
          ))}
        </div>
      </div>

      {meta.permutations?.wasCapped && (
        <p className="text-center text-xs text-ink-400">
          Searched a curated subset of routes to keep results fast — {meta.permutations.totalAfterCap} of{' '}
          {meta.permutations.totalGenerated} possible combinations.
        </p>
      )}
    </div>
  );
}

function EmptyState({ title, description, onBack }) {
  return (
    <div className="flex flex-col items-center py-16 px-6 text-center rounded-2xl border border-ink-100/90 bg-white shadow-soft" role="alert">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-soft">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-navy-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-ink-500 leading-relaxed">{description}</p>
      <Button onClick={onBack} variant="outline" className="mt-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to search
      </Button>
    </div>
  );
}

export { ResultsContent };