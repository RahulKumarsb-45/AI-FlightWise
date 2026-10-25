# AI FlightWise — Smarter Flights. Better Decisions.

**AI FlightWise** is a full-stack, AI-powered flight decision platform designed to help travelers make confident, transparent travel decisions. Rather than merely presenting an overwhelming list of flight inventory, AI FlightWise explains the trade-offs between ticket price, travel time, layovers, airport convenience, and destination living costs.

This project is built as a production-minded portfolio application demonstrating **Software Product Management (SPM), Associate Product Management (APM), and AI Product Management (AI-PM)** practices alongside full-stack engineering excellence.

---

## What It Actually Does

Give it an origin airport, 1–4 destination countries, departure/return dates, and travel preferences, and the platform:

1. **Nearby-Airport Expansion:** Evaluates nearby secondary airports (up to ~300km) to identify significant airfare savings.
2. **Flexible Date Permutations:** Checks ±3 days window to surface lower off-peak fares.
3. **Multi-Country Circuit Sequencing:** Automatically computes $N!$ route combinations (e.g., `DEL → LHR → CDG → DEL` vs `DEL → CDG → LHR → DEL`) to find the most efficient circuit.
4. **Early-Break Optimization:** Fetches candidate legs in batches, halting queries once sufficient recommendations are satisfied to conserve provider API quota.
5. **Intelligent Pruning & Scoring:** Eliminates extreme layovers, excessive duration outliers, and over-budget options; scores remainder on price, speed, and stops.
6. **Decision Intelligence Matrix:** Generates side-by-side trade-off comparisons across **Cheapest**, **Fastest**, and **Best Balanced** options.
7. **Grounded Explainability:** Deterministically explains *why* each option was selected, its concrete advantages, compromises, and which traveler persona it best suits.
8. **FlightWise Copilot:** Conversational assistant that extracts structured multi-city search parameters without hallucinating prices or schedules.
9. **Recommendation Feedback:** In-app telemetry allowing travelers to vote on recommendation quality and categorize negative issues.
10. **AI Quality & Evaluation Dashboard:** Standardized benchmark suite (`/evaluations`) with ground-truth assertions, failure taxonomies, and latency tracking.

---

## Tech Stack & Architecture

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Vanilla CSS + Tailwind utilities, TanStack React Query v5, Lucide Icons, installable PWA (Service Worker) |
| **Backend** | Node.js, Express.js, PostgreSQL (raw parameterized SQL, no ORM), optional Redis L1 cache, JWT authentication |
| **AI Layer** | Groq / Anthropic structured output extraction, FlightWise Copilot, deterministic fallback parser |
| **Decision Engine**| Custom multi-stage optimizer: Expansion → Permutations → Fetch → Prune → Score → Explainability |
| **Evaluation** | Automated synthetic benchmark harness (`backend/src/evaluation`), version-controlled test dataset (`evalDataset.json`) |
| **Analytics & Telemetry**| Privacy-first Google Analytics 4 choke point (zero PII), Sentry error monitoring, recommendation feedback API |
| **Testing** | Node test runner (`node --test`), Jest, Supertest, React Testing Library |

---

## Project Structure

