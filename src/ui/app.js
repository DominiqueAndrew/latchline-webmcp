// @ts-check

import { assessRun, formatAge } from '../engine/assessment.js';
import { approveRecovery, applyRecovery, reconcileRun, undoRecovery, verifyPostcondition } from '../engine/recovery.js';
import { createDemoState } from '../fixtures/scenarios.js';
import { registerLatchlineTools, TOOL_NAMES } from '../webmcp/register.js';

const STATUS_LABELS = { healthy: 'Healthy', 'recoverable-stale': 'Actionable', conflict: 'Needs review', unknown: 'Unknown' };

export function escape(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character); }
function shortTime(value) { return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(value)); }
function statusTone(classification) { return classification === 'recoverable-stale' ? 'action' : classification === 'conflict' ? 'warn' : classification === 'healthy' ? 'good' : 'muted'; }

export class LatchlineApp {
  constructor(root) {
    this.state = createDemoState();
    this.root = root;
    this.nativeWebMcp = false;
    this.approvalRequested = false;
    this.lastPlan = null;
    this.lastMessage = '';
  }

  mount() {
    this.root.innerHTML = '<main class="app-shell"><p class="loading-copy">Preparing the recovery ledger…</p></main>';
    const bridge = registerLatchlineTools({
      getState: () => this.state,
      saveState: () => this.render(),
      setToolResult: (result) => { this.state.lastToolResult = result; this.lastMessage = 'A WebMCP tool completed. The visible ledger is the current state.'; this.render(); },
      requestApproval: (plan) => { this.approvalRequested = true; this.lastPlan = plan; this.lastMessage = 'A recovery plan is waiting for your approval.'; this.render(); },
    });
    this.nativeWebMcp = bridge.nativeAvailable;
    this.root.addEventListener('click', (event) => this.handleClick(event));
    this.render();
  }

  selectedRun() { return this.state.runs.find((run) => run.id === this.state.selectedRunId) ?? this.state.runs[0]; }

  render() {
    const run = this.selectedRun();
    const assessment = assessRun(run, this.state.now);
    const reconciliation = reconcileRun(this.state, run.id);
    const plan = reconciliation.plan ?? this.lastPlan;
    const approval = this.state.approvals[run.id];
    const isRecovered = run.registryStatus === 'succeeded' && run.workerStatus === 'succeeded' && this.state.audit.some((entry) => entry.action === 'recovery.applied' && entry.runId === run.id);
    this.root.innerHTML = `<main class="app-shell">
      <header class="topbar"><a class="brand" href="/" aria-label="Latchline home"><span class="brand-mark">L</span><span>latchline</span></a><div class="topbar-meta"><span class="eyebrow">OPERATOR CONSOLE</span><span class="webmcp-pill ${this.nativeWebMcp ? 'is-live' : 'is-local'}"><span class="status-dot"></span>${this.nativeWebMcp ? 'WebMCP connected' : 'WebMCP-ready page'}</span></div></header>
      <section class="intro" aria-labelledby="page-title"><div><p class="kicker">RECOVERY WITH PROOF</p><h1 id="page-title">Bring a stuck run back<br /><em>into a known state.</em></h1><p class="lede">Latchline reconciles worker evidence and control-plane state before anyone touches a running workflow.</p></div><div class="intro-actions"><button class="button button-quiet" data-action="view-tools">View tool contract <span aria-hidden="true">↗</span></button><button class="button button-quiet" data-action="reset">Reset scenarios</button></div></section>
      <div class="notice-bar" role="status"><span class="notice-icon">↯</span><span>${escape(this.lastMessage || 'Nothing mutates until you approve an exact recovery plan.')}</span><span class="notice-spacer"></span><span class="notice-meta">Demo clock · Aug 27, 12:00 UTC</span></div>
      <section class="workspace" aria-label="Recovery workspace">
        <aside class="run-list panel" aria-label="Runs"><div class="panel-heading"><div><p class="section-label">RUN QUEUE</p><h2>${this.state.runs.length} runs</h2></div><span class="tiny-count">${this.state.runs.filter((item) => assessRun(item, this.state.now).classification === 'recoverable-stale').length} actionable</span></div><div class="run-items">${this.state.runs.map((item) => this.renderRunItem(item)).join('')}</div><div class="list-foot"><span class="legend-dot action-dot"></span> Actionable <span class="legend-dot good-dot"></span> Healthy <span class="legend-dot warn-dot"></span> Review</div></aside>
        <section class="run-detail panel" aria-labelledby="run-title"><div class="detail-head"><div><div class="breadcrumb">${escape(run.project)} <span>/</span> ${escape(run.step)}</div><h2 id="run-title">${escape(run.label)}</h2><p class="run-id">${escape(run.id)} · started ${shortTime(run.startedAt)} UTC</p></div><span class="state-badge ${statusTone(assessment.classification)}"><span class="badge-dot"></span>${STATUS_LABELS[assessment.classification]}</span></div>${this.renderAssessment(run, assessment, plan, approval, isRecovered)}${this.renderTimeline(run)}</section>
        <aside class="audit panel" aria-label="Trust ledger"><div class="panel-heading"><div><p class="section-label">TRUST LEDGER</p><h2>Every decision, visible</h2></div><span class="shield" aria-hidden="true">◇</span></div><div class="audit-intro">A compact record of what the agent saw, what it proposed, and who allowed the change.</div><div class="audit-list">${this.renderAudit(run.id)}</div><div class="audit-foot"><span class="checkmark">✓</span><span>Plan-hash bound<br /><strong>Consent boundary active</strong></span></div></aside>
      </section><footer class="footer"><span>Latchline · synthetic public demo data</span><span><span class="footer-dot"></span> No production systems connected</span></footer><div class="sr-only" aria-live="polite">${escape(this.lastMessage)}</div>
    </main>`;
  }

