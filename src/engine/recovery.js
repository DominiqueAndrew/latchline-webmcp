// @ts-check

import { assessRun } from './assessment.js';
import { makeRecoveryPlan } from './plan.js';

/** @param {import('../domain/types.js').AppState} state @param {string} runId */
function findRun(state, runId) {
  return state.runs.find((run) => run.id === runId) ?? null;
}

/** @param {import('../domain/types.js').AppState} state @param {string} runId */
export function inspectRun(state, runId) {
  return findRun(state, runId);
}

/** @param {import('../domain/types.js').AppState} state @param {string} runId */
export function reconcileRun(state, runId) {
  const run = findRun(state, runId);
  if (!run) return { run: null, assessment: null, plan: null };
  const assessment = assessRun(run, state.now);
  return { run, assessment, plan: makeRecoveryPlan(run, assessment, state.now) };
}

/** @param {import('../domain/types.js').AppState} state @param {import('../domain/types.js').RecoveryPlan} plan */
export function approveRecovery(state, plan) {
  const approval = { runId: plan.runId, planHash: plan.planHash, approvedAt: state.now, status: 'approved' };
  state.approvals[plan.runId] = approval;
  state.audit.unshift({ id: `audit_${state.audit.length + 1}`, at: state.now, action: 'approval.granted', actor: 'human', runId: plan.runId, planHash: plan.planHash, detail: 'Human approved the exact recovery plan shown on the page.' });
  return approval;
}

/** @param {import('../domain/types.js').AppState} state @param {import('../domain/types.js').RecoveryPlan} plan @param {string|null} approvalToken */
export function applyRecovery(state, plan, approvalToken) {
  const run = findRun(state, plan.runId);
  if (!run) return { ok: false, code: 'run_not_found', message: 'The run is no longer available.' };
  const current = reconcileRun(state, plan.runId);
  if (!current.assessment || current.assessment.classification !== 'recoverable-stale') return { ok: false, code: 'precondition_failed', message: 'The recovery preconditions changed; no mutation was applied.' };
  const approval = state.approvals[plan.runId];
  if (!approval || approval.planHash !== plan.planHash || approvalToken !== plan.planHash) return { ok: false, code: 'human_approval_required', message: 'Human approval for this exact plan is required; no mutation was applied.', plan };

  const previousStatus = run.registryStatus;
  run.registryStatus = plan.to;
  state.audit.unshift({ id: `audit_${state.audit.length + 1}`, at: state.now, action: 'recovery.applied', actor: 'agent', runId: plan.runId, planHash: plan.planHash, detail: `Registry reconciled from ${previousStatus} to ${run.registryStatus}; worker output was not rerun.` });
  return { ok: true, code: 'recovery_applied', message: 'Recovery applied and ready for postcondition verification.', run, plan };
}

/** @param {import('../domain/types.js').AppState} state @param {string} runId @param {string|null} planHash */
export function verifyPostcondition(state, runId, planHash) {
  const run = findRun(state, runId);
  if (!run) return { ok: false, code: 'run_not_found', message: 'The run is no longer available.' };
  const verified = run.registryStatus === 'succeeded' && run.workerStatus === 'succeeded' && state.audit.some((entry) => entry.runId === runId && entry.action === 'recovery.applied' && entry.planHash === planHash);
  return { ok: verified, code: verified ? 'postcondition_verified' : 'postcondition_not_verified', message: verified ? 'Registry and worker agree on succeeded; the recovery is recorded in the audit ledger.' : 'The expected postcondition is not yet true.', run };
}

/** @param {import('../domain/types.js').AppState} state @param {import('../domain/types.js').RecoveryPlan} plan */
export function undoRecovery(state, plan) {
  const run = findRun(state, plan.runId);
  if (!run) return { ok: false, code: 'run_not_found', message: 'The run is no longer available.' };
  if (run.registryStatus !== plan.to) return { ok: false, code: 'undo_precondition_failed', message: 'The run has changed since recovery; no undo was applied.' };
  run.registryStatus = plan.from;
  delete state.approvals[plan.runId];
  state.audit.unshift({ id: `audit_${state.audit.length + 1}`, at: state.now, action: 'recovery.undone', actor: 'human', runId: plan.runId, planHash: plan.planHash, detail: `The reversible recovery was undone; registry returned to ${plan.from}.` });
  return { ok: true, code: 'recovery_undone', message: 'Recovery undone. No worker work was rerun.', run, plan };
}
