'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FlaskConical,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Users,
  Eye,
  TrendingUp,
  Percent,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExperimentsPage() {
  const queryClient = useQueryClient();
  const [selectedExperimentId, setSelectedExperimentId] = useState('flight_recommendation_tradeoffs');

  // Query experiment list
  const { data: experiments = [], isLoading: listLoading } = useQuery({
    queryKey: ['experiments', 'list'],
    queryFn: () => productService.listExperiments(),
  });

  // Query experiment details and statistical results
  const { data: resultsData, isLoading: resultsLoading, refetch } = useQuery({
    queryKey: ['experiments', 'results', selectedExperimentId],
    queryFn: () => productService.getExperimentResults(selectedExperimentId),
    enabled: Boolean(selectedExperimentId),
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => productService.updateExperimentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const exp = resultsData?.experiment || {};
  const stats = resultsData?.stats || {};
  const comparison = resultsData?.comparison || {};
  const sampleSufficiency = comparison?.sampleSizeSufficiency || {};

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-[#F8FAFC] py-10">
        <div className="container-page max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-ink-100 bg-white p-7 rounded-2xl shadow-soft">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-electric-700 bg-electric-50 px-2.5 py-0.5 rounded-full border border-electric-200/60">
                  PM Workspace
                </span>
                <span className="text-xs text-ink-400">·</span>
                <span className="text-xs text-ink-500 font-medium">A/B Testing & Causal Inference</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                A/B Experimentation Engine
              </h1>
              <p className="mt-1 text-sm text-ink-600 max-w-2xl leading-relaxed">
                Deterministic 50/50 salt hashing, exposure telemetry, and two-proportion z-test significance analysis linked to real search outcomes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={resultsLoading}
                className="gap-1.5"
              >
                <RotateCw className={cn('h-3.5 w-3.5', resultsLoading && 'animate-spin')} />
                Refresh Telemetry
              </Button>
            </div>
          </div>

          {/* Experiment Switcher */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {experiments.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedExperimentId(e.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 shadow-soft',
                  selectedExperimentId === e.id
                    ? 'bg-electric-600 text-white border-electric-600'
                    : 'bg-white text-ink-700 border-ink-100 hover:border-ink-200'
                )}
              >
                <span>{e.name}</span>
                <Badge
                  variant={e.status === 'active' ? 'emerald' : e.status === 'paused' ? 'amber' : 'outline'}
                  className="text-[10px]"
                >
                  {e.status}
                </Badge>
              </button>
            ))}
          </div>

          {/* Active Experiment Detail Card */}
          {resultsData && (
            <div className="mt-6 space-y-6">
              {/* Hypothesis & Status Card */}
              <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-ink-900">{exp.name}</h2>
                      <Badge variant={exp.status === 'active' ? 'emerald' : 'amber'}>
                        {exp.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-500 font-mono">
                      Experiment ID: {exp.id} · Primary Metric: {exp.primary_metric}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {exp.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => statusMutation.mutate({ id: exp.id, status: 'paused' })}
                        className="text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        <Pause className="h-3.5 w-3.5 mr-1" />
                        Pause Experiment
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: exp.id, status: 'active' })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Activate Experiment
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 block mb-1">
                    Formal Product Hypothesis
                  </span>
                  <p className="text-sm font-medium text-ink-900 italic">
                    &ldquo;{exp.hypothesis}&rdquo;
                  </p>
                </div>

                {/* Sample Size Warning if insufficient */}
                {sampleSufficiency.warning && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900">
                      <span className="font-semibold">Sample Size Advisory: </span>
                      {sampleSufficiency.warning}
                    </div>
                  </div>
                )}
              </div>

              {/* Variant Comparison Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Control Variant */}
                <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                        Baseline Experience
                      </span>
                      <h3 className="font-display text-base font-bold text-ink-900 mt-0.5">
                        Control: Standard Flight Cards
                      </h3>
                    </div>
                    <Badge variant="outline">CONTROL</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-ink-400 block">Assigned</span>
                      <span className="font-mono text-lg font-bold text-ink-900">
                        {stats[comparison.controlVariant]?.assigned || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-ink-400 block">Exposed</span>
                      <span className="font-mono text-lg font-bold text-ink-900">
                        {stats[comparison.controlVariant]?.exposed || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-ink-400 block">Converted</span>
                      <span className="font-mono text-lg font-bold text-ink-900">
                        {stats[comparison.controlVariant]?.conversions || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-700">Conversion Rate</span>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold text-ink-900">
                        {comparison.controlRate}%
                      </span>
                      <span className="text-[11px] text-ink-400 block">
                        95% CI: [{stats[comparison.controlVariant]?.ci95Lower}% - {stats[comparison.controlVariant]?.ci95Upper}%]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Variant */}
                <div className="rounded-2xl border border-electric-200 bg-white p-6 shadow-soft space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-electric-600 to-cyan-500" />
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-electric-600">
                        Challenger Experience
                      </span>
                      <h3 className="font-display text-base font-bold text-ink-900 mt-0.5">
                        Variant: AI Explainability Badges
                      </h3>
                    </div>
                    <Badge variant="electric">VARIANT</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-ink-400 block">Assigned</span>
                      <span className="font-mono text-lg font-bold text-ink-900">
                        {stats[comparison.testVariant]?.assigned || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-ink-400 block">Exposed</span>
                      <span className="font-mono text-lg font-bold text-ink-900">
                        {stats[comparison.testVariant]?.exposed || 0}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-ink-400 block">Converted</span>
                      <span className="font-mono text-lg font-bold text-ink-900">
                        {stats[comparison.testVariant]?.conversions || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-electric-50/60 rounded-xl border border-electric-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-electric-900">Conversion Rate</span>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold text-electric-950">
                        {comparison.variantRate}%
                      </span>
                      <span className="text-[11px] text-electric-700 block">
                        95% CI: [{stats[comparison.testVariant]?.ci95Lower}% - {stats[comparison.testVariant]?.ci95Upper}%]
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistical Delta Summary */}
              <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <h3 className="font-display text-base font-bold text-ink-900 mb-4">
                  Statistical Impact Analysis
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="text-xs text-ink-400 uppercase font-semibold">Absolute Lift</span>
                    <div className="mt-1 font-display text-2xl font-bold text-ink-900">
                      {comparison.absoluteDifference > 0 ? `+${comparison.absoluteDifference}%` : `${comparison.absoluteDifference}%`}
                    </div>
                    <span className="text-xs text-ink-500">Difference in percentage points</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="text-xs text-ink-400 uppercase font-semibold">Relative Lift</span>
                    <div className="mt-1 font-display text-2xl font-bold text-ink-900">
                      {comparison.relativeDifference > 0 ? `+${comparison.relativeDifference}%` : `${comparison.relativeDifference}%`}
                    </div>
                    <span className="text-xs text-ink-500">Relative change vs Control baseline</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="text-xs text-ink-400 uppercase font-semibold">Sample Power</span>
                    <div className="mt-1 font-display text-2xl font-bold text-ink-900">
                      {sampleSufficiency.totalSample} / {sampleSufficiency.minRequired}
                    </div>
                    <span className="text-xs text-ink-500">
                      {sampleSufficiency.isSufficient ? 'Statistically powered' : 'Underpowered (early trend)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
