# 13 — SupportPilot Design Direction Decision

## Executive decision

Choose **LynAI-inspired premium analytics SaaS** as the primary visual direction, then borrow **Agentra's AI-agent information architecture** for the content structure. LynAI is the better visual fit because its AI/SaaS template is built around clean, fast product presentation, 27 ready-to-use pages, 60+ sections, animations, pricing, blog, changelog, and a professional AI-tool positioning that can make SupportPilot feel premium on first impression ([Webflow LynAI template](https://webflow.com/templates/html/lynai-website-template)). Agentra is the better structural fit because its Webflow listing explicitly includes AI agents, automation workflows, product features, integrations, pricing, use cases, testimonials, FAQs, blog content, and contact forms for AI/SaaS/automation businesses ([Webflow Agentra0 template](https://webflow.com/templates/html/agentra0-website-template)).

The final direction should be **“LynAI visual energy + Agentra product logic + SupportPilot enterprise trust.”** This means the landing page gets a warm, dimensional, dashboard-forward SaaS look, while the product story stays specific to support operations: upload docs, cite answers, score confidence, approve risky drafts, hand off to humans, and monitor deflection.

## Template comparison

| Direction | Strength for SupportPilot | Weakness / risk | Decision |
|---|---|---|---|
| **LynAI** | Premium AI/SaaS look, dashboard-forward hero, analytics/KPI motifs, strong section inventory, polished animations, strong “AI workforce” positioning ([Webflow LynAI template](https://webflow.com/templates/html/lynai-website-template)). | The warm orange/amber expression can feel more productivity/ops than enterprise trust if copied literally. | **Primary visual reference.** Use layout depth, gradient energy, hero mockups, KPI cards, and integration strip. |
| **Agentra** | Best content match for AI agents, workflows, integrations, use cases, pricing, testimonials, FAQ, and conversion-focused structure ([Webflow Agentra0 template](https://webflow.com/templates/html/agentra0-website-template)). | Dark navy/blue sky look is less distinctive and can make SupportPilot look like a generic “AI agents” template. | **Primary IA/content reference.** Borrow section logic and governance language. |
| **Ornal** | Clean SaaS startup template with responsive design, CMS integration, and a sleek modern UI ([Webflow Ornal template](https://webflow.com/templates/html/ornal-website-template)). | Bold serif/yellow-lime marketing feel risks looking less enterprise-support and less “trust operations.” | Use sparingly for editorial contrast only; do not choose. |
| **Promora** | Strong AI marketing platform structure, 3 home variations, 27 pages, 70+ blocks, CMS, eCommerce, animations, and SEO optimization ([Webflow Promora template](https://webflow.com/templates/html/promora-ecom-website-template)). | Pastel campaign aesthetic maps to marketing automation more than customer-support governance. | Do not choose; too marketing/campaign-oriented. |

## Palette decision: keep indigo-violet as the brand, add warm amber as a marketing accent

Do **not** fully replace SupportPilot's established indigo-violet brand with LynAI's orange/amber. Keep **#6D56FF** as the primary brand color because the existing SupportPilot design system already positions indigo-violet as the enterprise brand anchor, with pink as the expressive marketing secondary and neutral surfaces for the console. Add a controlled **amber warmth layer** inspired by LynAI for hero glows, CTA halos, and performance charts, but do not make amber the app's primary control color.

Why this reconciles the direction:

- Indigo-violet keeps continuity with the current token system and feels more credible for a security-sensitive support platform.
- Amber adds the energy the user likes from LynAI without making refund, billing, SSO, and data-residency workflows feel consumer-ish.
- The console can remain restrained while the marketing site gets a memorable premium gradient.
- White-label customers can still override widget colors through tenant theme tokens, while SupportPilot’s own brand remains consistent.

## Final visual language

### Marketing site: vivid, premium, dashboard-forward

| Token | Value | Usage |
|---|---:|---|
| `--brand-primary` | `#6D56FF` | Primary CTA, links, hero gradient, active pills. |
| `--brand-primary-dark` | `#30247A` | Deep hero background and dark footer. |
| `--brand-primary-soft` | `#F4F2FF` | Lavender section backgrounds and feature cards. |
| `--brand-secondary` | `#F86EBC` | Pink glow, secondary chart accent, testimonial highlight. |
| `--brand-warm` | `#FFB24A` | LynAI-inspired warmth for hero halo, workload chart, tiny highlights. |
| `--brand-warm-deep` | `#F97316` | Hover or contrast accent only; never default body text. |
| `--ink` | `#0F172A` | Primary headline/body on light surfaces. |
| `--muted` | `#64748B` | Subheads and secondary copy. |
| `--surface` | `#FFFFFF` | Cards, mockups, pricing surfaces. |
| `--canvas` | `#FCFCFD` | Page canvas. |
| `--dark` | `#08090D` | Footer and optional dark proof band. |

**Marketing gradient treatment**

```css
--hero-gradient:
  radial-gradient(circle at 18% 12%, rgba(255,178,74,.45), transparent 28%),
  radial-gradient(circle at 72% 8%, rgba(248,110,188,.30), transparent 32%),
  radial-gradient(circle at 50% 48%, rgba(109,86,255,.38), transparent 42%),
  linear-gradient(135deg, #FFF7ED 0%, #F4F2FF 42%, #EEF2FF 100%);

--dark-gradient:
  radial-gradient(circle at 18% 10%, rgba(109,86,255,.35), transparent 30%),
  radial-gradient(circle at 82% 12%, rgba(255,178,74,.22), transparent 26%),
  linear-gradient(180deg, #0B0D12 0%, #08090D 100%);
```

**Marketing typography**

Use **Geist Sans** or **Inter** for all product UI and marketing copy because Geist is designed by Vercel for developer/designer workflows and Inter is a free UI typeface designed for interface readability ([Vercel Geist](https://vercel.com/geist/introduction), [Inter](https://rsms.me/inter/)). The marketing site can use tighter letter spacing and larger display sizes, but avoid a serif headline because SupportPilot should read as an enterprise support system, not an editorial campaign.

| Role | Desktop | Mobile | Weight | Guidance |
|---|---:|---:|---:|---|
| Hero display | 68/74 | 44/50 | 720 | Max width 920 px; use balanced line breaks. |
| Section display | 48/56 | 34/42 | 700 | Use for major sections. |
| Card title | 20/28 | 18/26 | 650 | Clear, operational phrasing. |
| Body large | 18/30 | 16/26 | 400 | Hero subheads and section intros. |
| Body | 15/24 | 15/24 | 400 | Cards, FAQ, testimonials. |
| Caption/label | 12/16 | 12/16 | 600 | Badges, chart labels, source chips. |

**Marketing surfaces and elevation**

- Hero product mockup: 28–32 px radius, 1 px white translucent border, `0 30px 90px rgba(15,23,42,.18)`, and a subtle brand glow.
- Glass cards: `rgba(255,255,255,.72)` with `backdrop-filter: blur(18px)`, 1 px `rgba(255,255,255,.75)` border, 20–24 px radius.
- Pricing cards: white surface, 1 px `#E2E8F0` border, 24 px radius; Pro card gets a violet top border and glow.
- Mockups should use real product content: approval queue, cited answer, confidence meter, knowledge freshness, and deflection analytics.

**Marketing motion**

- Use slow floating motion for 2–3 hero proof cards only.
- Use `transform: translateY(-2px)` and shadow change on cards and CTAs.
- Respect `prefers-reduced-motion` and disable parallax/float animations for reduced-motion users.

### Console: restrained, dense, evidence-first

The console should continue the prior **Vercel / Linear / Stripe / shadcn** direction rather than copying the colorful landing page. shadcn/ui is appropriate because it distributes editable component code rather than a closed component library, and Radix is appropriate because it provides accessible primitives with keyboard and focus-management behavior ([shadcn/ui docs](https://ui.shadcn.com/docs), [Radix accessibility docs](https://www.radix-ui.com/primitives/docs/overview/accessibility)). Linear's dashboard concept of centralized pages with charts, metric blocks, tables, and filters maps directly to SupportPilot’s overview, approvals, and ticket operations ([Linear dashboards docs](https://linear.app/docs/dashboards)).

| Token | Value | Console usage |
|---|---:|---|
| `--bg-canvas` | `#FCFCFD` | App background. |
| `--bg-surface` | `#FFFFFF` | Cards, tables, panels. |
| `--bg-subtle` | `#F8FAFC` | Toolbar, inactive tabs, side nav. |
| `--border-subtle` | `#E2E8F0` | Cards, tables, inputs. |
| `--text-primary` | `#0F172A` | Page titles and table text. |
| `--text-secondary` | `#64748B` | Labels, metadata, helper copy. |
| `--primary` | `#6D56FF` | Active nav, primary buttons, focus rings. |
| `--primary-soft` | `#F4F2FF` | Active nav background and soft empty states. |
| `--success` | `#22C55E` | High confidence / resolved. |
| `--warning` | `#F59E0B` | Waiting / medium confidence. |
| `--danger` | `#EF4444` | Escalated / low confidence / critical. |
| `--info` | `#3B82F6` | In progress / informational. |

**Console status rules**

| Domain | State | Fill | Border | Text | Dot |
|---|---|---:|---:|---:|---:|
| Ticket status | New | `#EEF2FF` | `#C7D2FE` | `#3730A3` | `#6366F1` |
| Ticket status | In progress | `#EFF6FF` | `#BFDBFE` | `#1D4ED8` | `#3B82F6` |
| Ticket status | Waiting | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` |
| Ticket status | Resolved | `#ECFDF5` | `#A7F3D0` | `#047857` | `#22C55E` |
| Ticket status | Escalated | `#FEF2F2` | `#FECACA` | `#B91C1C` | `#EF4444` |
| Priority | Low | `#F8FAFC` | `#E2E8F0` | `#475569` | `#94A3B8` |
| Priority | Medium | `#EFF6FF` | `#BFDBFE` | `#1D4ED8` | `#3B82F6` |
| Priority | High | `#FFF7ED` | `#FED7AA` | `#C2410C` | `#F97316` |
| Priority | Critical | `#FEF2F2` | `#FCA5A5` | `#991B1B` | `#DC2626` |
| AI confidence | High | `#ECFDF5` | `#A7F3D0` | `#047857` | `#22C55E` |
| AI confidence | Medium | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` |
| AI confidence | Low | `#FEF2F2` | `#FECACA` | `#B91C1C` | `#EF4444` |

**Console typography and density**

- Sidebar width: 248 px desktop, 64 px collapsed.
- Page header: 32/40, weight 650.
- Card values: 28/36, weight 650, tabular numbers.
- Body/table text: 14/22.
- Captions/source metadata: 12/16.
- Table cells: 8–12 px vertical padding; cards: 16–20 px padding.
- Prefer borders over shadows for default separation; reserve shadows for drawers, popovers, command menus, and widget preview.

## Visual principles to encode in `DESIGN.md`

1. **Marketing is expressive; console is restrained.** Use gradient mesh, depth, and mockups on public pages; use quiet surfaces, density, and evidence-first hierarchy in admin.
2. **Every major marketing visual must show product truth.** Replace generic AI swirls with cited answers, confidence scoring, approvals, human handoff, and knowledge freshness.
3. **No muddy badges.** All status, priority, confidence, risk, and source states must use semantic tokens with dots or icons.
4. **White-labeling must be tokenized.** Tenants can override primary color, logo, radius, widget position, and font family, but system statuses and contrast rules remain protected.
5. **Enterprise trust beats novelty.** Security, audit, SSO, RBAC, data residency, citations, and approval controls should appear throughout the site and console.

## Final recommendation

Build SupportPilot as a **LynAI-inspired enterprise AI support command center**: warm dimensional hero, large dashboard/chat mockups, KPI cards, integrations strip, and premium pricing; then structure the page like Agentra: clear workflow, AI-agent use cases, governance features, integrations, pricing, testimonials, FAQ, and CTA. Keep **#6D56FF** as the brand, use **#FFB24A** as a controlled warmth accent, and keep the console neutral, dense, and evidence-first.
