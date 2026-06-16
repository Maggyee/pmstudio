# DESIGN.md

Merlin-inspired design system for the PM Agent prototype.

Reference material inspected on 2026-06-16:
- `https://www.merlin.computer/` homepage.
- `https://www.merlin.computer/pricing` as the available product/commercial page. `/product` and `/features` returned 404, so pricing was used as the secondary page reference.
- Source HTML/CSS and visible screenshots. The rules below are derived from Merlin's public visual language, then adapted for PM Agent. Do not copy Merlin trademarks, logo artwork, or exact marketing copy.

## 1. Brand Intent

- Product identity: PM Agent is an AI-native product planning studio that turns a raw product idea into PRD, prototype, research, competitor analysis, personas, roadmap, and GTM artifacts.
- Audience: product managers, startup founders, operators, and solo builders who need a polished first product plan quickly.
- Trust/action goal: make users believe the agent can quietly organize product chaos into a crisp launch plan, then encourage them to start a generation flow.
- Positioning sentence: `PM Agent turns one product idea into a launch-ready product pack.`
- Localized intent: PM Agent 的界面应该像一个冷静、高效率的 AI chief-of-staff，而不是传统后台。页面要让用户感到“少输入、快产出、结果可信”，用极简布局、强文字层级、真实 artifact preview 和克制的色彩建立专业感。

## 2. Product Context

- Core pages: landing page, studio/workspace, artifact preview, demo project detail, pricing or upgrade page when needed.
- Primary actions: start generation, run agent, refine artifact, preview prototype, export Markdown/PDF/HTML/PPTX, share project.
- Trust builders: visible generated artifacts, workflow timeline, concrete output examples, security/privacy note, export options, comparison against manual PM work.
- Content tone: direct, slightly witty, concise, operator-focused. Favor lines like "Launch-ready in minutes" over generic AI slogans.
- In scope: marketing homepage, product explainers, AI studio canvas, pricing/comparison sections, FAQ, footer.
- Out of scope: dense admin dashboards, generic analytics pages, unrelated gradient hero sections, stock photography.

## 3. Visual Language

- Overall direction: minimal editorial SaaS with high-contrast typography, a warm off-white environment, restrained cards, and product screenshots used as proof.
- Mood keywords: calm, intelligent, fast, personal, premium, slightly playful, not corporate-heavy.
- Layout density: very spacious on marketing pages; narrow, focused columns on pricing/product pages; large canvas surfaces inside the studio.
- Surface style: mostly flat white/off-white backgrounds with hairline borders; use rounded panels only for real components, not every section.
- First-viewport signal: oversized black headline, small brand/product glyph near text, centered CTA, and one clear product proof area.
- The product must not feel like: a dark crypto dashboard, generic blue SaaS template, over-carded Notion clone, or decorative AI landing page with floating blobs.

## 4. Logo System

- Merlin source observation: logo system uses a black rounded-square icon with white diagonal marks plus a heavy black wordmark.
- PM Agent adaptation: use a compact black or emerald rounded-square mark with a simple white symbol, paired with a bold text wordmark.
- Primary usage order:
  1. Black icon + black wordmark on off-white or white.
  2. White icon/wordmark on black only for footer, command bars, and dark CTA surfaces.
  3. Standalone icon for app chrome, favicon, floating nav, and small toolbar spaces.
- Clear space: keep at least one icon radius around the mark; do not crowd it with pills or badges.
- Background pairing: black mark on `#F7F7F7`, `#FFFFFF`, or `#F5F5F4`; white mark only on `#000000` or `#101010`.
- Forbidden edits: do not add multicolor gradients to the logo, do not put it inside a glossy badge, and do not distort the icon into a mascot.

## 5. Color System

Use roles, not arbitrary swatches. Merlin's homepage and pricing page rely on black, off-white, gray, hairline borders, and small blue/green/red accents.

