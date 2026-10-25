const { query } = require('../database/pool');
const { v4: uuidv4 } = require('uuid');

async function listRoadmapItems({ stage, priority, status } = {}) {
  const conditions = [];
  const params = [];

  if (stage) {
    params.push(stage);
    conditions.push(`stage = $${params.length}`);
  }

  if (priority) {
    params.push(priority);
    conditions.push(`priority = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT r.*, p.title as linked_prd_title, e.name as linked_experiment_name
     FROM roadmap_items r
     LEFT JOIN prds p ON r.linked_prd_id = p.id
     LEFT JOIN experiments e ON r.linked_experiment_id = e.id
     ${where}
     ORDER BY r.rice_score DESC, r.created_at DESC`,
    params
  );
  return rows;
}

async function getRoadmapItemById(id) {
  const { rows } = await query(
    `SELECT r.*, p.title as linked_prd_title, e.name as linked_experiment_name
     FROM roadmap_items r
     LEFT JOIN prds p ON r.linked_prd_id = p.id
     LEFT JOIN experiments e ON r.linked_experiment_id = e.id
     WHERE r.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createRoadmapItem(data) {
  const id = uuidv4();
  const reach = Number(data.reach) || 100;
  const impact = Number(data.impact) || 2.0;
  let rawConf = Number(data.confidence) || 0.8;
  const confidence = rawConf > 1 ? Number((rawConf / 100).toFixed(2)) : rawConf;
  const effort = Number(data.effort) || 3.0;
  const riceScore = Number(((reach * impact * confidence) / effort).toFixed(2));

  const { rows } = await query(
    `INSERT INTO roadmap_items (
      id, title, description, problem_statement, target_user, stage, priority,
      reach, impact, confidence, effort, rice_score, owner, status, dependencies,
      target_date, source_evidence, linked_prd_id, linked_experiment_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *`,
    [
      id,
      data.title,
      data.description || '',
      data.problemStatement || '',
      data.targetUser || 'All Travelers',
      data.stage || 'next',
      data.priority || 'medium',
      reach,
      impact,
      confidence,
      effort,
      riceScore,
      data.owner || 'Product Team',
      data.status || 'planned',
      data.dependencies || [],
      data.targetDate || null,
      JSON.stringify(data.sourceEvidence || {}),
      data.linkedPrdId || null,
      data.linkedExperimentId || null,
    ]
  );

  return rows[0];
}

async function updateRoadmapItem(id, data) {
  const existing = await getRoadmapItemById(id);
  if (!existing) return null;

  const reach = data.reach !== undefined ? Number(data.reach) : existing.reach;
  const impact = data.impact !== undefined ? Number(data.impact) : Number(existing.impact);
  let rawConf = data.confidence !== undefined ? Number(data.confidence) : Number(existing.confidence);
  const confidence = rawConf > 1 ? Number((rawConf / 100).toFixed(2)) : rawConf;
  const effort = data.effort !== undefined ? Number(data.effort) : Number(existing.effort);
  const riceScore = Number(((reach * impact * confidence) / effort).toFixed(2));

  const { rows } = await query(
    `UPDATE roadmap_items
     SET title = $1, description = $2, problem_statement = $3, target_user = $4,
         stage = $5, priority = $6, reach = $7, impact = $8, confidence = $9,
         effort = $10, rice_score = $11, owner = $12, status = $13, dependencies = $14,
         target_date = $15, linked_prd_id = $16, linked_experiment_id = $17, updated_at = now()
     WHERE id = $18
     RETURNING *`,
    [
      data.title !== undefined ? data.title : existing.title,
      data.description !== undefined ? data.description : existing.description,
      data.problemStatement !== undefined ? data.problemStatement : existing.problem_statement,
      data.targetUser !== undefined ? data.targetUser : existing.target_user,
      data.stage !== undefined ? data.stage : existing.stage,
      data.priority !== undefined ? data.priority : existing.priority,
      reach,
      impact,
      confidence,
      effort,
      riceScore,
      data.owner !== undefined ? data.owner : existing.owner,
      data.status !== undefined ? data.status : existing.status,
      data.dependencies !== undefined ? data.dependencies : existing.dependencies,
      data.targetDate !== undefined ? data.targetDate : existing.target_date,
      data.linkedPrdId !== undefined ? data.linkedPrdId : existing.linked_prd_id,
      data.linkedExperimentId !== undefined ? data.linkedExperimentId : existing.linked_experiment_id,
      id,
    ]
  );

  return rows[0];
}

async function deleteRoadmapItem(id) {
  const { rowCount } = await query(`DELETE FROM roadmap_items WHERE id = $1`, [id]);
  return rowCount > 0;
}

module.exports = {
  listRoadmapItems,
  getRoadmapItemById,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
};
