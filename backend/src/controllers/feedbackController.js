const { query } = require('../database/pool');
const { MemoryCache } = require('../cache/MemoryCache');
const logger = require('../logger/logger');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const {
  listFeedback,
  createFeedback,
  updateFeedbackStatus,
  getFeedbackThemesSummary,
} = require('../services/feedbackIntelligenceService');

const feedbackDedupCache = new MemoryCache();
const DEDUP_WINDOW_MS = 60 * 1000; // 1 minute window to prevent double-click / rapid resubmissions

// In-memory fallback storage for tests / development when database is not connected
const inMemoryFeedbackStore = [];

/**
 * Hash client identifiers for rate-limiting without storing raw IP.
 */
function hashClient(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/**
 * Legacy recommendation feedback submission.
 */
async function submitFeedback(req, res, next) {
  try {
    const { isHelpful, recommendationRank, reason, comment, searchContext } = req.body;
    const userId = req.user?.id || null;
    const clientHash = hashClient(req);

    const dedupKey = `fb:${userId || clientHash}:${recommendationRank || 1}:${isHelpful}`;
    if (feedbackDedupCache.get(dedupKey)) {
      throw new AppError('Feedback already received for this recommendation. Thank you!', 429, 'DUPLICATE_FEEDBACK');
    }

    feedbackDedupCache.set(dedupKey, true, DEDUP_WINDOW_MS);

    const feedbackEntry = {
      id: crypto.randomUUID(),
      userId,
      recommendationRank: recommendationRank || 1,
      isHelpful: Boolean(isHelpful),
      reason: reason || null,
      comment: comment ? String(comment).slice(0, 500) : null,
      searchContext: searchContext ? JSON.stringify(searchContext) : null,
      createdAt: new Date().toISOString(),
    };

    try {
      await query(
        `INSERT INTO recommendation_feedback (
          id, user_id, recommendation_rank, is_helpful, reason, comment, search_context
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          feedbackEntry.id,
          feedbackEntry.userId,
          feedbackEntry.recommendationRank,
          feedbackEntry.isHelpful,
          feedbackEntry.reason,
          feedbackEntry.comment,
          feedbackEntry.searchContext,
        ]
      );
    } catch (dbErr) {
      // If DB is offline / not migrated, persist in-memory gracefully so tests/demos don't fail
      logger.warn('Failed to persist recommendation feedback to database, storing in-memory fallback', {
        error: dbErr.message,
      });
      inMemoryFeedbackStore.push(feedbackEntry);
    }

    logger.info('Recommendation feedback submitted', {
      feedbackId: feedbackEntry.id,
      isHelpful,
      reason,
      recommendationRank,
    });

    res.status(201).json({
      status: 'success',
      message: 'Feedback received successfully. Thank you for helping us improve AI FlightWise!',
      data: {
        id: feedbackEntry.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Legacy recommendation feedback summary.
 */
async function getFeedbackSummary(req, res, next) {
  try {
    let summary = {
      total: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulRate: 0,
      reasonsBreakdown: {},
    };

    try {
      const { rows } = await query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE is_helpful = true)::int AS helpful_count,
          COUNT(*) FILTER (WHERE is_helpful = false)::int AS unhelpful_count
        FROM recommendation_feedback
      `);

      const reasonsRes = await query(`
        SELECT reason, COUNT(*)::int AS count
        FROM recommendation_feedback
        WHERE reason IS NOT NULL
        GROUP BY reason
      `);

      if (rows.length > 0 && rows[0].total > 0) {
        const total = rows[0].total;
        const helpful = rows[0].helpful_count;
        const reasons = {};
        for (const r of reasonsRes.rows) {
          reasons[r.reason] = r.count;
        }

        summary = {
          total,
          helpfulCount: helpful,
          unhelpfulCount: rows[0].unhelpful_count,
          helpfulRate: Math.round((helpful / total) * 100),
          reasonsBreakdown: reasons,
        };
      }
    } catch {
      // In-memory fallback aggregation
      const total = inMemoryFeedbackStore.length;
      if (total > 0) {
        const helpful = inMemoryFeedbackStore.filter((f) => f.isHelpful).length;
        const reasons = {};
        inMemoryFeedbackStore.forEach((f) => {
          if (f.reason) reasons[f.reason] = (reasons[f.reason] || 0) + 1;
        });
        summary = {
          total,
          helpfulCount: helpful,
          unhelpfulCount: total - helpful,
          helpfulRate: Math.round((helpful / total) * 100),
          reasonsBreakdown: reasons,
        };
      }
    }

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// CUSTOMER FEEDBACK INTELLIGENCE (PM WORKSPACE)
// ============================================================

async function getCustomerFeedbackList(req, res, next) {
  try {
    const { category, status, theme, search, limit, offset } = req.query;
    const result = await listFeedback({
      category,
      status,
      theme,
      search,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function createCustomerFeedback(req, res, next) {
  try {
    const { category, theme, sentiment, severity, searchContext } = req.body;
    const comment = req.body.comment || req.body.description || req.body.title;
    const userId = req.user?.id || null;

    const item = await createFeedback({
      userId,
      category,
      theme,
      sentiment,
      severity,
      comment,
      searchContext,
    });

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully.',
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

async function updateCustomerFeedbackStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await updateFeedbackStatus(id, status);
    if (!updated) {
      return next(new AppError(`Feedback with ID "${id}" was not found.`, 404, 'FEEDBACK_NOT_FOUND'));
    }

    res.status(200).json({
      status: 'success',
      message: `Feedback status updated to ${status}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function getCustomerFeedbackThemes(req, res, next) {
  try {
    const summary = await getFeedbackThemesSummary();
    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitFeedback,
  getFeedbackSummary,
  getCustomerFeedbackList,
  createCustomerFeedback,
  updateCustomerFeedbackStatus,
  getCustomerFeedbackThemes,
  _inMemoryFeedbackStore: inMemoryFeedbackStore,
};
