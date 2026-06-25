---
version: "1.0"
name: "SupportPilot — LynAI Adaptation System"
description: "A production handoff for a SupportPilot marketing site built with the visual language, layout rhythm, and editorial UI treatment of the approved LynAI reference. It is not a literal clone: SupportPilot branding, copy, product UI, and integrations remain original."
source_html: "supportpilot-lynai-stage-14-clean.html"
reference_mode:
  desktop: "1440px viewport"
  mobile: "375px viewport"
  content_rail: "1208px"

colors:
  canvas: "#FFFBF5"
  surface: "#FFFFFF"
  surface-subtle: "#FFFDF9"
  ink: "#210D02"
  muted: "#4F4D49"
  rule: "rgba(25, 21, 22, 0.10)"
  rule-strong: "rgba(25, 21, 22, 0.16)"
  yellow: "#FFD84B"
  orange: "#FA8F1F"
  orange-warm: "#FA7B31"
  gold: "#AA8322"
  powder: "#C6DFFA"
  periwinkle: "#B3BBFA"
  lavender: "#EFEAFF"
  success: "#2D9A4E"
  footer: "#070706"
  white-on-dark: "#FFFFFF"

fonts:
  display: "IBM Plex Sans, 500"
  interface: "Inter, 400/500/600"

type:
  hero: "clamp(52px, 5.35vw, 80px) / 1.04 / -0.075em"
  section-title: "clamp(40px, 4.05vw, 58px) / 1.04 / -0.055em"
  dark-section-title: "48px / 1.04 / -0.055em"
  feature-title: "31px / 1.04 / -0.055em"
  body: "16px / 1.55 / normal"
  card-body: "13px / 1.60 / normal"
  nav: "14px / 1.35 / normal"
  label: "11px / 1.35 / 0.025em"
  ui-small: "8–10px / 1.35 / normal"

layout:
  container: "min(1208px, calc(100% - 48px))"
  desktop_gutter: "24px"
  mobile_gutter: "16px"
  section_y: "118–128px desktop; 78px mobile"
  rules: "1px structural borders are a primary part of the composition"
  hero_stage: "1120px max × 620px desktop"
  border_radius:
    page_cards: "0–8px"
    controls: "4–8px"
    pills: "999px"

shadows:
  large_panel: "0 22px 50px rgba(77,48,22,.08), 0 2px 8px rgba(77,48,22,.04)"
  hero_console: "0 25px 50px rgba(69,36,4,.20)"
  hover: "0 16px 28px rgba(54,32,8,.08)"

gradients:
  hero: "linear-gradient(102deg, #A96F1E 0%, #EF7E18 25%, #FF9B54 48%, #D7BDC4 66%, #A9BEF7 86%, #CFE9FF 100%)"
  support_flow: "yellow #FFD812 base, warm orange and periwinkle radial accents"
  enterprise: "near-black base with restrained warm-gold upper-right and periwinkle lower-left atmospheric light"
  conversion: "linear-gradient(103deg, #C6802E 0%, #F5912F 26%, #F8B07B 48%, #D7C9E7 72%, #C4DAF9 100%)"
  analytics_side: "linear-gradient(135deg, #FFF1CF 0%, #FFFAF0 42%, #F4EFFF 100%)"

motion:
  hover: "200–280ms ease; max translateY -4px"
  rails: "18–28s linear infinite"
  reduced_motion: "disable rails/reveals when prefers-reduced-motion is set"
---

# SupportPilot — Design System and Build Contract

## 1. Purpose

Build a polished, editorial product-marketing site for **SupportPilot**, an AI support platform with cited answers, approvals, confidence checks, human handoff, knowledge analytics, and white-label widgets.

The system deliberately uses the approved **LynAI visual language**: warm cream canvas, a strict 1208px rail, hairline grid borders, IBM Plex Sans display typography, yellow CTA buttons, orange-to-periwinkle product gradients, chart-heavy UI imagery, and a black grid footer. Do not copy LynAI's logo, product copy, or company-specific assets.

The source file is an approval build, not clean production architecture. Preserve the established design but refactor the CSS into a single clean source of truth before adding features.

## 2. Non-negotiable visual rules

1. **Warm editorial, not generic SaaS.** The default page surface is cream (`#FFFBF5`), not cool white or gray.
2. **Fine borders are structural.** Use 1px rules to create rails, section divisions, tab rows, cards, and dashboard grids.
3. **Use color inside product graphics, not everywhere.** Marketing content remains mostly cream/white/ink. Saturated color belongs in hero, charts, integration marks, the yellow workflow panel, and final CTA.
4. **IBM Plex Sans for display; Inter for UI.** Do not introduce another font or heavy 700/800 headings.
5. **No glassmorphism, neon, or rounded “AI blob” language.** The system is crisp and editorial.
6. **Keep SupportPilot original.** Product content is cited support, approvals, governance, and analytics—not workforce analytics.
7. **The hero dashboard is a single composition.** Do not place floating status cards above it. The cleaned source intentionally removes the approval, citation, and mini-chart popups that obscured the UI.

