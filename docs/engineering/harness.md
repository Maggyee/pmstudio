# Engineering Harness

The harness is the thin layer that connects agent providers, PM workflows, and generated artifacts.

## Reference Model

OpenDesign's public source describes an adapter layer where the app delegates the agent loop to existing CLIs such as Claude Code and Codex, then streams events and file outputs back into the UI. PM Studio uses the same product shape at a smaller scale:

- detect agent provider;
- understand provider capabilities;
- run a named PM workflow;
- collect agent events;
- render generated artifacts in the workspace.

## Current Implementation

- `lib/agent-harness.ts`: provider-neutral types, planned adapters, workflow definitions, output artifacts, and a mock generator.
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
- `event`: normalized progress message from an agent run.
- `artifact`: typed generated output that can be previewed, edited, or exported.

## MVP Provider Plan

1. Mock provider for UI and API development.
2. Codex adapter through `codex exec --cwd <dir> "<prompt>"`.
3. Claude Code adapter through stream-json mode.
4. API fallback only after the product flow is stable.

## MVP Workflow Plan

1. `idea-to-product-pack`: one idea to complete product plan.
2. `prd-to-prototype-linker`: PRD to user flow, IA, and prototype preview.
3. `project-summarizer`: custom summary and handoff workflow.

## Non-Goals For This Sprint

- No persistent queue.
- No real subprocess manager.
- No user-provided API keys.
- No multi-tenant security model.
- No automated e2e harness unless the sprint scope changes.
