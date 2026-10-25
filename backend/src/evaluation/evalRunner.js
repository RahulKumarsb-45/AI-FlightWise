const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const logger = require('../logger/logger');
const aiProviderFactory = require('../services/aiProvider/aiProviderFactory');
const { query } = require('../database/pool');

const DATASET_PATH = path.join(__dirname, 'data', 'evalDataset.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const LATEST_RESULT_PATH = path.join(RESULTS_DIR, 'latest-run.json');

function loadDataset() {
  const raw = fs.readFileSync(DATASET_PATH, 'utf8');
  return JSON.parse(raw);
}

/**
 * Deterministic fallback extractor for local testing / offline runs
 * when AI_PROVIDER credentials are not configured or in test environments.
 */
function deterministicExtractionFallback(userPrompt) {
  const prompt = userPrompt.toLowerCase();
  const extracted = {
    originCity: null,
    destinationCountries: [],
    departureDate: null,
    returnDate: null,
    dateFlexible: false,
    travelers: 1,
    budgetInr: null,
    preference: 'balanced',
    includeNearbyAirports: true,
  };

  // Origin extraction
  const originMatch = userPrompt.match(/(?:from|out of)\s+([A-Z][a-z]+)/i);
  if (originMatch) extracted.originCity = originMatch[1];

  // Destination extraction
  const countries = [
    { name: 'United Kingdom', alias: ['london', 'uk', 'united kingdom'] },
    { name: 'United Arab Emirates', alias: ['dubai', 'uae', 'emirates'] },
    { name: 'France', alias: ['paris', 'france'] },
    { name: 'Germany', alias: ['germany', 'berlin', 'frankfurt'] },
    { name: 'Italy', alias: ['italy', 'rome', 'milan'] },
    { name: 'Singapore', alias: ['singapore'] },
    { name: 'Thailand', alias: ['thailand', 'bangkok'] },
    { name: 'Japan', alias: ['japan', 'tokyo'] },
    { name: 'United States', alias: ['new york', 'usa', 'united states'] },
  ];

  for (const c of countries) {
    if (c.alias.some((a) => prompt.includes(a))) {
      if (!extracted.destinationCountries.includes(c.name)) {
        extracted.destinationCountries.push(c.name);
      }
    }
  }

  // Dates
  const dateMatches = userPrompt.match(/\b(202\d-\d{2}-\d{2})\b/g);
  if (dateMatches && dateMatches.length > 0) {
    extracted.departureDate = dateMatches[0];
    if (dateMatches.length > 1) {
      extracted.returnDate = dateMatches[1];
    }
  }

  // Budget
  const budgetMatch = userPrompt.match(/(?:budget|under)\s+(\d{4,6})/i);
  if (budgetMatch) {
    extracted.budgetInr = parseInt(budgetMatch[1], 10);
  }

  // Preference
  if (prompt.includes('cheapest')) extracted.preference = 'cheapest';
  else if (prompt.includes('fastest') || prompt.includes('minimal stops') || prompt.includes('business'))
    extracted.preference = 'fastest';

  // Travelers
  const travelerMatch = userPrompt.match(/(\d+)\s*(?:traveler|passenger|people)/i);
  if (travelerMatch) {
    extracted.travelers = parseInt(travelerMatch[1], 10);
  }

  // Date flexible
  if (prompt.includes('flexible')) {
    extracted.dateFlexible = true;
  }

  return extracted;
}

/**
 * Runs the evaluation suite across all test cases.
 */
async function runEvaluation() {
  const dataset = loadDataset();
  const startTime = Date.now();
  const isTest = process.env.NODE_ENV === 'test';
  const hasLiveKey = Boolean(config.ai?.groq?.apiKey || config.ai?.groqApiKey);
  const useLive = hasLiveKey && !isTest && !process.argv.includes('--offline');
  let providerName = useLive ? (config.ai.provider || 'groq') : 'rule-based-baseline (offline mode)';
  let provider = null;

  if (useLive) {
    try {
      provider = aiProviderFactory.getProvider();
    } catch {
      providerName = 'rule-based-baseline (offline mode)';
    }
  }

  const caseResults = [];
  const failureBreakdown = {
    EXTRACTION_MISMATCH: 0,
    BUDGET_VIOLATION: 0,
    PREFERENCE_MISMATCH: 0,
    DATE_FORMAT_ERROR: 0,
    PROVIDER_ERROR: 0,
  };

  let totalLatency = 0;

  for (const tc of dataset.cases) {
    const caseStart = Date.now();
    let extractedParams = null;
    let _reply = '';
    let status = 'passed';
    const failureReasons = [];

    try {
      if (provider && providerName !== 'deterministic-fallback') {
        const res = await provider.generateChatReply({
          history: [],
          userMessage: tc.userPrompt,
        });
        extractedParams = res.extractedParams;
        _reply = res.reply;
      } else {
        extractedParams = deterministicExtractionFallback(tc.userPrompt);
        _reply = `I processed your request for ${extractedParams.originCity || 'your trip'}.`;
      }
    } catch (err) {
      status = 'failed';
      failureReasons.push(`Provider execution failed: ${err.message}`);
      failureBreakdown.PROVIDER_ERROR += 1;
      extractedParams = deterministicExtractionFallback(tc.userPrompt);
    }

    const caseDuration = Date.now() - caseStart;
    totalLatency += caseDuration;

    // Run deterministic assertions
    if (extractedParams) {
      if (tc.expected.originCity && extractedParams.originCity) {
        if (!extractedParams.originCity.toLowerCase().includes(tc.expected.originCity.toLowerCase())) {
          status = 'failed';
          failureReasons.push(`Origin mismatch: expected "${tc.expected.originCity}", got "${extractedParams.originCity}"`);
          failureBreakdown.EXTRACTION_MISMATCH += 1;
        }
      }

      if (tc.expected.destinationCountries && tc.expected.destinationCountries.length > 0) {
        const missingDest = tc.expected.destinationCountries.some(
          (d) => !(extractedParams.destinationCountries || []).includes(d)
        );
        if (missingDest) {
          status = 'failed';
          failureReasons.push(
            `Destination mismatch: expected [${tc.expected.destinationCountries.join(', ')}], got [${(extractedParams.destinationCountries || []).join(', ')}]`
          );
          failureBreakdown.EXTRACTION_MISMATCH += 1;
        }
      }

      if (tc.expected.budgetInr && extractedParams.budgetInr !== tc.expected.budgetInr) {
        status = 'failed';
        failureReasons.push(`Budget mismatch: expected ₹${tc.expected.budgetInr}, got ₹${extractedParams.budgetInr}`);
        failureBreakdown.BUDGET_VIOLATION += 1;
      }

      if (tc.expected.preference && extractedParams.preference !== tc.expected.preference) {
        status = 'failed';
        failureReasons.push(`Preference mismatch: expected "${tc.expected.preference}", got "${extractedParams.preference}"`);
        failureBreakdown.PREFERENCE_MISMATCH += 1;
      }
    } else {
      status = 'failed';
      failureReasons.push('No structured parameters extracted from prompt.');
      failureBreakdown.EXTRACTION_MISMATCH += 1;
    }

    caseResults.push({
      id: tc.id,
      scenario: tc.scenario,
      userPrompt: tc.userPrompt,
      status,
      durationMs: caseDuration,
      failureReasons,
      extracted: extractedParams,
      expected: tc.expected,
    });
  }

  const passedCases = caseResults.filter((r) => r.status === 'passed').length;
  const failedCases = caseResults.length - passedCases;
  const passRate = Math.round((passedCases / caseResults.length) * 100);
  const avgLatencyMs = Math.round(totalLatency / caseResults.length);

  const report = {
    id: `eval-${Date.now()}`,
    datasetVersion: dataset.version,
    modelProvider: providerName,
    timestamp: new Date().toISOString(),
    totalCases: caseResults.length,
    passedCases,
    failedCases,
    passRate,
    avgLatencyMs,
    totalDurationMs: Date.now() - startTime,
    failureBreakdown,
    caseResults,
  };

  // Ensure results dir exists
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  // Persist locally
  fs.writeFileSync(LATEST_RESULT_PATH, JSON.stringify(report, null, 2), 'utf8');

  // Attempt database persistence if available
  try {
    await query(
      `INSERT INTO evaluation_runs (
        dataset_version, model_provider, total_cases, passed_cases, failed_cases,
        pass_rate, average_latency_ms, failure_breakdown, detailed_results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        report.datasetVersion,
        report.modelProvider,
        report.totalCases,
        report.passedCases,
        report.failedCases,
        report.passRate,
        report.avgLatencyMs,
        JSON.stringify(report.failureBreakdown),
        JSON.stringify(report.caseResults),
      ]
    );
  } catch (dbErr) {
    logger.warn('Could not persist evaluation run to database (table may not exist yet in local mode)', {
      error: dbErr.message,
    });
  }

  logger.info('AI Evaluation completed', {
    passRate: `${passRate}%`,
    passed: passedCases,
    total: caseResults.length,
    avgLatencyMs,
  });

  return report;
}

function getLatestEvaluation() {
  if (fs.existsSync(LATEST_RESULT_PATH)) {
    const raw = fs.readFileSync(LATEST_RESULT_PATH, 'utf8');
    return JSON.parse(raw);
  }
  return null;
}

if (require.main === module) {
  runEvaluation()
    .then((report) => {
      console.log(`\n==============================================`);
      console.log(`AI FlightWise Evaluation Run Complete`);
      console.log(`==============================================`);
      console.log(`Dataset Version : ${report.datasetVersion}`);
      console.log(`Provider        : ${report.modelProvider}`);
      console.log(`Pass Rate       : ${report.passRate}% (${report.passedCases}/${report.totalCases})`);
      console.log(`Avg Latency     : ${report.avgLatencyMs} ms`);
      console.log(`==============================================\n`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Evaluation run failed:', err);
      process.exit(1);
    });
}

module.exports = {
  runEvaluation,
  getLatestEvaluation,
  loadDataset,
};
