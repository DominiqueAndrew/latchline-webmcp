# Human-only gate pack

These are handoff instructions, not completed claims. No account agreements, CAPTCHA, video upload, or Devpost submission has been performed by the agent.

## Native WebMCP validation

Required: a supported Chrome 149+ build with the WebMCP testing flag enabled, or another authorized host that exposes the WebMCP DevTools panel.

1. Open the deployed Latchline URL in that browser.
2. Open DevTools → Application → WebMCP and confirm the six tools are listed: `runs.inspect`, `runs.reconcile`, `runs.simulate_recovery`, `runs.request_action`, `runs.apply_recovery`, and `runs.verify_postcondition`.
3. Invoke `runs.inspect` and `runs.reconcile` for `run_7f3a`; save the tool inputs/outputs and the plan hash as evidence.
4. Invoke `runs.request_action` with that exact plan hash. Confirm the result requests visible human approval and does not grant it.
5. Before approval, invoke `runs.apply_recovery` with the same run and plan hash plus an empty or invalid token; expected result is `human_approval_required` and registry remains `running`.
6. Use the visible page control `Review & approve plan`, then invoke apply with the exact approved plan hash. Confirm `recovery.applied`, then verify and undo through the visible workflow.

Fallback: the public page, deterministic Node tests, and browser workflow remain usable without native discovery. Record the browser version, flag state, exact limitation, and local evidence instead of claiming native validation.

## Video gate

Human action: record the route in `DEMO_SCRIPT.md` with audio, keep it below three minutes, review that no private data appears, and publish the public demo URL only after playback works.

## Devpost gate

Human action: review the official rules and eligibility, accept any required agreements, complete the submission form, attach the live URL, public open-source repository, license, and public demo video, and perform the final submission. The official rules page used for the research annex is [webmcp.devpost.com/rules](https://webmcp.devpost.com/rules). The repository must not claim submission until a human verifies the live Devpost record.
