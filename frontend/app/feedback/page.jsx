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
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Layers,
  Search,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const { data: themesData, isLoading: themesLoading } = useQuery({
    queryKey: ['feedback', 'themes'],
    queryFn: () => productService.getFeedbackThemes(),
  });

  const { data: feedbackData, isLoading: listLoading } = useQuery({
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
      <main id="main-content" className="min-h-screen bg-slate-50 py-10">
        <div className="container-page max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 bg-white p-6 rounded-2xl shadow-soft">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-soft">
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="font-display text-2xl font-bold text-ink-900">
                    Customer Feedback Intelligence
                  </h1>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Thematic clustering, sentiment classification, and evidence links to user discovery insights.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setShowNewModal(true)}
                className="bg-electric-600 hover:bg-electric-700 text-white shadow-soft"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Customer Feedback
              </Button>
            </div>
          </div>

          {/* Thematic Pain-Point Clusters */}
          <div className="mt-8">
            <h2 className="font-display text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-electric-600" />
              Thematic Pain-Point Clusters ({themes.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => {
                const isSelected = selectedTheme === t.theme;
                return (
                  <div
                    key={t.theme}
                    onClick={() => setSelectedTheme(isSelected ? null : t.theme)}
                    className={cn(
                      'cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-soft',
                      isSelected
                        ? 'border-electric-500 ring-2 ring-electric-500/20'
                        : 'border-ink-100 hover:border-ink-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-ink-900 capitalize">
                        {t.theme.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {t.totalFeedback} items
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="text-danger-600 font-medium">
                        {t.sentimentBreakdown.negative} negative
                      </span>
                      <span className="text-ink-400">·</span>
                      <span className="text-ink-500 font-medium">
                        {t.sentimentBreakdown.neutral} neutral
                      </span>
                      <span className="text-ink-400">·</span>
                      <span className="text-emerald-600 font-medium">
                        {t.sentimentBreakdown.positive} positive
                      </span>
                    </div>

                    {t.highSeverityCount > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {t.highSeverityCount} high/critical severity records
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Filter Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-ink-100 shadow-soft">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search comments or themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-ink-200 text-xs w-64 focus:outline-electric-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-ink-200 text-xs text-ink-700"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-ink-200 text-xs text-ink-700"
              >
                <option value="">All Categories</option>
                <option value="flight_search">Flight Search</option>
                <option value="pricing">Pricing</option>
                <option value="ai_agent">AI Copilot</option>
                <option value="ui_ux">UI/UX</option>
              </select>

              {selectedTheme && (
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="text-xs text-electric-600 hover:underline font-medium ml-1"
                >
                  Clear theme filter ({selectedTheme})
                </button>
              )}
            </div>

            <div className="text-xs text-ink-500 font-medium">
              Showing {feedbackList.length} feedback records
            </div>
          </div>

          {/* Feedback Items List */}
          <div className="mt-4 rounded-xl border border-ink-100 bg-white shadow-soft overflow-hidden divide-y divide-ink-100">
            {feedbackList.map((item) => {
              const isSelected = selectedFeedback?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(isSelected ? null : item)}
                  className="p-5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                      <Badge variant="purple" className="capitalize">
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                      <span className="font-mono text-xs text-ink-400">#{item.theme}</span>
                      {item.severity === 'high' || item.severity === 'critical' ? (
                        <span className="text-[11px] font-semibold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {item.severity} severity
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-400">
                        {new Date(item.created_at).toLocaleDateString('en-IN')}
                      </span>
                      <Badge
                        variant={
                          item.status === 'resolved'
                            ? 'emerald'
                            : item.status === 'reviewed'
                            ? 'electric'
                            : 'outline'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-ink-900">&ldquo;{item.comment}&rdquo;</p>

                  {/* Expanded Actions */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-xs text-ink-400">
                        ID: <code className="font-mono">{item.id}</code>
                      </span>
                      <div className="flex items-center gap-2">
                        {item.status !== 'reviewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
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
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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
              <div className="p-12 text-center text-ink-400 text-sm">
                No feedback items match the selected criteria.
              </div>
            )}
          </div>

          {/* New Feedback Modal */}
          {showNewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-ink-100">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Record User Research Feedback
                </h3>
                <p className="mt-1 text-xs text-ink-500">
                  Add verified customer quotes or discovery interview observations to the intelligence database.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-ink-700">Customer Quote / Feedback</label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="e.g. The flight duration trade-off was not clear between 1-stop and direct options..."
                      className="w-full mt-1 p-2.5 rounded-lg border border-ink-200 text-xs focus:outline-electric-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-ink-700">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200 text-xs"
                      >
                        <option value="flight_search">Flight Search</option>
                        <option value="pricing">Pricing & Checkout</option>
                        <option value="ai_agent">Aero AI Copilot</option>
                        <option value="ui_ux">UI/UX & Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-700">Thematic Cluster</label>
                      <select
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200 text-xs"
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
                      <label className="text-xs font-semibold text-ink-700">Sentiment</label>
                      <select
                        value={newSentiment}
                        onChange={(e) => setNewSentiment(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200 text-xs"
                      >
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                        <option value="positive">Positive</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-700">Severity</label>
                      <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200 text-xs"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2.5">
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
                    className="bg-electric-600 hover:bg-electric-700 text-white"
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
