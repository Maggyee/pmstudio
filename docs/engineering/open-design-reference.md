# OpenDesign Reference Notes

Reference source: `https://github.com/nexu-io/open-design`.

Local checkout: `references/sources/open-design`.

## What To Copy Conceptually

- `DESIGN.md` as a brand and artifact-generation contract.
- Agent adapter contract for Codex, Claude Code, and future CLIs.
- Skill-based workflows that can be prompt-injected or loaded natively.
- Sandboxed artifact preview as a product primitive.
- Export-first artifact model: HTML, Markdown, PDF, PPTX.
- Studio shell layout with left navigation, workflow controls, and an artifact canvas.
- Design system and template picker patterns.
- Iframe-style preview for generated prototypes.

## What Not To Copy Yet

- Full daemon process model.
- Desktop sidecar architecture.
- Large monorepo workspace layout.
- Runtime data directory rules that only apply to OpenDesign's daemon.
- Full automation/plugin marketplace.

## PM Studio Adaptation

PM Studio keeps the OpenDesign shape but compresses it into a single Next.js app until the product flow is proven. The next major engineering step is adding real Codex and Claude Code adapters behind the current `lib/agent-harness.ts` contract.

OpenDesign should not define PM methodology in this project. It provides the studio and artifact interaction model. PM Skills provides the product-management reasoning and workflow model.
