const { query } = require('../database/pool');
const { v4: uuidv4 } = require('uuid');

async function listDecisions() {
  const { rows } = await query(`
    SELECT d.*, p.title as linked_prd_title, e.name as linked_experiment_name
    FROM decision_log d
    LEFT JOIN prds p ON d.linked_prd_id = p.id
    LEFT JOIN experiments e ON d.linked_experiment_id = e.id
    ORDER BY d.date DESC, d.created_at DESC
  `);
  return rows;
}

async function getDecisionById(id) {
  const { rows } = await query(
    `SELECT d.*, p.title as linked_prd_title, e.name as linked_experiment_name
     FROM decision_log d
     LEFT JOIN prds p ON d.linked_prd_id = p.id
     LEFT JOIN experiments e ON d.linked_experiment_id = e.id
     WHERE d.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createDecision(data) {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO decision_log (
      id, title, date, problem, evidence_considered, alternatives,
      selected_decision, rationale, expected_outcome, actual_outcome,
      risks, owner, follow_up_metric, review_date, linked_prd_id, linked_experiment_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      id,
      data.title,
      data.date || new Date().toISOString().slice(0, 10),
      data.problem,
      data.evidenceConsidered || '',
      data.alternatives || '',
      data.selectedDecision,
      data.rationale,
      data.expectedOutcome || '',
      data.actualOutcome || null,
      data.risks || '',
      data.owner || 'Product Lead',
      data.followUpMetric || '',
      data.reviewDate || null,
      data.linkedPrdId || null,
      data.linkedExperimentId || null,
    ]
  );
  return rows[0];
}

async function updateDecision(id, data) {
  const existing = await getDecisionById(id);
  if (!existing) return null;

  const { rows } = await query(
    `UPDATE decision_log
     SET title = $1, date = $2, problem = $3, evidence_considered = $4,
         alternatives = $5, selected_decision = $6, rationale = $7,
         expected_outcome = $8, actual_outcome = $9, risks = $10,
         owner = $11, follow_up_metric = $12, review_date = $13,
         linked_prd_id = $14, linked_experiment_id = $15, updated_at = now()
     WHERE id = $16
     RETURNING *`,
    [
      data.title !== undefined ? data.title : existing.title,
      data.date !== undefined ? data.date : existing.date,
      data.problem !== undefined ? data.problem : existing.problem,
      data.evidenceConsidered !== undefined ? data.evidenceConsidered : existing.evidence_considered,
      data.alternatives !== undefined ? data.alternatives : existing.alternatives,
      data.selectedDecision !== undefined ? data.selectedDecision : existing.selected_decision,
      data.rationale !== undefined ? data.rationale : existing.rationale,
      data.expectedOutcome !== undefined ? data.expectedOutcome : existing.expected_outcome,
      data.actualOutcome !== undefined ? data.actualOutcome : existing.actual_outcome,
      data.risks !== undefined ? data.risks : existing.risks,
      data.owner !== undefined ? data.owner : existing.owner,
      data.followUpMetric !== undefined ? data.followUpMetric : existing.follow_up_metric,
      data.reviewDate !== undefined ? data.reviewDate : existing.review_date,
      data.linkedPrdId !== undefined ? data.linkedPrdId : existing.linked_prd_id,
      data.linkedExperimentId !== undefined ? data.linkedExperimentId : existing.linked_experiment_id,
      id,
    ]
  );
  return rows[0];
}

async function deleteDecision(id) {
  const { rowCount } = await query(`DELETE FROM decision_log WHERE id = $1`, [id]);
  return rowCount > 0;
}

module.exports = {
  listDecisions,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision,
};
