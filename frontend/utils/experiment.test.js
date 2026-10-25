import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExperimentVariant } from '../lib/experiment.js';

test('getExperimentVariant: returns one of the defined variants stably', () => {
  const variant = getExperimentVariant('recommendation_presentation', [
    { id: 'control', weight: 50 },
    { id: 'variant_matrix', weight: 50 },
  ]);

  assert.ok(
    variant === 'control' || variant === 'variant_matrix',
    `Expected variant to be control or variant_matrix, got: ${variant}`
  );
});

test('getExperimentVariant: produces deterministic result on repeated calls', () => {
  const v1 = getExperimentVariant('recommendation_presentation');
  const v2 = getExperimentVariant('recommendation_presentation');
  assert.equal(v1, v2, 'Expected stable assignment for same session/visitor');
});

test('getExperimentVariant: handles single-variant (100% rollout)', () => {
  const variant = getExperimentVariant('rollout_experiment', [{ id: 'variant_new', weight: 100 }]);
  assert.equal(variant, 'variant_new');
});
