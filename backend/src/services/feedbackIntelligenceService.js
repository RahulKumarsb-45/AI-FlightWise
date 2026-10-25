const { query } = require('../database/pool');
const { v4: uuidv4 } = require('uuid');

/**
 * List customer feedback records with filtering and pagination.
 */
async function listFeedback({ category, status, theme, search, limit = 20, offset = 0 } = {}) {
  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (theme) {
    params.push(theme);
    conditions.push(`theme = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(comment ILIKE $${params.length} OR theme ILIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const { rows } = await query(
    `SELECT * FROM customer_feedback
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  const countRes = await query(
    `SELECT COUNT(*) FROM customer_feedback ${whereClause}`,
    params.slice(0, params.length - 2)
  );

  return {
    total: parseInt(countRes.rows[0].count, 10),
    limit,
    offset,
    feedback: rows,
  };
}

/**
 * Create a new customer feedback item.
 */
async function createFeedback({
  userId = null,
  category = 'flight_search',
  theme = 'general_inquiry',
  sentiment = 'neutral',
  severity = 'medium',
  comment,
  searchContext = {},
}) {
  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    throw new Error('Feedback comment cannot be empty');
  }

  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO customer_feedback (
      id, user_id, category, theme, sentiment, severity, comment, search_context, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
    RETURNING *`,
    [id, userId, category, theme, sentiment, severity, comment.trim(), JSON.stringify(searchContext || {})]
  );

  return rows[0];
}

/**
 * Update feedback status (reviewed, resolved, new).
 */
async function updateFeedbackStatus(id, newStatus) {
  if (!['new', 'reviewed', 'resolved'].includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const { rows } = await query(
    `UPDATE customer_feedback
     SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [newStatus, id]
  );

  return rows[0] || null;
}

/**
 * Groups feedback into thematic clusters with sentiment and severity metrics.
 */
async function getFeedbackThemesSummary() {
  const { rows: themes } = await query(`
    SELECT
      theme,
      category,
      COUNT(*) as total_feedback,
      COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
      COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
      COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
      COUNT(CASE WHEN severity IN ('high', 'critical') THEN 1 END) as high_severity_count,
      MAX(created_at) as latest_feedback_date
    FROM customer_feedback
    GROUP BY theme, category
    ORDER BY total_feedback DESC
  `);

  const { rows: statusCounts } = await query(`
    SELECT status, COUNT(*) as count
    FROM customer_feedback
    GROUP BY status
  `);

  return {
    themes: themes.map((t) => ({
      theme: t.theme,
      category: t.category,
      totalFeedback: parseInt(t.total_feedback, 10),
      sentimentBreakdown: {
        negative: parseInt(t.negative_count, 10),
        neutral: parseInt(t.neutral_count, 10),
        positive: parseInt(t.positive_count, 10),
      },
      highSeverityCount: parseInt(t.high_severity_count, 10),
      latestDate: t.latest_feedback_date,
    })),
    statusCounts: statusCounts.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {}),
  };
}

module.exports = {
  listFeedback,
  createFeedback,
  updateFeedbackStatus,
  getFeedbackThemesSummary,
};
