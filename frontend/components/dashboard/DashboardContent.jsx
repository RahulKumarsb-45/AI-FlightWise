'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plane, Heart, PlusCircle, Loader2, X } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatInr, formatIndianDate } from '@/utils/format';

const STATUS_VARIANT = { draft: 'neutral', optimized: 'electric', booked: 'route' };

function TripRow({ trip, onUnsave }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-ink-100/90 bg-white px-5 py-4 shadow-soft transition-all hover:border-electric-300 hover:shadow-md">
      <Link href={`/trips/${trip.id}`} className="min-w-0 flex-1">
        <p className="font-display text-base font-semibold text-ink-900 group-hover:text-electric-700 transition-colors">
          {trip.origin_iata} → {trip.destination_countries?.join(', ')}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          {formatIndianDate(trip.departure_date)}
          {trip.return_date && ` – ${formatIndianDate(trip.return_date)}`}
        </p>
      </Link>
      <div className="flex items-center gap-3">
        {trip.budget_inr && (
          <span className="font-mono text-xs font-semibold text-ink-600 bg-paper-100 px-2.5 py-1 rounded-md">
            {formatInr(trip.budget_inr)}
          </span>
        )}
        <Badge variant={STATUS_VARIANT[trip.status] || 'neutral'}>{trip.status}</Badge>
        {onUnsave && (
          <button
            onClick={() => onUnsave(trip.id)}
            aria-label="Remove from saved trips"
            className="rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripService.listTrips(),
  });

  const { data: savedTrips = [], isLoading: savedLoading } = useQuery({
    queryKey: ['saved-trips'],
    queryFn: () => tripService.listSaved(),
  });

  async function handleUnsave(tripId) {
    try {
      await tripService.unsaveTrip(tripId);
      queryClient.invalidateQueries({ queryKey: ['saved-trips'] });
      toast({ variant: 'info', title: 'Removed from saved trips' });
    } catch (err) {
      toast({ variant: 'error', title: 'Could not remove trip', description: err.message });
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm text-ink-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-ink-500">Here’s what you’ve been planning with AI FlightWise.</p>
        </div>
        <Link href="/search">
          <Button variant="primary" size="lg" className="shadow-glow-electric">
            <PlusCircle className="h-4 w-4 mr-1.5" aria-hidden="true" /> New search
          </Button>
        </Link>
      </div>

      <section>
        <h2 className="mb-3.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          <Plane className="h-4 w-4 text-electric-600" aria-hidden="true" /> Recent trips
        </h2>
        {tripsLoading && (
          <span role="status" className="inline-flex items-center gap-2 text-sm text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin text-electric-600" aria-hidden="true" />
            <span className="sr-only">Loading recent trips…</span>
          </span>
        )}
        {!tripsLoading && trips.length === 0 && (
          <EmptyRow message="No trips yet — run your first search to see it here." />
        )}
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripRow key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          <Heart className="h-4 w-4 text-electric-600" aria-hidden="true" /> Saved trips
        </h2>
        {savedLoading && (
          <span role="status" className="inline-flex items-center gap-2 text-sm text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin text-electric-600" aria-hidden="true" />
            <span className="sr-only">Loading saved trips…</span>
          </span>
        )}
        {!savedLoading && savedTrips.length === 0 && (
          <EmptyRow message="Nothing saved yet — tap save on a trip you like from the results page." />
        )}
        <div className="space-y-3">
          {savedTrips.map((trip) => (
            <TripRow key={trip.saved_id} trip={trip} onUnsave={handleUnsave} />
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center shadow-soft">
      <Plane className="mx-auto h-6 w-6 text-ink-300" />
      <p className="mt-2 text-sm text-ink-500">{message}</p>
    </div>
  );
}

export { DashboardContent };
