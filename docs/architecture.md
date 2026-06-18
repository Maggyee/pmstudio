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
| Product Pack data | `lib/product-pack.ts` | typed Product Pack factory for arbitrary ideas, with FinSight kept as the default demo preset |
| Harness contract | `lib/agent-harness.ts` | providers, capabilities, workflows, events, generated artifacts, Product Pack output |
| Agent runner | `lib/agent-runner.ts` | provider-selected run boundary, prompt composition, Codex dry-run / optional CLI metadata |
| API surface | `app/api/harness/route.ts`, `app/api/generate/route.ts`, `app/api/export/route.ts` | provider detection, workflow discovery, provider-selected generation, and artifact export |
| Studio UI | `app/app`, `components/studio/*` | OpenDesign-inspired file workspace with Design Files tree, open-file tabs, file viewer, editable inspector, provider selector, harness event timeline, export buttons, and run input |

## MVP Runtime

The current MVP is deterministic:

1. `/api/harness` detects local Codex / Claude Code CLIs, then exposes providers, reference architecture, MVP workflows, and future workflow registry entries.
2. `/api/generate` accepts a provider id, workflow id, and product idea/intake brief, then returns adapter metadata, events, compatibility artifacts, and a typed Product Pack generated for that idea.
3. `/api/export` accepts an artifact id and format, then returns deterministic Markdown, JSON, HTML, PDF, or editable PPTX output; prototype JSON returns a portable live artifact bundle with `artifact.json`, `data.json`, and `index.html` bodies.
4. `/app` renders the current FinSight demo workspace as OpenDesign-style files: `README.md`, `PRD.md`, `prototype/index.html`, `prototype/data.json`, research files, roadmap deck, and executive summary.
5. The workspace can call `/api/generate` from the bottom run input, add optional target/outcome/constraint context, and download supported artifact exports through `/api/export`.
6. The workspace stores the last Product Pack, agent events, and recent run history in browser-local storage, then posts the current Product Pack for edited artifact exports.
7. The workspace can download continuation handoff packages from the current edited Product Pack: OpenDesign JSON for prototype work and Codex Markdown for artifact continuation.
8. The workspace maps browser-local Product Packs into a design-file tree and open-file tabs so artifacts are opened, previewed, edited, and exported like OpenDesign project files.
9. A cloud demo can enable server-side Codex and Claude Code CLI attempts with `PMSTUDIO_ENABLE_CLOUD_AGENTS=1`, while still rendering the stable typed Product Pack until CLI output parsing is implemented.

No real AI provider, subprocess manager, authentication, database, payment, or external OpenDesign API is required for the 2026-06-21 sprint.

## Next Integration Steps

1. Parse optional Codex CLI output into structured Product Pack deltas after the demo flow is stable.
2. Add richer PPTX templates and saved-PPTX visual rendering QA.
3. Add server-side persistence after the browser-local run history MVP is accepted.
4. Replace downloaded handoff packages with direct OpenDesign/Codex launch integration when those runtimes are available.
5. Add authentication, queueing, audit logs, and stronger sandbox policy before exposing cloud CLI execution publicly.
