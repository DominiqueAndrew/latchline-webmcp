# Latchline demo script

Target length: 90–120 seconds. Use the public deployment once its URL is recorded in the release receipt.

## Story

“A worker finished publishing, but the control plane still says the run is active. The follow-up is blocked. Latchline lets an agent inspect the mismatch and prepare a bounded repair, while the person retains the final mutation decision.”

## Route

1. Start on Checkout worker. Point out `running` in the registry, `succeeded` in worker evidence, the 13-minute freshness gap, one waiting message, and confidence 98%.
2. Open or invoke the read-only inspection/reconciliation path. Call out the deterministic plan hash `pln_c33b1161` and the postcondition; emphasize that rerunning the worker is not proposed.
3. Click `Simulate only`. Show that the status says no mutation was applied.
4. Click `Review & approve plan`. Pause on the visible trust-ledger entry: `Human approved plan`.
5. Click `Apply approved recovery`. Show the registry and worker agreeing on `succeeded`; explain that only the stale registry state changed.
6. Click `Verify postcondition`. Show the audit confirmation.
7. Click `Undo recovery`. End on the restored actionable state and the message that no worker work was rerun.

## Judge point

The WebMCP value is shared, typed state: an agent can request a bounded inspection and receive a structured assessment and plan tied to the exact page state. The mutation tool is clearly marked as untrusted content and fails closed unless the visible page has recorded approval for the exact plan hash.

## Recording notes

- Keep the browser zoom at 100% and show the whole workspace at 1440×900 or 1920×1080.
- Use only the synthetic public demo data. Do not enter credentials or show private browser tabs.
- Keep the final cut under three minutes with audible narration. Native WebMCP DevTools evidence should be included only after the human gate in `HUMAN_GATE_PACK.md` succeeds.