  renderRunItem(run) { const assessment = assessRun(run, this.state.now); const selected = run.id === this.state.selectedRunId; return `<button class="run-item ${selected ? 'selected' : ''}" data-action="select" data-run-id="${escape(run.id)}" aria-pressed="${selected}"><span class="run-status ${statusTone(assessment.classification)}"></span><span class="run-item-copy"><strong>${escape(run.label)}</strong><span>${escape(run.project)}</span></span><span class="run-item-state">${STATUS_LABELS[assessment.classification]}</span></button>`; }

  renderAssessment(run, assessment, plan, approval, isRecovered) {
    if (isRecovered) return `<div class="recovered-card"><div class="recovered-icon">✓</div><div><p class="section-label">RECOVERY APPLIED</p><h3>The registry agrees with the worker.</h3><p>Release 8c31 is already live. Verify the postcondition, then the queued follow-up can be handled by a fresh run.</p></div><div class="recovered-actions"><button class="button button-primary" data-action="verify">Verify postcondition</button><button class="button button-quiet" data-action="undo">Undo recovery</button></div></div>`;
    const canPlan = assessment.classification === 'recoverable-stale' && plan !== null;
    const approvalCopy = approval ? 'Approved · ready to apply' : this.approvalRequested ? 'Review the plan below, then approve' : 'Awaiting human review';
    return `<div class="assessment ${statusTone(assessment.classification)}"><div class="assessment-top"><div><p class="section-label">EVIDENCE ASSESSMENT</p><h3>${escape(this.assessmentTitle(assessment.classification))}</h3></div><div class="confidence"><span>confidence</span><strong>${assessment.confidence}%</strong></div></div><p class="assessment-summary">${escape(assessment.reasons[0])}</p><div class="evidence-grid"><div class="evidence-card"><span class="evidence-label">REGISTRY SAYS</span><strong>${escape(run.registryStatus)}</strong><span class="evidence-source">control plane · current</span></div><div class="evidence-card"><span class="evidence-label">WORKER SAYS</span><strong>${escape(run.workerStatus)}</strong><span class="evidence-source">terminal evidence · ${run.lastProductiveAt ? formatAge(assessment.freshnessSeconds ?? 0) + ' ago' : 'unknown'}</span></div><div class="evidence-card"><span class="evidence-label">WAITING</span><strong>${run.queuedMessages} ${run.queuedMessages === 1 ? 'message' : 'messages'}</strong><span class="evidence-source">blocked by registry lock</span></div></div><div class="reasons">${assessment.reasons.map((reason) => `<div><span class="reason-check">✓</span>${escape(reason)}</div>`).join('')}</div>${canPlan ? this.renderPlan(plan, approval, approvalCopy) : `<div class="blocked-callout"><span>⊘</span><span>${escape(assessment.reasons[1] ?? 'No safe recovery plan exists for this run.')}</span></div>`}</div>`;
  }

