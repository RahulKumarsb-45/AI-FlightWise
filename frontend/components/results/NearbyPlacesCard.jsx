'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  ExternalLink,
  Hotel,
  UtensilsCrossed,
  ImageOff,
} from 'lucide-react';
import { placesService } from '@/services/placesService';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  trackHotelSearch,
  trackSelectHotel,
  trackRestaurantSearch,
  trackSelectRestaurant,
} from '@/lib/analytics';

const PRICE_LEVEL_LABELS = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '₹',
  PRICE_LEVEL_MODERATE: '₹₹',
  PRICE_LEVEL_EXPENSIVE: '₹₹₹',
  PRICE_LEVEL_VERY_EXPENSIVE: '₹₹₹₹',
};

function photoUrl(photoName) {
  return photoName || null;
}

function PlaceThumbnail({ photoName, name }) {
  const [failed, setFailed] = useState(false);

  if (!photoName || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-400 border border-ink-200/60">
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    // Local static images are served directly from the frontend public directory.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photoName)}
      alt={name || 'Place'}
      loading="lazy"
      decoding="async"
      className="h-14 w-14 shrink-0 rounded-xl object-cover border border-ink-100"
      onError={() => setFailed(true)}
    />
  );
}

function PlaceRow({ place, type, iataCode }) {
  function handleSelect() {
    const payload = {
      iataCode,
      hasRating: Boolean(place.rating),
    };

    if (type === 'hotels') {
      trackSelectHotel(payload);
    } else {
      trackSelectRestaurant(payload);
    }
  }

  return (
    <a
      href={place.mapsUri || '#'}
      target="_blank"
      rel="noreferrer"
      onClick={handleSelect}
      className="flex items-center gap-3.5 rounded-xl border border-ink-100/80 px-4 py-3 text-sm transition-all duration-150 hover:border-electric-200 hover:bg-electric-50/40 hover:shadow-soft"
    >
      <PlaceThumbnail
        photoName={place.photoName}
        name={place.name}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy-950">
          {place.name}
        </p>

        <p className="truncate text-xs text-ink-400 mt-0.5">
          {place.address}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-ink-600">
        {place.rating && (
          <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200/60">
            <Star
              className="h-3 w-3 fill-amber-500 text-amber-500"
              aria-hidden="true"
            />
            {place.rating}
          </span>
        )}

        {place.priceLevel && (
          <span className="font-mono text-ink-500">
            {PRICE_LEVEL_LABELS[place.priceLevel] || ''}
          </span>
        )}

        <ExternalLink
          className="h-3.5 w-3.5 text-ink-400"
          aria-hidden="true"
        />
      </div>
    </a>
  );
}

function PlacesList({ iataCode, type }) {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['places', type, iataCode],

    queryFn: () =>
      type === 'hotels'
        ? placesService.getHotels(iataCode)
        : placesService.getRestaurants(iataCode),

    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!data?.[type]) return;

    const resultCount = data[type].length;

    if (type === 'hotels') {
      trackHotelSearch({
        iataCode,
        resultCount,
      });
    } else {
      trackRestaurantSearch({
        iataCode,
        resultCount,
      });
    }
  }, [data, type, iataCode]);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-ink-50"
          />
        ))}
      </div>
    );
  }

  if (isError || !data?.[type]?.length) {
    return (
      <p className="py-8 text-center text-sm text-ink-400">
        Nothing found nearby right now.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {data[type].map((place) => (
        <PlaceRow
          key={place.id}
          place={place}
          type={type}
          iataCode={iataCode}
        />
      ))}
    </div>
  );
}

function NearbyPlacesCard({ iataCode, city }) {
  const [tab, setTab] = useState('hotels');

  return (
    <div className="rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium">
      <div className="flex items-center justify-between border-b border-ink-100 pb-3.5">
        <h3 className="font-display text-base font-bold text-navy-950 sm:text-lg">
          Near {city}
        </h3>

        <Tabs
          value={tab}
          onValueChange={setTab}
        >
          <TabsList className="rounded-lg bg-ink-100/70 p-1 border border-ink-200/50">
            <TabsTrigger value="hotels" className="rounded-md px-3 py-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-electric-700 data-[state=active]:shadow-soft">
              <Hotel
                className="mr-1 inline h-3.5 w-3.5"
                aria-hidden="true"
              />
              Hotels
            </TabsTrigger>

            <TabsTrigger value="restaurants" className="rounded-md px-3 py-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-electric-700 data-[state=active]:shadow-soft">
              <UtensilsCrossed
                className="mr-1 inline h-3.5 w-3.5"
                aria-hidden="true"
              />
              Food
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4">
        <PlacesList
          iataCode={iataCode}
          type={tab}
        />
      </div>
    </div>
  );
}

export { NearbyPlacesCard };