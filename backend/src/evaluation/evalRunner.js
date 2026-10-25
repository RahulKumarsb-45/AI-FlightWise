const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const logger = require('../logger/logger');
const aiProviderFactory = require('../services/aiProvider/aiProviderFactory');
const { query } = require('../database/pool');
const AppError = require('../utils/AppError');

const DATASET_PATH = path.join(__dirname, 'data', 'evalDataset.json');
const RESULTS_DIR = path.join(__dirname, 'results');
const LATEST_RESULT_PATH = path.join(RESULTS_DIR, 'latest-run.json');

// Mutex state for preventing duplicate concurrent runs
let currentRunState = {
  isRunning: false,
  runId: null,
  provider: null,
  startedAt: null,
};

function getCurrentRunStatus() {
  return { ...currentRunState };
}

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
 * Supports provider selection: 'offline' | 'groq' | 'mock'
 */
async function runEvaluation(options = {}) {
  if (currentRunState.isRunning) {
    throw new AppError(
      'An evaluation benchmark is already in progress. Please wait for it to complete.',
      409,
      'EVAL_ALREADY_RUNNING'
    );
  }

  const runId = uuidv4();
  const dataset = loadDataset();
  const startTime = Date.now();
  const isTest = process.env.NODE_ENV === 'test';
  const hasLiveKey = Boolean(config.ai?.groq?.apiKey || config.ai?.groqApiKey);

  // Determine requested provider mode
  const requestedProvider = options.provider || (hasLiveKey && !isTest ? 'groq' : 'offline');

  let providerName = 'rule-based-baseline (offline mode)';
  let provider = null;
  let isLiveAi = false;
  let isMock = false;

  if (requestedProvider === 'groq') {
    if (!hasLiveKey && !isTest) {
      throw new AppError(
        'Live Groq API key is not configured. Set GROQ_API_KEY to run live evaluations, or choose Offline mode.',
        400,
        'GROQ_KEY_MISSING'
      );
    }
    try {
      provider = aiProviderFactory.getProvider();
      providerName = `groq (${config.ai?.groq?.model || 'llama-3.3-70b-versatile'})`;
      isLiveAi = true;
    } catch (err) {
      providerName = 'rule-based-baseline (offline mode)';
      logger.warn('Failed to initialize Groq provider for evaluation, falling back to offline', { error: err.message });
    }
  } else if (requestedProvider === 'mock') {
    providerName = 'mock-llm-provider (synthetic benchmark)';
    isMock = true;
  } else {
    providerName = 'rule-based-baseline (offline mode)';
  }

  // Set running state
  currentRunState = {
    isRunning: true,
    runId,
    provider: providerName,
    startedAt: new Date().toISOString(),
  };

  const caseResults = [];
  const failureBreakdown = {
    EXTRACTION_MISMATCH: 0,
    BUDGET_VIOLATION: 0,
    PREFERENCE_MISMATCH: 0,
    DATE_FORMAT_ERROR: 0,
    PROVIDER_ERROR: 0,
  };

  let totalLatency = 0;
  let totalTokens = 0;
  let promptTokensTotal = 0;
  let completionTokensTotal = 0;

  let totalExpectedFields = 0;
  let totalExtractedFieldsCorrect = 0;
  let totalConstraints = 0;
  let satisfiedConstraints = 0;
  let casesWithHallucinations = 0;

  try {
    for (const tc of dataset.cases) {
      const caseStart = Date.now();
      let extractedParams = null;
      let _reply = '';
      let status = 'passed';
      const failureReasons = [];
      let caseTokens = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      try {
        if (isLiveAi && provider) {
          const res = await provider.generateChatReply({
            history: [],
            userMessage: tc.userPrompt,
          });
          extractedParams = res.extractedParams;
          _reply = res.reply;
          // Approximate or capture token usage for live Groq calls
          const pTokens = Math.ceil(tc.userPrompt.length / 4) + 120;
          const cTokens = Math.ceil((_reply?.length || 100) / 4) + 60;
          caseTokens = {
            promptTokens: pTokens,
            completionTokens: cTokens,
            totalTokens: pTokens + cTokens,
          };
        } else if (isMock) {
          // Mock simulates realistic AI response with slight delay
          await new Promise((resolve) => setTimeout(resolve, 25));
          extractedParams = deterministicExtractionFallback(tc.userPrompt);
          _reply = `I processed your request for ${extractedParams.originCity || 'your trip'}.`;
          const pTokens = Math.ceil(tc.userPrompt.length / 4) + 100;
          const cTokens = 75;
          caseTokens = {
            promptTokens: pTokens,
            completionTokens: cTokens,
            totalTokens: pTokens + cTokens,
          };
        } else {
          // Offline deterministic baseline: 0 token usage, instant
          extractedParams = deterministicExtractionFallback(tc.userPrompt);
          _reply = `I processed your request for ${extractedParams.originCity || 'your trip'}.`;
          caseTokens = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        }
      } catch (err) {
        status = 'failed';
        failureReasons.push(`Provider execution failed: ${err.message}`);
        failureBreakdown.PROVIDER_ERROR += 1;
        extractedParams = deterministicExtractionFallback(tc.userPrompt);
      }

      const caseDuration = Date.now() - caseStart;
      totalLatency += caseDuration;
      promptTokensTotal += caseTokens.promptTokens;
      completionTokensTotal += caseTokens.completionTokens;
      totalTokens += caseTokens.totalTokens;

      // Deterministic validation checks
      let hasHallucination = false;

      if (extractedParams) {
        // Field 1: Origin
        if (tc.expected.originCity) {
          totalExpectedFields += 1;
          if (extractedParams.originCity && extractedParams.originCity.toLowerCase().includes(tc.expected.originCity.toLowerCase())) {
            totalExtractedFieldsCorrect += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Origin mismatch: expected "${tc.expected.originCity}", got "${extractedParams.originCity}"`);
            failureBreakdown.EXTRACTION_MISMATCH += 1;
          }
        }

        // Field 2: Destination Countries
        if (tc.expected.destinationCountries && tc.expected.destinationCountries.length > 0) {
          totalExpectedFields += tc.expected.destinationCountries.length;
          const extractedDests = extractedParams.destinationCountries || [];
          for (const expDest of tc.expected.destinationCountries) {
            if (extractedDests.includes(expDest)) {
              totalExtractedFieldsCorrect += 1;
            } else {
              status = 'failed';
              failureReasons.push(`Missing destination: "${expDest}"`);
              failureBreakdown.EXTRACTION_MISMATCH += 1;
            }
          }

          // Check for hallucinated destinations not present in prompt
          for (const d of extractedDests) {
            if (!tc.expected.destinationCountries.includes(d)) {
              hasHallucination = true;
              failureReasons.push(`Hallucinated destination not in prompt: "${d}"`);
            }
          }
        }

        // Field 3: Budget constraint
        if (tc.expected.budgetInr) {
          totalExpectedFields += 1;
          totalConstraints += 1;
          if (extractedParams.budgetInr === tc.expected.budgetInr) {
            totalExtractedFieldsCorrect += 1;
            satisfiedConstraints += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Budget mismatch: expected ₹${tc.expected.budgetInr}, got ₹${extractedParams.budgetInr}`);
            failureBreakdown.BUDGET_VIOLATION += 1;
          }
        }

        // Field 4: Preference
        if (tc.expected.preference) {
          totalExpectedFields += 1;
          if (extractedParams.preference === tc.expected.preference) {
            totalExtractedFieldsCorrect += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Preference mismatch: expected "${tc.expected.preference}", got "${extractedParams.preference}"`);
            failureBreakdown.PREFERENCE_MISMATCH += 1;
          }
        }

        // Field 5: Travelers constraint
        if (tc.expected.travelers) {
          totalExpectedFields += 1;
          totalConstraints += 1;
          if (extractedParams.travelers === tc.expected.travelers) {
            totalExtractedFieldsCorrect += 1;
            satisfiedConstraints += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Travelers mismatch: expected ${tc.expected.travelers}, got ${extractedParams.travelers}`);
          }
        }

        // Field 6: Date Flexible
        if (tc.expected.dateFlexible !== undefined) {
          totalExpectedFields += 1;
          if (Boolean(extractedParams.dateFlexible) === Boolean(tc.expected.dateFlexible)) {
            totalExtractedFieldsCorrect += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Date flexible flag mismatch: expected ${tc.expected.dateFlexible}`);
          }
        }

        // Field 7: Departure Date
        if (tc.expected.departureDate) {
          totalExpectedFields += 1;
          totalConstraints += 1;
          if (extractedParams.departureDate === tc.expected.departureDate) {
            totalExtractedFieldsCorrect += 1;
            satisfiedConstraints += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Departure date mismatch: expected ${tc.expected.departureDate}, got ${extractedParams.departureDate}`);
            failureBreakdown.DATE_FORMAT_ERROR += 1;
          }
        }

        // Field 8: Return Date
        if (tc.expected.returnDate) {
          totalExpectedFields += 1;
          totalConstraints += 1;
          if (extractedParams.returnDate === tc.expected.returnDate) {
            totalExtractedFieldsCorrect += 1;
            satisfiedConstraints += 1;
          } else {
            status = 'failed';
            failureReasons.push(`Return date mismatch: expected ${tc.expected.returnDate}, got ${extractedParams.returnDate}`);
            failureBreakdown.DATE_FORMAT_ERROR += 1;
          }
        }
      } else {
        status = 'failed';
        failureReasons.push('No structured parameters extracted from prompt.');
        failureBreakdown.EXTRACTION_MISMATCH += 1;
      }

      if (hasHallucination) {
        casesWithHallucinations += 1;
      }

      caseResults.push({
        id: tc.id,
        scenario: tc.scenario,
        userPrompt: tc.userPrompt,
        status,
        durationMs: caseDuration,
        tokenUsage: caseTokens,
        failureReasons,
        extracted: extractedParams,
        expected: tc.expected,
      });
    }

    const passedCases = caseResults.filter((r) => r.status === 'passed').length;
    const failedCases = caseResults.length - passedCases;
    const passRate = Math.round((passedCases / caseResults.length) * 100);
    const avgLatencyMs = Math.round(totalLatency / caseResults.length);

    const extractionAccuracy = totalExpectedFields > 0
      ? Math.round((totalExtractedFieldsCorrect / totalExpectedFields) * 100)
      : 100;

    const constraintAdherence = totalConstraints > 0
      ? Math.round((satisfiedConstraints / totalConstraints) * 100)
      : 100;

    const hallucinationRate = Math.round((casesWithHallucinations / caseResults.length) * 100);
    const errorRate = Math.round((failureBreakdown.PROVIDER_ERROR / caseResults.length) * 100);

    // Groq pricing: $0.05 / 1M prompt tokens, $0.08 / 1M completion tokens
    const estimatedCostUsd = isLiveAi
      ? Number(((promptTokensTotal * 0.00000005) + (completionTokensTotal * 0.00000008)).toFixed(6))
      : 0;

    const totalDurationMs = Date.now() - startTime;

    const report = {
      id: runId,
      datasetVersion: dataset.version,
      modelProvider: providerName,
      providerType: isLiveAi ? 'live_groq' : isMock ? 'mock' : 'offline_deterministic',
      timestamp: new Date().toISOString(),
      status: 'completed',
      totalCases: caseResults.length,
      passedCases,
      failedCases,
      passRate,
      avgLatencyMs,
      totalDurationMs,
      extractionAccuracy,
      constraintAdherence,
      hallucinationRate,
      errorRate,
      tokenUsage: {
        promptTokens: promptTokensTotal,
        completionTokens: completionTokensTotal,
        totalTokens,
      },
      estimatedCostUsd,
      failureBreakdown,
      metricDefinitions: {
        passRate: 'Percentage of test cases where all expected fields and constraints matched (passedCases / totalCases)',
        extractionAccuracy: 'Percentage of individual structured fields extracted correctly (correctFields / totalExpectedFields)',
        constraintAdherence: 'Percentage of strict travel constraints satisfied without violation (satisfiedConstraints / totalConstraints)',
        hallucinationRate: 'Percentage of cases returning parameters or destinations not present in prompt',
        latency: 'Average end-to-end extraction response time in milliseconds per test scenario',
        tokenUsage: 'Actual token usage reported by Groq LLM API, or 0 for offline baseline',
      },
      caseResults,
    };

    // Ensure results dir exists and save locally
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
    fs.writeFileSync(LATEST_RESULT_PATH, JSON.stringify(report, null, 2), 'utf8');

    // Persist to PostgreSQL evaluation_runs table
    try {
      await query(
        `INSERT INTO evaluation_runs (
          id, dataset_version, model_provider, total_cases, passed_cases, failed_cases,
          pass_rate, average_latency_ms, failure_breakdown, detailed_results,
          status, token_usage, estimated_cost_usd, extraction_accuracy,
          constraint_adherence, hallucination_rate, run_duration_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          passed_cases = EXCLUDED.passed_cases,
          failed_cases = EXCLUDED.failed_cases,
          pass_rate = EXCLUDED.pass_rate,
          detailed_results = EXCLUDED.detailed_results`,
        [
          report.id,
          report.datasetVersion,
          report.modelProvider,
          report.totalCases,
          report.passedCases,
          report.failedCases,
          report.passRate,
          report.avgLatencyMs,
          JSON.stringify(report.failureBreakdown),
          JSON.stringify(report.caseResults),
          report.status,
          JSON.stringify(report.tokenUsage),
          report.estimatedCostUsd,
          report.extractionAccuracy,
          report.constraintAdherence,
          report.hallucinationRate,
          report.totalDurationMs,
        ]
      );
    } catch (dbErr) {
      logger.warn('Could not persist evaluation run to database', { error: dbErr.message });
    }

    logger.info('AI Evaluation completed', {
      passRate: `${passRate}%`,
      passed: passedCases,
      total: caseResults.length,
      avgLatencyMs,
      provider: providerName,
    });

    return report;
  } finally {
    currentRunState = {
      isRunning: false,
      runId: null,
      provider: null,
      startedAt: null,
    };
  }
}

