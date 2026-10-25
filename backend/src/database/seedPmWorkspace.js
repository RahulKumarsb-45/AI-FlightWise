const { pool, query } = require('./pool');
const { v4: uuidv4 } = require('uuid');

async function seedPmWorkspace() {
  console.log('[seedPm] Seeding Product Management workspace demonstration data...');

  // 1. Initial A/B Experiment
  await query(`
    INSERT INTO experiments (
      id, name, description, hypothesis, status, control_variant, variants,
      primary_metric, guardrail_metrics, eligibility_rules, start_date
    ) VALUES (
      'flight_recommendation_tradeoffs',
      'Flight Recommendation Explainability & Trade-Offs',
      'Compares standard flight recommendations against an enriched experience displaying explicit price vs duration trade-offs.',
      'Showing explicit trade-offs and rationale on flight cards will increase recommendation selection rate by at least 15% due to reduced decision hesitation.',
      'active',
      'control',
      '["control", "variant_tradeoffs"]'::jsonb,
      'recommendation_selected',
      '["p95_latency_ms", "checkout_dropoff_rate"]'::jsonb,
      '{"minTravelers": 1}'::jsonb,
      now() - interval '14 days'
    ) ON CONFLICT (id) DO UPDATE SET status = 'active'
  `);

  // 2. Initial PRD
  const prdId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const prdMarkdown = `# PRD: Flight Recommendation Explainability & Trade-Offs

## 1. Problem Statement
Travelers frequently face difficulty evaluating multi-leg itineraries when flight options involve complex trade-offs between ticket price, flight duration, and layover inconvenience.
Users need clear decision intelligence that explains why a recommended route is optimal for their specific constraints.

## 2. Target User Personas
- **Price-Sensitive Explorer**: Prioritizes minimum fare, willing to accept reasonable 1-stop layovers (<3 hours).
- **Time-Constrained Business Traveler**: Requires fastest non-stop or guaranteed priority connections; low price sensitivity.
- **Circuit Vacationer**: Multi-city international traveler planning circuits across multiple countries (e.g. UK + France + Germany).

## 3. Evidence & Research Findings
- Telemetry shows high drop-off on results page before trip bookmarking.
- Customer feedback highlights anxiety around hidden layover durations and fare differences.

## 4. Goals & Non-Goals
### Goals:
- Deliver transparent, explainable flight recommendation rationale on every search result.
- Increase Search-to-Save conversion rate from current baseline by +15%.
- Reduce decision hesitation time on flight results page by 25%.

### Non-Goals:
- Direct ticket issuance or PNR settlement (booking redirects through certified travel partners).

## 5. Proposed Solution
Implement an explainability intelligence overlay that displays:
1. **Trade-Off Badge**: Explicitly states "Saves ₹4,200 vs Non-stop" or "3h Faster for +₹1,800".
2. **Confidence Score**: Quantitative score (0-100%) indicating how well the itinerary matches stated user preferences.
3. **Airport Hub Alternative**: Suggests nearby departure hubs if savings exceed ₹5,000.

## 6. Functional Requirements
- **FR-1**: Backend must compute delta price and duration against fastest and cheapest candidates.
- **FR-2**: Frontend card must render interactive trade-off badge without layout shift.
- **FR-3**: Telemetry must fire recommendation_selected event with trade-off parameters on click.

## 7. Rollout & Experiment Plan
- Run 50/50 A/B experiment (flight_recommendation_tradeoffs) for 14 days or minimum 500 sessions per variant.
`;

  await query(`
    INSERT INTO prds (
      id, title, status, problem_statement, target_users, solution, raw_markdown, created_at
    ) VALUES (
      $1,
      'Flight Recommendation Explainability & Trade-Offs',
      'in_review',
      'Travelers face cognitive overload evaluating price vs duration trade-offs in search results.',
      'Budget travelers, business travelers, and multi-destination vacationers.',
      'Explainability overlay badges detailing exact savings, time trade-offs, and stop efficiency.',
      $2,
      now() - interval '10 days'
    ) ON CONFLICT (id) DO NOTHING
  `, [prdId, prdMarkdown]);

  // 3. Customer Feedback Records
  const feedbackItems = [
    {
      category: 'flight_search',
      theme: 'price_transparency',
      sentiment: 'negative',
      severity: 'high',
      comment: 'It was hard to tell why the first flight was recommended over the second one when the price difference was only ₹800 but saved 4 hours of layover.',
    },
    {
      category: 'flight_search',
      theme: 'layover_fatigue',
      sentiment: 'negative',
      severity: 'medium',
      comment: 'A 7-hour overnight layover in Doha was suggested as the balanced option, but as a family with 2 kids that is a dealbreaker.',
    },
    {
      category: 'pricing',
      theme: 'booking_redirect_clarity',
      sentiment: 'neutral',
      severity: 'low',
      comment: 'Clear indications of which airline partner handles the booking redirect before leaving AI FlightWise would build more trust.',
    },
    {
      category: 'ai_agent',
      theme: 'prompt_precision',
      sentiment: 'positive',
      severity: 'low',
      comment: 'The natural language prompt parsed my multi-city trip to France, Germany and Italy on specific dates seamlessly!',
    },
    {
      category: 'flight_search',
      theme: 'flexible_dates',
      sentiment: 'neutral',
      severity: 'medium',
      comment: 'I wish the search showed a +/- 3 day fare calendar matrix so I could see if shifting my departure by one day saved money.',
    },
    {
      category: 'flight_search',
      theme: 'price_transparency',
      sentiment: 'positive',
      severity: 'low',
      comment: 'Loved the breakdown between airline base fare and estimated destination accommodation budget.',
    },
  ];

  for (const fb of feedbackItems) {
    await query(`
      INSERT INTO customer_feedback (
        id, category, theme, sentiment, severity, comment, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'reviewed', now() - (interval '1 day' * (1 + random() * 10)))
      ON CONFLICT DO NOTHING
    `, [uuidv4(), fb.category, fb.theme, fb.sentiment, fb.severity, fb.comment]);
  }

  // 4. Roadmap Items
  const roadmapItems = [
    {
      title: 'Flight Recommendation Trade-off Badges',
      description: 'Display quantitative price vs duration trade-offs directly on recommendation cards.',
      problemStatement: 'Users experience decision paralysis evaluating non-stop vs connecting flight options.',
      stage: 'now',
      priority: 'high',
      reach: 1400,
      impact: 2.5,
      confidence: 0.85,
      effort: 2.5,
      riceScore: 1190.0,
      owner: 'Product Lead',
      status: 'in_progress',
      linkedPrdId: prdId,
      linkedExperimentId: 'flight_recommendation_tradeoffs',
    },
    {
      title: 'Real-time Telemetry & Conversion Funnel Dashboard',
      description: 'Internal analytics dashboard visualizing search-to-payment conversion and drop-off.',
      problemStatement: 'PMs and engineers lack localized real-time visibility into user funnel behavior.',
      stage: 'now',
      priority: 'high',
      reach: 950,
      impact: 2.0,
      confidence: 0.9,
      effort: 2.0,
      riceScore: 855.0,
      owner: 'Product Lead',
      status: 'launched',
    },
    {
      title: 'Interactive Date Flexibility Matrix',
      description: '+/- 3 day calendar grid visualizing fare fluctuations across dates.',
      problemStatement: 'Flexible travelers miss cheaper flights departing 1-2 days earlier or later.',
      stage: 'next',
      priority: 'medium',
      reach: 800,
      impact: 2.0,
      confidence: 0.8,
      effort: 3.5,
      riceScore: 365.71,
      owner: 'Eng Lead',
      status: 'planned',
    },
    {
      title: 'Nearby Alternative Hub Airport Recommender',
      description: 'Automatically detects if flying out of an airport within 150km saves >₹5,000.',
      problemStatement: 'Travelers in metropolitan regions do not compare secondary hub airports.',
      stage: 'next',
      priority: 'medium',
      reach: 600,
      impact: 1.5,
      confidence: 0.75,
      effort: 3.0,
      riceScore: 225.0,
      owner: 'Product Lead',
      status: 'planned',
    },
    {
      title: 'Predictive Fare Fluctuation & Price Drop Alerts',
      description: 'Historical trend-based fare trajectory forecasting to advise users when to book.',
      problemStatement: 'Travelers hesitate to book without knowing if prices are likely to increase.',
      stage: 'later',
      priority: 'low',
      reach: 1200,
      impact: 2.0,
      confidence: 0.6,
      effort: 5.0,
      riceScore: 288.0,
      owner: 'AI Engineer',
      status: 'planned',
    },
  ];

  for (const item of roadmapItems) {
    const id = uuidv4();
    await query(`
      INSERT INTO roadmap_items (
        id, title, description, problem_statement, stage, priority,
        reach, impact, confidence, effort, rice_score, owner, status,
        linked_prd_id, linked_experiment_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, now())
      ON CONFLICT DO NOTHING
    `, [
      id,
      item.title,
      item.description,
      item.problemStatement,
      item.stage,
      item.priority,
      item.reach,
      item.impact,
      item.confidence,
      item.effort,
      item.riceScore,
      item.owner,
      item.status,
      item.linkedPrdId || null,
      item.linkedExperimentId || null,
    ]);
  }

  // 5. Product Decision Log Entries
  const decisions = [
    {
      title: 'Adopt PostgreSQL Raw SQL for Telemetry Storage Over External SaaS',
      problem: 'Need auditable, zero-dependency product analytics without introducing third-party tracking cookies or external costs.',
      evidenceConsidered: 'Benchmarked PostgreSQL JSONB query performance against Amplitude/Mixpanel REST ingestion.',
      alternatives: 'Google Analytics 4, Mixpanel, Self-hosted PostHog.',
      selectedDecision: 'Persist events directly into PostgreSQL `analytics_events` table using indexed session and timestamp keys.',
      rationale: 'Eliminates external SaaS dependency, guarantees strict GDPR compliance, and allows zero-latency relational joins with trips and user profiles.',
      expectedOutcome: 'Sub-10ms event insertion and complete conversion funnel aggregation in real time.',
      actualOutcome: 'Event recording verified with sub-5ms overhead; zero data egress costs.',
      risks: 'Database table growth over long periods; requires table partitioning beyond 10M rows.',
      owner: 'Product & Architecture Lead',
      followUpMetric: 'analytics_events_write_latency_ms',
    },
    {
      title: 'Utilize 50/50 Deterministic SHA-256 Hash Bucketing for Stable A/B Assignment',
      problem: 'Users re-running searches or refreshing pages could flap between control and variant experiences if assignment is not deterministic.',
      evidenceConsidered: 'Standard A/B testing methodologies (PlanOut, Google Optimize, LaunchDarkly).',
      alternatives: 'Client-side random cookie, server-side Redis hash, database-only lookups.',
      selectedDecision: 'Hash SHA-256(experiment_id + session_id) % 100 with persistent database backing in `experiment_assignments`.',
      rationale: 'Guarantees that a user sees the exact same variant across requests while logging reproducible exposure events.',
      expectedOutcome: 'Zero assignment flapping across browser reloads.',
      actualOutcome: 'Verified 100% deterministic variant stability in integration testing.',
      risks: 'Skew if hashing algorithm has bucket bias (SHA-256 proven uniform distribution).',
      owner: 'Product Lead',
      followUpMetric: 'variant_assignment_uniformity_ratio',
    },
    {
      title: 'Enforce Strict Explainability Badges with Quantified Trade-Offs on Recommendations',
      problem: 'Users frequently abandoned searches when presented with multiple recommendations with differing stop counts and prices.',
      evidenceConsidered: 'Feedback theme analysis showed 40% of complaints cited uncertainty regarding why a flight was recommended.',
      alternatives: 'Show only cheapest flight, show generic "Best Value" star rating.',
      selectedDecision: 'Compute explicit delta comparisons (e.g. "Saves ₹3,800 vs Non-stop" or "2h Faster for +₹1,200") on all top recommendations.',
      rationale: 'Gives users actionable decision intelligence directly relevant to their travel constraints.',
      expectedOutcome: '+15% recommendation selection rate in experiment.',
      actualOutcome: 'Active in Experiment flight_recommendation_tradeoffs.',
      risks: 'Card visual clutter on mobile screens (mitigated with compact badge design).',
      owner: 'UX & Product Lead',
      followUpMetric: 'recommendation_selection_rate',
    },
  ];

  for (const d of decisions) {
    await query(`
      INSERT INTO decision_log (
        id, title, problem, evidence_considered, alternatives,
        selected_decision, rationale, expected_outcome, actual_outcome,
        risks, owner, follow_up_metric, date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE - 5, now() - interval '5 days')
      ON CONFLICT DO NOTHING
    `, [
      uuidv4(),
      d.title,
      d.problem,
      d.evidenceConsidered,
      d.alternatives,
      d.selectedDecision,
      d.rationale,
      d.expectedOutcome,
      d.actualOutcome,
      d.risks,
      d.owner,
      d.followUpMetric,
    ]);
  }

  console.log('[seedPm] Product Management demonstration data seeded successfully.');
}

if (require.main === module) {
  seedPmWorkspace()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[seedPm] Error:', err);
      pool.end();
      process.exit(1);
    });
}

module.exports = { seedPmWorkspace };
