# Product Management Case Study: AI FlightWise

**Project:** AI FlightWise — Smarter Flights. Better Decisions.  
**Role:** Senior Full-Stack & AI Product Manager (Portfolio Case Study)  
**Timeframe:** Phase 1 (Core Baseline Stabilization) & Phase 2 (Decision Intelligence & Quality Framework)  
**Deliverable:** Production-Minded Web Application & Comprehensive PM Artifacts  

---

## 1. Problem Framing & Opportunity Discovery

### The Challenge
Flight aggregators have perfected **search speed** at the expense of **decision confidence**. While travelers can retrieve hundreds of flights in seconds, they face acute cognitive overload when attempting to evaluate the true trade-offs between:
- Ticket savings vs. long or inconvenient layovers.
- Upfront flight discounts vs. hidden airport transfer costs from regional secondary airports.
- Multi-city flight sequence complexity.

### The Opportunity
Instead of building another generic ticket-booking engine, we identified a high-value product opportunity:  
**Build an AI-powered flight decision platform that explains trade-offs, quantifies compromises, and gives travelers decision confidence.**

---

## 2. Strategic Product Decisions & Key Trade-offs

### Decision 1: Deterministic Explainability vs. Generative Free-Text
- **Decision:** All search recommendations, advantage/disadvantage bullets, and trade-off matrix calculations are computed **deterministically** through rule-based code rather than an LLM prompt.
- **Trade-off:** Sacrificed conversational variety for **100% mathematical consistency, zero latency overhead, zero API cost per search, and zero hallucinations**.
- **Result:** Explanations always match the numbers displayed on the card, building absolute user trust.

### Decision 2: Decision Intelligence Matrix vs. Infinite Scroll List
- **Decision:** Prominently feature a side-by-side comparison matrix across the top 3 category picks (Cheapest, Fastest, Best Balanced) at the top of search results.
- **Trade-off:** Adds vertical screen real estate on initial load.
- **Mitigation:** Designed a compact, responsive 3-column card layout that lets users compare price, duration, layovers, and persona suitability in a single glance.

### Decision 3: Simulation & Transparency vs. Fabricated Live Booking
- **Decision:** Transparently label live flight booking as simulated / mock data, rather than deceptively claiming live ticketing capabilities.
- **Trade-off:** Acknowledges product boundaries upfront.
- **Result:** Protects product integrity and aligns with professional PM portfolio standards.

---

## 3. Implementation Overview

### Architectural Highlights
- **Multi-Stage Optimizer Engine:**
  1. *Airport Expansion Stage:* Expands primary hubs to regional alternatives within a calibrated radius.
  2. *Permutation Generation:* Evaluates $N!$ country visit sequences for multi-destination circuits.
  3. *Early-Break Batching:* Conserves external API quota by halting permutation queries once 5 valid recommendations are secured.
  4. *Pruning & Scoring:* Filters out candidates exceeding budget or duration ceilings; normalizes scores across price, speed, and layovers.
  5. *Decision Intelligence:* Synthesizes grounded advantages and compromises.
- **Recommendation Feedback Telemetry:**
  - In-memory rate-limiting and deduplication window preventing spam clicks.
  - Granular negative reason taxonomy (`price_too_high`, `duration_too_long`, `layover_inconvenient`, `wrong_airport`, `mismatch_preferences`).
- **AI Evaluation Framework:**
  - Automated benchmark harness (`evalRunner.js`) testing 12 standardized synthetic travel scenarios against strict assertion criteria.
  - Public internal evaluation dashboard at `/evaluations`.

---

## 4. Verified Outcomes & Quality Metrics

All product components were verified through automated regression suites:

| Suite | Component Tested | Result |
| :--- | :--- | :---: |
| **Backend Node Unit Tests** | Share token entropy, idempotency, security boundaries | **11 / 11 Passed** |
| **Backend Jest Suite** | Date generation, Geoapify places, early-break optimization, Ignav concurrency/retries, decision intelligence, feedback controller, evaluation runner | **All Passed** |
| **Frontend Test Suite** | Components, places cards, timeline, expense calculator, analytics, A/B experiment framework | **140 / 140 Passed** |
| **Frontend Production Build** | Next.js 14 App Router, static generation, TypeScript/JS bundling | **100% Successful** |

---

## 5. Known Limitations & Future Horizons

### Current Limitations
1. **Live Booking:** Application simulates checkout and booking; integration with live airline ticket issuance is deferred to future commercial phases.
2. **Transfer Transit Pricing:** Regional airport transfers are currently tagged qualitatively rather than calculating exact train ticket costs in real-time.

### Next Roadmap Horizons
- **Q1 2027:** Ground transfer cost modeling for secondary airports.
- **Q2 2027:** Multi-traveler group itinerary voting and collaborative planning.
- **Q3 2027:** Multi-modal routing integrating European rail networks.
