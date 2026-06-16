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
