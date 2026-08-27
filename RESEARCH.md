# WebMCP Opportunity Sprint

Status: evidence gate before product code  
Research date: 2026-08-27 (Europe/Paris)  
Scope: public, non-sensitive, lawful sources; Sidequest is frozen and excluded from the candidate search.

## Executive decision

Select **Latchline: recoverable agent-run state** as the build thesis, subject to the go/no-go gate below.

The narrow wedge is a browser-native recovery console for one class of failure: the worker has produced terminal evidence, but the control-plane registry still says `running` (or the converse), so the next action is blocked. The page exposes structured, read-only inspection and reconciliation tools, a deterministic recovery plan, an explicit human approval boundary for mutation, and postcondition verification.

This is not a claim that agent-run failures are prevalent across the market. It is a falsifiable opportunity hypothesis supported by multiple firsthand engineering reports and a clearly reproducible state-divergence mechanism.

## Why this wedge fits WebMCP

The WebMCP draft defines in-page tools with names, descriptions, JSON-schema inputs, pending execution state, and explicit human-control/security considerations. Chrome describes the advantage as shared state and structured schemas over DOM actuation, and specifically lists diagnostic tools and confirmation for sensitive actions as use cases. Latchline makes those capabilities the product, rather than adding a chat box to an existing workflow:

1. The user sees the same run ledger and evidence the agent sees.
2. The agent can call typed tools to inspect, classify, simulate, request approval, apply a reversible action, and verify the resulting state.
3. The page remains the source of truth for the demo; no backend credentials, production integrations, or private data are needed.
4. A mutation is not exposed as an unconditional “fix” tool. The tool returns a plan and requires a page-local user approval token tied to that plan.

## Evidence map

“Frequency” below means the frequency reported in that source or observed in the cited fixture set. It is not a population estimate. “Cost” is the reported or directly implied operational consequence, not a fabricated dollar value.

