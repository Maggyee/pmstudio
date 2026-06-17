# Current Sprint

Sprint window: 2026-06-16 to 2026-06-21.

## Priority Order

1. Establish engineering harness and repo memory.
2. Confirm product design direction in `DESIGN.md`.
3. Define agent provider and workflow contract.
4. Align prototype content with the two target product flows.
5. Keep build/lint green enough for fast iteration.
6. Sync changes to GitHub.

## Done

- Existing Next.js prototype inspected.
- OpenDesign reference model reviewed: agent adapters, skill/design-system contract, sandboxed artifact preview, Codex/Claude Code adapter approach.
- Progressive disclosure docs added under `docs/progress` and `docs/memory`.
- Local workflow skills added under `skills/`.
- Lightweight harness API added for provider/workflow discovery and mock generation.
- Dual-reference harness added: OpenDesign for studio/artifact/prototype interaction, PM Skills for PM workflow and artifact structure.
- PM Skills registry and PM workflow registry added under `lib/`.
- Typed FinSight Product Pack added under `lib/product-pack.ts` and shared by `/api/generate` plus the `/app` workspace summary.
- Prototype tab linkage now reads Product Pack `prototype.prdLinks`, `userFlow`, `screens`, OpenDesign prompt, and live artifact files.
- PRD, Research, Competitor, Persona, and Roadmap tabs now read Product Pack data in the workspace.
- Sidebar project/workflow navigation now reads Product Pack metadata and PM workflow registry.
- Agent orchestration panel now renders harness events from the current generated run.
- Artifact action buttons now derive export options from each Product Pack artifact.
- `/api/harness` now detects local Codex and Claude Code CLI availability.
- `/api/export` now provides deterministic Markdown, JSON, HTML, and placeholder PDF/PPTX artifact exports.
- Workspace artifact action buttons now link to `/api/export`.
- Bottom run input now calls `/api/generate` and updates Product Pack plus Agent events in the workspace.
- Workspace now restores the last generated Product Pack and agent events from browser-local storage.
- Edit mode now updates PRD fields, prototype flow, OpenDesign prompt, screen goals, summary bullets, and next actions directly in the current Product Pack.
- Export buttons now POST the current Product Pack to `/api/export`, so locally edited artifacts can be downloaded.
- `/api/generate` now accepts `providerId` and returns adapter metadata with run id and run mode.
- Workspace topbar now follows OpenDesign's AgentPicker placement for provider selection: Mock, Codex, Claude Code, and API fallback are run-context choices instead of bottom-input controls.
- Workspace topbar AgentPicker now reads `/api/harness` provider detection, shows available/dry-run status, and supports manual refresh.
- Codex adapter dry-run now builds the OpenDesign/PM Skills-informed prompt and can optionally attempt local `codex exec` only when `PMSTUDIO_ENABLE_LOCAL_AGENT=1`.
- Workspace now keeps a browser-local run history with provider, run mode, workflow, input idea, project title, and run id, shown in the Agent panel.
- Project executive summary is now a first-class workspace tab with preview and export actions mapped to `executive-summary`.
- Bottom run input now includes FinSight demo prompt presets for full pack generation, PRD-to-prototype linkage, and project summary.
- Summary tab generation now maps to the `project-summarizer` workflow.
- Product Pack generation now supports arbitrary product ideas instead of only the FinSight demo; FinSight remains a preset/reference example.
- Generic Product Pack output now infers target users, product shape, domain profile, market window, competitor categories, personas, and roadmap from the submitted idea.
- Prototype preview now reads Product Pack title, value proposition, flow, screens, and artifact files instead of hard-coded FinSight copy.

## In Progress

- Preparing richer user input fields, adapter output parsing, and binary export replacement for a later MVP slice.
- Following the rapid delivery plan in `docs/progress/rapid-delivery-plan.md`.

## Deferred

- Real Claude Code subprocess spawning if it threatens the demo timeline.
- Server-side persistent project storage.
- Authentication and workspace sharing.
- Automated tests beyond lint/build.
- Production deployment setup.
