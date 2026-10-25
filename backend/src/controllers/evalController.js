const { runEvaluation, getLatestEvaluation } = require('../evaluation/evalRunner');

async function getLatest(req, res, next) {
  try {
    const report = getLatestEvaluation();
    if (!report) {
      return res.status(200).json({
        status: 'success',
        data: null,
        message: 'No evaluation runs have been performed yet.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function triggerRun(req, res, next) {
  try {
    const report = await runEvaluation();
    res.status(200).json({
      status: 'success',
      message: 'Evaluation run completed successfully.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLatest,
  triggerRun,
};
