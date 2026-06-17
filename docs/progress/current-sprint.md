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

## In Progress

- Preparing provider detection and deterministic export endpoints for the next MVP slice.
- Following the rapid delivery plan in `docs/progress/rapid-delivery-plan.md`.

## Deferred

- Real Codex/Claude Code subprocess spawning if it threatens the demo timeline.
- Persistent project storage.
- Authentication and workspace sharing.
- Automated tests beyond lint/build.
- Production deployment setup.
