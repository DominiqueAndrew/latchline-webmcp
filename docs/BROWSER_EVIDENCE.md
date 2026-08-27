# Browser evidence

Validation date: 2026-08-27. This is local browser evidence for the current worktree; it is not a claim of Devpost submission or native WebMCP discovery.

## Functional path

URL: `http://127.0.0.1:4173/?evidence=initial`

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

The authorized browser host did not expose a native WebMCP capability, and `document.modelContext` evaluated to `false`. No unsupported native command was looped or treated as proof. The page still loads its registration module and keeps the human workflow available without native discovery.

Human validation pack: [HUMAN_GATE_PACK.md](./HUMAN_GATE_PACK.md).
