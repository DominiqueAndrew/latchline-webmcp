# Latchline

Live demo: [latchline-webmcp.vercel.app](https://latchline-webmcp.vercel.app)

Latchline is a small, human-controlled recovery ledger for agent workflows. It makes one dangerous class of failure legible: the worker finished, but the control-plane registry still says `running`.

The demo is intentionally synthetic and local-first. It exposes six typed WebMCP tools that share the same visible state:

- `runs.inspect` — read the event and state ledger
- `runs.reconcile` — classify healthy, stale, conflict, or unknown evidence
- `runs.simulate_recovery` — preview a transition without mutation
- `runs.request_action` — place an exact plan in the visible approval queue
- `runs.apply_recovery` — apply only an approved plan hash
- `runs.verify_postcondition` — prove the registry and worker agree afterward

Nothing connects to a production runner, private account, or real database. The core research, sources, assumptions, and falsifiable evaluation plan are in [RESEARCH.md](./RESEARCH.md). Browser results and the native-host limitation are recorded in [docs/BROWSER_EVIDENCE.md](./docs/BROWSER_EVIDENCE.md).

## Run locally

```bash
npm install
npm run check
npm run dev
```

For native Chrome WebMCP testing, use Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled, then inspect the page in DevTools → Application → WebMCP. The page remains usable without native discovery so its human workflow and local contract tests are still reproducible.

## Demo path

1. Select the default `Checkout worker` run.
2. Inspect the evidence: worker succeeded, registry running, one message waiting.
3. Simulate, then review and approve the exact plan.
4. Apply the approved recovery and verify the postcondition.
5. Undo the recovery to demonstrate the reversible boundary.

The judge-facing route, timing, and narration are in [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md). Human-only browser, video, and Devpost handoffs are in [docs/HUMAN_GATE_PACK.md](./docs/HUMAN_GATE_PACK.md).

## License

MIT. See [LICENSE](./LICENSE).
