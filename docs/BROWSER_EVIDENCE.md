# Browser evidence

Validation date: 2026-08-27. This evidence covers both the local worktree and the public deployment; it is not a claim of Devpost submission or native WebMCP discovery.

Public URL: [https://latchline-webmcp.vercel.app](https://latchline-webmcp.vercel.app)

Release commit: `4fd45902a03a4ed9d579f9e661d34f24af07acd9` · Vercel deployment: `dpl_BnsuVP8Cc8HeLsujsg5qUzjLnQds` · status: `READY` · deployment URL: [latchline-webmcp-5pll251bf-rhetorix.vercel.app](https://latchline-webmcp-5pll251bf-rhetorix.vercel.app)

The Vercel production inspection shows `Cache-Control: no-store`, `Vercel-CDN-Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Origin-Agent-Cluster: ?1`, `Cross-Origin-Resource-Policy: same-origin`, strict referrer policy, camera/microphone/geolocation disabled, and the repository Content-Security-Policy. A live root request returned HTTP 200 with HTML content type, `Cache-Control: no-store`, the configured CSP/referrer/nosniff headers, HSTS, and a Vercel request ID.

## Functional path

Local URL: `http://localhost:4173/?evidence=release-gate`, served from the clean checkout with `npm run dev -- --bind 127.0.0.1`.

The public alias was opened directly; after the startup window settled, the heading and stale scenario were present, the startup error was absent, and `scrollWidth === clientWidth` at all six required viewport sizes.

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

Proof-state screenshots captured locally by the responsive review:

- `output/playwright/initial-mobile.png`, `initial-tablet.png`, `initial-laptop.png`, `initial-desktop.png`, `initial-large-desktop.png`, `initial-wide-desktop.png`
- `output/playwright/recovered-top-mobile.png`, `recovered-top-tablet.png`, `recovered-top-laptop.png`, `recovered-top-desktop.png`, `recovered-top-large-desktop.png`, `recovered-top-wide-desktop.png`

## Native WebMCP boundary

The refreshed Codex In-app Browser exposed the tab capabilities `pageAssets`, `webmcp`, and `cdp`, but `document.modelContext` evaluated to `false`; the host also did not expose a browser version through the page scope. Attempting one native discovery call returned `gpt-5.6-luna does not support command "webmcp_list_tools"`. No unsupported command was looped or treated as proof. The page still loads its registration module and keeps the human workflow available without native discovery.

Human validation pack: [HUMAN_GATE_PACK.md](./HUMAN_GATE_PACK.md).