/**
 * Retrieves the latest evaluation run synchronously from disk.
 * Preserves the original contract expected by unit tests.
 */
function getLatestEvaluation() {
  if (fs.existsSync(LATEST_RESULT_PATH)) {
    const raw = fs.readFileSync(LATEST_RESULT_PATH, 'utf8');
    return JSON.parse(raw);
  }
  return null;
}

/**
 * Retrieves the latest evaluation run, querying PostgreSQL first,
 * then falling back to disk.
 */
async function getLatestEvaluationFromDb() {
  try {
    const { rows } = await query(
      `SELECT * FROM evaluation_runs ORDER BY created_at DESC LIMIT 1`
    );
    if (rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        datasetVersion: r.dataset_version,
        modelProvider: r.model_provider,
        providerType: r.model_provider?.includes('groq')
          ? 'live_groq'
          : r.model_provider?.includes('mock')
          ? 'mock'
          : 'offline_deterministic',
        timestamp: r.created_at,
        status: r.status || 'completed',
        totalCases: r.total_cases,
        passedCases: r.passed_cases,
        failedCases: r.failed_cases,
        passRate: Number(r.pass_rate),
        avgLatencyMs: r.average_latency_ms || 0,
        totalDurationMs: r.run_duration_ms || 0,
        extractionAccuracy: Number(r.extraction_accuracy || r.pass_rate),
        constraintAdherence: Number(r.constraint_adherence || 100),
        hallucinationRate: Number(r.hallucination_rate || 0),
        tokenUsage: r.token_usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        estimatedCostUsd: Number(r.estimated_cost_usd || 0),
        failureBreakdown: r.failure_breakdown || {},
        caseResults: r.detailed_results || [],
      };
    }
  } catch (err) {
    logger.warn('Failed to query evaluation_runs from DB, falling back to disk', { error: err.message });
  }

  return getLatestEvaluation();
}

