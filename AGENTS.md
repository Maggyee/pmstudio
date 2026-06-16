# PM Studio Agent Guide

This is the first file an agent should read when entering this repository. Keep it focused on project-wide boundaries, commands, and the current product goal. Deeper context lives under `docs/` and is intentionally layered for progressive disclosure.

## Current Mission

- Project: PM Studio, an AI product planning workspace for product managers.
- Schedule: small project, current sprint ends on 2026-06-21.
- Immediate target: prove the flow from agent intake to generated product artifacts.
- Next target: edit and preview PRD-linked prototypes in a workspace similar to OpenDesign.
- Later target: multi-agent orchestration, reusable PM skills, and custom summarization workflows.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS.
- Handwritten shadcn-style primitives in `components/ui/`.
- Mock data and workflow definitions in `lib/`.
- No database, authentication, or real AI provider wiring yet.

OpenDesign reference strategy:

- Follow OpenDesign's adapter-first thinking: keep agent provider detection, capability negotiation, and run output as a contract.
- Do not import the OpenDesign daemon architecture until this project needs real local CLI spawning.
- Treat Codex and Claude Code as first-class future adapters; current implementation exposes a lightweight harness contract and mock generation endpoint.
- Local OpenDesign source is available at `references/sources/open-design` when that ignored checkout exists.
- Local PM Skills source is available at `references/sources/pm-skills` when that ignored checkout exists.

## Read Order

Layer 0, always read:

- `AGENTS.md`
- `DESIGN.md`
- `README.md`

Layer 1, read before planning or implementing:

- `docs/progress/README.md`
- `docs/memory/README.md`
- `docs/engineering/harness.md`
- `references/README.md`

Layer 2, read only when relevant:

- `docs/progress/current-sprint.md`
- `docs/progress/roadmap.md`
- `docs/memory/project-context.md`
- `docs/memory/decisions.md`
- `docs/engineering/github-sync.md`
- `skills/*/SKILL.md`

## Core Product Flows

1. Idea-to-Product Pack
   - Input: one product idea.
   - Output: positioning, target users, pain points, value proposition, PRD draft, feature list, user flow, page structure, market opportunity, competitor direction, MVP scope, roadmap, and executive summary.

2. PRD-to-Prototype Linkage
   - Input: PRD content.
   - Output: extracted features, user task flow, information architecture, prototype description, and previewable page prototype.

## Implementation Boundaries

- Keep UI implementation consistent with `DESIGN.md`.
- Prefer extending `lib/agent-harness.ts` and mock data before introducing backend complexity.
- Keep agent contracts serializable and provider-neutral.
- Keep generated artifact types explicit; avoid a single untyped blob for everything.
- Do not add real provider secrets, API keys, or auth assumptions to the repo.
- Tests are not urgent for this sprint, but `npm run lint` and `npm run build` should pass before GitHub sync.

## Common Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

Local URLs:

- `http://localhost:3000/`
- `http://localhost:3000/app`
- `http://localhost:3000/app/projects/demo`
- `http://localhost:3000/api/harness`

## Git Policy

- Current default branch tracks `origin/main`.
- Keep commits focused and do not include generated `.next/` output.
- For this prototype sprint, direct sync to `origin/main` is acceptable unless the user asks for a feature branch or PR.
