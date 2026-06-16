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

## In Progress

- Converting the remaining static artifact tabs into Product Pack-driven views, starting with PRD-to-prototype linkage.
- Following the rapid delivery plan in `docs/progress/rapid-delivery-plan.md`.

## Deferred

- Real Codex/Claude Code subprocess spawning if it threatens the demo timeline.
- Persistent project storage.
- Authentication and workspace sharing.
- Automated tests beyond lint/build.
- Production deployment setup.
