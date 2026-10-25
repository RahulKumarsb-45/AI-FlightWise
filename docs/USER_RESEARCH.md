# User Research Plan & Discovery Framework: AI FlightWise

**Document Type:** Product Discovery & User Research Strategy  
**Product:** AI FlightWise (Smarter Flights. Better Decisions.)  
**Status:** Discovery & Hypothesis Formulation Phase  
**Research Lead:** Product Management  
**Integrity Note:** This document strictly differentiates between **unvalidated product hypotheses** and **empirically validated findings**. No customer quotes, survey percentages, or interview transcripts have been fabricated.

---

## 1. Research Objectives & Background

Flight search engines are historically optimized for **inventory retrieval** rather than **decision confidence**. While searching for flights has become fast, deciding on the best flight has become cognitively taxing.

### Primary Objectives:
1. **Identify the friction points** travelers experience when evaluating multiple flight options with varying prices, layovers, and airports.
2. **Determine how travelers perceive value** when trading transit time for monetary savings (the "value-of-time" threshold).
3. **Validate the demand for multi-city circuit planning** vs. fragmented multi-tab booking.
4. **Assess traveler receptivity to AI copilots** in travel planning (what users trust AI to do vs. what they mistrust).

---

## 2. Core Hypotheses (To Be Tested)

| ID | Hypothesis Statement | Priority | Metric to Validate |
| :--- | :--- | :--- | :--- |
| **H1** | Travelers spend >25 minutes toggling tabs between flight aggregators, maps, and transit estimators before booking because existing aggregators do not calculate hidden airport transfer costs. | High | Time-to-decision; qualitative user interview reports. |
| **H2** | Presenting a clear "Trade-off Matrix" (comparing Cheapest vs. Fastest vs. Balanced) increases user decision confidence and decreases cognitive fatigue compared to an endless ranked list. | High | A/B test feedback submission rate; recommendation expansion rate. |
| **H3** | Users are willing to fly from a secondary regional airport if the net savings exceeds ₹3,500 (~$45 USD) and the additional ground transit is explicitly estimated. | Medium | Selection rate of recommendations with `usesNearbyAirport=true`. |
| **H4** | Travelers do not trust AI to book tickets automatically, but strongly value AI synthesizing trade-offs, recommending trip order, and explaining flight drawbacks. | High | Copilot interaction completion rate; feature feedback ratings. |
| **H5** | In multi-country travel, users struggle to calculate the optimal order of visiting countries, frequently booking inefficient back-and-forth routes. | Medium | Adoption of AI FlightWise's multi-country circuit optimizer. |

---

## 3. User Research Methodology

To validate or invalidate these hypotheses, the product team will execute a mixed-methods research framework:

```
[ Phase 1: Generative Qualitative Interviews ] (N = 15)
                      ↓
[ Phase 2: Usability Testing & Prototype Evaluation ] (N = 10)
                      ↓
[ Phase 3: In-Product Behavioral Analytics & Funnel Tracking ]
```

### Target Interview Cohorts:
1. **Cohort 1: Budget-Conscious / Solo Travelers (N = 5)**
   - Criteria: Took ≥ 2 international trips in past 18 months; spends significant time finding discounts.
2. **Cohort 2: Time-Sensitive / Business Travelers (N = 5)**
   - Criteria: Flies frequently; values non-stop routes and schedule reliability.
3. **Cohort 3: Multi-City Vacation Planners (N = 5)**
   - Criteria: Planned an itinerary spanning ≥ 2 foreign destinations within the last 2 years.

---

## 4. Semi-Structured Interview Guide

### Part A: Warm-Up & Context (5 mins)
- "Tell me about the last time you booked an international flight. Where were you going, and who was traveling?"
- "What tools, websites, or apps did you use throughout the planning process?"

### Part B: Decision Friction & Trade-offs (15 mins)
- "When you saw the search results, how did you decide which option was actually best for you?"
- "Have you ever chosen a cheaper flight and later regretted it? What happened?"
- "How do you evaluate whether saving ₹5,000 is worth an extra 4-hour layover in an intermediate airport?"
- "How do you factor in traveling from a secondary airport (e.g., London Stansted vs. Heathrow) into your decision?"

### Part C: Multi-City & Budget Complexity (15 mins)
- "If you're visiting more than one country or city on a single trip, walk me through how you organize your flights."
- "How do you estimate your total trip expenses beyond just the airfare?"
- "What information do you feel is consistently missing from Google Flights or Skyscanner?"

### Part D: Reaction to AI Copilots (10 mins)
- "Have you used ChatGPT or an AI travel assistant for flights? What was your experience?"
- "What would make you trust—or distrust—an AI recommendation for a flight itinerary?"

---

## 5. Synthesis Framework & Decision Criteria

Data collected from interview sessions will be mapped against an **Opportunity Solution Tree (OST)**:

1. **Desired Outcome:** Increase traveler confidence in flight decisions while reducing research time.
2. **Opportunity Areas:**
   - *Clarity on time vs. money trade-offs.*
   - *Transparency on secondary airport friction.*
   - *Automated multi-destination sequencing.*
3. **Validation Criteria:**
   - If ≥ 65% of interviewed travelers confirm that hidden transfer costs from secondary airports have caused booking regret, prioritize the **Airport Convenience & Transfer Warning** feature.
   - If users express skepticism of AI-generated prices, enforce **strict deterministic explanation templates** and restrict LLMs to query translation.

---

## 6. Current Status & Next Steps
- **Completed:** Research protocol design, persona segmentation, interview script definition, and telemetry event instrumentation.
- **Active:** Gathering initial in-product feedback via the newly deployed `recommendation_feedback` telemetry component.
- **Next Milestone:** Conduct initial qualitative cohort interviews to test Hypotheses H1 through H5.
