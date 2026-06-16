---
name: prd-prototype-linker
description: Convert PRD content into linked user flows, information architecture, and prototype previews.
---

# PRD Prototype Linker

Use this workflow when the user provides PRD content and wants a prototype generated or reviewed against it.

## Inputs

- PRD text or structured PRD sections.
- Optional target platform: web, mobile, desktop, dashboard, or deck.
- Optional design system reference.

## Output Sections

1. Extracted core features.
2. User task flow.
3. Page information architecture.
4. Prototype screen list.
5. Screen-level content and interaction notes.
6. Preview-ready prototype description.

## Process

1. Extract verbs, roles, and objects from the PRD.
2. Group features by user task.
3. Convert tasks into a flow from entry to completion.
4. Create page IA and navigation.
5. Define each screen's purpose, primary action, data inputs, empty states, and output states.
6. Produce a prototype preview that can be edited and exported.

## Quality Bar

- Every prototype screen must trace back to a PRD requirement.
- Call out missing PRD details instead of inventing hidden scope.
- Keep page count appropriate for MVP review.
- Make preview content concrete and inspectable.
