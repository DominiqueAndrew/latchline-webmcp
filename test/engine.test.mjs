import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRun } from '../src/engine/assessment.js';
import { approveRecovery, applyRecovery, reconcileRun, undoRecovery, verifyPostcondition } from '../src/engine/recovery.js';
import { createDemoState, DEMO_NOW } from '../src/fixtures/scenarios.js';

test('classifies terminal worker evidence with a running registry as recoverable stale', () => {
  const state = createDemoState();
  const result = assessRun(state.runs[0], DEMO_NOW);
  assert.equal(result.classification, 'recoverable-stale');
  assert.equal(result.recommendedAction, 'reconcile_registry');
  assert.equal(result.confidence, 98);
  assert.equal(result.freshnessSeconds, 828);
});

test('does not offer a plan when evidence is healthy or conflicting', () => {
  const state = createDemoState();
  assert.equal(reconcileRun(state, 'run_2b91').plan, null);
  assert.equal(reconcileRun(state, 'run_c03d').assessment.classification, 'conflict');
  assert.equal(reconcileRun(state, 'run_c03d').plan, null);
});

test('fails closed without exact human approval and plan hash', () => {
  const state = createDemoState();
  const plan = reconcileRun(state, 'run_7f3a').plan;
  assert.ok(plan);
  const denied = applyRecovery(state, plan, null);
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'human_approval_required');
  assert.equal(state.runs[0].registryStatus, 'running');
  assert.equal(state.audit.some((entry) => entry.action === 'recovery.applied'), false);
});

test('applies, verifies, and undoes a plan as auditable state transitions', () => {
  const state = createDemoState();
  const plan = reconcileRun(state, 'run_7f3a').plan;
  assert.ok(plan);
  approveRecovery(state, plan);
  const applied = applyRecovery(state, plan, plan.planHash);
  assert.equal(applied.ok, true);
  assert.equal(state.runs[0].registryStatus, 'succeeded');
  const verified = verifyPostcondition(state, plan.runId, plan.planHash);
  assert.equal(verified.ok, true);
  assert.equal(verified.code, 'postcondition_verified');
  const undone = undoRecovery(state, plan);
  assert.equal(undone.ok, true);
  assert.equal(state.runs[0].registryStatus, 'running');
  assert.equal(state.approvals[plan.runId], undefined);
  assert.deepEqual(state.audit.map((entry) => entry.action), ['recovery.undone', 'recovery.applied', 'approval.granted', 'runs.inspect']);
});
