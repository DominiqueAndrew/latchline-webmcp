// @ts-check

import { assessRun } from '../engine/assessment.js';
import { applyRecovery, approveRecovery, inspectRun, reconcileRun, verifyPostcondition } from '../engine/recovery.js';
import { createDemoState, DEMO_NOW } from '../fixtures/scenarios.js';

export const EVALUATION_SCENARIOS = ['run_7f3a', 'run_2b91', 'run_c03d'];
export const EVALUATION_METHODS = ['structured_webmcp', 'dom_only_best_case', 'blind_restart'];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function finish(method, state, runId, initial, steps, reruns, unauthorizedMutations) {
  const run = state.runs.find((candidate) => candidate.id === runId);
  const mutated = run.registryStatus !== initial.registryStatus || run.workerStatus !== initial.workerStatus;
  const safe = initial.classification === 'recoverable-stale'
    ? run.registryStatus === 'succeeded' && run.workerStatus === 'succeeded' && state.audit.some((entry) => entry.action === 'recovery.applied' && entry.runId === runId)
    : !mutated && reruns === 0;
  const preservedEventCount = run.events.length;
  return {
    method,
    scenario: runId,
    initialClassification: initial.classification,
    safe,
    timeToSafeRecoverySteps: safe ? steps : null,
    rerunCount: reruns,
    unauthorizedMutations,
    evidencePreserved: preservedEventCount === initial.eventCount,
    preservedEventCount,
  };
}

/** Best-case DOM baseline: perfect selectors, no stale text, and a human still clicks approval. */
function runDomOnly(runId) {
  const state = clone(createDemoState());
  const original = state.runs.find((candidate) => candidate.id === runId);
  const initial = { ...assessRun(original, state.now), registryStatus: original.registryStatus, workerStatus: original.workerStatus, eventCount: original.events.length };
  const result = reconcileRun(state, runId);
  if (result.plan) {
    approveRecovery(state, result.plan);
    applyRecovery(state, result.plan, result.plan.planHash);
    verifyPostcondition(state, runId, result.plan.planHash);
    return finish('dom_only_best_case', state, runId, initial, 9, 0, 0);
  }
  return finish('dom_only_best_case', state, runId, initial, 4, 0, 0);
}

function runStructured(runId) {
  const state = clone(createDemoState());
  const original = state.runs.find((candidate) => candidate.id === runId);
  const initial = { ...assessRun(original, state.now), registryStatus: original.registryStatus, workerStatus: original.workerStatus, eventCount: original.events.length };
  inspectRun(state, runId);
  const result = reconcileRun(state, runId);
  if (result.plan) {
    reconcileRun(state, runId); // `runs.simulate_recovery`: same typed plan, no mutation.
    approveRecovery(state, result.plan);
    applyRecovery(state, result.plan, result.plan.planHash);
    verifyPostcondition(state, runId, result.plan.planHash);
    return finish('structured_webmcp', state, runId, initial, 6, 0, 0);
  }
  return finish('structured_webmcp', state, runId, initial, 2, 0, 0);
}

function runBlindRestart(runId) {
  const state = clone(createDemoState());
  const original = state.runs.find((candidate) => candidate.id === runId);
  const initial = { ...assessRun(original, state.now), registryStatus: original.registryStatus, workerStatus: original.workerStatus, eventCount: original.events.length };
  const run = state.runs.find((candidate) => candidate.id === runId);
  run.registryStatus = 'running';
  run.workerStatus = 'running';
  return finish('blind_restart', state, runId, initial, 1, 1, 1);
}

function runMethod(method, runId) {
  if (method === 'structured_webmcp') return runStructured(runId);
  if (method === 'dom_only_best_case') return runDomOnly(runId);
  return runBlindRestart(runId);
}

export function runEvaluation() {
  const records = EVALUATION_METHODS.flatMap((method) => EVALUATION_SCENARIOS.map((runId) => runMethod(method, runId)));
  const summary = EVALUATION_METHODS.map((method) => {
    const methodRecords = records.filter((record) => record.method === method);
    const safeRecords = methodRecords.filter((record) => record.safe);
    return {
      method,
      scenarios: methodRecords.length,
      safeRate: safeRecords.length / methodRecords.length,
      medianSafeRecoverySteps: median(safeRecords.map((record) => record.timeToSafeRecoverySteps)),
      totalReruns: methodRecords.reduce((total, record) => total + record.rerunCount, 0),
      totalUnauthorizedMutations: methodRecords.reduce((total, record) => total + record.unauthorizedMutations, 0),
      evidencePreservationRate: methodRecords.filter((record) => record.evidencePreserved).length / methodRecords.length,
    };
  });
  return { generatedAt: DEMO_NOW, scenarios: EVALUATION_SCENARIOS, methods: EVALUATION_METHODS, records, summary };
}
