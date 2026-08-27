// @ts-check

import { applyRecovery, inspectRun, reconcileRun, verifyPostcondition } from '../engine/recovery.js';

const TOOL_NAMES = ['runs.inspect', 'runs.reconcile', 'runs.simulate_recovery', 'runs.request_action', 'runs.apply_recovery', 'runs.verify_postcondition'];
export { TOOL_NAMES };

function readRunId(input) {
  return typeof input?.runId === 'string' && input.runId.length > 0 && input.runId.length <= 64 ? input.runId : null;
}

function readBoundedString(value) { return typeof value === 'string' && value.length > 0 && value.length <= 64 ? value : null; }
function schema(properties, required) { return { type: 'object', properties, required, additionalProperties: false }; }
function json(value) { return JSON.stringify(value, null, 2); }
function error(code, message) { return json({ ok: false, code, message }); }

/** @param {{getState: Function, saveState: Function, setToolResult: Function, requestApproval: Function}} context */
export function registerLatchlineTools(context) {
  const modelContext = document.modelContext;
  if (!modelContext) return { nativeAvailable: false, names: TOOL_NAMES };

  const readOnly = { readOnlyHint: true, untrustedContentHint: true };
  modelContext.registerTool({
    name: 'runs.inspect', title: 'Inspect a run',
    description: "Read the selected run's registry state, worker evidence, queued work, and audit-relevant events.",
    inputSchema: schema({ runId: { type: 'string', minLength: 1, maxLength: 64 } }, ['runId']), annotations: readOnly,
    execute: async (input) => {
      const runId = readRunId(input);
      if (!runId) return error('invalid_input', 'runId is required.');
      const run = inspectRun(context.getState(), runId);
      const result = run ? json({ ok: true, run }) : error('run_not_found', 'No run matches that id.');
      context.setToolResult(result);
      return result;
    },
  });

  modelContext.registerTool({
    name: 'runs.reconcile', title: 'Reconcile run evidence',
    description: 'Classify whether a run is healthy, recoverably stale, conflicting, or unknown and return a deterministic plan when safe.',
    inputSchema: schema({ runId: { type: 'string', minLength: 1, maxLength: 64 } }, ['runId']), annotations: readOnly,
    execute: async (input) => {
      const runId = readRunId(input);
      if (!runId) return error('invalid_input', 'runId is required.');
      const result = reconcileRun(context.getState(), runId);
      const output = json(result.run ? { ok: true, ...result } : { ok: false, code: 'run_not_found', message: 'No run matches that id.' });
      context.setToolResult(output);
      return output;
    },
  });

  modelContext.registerTool({
    name: 'runs.simulate_recovery', title: 'Simulate recovery',
    description: 'Show the proposed state transition and postcondition without changing any run or registry state.',
    inputSchema: schema({ runId: { type: 'string', minLength: 1, maxLength: 64 } }, ['runId']), annotations: readOnly,
    execute: async (input) => {
      const runId = readRunId(input);
      if (!runId) return error('invalid_input', 'runId is required.');
      const result = reconcileRun(context.getState(), runId);
      if (!result.plan) return error('no_safe_plan', 'No safe recovery plan exists for this evidence.');
      const output = json({ ok: true, simulated: true, transition: `${result.plan.from} -> ${result.plan.to}`, plan: result.plan });
      context.setToolResult(output);
      return output;
    },
  });

  modelContext.registerTool({
    name: 'runs.request_action', title: 'Request human approval',
    description: 'Place a specific recovery plan in the visible approval queue. This never mutates a run and never grants approval by itself.',
    inputSchema: schema({ runId: { type: 'string', minLength: 1, maxLength: 64 }, planHash: { type: 'string', minLength: 1, maxLength: 64 } }, ['runId', 'planHash']), annotations: { untrustedContentHint: true },
    execute: async (input) => {
      const runId = readRunId(input);
      const planHash = readBoundedString(input?.planHash);
      if (!runId || !planHash) return error('invalid_input', 'runId and planHash are required.');
      const result = reconcileRun(context.getState(), runId);
      if (!result.plan || result.plan.planHash !== planHash) return error('plan_mismatch', 'The requested plan is not current; refresh inspection.');
      context.requestApproval(result.plan);
      const output = json({ ok: true, code: 'approval_requested', message: 'Visible human approval is required before apply.', plan: result.plan });
      context.setToolResult(output);
      return output;
    },
  });

  modelContext.registerTool({
    name: 'runs.apply_recovery', title: 'Apply approved recovery',
    description: 'Apply the exact approved recovery plan only after the page records a human approval token bound to its plan hash.',
    inputSchema: schema({ runId: { type: 'string', minLength: 1, maxLength: 64 }, planHash: { type: 'string', minLength: 1, maxLength: 64 }, approvalToken: { type: 'string', minLength: 1, maxLength: 64 } }, ['runId', 'planHash', 'approvalToken']), annotations: { destructiveHint: true, untrustedContentHint: true },
    execute: async (input) => {
      const runId = readRunId(input);
      const planHash = readBoundedString(input?.planHash);
      const approvalToken = readBoundedString(input?.approvalToken);
      if (!runId || !planHash || !approvalToken) return error('invalid_input', 'runId, planHash, and approvalToken are required.');
      const state = context.getState();
      const current = reconcileRun(state, runId);
      if (!current.plan || current.plan.planHash !== planHash) return error('plan_mismatch', 'The current evidence no longer matches this plan.');
      const result = applyRecovery(state, current.plan, approvalToken);
      context.saveState();
      const output = json(result);
      context.setToolResult(output);
      return output;
    },
  });

  modelContext.registerTool({
    name: 'runs.verify_postcondition', title: 'Verify recovery',
    description: 'Verify the registry and worker agree after a recovery and that the approved plan is present in the audit ledger.',
    inputSchema: schema({ runId: { type: 'string', minLength: 1, maxLength: 64 }, planHash: { type: 'string', minLength: 1, maxLength: 64 } }, ['runId', 'planHash']), annotations: readOnly,
    execute: async (input) => {
      const runId = readRunId(input);
      const planHash = readBoundedString(input?.planHash);
      if (!runId || !planHash) return error('invalid_input', 'runId and planHash are required.');
      const output = json(verifyPostcondition(context.getState(), runId, planHash));
      context.setToolResult(output);
      return output;
    },
  });

  return { nativeAvailable: true, names: TOOL_NAMES };
}