| Role | Color | Use |
| --- | --- | --- |
| Page Background | `#F7F7F7` | Default body background; gives the site a soft warm white instead of pure white. |
| Section Background | `#F5F5F4` | Alternating feature, FAQ, and footer bands. |
| Surface | `#FFFFFF` | Cards, product frames, accordions, pricing panels, and input surfaces. |
| Foreground | `#000000` | Hero headlines, primary labels, logo text, strongest UI copy. |
| Foreground Soft | `#101010` | Wordmark, deep UI surfaces, primary button backgrounds when pure black feels too sharp. |
| Text Secondary | `#808080` | Subtitles, helper text, footer links, inactive labels. |
| Text Muted | `#6A6B6C` | Longer descriptions, table supporting copy. |
| Text Dark Gray | `#4D4D4D` | Dark callout panels and secondary headlines. |
| Border Light | `#EEEEEE` | Large vertical rails, subtle section dividers. |
| Border | `#DDDDDD` | Card outlines, accordion rows, input borders. |
| Border Strong | `#CCCCCC` | Nested product frames and device mockups. |
| Primary CTA Dark | `#000000` | Main homepage CTA on light backgrounds. |
| Primary CTA Blue | `#12A7FF` | Product/pricing CTA, focused links, active states that need color. |
| Focus Blue | `#94D8FF` | Text selection, focus rings, subtle interaction halos. |
| Success Wash | `#C9FFD6` | Bottom gradient wash for "how it works" or completed workflow moments. |
| Compliance Wash | `#E1F2E6` | Security, privacy, and assurance sections. |
| Warm Blush | `#FDF8F7` | Gentle testimonial or human-context blocks. |
| Warm Neutral | `#EBE8E9` | Soft image/card background near screenshots. |
| Alert Red | `#FA3D1D` | Tiny status dots, live indicators, urgent markers. Use sparingly. |
| System Green | `#34C759` | Completion checks inside product UI. |
| Chroma Purple | `#C679C4` | Only inside controlled chroma text/AI shimmer moments. |
| Chroma Orange | `#FFB005` | Only inside controlled chroma text/AI shimmer moments. |
| Chroma Blue | `#0358F7` | Only inside controlled chroma text/AI shimmer moments. |

Gradients:
- Hero glow: use a very soft top-edge image or CSS gradient with blue/yellow/red tint fading quickly into `#F7F7F7`. Keep it subtle and mostly outside the content area.
- Product proof wash: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 58%, #C9FFD6 100%)`.
- Security wash: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 58%, #E1F2E6 100%)`.
- Chroma text, used rarely: `linear-gradient(90deg, #000000 0%, #000000 33%, #C679C4 40%, #FA3D1D 45%, #FFB005 50%, #E1E1FE 55%, #0358F7 60%, transparent 67%)`.

Contrast:
- Body copy on light backgrounds should use at least `#6A6B6C`; avoid `#AAAAAA` except for decorative or disabled text.
- Blue CTA `#12A7FF` needs white text only at larger button sizes or bold weight. For small text links, use blue text on white.
- Do not use pale green or pale blue as text colors; use them as background washes only.

## 6. Typography

- Primary font: `Inter, sans-serif`.
- Optional editorial accent: `Instrument Serif` only for a price numeral, quote detail, or one isolated premium accent. Do not use it for product UI labels.
- Rendering: antialiased text, no unnecessary text shadows.
- Hero headline:
  - Desktop: `6rem` to `7rem`, line-height equal to font size, weight 600-700, letter-spacing around `-3px`.
  - Mobile: 4.4rem to 5.2rem, tight line-height, avoid breaking a single word awkwardly.
- Section title: 3.2rem to 4.8rem, weight 600-700, tracking between `-1px` and `-2px`.
- Product page title: 4.8rem to 5.6rem, centered, short, black.
- Body: 1.4rem to 1.7rem, line-height 1.55-1.75, `#808080` or `#6A6B6C`.
- Label/caption: 1.1rem to 1.3rem, weight 500-600, slight `0.5px` letter spacing only for nav, badges, and tiny UI labels.
- Buttons: 1.3rem to 1.6rem, medium weight, no uppercase by default.
- Do not scale typography with viewport width. Use fixed responsive breakpoints.

## 7. Layout And Components

### Page Grid

- Use a centered 12-column grid with wide side margins on desktop.
- Marketing pages should feel tall and breathable: large vertical gaps of 8rem-20rem between major sections are acceptable.
- Mobile should collapse to a single column with 2rem side padding.
- Avoid full-width content slabs unless they are light section bands.

### Header And Navigation

- Merlin source pattern: bottom-centered floating nav with black translucent background, white links, and a white CTA pill.
- PM Agent adaptation:
  - Landing page may use a floating bottom or top nav, but keep it compact.
  - Studio pages should use a functional top toolbar, not a marketing nav.
  - Nav links use 1.3rem Inter with `0.5px` letter spacing.
  - Active/hover link color can be `#12A7FF`.

### Hero

- Center the hero content.
- Headline should dominate; keep supporting copy under 2 lines on desktop.
- Use a small inline product mark or generated artifact icon inside or near the headline.
- CTA should be a black rounded pill on homepage, height around 4.5rem, with white text and a small arrow.
- Avoid split hero card layouts. The first viewport should feel like one focused composition.

### Product Proof

- Use one large screenshot/device/artifact preview with a soft border stack:
  - Outer shell: border `#DDDDDD`, radius 6rem-7.5rem for device-like frames.
  - Inner surface: white, border `#DDDDDD`, subtle shadow `0 3px 8px 0 #EEEEEE`.
