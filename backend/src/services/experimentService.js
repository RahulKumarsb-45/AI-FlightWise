const { query } = require('../database/pool');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Calculates a deterministic hash bucket (0-99) for stable assignment.
 */
function getHashBucket(experimentId, entityId) {
  const hash = crypto.createHash('sha256').update(`${experimentId}:${entityId}`).digest('hex');
  return parseInt(hash.slice(0, 8), 16) % 100;
}

/**
 * Ensures initial default experiment exists in PostgreSQL.
 */
async function ensureDefaultExperiments() {
  const defaultExp = {
    id: 'flight_recommendation_tradeoffs',
    name: 'Flight Recommendation Explainability & Trade-Offs',
    description: 'Compares standard flight recommendations against an enriched experience displaying explicit price vs duration trade-offs.',
    hypothesis: 'Showing explicit trade-offs and rationale on flight cards will increase recommendation selection rate by at least 15% due to reduced decision hesitation.',
    status: 'active',
    control_variant: 'control',
    variants: JSON.stringify(['control', 'variant_tradeoffs']),
    primary_metric: 'recommendation_selected',
    guardrail_metrics: JSON.stringify(['p95_latency_ms', 'checkout_dropoff_rate']),
    eligibility_rules: JSON.stringify({ minTravelers: 1 }),
  };

  await query(
    `INSERT INTO experiments (
      id, name, description, hypothesis, status, control_variant, variants,
      primary_metric, guardrail_metrics, eligibility_rules, start_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
    ON CONFLICT (id) DO NOTHING`,
    [
      defaultExp.id,
      defaultExp.name,
      defaultExp.description,
      defaultExp.hypothesis,
      defaultExp.status,
      defaultExp.control_variant,
      defaultExp.variants,
      defaultExp.primary_metric,
      defaultExp.guardrail_metrics,
      defaultExp.eligibility_rules,
    ]
  );
}

/**
 * Get or create stable assignment for a user/session.
 */
async function assignVariant({ experimentId, userId = null, sessionId }) {
  await ensureDefaultExperiments();

  const entityKey = userId || sessionId;
  if (!entityKey) throw new Error('userId or sessionId is required for experiment assignment');

  // Check if experiment exists and is active
  const expRes = await query(`SELECT * FROM experiments WHERE id = $1`, [experimentId]);
  if (expRes.rows.length === 0) {
    throw new Error(`Experiment "${experimentId}" not found`);
  }

  const exp = expRes.rows[0];
  if (exp.status !== 'active') {
    return {
      experimentId,
      variant: exp.control_variant || 'control',
      status: exp.status,
      assigned: false,
    };
  }

  // Check existing assignment in DB
  const existing = await query(
    `SELECT variant FROM experiment_assignments
     WHERE experiment_id = $1 AND (session_id = $2 OR (user_id IS NOT NULL AND user_id = $3))
     LIMIT 1`,
    [experimentId, sessionId, userId]
  );

  if (existing.rows.length > 0) {
    return {
      experimentId,
      variant: existing.rows[0].variant,
      status: 'active',
      assigned: true,
      cached: true,
    };
  }

  // Compute stable 50/50 bucket
  const bucket = getHashBucket(experimentId, entityKey);
  const variants = exp.variants || ['control', 'variant_tradeoffs'];
  const variant = bucket < 50 ? variants[0] : (variants[1] || variants[0]);

  // Persist assignment
  try {
    await query(
      `INSERT INTO experiment_assignments (
        id, experiment_id, user_id, session_id, variant
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (experiment_id, session_id) DO UPDATE SET variant = EXCLUDED.variant`,
      [uuidv4(), experimentId, userId, sessionId, variant]
    );
  } catch (err) {
    // Ignore conflict race condition
  }

  return {
    experimentId,
    variant,
    status: 'active',
    assigned: true,
    cached: false,
  };
}

/**
 * Record that a user was actually exposed to the assigned variant.
 */
async function recordExposure({ experimentId, userId = null, sessionId, variant }) {
  if (!sessionId || !variant) return null;

  // Deduplicate exposure if already recorded in this session
  const existing = await query(
    `SELECT id FROM experiment_exposures
     WHERE experiment_id = $1 AND session_id = $2
     LIMIT 1`,
    [experimentId, sessionId]
  );

  if (existing.rows.length > 0) {
    return { exposureId: existing.rows[0].id, recorded: true, deduplicated: true };
  }

  const exposureId = uuidv4();
  await query(
    `INSERT INTO experiment_exposures (
      id, experiment_id, user_id, session_id, variant
    ) VALUES ($1, $2, $3, $4, $5)`,
    [exposureId, experimentId, userId, sessionId, variant]
  );

  return { exposureId, recorded: true, deduplicated: false };
}

