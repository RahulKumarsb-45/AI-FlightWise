/**
 * FLIGHT PROVIDER CONTRACT
 * ========================
 * Every flight provider (mock, Ignav, future providers) must implement:
 *
 *   async search(params) -> Promise<NormalizedFlightOffer[]>
 *
 * params = {
 *   originIata: string,        // e.g. 'DEL'
 *   destinationIata: string,   // e.g. 'LHR'
 *   departureDate: string,     // 'YYYY-MM-DD'
 *   returnDate?: string,       // 'YYYY-MM-DD', omitted for one-way
 *   adults: number,
 *   cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first',
 * }
 *
 * NormalizedFlightOffer = {
 *   id: string,                       // provider-unique offer id
 *   provider: 'mock' | 'ignav',
 *   priceInr: number,                 // total price, converted to INR
 *   currency: 'INR',
 *   totalDurationMinutes: number,
 *   stops: number,                    // 0 = direct
 *   outbound: FlightSegment[],
 *   inbound: FlightSegment[] | null,  // null for one-way
 *   bookableUntil: string | null,     // ISO timestamp, if provider gives one
 * }
 *
 * FlightSegment = {
 *   airline: string,          // IATA airline code, e.g. 'AI'
 *   flightNumber: string,
 *   fromIata: string,
 *   toIata: string,
 *   departureTime: string,    // ISO timestamp
 *   arrivalTime: string,      // ISO timestamp
 *   durationMinutes: number,
 * }
 *
 * IMPORTANT: The optimizer engine depends ONLY on this shape.
 * It never imports concrete provider files directly — it goes
 * through providerFactory.getProvider(), so swapping/adding providers never
 * requires touching optimizer code.
 */

module.exports = {}; // documentation-only module