```
AI FlightWise/
├── backend/
│   ├── src/
│   │   ├── cache/            # MemoryCache (L0) and Redis (L1) caching layers
│   │   ├── controllers/      # Express route controllers (auth, trips, feedback, eval)
│   │   ├── database/         # PostgreSQL schema.sql, pool.js, migrate.js
│   │   ├── evaluation/       # Benchmark runner (evalRunner.js) & dataset (evalDataset.json)
│   │   ├── middleware/       # JWT auth, optionalAuth, error handler
│   │   ├── optimizer/        # Permutations, pruning, scoring, explainability
│   │   ├── providers/        # Flight (mock/Amadeus/Ignav), airport, weather, places
│   │   ├── routes/           # REST endpoints
│   │   └── validators/       # express-validator request schemas
│   └── tests/
│       └── unit/             # 26 Jest unit test suites + Node test suite
├── frontend/
│   ├── app/                  # Next.js App Router pages (search, results, evaluations, pwa)
│   ├── components/           # UI components (results, landing, trips, feedback, matrix)
│   ├── hooks/                # React hooks (auth, toast, media queries)
│   ├── lib/                  # Analytics choke point, A/B experiment framework, QueryProvider
│   ├── services/             # Frontend API client modules (trip, feedback, eval, places)
│   └── utils/                # Date formatting, expense calculator, currency helpers
└── docs/                     # Comprehensive Product Management & Engineering artifacts
    ├── PRD.md                # Product Requirements Document
    ├── USER_RESEARCH.md      # Research plan, hypotheses, and interview guide
    ├── COMPETITOR_ANALYSIS.md# Google Flights, Skyscanner, Hopper, Rome2rio comparison
    ├── METRICS_FRAMEWORK.md  # North Star Metric, activation, and funnel definitions
    ├── RICE_PRIORITIZATION.md# Prioritization matrix with justified assumptions
    ├── ROADMAP.md            # Strategic horizons and feature releases
    ├── EXPERIMENT_PLAN.md    # Recommendation presentation A/B test plan
    ├── AI_EVALUATION.md      # Ground-truth evaluation methodology & benchmark report
    ├── ARCHITECTURE.md       # Full system architecture and security considerations
    └── CASE_STUDY.md         # Product Management portfolio case study
```

---

## Getting Started Locally

### Prerequisites
- **Node.js:** v18.x or v20.x recommended
- **npm:** v9.x or higher
- **PostgreSQL (Optional for local dev):** The application runs out of the box with in-memory fallbacks and mock flight data when no live database is configured.

### 1. Clone & Setup Workspace
```bash
cd "C:\Users\kumar\Desktop\AI FlightWise"
```

### 2. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
npm run dev
# Backend starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
copy .env.example .env.local
npm run dev
# Frontend starts on http://localhost:3000
```

---

## Running Automated Tests

All tests are designed to run isolated from external networks and live databases.

### 1. Backend Node Tests
```bash
cd backend
npm run test:node
# 11 tests passing (share trip token entropy, idempotency, security boundaries)
```

### 2. Backend Jest Unit Tests
```bash
cd backend
npx jest tests/unit --runInBand --globalSetup=""
# 320 tests passing across 26 test suites
```

### 3. Frontend Test Suite
```bash
cd frontend
npm test
# 140 tests passing (components, decision cards, timeline, calculator, experiment)
```

### 4. AI Quality Benchmark Evaluation
```bash
cd backend
node src/evaluation/evalRunner.js
# Runs the 12-scenario synthetic benchmark suite and outputs pass rate & latency
```

---

## Product Management Artifacts

Explore the [`docs/`](docs/) directory for detailed portfolio documentation:
- [**Product Requirements Document (PRD)**](docs/PRD.md)
- [**User Research Strategy & Hypotheses**](docs/USER_RESEARCH.md)
- [**Competitor Analysis Matrix**](docs/COMPETITOR_ANALYSIS.md)
- [**Product Metrics & Telemetry Funnel**](docs/METRICS_FRAMEWORK.md)
- [**RICE Feature Prioritization**](docs/RICE_PRIORITIZATION.md)
- [**Product Roadmap (2026–2027)**](docs/ROADMAP.md)
- [**A/B Experimentation Plan**](docs/EXPERIMENT_PLAN.md)
- [**AI Evaluation Benchmark Report**](docs/AI_EVALUATION.md)
- [**System Architecture & Security Boundaries**](docs/ARCHITECTURE.md)
- [**Product Management Case Study**](docs/CASE_STUDY.md)

---

## Security & Privacy Commitment

1. **Zero Hardcoded Credentials:** All API keys and secrets reside in environment variables and are excluded via `.gitignore`.
2. **Strict Sanitization:** Client-side analytics and server-side Sentry loggers pass outbound payloads through sanitization choke points that strip emails, tokens, cookies, and payment details.
3. **No Database Destruction:** Database migrations are strictly additive and backward-compatible.
4. **Deterministic Accuracy:** Live flight availability and booking are clearly disclaimed as simulated; decision comparisons use strictly grounded candidate deltas.

---

## License

MIT License. Designed and developed for demonstration and portfolio review.
