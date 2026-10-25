'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, Send, AlertCircle } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import { trackRecommendationFeedbackSubmitted } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const REASON_OPTIONS = [
  { id: 'price_too_high', label: 'Price too high' },
  { id: 'duration_too_long', label: 'Travel time too long' },
  { id: 'layover_inconvenient', label: 'Layover inconvenient' },
  { id: 'wrong_airport', label: 'Inconvenient airport' },
  { id: 'mismatch_preferences', label: 'Did not match my preferences' },
  { id: 'other', label: 'Other reason' },
];

export function RecommendationFeedback({ rank = 1, recommendation }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  async function handleFeedbackChoice(isHelpful) {
    if (submitting || submitted) return;

    if (!isHelpful) {
      setShowReasons(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await feedbackService.submitFeedback({
        isHelpful: true,
        recommendationRank: rank,
        searchContext: {
          priceInr: recommendation?.totalPriceInr,
          durationMinutes: recommendation?.totalDurationMinutes,
          stops: recommendation?.totalStops,
        },
      });

      trackRecommendationFeedbackSubmitted({
        isHelpful: true,
        reason: null,
        hasComment: false,
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not record feedback');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReasonSubmit(e) {
    e?.preventDefault();
    if (submitting || submitted) return;

    setSubmitting(true);
    setError(null);

    try {
      await feedbackService.submitFeedback({
        isHelpful: false,
        recommendationRank: rank,
        reason: selectedReason || 'other',
        comment: comment.trim() || null,
        searchContext: {
          priceInr: recommendation?.totalPriceInr,
          durationMinutes: recommendation?.totalDurationMinutes,
          stops: recommendation?.totalStops,
        },
      });

      trackRecommendationFeedbackSubmitted({
        isHelpful: false,
        reason: selectedReason || 'other',
        hasComment: Boolean(comment.trim()),
      });

      setSubmitted(true);
      setShowReasons(false);
    } catch (err) {
      setError(err.message || 'Could not submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 border border-emerald-200/60">
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        <span>Thank you! Your feedback helps FlightWise improve flight recommendations.</span>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-ink-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-ink-500 font-medium">Was this flight recommendation helpful?</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleFeedbackChoice(true)}
            aria-label="Helpful recommendation"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50"
          >
            <ThumbsUp className="h-3 w-3 text-ink-400" aria-hidden="true" />
            Helpful
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleFeedbackChoice(false)}
            aria-label="Not helpful recommendation"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm transition disabled:opacity-50',
              showReasons
                ? 'border-amber-400 bg-amber-50 text-amber-900'
                : 'border-ink-200 bg-white text-ink-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800'
            )}
          >
            <ThumbsDown className="h-3 w-3 text-ink-400" aria-hidden="true" />
            Not helpful
          </button>
        </div>
      </div>

      {showReasons && (
        <form onSubmit={handleReasonSubmit} className="mt-3 rounded-lg border border-ink-100 bg-ink-50/70 p-3 text-xs">
          <p className="font-medium text-ink-800">What could be improved about this option?</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedReason(opt.id)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition',
                  selectedReason === opt.id
                    ? 'bg-horizon-700 text-white shadow-sm'
                    : 'bg-white border border-ink-200 text-ink-700 hover:border-ink-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-2.5">
            <textarea
              rows={2}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional: share more details (max 500 characters)..."
              className="w-full rounded border border-ink-200 p-2 text-xs text-ink-800 placeholder:text-ink-400 focus:border-horizon-500 focus:outline-none"
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-ink-400">
              <span>{comment.length}/500</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReasons(false)}
                  className="text-ink-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded bg-horizon-700 px-3 py-1 font-semibold text-white hover:bg-horizon-800 disabled:opacity-50"
                >
                  <Send className="h-3 w-3" aria-hidden="true" />
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1 text-xs text-danger-600">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
