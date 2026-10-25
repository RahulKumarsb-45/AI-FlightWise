'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  ExternalLink,
  Landmark,
  ImageOff,
} from 'lucide-react';

import { placesService } from '@/services/placesService';
import {
  trackAttractionSearch,
  trackSelectAttraction,
} from '@/lib/analytics';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

/**
 * Build the correct image URL.
 *
 * Local images:
 *   /images/things-to-do/thing-1-1.jpg
 *
 * These are served directly by Next.js from:
 *   frontend/public/images/
 *
 * Older/external photo names are still supported through
 * the backend photo proxy.
 */
function photoUrl(photoName) {
  if (!photoName) {
    return null;
  }

  // ==========================================================
  // LOCAL STATIC IMAGE
  // ==========================================================

  if (
    photoName.startsWith('/images/') ||
    photoName.startsWith('http://') ||
    photoName.startsWith('https://')
  ) {
    return photoName;
  }

  // ==========================================================
  // BACKWARD COMPATIBILITY
  // ==========================================================

  return (
    `${API_BASE_URL}/places/photo` +
    `?name=${encodeURIComponent(photoName)}` +
    `&maxWidth=300`
  );
}

function AttractionThumbnail({
  photoName,
  name,
}) {
  const [failed, setFailed] = useState(false);

  const imageSrc = photoUrl(photoName);

  if (!imageSrc || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-400 border border-ink-200/60">
        <ImageOff
          className="h-5 w-5"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={name || 'Attraction'}
      loading="lazy"
      decoding="async"
      className="h-16 w-16 shrink-0 rounded-xl object-cover border border-ink-100"
      onError={() => setFailed(true)}
    />
  );
}

function AttractionRow({
  place,
  iataCode,
}) {
  function handleSelect() {
    trackSelectAttraction({
      iataCode,
      hasRating: Boolean(place.rating),
    });
  }

  return (
    <a
      href={place.mapsUri || '#'}
      target="_blank"
      rel="noreferrer"
      onClick={handleSelect}
      className="flex items-start gap-3.5 rounded-xl border border-ink-100/80 px-4 py-3.5 text-sm transition-all duration-150 hover:border-electric-200 hover:bg-electric-50/40 hover:shadow-soft"
    >
      <AttractionThumbnail
        photoName={place.photoName}
        name={place.name}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy-950">
          {place.name}
        </p>

        {place.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-500 leading-relaxed">
            {place.description}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
          {place.category && (
            <span className="rounded bg-ink-100/80 px-1.5 py-0.5 font-medium text-ink-600">
              {place.category}
            </span>
          )}

          {place.address && (
            <span className="truncate">
              {place.address}
            </span>
          )}
        </div>
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

        <ExternalLink
          className="h-3.5 w-3.5 text-ink-400"
          aria-hidden="true"
        />
      </div>
    </a>
  );
}

function TouristAttractionsCard({
  iataCode,
  city,
}) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'places',
      'attractions',
      iataCode,
    ],

    queryFn: () =>
      placesService.getAttractions(
        iataCode
      ),

    staleTime:
      60 * 60 * 1000,

    retry: false,

    enabled:
      Boolean(iataCode),
  });

  useEffect(() => {
    if (!data?.attractions) {
      return;
    }

    trackAttractionSearch({
      iataCode,
      resultCount:
        data.attractions.length,
    });
  }, [data, iataCode]);

  return (
    <div className="rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium">
      <div className="flex items-center gap-2.5 border-b border-ink-100 pb-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-electric-100 text-electric-700">
          <Landmark
            className="h-4 w-4"
            aria-hidden="true"
          />
        </span>

        <h3 className="font-display text-base font-bold text-navy-950 sm:text-lg">
          Things to do in {city}
        </h3>
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-ink-50"
              />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-8 text-center text-sm text-ink-400">
            {error?.message ||
              "Couldn't load tourist attractions right now."}
          </p>
        )}

        {!isLoading &&
          !isError &&
          !data?.attractions?.length && (
            <p className="py-8 text-center text-sm text-ink-400">
              No tourist attractions found for {city} yet.
            </p>
          )}

        {!isLoading &&
          !isError &&
          data?.attractions?.length > 0 && (
            <div className="space-y-2.5">
              {data.attractions.map(
                (place, index) => (
                  <AttractionRow
                    key={
                      place.id ||
                      `${place.name}-${index}`
                    }
                    place={place}
                    iataCode={iataCode}
                  />
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export { TouristAttractionsCard };