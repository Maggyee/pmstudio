# PM Studio

A Next.js App Router prototype for an AI product planning workspace.

PM Studio turns a product idea or PRD into a review-ready product pack: PRD draft, prototype structure, market research, competitor direction, roadmap, and executive summary.

Current sprint ends on 2026-06-21. The project is optimized for fast product validation; real agent providers and persistence are deferred until the workflow is proven.

## Run locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/app`
- `http://localhost:3000/app/projects/demo`
- `http://localhost:3000/api/harness`

## Scripts

```bash
npm run lint
npm run build
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Handwritten shadcn/ui-style components
- Mock data in `lib/mock-data.ts`

## Engineering Harness

- Agent guidance: `AGENTS.md`
- Lowercase pointer requested by the owner: `agent.md`
- Confirmed UI contract: `DESIGN.md`
- Progress index: `docs/progress/README.md`
- Memory index: `docs/memory/README.md`
- Harness notes: `docs/engineering/harness.md`
- GitHub sync notes: `docs/engineering/github-sync.md`
- Reference source notes: `references/README.md`

The lightweight harness lives in `lib/agent-harness.ts` and is exposed through:

- `GET /api/harness`
- `POST /api/generate`

## Product Flows

1. Idea-to-Product Pack: one idea becomes positioning, users, pain points, PRD, features, flow, prototype structure, market opportunity, competitor direction, MVP scope, roadmap, and summary.
2. PRD-to-Prototype Linkage: PRD content becomes extracted features, user tasks, page IA, prototype description, and previewable page structure.
