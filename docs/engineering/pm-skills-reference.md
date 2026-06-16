# PM Skills Reference Notes

Reference source: `https://github.com/phuryn/pm-skills`.

Local checkout: `references/sources/pm-skills`.

## Useful Areas

- `pm-execution/skills/create-prd`: PRD scaffolding.
- `pm-execution/skills/user-stories`: backlog and acceptance criteria.
- `pm-execution/skills/prioritization-frameworks`: RICE, ICE, Kano, MoSCoW, and related prioritization.
- `pm-execution/skills/pre-mortem`: launch risk analysis.
- `pm-product-discovery/skills/opportunity-solution-tree`: discovery framing.
- `pm-product-discovery/skills/prioritize-features`: backlog ranking.
- `pm-market-research/skills/competitor-analysis`: competitor analysis structure.
- `pm-market-research/skills/market-sizing`: market opportunity sizing.
- `pm-ai-shipping/skills/shipping-artifacts`: AI-built repo review and shipping artifacts.

## PM Studio Adaptation

PM Studio should use PM Skills as source material for product-management workflows, not as runtime dependencies. When a PM skill maps cleanly to PM Studio, convert it into one of:

- a project-local skill under `skills/`;
- a typed workflow in `lib/agent-harness.ts`;
- a reusable artifact schema for PRD, prototype, market, competitor, roadmap, or summary output.

## Guardrails

- Keep source attribution in docs when copying structure or workflow logic.
- Do not blindly copy long prompts into UI code.
- Keep workflow outputs concise and inspectable in the artifact canvas.
