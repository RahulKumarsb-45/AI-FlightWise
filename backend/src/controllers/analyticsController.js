const { trackEvent, trackBatchEvents } = require('../services/analyticsService');
const { getAggregatedDashboardMetrics } = require('../services/analyticsAggregationService');
const AppError = require('../utils/AppError');

async function recordEvent(req, res, next) {
  try {
    const {
      eventName,
      sessionId,
      searchId,
      itineraryId,
      experimentId,
      variant,
      properties,
      idempotencyKey,
      timestamp,
    } = req.body;

    if (!eventName || !sessionId) {
      return next(new AppError('eventName and sessionId are required', 400, 'INVALID_ANALYTICS_PAYLOAD'));
    }

    const userId = req.user?.id || req.body.userId || null;

    const result = await trackEvent({
      eventName,
      userId,
      sessionId,
      searchId,
      itineraryId,
      experimentId,
      variant,
      properties,
      idempotencyKey,
      timestamp,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function recordBatch(req, res, next) {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return next(new AppError('events array is required', 400, 'INVALID_BATCH_PAYLOAD'));
    }

    const userId = req.user?.id || null;
    const fallbackSessionId = req.body.sessionId;
    const enrichedEvents = events.map((ev) => ({
      ...ev,
      sessionId: ev.sessionId || fallbackSessionId,
      userId: ev.userId || userId,
    }));

    const result = await trackBatchEvents(enrichedEvents);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const { startDate, endDate, demo } = req.query;
    const isDemo = demo === 'true' || demo === '1';

    const metrics = await getAggregatedDashboardMetrics({
      startDate,
      endDate,
      demoMode: isDemo,
    });

    res.status(200).json({
      status: 'success',
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
}

async function exportReport(req, res, next) {
  try {
    const { startDate, endDate, demo } = req.query;
    const isDemo = demo === 'true' || demo === '1';

    const data = await getAggregatedDashboardMetrics({
      startDate,
      endDate,
      demoMode: isDemo,
    });

    const md = [
      `# AI FlightWise — Product Analytics & Funnel Report`,
      ``,
      `- **Generated:** ${new Date().toISOString()}`,
      `- **Data Mode:** ${data.isDemo ? 'SYNTHETIC DEMO MODE (SIMULATED)' : 'REAL APPLICATION PRODUCTION EVENTS'}`,
      `- **Date Range:** ${startDate || 'All time'} to ${endDate || 'Present'}`,
      ``,
      `## Key Product Performance Indicators (KPIs)`,
      ``,
      `| Metric | Value | Denominator / Attribution |`,
      `|---|---|---|`,
      `| **Search Volume** | **${data.kpis.searchVolume}** | Total flight search submissions |`,
      `| **Unique Search Sessions** | **${data.kpis.uniqueSearchSessions}** | Distinct session IDs executing searches |`,
      `| **Results View Rate** | **${data.kpis.resultsViewRate}%** | Results Viewed / Unique Search Sessions |`,
      `| **Recommendation Select Rate** | **${data.kpis.recommendationSelectRate}%** | Recommendation Selected / Results Viewed |`,
      `| **Trip Save Rate** | **${data.kpis.tripSaveRate}%** | Trip Saved / Results Viewed |`,
      `| **Checkout Start Rate** | **${data.kpis.checkoutStartRate}%** | Checkout Started / Unique Search Sessions |`,
      `| **Verified Payment Conversion** | **${data.kpis.paymentConversionRate}%** | Payment Completed / Checkout Started |`,
      `| **Returning User Rate** | **${data.kpis.returningUserRate}%** | Multi-session identified users / Total users |`,
      ``,
      `## Conversion Funnel Drop-off Analysis`,
      ``,
      `| Funnel Stage | Sessions | Step Conversion | Drop-off Rate | Description |`,
      `|---|---|---|---|---|`,
      ...data.funnel.map(
        (f) =>
          `| **${f.stage}** | ${f.count} | ${f.conversionRate}% | ${f.dropoffRate}% | ${f.description} |`
      ),
      ``,
      `## Top Search Routes`,
      ``,
      ...data.topRoutes.map((r, i) => `${i + 1}. **${r.route}**: ${r.count} searches`),
    ].join('\n');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="flightwise-product-analytics.md"');
    res.status(200).send(md);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recordEvent,
  recordBatch,
  getDashboard,
  exportReport,
};