- Product previews should show actual PM artifacts, not abstract decorations.
- Use human-scale context sparingly, such as a device held in hands or a real artifact window.

### Feature Cards

- Prefer a small number of large feature blocks instead of many uniform cards.
- Feature panels can use background images or soft product-themed illustrations, border `#DDDDDD`, radius 3rem.
- Two-card row pattern:
  - One card for "clarity over clutter" style product context.
  - One card for "talk/type/done" action flow.
- Keep copy short: title + one sentence.

### Pricing / Product Page

- Use a narrow centered column, not a dense grid.
- Hero: short title, large visual price/object, small muted caption.
- Feature list: single column rows separated by `#DDDDDD` or `#EEEEEE`; no heavy card per row.
- Primary CTA: blue `#12A7FF` rounded rectangle/pill, centered under the list.
- FAQ/footer can sit inside a broad `#F5F5F4` band with top radii around 4rem.

### FAQ

- Accordion container: white surface, radius 2rem-3rem, subtle shadow, border-light rows.
- Each row: plus icon on left, question text in black/near-black, expanded answer in muted gray.
- FAQ heading should be conversational and confident.

### Footer

- Use `#F5F5F4` with large top radii.
- End with oversized black wordmark or product name treatment when appropriate.
- Footer links remain gray until hover.

### Studio / App Screens

- Keep the Merlin calm-white base, but make the PM Agent workspace more functional:
  - Off-white page background.
  - White artifact canvas.
  - Black primary text.
  - Hairline gray borders.
  - Blue CTA only for active generation/export actions.
  - Emerald/green only for completed workflow status and soft success washes.
- Avoid dark, dense dashboard panels unless the user enters a focused preview mode.

## 8. Iconography And Imagery

- Icon style: simple solid or medium-weight line icons; black, white, or muted gray.
- Use tiny colored status dots sparingly: red `#FA3D1D`, blue `#12A7FF`, green `#34C759`.
- Imagery should show the product outcome: generated PRD, landing prototype, roadmap, research brief, inbox/calendar analogs, or artifact canvas.
- Avoid generic AI robot illustrations, 3D mascots, floating orb graphics, and unrelated stock office photography.
- Screenshots and artifact previews should be crisp, centered, and large enough to inspect.
- Use soft gradient background images only when they create atmospheric warmth around the hero; do not turn them into dominant decoration.

## 9. Motion And Interaction

- Motion should feel precise and quiet:
  - 200-300ms hover transitions.
  - Button active state may move down by 1px.
  - Text hover can slide/reveal secondary text if implemented carefully.
  - Hero text may blur/fade in, but only on marketing pages.
- Shimmer/chroma effects are allowed only for AI generation moments and must be short-lived.
- Hover states:
  - Text links shift to `#12A7FF`.
  - White buttons lift subtly or increase contrast.
  - Black CTAs remain black; do not invert into bright gradients.
- Loading states:
  - Prefer small status dots, progress rows, or subtle shimmer on artifact frames.
  - Do not use full-screen spinners unless a whole artifact is unavailable.

## 10. Do / Don't

### Do

- Use `#F7F7F7` and `#F5F5F4` as the dominant environment.
- Let black typography carry the hierarchy.
- Keep CTAs few and obvious.
- Use real artifact previews as proof.
- Use large vertical whitespace on public pages.
- Use narrow single-column product/pricing sections.
- Use hairline borders and soft shadows instead of heavy cards.
- Preserve a slightly personal, witty operator tone.

### Don't

- Do not create a dark dashboard as the default visual language.
- Do not use generic purple/blue AI gradients as the main brand.
- Do not fill every section with equal cards.
- Do not use decorative bokeh, orbs, or abstract SVG blobs.
- Do not copy Merlin's exact logo, wordmark, copy, or imagery.
- Do not overuse blue. It is an action/link color, not the whole theme.
- Do not set all labels in uppercase.
- Do not put tiny gray text on gray backgrounds below readable contrast.
- Do not make page sections look like nested cards.

## 11. Stitch Usage Notes

- Read this file before generating any PM Agent screen.
- Treat the design language as "Merlin-inspired white-space productivity AI," adapted to product planning.
- Preserve these constants:
  - Inter typography.
  - Off-white backgrounds.
  - Black hero text.
  - Gray supporting text.
  - Hairline borders.
  - Sparse blue CTA accents.
  - Soft green completion/progress washes.
- Start screens from the user's actual workflow, not from generic marketing filler.
- New screens should still be identifiable as this brand after removing the logo.
- If adding a new page type, choose one of these structures:
  - Centered hero + product proof.
  - Narrow product/pricing column + row separators.
  - White artifact canvas + muted side controls.
  - Soft `#F5F5F4` FAQ/footer band.
- Any deviation from this palette, typography, spacing, or component density is a design change and should be intentional.
