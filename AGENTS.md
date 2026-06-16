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

## Primary References

This project uses a dual-reference harness:

> OpenDesign gives us the studio and artifact interaction model.
> PM Skills gives us the product management reasoning and workflow model.
> PM Agent Studio combines both into a PM-focused product innovation workspace.

### 1. OpenDesign

Path: `references/sources/open-design/`

Use OpenDesign as the main reference for:

- AI-native Studio layout
- Artifact Canvas
- prototype preview
- skill picker
- design system picker
- iframe-style preview
- artifact export actions
- Codex / Claude Code adapter shape

Do not copy OpenDesign wholesale. Recreate only the patterns needed for PM Agent Studio. Do not import OpenDesign source at runtime.

### 2. PM Skills

Path: `references/sources/pm-skills/`

Use PM Skills as the main reference for product-management workflows.

Important plugin areas:

- `pm-execution`
- `pm-product-discovery`
- `pm-product-strategy`
- `pm-market-research`
- `pm-go-to-market`

Use PM Skills to design:

- Idea-to-Product Pack workflow
- PRD generation structure
- user stories
- roadmap
- assumption mapping
- user personas
- market research
- competitor analysis
- GTM extensions

Do not directly expose raw plugin or skill names to end users. Convert them into user-friendly PM workflows such as Generate PRD, Create User Personas, Estimate Market Opportunity, Competitor Analysis, and Roadmap.

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
- `docs/progress/rapid-delivery-plan.md`
- `docs/progress/roadmap.md`
- `docs/architecture.md`
- `docs/memory/project-context.md`
- `docs/memory/decisions.md`
- `docs/engineering/github-sync.md`
- `docs/engineering/pm-skills-reference.md`
- `docs/engineering/open-design-reference.md`
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