## 3. Brand tokens

### Core CSS variables

```css
:root {
  --canvas: #fffbf5;
  --surface: #ffffff;
  --surface-subtle: #fffdf9;
  --ink: #210d02;
  --muted: #4f4d49;
  --rule: rgba(25, 21, 22, 0.10);
  --rule-strong: rgba(25, 21, 22, 0.16);
  --yellow: #ffd84b;
  --orange: #fa8f1f;
  --orange-warm: #fa7b31;
  --gold: #aa8322;
  --powder: #c6dffa;
  --periwinkle: #b3bbfa;
  --lavender: #efeaff;
  --success: #2d9a4e;
  --footer: #070706;
  --max: 1208px;
  --gutter: 24px;
  --section: 124px;
}
```

### Scale and geometry

| Token | Desktop | Mobile | Use |
|---|---:|---:|---|
| `--max` | 1208px | full width minus gutter | Global editorial rail |
| `--gutter` | 24px | 16px | Outer viewport inset |
| `--section` | 118–128px | 78px | Major section vertical rhythm |
| Display heading | 80px max | 48px | Hero only |
| Section heading | 58px max | 39px | Major marketing heading |
| Feature heading | 31px | 29px | Story cards |
| UI control | 48px height | 44–48px | Primary buttons and main controls |
| Standard radius | 4–8px | 4–8px | Cards and controls |
| Pill radius | 999px | 999px | Tags and statuses |

## 4. Patterns, gradients, and textures

### SVG line pattern

Use the supplied LynAI line pattern only as a **low-opacity overlay** on dense gradient panels. It should never make text illegible.

```css
background-image: url("https://cdn.prod.website-files.com/6966ee1d23d3b73459938427/696f90ec4c7d82d0573e57da_line-image-2.svg");
background-size: cover;
background-position: center;
background-repeat: no-repeat;
```

Use it in:
- hero gradient stage
- final CTA gradient panel

Do **not** add it globally to all sections.

### Moving striped marquee

Use a duplicated 200%-wide track; do not animate `background-position` on the section itself.

```css
.marquee { overflow: hidden; }
.marquee__track { display:flex; width:200%; animation:stripeRail 18s linear infinite; }
.marquee__panel { flex:0 0 50%; background-image:repeating-linear-gradient(90deg, rgba(65,42,20,.13) 0 1px, transparent 1px 10px); }
@keyframes stripeRail { to { transform:translateX(-50%); } }
@media (prefers-reduced-motion:reduce) { .marquee__track { animation:none; } }
```

The light version belongs between dense marketing sections. The dark inverse version belongs at the bottom of the footer.

## 5. Page architecture

1. Announcement strip
2. Sticky navigation
3. Hero: headline, two CTAs, dashboard stage, trust strip
4. Three product story rows: Evidence / Approvals / Insights
5. Integrations: pinstripe lead-in, label, heading, moving icon rail, CTA
6. Yellow Support Flow canvas: tabbed, dashboard-like funnel visualization
7. Enterprise governance: black section with warm/violet atmospheric light
8. Support intelligence: analytics dashboard, missing topics, metrics, trend chart
9. Light moving stripe marquee
10. Pricing
11. Use cases and testimonial carousel
12. FAQ
13. Orange-to-lilac CTA with branded widget
14. Black four-column footer with inverse moving stripe marquee

## 6. Hero requirements

### Structure

- Hero copy is centered above the product stage.
- The product stage contains only:
  - gradient + SVG pattern layer
  - top product tabs
  - main dashboard console
  - optional subtle, non-interactive halo behind the console
- The console uses three columns on desktop:
  - 184px sidebar
  - flexible conversation view
  - 180px confidence / detail panel

### Critical correction

The cleaned source intentionally removes:
- `hero-insight-float`
- `hero-citation-float`
- `approval-float`

Do not restore them. They were visually redundant and covered the dashboard’s tabs and confidence panel. Keep the cited-source and approval information inside the dashboard itself.

## 7. Product graphic language

Use CSS and inline SVG, not screenshots, for the product visuals.

- **Evidence:** source rows, policy names, freshness state, citation markers.
- **Approvals:** queue rows, high/medium/low risk, human review controls.
- **Insights:** short line graphs, bars, deflection/acceptance/escalation values.
- **Support Flow:** yellow striped container, framed white UI board, visually legible funnel.
- **Analytics:** include real visible SVG or CSS bars; never leave a blank panel reserved for a chart.

