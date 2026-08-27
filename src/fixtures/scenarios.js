// @ts-check

export const DEMO_NOW = '2026-08-27T12:00:00.000Z';

const event = (id, type, at, actor, summary, detail) => ({ id, type, at, actor, summary, detail });

export function createDemoState() {
  const orphaned = {
    id: 'run_7f3a', label: 'Checkout worker', project: 'northstar-storefront', step: '4 of 4 · publish', registryStatus: 'running', workerStatus: 'succeeded', startedAt: '2026-08-27T11:36:00.000Z', lastHeartbeatAt: '2026-08-27T11:46:12.000Z', lastProductiveAt: '2026-08-27T11:46:12.000Z', output: 'Publish completed: release 8c31 is live.', queuedMessages: 1,
    events: [
      event('e1', 'run.started', '2026-08-27T11:36:00.000Z', 'worker', 'Run started', 'Checkout worker claimed publish step.'),
      event('e2', 'worker.heartbeat', '2026-08-27T11:45:58.000Z', 'worker', 'Heartbeat received', 'Worker reported 96% progress.'),
      event('e3', 'worker.output', '2026-08-27T11:46:12.000Z', 'worker', 'Terminal output received', 'Publish completed: release 8c31 is live.'),
      event('e4', 'worker.succeeded', '2026-08-27T11:46:12.000Z', 'worker', 'Worker marked succeeded', 'The worker wrote a terminal success event.'),
      event('e5', 'message.queued', '2026-08-27T11:47:05.000Z', 'registry', 'Follow-up queued', 'One message is waiting for a run that the registry still thinks is active.'),
    ],
  };

  const healthy = {
    id: 'run_2b91', label: 'Inventory sync', project: 'northstar-storefront', step: '2 of 3 · reconcile', registryStatus: 'running', workerStatus: 'running', startedAt: '2026-08-27T11:58:00.000Z', lastHeartbeatAt: '2026-08-27T11:59:18.000Z', lastProductiveAt: '2026-08-27T11:59:18.000Z', output: 'Reconciling 124 inventory records…', queuedMessages: 0,
    events: [event('h1', 'run.started', '2026-08-27T11:58:00.000Z', 'worker', 'Run started'), event('h2', 'worker.heartbeat', '2026-08-27T11:59:18.000Z', 'worker', 'Heartbeat received', 'Reconciling 124 inventory records.')],
  };

  const conflict = {
    id: 'run_c03d', label: 'Pricing export', project: 'atlas-ops', step: '3 of 3 · export', registryStatus: 'succeeded', workerStatus: 'failed', startedAt: '2026-08-27T11:42:00.000Z', lastHeartbeatAt: '2026-08-27T11:44:07.000Z', lastProductiveAt: '2026-08-27T11:44:07.000Z', output: 'Export failed: destination returned 503.', queuedMessages: 0,
    events: [event('c1', 'run.started', '2026-08-27T11:42:00.000Z', 'worker', 'Run started'), event('c2', 'worker.failed', '2026-08-27T11:44:07.000Z', 'worker', 'Worker failed', 'Destination returned 503.')],
  };

  return {
    now: DEMO_NOW,
    runs: [orphaned, healthy, conflict],
    selectedRunId: orphaned.id,
    approvals: {},
    audit: [{ id: 'a1', at: '2026-08-27T11:48:03.000Z', action: 'runs.inspect', actor: 'agent', runId: orphaned.id, detail: 'Read-only inspection requested by the recovery assistant.' }],
    lastToolResult: null,
  };
}
