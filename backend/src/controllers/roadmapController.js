const {
  listRoadmapItems,
  getRoadmapItemById,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
} = require('../services/roadmapService');
const AppError = require('../utils/AppError');

async function listItems(req, res, next) {
  try {
    const { stage, priority, status } = req.query;
    const items = await listRoadmapItems({ stage, priority, status });
    res.status(200).json({
      status: 'success',
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

async function getItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = await getRoadmapItemById(id);
    if (!item) {
      return next(new AppError(`Roadmap item with ID "${id}" was not found.`, 404, 'ITEM_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

async function createItem(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) {
      return next(new AppError('Roadmap item title is required.', 400, 'TITLE_REQUIRED'));
    }
    const item = await createRoadmapItem(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Roadmap item created successfully.',
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

async function editItem(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updateRoadmapItem(id, req.body);
    if (!updated) {
      return next(new AppError(`Roadmap item with ID "${id}" was not found.`, 404, 'ITEM_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Roadmap item updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await deleteRoadmapItem(id);
    if (!deleted) {
      return next(new AppError(`Roadmap item with ID "${id}" was not found.`, 404, 'ITEM_NOT_FOUND'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Roadmap item deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function exportRoadmapMarkdown(req, res, next) {
  try {
    const items = await listRoadmapItems();

    const md = [
      `# AI FlightWise — Product Roadmap`,
      ``,
      `- **Exported:** ${new Date().toISOString()}`,
      `- **Total Items:** ${items.length}`,
      ``,
      `## NOW (In Flight / Immediate Priority)`,
      ``,
      ...items
        .filter((i) => i.stage === 'now')
        .map(
          (i) =>
            `### 🎯 ${i.title} (Priority: ${i.priority.toUpperCase()} · RICE: ${i.rice_score})\n- **Problem:** ${i.problem_statement || 'N/A'}\n- **Owner:** ${i.owner} · **Status:** ${i.status}\n- **Impact:** ${i.impact} · **Effort:** ${i.effort}w · **Confidence:** ${(i.confidence * 100).toFixed(0)}%\n`
        ),
      `## NEXT (Planned for Next Iteration)`,
      ``,
      ...items
        .filter((i) => i.stage === 'next')
        .map(
          (i) =>
            `### ⏳ ${i.title} (Priority: ${i.priority.toUpperCase()} · RICE: ${i.rice_score})\n- **Problem:** ${i.problem_statement || 'N/A'}\n- **Owner:** ${i.owner} · **Status:** ${i.status}\n- **Impact:** ${i.impact} · **Effort:** ${i.effort}w\n`
        ),
      `## LATER (Discovery & Exploration)`,
      ``,
      ...items
        .filter((i) => i.stage === 'later')
        .map(
          (i) =>
            `### 💡 ${i.title} (Priority: ${i.priority.toUpperCase()} · RICE: ${i.rice_score})\n- **Description:** ${i.description || 'N/A'}\n`
        ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="flightwise-product-roadmap.md"');
    res.status(200).send(md);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listItems,
  getItem,
  createItem,
  editItem,
  removeItem,
  exportRoadmapMarkdown,
};
