# PM Skills Reference Plan

Reference source: `https://github.com/phuryn/pm-skills`.

Local checkout: `references/sources/pm-skills`.

## Goal

Use `references/sources/pm-skills/` as the product-management workflow reference for PM Agent Studio.

OpenDesign guides the studio experience.
PM Skills guides the PM thinking and output structure.

## MVP Focus

Only implement two product capabilities first:

1. Idea-to-Product Pack
2. PRD-to-Prototype Linked Generation

## PM Skills To Reference

### 1. `pm-execution`

Reference for:

- PRD generation
- roadmap
- user stories
- test scenarios
- stakeholder map
- pre-mortem

Mapped to PM Studio:

- PRD tab
- Roadmap tab
- Product Pack output
- feature-to-page mapping

### 2. `pm-product-discovery`

Reference for:

- brainstorming ideas
- identifying assumptions
- prioritizing assumptions
- opportunity solution tree
- customer interview scripts

Mapped to PM Studio:

- idea clarification
- problem framing
- risk assumptions
- discovery questions

### 3. `pm-product-strategy`

Reference for:

- product strategy
- product vision
- value proposition
- lean canvas
- business model
- SWOT
- PESTLE
- Porter's Five Forces

Mapped to PM Studio:

- product positioning
- value proposition
- strategic context
- opportunity summary

### 4. `pm-market-research`

Reference for:

- user personas
- market segments
- customer journey map
- market sizing
- competitor analysis
- sentiment analysis

Mapped to PM Studio:

- personas
- research summary
- competitor table
- market opportunity cards

### 5. `pm-go-to-market`

Reference for future extension:

- GTM strategy
- ICP
- growth loops
- GTM motions
- competitive battlecards

Mapped to later versions:

- GTM tab
- launch plan
- pitch deck
- sales battlecard

## MVP Workflow Mapping

### Workflow 1: Idea-to-Product Pack

Input:

- product idea
- target user
- business context
- optional competitors

Output:

- product positioning
- target users
- pain points
- value proposition
- PRD summary
- core features
- user stories
- assumptions
- roadmap
- prototype page list
- project summary

Reference skills:

- `brainstorm-ideas-new`
- `identify-assumptions-new`
- `opportunity-solution-tree`
- `create-prd`
- `user-stories`
- `outcome-roadmap`
- `user-personas`
- `market-sizing`
- `competitor-analysis`

### Workflow 2: PRD-to-Prototype

Input:

- PRD summary
- core features
- target users
- user stories
- success metrics

Output:

- user flow
- page list
- page goals
- component suggestions
- prototype brief
- mock prototype preview
- OpenDesign prompt placeholder

Reference skills:

- `create-prd`
- `user-stories`
- `job-stories`
- `wwas`
- `test-scenarios`
- `outcome-roadmap`

## Product UI Translation

Do not show users raw plugin names.

Instead of:

- `create-prd`
- `user-personas`
- `market-sizing`

Show:

- Generate PRD
- Create User Personas
- Estimate Market Opportunity

Instead of:

- `pm-execution`
- `pm-market-research`

Show:

- Product Planning
- Research
- Strategy
- Prototype
- Launch

## PM Studio Adaptation

PM Studio should use PM Skills as source material for product-management workflows, not as runtime dependencies. When a PM skill maps cleanly to PM Studio, convert it into one of:

- a project-local skill under `skills/`;
- a typed workflow in `lib/agent-harness.ts`;
- a skill mapping in `lib/pm-skills-registry.ts`;
- a user-facing workflow in `lib/pm-workflows.ts`;
- a reusable artifact schema for PRD, prototype, market, competitor, roadmap, or summary output.

## Guardrails

- Keep source attribution in docs when copying structure or workflow logic.
- Do not blindly copy long prompts into UI code.
- Keep workflow outputs concise and inspectable in the artifact canvas.
- Do not make front-end components depend on the `references/sources/pm-skills` file layout.
