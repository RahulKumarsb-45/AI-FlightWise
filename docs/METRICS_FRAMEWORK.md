# Product Metrics Framework: AI FlightWise

**Product:** AI FlightWise (Smarter Flights. Better Decisions.)  
**Category:** Product Analytics & Decision Science  
**Status:** Active Instrumentation & Framework Definition  
**Target Roles:** SPM, APM, AI-PM Portfolio Artifact  

---

## 1. Metric Hierarchy

```
                            [ North Star Metric (NSM) ]
                 Decided Itineraries (Saved, Shared, or Exported)
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
  [ Acquisition & Funnel ]    [ Engagement & Trade-offs ]    [ AI Quality & Trust ]
   - Search Submitted Rate      - Trade-off Matrix Compare     - Extraction Pass Rate
   - Search-to-Results Conv     - Feedback Submission Rate     - Provider Latency (P95)
   - Results-to-Expanded        - Helpful Feedback %           - Hallucination Rate (0%)
```

---

## 2. North Star Metric (NSM)

### **Primary Proposal:** "Decided Itineraries per Active Traveler" (DIT)
- **Definition:** The number of unique flight search journeys where a user completes a high-intent decision action:
  $$\text{DIT} = \text{Unique Sessions with } (\text{Itinerary Saved} \lor \text{Itinerary Shared} \lor \text{PDF Exported})$$
- **Why this metric matters:** Because AI FlightWise is a **decision platform**, user success is not measured by raw searches or ad clicks, but by whether the platform provided sufficient clarity for the traveler to make a decision and preserve/share the itinerary.
- **Counter / Guardrail Metric:** **Search Churn Rate** (% of users executing >5 consecutive searches within 10 minutes without saving or expanding any option, indicating frustration or unmet criteria).

---

## 3. Product Funnel & Milestone Definitions

```
[ Step 1: Search Submitted ] (search_submitted)
             │
             ▼  (Target: >95% success rate)
[ Step 2: Results Viewed ] (results_viewed)
             │
             ▼  (Target: >60% exploration rate)
[ Step 3: Recommendation Explored ] (recommendation_expanded)
             │
             ▼  (Target: >35% trade-off comparison rate)
[ Step 4: Trade-off Compared ] (tradeoff_compared)
             │
             ▼  (Target: >15% high-intent decision rate)
[ Step 5: Itinerary Decided ] (itinerary_saved ∨ itinerary_shared ∨ itinerary_exported)
```

### Detailed Event Schema & Calculation Rules:

| Funnel Stage | Telemetry Event | Trigger Condition | Calculation Methodology |
| :--- | :--- | :--- | :--- |
| **1. Search Submitted** | `search_submitted` | User clicks "Search Flights" on `/search` or sends search via Copilot. | Denominator of top-of-funnel conversion. |
| **2. Results Viewed** | `results_viewed` | Optimization succeeds and results page renders ≥ 1 recommendation. | `(Results Viewed / Search Submitted) × 100` |
| **3. Recommendation Explored** | `recommendation_expanded` | User clicks "Show flight details" on any recommendation card. | `(Recommendations Explored / Results Viewed) × 100` |
| **4. Trade-off Compared** | `tradeoff_compared` | User clicks an option inside the TradeoffMatrixCard or toggles category comparison. | `(Trade-offs Compared / Results Viewed) × 100` |
| **5. Itinerary Decided** | `itinerary_saved` / `itinerary_shared` / `itinerary_exported` | User saves trip to dashboard, generates a public share link, or downloads PDF. | `(Decided Itineraries / Results Viewed) × 100` |

---

## 4. Feature-Level Product Metrics

### 4.1 Recommendation Feedback Rate & Quality
- **Metric:** `Feedback Submission Rate` = $(\text{Total Feedback Events} / \text{Results Viewed}) \times 100$
- **Target:** 5% – 8% across all active sessions.
- **Metric:** `Recommendation Helpful Ratio (RHR)` = $(\text{Helpful Votes} / \text{Total Votes}) \times 100$
- **Target:** ≥ 80% positive sentiment.
- **Unhelpful Reason Breakdown:** Tracks % distribution of negative reasons (`price_too_high`, `duration_too_long`, `layover_inconvenient`, `wrong_airport`, `mismatch_preferences`).
  - *Action Threshold:* If `layover_inconvenient` exceeds 30% of negative feedback, tighten the pruning stage duration ceiling.

### 4.2 Aero AI Metrics
- **Aero AI Message Volume:** Count of `copilot_message_sent` (telemetry event).
- **Search Parameter Extraction Rate:** % of conversational messages where structured destination, date, or budget parameters are parsed into actionable searches.
- **Conversation Completion Rate:** % of chat conversations that result in a navigation to `/results`.

---

## 5. AI Quality & Reliability Metrics

These metrics are continuously monitored via the version-controlled evaluation suite (`backend/src/evaluation`):

| Metric | Target | Measurement Method | Failure Action |
| :--- | :---: | :--- | :--- |
| **Structured Extraction Accuracy** | ≥ 95% | Deterministic field matching against ground-truth dataset (`evalDataset.json`). | Retrain extraction prompt schema. |
| **Constraint Adherence Rate** | 100% | Validates that extracted budget & preferences never violate user input bounds. | Reject invalid extraction, trigger deterministic fallback. |
| **Evaluation Latency (P95)** | < 800ms | Measured execution duration per synthetic test scenario. | Optimize prompt token length and model inference endpoint. |
| **AI Hallucination Rate** | 0.0% | Explanations and prices must match candidate records exactly. | Hardcoded assertion guard; block non-deterministic price fabrication. |

---

## 6. Metric Limitations & Boundary Conditions
1. **No Live Booking Telemetry:** Because live airline ticketing is out of scope by design, traditional OTA metrics such as Gross Booking Value (GBV) and Take Rate are intentionally replaced by **Decision Velocity** and **Itinerary Preservation**.
2. **Guest vs. Authenticated Sessions:** Guest users cannot save trips to a persistent dashboard; therefore, **Share Link Generation** and **PDF Exports** serve as primary proxy signals for guest decision confidence.
3. **Missing Data Handling:** If a user drops off during search execution (e.g., closing the tab while the optimizer is in-flight), the session is flagged as `search_abandoned` and excluded from the downstream decision funnel.
