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
- `/api/export` now provides deterministic Markdown, JSON, HTML, PDF, and PPTX artifact exports.
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
- Workspace shell now follows the current generated Product Pack, so top navigation, sidebar, export, and run controls operate on the active project instead of the initial preset.
- Bottom run input now has optional intake fields for target user, success outcome, and constraints, then passes the combined brief through the existing provider-neutral generation contract.
- Prototype JSON export now returns an OpenDesign-style live artifact bundle with `artifact.json`, `data.json`, and `index.html` bodies; HTML export escapes generated user content before rendering.
- PDF export now returns a real `application/pdf` binary for markdown-backed artifacts using an embedded CJK-capable font.
- PPTX export now returns a real editable `.pptx` deck for roadmap and executive summary artifacts, with cover, summary, roadmap, and next-action slides.
- FinSight default next actions now reflect the current MVP state instead of completed setup tasks.
- Artifact handoff buttons now download real continuation packages: OpenDesign JSON for prototypes and Codex Markdown for other artifacts.
- Workspace sidebar now supports browser-local demo projects: users can create a new project from an idea, run the selected provider, and switch between generated projects during a live demo.
- Server runner now supports controlled cloud CLI execution for both Codex and Claude Code when `PMSTUDIO_ENABLE_CLOUD_AGENTS=1` is set.
- Cloud agent deployment notes added under `docs/engineering/cloud-agent-deployment.md`.
- `/app` workspace now follows OpenDesign's opened-file model: Product Pack artifacts are surfaced as design files, opened in tabs, previewed in the center, edited through a right-side inspector, and exported from the active file.
- The old artifact summary/card-heavy workspace surface has been removed from the main app view in favor of a lean file tree, file viewer, inspector, and bottom run composer.

## In Progress

- Preparing adapter output parsing, server-side project persistence, richer PPTX templates, visual PPTX rendering QA, and direct OpenDesign/Codex launch integration for a later MVP slice.
- Following the rapid delivery plan in `docs/progress/rapid-delivery-plan.md`.

## Deferred

- Real Claude Code subprocess spawning if it threatens the demo timeline.
- Server-side persistent project storage.
- Authentication and workspace sharing.
- Automated tests beyond lint/build.
- Production deployment setup.