| ID | Dated source and class | Affected users | Pain / frequency / severity signal | Current workaround and failure cost | Uncertainty |
|---|---|---|---|---|---|
| E1 | [OpenHands SDK issue #3842](https://github.com/OpenHands/software-agent-sdk/issues/3842), opened 2026-06-22; firsthand issue | Self-hosted OpenHands users on a flaky link | A conversation reports `idle` while `/run` returns 409; every new message is persisted but not processed; the report says the wedge is permanent until restart | Restart the agent-server; queued work only resumes after state reload. This is a high-severity single report, with a concrete state divergence and reproduction diagnostic | One reporter and one environment; prevalence unknown; “permanent” is the reporter’s observed behavior |
| E2 | [Paperclip issue #5350](https://github.com/paperclipai/paperclip/issues/5350), opened 2026-05-06; firsthand engineering issue | Multi-agent Paperclip team | Four confirmed zombie-lock occurrences in 24 hours on one instance with five active agents; issue remains locked and returns 409 | CEO/CTO manually PATCHes `checkoutRunId: null`; this bypasses the stale check and requires privileged intervention | One instance and one team; issue was later closed; evidence supports recurrence and cost, not current prevalence |
| E3 | [Paperclip issue #6399](https://github.com/paperclipai/paperclip/issues/6399), observed 2026-05-07–2026-05-19; incident timeline in a firsthand issue | Paperclip agent operators | The timeline records 12 occurrences across roughly 12 days, including runs stuck 3.5+ hours, 3.7 hours, and 581 minutes; one incident required killing a zombie process and direct database clearing | Direct PostgreSQL updates, force-release, manager escalation, or waiting for self-recovery; the report describes board-user intervention and capacity leakage | Self-reported incident set; detection and recording may be biased; not a vendor-wide rate |
| E4 | [OpenClaw issue #90444](https://github.com/openclaw/openclaw/issues/90444), opened 2026-06-04; firsthand issue | OpenClaw operators | Terminal worker state and task-registry state diverge; rows remain “running” after termination, producing misleading/sticky failures | Manual database repair is the only reported clear path; registry inconsistency blocks normal flow | One issue report; the report does not establish frequency |
| E5 | [Google SRE on-call discussion](https://www.reddit.com/r/sre/comments/1q2tcu5/oncall_question_what_actually_slows_your_incident/), posted 2026-01-03; practitioner community | On-call engineers | Firsthand responses describe 10–15 minutes of orientation, buried runbooks, escalation hops around 20 minutes, and uncertainty about what changed | Search wiki/runbooks, identify owners, inspect dashboards, and manually coordinate; the cost is mitigation delay and cognitive load | Reddit is an anecdotal sample; reports are not independent measurements |
| E6 | [Google SRE runbook discussion](https://www.reddit.com/r/sre/comments/1czqk3s/how_does_your_team_handle_runbooks/), posted 2024-05-24; practitioner community | SRE teams maintaining operational procedures | Teams report wiki-linked runbooks, considering PagerDuty automation, and needing an engineer to verify the documentation is still valid | Tiered wiki runbooks or products that execute runbook series; stale documentation can make automation unsafe | Anecdotal and self-selected; useful for workflow/workaround evidence, not prevalence |
| E7 | [Auto-documentation for on-call](https://www.reddit.com/r/sre/comments/1dmgus0/reducing_oncall_pain_through_autodocumentation/), posted 2024-06-23; practitioner community | Engineers unfamiliar with inherited systems | A firsthand startup/on-call report describes missing or shoddy docs; replies distinguish recurring issues from high-cost, low-frequency issues | Capture commands, outputs, and queries into a future runbook; other replies warn that human-only steps are not reliable automation | Qualitative community discussion; no denominator |
| E8 | [AMA prior-authorization survey report](https://www.ama-assn.org/practice-management/prior-authorization/exhausted-prior-auth-many-patients-abandon-care-ama-survey), 2024-07-18; professional survey/advocacy source | Physicians and patients | Survey of 1,000 physicians: 94% reported delayed necessary care, 78% reported patients sometimes/often abandoning treatment, and 43 prior authorizations per physician per week | Fax, phone calls, resubmission, and appeals; the report cites serious adverse-event and burnout signals | Physician-reported advocacy survey, not claims data or causal proof; figures should not be generalized beyond the sample |
| E9 | [Prior-authorization claim denial thread](https://www.reddit.com/r/HealthInsurance/comments/122uujx/appealing_a_claim_denial_that_had_prior/), posted 2023-03-26; firsthand patient thread | Patient with a high-value claim and clinical providers | Multiple representatives gave conflicting explanations; CPT, date, tax-ID, hospital/surgeon mismatches caused repeated denials | Repeated calls, reprocessing, and an appeal; the thread describes a mid-six-figure hospital claim and repeated failure | Single patient account; exact claim details cannot be independently verified |
| E10 | [WebAIM Million 2025](https://webaim.org/projects/million/2025), February 2025 analysis; updated 2025-03-31; population audit | Users with disabilities encountering the top one million home pages | 50,960,288 detectable errors, average 51/page; 4.1% of page elements had a detected error; 96% of errors fell into six categories | Manual remediation, audits, and WCAG checks; WebAIM emphasizes automated tools cannot detect every barrier | Home pages are a subset; detectable errors are not the same as user harm; correlation is not causation |
| E11 | [Fabrication and errors in ChatGPT citations](https://www.nature.com/articles/s41598-023-41032-5), published 2023-09-07; peer-reviewed study | Students, researchers, editors, and downstream readers | Across 84 generated documents and 636 cited works, 55% of GPT-3.5 citations and 18% of GPT-4 citations were fabricated; 43% and 24% of real citations respectively had substantive errors | Human verification against databases and source documents; every bibliography item requires checking | Study prompts/models are historical; it measures generated documents, not all user workflows |
| E12 | [CiteTracer](https://arxiv.org/abs/2605.08583), v1 2026-05-09, v2 2026-07-14; research preprint | Auditors of LLM-generated references | Introduces field-level adjudication, evidence retrieval, deterministic matching, and specialist routing; reports 2,450 synthetic plus 957 real-world fabricated citations | Retrieval caches, URL fetches, scholar connectors, web search, and human/agent adjudication | Preprint and benchmark construction may not represent live scholarly traffic; reported scores are not independently reproduced here |
| E13 | [Lancet audit of fabricated citations](https://pubmed.ncbi.nlm.nih.gov/42107362/), published 2026-05-09; peer-reviewed/abstract record | Biomedical authors, reviewers, and readers | Audit covers 2.5 million biomedical papers; companion reporting describes nearly 3,000 papers with references untraceable to known publications | Editorial checking and bibliographic databases; a failure is discovered late in the publication process | The PubMed record has no abstract here; the Nature report correction says the screened corpus was PMC Open Access, not all PubMed |
| E14 | [NIST SP 800-61r3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf), April 2025; engineering standard/guidance | Organizations responsible for incident response | NIST says incidents are frequent, increasingly complex, and may take weeks or months to recover from; response is continuous risk management | CSF 2.0 functions, roles, response plans, lessons learned, and shared language | Guidance is normative and general; it does not prove a particular product’s outcome |
| E15 | [GAO-25-107239](https://files.gao.gov/reports/GAO-25-107239/index.html), published 2025-04-21; government audit | People eligible for federal benefits and agencies serving them | GAO cites an OMB estimate that eligible Americans forgo more than $140B in federal benefits annually, partly due to administrative burden | Reduce forms, document burden, collect feedback, and improve program processes | The $140B estimate is cited by GAO from OMB; it is not a direct experiment and is not specific to one benefit |
| E16 | [WebMCP privacy/security discussion #45](https://github.com/webmachinelearning/webmcp/issues/45), opened 2025-10-25; WebMCP community issue | Web developers and users of authenticated sites | The report identifies misrepresentation of tool intent, prompt injection, over-parameterized privacy leakage, and high-privilege actions under inherited browser identity | Action-specific permission, backend verification, or future protocol changes; it explicitly questions what the browser can enforce | Community proposal, not a finalized requirement or measured attack rate |

## Evidence synthesis

The best-supported repeated pain is not “agents make mistakes” in the abstract. It is **control-plane ambiguity after partial execution**:

- E1 and E4 show user-visible or registry-visible state contradicting execution reality.
- E2 and E3 show the divergence can repeat and can require privileged database or process intervention.
- E5–E7 show the adjacent human workflow already spends time orienting, finding stale runbooks, and deciding whether a corrective action is safe.
- E14 provides an engineering rationale for exposing detect/respond/recover/learn as a continuous loop, but does not validate the product itself.
- E16 makes consent, identity, and action-specific authorization design constraints rather than optional polish.

The alternatives have stronger broad pain evidence in some domains, but each carries a harder proof boundary for a public hackathon: clinical/legal harm and privacy for prior authorization, inaccessible automation claims for accessibility, and a crowded verification market for citations.

## Concepts considered

### C1 — Latchline: agent-run recovery ledger (selected)

A synthetic run control plane with an event log, derived registry, evidence classifier, recovery simulator, approval token, reversible action, and postcondition verifier. The demo deliberately injects a stale registry / terminal worker mismatch and lets an agent recover it through typed tools while the human sees every state transition.

Unique WebMCP advantage: the agent does not scrape a dashboard to guess whether “running” means alive. It asks the page for a typed consistency report and receives a structured, bounded recovery plan linked to the exact visible evidence.

### C2 — Incident Bridge

An incident-response page that binds an alert to recent changes, dependency health, first checks, runbook steps, and an approved reversible mitigation. The agent proposes “what changed / what is safe to test,” while the user owns the action.

Unique WebMCP advantage: shared live state and tool schemas reduce orientation across alert, ownership, evidence, and mitigation. Risk: many established incident products already occupy this space, and realistic integrations are difficult without credentials.

### C3 — CiteTrace Ledger

A claim-to-source ledger for a short technical memo. The agent extracts references, checks DOI/URL/title/author fields, classifies Real/Potential/Hallucinated, and refuses “verified” status until the user reviews ambiguous matches.

Unique WebMCP advantage: the page can expose structured field-level verification and provenance state instead of asking an agent to copy bibliographies through a text box. Risk: existing citation tools and the strongest benchmark already solve much of the technical core.

### C4 — A11y Patch Bay

An accessibility finding page that groups WCAG failures by source element, proposes a minimal patch, previews the change, requests review, and runs a deterministic before/after check. It must distinguish detectable success from conformance.

Unique WebMCP advantage: the agent calls `find_issue`, `propose_patch`, `preview_patch`, and `verify_fix` against a shared rendered page, rather than editing arbitrary DOM through a screenshot loop. Risk: automated remediation can create new barriers and requires careful scope.

### C5 — ProofPack for administrative appeals

A privacy-minimized packet builder for a fictional prior-authorization or benefits appeal. It checks required evidence, date/provider/code consistency, missing fields, deadline risk, and produces a human-reviewed packet without deciding medical necessity or submitting anything.

Unique WebMCP advantage: structured schemas can map evidence to exact fields and show missing/contradictory proof to both agent and person. Risk: sensitive-domain expectations, regulatory nuance, and an unsafe impression of legal/medical advice make an ambitious live demo ethically harder.

## Weighted scorecard

Scoring is on a 1–5 scale. A 5 means stronger opportunity fit; for time-to-proof, 5 means the core claim can be demonstrated quickly with synthetic public data. Scores are judgments grounded in the evidence map, not market-size estimates.

Weights:

```text
evidenced pain       22%
WebMCP fit           16%
technical depth      14%
defensibility        12%
judge wow            12%
novelty              10%
ethical feasibility   8%
time-to-proof         6%
total                100%
```

The normalized score is:

```text
S(concept) = sum_i (weight_i * rating_i / 5)
```

| Concept | Pain | WebMCP | Depth | Defense | Wow | Novelty | Ethics | Proof | Total / 5 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C1 Latchline | 5 | 5 | 5 | 4 | 5 | 4 | 4 | 4 | **4.64** |
| C4 A11y Patch Bay | 5 | 4 | 4 | 3 | 4 | 4 | 5 | 3 | 4.12 |
| C2 Incident Bridge | 5 | 4 | 5 | 3 | 4 | 3 | 3 | 4 | 4.06 |
| C3 CiteTrace Ledger | 4 | 5 | 4 | 4 | 4 | 3 | 4 | 3 | 4.00 |
| C5 ProofPack | 5 | 4 | 4 | 3 | 4 | 3 | 2 | 3 | 3.78 |

### Score interpretation and sensitivity

C1 wins because it has the clearest intersection of repeated firsthand evidence, protocol-native state reconciliation, a visible safety boundary, and a fully synthetic demonstration. It is not being selected because its score is mathematically objective; the score makes assumptions reviewable.

The ranking is stable under the main reasonable objection—“ethical feasibility matters more.” C1 uses no personal, financial, health, or production data and can keep all state transitions reversible; C5’s score drops materially under a stricter harm model. If later research shows that state-divergence reports are isolated to one implementation family, C1 must be rejected or reframed as a developer-tooling experiment rather than a broad product claim.

## Selected falsifiable thesis

> For a bounded synthetic multi-step agent workflow containing recoverable stale-state failures, a page-native reconciliation protocol with typed inspection, deterministic recovery planning, explicit human authorization, and postcondition verification will reduce median time-to-safe-recovery and eliminate unauthorized mutations compared with DOM-only dashboard actuation or a blind restart policy, while preserving an auditable state-transition ledger.

### Variables and decision rules

Let:

- `E` = event-log evidence (worker heartbeats, terminal output, timestamps, and action records).
- `R` = derived registry state (`queued`, `running`, `succeeded`, `failed`, `stale`, or `unknown`).
- `A(tau)` = evidence of productive activity within the freshness window `tau`.
- `P` = recovery plan containing a precondition, reversible action, expected postcondition, and risk label.
- `H` = explicit page-local human approval bound to a hash of `P`.

Deterministic classification for the initial wedge:

```text
RECOVERABLE_STALE = terminalEvidence(E)
                    AND R in {queued, running, stale}
                    AND NOT A(tau)
                    AND no conflicting live worker evidence

CONFLICT = terminalEvidence(E) AND productiveEvidence(E, tau)
           OR registryEvidence(R) contradicts worker evidence in both directions

UNKNOWN = all other cases
```

Mutation gate:

```text
apply(P) is allowed iff
  classification == RECOVERABLE_STALE
  AND H == approve(hash(P))
  AND preconditions(P) still hold at commit time
```

No action is allowed for `CONFLICT` or `UNKNOWN`; the tool must return an explanation and a human escalation path. A “force end” or reset action is never bundled into inspection.

Primary evaluation metrics:

```text
T_safe = time from fixture load to verified postcondition
R_correct = recoveries that match the fixture truth / recoverable fixtures
F_harmful = harmful mutations / all mutation attempts
U = unauthorized mutation count
L_audit = fraction of state transitions with evidence, actor, plan hash, and timestamp
```

The initial acceptance targets are `R_correct >= 0.95` on a deterministic fixture set, `F_harmful = 0`, `U = 0`, `L_audit = 1.0`, and a lower median `T_safe` than both a blind-restart baseline and a scripted DOM-only baseline. These are build targets, not results.

## Demonstrable architecture after the research gate

```text
synthetic event fixtures
        |
        v
event log -> derived registry -> consistency classifier -> recovery planner
                                                      |
                                      human approval <-+-> WebMCP tools
                                                      |
                                 reversible mutation -> postcondition verifier
                                                      |
                                             append-only audit ledger
```

Proposed modules (not yet created):

- `domain/`: typed run, event, evidence, plan, approval, and audit models.
- `engine/`: reducer, freshness checks, classifier, deterministic planner, and verifier.
- `fixtures/`: public synthetic scenarios including healthy, stale, conflict, unknown, and already-recovered states.
- `webmcp/`: registration and adapters for at least five tools: `runs.inspect`, `runs.reconcile`, `runs.simulate_recovery`, `runs.request_action`, `runs.apply_recovery`, and `runs.verify_postcondition`.
- `ui/`: normal operator console with visible event ledger, evidence explanation, approval modal, loading/error/empty states, and responsive layout.
- `tests/`: reducer/property-like fixture tests, WebMCP schema/contract tests, consent-boundary tests, and browser smoke tests.

The public demo will never connect to a real agent runner, identity provider, database, healthcare record, or customer account.

## Go/no-go gate before product code

Build only if all are true:

1. At least three independent firsthand/public engineering reports support state or workflow recovery pain; currently E1–E4 satisfy this provisionally, with independence caveats.
2. At least one source contains repeated observations or a multi-incident timeline; E2 and E3 satisfy this provisionally.
3. The core demo can show inspect → reconcile → approval → reversible action → verify in under three minutes with no login or secrets.
4. The product can expose at least five meaningful typed WebMCP tools whose schemas and outputs materially change the workflow.
5. The action boundary can be tested with an invariant `U = 0` and an approval token bound to a plan hash.
6. The baseline comparison can be reproduced locally without an LLM: a deterministic agent-like caller, DOM-only scripted path, and blind restart policy.
7. The user-facing claim stays bounded to “recoverable stale execution state in this fixture class”; no claim of universal agent reliability.

Reject or pivot if any of these fail. In particular, do not build a generic dashboard if the WebMCP tools are only decorative, and do not use real credentials or sensitive data to manufacture realism.

## Challenge and protocol constraints checked

- [Official Devpost rules](https://webmcp.devpost.com/rules), retrieved 2026-08-27: the page lists the September 3, 2026 1:00pm PDT deadline, which converts to `2026-09-03T20:00:00Z`; permits individuals; requires a live URL, public open-source repository, and public demo video under three minutes with audio; asks entrants to explain WebMCP leverage, UX, prior difficulty, and implementation; judging criteria are WebMCP Leverage, Execution, Potential Impact, and Creativity & Ambition; the top-ten prize is $3,000 cash plus sponsor benefits.
- [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/), draft Community Group Report dated 2026-08-26/retrieved 2026-08-27: in-page tools, structured schemas, shared state, pending executions, abortability, human-control/security considerations, and same-origin/permission boundaries are relevant to this design. It is a draft, not a W3C standard.
- [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp), last updated 2026-08-07: structured tools and JSON schemas are presented as more reliable than DOM actuation; examples include diagnostics and confirmation for sensitive actions; local testing uses the WebMCP flag and Chrome 149 origin-trial path.
- [Chrome WebMCP DevTools](https://developer.chrome.com/docs/devtools/application/webmcp), last updated 2026-05-12: the Application panel exposes available tools, invocation history, inputs/outputs, schema violations, and manual testing. These are the intended browser-validation artifacts after implementation.
- [WebMCP privacy/security issue #45](https://github.com/webmachinelearning/webmcp/issues/45), opened 2025-10-25: community discussion flags tool-intent misrepresentation, prompt injection, inherited identity, and the need for action-specific permission. This informs the approval-token and no-sensitive-data boundary but is not a normative spec requirement.

## Reproducibility protocol

1. Save the exact source URLs and retrieval date in this file; preserve source class and uncertainty labels.
2. Generate deterministic JSON fixtures with event timestamps, terminal evidence, registry state, productive-activity windows, and expected truth.
3. Run the reducer/classifier/planner against every fixture and record `R_correct`, `F_harmful`, `U`, and `L_audit`.
4. Run the same scenarios through three baselines: direct DOM/scripted clicks, blind restart, and structured WebMCP tool calls.
5. Capture exact test command, commit SHA, deployment URL, Chrome version/flag, DevTools WebMCP evidence, and any unsupported host limitation.
6. Do not report browser or native-agent behavior as validated unless the browser actually discovers and invokes the registered tools. A blank in-app browser tab or unsupported native command is a limitation record, not success evidence.

## Connector limitation

The Devpost Hackathons connector was not callable in this runtime. No connector facts were invented; the official Devpost rules page above was used directly. Final submission and any agreement/eligibility confirmation remain human-only gates.

## Browser validation evidence (2026-08-27)

- Local URL: `http://127.0.0.1:4173/?evidence=initial`, served from this repository with `npm run dev -- --bind 127.0.0.1`.
- Public URL: [https://latchline-webmcp.vercel.app](https://latchline-webmcp.vercel.app), verified with HTTP 200 and the same workflow after the deployment build completed.
- The first blank render was a real module-loading defect: `src/main.js` imported `./ui/styles.css` as JavaScript, and Chrome rejected the response because its MIME type was `text/css`. The fix moved the stylesheet to the document `<link>` and added a visible startup error fallback in `index.html`.
- After the fix, the browser exposed the expected heading, three synthetic runs, evidence assessment, plan hash, audit ledger, and trust ledger. The scripted path recorded: simulation without mutation; explicit approval; apply; postcondition verification; and undo with the registry returned to `running`.
- Geometry checks at 390×844, 768×1024, 1366×768, 1440×900, 1920×1080, and 2560×1440 reported `scrollWidth === clientWidth` at every size. The captured proof states are listed in `docs/BROWSER_EVIDENCE.md`.
- The available browser capability list exposed page assets and Chrome DevTools Protocol but no native WebMCP capability; `document.modelContext` was `false` in the authorized browser host. This is a host limitation, not evidence that the page lacks its registration code. Native tool discovery remains a human handoff requiring a supported Chrome 149+ build and the WebMCP testing flag.

## Research non-goals

- No product code, new repository, or deployment is created as part of this pre-build sprint.
- No production agent, cloud account, authenticated SaaS, healthcare record, financial account, or personal data is integrated.
- No universal claim about agent reliability, incident prevalence, accessibility conformance, citation correctness, or healthcare outcomes is made.
- No Devpost project is submitted or represented as submitted.