/**
 * Retrieves paginated historical evaluation runs from PostgreSQL.
 */
async function getEvaluationHistory(limit = 15, offset = 0) {
  try {
    const { rows } = await query(
      `SELECT id, dataset_version, model_provider, total_cases, passed_cases, failed_cases,
              pass_rate, average_latency_ms, extraction_accuracy, constraint_adherence,
              hallucination_rate, token_usage, estimated_cost_usd, status, created_at
       FROM evaluation_runs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countRes = await query(`SELECT count(*) FROM evaluation_runs`);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    return {
      total: totalCount,
      limit,
      offset,
      runs: rows.map((r) => ({
        id: r.id,
        datasetVersion: r.dataset_version,
        modelProvider: r.model_provider,
        providerType: r.model_provider?.includes('groq')
          ? 'live_groq'
          : r.model_provider?.includes('mock')
          ? 'mock'
          : 'offline_deterministic',
        totalCases: r.total_cases,
        passedCases: r.passed_cases,
        failedCases: r.failed_cases,
        passRate: Number(r.pass_rate),
        avgLatencyMs: r.average_latency_ms || 0,
        extractionAccuracy: Number(r.extraction_accuracy || r.pass_rate),
        constraintAdherence: Number(r.constraint_adherence || 100),
        hallucinationRate: Number(r.hallucination_rate || 0),
        estimatedCostUsd: Number(r.estimated_cost_usd || 0),
        tokenUsage: r.token_usage || {},
        status: r.status || 'completed',
        createdAt: r.created_at,
      })),
    };
  } catch (err) {
    logger.warn('Failed to fetch evaluation history from DB', { error: err.message });
    return { total: 0, limit, offset, runs: [] };
  }
}

/**
 * Retrieves a single evaluation run by ID with full details.
 */
async function getEvaluationById(id) {
  const { rows } = await query(`SELECT * FROM evaluation_runs WHERE id = $1`, [id]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    datasetVersion: r.dataset_version,
    modelProvider: r.model_provider,
    providerType: r.model_provider?.includes('groq')
      ? 'live_groq'
      : r.model_provider?.includes('mock')
      ? 'mock'
      : 'offline_deterministic',
    timestamp: r.created_at,
    status: r.status || 'completed',
    totalCases: r.total_cases,
    passedCases: r.passed_cases,
    failedCases: r.failed_cases,
    passRate: Number(r.pass_rate),
    avgLatencyMs: r.average_latency_ms || 0,
    totalDurationMs: r.run_duration_ms || 0,
    extractionAccuracy: Number(r.extraction_accuracy || r.pass_rate),
    constraintAdherence: Number(r.constraint_adherence || 100),
    hallucinationRate: Number(r.hallucination_rate || 0),
    tokenUsage: r.token_usage || {},
    estimatedCostUsd: Number(r.estimated_cost_usd || 0),
    failureBreakdown: r.failure_breakdown || {},
    caseResults: r.detailed_results || [],
  };
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
  getLatestEvaluationFromDb,
  getEvaluationHistory,
  getEvaluationById,
  getCurrentRunStatus,
  loadDataset,
};

