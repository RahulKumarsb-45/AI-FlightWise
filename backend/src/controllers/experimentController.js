const {
  listExperiments,
  getExperimentResults,
  assignVariant,
  recordExposure,
  updateExperimentStatus,
} = require('../services/experimentService');
const { query } = require('../database/pool');
const AppError = require('../utils/AppError');

async function listAll(req, res, next) {
  try {
    const experiments = await listExperiments();
    res.status(200).json({
      status: 'success',
      data: experiments,
    });
  } catch (err) {
    next(err);
  }
}

async function getResults(req, res, next) {
  try {
    const { id } = req.params;
    const results = await getExperimentResults(id);
    if (!results) {
      return next(new AppError(`Experiment with ID "${id}" was not found.`, 404, 'EXPERIMENT_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

async function assign(req, res, next) {
  try {
    const { experimentId, sessionId } = req.body;
    const userId = req.user?.id || req.body.userId || null;

    if (!experimentId || !sessionId) {
      return next(new AppError('experimentId and sessionId are required for variant assignment', 400, 'INVALID_PAYLOAD'));
    }

    const assignment = await assignVariant({ experimentId, userId, sessionId });
    res.status(200).json({
      status: 'success',
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
}

async function logExposure(req, res, next) {
  try {
    const { experimentId, sessionId, variant } = req.body;
    const userId = req.user?.id || req.body.userId || null;

    if (!experimentId || !sessionId || !variant) {
      return next(new AppError('experimentId, sessionId, and variant are required to record exposure', 400, 'INVALID_PAYLOAD'));
    }

    const result = await recordExposure({ experimentId, userId, sessionId, variant });
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await updateExperimentStatus(id, status);
    if (!updated) {
      return next(new AppError(`Experiment with ID "${id}" was not found.`, 404, 'EXPERIMENT_NOT_FOUND'));
    }

    res.status(200).json({
      status: 'success',
      message: `Experiment status updated to "${status}".`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function createExperiment(req, res, next) {
  try {
    const { id, name, description, hypothesis, primaryMetric, guardrailMetrics, eligibilityRules } = req.body;
    if (!id || !name || !hypothesis) {
      return next(new AppError('id, name, and hypothesis are required to create an experiment', 400, 'INVALID_PAYLOAD'));
    }

    const { rows } = await query(
      `INSERT INTO experiments (
        id, name, description, hypothesis, status, control_variant, variants,
        primary_metric, guardrail_metrics, eligibility_rules, start_date
      ) VALUES ($1, $2, $3, $4, 'draft', 'control', '["control", "variant"]'::jsonb, $5, $6, $7, now())
      RETURNING *`,
      [
        id,
        name,
        description || '',
        hypothesis,
        primaryMetric || 'recommendation_selected',
        JSON.stringify(guardrailMetrics || []),
        JSON.stringify(eligibilityRules || {}),
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Experiment created successfully.',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAll,
  getResults,
  assign,
  logExposure,
  updateStatus,
  createExperiment,
};
