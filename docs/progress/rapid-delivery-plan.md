# Rapid Delivery Plan

Target window: finish a competition-ready MVP by 2026-06-21.

Principle: copy proven patterns from OpenDesign and PM Skills, but keep PM Studio as a single fast-moving Next.js app. Do not port the full OpenDesign daemon, desktop sidecar, plugin marketplace, or monorepo structure during this sprint.

## Product Story For The Competition

PM Studio is the AI efficiency product.

FinSight is the generated demo project that proves the efficiency gain:

1. User enters a product idea.
2. PM Studio runs a PM-agent workflow.
3. The workflow generates PRD, prototype structure, market research, competitor direction, personas, roadmap, and executive summary.
4. The user can preview and edit the generated product pack in one workspace.
5. The user can export the artifacts or send them to Codex / OpenDesign-style workflows.

## Build Strategy

### Copy From OpenDesign

Use these local source areas:

- `references/sources/open-design/docs/agent-adapters.md`
- `references/sources/open-design/apps/daemon/src/runtimes/defs/codex.ts`
- `references/sources/open-design/apps/daemon/src/runtimes/defs/claude.ts`
- `references/sources/open-design/apps/daemon/src/runtimes/types.ts`
- `references/sources/open-design/templates/live-artifacts/otd-operations-brief/*`
- `references/sources/open-design/apps/web/src/components/AgentPicker.tsx`
- `references/sources/open-design/apps/web/src/components/PreviewModal.tsx`
- `references/sources/open-design/apps/web/src/components/IframeKeepAlivePool.tsx`

What to copy directly:

- Adapter field names and capability model.
- Codex / Claude command argument strategy.
- Prompt-via-stdin principle.
- Live artifact shape: `artifact.json`, `data.json`, `index.html`, `preview` object.
- Preview/edit mental model.

What not to copy this sprint:

- Full daemon process management.
- ACP transports.
- Plugin registry.
- Desktop sidecar.
- Multi-project persistence engine.
- OpenDesign's full component tree.

### Copy From PM Skills

Use these local source areas:

- `references/sources/pm-skills/pm-execution/skills/create-prd/SKILL.md`
- `references/sources/pm-skills/pm-market-research/skills/competitor-analysis/SKILL.md`
- `references/sources/pm-skills/pm-market-research/skills/market-sizing/SKILL.md`
- `references/sources/pm-skills/pm-market-research/skills/user-personas/SKILL.md`
- `references/sources/pm-skills/pm-product-discovery/skills/opportunity-solution-tree/SKILL.md`
- `references/sources/pm-skills/pm-execution/skills/outcome-roadmap/SKILL.md`

What to copy directly:

- Output section structure.
- PRD section order.
- Competitor matrix dimensions.
- TAM/SAM/SOM shape.
- Persona and roadmap output schema.

What to adapt:

- Turn long PM skill prompts into concise workflow stages.
- Convert markdown-heavy outputs into typed artifact data for the UI.
- Keep generated content inspectable and competition-demo friendly.

## MVP Scope

### Must Ship

- Idea input and workflow selection.
- Simulated multi-agent run timeline.
- Product pack artifact tabs: PRD, prototype, research, competitors, personas, roadmap, summary.
- FinSight demo project as the generated result.
- PRD-to-prototype mapping.
- Prototype preview and edit affordance.
- Export buttons wired to downloadable text/HTML where possible.
- Harness endpoints that expose providers, workflows, and generated artifacts.
- Codex / Claude Code shown as planned or detected providers.

### Nice If Time Allows

- Real local Codex CLI run from a server API route.
- Real local Claude Code run from a server API route.
- Save generated packs to local JSON files.
- Simple run history.
- HTML prototype export from the generated artifact data.

### Defer

- Auth.
- Database.
- Team collaboration.
- Real paid AI provider billing.
- Full OpenDesign live artifact daemon.
- Automated test suite beyond lint/build.

## Day-By-Day Plan

### Day 1: Lock The Plan And Data Model

Status: mostly done.

- Confirm PM Studio vs FinSight story.
- Keep current UI design as the baseline.
- Pull OpenDesign and PM Skills references.
- Add harness contracts and local skills.
- Keep lint/build passing.

### Day 2: Make The Product Pack Flow Work End-To-End

- Expand `lib/agent-harness.ts` from simple mock into typed product-pack generator.
- Add artifact schemas for PRD, prototype, research, competitors, personas, roadmap, and summary.
- Update `/api/generate` to return the full FinSight artifact pack.
- Update workspace UI to render API-backed artifact data instead of only static mock arrays.

### Day 3: Add OpenDesign-Style Preview And Editing

- Add an artifact preview shell based on OpenDesign's live artifact shape.
- Generate a static HTML prototype from artifact data.
- Render prototype preview in a safe iframe or current React preview shell.
- Add edit mode for artifact sections: title, summary, sections, screen list, export notes.

### Day 4: Add Agent Provider Surface

- Add `/api/providers` or extend `/api/harness` with local Codex / Claude detection.
- Copy minimal command definitions from OpenDesign's `codex.ts` and `claude.ts`.
- Show provider status in the UI: available, planned, missing auth, not installed.
- Keep actual run optional; fallback to mock generation for the competition demo.

### Day 5: Competition Polish

- Tighten story copy: "AI 提效: one idea to product pack in minutes."
- Add demo prompt presets.
- Add export/download behavior.
- Add a project summary view for judging.
- Verify desktop and mobile layouts.
- Run `npm run lint` and `npm run build`.
- Push to GitHub.

## Technical Order Of Operations

1. Data model first: artifact schema and mock pack.
2. UI binding second: workspace reads from the pack.
3. Preview third: generated prototype view.
4. Provider detection fourth: Codex / Claude Code status.
5. Real CLI run last: only if it does not threaten the demo.

## Acceptance Criteria

- A judge can understand the AI efficiency story in under 60 seconds.
- The app shows a complete FinSight product pack generated from one idea.
- PRD and prototype are visibly connected.
- The workspace supports preview, edit affordance, and export affordance.
- The codebase remains small and buildable.
- `npm run lint` and `npm run build` pass.
