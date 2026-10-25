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
  Download,
  History,
  ShieldCheck,
  Cpu,
  Coins,
  Crosshair,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EvaluationsPage() {
  const queryClient = useQueryClient();
  const [expandedCase, setExpandedCase] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('offline');
  const [filterStatus, setFilterStatus] = useState('all'); // all | passed | failed
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);

  // Query latest evaluation run or selected historical run
  const {
    data: evalData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['evaluations', selectedRunId || 'latest'],
    queryFn: async () => {
      if (selectedRunId) {
        const res = await evalService.getEvaluationById(selectedRunId);
        return { report: res, runStatus: { isRunning: false } };
      }
      return evalService.getLatestEvaluation();
    },
    retry: 1,
  });

  // Query historical runs
  const { data: historyData } = useQuery({
    queryKey: ['evaluations', 'history'],
    queryFn: () => evalService.getEvaluationHistory(10, 0),
  });

  // Mutation to run evaluation
  const runMutation = useMutation({
    mutationFn: (provider) => evalService.triggerEvaluationRun(provider),
    onSuccess: (newReport) => {
      setSelectedRunId(null);
      queryClient.setQueryData(['evaluations', 'latest'], {
        report: newReport,
        runStatus: { isRunning: false },
      });
      queryClient.invalidateQueries({ queryKey: ['evaluations', 'history'] });
    },
  });

  const report = evalData?.report || null;
  const isRunning = runMutation.isPending || evalData?.runStatus?.isRunning;

  // Filter cases
  const filteredCases = report?.caseResults?.filter((c) => {
    if (filterStatus === 'passed') return c.status === 'passed';
    if (filterStatus === 'failed') return c.status === 'failed';
    return true;
  }) || [];

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-slate-50 py-10">
        <div className="container-page max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 bg-white p-6 rounded-2xl shadow-soft">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-electric-600 via-electric-500 to-cyan-500 text-white shadow-soft">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="font-display text-2xl font-bold text-ink-900">AI Quality & Evaluation</h1>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Continuous evaluation suite measuring structured extraction accuracy, constraint adherence, latency, and costs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Provider Selection */}
              <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50/70 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedProvider('offline')}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium transition-colors',
                    selectedProvider === 'offline'
                      ? 'bg-white text-ink-900 shadow-xs'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  Offline Baseline
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('mock')}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium transition-colors',
                    selectedProvider === 'mock'
                      ? 'bg-white text-ink-900 shadow-xs'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  Mock Provider
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('groq')}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium transition-colors',
                    selectedProvider === 'groq'
                      ? 'bg-white text-ink-900 shadow-xs'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  Live Groq AI
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-1.5"
              >
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                {showHistory ? 'Hide History' : 'Run History'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isRunning}
              >
                <RotateCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} aria-hidden="true" />
                Refresh
              </Button>

              <Button
                size="sm"
                onClick={() => runMutation.mutate(selectedProvider)}
                loading={isRunning}
                disabled={isRunning}
                className="bg-electric-600 hover:bg-electric-700 text-white shadow-soft"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                {isRunning ? 'Running Benchmark...' : 'Run Benchmark'}
              </Button>

              {report && (
                <a
                  href={evalService.getExportUrl(report.id || 'latest')}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-soft hover:bg-ink-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Export Report
                </a>
              )}
            </div>
          </div>

          {/* Running State Banner */}
          {isRunning && (
            <div className="mt-6 rounded-xl border border-electric-200 bg-electric-50/60 p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <RotateCw className="h-5 w-5 animate-spin text-electric-600 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-electric-900">
                    Executing Evaluation Suite ({selectedProvider === 'groq' ? 'Live Groq LLM' : selectedProvider === 'mock' ? 'Mock Provider' : 'Deterministic Offline Baseline'})...
                  </h3>
                  <p className="mt-0.5 text-xs text-electric-700">
                    Testing 12 standardized test scenarios against structured extraction rules and constraints.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {runMutation.isError && (
            <div className="mt-6 rounded-xl border border-danger-200 bg-danger-50 p-4 text-xs text-danger-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-danger-600" />
                Benchmark Execution Error
              </div>
              <p className="mt-1 text-danger-700">
                {runMutation.error?.message || 'Could not complete the evaluation run.'}
              </p>
            </div>
          )}

          {/* Historical Runs Drawer */}
          {showHistory && historyData?.runs && (
            <div className="mt-6 rounded-xl border border-ink-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-electric-600" />
                  Historical Evaluation Runs ({historyData.total})
                </h3>
                {selectedRunId && (
                  <button
                    onClick={() => setSelectedRunId(null)}
                    className="text-xs text-electric-600 hover:underline"
                  >
                    Switch back to Latest Run
                  </button>
                )}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs text-ink-600">
                  <thead className="bg-ink-50/60 text-ink-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-3 py-2">Timestamp</th>
                      <th className="px-3 py-2">Provider</th>
                      <th className="px-3 py-2">Pass Rate</th>
                      <th className="px-3 py-2">Accuracy</th>
                      <th className="px-3 py-2">Adherence</th>
                      <th className="px-3 py-2">Avg Latency</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {historyData.runs.map((r) => (
                      <tr
                        key={r.id}
                        className={cn(
                          'hover:bg-ink-50/50 transition-colors',
                          (selectedRunId === r.id || (!selectedRunId && report?.id === r.id)) &&
                            'bg-electric-50/40 font-medium'
                        )}
                      >
                        <td className="px-3 py-2.5">
                          {new Date(r.createdAt).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="truncate max-w-[150px] inline-block font-mono text-xs">
                            {r.modelProvider}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              'font-semibold',
                              r.passRate >= 90
                                ? 'text-emerald-600'
                                : r.passRate >= 70
                                ? 'text-amber-600'
                                : 'text-danger-600'
                            )}
                          >
                            {r.passRate}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5">{r.extractionAccuracy}%</td>
                        <td className="px-3 py-2.5">{r.constraintAdherence}%</td>
                        <td className="px-3 py-2.5 font-mono">{r.avgLatencyMs}ms</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setSelectedRunId(r.id)}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !report && (
            <div className="mt-12 flex flex-col items-center justify-center py-16 text-ink-400">
              <RotateCw className="h-8 w-8 animate-spin text-electric-600" aria-hidden="true" />
              <p className="mt-3 text-sm">Loading benchmark evaluation results...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !report && !isRunning && (
            <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-electric-50 text-electric-600">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
                No evaluation runs recorded yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
                Run the standardized test suite against the AI FlightWise extraction and constraint engine to verify accuracy and generate performance metrics.
              </p>
              <Button
                className="mt-6 bg-electric-600 hover:bg-electric-700 text-white"
                onClick={() => runMutation.mutate('offline')}
                loading={runMutation.isPending}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Run Benchmark Suite Now
              </Button>
            </div>
          )}

          {/* Report Display */}
          {!isLoading && report && (
            <div className="mt-8 space-y-6">
              {/* Provider Badge and Truthful Label */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-xl border border-ink-100 shadow-soft">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-ink-700">Evaluator Provider:</span>
                  <Badge
                    variant={
                      report.providerType === 'live_groq'
                        ? 'electric'
                        : report.providerType === 'mock'
                        ? 'purple'
                        : 'outline'
                    }
                  >
                    {report.modelProvider}
                  </Badge>
                  {report.providerType === 'offline_deterministic' && (
                    <span className="text-ink-400">
                      (Deterministic rule-based baseline — 0 token usage, zero cost)
                    </span>
                  )}
                  {report.providerType === 'live_groq' && (
                    <span className="text-emerald-700 font-medium">
                      (Verified live Groq LLM inference)
                    </span>
                  )}
                </div>

                <div className="text-xs text-ink-400">
                  Run ID: <code className="font-mono text-ink-600">{report.id}</code> ·{' '}
                  {new Date(report.timestamp).toLocaleString('en-IN')}
                </div>
              </div>

              {/* 6 Key Performance Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Pass Rate */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <span>Pass Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-bold text-ink-900">{report.passRate}%</span>
                    <span className="text-xs text-ink-400">
                      ({report.passedCases}/{report.totalCases})
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${report.passRate}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-ink-400">Denominator: total test cases</p>
                </div>

                {/* 2. Extraction Accuracy */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <span>Field Accuracy</span>
                    <Crosshair className="h-4 w-4 text-electric-600" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-bold text-ink-900">
                      {report.extractionAccuracy}%
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-electric-600 transition-all duration-500"
                      style={{ width: `${report.extractionAccuracy}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-ink-400">Denominator: expected fields</p>
                </div>

                {/* 3. Constraint Adherence */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <span>Constraint Adherence</span>
                    <ShieldCheck className="h-4 w-4 text-sky-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-bold text-ink-900">
                      {report.constraintAdherence}%
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${report.constraintAdherence}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-ink-400">Strict budget & date rules</p>
                </div>

                {/* 4. Average Latency */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <span>Avg Latency</span>
                    <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-bold text-ink-900">
                      {report.avgLatencyMs}
                    </span>
                    <span className="text-xs text-ink-400">ms/case</span>
                  </div>
                  <p className="mt-4 text-[11px] text-ink-400">
                    Total: {report.totalDurationMs} ms
                  </p>
                </div>

                {/* 5. Token Usage */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <span>Token Usage</span>
                    <Cpu className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-bold text-ink-900">
                      {report.tokenUsage?.totalTokens || 0}
                    </span>
                    <span className="text-xs text-ink-400">tokens</span>
                  </div>
                  <p className="mt-4 text-[11px] text-ink-400">
                    In: {report.tokenUsage?.promptTokens || 0} · Out: {report.tokenUsage?.completionTokens || 0}
                  </p>
                </div>

                {/* 6. Estimated AI Cost */}
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <span>Estimated Cost</span>
                    <Coins className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-bold text-ink-900">
                      ${report.estimatedCostUsd || '0.00'}
                    </span>
                    <span className="text-xs text-ink-400">USD</span>
                  </div>
                  <p className="mt-4 text-[11px] text-ink-400">
                    Groq token rates
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
                <div className="border-b border-ink-100 bg-ink-50/50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-sm font-semibold text-ink-900">
                      Evaluation Scenarios & Assertions ({filteredCases.length} of {report.caseResults.length})
                    </h2>
                    <span className="text-xs text-ink-400">Click any scenario row to inspect prompt extraction diffs</span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-colors',
                        filterStatus === 'all'
                          ? 'bg-ink-900 text-white font-medium'
                          : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
                      )}
                    >
                      All ({report.caseResults.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('passed')}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-colors',
                        filterStatus === 'passed'
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                      )}
                    >
                      Passed ({report.passedCases})
                    </button>
                    <button
                      onClick={() => setFilterStatus('failed')}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-colors',
                        filterStatus === 'failed'
                          ? 'bg-danger-600 text-white font-medium'
                          : 'bg-white text-danger-700 border border-danger-200 hover:bg-danger-50'
                      )}
                    >
                      Failed ({report.failedCases})
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-ink-100">
                  {filteredCases.map((tc) => {
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

                        {/* Expanded Details Diff */}
                        {isExpanded && (
                          <div className="border-t border-ink-100 bg-ink-50/40 p-5 space-y-4">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                                User Travel Query Prompt
                              </div>
                              <p className="mt-1 text-sm font-medium text-ink-800 bg-white p-3 rounded-lg border border-ink-100">
                                &ldquo;{tc.userPrompt}&rdquo;
                              </p>
                            </div>

                            {tc.failureReasons && tc.failureReasons.length > 0 && (
                              <div className="rounded-lg bg-danger-50 p-3 text-xs text-danger-900 border border-danger-200">
                                <div className="font-semibold mb-1">Failure Assertions:</div>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {tc.failureReasons.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">
                                  Ground Truth Expected Parameters
                                </div>
                                <pre className="bg-white p-3 rounded-lg border border-ink-100 font-mono text-xs text-ink-700 overflow-x-auto">
                                  {JSON.stringify(tc.expected, null, 2)}
                                </pre>
                              </div>

                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">
                                  Model Extracted Parameters
                                </div>
                                <pre className="bg-white p-3 rounded-lg border border-ink-100 font-mono text-xs text-ink-700 overflow-x-auto">
                                  {JSON.stringify(tc.extracted, null, 2)}
                                </pre>
                              </div>
                            </div>
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
