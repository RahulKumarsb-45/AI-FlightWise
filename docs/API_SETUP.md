# AI FlightWise — API Configuration & Integration Guide

This guide provides a comprehensive audit of all external APIs and environment configurations supported by **AI FlightWise**. It details exact environment variables, provider credentials, fallback behaviors, and instructions for local development.

---

## 1. Master API & Configuration Matrix

| Feature | Provider | Actually Integrated? | Exact Environment Variable | Target File | Official Source | Status | Missing-Key Behavior | Local Testing Strategy |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **Flight Search & Optimizer** | Mock Engine | **Yes** | `FLIGHT_PROVIDER=mock` | `backend/.env` | Built-in | **Default** | Never fails. Generates realistic flights deterministically based on Great-Circle distance. | Run searches across any routes without credentials. |
| **Flight Search (Live)** | Ignav | **Yes** | `IGNAV_API_KEY`<br>`IGNAV_BASE_URL`<br>`IGNAV_MARKET=IN` | `backend/.env` | [ignav.com/signup](https://ignav.com/signup) | Optional | Throws `500 IGNAV_NOT_CONFIGURED` if `FLIGHT_PROVIDER=ignav`. Does **not** silently fall back to mock. | Test with 1-way and round-trip searches between major hubs (e.g. DEL → DXB). |
| **Airport Autocomplete** | Curated Local Dataset | **Yes** | None (Static) | Built-in | Built-in | **Default** | In-memory search over 50+ global airports. | `GET /api/airports?q=del` returns Indira Gandhi Intl. |
| **Airport Autocomplete (Live)** | Ignav | **Yes** | `IGNAV_API_KEY` | `backend/.env` | [ignav.com](https://ignav.com) | Optional | Transparently falls back to curated in-memory dataset if key is missing or request fails. | Set key to search secondary non-curated airports. |
| **Aero AI Assistant** | Groq (Llama / GPT-OSS) | **Yes** | `GROQ_API_KEY`<br>`GROQ_MODEL=openai/gpt-oss-120b` | `backend/.env` | [console.groq.com](https://console.groq.com) | Optional | Returns `502 AI_PROVIDER_ERROR` (Authentication failed). Chat UI displays error banner. | Test via chat widget on `/results` or `/search`. |
| **Weather & Forecast** | OpenWeatherMap | **Yes** | `OPENWEATHER_API_KEY` | `backend/.env` | [openweathermap.org/api](https://openweathermap.org/api) | Optional | Throws `500 WEATHER_NOT_CONFIGURED` on `/api/weather` endpoints. | Test with `GET /api/weather/current?iata=DEL`. |
| **Seasonal Guidance** | Latitude Heuristic | **Yes** | None (Deterministic) | Built-in | Built-in | Built-in | Always returns honest hemisphere/latitude seasonal advice without external calls. | Test with `GET /api/weather/season?iata=SYD&month=7`. |
| **Hotels, Dining & Places** | Geoapify Places v2 | **Yes** | `GEOAPIFY_API_KEY`<br>`PLACES_CACHE_TTL_HOURS=24` | `backend/.env` | [geoapify.com](https://www.geoapify.com) | Optional | Throws `500 PLACES_NOT_CONFIGURED` on `/api/places/*` routes if unset. | Test with `GET /api/places/DEL/hotels`. |
| **Database** | PostgreSQL | **Yes** | `DATABASE_URL`<br>`PG_SSL=false` | `backend/.env` | Local or Docker | **Required** | Backend will fail database connection checks on startup. | Connect to local Postgres or Docker container. |
| **JWT Authentication** | Node `crypto` / JWT | **Yes** | `JWT_ACCESS_SECRET`<br>`JWT_REFRESH_SECRET` | `backend/.env` | Local secret | **Required** | Required in production (server crashes if unset); in development defaults to fallback. | Generate via `openssl rand -hex 32`. |
| **Google OAuth** | Google Cloud Console | **Yes** | `GOOGLE_CLIENT_ID`<br>`GOOGLE_CLIENT_SECRET`<br>`GOOGLE_CALLBACK_URL` | `backend/.env` | [console.cloud.google.com](https://console.cloud.google.com) | Optional | Social login button redirects to error if unconfigured; email/password login unaffected. | Configure Authorized redirect URI in Google Console. |
| **Subscription Payments** | Razorpay | **Yes** | `RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET` | `backend/.env` | [razorpay.com](https://razorpay.com) | Optional | Throws `500 PAYMENTS_NOT_CONFIGURED` on `/api/payments/create-order`. | Test orders via Razorpay test mode keys (`rzp_test_*`). |
| **Frontend API Target** | Next.js Public Config | **Yes** | `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Local URL | **Required** | Connects Next.js client to Express API backend (`http://localhost:5000/api`). | Required for frontend to fetch data. |
| **Frontend Site URL** | Next.js Public Config | **Yes** | `NEXT_PUBLIC_SITE_URL` | `frontend/.env.local` | Local URL | **Required** | Configures canonical URLs for SEO, sitemaps, and robots.txt (`http://localhost:3000`). | Required for client canonical links. |

---

## 2. Detailed Integration Deep-Dives

### 2.1 Flight Search & Circuit Optimizer

The flight optimizer pipeline uses an abstraction layer (`providerFactory.js`). All internal optimizer stages call `searchWithFallback(params)` without coupling to concrete provider implementations.

- **Mock Provider (`FLIGHT_PROVIDER=mock`)**:
  - Requires **zero API keys**.
  - Computes distances using Haversine formulas and synthesizes realistic pricing based on distance, cabin class, stops, and departure dates.
  - Generates realistic airline codes (AI, EK, QR, SQ, LH, BA, 6E, UK).
  - Perfect for rapid local development and UI testing.

- **Ignav Provider (`FLIGHT_PROVIDER=ignav`)**:
  - Live API integration for real-time fares and flight schedules.
  - Requires `IGNAV_API_KEY`.
  - Configured with `IGNAV_MARKET=IN` to guarantee all fares are returned directly in Indian Rupees (INR), matching the application's native currency.
  - **Zero Silent Fallback**: If Ignav credentials fail or rate limits are reached, the system throws an explicit error (`IGNAV_NOT_CONFIGURED` or `FLIGHT_PROVIDER_ERROR`) rather than serving fabricated mock data.



### 2.2 Aero AI Assistant (Conversational Partner)

The conversational assistant inside AI FlightWise is branded **Aero AI**. It is strictly a natural-language parameter extractor and decision partner:

- **Primary Provider (`AI_PROVIDER=groq`)**:
  - Uses Groq's high-throughput inference engine.
  - Default Model: `openai/gpt-oss-120b`.
  - Enforces strict structured JSON schema (`RESPONSE_SCHEMA`).
  - System prompt instructs Aero AI to extract structured parameters (`originCity`, `destinationCountries`, `departureDate`, `returnDate`, `travelers`, `budgetInr`, `preference`) while prohibiting price or flight schedule hallucinations.
  - Requires `GROQ_API_KEY`.



### 2.3 Destination Weather

- **OpenWeatherMap Integration**:
  - Uses `/weather` for current conditions and `/forecast` for 5-day / 3-hour forecasts.
  - Condenses 3-hour slices into daily midday snapshots for travel decision-making.
  - Implements multi-tier caching (in-memory Map + PostgreSQL) with `WEATHER_CACHE_TTL_MINUTES=30`.
  - Requires `OPENWEATHER_API_KEY`.
- **Seasonal Guidance Heuristic**:
  - Built-in deterministic calculation based on destination airport latitude and month.
  - Clearly identifies whether the destination is in summer, winter, shoulder season, or tropical wet/dry season without making costly climate API calls.

---

### 2.4 Destination Hotels, Restaurants & Attractions

- **Geoapify Places API v2**:
  - Replaces all legacy places providers (Google Places and Foursquare are retired).
  - Uses `/v2/places` endpoint with category filtering:
    - Hotels: `accommodation.hotel`, `accommodation.guest_house`, `accommodation.hostel`
    - Restaurants: `catering.restaurant`, `catering.cafe`, `catering.fast_food`
    - Attractions: `tourism.attraction`, `tourism.sights`, `entertainment`, `heritage`
  - Integrated local curated imagery prevents broken thumbnail assets.
  - Requires `GEOAPIFY_API_KEY`.

---

### 2.5 Authentication & Database

- **PostgreSQL**:
  - Direct parameterized raw SQL pool (no heavy ORM overhead).
  - Configured via `DATABASE_URL`.
  - Dedicated isolated database name: `ai_flightwise` (or port `5433` if running the isolated Docker Compose container).
- **JWT Secrets**:
  - `JWT_ACCESS_SECRET` (15m expiry) and `JWT_REFRESH_SECRET` (30d expiry with automatic rotation and reuse detection).
- **Google OAuth**:
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - Callback URL: `http://localhost:5000/api/auth/google/callback`.

---

## 3. Data Authenticity & Verification Summary

To maintain strict truth-in-advertising and portfolio credibility:

| Category | Features Included | Description |
| :--- | :--- | :--- |
| **Real API Responses** | Ignav Flights, Geoapify Places, OpenWeatherMap Forecasts, Groq LLM Responses | Live HTTP responses received from external third-party servers when valid API credentials are supplied. |
| **Deterministic Mock Data** | Mock Flight Provider (`FLIGHT_PROVIDER=mock`) | Distance-scaled, realistic flight schedules and pricing generated on-the-fly without external network calls. |
| **Heuristic Estimates** | Daily Living Cost Estimator, Seasonal Climate Advice | Mathematical heuristics (₹1,500–₹4,000 per day living cost; hemisphere-based seasonal climate trends) clearly labeled as guidance. |
| **Cached Responses** | Flight leg cache, Geoapify results, Weather forecasts | In-memory and PostgreSQL stored responses adhering to configured TTL durations to minimize quota consumption. |
| **Unverified / Scope-Restricted** | Razorpay Live Mandates, Live Airline Booking Checkout | Booking links remain simulated demo flows. Payment mandates and order verifications run in test mode. |

---

## 4. Quick API Setup Guide (Hinglish Instructions)

Agar aapko apne personal API keys add karne hain, toh yeh simple steps follow karein:

### Step 1: Files Check Karein
Aapke workspace mein do environment files create ho chuki hain:
- Backend: `backend/.env`
- Frontend: `frontend/.env.local`

Yeh dono files `.gitignore` mein included hain, isliye aapke private API keys kabhi bhi Git repository mein commit nahi honge.

---

### Step 2: Zero Keys ke saath Run Karna (Default Mock Mode)
Bina kisi paid API key ke bhi pura application 100% chalega:
1. `backend/.env` mein `FLIGHT_PROVIDER=mock` pehle se set hai.
2. Is mode mein flight search, multi-city circuit optimizer, scoring matrix, aur sorting sabhi instant run hote hain.

---

### Step 3: Aero AI Assistant ke liye Groq Key Add Karna (Recommended & Free)
Aero AI chatbot ko live chalane ke liye:
1. [console.groq.com](https://console.groq.com) par free account banayein.
2. **API Keys** section se ek naya API key create karein.
3. `backend/.env` file kholein aur paste karein:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-120b
   ```
4. Backend restart karne par Aero AI live conversations aur search parameter extraction start kar dega.

---

### Step 4: Live Hotels, Restaurants aur Weather Add Karna
Destination ke real hotels, restaurants, tourist attractions aur weather forecast dekhne ke liye:
1. **Geoapify Places (Free 3,000 requests/day):**
   - [geoapify.com](https://www.geoapify.com) par register karke API key generate karein.
   - `backend/.env` mein add karein:
     ```env
     GEOAPIFY_API_KEY=your_geoapify_key_here
     ```
2. **OpenWeatherMap (Free tier):**
   - [openweathermap.org](https://openweathermap.org/api) se standard Current & 5-Day Forecast API key lein.
   - `backend/.env` mein add karein:
     ```env
     OPENWEATHER_API_KEY=your_openweather_key_here
     ```

---

### Step 5: Live Flight Search ke liye Ignav Key Add Karna (Optional)
Agar aapko simulated flights ki jagah actual live airline prices dekhni hain:
1. [ignav.com/signup](https://ignav.com/signup) par register karein (First 1,000 requests free).
2. `backend/.env` mein yeh values update karein:
   ```env
   FLIGHT_PROVIDER=ignav
   IGNAV_API_KEY=your_ignav_api_key_here
   IGNAV_MARKET=IN
   ```
*(Note: Agar Ignav key invalid hogi ya quota khatam ho jayega, toh app clearly error throw karega taaki aapko fake pricing na dikhe).*

---

### Step 6: Safe Local Startup Commands
1. **Backend Start karein:**
   ```powershell
   cd "C:\Users\kumar\Desktop\AI FlightWise\backend"
   npm run dev
   ```
   *(Backend URL: `http://localhost:5000`)*

2. **Frontend Start karein (naye terminal mein):**
   ```powershell
   cd "C:\Users\kumar\Desktop\AI FlightWise\frontend"
   npm run dev
   ```
   *(Frontend URL: `http://localhost:3000`)*
