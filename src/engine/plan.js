// @ts-check

function stableHash(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `pln_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

/** @param {import('../domain/types.js').RunRecord} run @param {ReturnType<import('./assessment.js').assessRun>} assessment @param {string} now */
export function makeRecoveryPlan(run, assessment, now) {
  if (assessment.classification !== 'recoverable-stale') return null;
  const planBody = { runId: run.id, action: 'reconcile_registry', from: run.registryStatus, to: 'succeeded', evidence: [run.output, run.lastProductiveAt, run.queuedMessages] };
  return {
    id: `plan_${run.id}`,
    runId: run.id,
    action: 'reconcile_registry',
    from: run.registryStatus,
    to: 'succeeded',
    rationale: "Align the registry with the worker's terminal success evidence; do not rerun the completed work.",
    preconditions: ['Worker status remains succeeded.', 'No productive activity appears after the terminal event.', 'Registry status remains running.'],
    expectedPostcondition: 'Registry and worker both report succeeded; the queued message can be handled by a fresh run.',
    risk: 'low',
    planHash: stableHash(JSON.stringify(planBody)),
    createdAt: now,
  };
}
