'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  AlertCircle,
  Layers,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Plane,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const THEME_DESCRIPTIONS = {
  price_transparency: 'Travelers requesting breakdown between base airfare, taxes, and nearby-airport transit costs.',
  layover_fatigue: 'Concerns regarding excessive layover durations, overnight connections, or tight terminal changes.',
  flexible_dates: 'Feedback on ±3 day window fare comparisons and date calendar usability.',
  booking_redirect_clarity: 'Clarity around mock demo data vs live booking provider handoffs.',
};

export default function FeedbackIntelligencePage() {
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New feedback form state
  const [newComment, setNewComment] = useState('');
  const [newCategory, setNewCategory] = useState('flight_search');
  const [newTheme, setNewTheme] = useState('price_transparency');
  const [newSentiment, setNewSentiment] = useState('neutral');
  const [newSeverity, setNewSeverity] = useState('medium');

  const { data: themesData } = useQuery({
    queryKey: ['feedback', 'themes'],
    queryFn: () => productService.getFeedbackThemes(),
  });

  const { data: feedbackData } = useQuery({
    queryKey: ['feedback', 'list', selectedTheme, statusFilter, categoryFilter, searchTerm],
    queryFn: () =>
      productService.getCustomerFeedback({
        theme: selectedTheme || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: searchTerm || undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => productService.updateFeedbackStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => productService.submitCustomerFeedback(payload),
    onSuccess: () => {
      setShowNewModal(false);
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  const themes = themesData?.themes || [];
  const feedbackList = feedbackData?.feedback || [];

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
                <span className="text-xs text-ink-500 font-medium">Customer Evidence Intelligence</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                Customer Feedback Intelligence
              </h1>
              <p className="mt-1 text-sm text-ink-600 max-w-2xl leading-relaxed">
                Thematic clustering, sentiment classification, and evidence links to user discovery insights — informing flight search and route planning improvements.
              </p>
            </div>

            <Button
              size="md"
              onClick={() => setShowNewModal(true)}
              className="bg-electric-600 hover:bg-electric-700 text-white shadow-soft font-semibold text-sm h-10 px-4"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Customer Feedback
            </Button>
          </div>

          {/* Thematic Pain-Point Clusters */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-950 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-electric-600" />
                  Top Customer Problem Themes ({themes.length})
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  Click any thematic cluster below to filter the customer evidence list.
                </p>
              </div>

              {selectedTheme && (
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-electric-600 hover:text-electric-700 bg-electric-50 border border-electric-200/60 px-2.5 py-1 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear filter ({selectedTheme.replace(/_/g, ' ')})
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => {
                const isSelected = selectedTheme === t.theme;
                const total = t.totalFeedback || 1;
                const negPct = Math.round(((t.sentimentBreakdown.negative || 0) / total) * 100);
                const neuPct = Math.round(((t.sentimentBreakdown.neutral || 0) / total) * 100);
                const posPct = 100 - negPct - neuPct;

                return (
                  <div
                    key={t.theme}
                    onClick={() => setSelectedTheme(isSelected ? null : t.theme)}
                    className={cn(
                      'cursor-pointer rounded-2xl border p-5 bg-white transition-all shadow-soft',
                      isSelected
                        ? 'border-electric-500 ring-2 ring-electric-500/20 bg-electric-50/20'
                        : 'border-ink-100 hover:border-electric-200 hover:shadow-card'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-bold text-ink-950 capitalize">
                        {t.theme.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-electric-700 bg-electric-50 border border-electric-200/60 px-2.5 py-0.5 rounded-full">
                        {t.totalFeedback} items
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-ink-500 leading-relaxed min-h-[32px]">
                      {THEME_DESCRIPTIONS[t.theme] || 'Observations impacting flight comparison and optimization.'}
                    </p>

                    {/* Sentiment Distribution Visual Bar */}
                    <div className="mt-3.5">
                      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                        <div style={{ width: `${negPct}%` }} className="bg-rose-500" title={`Negative: ${negPct}%`} />
                        <div style={{ width: `${neuPct}%` }} className="bg-slate-400" title={`Neutral: ${neuPct}%`} />
                        <div style={{ width: `${posPct}%` }} className="bg-emerald-500" title={`Positive: ${posPct}%`} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-rose-700 font-semibold">{t.sentimentBreakdown.negative} negative</span>
                        <span className="text-ink-500">{t.sentimentBreakdown.neutral} neutral</span>
                        <span className="text-emerald-700 font-semibold">{t.sentimentBreakdown.positive} positive</span>
                      </div>
                    </div>

                    {t.highSeverityCount > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>{t.highSeverityCount} high severity issues reported</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Filter Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-ink-100 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search comments or themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg border border-ink-200 text-sm w-64 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-800 focus:outline-none focus:border-electric-500"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-800 focus:outline-none focus:border-electric-500"
              >
                <option value="">All Categories</option>
                <option value="flight_search">Flight Search</option>
                <option value="pricing">Pricing</option>
                <option value="ai_agent">Shreya AI Concierge</option>
                <option value="ui_ux">UI/UX & Mobile</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-ink-500">
              Showing {feedbackList.length} feedback records
            </div>
          </div>

          {/* Feedback Items List */}
          <div className="mt-4 space-y-3">
            {feedbackList.map((item) => {
              const isSelected = selectedFeedback?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(isSelected ? null : item)}
                  className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft hover:shadow-card hover:border-electric-200 transition-all cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          item.sentiment === 'positive'
                            ? 'emerald'
                            : item.sentiment === 'negative'
                            ? 'danger'
                            : 'outline'
                        }
                      >
                        {item.sentiment}
                      </Badge>
                      <Badge variant="electric" className="capitalize">
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                      <span className="font-mono text-xs font-semibold text-ink-600 bg-ink-50 border border-ink-200/60 px-2 py-0.5 rounded">
                        #{item.theme}
                      </span>
                      {item.severity === 'high' || item.severity === 'critical' ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
                          {item.severity} severity
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-ink-500">
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <Badge
                        variant={
                          item.status === 'resolved'
                            ? 'emerald'
                            : item.status === 'reviewed'
                            ? 'electric'
                            : 'neutral'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="mt-3.5 text-base font-medium text-ink-900 leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>

                  {/* Impact on flight-search experience */}
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
                    <span className="flex items-center gap-1.5 text-ink-600">
                      <Plane className="h-3.5 w-3.5 text-electric-600" />
                      <span>Affects: <strong>{item.category === 'flight_search' ? 'Route search & comparison results' : item.category === 'pricing' ? 'Fare breakdown & savings calculation' : 'Shreya AI concierge trade-off explainability'}</strong></span>
                    </span>
                    <span className="font-medium text-electric-600 flex items-center gap-1">
                      {isSelected ? 'Hide details' : 'View evidence details'}
                      {isSelected ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </div>

                  {/* Expanded Actions & Evidence */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3 bg-ink-50/50 p-3 rounded-xl">
                      <div className="text-xs text-ink-500 space-x-2">
                        <span>Record ID: <code className="font-mono font-semibold text-ink-700">{item.id}</code></span>
                        <span>·</span>
                        <span>Source: Customer Discovery Session</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status !== 'reviewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              statusMutation.mutate({ id: item.id, status: 'reviewed' });
                            }}
                          >
                            Mark Reviewed
                          </Button>
                        )}
                        {item.status !== 'resolved' && (
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              statusMutation.mutate({ id: item.id, status: 'resolved' });
                            }}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {feedbackList.length === 0 && (
              <div className="p-12 text-center text-ink-500 text-sm bg-white rounded-2xl border border-ink-100">
                No feedback items match the selected criteria.
              </div>
            )}
          </div>

          {/* New Feedback Modal */}
          {showNewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg bg-white rounded-2xl p-7 shadow-2xl border border-ink-100">
                <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink-950">
                      Record Customer Feedback
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-500">
                      Add verified customer discovery quotes to the intelligence database.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="p-1 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-ink-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-ink-800">Customer Quote / Observation</label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="e.g. The flight duration trade-off was not clear between 1-stop and direct options..."
                      className="w-full mt-1.5 p-3 rounded-xl border border-ink-200 text-sm text-ink-900 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-ink-800">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-ink-200 text-xs text-ink-800 focus:outline-none focus:border-electric-500"
                      >
                        <option value="flight_search">Flight Search</option>
                        <option value="pricing">Pricing & Checkout</option>
                        <option value="ai_agent">Shreya AI Concierge</option>
                        <option value="ui_ux">UI/UX & Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-ink-800">Thematic Cluster</label>
                      <select
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-ink-200 text-xs text-ink-800 focus:outline-none focus:border-electric-500"
                      >
                        <option value="price_transparency">Price Transparency</option>
                        <option value="layover_fatigue">Layover Fatigue</option>
                        <option value="flexible_dates">Flexible Dates</option>
                        <option value="booking_redirect_clarity">Booking Clarity</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-ink-800">Sentiment</label>
                      <select
                        value={newSentiment}
                        onChange={(e) => setNewSentiment(e.target.value)}
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-ink-200 text-xs text-ink-800 focus:outline-none focus:border-electric-500"
                      >
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                        <option value="positive">Positive</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-ink-800">Severity</label>
                      <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value)}
                        className="w-full mt-1.5 p-2.5 rounded-xl border border-ink-200 text-xs text-ink-800 focus:outline-none focus:border-electric-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-ink-100">
                  <Button variant="outline" size="sm" onClick={() => setShowNewModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!newComment.trim() || createMutation.isPending}
                    loading={createMutation.isPending}
                    onClick={() =>
                      createMutation.mutate({
                        comment: newComment,
                        category: newCategory,
                        theme: newTheme,
                        sentiment: newSentiment,
                        severity: newSeverity,
                      })
                    }
                    className="bg-electric-600 hover:bg-electric-700 text-white font-semibold"
                  >
                    Save Feedback
                  </Button>
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
