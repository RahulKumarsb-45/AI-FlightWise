# RICE Feature Prioritization Matrix: AI FlightWise

**Product:** AI FlightWise (Smarter Flights. Better Decisions.)  
**Framework:** RICE (Reach, Impact, Confidence, Effort)  
**Status:** Product Planning Baseline  
**Note on Data Integrity:** All scores, user percentages, and person-week estimates are documented **analytical estimates and planning assumptions**, not historical production measurements.

---

## 1. RICE Framework Methodology

$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

- **Reach ($R$):** Estimated number of active users/searches affected per quarter.
  - Scale: Count of users or sessions impacted (e.g., 5,000 to 20,000 based on initial launch assumptions).
- **Impact ($I$):** Degree of contribution to the North Star Metric (*Decided Itineraries*).
  - Scale: $3.0$ = Massive impact, $2.0$ = High impact, $1.0$ = Medium impact, $0.5$ = Low impact, $0.25$ = Minimal impact.
- **Confidence ($C$):** Degree of data backing the reach and impact assumptions.
  - Scale: $1.0$ (100%) = High confidence (supported by user research / working code), $0.8$ (80%) = Medium confidence, $0.5$ (50%) = Low confidence / exploratory.
- **Effort ($E$):** Estimated engineering and design cost in person-weeks.
  - Scale: Number of person-weeks required (1 to 6 weeks).

---

## 2. Initiative Prioritization Table

| Rank | Initiative | Reach ($R$) | Impact ($I$) | Confidence ($C$) | Effort ($E$) | **RICE Score** | Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | **Interactive Trade-off Comparison Matrix** | 18,000 | 2.5 | 90% (0.9) | 2.0 | **20,250** | **Implemented (v1.0)** |
| **2** | **Recommendation Feedback Telemetry** | 15,000 | 1.5 | 90% (0.9) | 1.0 | **20,250** | **Implemented (v1.0)** |
| **3** | **Automated AI Quality & Evaluation Benchmark** | 10,000 | 2.0 | 90% (0.9) | 1.5 | **12,000** | **Implemented (v1.0)** |
| **4** | **Nearby Airport Ground Transfer Cost Estimator** | 8,000 | 2.0 | 80% (0.8) | 1.5 | **8,533** | *Planned (v1.1)* |
| **5** | **Multi-City Circuit Route Visualizer (Interactive Map)**| 12,000 | 1.5 | 80% (0.8) | 2.5 | **5,760** | *Planned (v1.1)* |
| **6** | **Aero AI Contextual Itinerary Refinements** | 6,000 | 2.0 | 70% (0.7) | 2.0 | **4,200** | *Planned (v1.2)* |
| **7** | **Baggage Fee & Hidden Fare Transparency Breakdown** | 14,000 | 1.0 | 60% (0.6) | 2.5 | **3,360** | *Backlog* |
| **8** | **Collaborative Group Trip Planning & Voting** | 4,000 | 2.0 | 50% (0.5) | 3.5 | **1,143** | *Backlog* |
| **9** | **Real-Time Price Volatility Predictor** | 10,000 | 1.5 | 40% (0.4) | 6.0 | **1,000** | *Future Scope* |
| **10**| **Airline Carbon Offset Trade-off Comparison** | 7,000 | 0.5 | 70% (0.7) | 3.0 | **817** | *Future Scope* |

---

## 3. Justification for Top-Ranked Initiatives

### 1. Interactive Trade-off Comparison Matrix (RICE: 20,250)
- **Rationale:** Addresses the central user problem (decision fatigue). Directly compares Cheapest, Fastest, and Balanced options.
- **Why Implemented First:** Highest leverage on decision velocity. Reuses existing scoring algorithms without requiring new external API subscriptions.

### 2. Recommendation Feedback Telemetry (RICE: 20,250)
- **Rationale:** The product cannot improve without understanding why users reject certain recommendations (e.g., inconvenient layovers vs. high prices).
- **Why Implemented First:** Low implementation effort (1 person-week) with massive compound value for ongoing algorithmic tuning.

### 3. Automated AI Quality & Evaluation Benchmark (RICE: 12,000)
- **Rationale:** Prevents AI regressions in natural language search extraction and establishes objective reliability standards.
- **Why Implemented First:** Foundational for product trust and essential for demonstrating rigorous AI Product Management practices.

### 4. Nearby Airport Ground Transfer Cost Estimator (RICE: 8,533)
- **Rationale:** Many budget travelers select secondary airports without realizing ground trains cost more than the flight savings.
- **Next Milestone:** Integrate rail transit estimators (e.g., Stansted Express, Beauvais Shuttle) into the total trip budget calculation.
