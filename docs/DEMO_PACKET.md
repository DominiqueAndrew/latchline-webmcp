# Latchline demo and submission packet

This packet is a draft handoff for the human video and Devpost gates. It is
not a submission, does not claim native WebMCP discovery, and must be refreshed
after any code or deployment change.

## One-line pitch

Latchline gives agents a typed, page-native way to reconcile a stuck workflow
without rerunning completed work, while the person keeps the final mutation
decision.

## Judge-facing description

Latchline is a synthetic recovery ledger for a common control-plane failure: a
worker has already succeeded, but the registry still says `running` and blocks
the next message. The page exposes six typed WebMCP tools over the same visible
state: inspect, reconcile, simulate, request approval, apply an exact approved
plan, and verify the postcondition.

The WebMCP advantage is shared structured state. An agent does not scrape a
dashboard and guess what “running” means; it receives bounded evidence,
confidence, reasons, a deterministic plan hash, and an expected postcondition.
The mutation tool is not a force-end shortcut: it fails closed unless the page
has recorded human approval for the current plan hash and the preconditions
still hold. The original event ledger is preserved, and the demo can undo the
recovery.

The public demo uses no credentials, production runners, private accounts, or
real customer data. The local deterministic evaluation compares structured
WebMCP, a generous DOM-only baseline, and blind restart across stale, healthy,
and conflicting fixtures. The structured path is safe on all three fixtures,
uses a median of two modeled steps, performs zero reruns and zero unauthorized
mutations, and preserves the event ledger.

## 90–120 second recording plan

Use the public URL at 1440×900 or 1920×1080, browser zoom 100%, and only the
synthetic data. Narrate the visible state; do not show private tabs or enter
credentials.

1. **0:00–0:12 — Frame the failure.** Show `Checkout worker`: registry
   `running`, worker `succeeded`, 13-minute freshness gap, one queued message,
   and 98% confidence.
2. **0:12–0:28 — Show the typed contract.** Point to the six tools and explain
   that `runs.reconcile` returns a bounded assessment and plan hash instead of
   guessing from DOM text.
3. **0:28–0:40 — Simulate.** Click `Simulate only`; show `running → succeeded`
   with “no mutation applied.”
4. **0:40–0:56 — Keep consent visible.** Click `Review & approve plan`; pause
   on the trust-ledger entry `Human approved plan` and the exact plan hash.
5. **0:56–1:12 — Apply.** Click `Apply approved recovery`; show that only the
   registry changes and the worker is not rerun.
6. **1:12–1:25 — Verify.** Click `Verify postcondition`; show the audit
   confirmation that registry and worker agree.
7. **1:25–1:38 — Undo.** Click `Undo recovery`; show the run returning to
   `Actionable` and the message that no worker work was rerun.
8. **1:38–1:50 — Close on the thesis.** “Typed shared state reduces
   orchestration overhead while a page-owned approval boundary prevents an
   agent from mutating a stale or conflicting run.”

Keep the final cut below three minutes with clear audio. Include native
WebMCP DevTools footage only after the human gate succeeds; otherwise say that
native discovery is pending and show the reproducible local contract/evaluation
evidence instead.

## Devpost field draft

- **Project name:** Latchline
- **Tagline:** Recover workflow state with proof, not blind restarts.
- **Live URL:** https://latchline-webmcp.vercel.app
- **Public repository:** https://github.com/DominiqueAndrew/latchline-webmcp
- **License:** MIT
- **Video URL:** human-owned public YouTube link, to be added after playback and
  privacy review
- **Repository provenance:** The first repository commit is `299406a`, dated
  `2026-08-27T18:49:56+02:00`; retain this dated history so a human can show the
  project was created during the published submission period if requested.
- **Implementation summary:** The page registers six imperative WebMCP tools
  with bounded JSON Schemas. Read-only tools expose evidence and plans; the
  action tool requires a page-recorded approval token equal to the current plan
  hash, rechecks the stale-state preconditions, mutates only the registry, and
  records an audit entry. The UI renders the same state an agent reads and
  keeps simulation, approval, apply, verify, and undo visible.

## Submission checklist

- [ ] Human joins the hackathon and confirms eligibility/account requirements.
- [ ] Human validates native tools in Chrome 149+ with the WebMCP testing flag
      or an authorized WebMCP DevTools host; save the available-tools list,
      invocation inputs/outputs, and the pre-approval failure.
- [ ] Human records a narrated video under three minutes and publishes it
      publicly on YouTube without unlicensed music or third-party material.
- [ ] Human checks that the live URL works without login and behaves as shown in
      the video.
- [ ] Human confirms the repository is public, contains source/instructions,
      and visibly exposes the MIT license.
- [ ] Human retains the dated repository history and confirms any eligibility or
      new-versus-existing-project requirements before submitting.
- [ ] Human enters the text description, live URL, repository URL, and public
      video URL on Devpost, then performs the final submission.
- [ ] Human verifies the live Devpost record; do not describe the project as
      submitted before that check.

## Evidence locations

- Native handoff and limitations: `docs/HUMAN_GATE_PACK.md`
- Browser and deployment evidence: `docs/BROWSER_EVIDENCE.md`
- Narration route: `docs/DEMO_SCRIPT.md`
- Research, assumptions, evaluation math, and limitations: `RESEARCH.md`
- Local visual artifacts: `output/playwright/`

Official references: [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp), [Chrome WebMCP DevTools](https://developer.chrome.com/docs/devtools/application/webmcp), [WebMCP draft](https://webmachinelearning.github.io/webmcp/), and [the official WebMCP Challenge rules](https://webmcp.devpost.com/rules).
