# Product Requirements Document (PRD): AI FlightWise

**Product Name:** AI FlightWise  
**Tagline:** Smarter Flights. Better Decisions.  
**Product Category:** AI-Powered Flight Decision Platform  
**Target Roles:** Software Product Manager (SPM), Associate Product Manager (APM), AI Product Manager (AI-PM) Portfolio Artifact  
**Status:** Implemented & Verified Baseline (v1.0)  
**Last Updated:** October 2026  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem
Traditional flight search engines (Google Flights, Skyscanner, Kayak) present users with an overwhelming, undifferentiated list of hundreds of flight combinations. Users are left to manually decipher complex trade-offs between:
- Ticket price vs. ground transfer costs
- Short flight duration vs. grueling layovers
- Primary hub airports vs. budget regional airports
- Hidden destination living costs vs. upfront flight savings

Travelers, especially budget-conscious travelers, solo explorers, students, and international tourists visiting multiple cities, experience **decision paralysis**. They frequently choose suboptimal routes (e.g., saving ₹2,000 on a flight only to incur a ₹4,500 train transfer from a secondary airport, or suffering an 8-hour overnight layover to save 5%).

### 1.2 The Solution
**AI FlightWise** is an AI-powered flight decision platform built to explain trade-offs rather than simply list inventory. Instead of acting as an airline booking engine, AI FlightWise provides:
1. **Decision Intelligence Matrix:** Direct, quantified comparison across Cheapest, Fastest, and Best Balanced options.
2. **Deterministic Explainability:** Clear, grounded explanations of *why* an option was selected, its distinct advantages, drawbacks, and the specific traveler persona it best suits.
3. **Aero AI:** A conversational AI partner grounded in search constraints that extracts multi-city requirements and explains itinerary trade-offs without fabricating prices or availability.
4. **Holistic Trip Context:** Multi-city circuit routing, nearby airport expansion, destination weather, attractions cost estimation, and living expenses.

---

## 2. Target Users & Personas

### Persona A: "Frugal Farhan" (Budget-Conscious Student / Solo Backpacker)
- **Age:** 19–26
- **Needs:** Maximum rupee savings; willing to take 1 layover or use a regional airport if total cost is significantly lower.
- **Pain Point:** Hidden transit fees and surprise costs making "cheap" flights expensive in reality.
- **Primary Goal:** Identify the true lowest-cost itinerary with transparent trade-offs.

### Persona B: "Corporate Chetna" (Time-Constrained Professional)
- **Age:** 28–45
- **Needs:** Fastest transit time, non-stop preferred, departing from primary international hubs.
- **Pain Point:** Wasting hours sifting through itineraries with inconvenient 4-hour layovers.
- **Primary Goal:** Quick verification of the fastest route and whether paying extra is justified.

### Persona C: "Curious Kabir" (Multi-City International Tourist)
- **Age:** 24–38
- **Needs:** Planning a trip across 2–4 European or Asian destinations (e.g., Delhi → Paris → Rome → Delhi).
- **Pain Point:** Searching multiple one-way legs across different tabs and manually optimizing order.
- **Primary Goal:** Automated circuit optimization with connected legs and destination activity estimates.

---

## 3. Product Goals & Non-Goals

### 3.1 Product Goals
- **Explainability Over Inventory:** Provide clear, deterministic trade-off explanations for 100% of generated recommendations.
- **Decision Speed:** Enable users to evaluate the trade-offs between Cheapest, Fastest, and Balanced in under 10 seconds via the Decision Intelligence Matrix.
- **AI Reliability:** Guarantee structured parameter extraction with zero halluncinated flight prices, dates, or airline schedules.
- **User Trust:** Clearly label mock provider data, estimates, and unavailable external services.
- **Continuous Feedback:** Provide a friction-free feedback mechanism on recommendations to capture user intent and model misses.

### 3.2 Non-Goals
- **Live Airline Booking & Ticketing:** AI FlightWise is a planning and decision-making platform, not a ticketing agency. Live ticketing is explicitly out of scope.
- **Inventory Aggregator:** Not competing to aggregate every regional carrier; focuses on decision algorithms over raw catalog size.
- **Real-Time Price Alert Scraping:** No unverified background scrapers claiming price alert guarantees without live provider agreements.

