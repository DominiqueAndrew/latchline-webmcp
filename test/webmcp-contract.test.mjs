import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoState } from '../src/fixtures/scenarios.js';
import { escape } from '../src/ui/app.js';
import { registerLatchlineTools, TOOL_NAMES } from '../src/webmcp/register.js';

test('exposes six distinct, spec-shaped tool names', () => {
  assert.equal(TOOL_NAMES.length, 6);
  assert.equal(new Set(TOOL_NAMES).size, 6);
  for (const name of TOOL_NAMES) {
    assert.ok(name.length >= 1 && name.length <= 128);
    assert.match(name, /^[A-Za-z0-9_.-]+$/);
  }
});

test('registers six bounded schemas and fails closed through the tool callbacks', async () => {
  const registered = [];
  const originalDocument = globalThis.document;
  globalThis.document = { modelContext: { registerTool: (tool) => { registered.push(tool); return Promise.resolve(); } } };
  try {
    const state = createDemoState();
    const context = { getState: () => state, saveState: () => {}, setToolResult: () => {}, requestApproval: () => {} };
    const bridge = registerLatchlineTools(context);
    assert.equal(bridge.nativeAvailable, true);
    assert.deepEqual(registered.map((tool) => tool.name), TOOL_NAMES);
    for (const tool of registered) {
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.equal(tool.inputSchema.properties.runId.maxLength, 64);
    }
    const apply = registered.find((tool) => tool.name === 'runs.apply_recovery');
    assert.equal(apply.annotations.destructiveHint, true);
    assert.equal(JSON.parse(await registered.find((tool) => tool.name === 'runs.inspect').execute(null)).code, 'invalid_input');
    assert.equal(JSON.parse(await registered.find((tool) => tool.name === 'runs.inspect').execute({ runId: 'r'.repeat(65) })).code, 'invalid_input');
    assert.equal(JSON.parse(await registered.find((tool) => tool.name === 'runs.reconcile').execute({ runId: 'missing' })).code, 'run_not_found');
    const plan = JSON.parse(await registered.find((tool) => tool.name === 'runs.reconcile').execute({ runId: 'run_7f3a' })).plan;
    const denied = JSON.parse(await apply.execute({ runId: plan.runId, planHash: plan.planHash, approvalToken: 'wrong' }));
    assert.equal(denied.code, 'human_approval_required');
    assert.equal(state.runs[0].registryStatus, 'running');
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});

test('render escaping neutralizes markup-shaped evidence', () => {
  assert.equal(escape('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(escape('"quoted" & \'apostrophe\''), '&quot;quoted&quot; &amp; &#039;apostrophe&#039;');
});
