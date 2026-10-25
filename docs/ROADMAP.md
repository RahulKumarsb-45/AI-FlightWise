# Strategic Product Roadmap: AI FlightWise

**Product:** AI FlightWise (Smarter Flights. Better Decisions.)  
**Time Horizon:** 2026 – 2027  
**Status:** Living Product Document  

---

## 1. Product Vision & Phasing Strategy

AI FlightWise evolves in distinct, value-accretive horizons:
1. **Horizon 1 (MVP & Baseline):** Core flight optimizer, multi-country circuits, and flexible dates. *(Completed & Stabilized)*
2. **Horizon 2 (Decision Intelligence & Trust):** Deterministic trade-off comparison, recommendation feedback, and AI quality evaluation. *(Implemented in v1.0)*
3. **Horizon 3 (Total Journey Intelligence):** Ground transfer integration, baggage transparency, and conversational context memory. *(Next Milestone)*
4. **Horizon 4 (Collaborative Decision Planning):** Multi-traveler voting, group budget reconciliation, and multi-modal routing. *(Future Horizon)*

```
[ Horizon 1: Baseline ] ──► [ Horizon 2: Decision Intel ] ──► [ Horizon 3: Total Journey ] ──► [ Horizon 4: Collaborative ]
   • Multi-country perm        • Trade-off Matrix Card          • Ground Transfer Costs          • Group trip voting
   • Airport expansion         • Advantage/Tradeoff Pills       • Baggage Fee Estimator          • Multi-modal transit
   • Flexible date search      • Recommendation Feedback        • Contextual Copilot memory      • Calendar integration
   • Static budget insight     • AI Evaluation Benchmark        • Saved Trip price tracking      • Shared expense split
```

---

## 2. Release Milestones & Feature Breakdown

### Phase 1: MVP & Optimizer Core (Completed & Verified)
- [x] Multi-country connected flight routing with N! permutation generation.
- [x] Nearby airport expansion (primary vs regional hubs).
- [x] Flexible travel date pairing (+/- 3 days window).
- [x] Initial budget breakdown estimator and Indian Rupee (INR) localization.
- [x] Comprehensive backend unit test suite stabilization (305/305 unit tests passing).

### Phase 2: Decision Intelligence, Feedback & AI Evaluation (Current Release - v1.0)
- [x] **Decision Intelligence Matrix:** Side-by-side trade-off comparison between Cheapest, Fastest, and Best Balanced options.
- [x] **Deterministic Explainability:** Structured advantages, disadvantages, and persona suitability generated from actual candidate data.
- [x] **Recommendation Feedback Telemetry:** Thumbs up/down with negative reason taxonomy and duplicate submission prevention.
- [x] **AI Quality Evaluation Framework:** Version-controlled synthetic benchmark suite (`evalDataset.json`), latency logging, and public internal dashboard at `/evaluations`.
- [x] **A/B Experimentation Engine:** Lightweight client-side framework with stable anonymous session hashing and telemetry tracking.

### Phase 3: Total Journey Intelligence (Target: Q1 2027 - v1.1)
- [ ] **Secondary Airport Transfer Cost Modeling:** Automatically add estimated ground transit fares (e.g., London Stansted to Central London) to the net itinerary cost.
- [ ] **Baggage Fee Transparency:** Flag low-cost carriers (LCCs) that exclude carry-on luggage, recalculating real out-of-pocket costs.
- [ ] **Contextual Copilot Trip Refinements:** Enable FlightWise Copilot to directly modify search filters (e.g., "Exclude layovers over 3 hours") via conversational actions.
- [ ] **Trip Price Change Indicators:** Visual historical volatility badges indicating whether current fares represent typical or elevated pricing.

### Phase 4: Collaborative & Multi-Modal Planning (Target: Q2–Q3 2027 - v2.0)
- [ ] **Collaborative Group Itineraries:** Enable multiple travelers to vote on preferred flight trade-offs within a shared trip workspace.
- [ ] **Multi-Modal Route Stitching:** Seamlessly combine train legs (e.g., Eurostar Paris → London) with international long-haul flights.
- [ ] **Calendar & Hotel Sync:** Export confirmed itineraries directly into Google Calendar and Apple Wallet formats.

---

## 3. Resource Allocation & Governance
- **Engineering / AI (60%):** Optimization algorithms, evaluation dataset maintenance, and provider integrations.
- **Product & Design (25%):** Decision matrix UX, user research interviews, and telemetry funnel optimization.
- **QA & Reliability (15%):** Synthetic regression testing, latency optimization, and automated security scans.
