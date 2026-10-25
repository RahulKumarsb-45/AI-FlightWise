const {
  explainCandidate,
  explainCategoryPicks,
  buildDecisionIntelligence,
  buildTradeoffMatrix,
  formatInr,
  formatDuration,
} = require('../../src/optimizer/explainability/explainabilityEngine');

describe('explainabilityEngine', () => {
  const candidateA = {
    totalPriceInr: 25000,
    totalDurationMinutes: 540,
    totalStops: 0,
    departureDate: '2026-11-01',
    returnDate: '2026-11-10',
    originAirport: { iata: 'DEL', city: 'Delhi', isPrimary: true },
    destinationAirports: [{ iata: 'LHR', city: 'London', isPrimary: true }],
  };

  const candidateB = {
    totalPriceInr: 18000,
    totalDurationMinutes: 720,
    totalStops: 1,
    departureDate: '2026-11-01',
    returnDate: '2026-11-10',
    originAirport: { iata: 'DEL', city: 'Delhi', isPrimary: true },
    destinationAirports: [{ iata: 'LGW', city: 'London', isPrimary: false }],
  };

  const allCandidates = [candidateA, candidateB];

  describe('explainCandidate', () => {
    test('explains rank 0 candidate based on requested preference', () => {
      const explanation = explainCandidate(candidateA, allCandidates, 'balanced');
      expect(explanation).toContain('Top pick');
      expect(explanation).toContain('direct flight');
    });

    test('explains non-top-pick relative to the top pick', () => {
      const explanation = explainCandidate(candidateB, allCandidates, 'balanced');
      expect(explanation).toContain('less than the top pick');
      expect(explanation).toContain('takes 3h longer');
    });
  });

  describe('buildDecisionIntelligence', () => {
    test('computes grounded advantages, disadvantages, and bestSuitedFor persona', () => {
      const intelA = buildDecisionIntelligence(candidateA, allCandidates, 'balanced', {
        cheapest: candidateB,
        fastest: candidateA,
      });

      expect(intelA).toHaveProperty('whySelected');
      expect(intelA).toHaveProperty('advantages');
      expect(intelA).toHaveProperty('disadvantages');
      expect(intelA).toHaveProperty('bestSuitedFor');
      expect(intelA).toHaveProperty('metrics');

      expect(intelA.advantages).toContain('Fastest itinerary found — shortest total transit time.');
      expect(intelA.advantages).toContain('Direct non-stop flight: no layovers, minimum travel stress.');
      expect(intelA.disadvantages).toContain('Costs ₹7,000 more than the cheapest available option.');
      expect(intelA.metrics.priceDiffVsCheapestInr).toBe(7000);
      expect(intelA.metrics.timeDiffVsFastestMinutes).toBe(0);
    });

    test('flags nearby airport utilization as both savings advantage and transfer trade-off', () => {
      const intelB = buildDecisionIntelligence(candidateB, allCandidates, 'cheapest', {
        cheapest: candidateB,
        fastest: candidateA,
      });

      expect(intelB.advantages).toContain('Guaranteed lowest flight price across all evaluated routes.');
      expect(intelB.advantages.some((a) => a.includes('regional airport'))).toBe(true);
      expect(intelB.disadvantages.some((d) => d.includes('ground transit'))).toBe(true);
      expect(intelB.bestSuitedFor).toContain('Budget-conscious');
    });
  });

  describe('buildTradeoffMatrix', () => {
    test('constructs comparative trade-off options across categories', () => {
      const matrix = buildTradeoffMatrix(
        { cheapest: candidateB, fastest: candidateA, balanced: candidateA },
        allCandidates
      );

      expect(matrix).toHaveProperty('options');
      expect(matrix).toHaveProperty('summary');
      expect(matrix.options.length).toBeGreaterThanOrEqual(2);

      const cheapestOpt = matrix.options.find((o) => o.category === 'cheapest');
      const fastestOpt = matrix.options.find((o) => o.category === 'fastest');

      expect(cheapestOpt.priceInr).toBe(18000);
      expect(fastestOpt.priceInr).toBe(25000);
      expect(matrix.summary).toContain('Fastest option costs ₹7,000 more to save 3h');
    });
  });

  describe('format helpers', () => {
    test('formats INR and durations deterministically', () => {
      expect(formatInr(12500)).toBe('₹12,500');
      expect(formatDuration(135)).toBe('2h 15m');
      expect(formatDuration(120)).toBe('2h');
    });
  });
});