Use `--orange`, `--yellow`, `--periwinkle`, and `--success` only as data or state colors. All dashboard foundations remain white/cream with fine borders.

## 8. Section specifications

### Integrations

- Pinstripe lead-in: 132px desktop / 72px mobile.
- Kicker is an outlined compact label with orange square dot.
- Integration rail cells: 124px × 142px desktop.
- Repeated content allows a seamless rail; pause on hover/focus.
- CTA row is centered and separated with 1px rules.

### Yellow Support Flow

- Five tabs: Smart Assist, Review Queue, Human Handoff, Knowledge Health, Policy Routing.
- Yellow pinstripe surface is the visual field; white panel is the product UI.
- Use tabs as functional buttons with `role="tab"`, `aria-selected`, arrow-key support, Home/End support.

### Enterprise

- Black base, no generic gradient card collection.
- Two atmospheric lights only: gold in upper right and violet in lower left.
- Use six simple outlined cards in a 3×2 desktop grid.
- Avoid unsupported compliance claims. Say “SSO / SCIM ready,” “controls underway,” or “deployment choices” only if those capabilities are confirmed.

### Analytics

- Use a large white dashboard board on cream.
- Upper-left: weekly coverage chart + knowledge health graphic.
- Upper-right: missing topics list on cream-to-lavender background.
- Lower: metric row then accepted answers vs. escalation trend.
- Maintain thin borders and quiet text hierarchy.

### Testimonial

- One large quote at a time, warm/lilac background glow, small pager, arrow buttons.
- Remove focus ring after pointer click only; preserve `:focus-visible` for keyboard users.

### Conversion CTA

- Keep the orange → peach → lilac → powder field and SVG pattern.
- **No large decorative circle or floating orb.**
- Right visual is a clean branded widget with citation micro-state.

### Footer

- Full black area.
- Desktop 4-column grid: brand + Info + Resources + Company.
- Horizontal and vertical hairline white rules.
- White circular social buttons.
- Centered legal/copyright row.
- Dark inverse moving-stripe marquee at bottom.

## 9. Interaction and accessibility

- Sticky header: active anchor state updates while scrolling.
- Mobile nav: menu button, Escape to close, correct `aria-expanded` and `aria-hidden`.
- Accordions: native buttons, `aria-expanded`, keyboard usable.
- Tabs: ArrowLeft/ArrowRight, Home, End; correct tab semantics.
- Rails pause on hover/focus. Reduced-motion removes all continuous movement.
- Maintain visible `:focus-visible` treatments. Never remove keyboard focus globally.
- Ensure all product graphics are decorative or have concise labels.

## 10. Responsive behavior

### Desktop baseline

Use 1440px as the primary composition target. Keep the 1208px rail centered and preserve full tab labels, dashboard sidebars, three-column enterprise grid, and three-column pricing cards.

### Tablet

At approximately 960px:
- collapse desktop nav to menu;
- retain dashboard hierarchy but reduce side widths;
- use two-column enterprise cards;
- preserve section order.

### Mobile

At 760px and below:
- 16px outer gutters;
- hero stage around 470px high;
- product console uses sidebar + conversation only; hide tertiary confidence panel only after the core hierarchy remains legible;
- stack product-story rows;
- make flow tabs horizontally scrollable;
- stack pricing cards;
- footer becomes brand block + two-column links, then remaining column.

## 11. Code quality / refactor requirement

The approval HTML contains multiple historic patch layers from iteration. Before future work:

1. Create one final token block.
2. Consolidate repeated selectors into one stylesheet per component.
3. Remove superseded Stage 5–14 override blocks after verifying their rules are represented in the clean style layer.
4. Keep semantic section IDs and current interactive behavior.
5. Avoid a framework unless the project is deliberately migrated; plain HTML/CSS/JS is sufficient.
6. Do not hardcode screenshots or replace editable UI with flat images.

## 12. Acceptance checklist

- [ ] Hero dashboard is unobscured: no extra overlay popups.
- [ ] Hero SVG pattern is visible but understated.
- [ ] Desktop 1440px has no nav collisions or clipped overlays.
- [ ] Mobile 375px has no horizontal overflow.
- [ ] Analytics visual contains visible data, not blank placeholders.
- [ ] Only intended stripe bands animate: light signal band, integration rail, footer band.
- [ ] CTA has no decorative circle/orb.
- [ ] Footer matches black 4-column LynAI-style grid rhythm while using SupportPilot content.
- [ ] `prefers-reduced-motion` disables marquee and reveal motion.
- [ ] All product and brand copy remains SupportPilot-specific.
