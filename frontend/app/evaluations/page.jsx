'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { evalService } from '@/services/evalService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EvaluationsPage() {
  const queryClient = useQueryClient();
  const [expandedCase, setExpandedCase] = useState(null);

  const { data: evalResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['evaluations', 'latest'],
    queryFn: () => evalService.getLatestEvaluation(),
    retry: false,
  });

  const runMutation = useMutation({
    mutationFn: () => evalService.triggerEvaluationRun(),
    onSuccess: (newReport) => {
      queryClient.setQueryData(['evaluations', 'latest'], newReport);
    },
  });

  const report = evalResponse?.data || null;

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-paper py-10">
        <div className="container-page max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-electric-600 to-cyan-500 text-white shadow-soft">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <h1 className="font-display text-display-sm text-ink-900">AI Quality & Evaluation</h1>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                Ground-truth synthetic benchmark suite for Aero AI structured extraction, constraint
                adherence, and latency.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || runMutation.isPending}
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                Refresh
              </Button>

              <Button
                size="sm"
                onClick={() => runMutation.mutate()}
                loading={runMutation.isPending}
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                {runMutation.isPending ? 'Running Evaluation...' : 'Run Benchmark Now'}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-12 flex flex-col items-center justify-center py-12 text-ink-400">
              <RotateCw className="h-8 w-8 animate-spin text-horizon-600" aria-hidden="true" />
              <p className="mt-3 text-sm">Loading latest benchmark evaluation results...</p>
            </div>
          )}

          {!isLoading && !report && (
            <div className="mt-12 rounded-xl border border-dashed border-ink-200 bg-white p-12 text-center shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-horizon-50 text-horizon-700">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
                No evaluation runs recorded yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
                Run the standardized test suite against the AI FlightWise extraction and constraint engine to
                verify accuracy and generate performance metrics.
              </p>
              <Button
                className="mt-6"
                onClick={() => runMutation.mutate()}
                loading={runMutation.isPending}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Run Benchmark Suite
              </Button>
            </div>
          )}

          {!isLoading && report && (
            <div className="mt-8 space-y-8">
              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-400">
                    <span>Benchmark Pass Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-ink-900">{report.passRate}%</span>
                    <span className="text-xs text-ink-500">
                      ({report.passedCases}/{report.totalCases} passed)
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${report.passRate}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-400">
                    <span>Average Latency</span>
                    <Clock className="h-4 w-4 text-horizon-600" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-ink-900">
                      {report.avgLatencyMs}
                    </span>
                    <span className="text-xs text-ink-400">ms / test case</span>
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    Total duration: {report.totalDurationMs} ms
                  </p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-400">
                    <span>Model / Evaluator</span>
                    <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-lg font-bold text-ink-900 truncate block">
                      {report.modelProvider}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    Evaluated: {new Date(report.timestamp).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-400">
                    <span>Dataset Version</span>
                    <Layers className="h-4 w-4 text-sky-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2">
                    <span className="font-display text-2xl font-bold text-ink-900">
                      v{report.datasetVersion}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    {report.totalCases} version-controlled scenarios
                  </p>
                </div>
              </div>

              {/* Failure Breakdown if any */}
              {report.failedCases > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    <span>Failure Taxonomy Breakdown</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {Object.entries(report.failureBreakdown || {}).map(([key, count]) => {
                      if (count === 0) return null;
                      return (
                        <span
                          key={key}
                          className="rounded bg-white px-2.5 py-1 font-mono text-amber-900 border border-amber-200"
                        >
                          {key}: <strong>{count}</strong>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Case Results Table */}
              <div className="rounded-xl border border-ink-100 bg-white shadow-soft overflow-hidden">
                <div className="border-b border-ink-100 bg-ink-50/50 px-5 py-3.5 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink-900">
                    Synthetic Evaluation Scenarios & Assertions ({report.caseResults.length})
                  </h2>
                  <span className="text-xs text-ink-400">Click any row to inspect extracted fields</span>
                </div>

                <div className="divide-y divide-ink-100">
                  {report.caseResults.map((tc) => {
                    const isExpanded = expandedCase === tc.id;
                    const isPassed = tc.status === 'passed';

                    return (
                      <div key={tc.id} className="transition-colors hover:bg-ink-50/30">
                        <div
                          onClick={() => setExpandedCase(isExpanded ? null : tc.id)}
                          className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isPassed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
                            ) : (
                              <XCircle className="h-4 w-4 text-danger-500 shrink-0" aria-hidden="true" />
                            )}
                            <span className="font-mono text-xs font-semibold text-ink-500">{tc.id}</span>
                            <span className="font-medium text-sm text-ink-900 truncate">{tc.scenario}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-xs text-ink-400">{tc.durationMs}ms</span>
                            <Badge variant={isPassed ? 'emerald' : 'danger'}>
                              {isPassed ? 'Passed' : 'Failed'}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-ink-400" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-ink-100 bg-ink-50/40 p-5 space-y-4 text-xs">
                            <div>
                              <span className="font-semibold text-ink-700">User Prompt:</span>
                              <p className="mt-1 rounded bg-white p-2.5 font-mono text-ink-800 border border-ink-100">
                                {tc.userPrompt}
                              </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <span className="font-semibold text-ink-700">Expected Fields:</span>
                                <pre className="mt-1 rounded bg-white p-2.5 font-mono text-[11px] text-ink-800 border border-ink-100 overflow-x-auto">
                                  {JSON.stringify(tc.expected, null, 2)}
                                </pre>
                              </div>

                              <div>
                                <span className="font-semibold text-ink-700">Extracted Fields:</span>
                                <pre className="mt-1 rounded bg-white p-2.5 font-mono text-[11px] text-ink-800 border border-ink-100 overflow-x-auto">
                                  {JSON.stringify(tc.extracted, null, 2)}
                                </pre>
                              </div>
                            </div>

                            {tc.failureReasons?.length > 0 && (
                              <div className="rounded bg-danger-50 p-2.5 text-danger-800 border border-danger-200">
                                <span className="font-semibold">Assertion Failures:</span>
                                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                                  {tc.failureReasons.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
