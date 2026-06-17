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
- Workspace generation controls now let the user choose Mock, Codex, or Claude provider mode.
- Codex adapter dry-run now builds the OpenDesign/PM Skills-informed prompt and can optionally attempt local `codex exec` only when `PMSTUDIO_ENABLE_LOCAL_AGENT=1`.

## In Progress

- Preparing simple run history, adapter output parsing, and binary export replacement for a later MVP slice.
- Following the rapid delivery plan in `docs/progress/rapid-delivery-plan.md`.

## Deferred

- Real Claude Code subprocess spawning if it threatens the demo timeline.
- Server-side persistent project storage.
- Authentication and workspace sharing.
- Automated tests beyond lint/build.
- Production deployment setup.
