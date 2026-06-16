# DESIGN.md

Status: confirmed on 2026-06-16.

This is the visual and interaction contract for PM Studio. Future screens, prototypes, and generated artifacts should read this file before making UI decisions.

## 1. Brand Intent

- Product identity: PM Studio is an AI-native product planning workspace that turns ideas and PRDs into product packs, reviewable prototypes, research notes, competitor directions, roadmaps, and summaries.
- Audience: product managers, founders, operators, and small product teams preparing early-stage proposals or internal project reviews.
- Trust/action goal: the UI must make users believe they can enter a rough idea, watch agents work, inspect outputs, edit artifacts, and export a useful product package quickly.
- Positioning sentence: `PM Studio turns a product idea into a review-ready product pack.`
- Localized intent: PM Studio 要像一个冷静、可靠、可操作的产品方案工作台。它不是营销页生成器，也不是纯聊天机器人；它的核心信号是“输入少、过程清楚、产出完整、结果可编辑”。

## 2. Product Context

- Core screens: landing page, AI workspace, project detail, PRD preview, prototype preview, research/competitor view, export view.
- Primary actions: input idea, choose workflow, run agents, inspect progress, edit artifacts, preview prototype, export project pack.
- Proof points: visible agent timeline, artifact tabs, PRD-to-prototype mapping, concrete generated page previews, export actions.
- Content tone: precise, direct, practical, product-review ready. Avoid generic AI hype.
- In scope: product planning workflow, generated PM artifacts, artifact preview/editing, OpenDesign-style agent and skill workflow concepts.
- Out of scope: generic analytics dashboards, decorative AI landing pages, unrelated CRM/admin UI.

## 3. Visual Language

- Overall direction: quiet product studio, light workspace, crisp hierarchy, real artifact previews.
- Mood keywords: structured, fast, credible, focused, modern, slightly editorial.
- Layout density: landing page can breathe; workspace should be compact enough for repeated use.
- Surface style: off-white page environment, white artifact surfaces, hairline borders, restrained shadows, compact controls.
- Product signal: always show the generated artifact or workflow state early; do not make users hunt for the actual output.
- The product must not feel like: a dark finance terminal, generic blue SaaS dashboard, over-carded Notion clone, or decorative gradient AI template.

## 4. Logo System

- Current asset: `public/pm-studio-logo.png`.
- Primary usage: logo icon plus `PM Studio` wordmark on light backgrounds.
- Compact usage: logo icon alone in toolbar, app shell, favicon-like spaces, and small buttons.
- Dark usage: white/inverted icon only on black or near-black surfaces.
- Clear space: keep at least one icon radius around the logo.
- Forbidden edits: no multicolor logo gradients, no mascot treatment, no distorted aspect ratio, no glossy badge wrapper.

## 5. Color System

Use color roles, not arbitrary swatches.

| Role | Color | Use |
| --- | --- | --- |
| Page Background | `#F5F5F1` | Default app environment. |
| Warm Canvas | `#FBFAF7` | Workspace canvas and artifact surroundings. |
| Surface | `#FFFFFF` | Artifact cards, editors, previews, forms. |
| Foreground | `#111111` | Primary text and strong UI labels. |
| Text Secondary | `#6A6B6C` | Body copy and explanations. |
| Text Muted | `#808080` | Captions, helper text, inactive labels. |
| Border Light | `#EEEEEE` | Section dividers and subtle rails. |
| Border | `#DDDDDD` | Cards, inputs, tabs, preview frames. |
| Primary CTA | `#111111` | Main run/export actions. |
| Active Blue | `#12A7FF` | Focus, active links, selected workflow hints. |
| Focus Blue | `#94D8FF` | Focus rings and text selection. |
| Success | `#34C759` | Completed steps and success states. |
| Success Wash | `#E1F2E6` | Completed workflow panels. |
| Warning | `#FFB005` | Caution, queued work, or pending review. |
| Alert | `#FA3D1D` | Errors and urgent status only. |

Gradients:

- Use subtle environmental gradients only on the page background.
- Artifact surfaces should stay readable and mostly flat.
- Do not use purple/blue AI gradients as the brand identity.

Contrast:

- Body text on light surfaces should use `#6A6B6C` or darker.
- Blue is an accent, not a body text color.
- Pale green and pale blue are washes, not primary text colors.

## 6. Typography

- Primary font: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Hero title: large, black, direct, max two lines on desktop.
- Workspace titles: compact and scannable; do not use hero-scale type inside panels.
- Body copy: 14px to 17px with comfortable line height.
- Labels: 11px to 13px, medium weight.
- Buttons: 13px to 15px, medium weight, sentence case.
- Letter spacing: use `0`; do not use negative tracking.
- Do not scale type with viewport width.

## 7. Layout And Components

### App Shell

- Keep a clear top toolbar for workspace actions.
- Left sidebar is for projects and workflows.
- Main canvas is for artifacts, not marketing copy.
- Floating agent status can sit near the canvas when it does not cover the artifact.

### Landing Page

- First viewport should communicate the actual product: idea input, generated artifact preview, and workflow outcome.
- CTA should take users to the workspace.
- Avoid a pure marketing hero without product proof.

### Artifact Canvas

- Use tabs for artifact types: PRD, prototype, research, competitors, personas, roadmap.
- The current artifact should be visually obvious.
- Keep export actions near the artifact.
- Preview frames need stable dimensions and must not shift when status labels appear.

### PRD-To-Prototype Mapping

- Show PRD points on the left and prototype modules on the right.
- Every generated screen should trace to a requirement, user task, or workflow step.
- Use concise rationale text; avoid long explanatory cards.

### Controls

- Use lucide icons for buttons where possible.
- Use segmented controls for modes such as generate, edit, preview.
- Use tabs for artifact switching.
- Use toggles or checkboxes for binary settings.
- Use menus for longer option sets.

### Cards And Panels

- Cards are for repeated items, artifacts, modals, and tool surfaces.
- Do not put cards inside cards.
- Page sections should be unframed or full-width bands.
- Default radius should stay controlled; avoid pill shapes for every element.

## 8. Iconography And Imagery

- Icon style: lucide line icons, medium weight, black/muted by default.
- Status dots are acceptable for running, queued, completed, and error states.
- Imagery should show product artifacts, generated prototypes, or workflow outputs.
- Avoid generic robots, floating orbs, bokeh, decorative blobs, and unrelated stock office photos.
- Prototype previews should be large enough to inspect.

## 9. Motion And Interaction

- Motion should be subtle and decisive.
- Default transitions: 180ms to 260ms ease-out.
- Hover may lift controls by 1px to 3px when it does not disrupt layout.
- Loading states should use progress rows, step timelines, or small spinners.
- Keep reduced-motion support.
- Do not animate layout in ways that make artifact reading harder.

## 10. Do / Don't

Do:

- Show generated artifacts as the main proof.
- Keep agent progress visible and compact.
- Use clear PRD-to-prototype traceability.
- Keep copy specific to product managers and project reviews.
- Preserve a light, focused workspace.

Don't:

- Do not make a dark dashboard the default.
- Do not use generic AI gradients or floating decoration.
- Do not add nested cards.
- Do not hide the product behind marketing copy.
- Do not use weak contrast, tiny labels, or unstable preview frames.
- Do not make every label a rounded pill.

## 11. Stitch Usage Notes

- Read this file before generating or editing screens.
- Preserve color roles, typography, spacing, component density, and artifact-first hierarchy.
- Treat deviations as design changes, not implementation details.
- A screen passes when it is clearly PM Studio even without the logo, supports the actual workflow, and avoids the anti-patterns above.
