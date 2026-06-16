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

## In Progress

- Converting the static PM Studio prototype into a competition-ready demo of agent intake, product pack output, and PRD-to-prototype linkage.
- Following the rapid delivery plan in `docs/progress/rapid-delivery-plan.md`.

## Deferred

- Real Codex/Claude Code subprocess spawning if it threatens the demo timeline.
- Persistent project storage.
- Authentication and workspace sharing.
- Automated tests beyond lint/build.
- Production deployment setup.
