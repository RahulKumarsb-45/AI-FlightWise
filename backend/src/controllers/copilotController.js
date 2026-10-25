const {
  gatherEvidenceContext,
  calculateRiceScore,
  generatePMRationale,
  listPrds,
  getPrdById,
  createPrd,
  updatePrd,
  deletePrd,
} = require('../services/copilotService');
const AppError = require('../utils/AppError');

async function getEvidence(req, res, next) {
  try {
    const evidence = await gatherEvidenceContext();
    res.status(200).json({
      status: 'success',
      data: evidence,
    });
  } catch (err) {
    next(err);
  }
}

async function computeRice(req, res, next) {
  try {
    const { reach, impact, confidence, effort } = req.body;
    const score = calculateRiceScore({ reach, impact, confidence, effort });
    res.status(200).json({
      status: 'success',
      data: score,
    });
  } catch (err) {
    next(err);
  }
}

async function generate(req, res, next) {
  try {
    const { prompt, mode, inputContext } = req.body;
    if (!prompt) {
      return next(new AppError('Prompt is required for PM Copilot generation', 400, 'PROMPT_REQUIRED'));
    }

    const result = await generatePMRationale({ prompt, mode, inputContext });
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllPrds(req, res, next) {
  try {
    const { status } = req.query;
    const prds = await listPrds({ status });
    res.status(200).json({
      status: 'success',
      data: prds,
    });
  } catch (err) {
    next(err);
  }
}

async function getSinglePrd(req, res, next) {
  try {
    const { id } = req.params;
    const prd = await getPrdById(id);
    if (!prd) {
      return next(new AppError(`PRD with ID "${id}" was not found.`, 404, 'PRD_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      data: prd,
    });
  } catch (err) {
    next(err);
  }
}

async function savePrd(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const prd = await createPrd({ ...req.body, userId });
    res.status(201).json({
      status: 'success',
      message: 'PRD created successfully.',
      data: prd,
    });
  } catch (err) {
    next(err);
  }
}

async function editPrd(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updatePrd(id, req.body);
    if (!updated) {
      return next(new AppError(`PRD with ID "${id}" was not found.`, 404, 'PRD_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      message: 'PRD updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function removePrd(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await deletePrd(id);
    if (!deleted) {
      return next(new AppError(`PRD with ID "${id}" was not found.`, 404, 'PRD_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      message: 'PRD deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function exportPrdMarkdown(req, res, next) {
  try {
    const { id } = req.params;
    const prd = await getPrdById(id);
    if (!prd) {
      return next(new AppError(`PRD with ID "${id}" was not found.`, 404, 'PRD_NOT_FOUND'));
    }

    const content = prd.raw_markdown || `# ${prd.title}\n\n## Problem Statement\n${prd.problem_statement}\n\n## Solution\n${prd.solution}`;

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="PRD-${prd.id}.md"`);
    res.status(200).send(content);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEvidence,
  computeRice,
  generate,
  getAllPrds,
  getSinglePrd,
  savePrd,
  editPrd,
  removePrd,
  exportPrdMarkdown,
};
