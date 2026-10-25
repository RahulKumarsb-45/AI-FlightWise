const { runEvaluation, loadDataset, getLatestEvaluation } = require('../../src/evaluation/evalRunner');

describe('evalRunner', () => {
  test('loads version-controlled evaluation dataset with valid schema', () => {
    const dataset = loadDataset();
    expect(dataset).toHaveProperty('version');
    expect(dataset).toHaveProperty('cases');
    expect(Array.isArray(dataset.cases)).toBe(true);
    expect(dataset.cases.length).toBeGreaterThanOrEqual(10);

    for (const tc of dataset.cases) {
      expect(tc).toHaveProperty('id');
      expect(tc).toHaveProperty('scenario');
      expect(tc).toHaveProperty('userPrompt');
      expect(tc).toHaveProperty('expected');
    }
  });

  test('runs evaluation suite and produces structured accuracy report', async () => {
    const report = await runEvaluation();

    expect(report).toHaveProperty('id');
    expect(report).toHaveProperty('datasetVersion');
    expect(report).toHaveProperty('modelProvider');
    expect(report).toHaveProperty('totalCases');
    expect(report).toHaveProperty('passedCases');
    expect(report).toHaveProperty('failedCases');
    expect(report).toHaveProperty('passRate');
    expect(report).toHaveProperty('avgLatencyMs');
    expect(report).toHaveProperty('failureBreakdown');
    expect(report).toHaveProperty('caseResults');

    expect(typeof report.passRate).toBe('number');
    expect(report.totalCases).toBe(report.passedCases + report.failedCases);
    expect(report.caseResults.length).toBe(report.totalCases);
  });

  test('getLatestEvaluation returns the persisted run result', () => {
    const latest = getLatestEvaluation();
    expect(latest).not.toBeNull();
    expect(latest).toHaveProperty('datasetVersion');
  });
});