---

## 4. User Stories & Acceptance Criteria

### US-1: Trade-off Comparison
- **As a** traveler comparing recommendations,  
- **I want to** see a side-by-side trade-off matrix comparing the Cheapest, Fastest, and Best Balanced options,  
- **So that I can** immediately understand what I gain and sacrifice with each choice.
- **Acceptance Criteria:**
  - Displays total price, total duration, layovers, and airport type for each category.
  - Generates quantified time and price differences (e.g., "Saves ₹7,000 but adds 3h 15m").
  - Identifies which traveler persona each option best suits.
  - Accessible via responsive matrix card on desktop and mobile.

### US-2: Grounded Recommendation Explanations
- **As a** user reviewing an individual recommendation card,  
- **I want to** see specific advantages and disadvantages for that specific flight,  
- **So that I can** validate whether it aligns with my personal preferences.
- **Acceptance Criteria:**
  - Distinct "Key Advantages" (emerald pills) and "Trade-offs to Consider" (amber pills).
  - Advantages/disadvantages must be derived from actual offer fields (stops, airport primary flag, price diff).
  - Zero fabricated comparisons.

### US-3: Recommendation Feedback
- **As a** traveler evaluating a recommendation,  
- **I want to** vote whether it was helpful or not, and specify reasons if it was unhelpful,  
- **So that** the product team can understand recommendation shortcomings.
- **Acceptance Criteria:**
  - "Was this helpful? [Helpful] [Not helpful]" interactive control.
  - If unhelpful: provides tag selector (`Price too high`, `Travel time too long`, `Layover inconvenient`, `Inconvenient airport`, `Did not match preferences`, `Other`) and optional 500-char comment box.
  - Duplicate clicks prevented on client and server (429 status with `DUPLICATE_FEEDBACK`).
  - Graceful fallback when database is in local/mock mode.

### US-4: AI Quality Evaluation Dashboard
- **As a** Product Manager or Engineer,  
- **I want to** view live pass rates and latency benchmarks across standardized travel scenarios,  
- **So that I can** objectively evaluate AI extraction performance and prevent regressions.
- **Acceptance Criteria:**
  - Internal dashboard at `/evaluations`.
  - Displays pass rate %, average latency ms, total cases, and failure taxonomy breakdown.
  - Interactive "Run Benchmark Now" button triggering the runner.
  - Expandable case-by-case view with prompt, expected vs extracted fields, and assertion failures.

---

## 5. Functional & Technical Requirements

### 5.1 Architecture & Stack
- **Frontend:** Next.js 14 App Router, Vanilla CSS + Tailwind utilities, TanStack React Query v5, Lucide React icons.
- **Backend:** Express.js, Node.js, PostgreSQL with raw parameterized SQL (no ORM overhead).
- **Optimizer Engine:** Multi-stage pipeline: Airport Expansion → Permutation Generation → Flight Fetch Stage → Pruning → Scoring → Decision Explainability.
- **AI Module:** Groq / Anthropic structured output extraction with strict JSON schema and deterministic fallback.

### 5.2 Non-Functional Requirements
- **Performance:** Recommendation optimization latency < 1.5s for standard searches; evaluation benchmark < 100ms per case in baseline mode.
- **Privacy & Security:** Zero PII logged to analytics or Sentry; sanitized query params; parameterized SQL preventing SQL injection; JWT access & refresh tokens.
- **Reliability:** Graceful fallbacks when optional third-party integrations (places, weather, AI) lack live API keys.

---

## 6. Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **LLM Hallucination** | High | LLM is restricted to conversational parsing; search scoring and decision trade-offs are 100% deterministic template-based calculations. |
| **Rate Limits on External Flight APIs** | Medium | Multi-tier caching (in-memory + PostgreSQL TTL cache); early-break batching in optimizer stops querying once valid recommendations are found. |
| **User Confusion on Booking** | Medium | Explicit UI disclaimers: "Flight planning & decision platform — live booking is simulated." |
| **Database Downtime in Local Mode** | Low | Server-side in-memory fallbacks ensure core optimization, analytics, and evaluations run seamlessly without blocking tests. |
