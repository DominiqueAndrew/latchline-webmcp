import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOL_NAMES } from '../src/webmcp/register.js';

test('exposes six distinct, spec-shaped tool names', () => {
  assert.equal(TOOL_NAMES.length, 6);
  assert.equal(new Set(TOOL_NAMES).size, 6);
  for (const name of TOOL_NAMES) {
    assert.ok(name.length >= 1 && name.length <= 128);
    assert.match(name, /^[A-Za-z0-9_.-]+$/);
  }
});
