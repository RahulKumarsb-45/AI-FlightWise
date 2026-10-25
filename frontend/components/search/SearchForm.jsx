'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftRight, Wallet, Users, Sparkles } from 'lucide-react';
import { AirportAutocomplete } from './AirportAutocomplete';
import { CountryMultiSelect, MAX_COUNTRIES } from './CountryMultiSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { trackFlightSearch } from '@/lib/analytics';

const todayStr = () => new Date().toISOString().split('T')[0];

const schema = z
  .object({
    originAirport: z.object({ iata: z.string() }, { required_error: 'Pick a departure airport' }),
    destinationCountries: z.array(z.string()).min(1, 'Pick at least one country').max(MAX_COUNTRIES),
    departureDate: z.string().min(1, 'Pick a departure date'),
    returnDate: z.string().optional().or(z.literal('')),
    dateFlexible: z.boolean(),
    travelers: z.coerce.number().int().min(1).max(9),
    budgetInr: z.coerce.number().min(1000, 'Budget must be at least ₹1,000').optional().or(z.literal('')),
    preference: z.enum(['cheapest', 'fastest', 'balanced']),
    nearbyAirportsEnabled: z.boolean(),
  })
  .refine((d) => !d.returnDate || d.returnDate >= d.departureDate, {
    message: 'Return date must be after departure',
    path: ['returnDate'],
  });

const PREFERENCES = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'fastest', label: 'Fastest' },
  { value: 'balanced', label: 'Balanced' },
];

function SearchForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      destinationCountries: [],
      departureDate: todayStr(),
      returnDate: '',
      dateFlexible: false,
      travelers: 1,
      budgetInr: '',
      preference: 'balanced',
      nearbyAirportsEnabled: true,
    },
  });

  const dateFlexible = watch('dateFlexible');

  function onSubmit(values) {
    setSubmitting(true);
    const params = new URLSearchParams({
      origin: values.originAirport.iata,
      destinations: values.destinationCountries.join(','),
      departureDate: values.departureDate,
      dateFlexible: String(values.dateFlexible),
      travelers: String(values.travelers),
      preference: values.preference,
      nearbyAirportsEnabled: String(values.nearbyAirportsEnabled),
    });
    if (values.returnDate) params.set('returnDate', values.returnDate);
    if (values.budgetInr) params.set('budgetInr', String(values.budgetInr));

    trackFlightSearch({
      origin: values.originAirport.iata,
      destinations: values.destinationCountries,
      tripType: values.returnDate ? 'round_trip' : 'one_way',
      travelers: values.travelers,
      preference: values.preference,
      dateFlexible: values.dateFlexible,
      nearbyAirportsEnabled: values.nearbyAirportsEnabled,
    });

    router.push(`/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-ink-100/90 bg-white p-6 shadow-premium sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="originAirport"
          control={control}
          render={({ field }) => (
            <AirportAutocomplete
              label="Flying from"
              value={field.value}
              onChange={field.onChange}
              error={errors.originAirport?.message}
            />
          )}
        />

        <Controller
          name="destinationCountries"
          control={control}
          render={({ field }) => (
            <CountryMultiSelect
              value={field.value}
              onChange={field.onChange}
              error={errors.destinationCountries?.message}
            />
          )}
        />

        <Input
          label="Departure date"
          type="date"
          min={todayStr()}
          error={errors.departureDate?.message}
          {...register('departureDate')}
        />

        <Input
          label="Return date"
          type="date"
          helperText="Leave blank for one-way"
          error={errors.returnDate?.message}
          {...register('returnDate')}
        />

        <Input
          type="number"
          placeholder="e.g. 80000"
          label={
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" /> Budget (₹, optional)
            </span>
          }
          error={errors.budgetInr?.message}
          {...register('budgetInr')}
        />

        <Input
          type="number"
          min={1}
          max={9}
          label={
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" /> Travelers
            </span>
          }
          error={errors.travelers?.message}
          {...register('travelers')}
        />
      </div>

      <div className="mt-6 pt-5 border-t border-ink-100 space-y-3.5">
        <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 sm:mt-0 h-4 w-4 rounded border-ink-300 text-electric-600 focus:ring-electric-500"
            aria-describedby={dateFlexible ? 'date-flexible-hint' : undefined}
            {...register('dateFlexible')}
          />
          <span className="text-sm font-medium text-ink-800">
            Flexible dates <span className="font-normal text-ink-400">(search ±3 days for lower fares)</span>
          </span>
        </label>
        {dateFlexible && (
          <p id="date-flexible-hint" className="ml-6 text-xs text-electric-600">
            We will analyze departure and return flights across the surrounding 7-day window.
          </p>
        )}

        <label className="flex items-start sm:items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 sm:mt-0 h-4 w-4 rounded border-ink-300 text-electric-600 focus:ring-electric-500"
            {...register('nearbyAirportsEnabled')}
          />
          <span className="text-sm font-medium text-ink-800">
            Include nearby airports <span className="font-normal text-ink-400">(evaluates alternate hubs within ~300km)</span>
          </span>
        </label>
      </div>

      <div className="mt-6">
        <span id="optimize-for-label" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-800">
          <ArrowLeftRight className="h-3.5 w-3.5 text-electric-600" aria-hidden="true" /> Optimization Priority
        </span>
        <Controller
          name="preference"
          control={control}
          render={({ field }) => (
            <div role="radiogroup" aria-labelledby="optimize-for-label" className="inline-flex rounded-xl bg-ink-100/70 p-1 border border-ink-200/50">
              {PREFERENCES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === p.value}
                  tabIndex={field.value === p.value ? 0 : -1}
                  onClick={() => field.onChange(p.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    e.preventDefault();
                    const currentIndex = PREFERENCES.findIndex((pref) => pref.value === field.value);
                    const delta = e.key === 'ArrowRight' ? 1 : -1;
                    const nextIndex = (currentIndex + delta + PREFERENCES.length) % PREFERENCES.length;
                    field.onChange(PREFERENCES[nextIndex].value);
                    const siblings = Array.from(e.currentTarget.parentElement?.children || []);
                    siblings[nextIndex]?.focus();
                  }}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150',
                    field.value === p.value
                      ? 'bg-white text-navy-950 shadow-soft'
                      : 'text-ink-500 hover:text-ink-900'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Optimize Flight Journey
        </Button>
        <span className="text-xs text-ink-400">
          Evaluates permutations in real-time
        </span>
      </div>
    </form>
  );
}

export { SearchForm };
