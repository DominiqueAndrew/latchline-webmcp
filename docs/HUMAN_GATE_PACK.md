# Human-only gate pack

These are handoff instructions, not completed claims. No account agreements, CAPTCHA, video upload, or Devpost submission has been performed by the agent.

## Native WebMCP validation

Required: a supported Chrome 149+ build with the WebMCP testing flag enabled, or another authorized host that exposes the WebMCP DevTools panel.

Spec alignment: the current WebMCP draft defines `readOnlyHint` and `untrustedContentHint`; it does not define a native `destructiveHint`. Latchline communicates the mutation boundary in the tool description and enforces it in page-owned approval state, exact plan hashes, and precondition checks. The deployment sets `Origin-Agent-Cluster: ?1` and explicitly permits same-origin WebMCP with `tools=(self)` while disabling unrelated camera, microphone, and geolocation permissions.

1. Open the deployed Latchline URL in that browser.
2. Open DevTools → Application → WebMCP and confirm the six tools are listed: `runs.inspect`, `runs.reconcile`, `runs.simulate_recovery`, `runs.request_action`, `runs.apply_recovery`, and `runs.verify_postcondition`.
3. Invoke `runs.inspect` and `runs.reconcile` for `run_7f3a`; save the tool inputs/outputs and the plan hash as evidence.
4. Invoke `runs.request_action` with that exact plan hash. Confirm the result requests visible human approval and does not grant it.
5. Before approval, invoke `runs.apply_recovery` with the same run and plan hash plus an empty or invalid token; expected result is `human_approval_required` and registry remains `running`.
6. Use the visible page control `Review & approve plan`, then invoke apply with the exact approved plan hash. Confirm `recovery.applied`, then verify and undo through the visible workflow.

Fallback: the public page, deterministic Node tests, and browser workflow remain usable without native discovery. Record the browser version, flag state, exact limitation, and local evidence instead of claiming native validation.

Observed authorized-host limitation on 2026-08-27: the in-app tab advertised a `webmcp` capability wrapper, but `document.modelContext` was `false`; one discovery attempt returned `gpt-5.6-luna does not support command "webmcp_list_tools"`. A connected Chrome tab rendered `WebMCP-ready page`; the local Chrome binary is `151.0.7922.174`, but the controlled browser did not expose the testing-flag state or the WebMCP DevTools panel. This is the complete negative evidence for the available hosts. Do not repeat the unsupported call in a loop.

Exact handoff evidence to capture on a supported host: browser name and version; `chrome://flags/#enable-webmcp-testing` state; DevTools → Application → WebMCP screenshot showing all six tool names; one read-only `runs.inspect` output for `run_7f3a`; one `runs.reconcile` output containing `pln_c33b1161`; and the pre-approval `human_approval_required` result from `runs.apply_recovery`. Do not submit or transmit credentials, private data, or the Devpost entry during this validation.

## Video gate

Human action: record the route in `DEMO_SCRIPT.md` with audio, keep it below three minutes, review that no private data appears, and publish the public demo URL only after playback works.

## Devpost gate

Human action: review the official rules and eligibility, accept any required agreements, complete the submission form, attach the live URL, public open-source repository, license, and public demo video, and perform the final submission. The official rules page used for the research annex is [webmcp.devpost.com/rules](https://webmcp.devpost.com/rules). The repository must not claim submission until a human verifies the live Devpost record.