/**
 * List all experiments with high-level summaries.
 */
async function listExperiments() {
  await ensureDefaultExperiments();
  const { rows } = await query(`SELECT * FROM experiments ORDER BY created_at DESC`);
  return rows;
}

/**
 * Get detailed statistical results for an experiment.
 */
async function getExperimentResults(experimentId) {
  const expRes = await query(`SELECT * FROM experiments WHERE id = $1`, [experimentId]);
  if (expRes.rows.length === 0) return null;
  const exp = expRes.rows[0];

  // Count assigned sessions
  const assignedRes = await query(
    `SELECT variant, COUNT(DISTINCT session_id) as count
     FROM experiment_assignments
     WHERE experiment_id = $1
     GROUP BY variant`,
    [experimentId]
  );

  // Count exposed sessions
  const exposedRes = await query(
    `SELECT variant, COUNT(DISTINCT session_id) as count
     FROM experiment_exposures
     WHERE experiment_id = $1
     GROUP BY variant`,
    [experimentId]
  );

  // Count conversions (from analytics_events with experiment_id and matching variant)
  const convRes = await query(
    `SELECT variant, COUNT(DISTINCT session_id) as conversions
     FROM analytics_events
     WHERE experiment_id = $1 AND event_name = $2
     GROUP BY variant`,
    [experimentId, exp.primary_metric]
  );

  const stats = {};
  const variants = exp.variants || ['control', 'variant_tradeoffs'];

  variants.forEach((v) => {
    stats[v] = {
      variant: v,
      assigned: 0,
      exposed: 0,
      conversions: 0,
      conversionRate: 0,
      ci95Lower: 0,
      ci95Upper: 0,
    };
  });

  assignedRes.rows.forEach((r) => {
    if (stats[r.variant]) stats[r.variant].assigned = parseInt(r.count, 10);
  });

  exposedRes.rows.forEach((r) => {
    if (stats[r.variant]) stats[r.variant].exposed = parseInt(r.count, 10);
  });

  convRes.rows.forEach((r) => {
    if (stats[r.variant]) stats[r.variant].conversions = parseInt(r.conversions, 10);
  });

  // Calculate conversion rates & 95% Confidence Intervals
  variants.forEach((v) => {
    const s = stats[v];
    const denom = s.exposed > 0 ? s.exposed : s.assigned;
    if (denom > 0) {
      const p = s.conversions / denom;
      s.conversionRate = Number((p * 100).toFixed(2));
      const se = Math.sqrt((p * (1 - p)) / denom);
      s.ci95Lower = Number((Math.max(0, p - 1.96 * se) * 100).toFixed(2));
      s.ci95Upper = Number((Math.min(1, p + 1.96 * se) * 100).toFixed(2));
    }
  });

  const control = stats[exp.control_variant || 'control'] || { conversionRate: 0, exposed: 0 };
  const variant = stats[variants[1] || 'variant_tradeoffs'] || { conversionRate: 0, exposed: 0 };

  const absDiff = Number((variant.conversionRate - control.conversionRate).toFixed(2));
  const relDiff = control.conversionRate > 0
    ? Number((((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100).toFixed(1))
    : 0;

  const totalSampleSize = (control.exposed || control.assigned || 0) + (variant.exposed || variant.assigned || 0);
  const minRequiredSample = 400; // minimum 200 per variant for statistical power
  const isSampleSufficient = totalSampleSize >= minRequiredSample;

  return {
    experiment: exp,
    stats,
    comparison: {
      controlVariant: exp.control_variant || 'control',
      testVariant: variants[1] || 'variant_tradeoffs',
      controlRate: control.conversionRate,
      variantRate: variant.conversionRate,
      absoluteDifference: absDiff,
      relativeDifference: relDiff,
      sampleSizeSufficiency: {
        totalSample: totalSampleSize,
        minRequired: minRequiredSample,
        isSufficient: isSampleSufficient,
        warning: isSampleSufficient
          ? null
          : `Sample size (${totalSampleSize}) is below minimum requirement (${minRequiredSample}) for statistically conclusive results. Results represent early directional telemetry.`,
      },
    },
  };
}

/**
 * Updates experiment status (active, paused, completed).
 */
async function updateExperimentStatus(experimentId, status) {
  if (!['draft', 'active', 'paused', 'completed'].includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const { rows } = await query(
    `UPDATE experiments
     SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [status, experimentId]
  );

  return rows[0] || null;
}

module.exports = {
  getHashBucket,
  assignVariant,
  recordExposure,
  listExperiments,
  getExperimentResults,
  updateExperimentStatus,
  ensureDefaultExperiments,
};
