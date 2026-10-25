# Product Experimentation Plan: Recommendation Presentation

**Experiment Name:** `recommendation_presentation`  
**Product:** AI FlightWise (Smarter Flights. Better Decisions.)  
**Experiment Owner:** Product Management  
**Status:** Implemented in Codebase (Live Capability via `lib/experiment.js`)  
**Target Window:** 4 Weeks Post-Launch (Target Sample: N = 2,000 Completed Searches)  

---

## 1. Problem Statement & Background

User research indicates that flight searchers suffer from cognitive overload when presented with a standard list of multiple recommendation cards. Users often fail to recognize that the second or third card might offer a vastly superior flight duration for only a minor incremental cost.

---

## 2. Experiment Hypothesis

> **Hypothesis:**  
> If we present users with a prominent **Side-by-Side Trade-off Decision Matrix** comparing the Cheapest, Fastest, and Best Balanced options at the top of the search results,  
> **Then** users will experience higher decision confidence, resulting in a **+15% increase in high-intent decision actions** (trips saved, shared, or exported) without increasing bounce rate.

---

## 3. Experiment Variants

```
[ Control (A): Standard Recommendations List ]
  - Top category summary pills
  - Stacked individual recommendation cards
  - Standard flight details expansion

[ Variant (B): Trade-off Decision Matrix First ]
  - Prominent TradeoffMatrixCard rendered before individual cards
  - Side-by-side comparison across Price, Duration, Layovers, Airport Type, Persona
  - Quantified trade-off highlights ("Saves ₹7,000 for 3h more")
  - Quick-jump interaction to corresponding flight details
```

---

## 4. Metrics Framework

### 4.1 Primary Success Metric
- **Decided Itinerary Rate (DIR):**
  $$\text{DIR} = \frac{\text{Sessions with (Itinerary Saved } \lor \text{ Shared } \lor \text{ Exported)}}{\text{Total Results Viewed Sessions}} \times 100$$
- **Expected Lift:** +15% relative improvement (e.g., from 12.0% baseline to 13.8%).

### 4.2 Secondary Metrics
- **Recommendation Feedback Submission Rate:** % of users submitting helpful/unhelpful votes on recommendations.
- **Trade-off Exploration Rate:** % of sessions where users click or inspect trade-off matrix items (`tradeoff_compared`).

### 4.3 Guardrail Metrics (Do No Harm)
- **Results Page Bounce Rate:** % of sessions where users leave within 5 seconds without scrolling or clicking. *Constraint: Must not increase by >2.0 percentage points.*
- **Time to First Interaction:** Average seconds from results load to first click. *Constraint: Must remain under 8 seconds.*

---

## 5. Eligibility, Assignment & Delivery

### 5.1 Eligibility
- All visitors (both authenticated users and anonymous guests) who execute a flight search and successfully receive ≥ 2 flight recommendations.

### 5.2 Assignment Mechanism
- **Deterministic Hash:** Anonymous sessions are assigned via a client-side hash (`flightwise_anon_id` stored in `localStorage`) mapped uniformly across a 50/50 distribution.
- **Sticky Assignment:** A returning user or session retains their assigned variant across repeat searches to prevent jarring UI shifts.
- **QA Override:** Developers and reviewers can force a variant via URL parameter:
  - `?exp_tradeoff=control`
  - `?exp_tradeoff=variant_matrix`

### 5.3 Telemetry & Event Logging
- On variant exposure, the platform automatically fires:
  ```json
  {
    "event": "experiment_assigned",
    "params": {
      "experiment_name": "recommendation_presentation",
      "variant_id": "variant_matrix"
    }
  }
  ```

---

## 6. Sample Size & Statistical Analysis Plan

- **Minimum Detectable Effect (MDE):** 15% relative lift on a 12% baseline conversion.
- **Statistical Significance Level ($\alpha$):** 0.05 (95% confidence).
- **Statistical Power ($1 - \beta$):** 0.80 (80% power).
- **Required Sample Size:** ~1,000 unique sessions per variant (~2,000 total eligible sessions).
- **Decision Rule:**
  - If Variant B achieves statistically significant lift on DIR ($p < 0.05$) without violating guardrails, roll out Variant B to 100% of traffic.
  - If no significant difference is detected after 4 weeks, retain Variant B if user feedback sentiment is higher; otherwise revert to Control to minimize visual clutter.

---

## 7. Known Limitations & Threats to Validity
1. **Simulated Booking Proxy:** Because live ticketing is simulated, the primary metric uses proxy actions (Save, Share, Export) rather than direct revenue conversion.
2. **Device Disparities:** The horizontal matrix format delivers higher visual impact on desktop viewports than on compact mobile devices; mobile results will be segmented during analysis.
