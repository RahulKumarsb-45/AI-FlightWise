const {
  listDecisions,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision,
} = require('../services/decisionService');
const AppError = require('../utils/AppError');

async function listAll(req, res, next) {
  try {
    const decisions = await listDecisions();
    res.status(200).json({
      status: 'success',
      data: decisions,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const decision = await getDecisionById(id);
    if (!decision) {
      return next(new AppError(`Decision with ID "${id}" was not found.`, 404, 'DECISION_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      data: decision,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const selectedDecision = req.body.selectedDecision || req.body.decision;
    const { title, problem, rationale } = req.body;
    if (!title || !problem || !selectedDecision || !rationale) {
      return next(
        new AppError('title, problem, selectedDecision, and rationale are required fields.', 400, 'FIELDS_REQUIRED')
      );
    }
    const decision = await createDecision({ ...req.body, selectedDecision });
    res.status(201).json({
      status: 'success',
      message: 'Decision log entry created successfully.',
      data: decision,
    });
  } catch (err) {
    next(err);
  }
}

async function edit(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateDecision(id, req.body);
    if (!updated) {
      return next(new AppError(`Decision with ID "${id}" was not found.`, 404, 'DECISION_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Decision log entry updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await deleteDecision(id);
    if (!deleted) {
      return next(new AppError(`Decision with ID "${id}" was not found.`, 404, 'DECISION_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Decision log entry deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function exportDecisionsMarkdown(req, res, next) {
  try {
    const decisions = await listDecisions();

    const md = [
      `# AI FlightWise — Product Decision Log (ADRs & Product Records)`,
      ``,
      `- **Exported:** ${new Date().toISOString()}`,
      `- **Total Decisions Recorded:** ${decisions.length}`,
      ``,
      ...decisions.map((d, idx) => [
        `## ${idx + 1}. [${d.date}] ${d.title}`,
        `- **Owner:** ${d.owner}`,
        `- **Problem:** ${d.problem}`,
        `- **Evidence Considered:** ${d.evidence_considered || 'N/A'}`,
        `- **Alternatives Evaluated:** ${d.alternatives || 'N/A'}`,
        `- **Selected Decision:** **${d.selected_decision}**`,
        `- **Rationale:** ${d.rationale}`,
        `- **Expected Outcome:** ${d.expected_outcome || 'N/A'}`,
        `- **Observed Actual Outcome:** ${d.actual_outcome || 'Pending follow-up review'}`,
        `- **Identified Risks:** ${d.risks || 'None specified'}`,
        `- **Follow-up Success Metric:** \`${d.follow_up_metric || 'N/A'}\``,
        `- **Review Date:** ${d.review_date || 'N/A'}`,
        ``,
      ].join('\n')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="flightwise-product-decision-log.md"');
    res.status(200).send(md);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAll,
  getById,
  create,
  edit,
  remove,
  exportDecisionsMarkdown,
};
