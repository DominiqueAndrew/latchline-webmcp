// @ts-check

const STALE_AFTER_SECONDS = 5 * 60;

function ageInSeconds(now, then) {
  if (!then) return null;
  return Math.max(0, Math.floor((Date.parse(now) - Date.parse(then)) / 1000));
}

/** @param {number} seconds */
export function formatAge(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** @param {import('../domain/types.js').RunRecord} run @param {string} now */
export function assessRun(run, now) {
  const freshnessSeconds = ageInSeconds(now, run.lastProductiveAt ?? run.lastHeartbeatAt);

  if (run.registryStatus === 'succeeded' && run.workerStatus === 'succeeded') {
    return {
      runId: run.id,
      classification: 'healthy',
      confidence: 100,
      freshnessSeconds,
      reasons: ['The registry and worker agree on a terminal success.', 'No reconciliation is required for this run.'],
      recommendedAction: null,
    };
  }

  if (run.registryStatus === 'running' && run.workerStatus === 'running') {
    return {
      runId: run.id,
      classification: 'healthy',
      confidence: freshnessSeconds !== null && freshnessSeconds < STALE_AFTER_SECONDS ? 99 : 72,
      freshnessSeconds,
      reasons: [
        'The registry and worker agree that this run is active.',
        freshnessSeconds === null ? 'No freshness signal is available; continue watching the run.' : `Productive activity was recorded ${formatAge(freshnessSeconds)} ago.`,
      ],
      recommendedAction: null,
    };
  }

  if (run.registryStatus === 'running' && run.workerStatus === 'succeeded' && run.output !== null && freshnessSeconds !== null && freshnessSeconds >= STALE_AFTER_SECONDS) {
    return {
      runId: run.id,
      classification: 'recoverable-stale',
      confidence: 98,
      freshnessSeconds,
      reasons: [
        'The worker has a terminal success event and publish output.',
        `The registry still says running, but no productive activity arrived for ${formatAge(freshnessSeconds)}.`,
        run.queuedMessages > 0 ? `${run.queuedMessages} follow-up message is waiting behind the stale lock.` : 'No follow-up messages are waiting behind the stale lock.',
      ],
      recommendedAction: 'reconcile_registry',
    };
  }

  if ((run.registryStatus === 'succeeded' && run.workerStatus === 'failed') || (run.registryStatus === 'failed' && run.workerStatus === 'succeeded')) {
    return {
      runId: run.id,
      classification: 'conflict',
      confidence: 100,
      freshnessSeconds,
      reasons: ['The registry and worker disagree about the terminal outcome.', 'A recovery action is blocked until a human reviews the conflicting evidence.'],
      recommendedAction: null,
    };
  }

  return {
    runId: run.id,
    classification: 'unknown',
    confidence: 40,
    freshnessSeconds,
    reasons: ['The available evidence does not meet a safe recovery rule.', 'Latchline will not guess or mutate this run.'],
    recommendedAction: null,
  };
}
