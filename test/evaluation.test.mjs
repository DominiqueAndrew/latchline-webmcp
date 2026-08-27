import test from 'node:test';
import assert from 'node:assert/strict';
import { runEvaluation } from '../src/evaluation/harness.js';

test('evaluation is deterministic and compares safe recovery against baselines', () => {
  const result = runEvaluation();
  assert.deepEqual(result.summary, [
    { method: 'structured_webmcp', scenarios: 3, safeRate: 1, medianSafeRecoverySteps: 2, totalReruns: 0, totalUnauthorizedMutations: 0, evidencePreservationRate: 1 },
    { method: 'dom_only_best_case', scenarios: 3, safeRate: 1, medianSafeRecoverySteps: 4, totalReruns: 0, totalUnauthorizedMutations: 0, evidencePreservationRate: 1 },
    { method: 'blind_restart', scenarios: 3, safeRate: 0, medianSafeRecoverySteps: null, totalReruns: 3, totalUnauthorizedMutations: 3, evidencePreservationRate: 1 },
  ]);
  const stale = result.records.filter((record) => record.scenario === 'run_7f3a');
  assert.equal(stale.find((record) => record.method === 'structured_webmcp').timeToSafeRecoverySteps, 6);
  assert.equal(stale.find((record) => record.method === 'dom_only_best_case').timeToSafeRecoverySteps, 9);
  assert.equal(stale.find((record) => record.method === 'blind_restart').safe, false);
});
