# PM Agent Studio Architecture

PM Agent Studio combines two reference systems into one PM-focused AI workspace:

- OpenDesign provides the studio and artifact interaction model.
- PM Skills provides the product-management reasoning and workflow model.
- PM Agent Studio owns the PM product experience, FinSight demo pack, and sprint-scoped implementation.

## Layer Map

| Layer | Source Of Truth | Current Files |
| --- | --- | --- |
| Reference architecture | `AGENTS.md`, `docs/engineering/harness.md` | dual-reference split and guardrails |
| PM skill mapping | `lib/pm-skills-registry.ts` | raw PM Skills source skills translated into user-friendly actions |
| PM workflow registry | `lib/pm-workflows.ts` | Idea-to-Product Pack, PRD to Prototype, Project Summary, and next workflows |
| Product Pack data | `lib/product-pack.ts` | typed FinSight demo pack shared by API and workspace UI |
| Harness contract | `lib/agent-harness.ts` | providers, capabilities, workflows, events, generated artifacts, Product Pack output |
| API surface | `app/api/harness/route.ts`, `app/api/generate/route.ts` | workflow discovery and deterministic mock generation |
| Studio UI | `app/app`, `components/studio/*` | OpenDesign-inspired workspace, Product Pack summary, and artifact canvas |

## MVP Runtime

The current MVP is deterministic:

1. `/api/harness` exposes providers, reference architecture, MVP workflows, and future workflow registry entries.
2. `/api/generate` accepts a workflow id and product idea, then returns mock events, compatibility artifacts, and a typed Product Pack.
3. `/app` renders the current FinSight demo workspace using the typed Product Pack and existing visual design baseline.

No real AI provider, subprocess manager, authentication, database, payment, or external OpenDesign API is required for the 2026-06-21 sprint.

## Next Integration Steps

1. Add PRD-to-Prototype linked view data from the Product Pack instead of static component data.
2. Add Codex / Claude Code provider detection behind the current adapter contract.
3. Add export actions for Markdown, HTML, PDF, and PPTX after the artifact model is stable.