  renderPlan(plan, approval, approvalCopy) { return `<div class="plan-card"><div class="plan-heading"><div><p class="section-label">RECOMMENDED RECOVERY</p><h3>Reconcile the registry</h3></div><span class="risk-pill">${plan.risk} risk</span></div><div class="transition"><span>registry</span><strong>${escape(plan.from)}</strong><span class="arrow">→</span><strong class="to-state">${escape(plan.to)}</strong><span>worker already succeeded</span></div><p class="plan-rationale">${escape(plan.rationale)}</p><div class="plan-meta"><div><span>PLAN HASH</span><code>${escape(plan.planHash)}</code></div><div><span>POSTCONDITION</span><strong>${escape(plan.expectedPostcondition)}</strong></div></div><div class="plan-actions">${approval ? '<button class="button button-primary" data-action="apply">Apply approved recovery <span aria-hidden="true">→</span></button>' : `<button class="button button-primary" data-action="approve">${this.approvalRequested ? 'Approve this exact plan' : 'Review & approve plan'} <span aria-hidden="true">→</span></button>`}<button class="button button-quiet" data-action="simulate">Simulate only</button><span class="approval-state ${approval ? 'approved' : ''}"><span>${approval ? '✓' : '○'}</span>${escape(approvalCopy)}</span></div></div>`; }
  renderTimeline(run) { return `<div class="timeline-section"><div class="timeline-heading"><p class="section-label">EVENT LEDGER</p><span>${run.events.length} events · append-only view</span></div><ol class="timeline">${run.events.map((item) => `<li><span class="timeline-marker ${item.actor}"></span><div><strong>${escape(item.summary)}</strong><span>${escape(item.detail ?? '')}</span></div><time>${shortTime(item.at)}</time></li>`).join('')}</ol></div>`; }
  renderAudit(runId) { const entries = this.state.audit.filter((entry) => entry.runId === runId).slice(0, 4); if (entries.length === 0) return '<div class="empty-state"><span>◇</span><p>No decisions recorded yet.</p></div>'; return entries.map((entry) => `<div class="audit-entry"><span class="audit-icon ${entry.action.includes('approval') ? 'human' : entry.actor}">${entry.action.includes('approval') ? '◌' : entry.actor === 'agent' ? '✦' : '✓'}</span><div><strong>${escape(this.auditLabel(entry.action))}</strong><span>${escape(entry.detail)}</span><time>${shortTime(entry.at)} UTC</time></div></div>`).join(''); }
  assessmentTitle(classification) { return classification === 'recoverable-stale' ? 'The run is stale, not running.' : classification === 'healthy' ? 'The run is healthy.' : classification === 'conflict' ? 'Two sources disagree.' : 'Not enough evidence to act.'; }
  auditLabel(action) { return action === 'runs.inspect' ? 'Agent inspected run' : action === 'approval.granted' ? 'Human approved plan' : action === 'recovery.applied' ? 'Recovery applied' : action === 'recovery.undone' ? 'Recovery undone' : action; }

  handleClick(event) {
    const target = event.target;
    const button = target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'select') { this.state.selectedRunId = button.dataset.runId ?? this.state.selectedRunId; this.approvalRequested = false; this.lastPlan = null; this.lastMessage = 'Run selected. Evidence is read-only until a plan is approved.'; this.render(); return; }
    if (action === 'reset') { this.state = createDemoState(); this.approvalRequested = false; this.lastPlan = null; this.lastMessage = 'Scenarios reset to their original evidence.'; this.render(); return; }
    const run = this.selectedRun();
    const result = reconcileRun(this.state, run.id);
    if (action === 'view-tools') { this.lastMessage = `${TOOL_NAMES.length} typed WebMCP tools are ready: ${TOOL_NAMES.join(', ')}.`; this.render(); return; }
    if (action === 'simulate') { this.lastMessage = result.plan ? `Simulation only: ${result.plan.from} → ${result.plan.to}; no mutation applied.` : 'No safe recovery plan exists for this evidence.'; this.render(); return; }
    if (action === 'approve' && result.plan) { this.approvalRequested = true; this.lastPlan = result.plan; approveRecovery(this.state, result.plan); this.lastMessage = 'Approved. The exact plan is now eligible for one apply call.'; this.render(); return; }
    if (action === 'apply' && result.plan) { const recovery = applyRecovery(this.state, result.plan, result.plan.planHash); this.lastPlan = result.plan; this.lastMessage = recovery.message; this.render(); return; }
    if (action === 'undo' && this.lastPlan) { const recovery = undoRecovery(this.state, this.lastPlan); this.lastMessage = recovery.message; this.render(); return; }
    if (action === 'verify' && this.lastPlan) { const verification = verifyPostcondition(this.state, run.id, this.lastPlan.planHash); this.lastMessage = verification.message; this.render(); }
  }
}

export function mountApp(root) { new LatchlineApp(root).mount(); }
