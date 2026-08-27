# Browser evidence

Validation date: 2026-08-27. This evidence covers both the local worktree and the public deployment; it is not a claim of Devpost submission or native WebMCP discovery.

Public URL: [https://latchline-webmcp.vercel.app](https://latchline-webmcp.vercel.app)

Release commit: `9e357fa` · Vercel deployment: `dpl_89DmFfryxg45avsFrrygL8EGmyrE` · status: `READY`

The Vercel production response returned HTTP 200 with `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Origin-Agent-Cluster: ?1`, `Cross-Origin-Resource-Policy: same-origin`, strict referrer policy, camera/microphone/geolocation disabled, and the repository Content-Security-Policy.

## Functional path

Local URL: `http://127.0.0.1:4173/?evidence=initial`

The same route was replayed against the public URL with `?evidence=live-ready`; after the startup window settled, the heading and stale scenario were present, the startup error was absent, and `scrollWidth === clientWidth` at 1440 px.

The browser interaction was performed through accessible button names:

1. `Review & approve plan` changed the visible status to `Approved. The exact plan is now eligible for one apply call.`
2. `Apply approved recovery` changed the registry from `running` to `succeeded` and showed `Recovery applied and ready for postcondition verification.`
3. `Verify postcondition` showed `Registry and worker agree on succeeded; the recovery is recorded in the audit ledger.`
4. `Undo recovery` returned the run to `Actionable`, showed `Recovery undone. No worker work was rerun.`, and required a new approval for any later apply.

The initial simulation path was also exercised: `Simulate only` showed `running → succeeded; no mutation applied.`

## Responsive evidence

All six target sizes reported no horizontal overflow (`scrollWidth === clientWidth`):

| View | Size | Result |
| --- | ---: | --- |
| Mobile | 390×844 | pass; stacked queue/detail layout |
| Tablet | 768×1024 | pass; two-column layout |
| Laptop | 1366×768 | pass; three-column workspace |
| Desktop | 1440×900 | pass; balanced three-column workspace |
| Large desktop | 1920×1080 | pass; constrained readable content |
| Wide desktop | 2560×1440 | pass; no stretch or clipping |

Proof-state screenshots captured locally:

- `/tmp/latchline-initial.png`
- `/tmp/latchline-approved.png`
- `/tmp/latchline-recovered.png`

## Native WebMCP boundary

The refreshed in-app browser advertised a `webmcp` capability wrapper, but `document.modelContext` evaluated to `false`; attempting one native discovery call returned `gpt-5.6-luna does not support command "webmcp_list_tools"`. No unsupported command was looped or treated as proof. The page still loads its registration module and keeps the human workflow available without native discovery.

Human validation pack: [HUMAN_GATE_PACK.md](./HUMAN_GATE_PACK.md).
