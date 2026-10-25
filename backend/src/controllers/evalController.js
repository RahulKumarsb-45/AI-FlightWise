const {
  runEvaluation,
  getLatestEvaluationFromDb,
  getEvaluationHistory,
  getEvaluationById,
  getCurrentRunStatus,
} = require('../evaluation/evalRunner');
const AppError = require('../utils/AppError');

async function getLatest(req, res, next) {
  try {
    const report = await getLatestEvaluationFromDb();
    const status = getCurrentRunStatus();

    if (!report && !status.isRunning) {
      return res.status(200).json({
        status: 'success',
        data: null,
        runStatus: status,
        message: 'No evaluation runs have been performed yet.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: report,
      runStatus: status,
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const result = await getEvaluationHistory(limit, offset);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const report = await getEvaluationById(id);
    if (!report) {
      return next(new AppError(`Evaluation run with ID "${id}" was not found.`, 404, 'EVAL_RUN_NOT_FOUND'));
    }

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const status = getCurrentRunStatus();
    res.status(200).json({
      status: 'success',
      data: status,
    });
  } catch (err) {
    next(err);
  }
}

async function triggerRun(req, res, next) {
  try {
    const provider = req.body?.provider || 'offline';
    if (!['offline', 'mock', 'groq'].includes(provider)) {
      return next(
        new AppError('Invalid provider. Supported providers are: offline, mock, groq', 400, 'INVALID_PROVIDER')
      );
    }

    const report = await runEvaluation({ provider });

    res.status(200).json({
      status: 'success',
      message: 'Evaluation run completed successfully.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function exportMarkdown(req, res, next) {
  try {
    const { id } = req.params;
    const report = id === 'latest' ? await getLatestEvaluation() : await getEvaluationById(id);

    if (!report) {
      return next(new AppError('Evaluation report not found to export.', 404, 'EVAL_REPORT_NOT_FOUND'));
    }

    const md = [
      `# AI FlightWise — Quality & Evaluation Benchmark Report`,
      ``,
      `- **Run ID:** \`${report.id}\``,
      `- **Timestamp:** ${report.timestamp}`,
      `- **Model / Provider:** ${report.modelProvider} (${report.providerType || 'standard'})`,
      `- **Dataset Version:** ${report.datasetVersion}`,
      `- **Status:** ${report.status}`,
      ``,
      `## Summary Metrics`,
      ``,
      `| Metric | Value | Denominator / Definition |`,
      `|---|---|---|`,
      `| **Pass Rate** | **${report.passRate}%** | ${report.passedCases} / ${report.totalCases} scenarios passed |`,
      `| **Extraction Accuracy** | **${report.extractionAccuracy}%** | Correct structured fields / total expected fields |`,
      `| **Constraint Adherence** | **${report.constraintAdherence}%** | Satisfied travel constraints / total constraints |`,
      `| **Hallucination Rate** | **${report.hallucinationRate}%** | Scenarios with invented or unexpected fields |`,
      `| **Average Latency** | **${report.avgLatencyMs} ms** | Mean end-to-end extraction duration per case |`,
      `| **Total Token Usage** | **${report.tokenUsage?.totalTokens || 0}** | Prompt + Completion tokens (0 for offline baseline) |`,
      `| **Estimated AI Cost** | **$${report.estimatedCostUsd || 0} USD** | Based on Groq token consumption |`,
      ``,
      `## Detailed Test Scenarios`,
      ``,
      ...report.caseResults.map((c, i) => [
        `### ${i + 1}. [${c.id}] ${c.scenario}`,
        `- **Status:** ${c.status === 'passed' ? 'PASSED' : 'FAILED'}`,
        `- **Prompt:** *"${c.userPrompt}"*`,
        `- **Duration:** ${c.durationMs} ms`,
        `- **Expected:** \`${JSON.stringify(c.expected)}\``,
        `- **Extracted:** \`${JSON.stringify(c.extracted)}\``,
        c.failureReasons && c.failureReasons.length > 0
          ? `- **Failure Reasons:**\n${c.failureReasons.map((r) => `  - ${r}`).join('\n')}`
          : '',
        ``,
      ].filter(Boolean).join('\n')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="eval-report-${report.id}.md"`);
    res.status(200).send(md);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLatest,
  getHistory,
  getById,
  getStatus,
  triggerRun,
  exportMarkdown,
};
