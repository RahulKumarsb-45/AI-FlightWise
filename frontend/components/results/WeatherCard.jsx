'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Cloud, Droplets, Info } from 'lucide-react';
import { weatherService } from '@/services/weatherService';
import { formatIndianDate } from '@/utils/format';

function WeatherCard({ iataCode, city }) {
  const { data: current, isLoading: currentLoading, isError: currentError } = useQuery({
    queryKey: ['weather-current', iataCode],
    queryFn: () => weatherService.getCurrent(iataCode),
    staleTime: 25 * 60 * 1000,
    retry: false,
  });

  const { data: forecast } = useQuery({
    queryKey: ['weather-forecast', iataCode],
    queryFn: () => weatherService.getForecast(iataCode),
    staleTime: 25 * 60 * 1000,
    retry: false,
    enabled: !currentError,
  });

  const { data: season } = useQuery({
    queryKey: ['weather-season', iataCode],
    queryFn: () => weatherService.getSeason(iataCode),
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  if (currentLoading) {
    return <div className="h-32 animate-pulse rounded-xl border border-ink-100 bg-ink-50" />;
  }

  if (currentError) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-ink-200 px-4 py-3 text-sm text-ink-400">
        <Cloud className="h-4 w-4" aria-hidden="true" /> Weather unavailable for {city} right now.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Weather in {city}</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-950">{current.tempC}°C</p>
          <p className="text-sm font-medium capitalize text-ink-600">{current.description}</p>
        </div>
        {current.icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-electric-50 border border-cyan-100/80">
            <Image
              src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
              alt={current.description}
              width={56}
              height={56}
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4 text-xs font-medium text-ink-500">
        <span className="flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-cyan-500" aria-hidden="true" /> {current.humidity}% humidity
        </span>
        <span>Feels like {current.feelsLikeC}°C</span>
      </div>

      {forecast?.days?.length > 0 && (
        <div className="mt-5 grid grid-cols-5 gap-2 border-t border-ink-100 pt-4">
          {forecast.days.map((day) => (
            <div key={day.date} className="rounded-xl bg-ink-50/70 border border-ink-100/60 p-2 text-center">
              <p className="text-[11px] font-semibold text-ink-500">{formatIndianDate(day.date).split(' ').slice(0, 2).join(' ')}</p>
              {day.icon && (
                <Image
                  src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                  alt={day.description}
                  width={32}
                  height={32}
                  className="mx-auto my-0.5"
                  unoptimized
                />
              )}
              <p className="text-xs font-bold text-navy-950">{day.tempC}°</p>
            </div>
          ))}
        </div>
      )}

      {season && (
        <div className="mt-4 flex gap-2 rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 text-xs text-amber-900 leading-relaxed">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
          <div>
            <p className="font-medium">{season.guidance}</p>
            {season.isGeneralGuidance && (
              <span className="mt-1 block text-[11px] text-amber-800/80">General seasonal guidance, not this city&apos;s exact climate data.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { WeatherCard };
