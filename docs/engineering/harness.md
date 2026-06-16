# Engineering Harness

The harness is the thin layer that connects agent providers, PM workflows, and generated artifacts.

## Dual Reference Model

PM Studio uses a dual-reference harness:

| Reference | Learn From It | PM Studio Surface |
| --- | --- | --- |
| OpenDesign | Studio layout, Artifact Canvas, iframe-style preview, design system picker, export actions, Codex / Claude Code adapter shape | `/app` workspace, Prototype tab, artifact preview/edit/export actions |
| PM Skills | PRD, roadmap, user stories, market research, competitor analysis, personas, assumptions | Product Pack, PRD tab, Research tab, workflow registry |
| PM Agent Studio | PM-focused integration | Idea-to-Product Pack, PRD-to-Prototype linkage, FinSight demo artifact pack |

OpenDesign's public source describes an adapter layer where the app delegates the agent loop to existing CLIs such as Claude Code and Codex, then streams events and file outputs back into the UI. PM Studio uses the same product shape at a smaller scale:

- detect agent provider;
- understand provider capabilities;
- run a named PM workflow;
- collect agent events;
- render generated artifacts in the workspace.

PM Skills provides the PM reasoning and output structure. The harness converts raw skill references into friendly workflows such as Generate PRD, Create User Personas, Estimate Market Opportunity, Competitor Analysis, and Roadmap.

## Current Implementation

- `lib/agent-harness.ts`: provider-neutral types, planned adapters, reference architecture, workflow definitions, output artifacts, and a mock generator.
- `lib/pm-skills-registry.ts`: local registry that maps raw PM Skills source skills to user-friendly actions and PM Studio use cases.
- `lib/pm-workflows.ts`: user-facing workflow registry that turns PM Skills method references into PM Studio product workflows.
- `app/api/harness/route.ts`: GET endpoint that exposes available providers and workflows.
- `app/api/generate/route.ts`: POST endpoint that returns a mock artifact pack for `idea-to-product-pack` or `prd-to-prototype-linker`.
- `skills/*/SKILL.md`: project-local workflow instructions for future prompt or native skill injection.
- `references/sources/open-design`: ignored local checkout for agent adapter and artifact preview reference code.
- `references/sources/pm-skills`: ignored local checkout for PM workflow reference skills.

## Adapter Contract

The project should preserve these concepts:

- `provider`: agent runtime such as Codex, Claude Code, or API fallback.
- `capabilities`: streaming, file editing, native skill loading, resume, and permission mode.
- `workflow`: reusable product-management process.
- `referenceArchitecture`: explicit split between OpenDesign experience patterns and PM Skills workflow methods.
- `userFacingActions`: PM Skills-derived actions translated into product language.
- `event`: normalized progress message from an agent run.
- `artifact`: typed generated output that can be previewed, edited, or exported.

The front end should consume workflow names and `userFacingActions`. It should not display raw values such as `pm-execution`, `pm-market-research`, or `create-prd`.

## MVP Provider Plan

1. Mock provider for UI and API development.
2. Local provider detection for Codex and Claude Code.
3. Optional Codex adapter through `codex exec --cwd <dir> "<prompt>"`.
4. Optional Claude Code adapter through stream-json mode.
5. API fallback only after the product flow is stable.

## MVP Workflow Plan

1. `idea-to-product-pack`: one idea to complete product plan.
2. `prd-to-prototype-linker`: PRD to user flow, IA, prototype brief, OpenDesign prompt placeholder, and mock preview.
3. `project-summarizer`: custom summary and handoff workflow.

Next workflows are already represented in `lib/pm-workflows.ts` but not prioritized for the first demo: Generate PRD, User Personas, Market Research, Competitor Analysis, and Roadmap.

## Rapid Build Decision

For the 2026-06-21 competition deadline, PM Studio should first ship a deterministic, demo-ready product-pack generator. Real CLI spawning is useful but not required for the judging story. The UI and artifact model should be built so a Codex / Claude adapter can replace the mock provider later without rewriting screens.

FinSight remains the generated demo project. PM Studio is the competition product; FinSight is the concrete output used to prove the harness can turn an idea into inspectable artifacts.

## Non-Goals For This Sprint

- No persistent queue.
- No real subprocess manager.
- No user-provided API keys.
- No multi-tenant security model.
- No automated e2e harness unless the sprint scope changes.
