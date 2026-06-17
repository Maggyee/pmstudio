# Decisions

## 2026-06-16: Use The Existing Next.js Prototype As The Base

Decision: keep the current Next.js App Router project and build on it.

Reason: the prototype already has landing, studio, demo project, artifact preview, and mock data surfaces. Rebuilding from scratch would slow down the 2026-06-21 sprint.

## 2026-06-16: Follow OpenDesign's Adapter Contract Before Copying The Daemon

Decision: model the harness around provider detection, capabilities, workflow runs, and streamed/generated artifacts, but do not introduce a full local daemon yet.

Reason: OpenDesign's daemon is designed for a broader desktop/local-first product. PM Studio first needs a fast web prototype that demonstrates product-manager workflows.

## 2026-06-16: Make `DESIGN.md` The Confirmed UI Contract

Decision: `DESIGN.md` is the confirmed visual and interaction contract for future UI work.

Reason: design drift would be expensive once artifact preview, edit mode, and multi-agent orchestration are added.

## 2026-06-16: Prefer PM Skills As Workflow Definitions

Decision: represent PM skills as local `skills/*/SKILL.md` workflows first.

Reason: this keeps the product logic readable by Codex, Claude Code, and future OpenDesign-style adapters without adding runtime complexity too early.

## 2026-06-16: Keep External Reference Source Local And Ignored

Decision: clone OpenDesign and PM Skills under `references/sources/`, then ignore that directory in Git.

Reason: the source is useful for fast development reference, but vendoring thousands of external files into this small prototype would bloat history and make PM Studio look like a fork.

## 2026-06-16: Keep FinSight As The Demo Generated Project

Decision: keep PM Studio as the competition product, while using FinSight as the concrete generated demo project inside the workspace.

Reason: an AI efficiency competition needs a clear product story and a tangible example. The platform explains the productivity gain; the FinSight artifact proves the workflow can generate a complete, inspectable product pack.

## 2026-06-16: Use A Dual-Reference Harness

Decision: split the harness into two explicit reference roles: OpenDesign for the studio/artifact/prototype interaction model, and PM Skills for product-management workflow methods and artifact structure.

Reason: PM Studio needs to move quickly without blending two source projects into an unclear clone. The dual-reference model lets the app copy OpenDesign-style workspace behavior while translating PM Skills into user-friendly workflows such as Idea-to-Product Pack, PRD to Prototype, Generate PRD, User Personas, Market Research, Competitor Analysis, and Roadmap.

## 2026-06-16: Make Product Pack The Shared Artifact Contract

Decision: define the FinSight demo output as a typed Product Pack in `lib/product-pack.ts`, then return it from `/api/generate` and pass it into the `/app` workspace.

Reason: this keeps API output, UI summary, PRD, prototype, research, competitor, persona, roadmap, and export metadata aligned. It also makes the mock provider replaceable by Codex or Claude Code later without changing the workspace component contract.

## 2026-06-17: Use Browser-Local Product Pack Persistence For The MVP

Decision: store the last generated Product Pack and harness events in browser-local storage, and POST the current Product Pack to `/api/export` for downloads.

Reason: the competition demo needs refresh recovery and editable exports, but adding a database or server-side project model would slow down the sprint. Browser-local persistence keeps the OpenDesign-style edit/preview loop demonstrable while preserving a clear path to server persistence later.

## 2026-06-17: Move Beyond A Single FinSight Demo

Decision: keep FinSight as the default demo/preset, but make `/api/generate` build a Product Pack from arbitrary product ideas.

Reason: PM Studio must be usable as a real product, not only a scripted demo. A user should be able to enter a different product idea and get a corresponding positioning, PRD, user flow, prototype structure, market direction, roadmap, and executive summary.
