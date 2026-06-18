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

- `lib/agent-harness.ts`: provider-neutral types, adapter metadata, reference architecture, workflow definitions, output artifacts, and a mock generator.
- `lib/agent-runner.ts`: server-side workflow runner that accepts a provider id, builds an OpenDesign/PM Skills-informed prompt, returns stable Product Pack data, and only attempts local Codex CLI when explicitly enabled.
- `lib/provider-detection.ts`: server-only helper that detects local Codex and Claude Code CLIs for `/api/harness`.
- `lib/product-pack-export.ts`: deterministic Product Pack export renderer for Markdown, JSON, HTML, PDF, and editable PPTX decks.
- `lib/pm-skills-registry.ts`: local registry that maps raw PM Skills source skills to user-friendly actions and PM Studio use cases.
- `lib/pm-workflows.ts`: user-facing workflow registry that turns PM Skills method references into PM Studio product workflows.
- `app/api/harness/route.ts`: GET endpoint that exposes detected providers and workflows.
- `app/api/generate/route.ts`: POST endpoint that accepts `providerId`, `workflowId`, and `input`, then returns a generated Product Pack plus adapter run metadata.
- `app/api/export/route.ts`: GET/POST endpoint that exports Product Pack artifacts by `artifact` and `format`.
- `components/studio/artifact-canvas.tsx`: workspace state surface that restores the last Product Pack from browser storage, supports local artifact edits, and posts the current Product Pack to `/api/export`.
- The bottom workspace run form supports optional intake fields for target user, success outcome, and constraints, then composes them into the same serializable `input` string used by all providers.
- Artifact handoff actions create downloadable continuation packages from the current browser-local Product Pack: prototype tabs produce OpenDesign JSON, while other tabs produce Codex Markdown.
- The workspace sidebar can create browser-local demo projects from new ideas, call the selected provider, and switch between generated Product Packs.
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
3. Optional Codex adapter through `codex exec` with prompt delivered through stdin.
4. Optional Claude Code adapter through stream-json mode.
5. API fallback only after the product flow is stable.

Detection is intentionally lightweight: `/api/harness` marks Codex or Claude Code as available only when their CLI binaries are present in PATH.

`/api/generate` now has an adapter runner boundary:

- `mock`: deterministic in-process Product Pack generation.
- `codex`: dry-run by default; builds the Codex prompt and command metadata without spawning a subprocess.
- `claude-code`: dry-run by default; preserves the stream-json adapter contract for later.
- `api-fallback`: dry-run placeholder.

Set `PMSTUDIO_ENABLE_LOCAL_AGENT=1` before starting Next.js to let the Codex provider attempt a local CLI run. Even then, PM Studio still renders the stable typed Product Pack and treats CLI output as adapter metadata until parsing is added.

For a cloud demo server, `PMSTUDIO_ENABLE_CLOUD_AGENTS=1` enables the same controlled server-side CLI attempt for Codex and Claude Code when their CLIs are installed and authenticated on the host. Keep this behind authentication or a private network; see `docs/engineering/cloud-agent-deployment.md`.

## Workspace State Plan

The competition MVP uses browser-local state before introducing persistent project storage:

- generated Product Packs are saved to `localStorage` under a versioned key;
- the last harness event list is restored with the pack so the Agent panel remains coherent after refresh;
- recent generation runs are saved locally with provider, run mode, workflow, input idea, project title, and run id;
- edit mode updates the typed Product Pack directly, so PRD fields, prototype flow, OpenDesign prompt, screen goals, summaries, and export payloads stay aligned;
- `/api/export` accepts a full Product Pack in POST requests, allowing edited artifacts to be downloaded without a database.
- `prototype` JSON export returns a portable live artifact bundle containing `artifact.json`, `data.json`, and `index.html` bodies, matching the OpenDesign artifact mental model without adding file storage.
- PDF export uses PDFKit with an embedded CJK-capable font, so Chinese Product Pack content is returned as a real `application/pdf` binary instead of placeholder JSON.
- PPTX export uses `pptxgenjs` to generate an editable four-slide deck for roadmap and executive summary artifacts.

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
