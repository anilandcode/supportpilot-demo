# 07 — SupportPilot Enterprise Design System

> Built to deepen the existing SupportPilot 00–06 research set; this document intentionally focuses on design, workflow, security, agentic architecture, and small-model cost strategy rather than repeating the earlier market overview.

## 1. Design strategy: premium marketing, restrained enterprise console

SupportPilot should use one design-system foundation across the product, but split the visual expression into two modes: a vivid, high-end marketing system and a calmer, dense admin console. shadcn/ui is a strong foundation because it is “not a component library” but a code-distribution model for building a custom component library, and its components are open, accessible, customizable, and AI-ready ([shadcn/ui docs](https://ui.shadcn.com/docs)). Radix should remain the primitive layer because Radix Primitives follow WAI-ARIA authoring practices and handle focus management, keyboard navigation, ARIA attributes, and roles for complex controls ([Radix accessibility docs](https://www.radix-ui.com/primitives/docs/overview/accessibility)). Tailwind should remain the styling layer because SupportPilot already needs token-driven theming, per-tenant overrides, light/dark modes, and fast implementation inside Next.js.

The marketing site should honor the user’s omni.ai-inspired direction: indigo-violet to pink gradient mesh, glass cards, floating metric cards, a conversational hero input, generous whitespace, refined motion, and polished three-tier pricing. The admin console should be more Linear/Vercel/Stripe than “AI toy”: Linear positions dashboards as centralized pages that combine charts, metric blocks, tables, and filters for operational alignment ([Linear dashboards docs](https://linear.app/docs/dashboards)); Vercel’s Geist system emphasizes consistent developer-facing experiences, high-contrast accessible color, and a developer-focused typeface ([Vercel Geist](https://vercel.com/geist/introduction)); Stripe intentionally limits custom styling in embedded dashboard UIs to preserve platform consistency and accessibility ([Stripe Apps design docs](https://docs.stripe.com/stripe-apps/design)). This dual approach lets SupportPilot look premium to buyers without making the console noisy for managers who must review tickets, approvals, sources, and risk.

The `DESIGN.md` anchor for the repository should state: “Marketing pages may be expressive; admin surfaces are quiet, high-density, and evidence-first.” This matches how enterprise SaaS leaders balance brand and trust: Intercom’s Messenger settings separate content, appearance, conversations, install, and security concerns ([Intercom Messenger docs](https://www.intercom.com/help/en/articles/6612589-set-up-and-customize-the-messenger)); Retool’s 2026 homepage emphasizes enterprise security, governance, and production readiness rather than decorative AI novelty ([Retool](https://retool.com)); Sierra’s AI-agent positioning centers outcome alignment rather than generic chatbot claims ([Sierra outcome pricing](https://www.sierra.ai/blog/outcome-based-pricing-for-ai-agents)).

## 2. Reference aesthetic blend

| Reference | Borrow | Avoid | SupportPilot application |
|---|---|---|---|
| shadcn/ui + Radix | Editable code, primitives, accessibility, consistent component APIs | Shipping default shadcn styling untouched | Use as the component engine, then replace default pills/cards/tables with SupportPilot tokens ([shadcn/ui docs](https://ui.shadcn.com/docs), [Radix accessibility docs](https://www.radix-ui.com/primitives/docs/overview/accessibility)). |
| Vercel / Geist | Crisp typography, technical credibility, restrained borders, neutral surfaces | Overly monochrome marketing | Use Geist or Inter for the admin console; use high-contrast neutrals and subtle elevation ([Vercel Geist](https://vercel.com/geist/introduction)). |
| Linear | High-density ops dashboards, tables, filters, command flow | Too much abstraction for non-technical managers | Use compact inbox/approval layouts and keyboard-friendly workflows ([Linear dashboards docs](https://linear.app/docs/dashboards)). |
| Stripe | Trustworthy forms, billing, API-key, integration, and error states | Excessive brand suppression on marketing pages | Use Stripe-like form rigor for settings, billing, SSO, and API keys ([Stripe Apps design docs](https://docs.stripe.com/stripe-apps/design)). |
| Intercom | Familiar chat launcher, messenger tabs, appearance settings, security section | Copying Intercom’s product structure wholesale | Use the convention users know: corner launcher, messenger shell, help/source content, handoff states ([Intercom Messenger docs](https://www.intercom.com/help/en/articles/6612589-set-up-and-customize-the-messenger)). |
| IBM Carbon-style enterprise discipline | Accessibility, data tables, forms, status semantics | Heavy corporate visual weight | Borrow discipline for admin density and WCAG-oriented state colors. |

## 3. Typography decision

Use `Geist Sans` or `Inter` as the default product typeface and optionally allow customer-uploaded brand fonts for the widget. Apple’s SF Pro is the system font for Apple platforms and is distributed through Apple Developer resources, so it should not be presented as a Google Font or bundled as a default SaaS web font unless the license is reviewed for the exact distribution use case ([Apple Fonts](https://developer.apple.com/fonts/)). Geist is already built for developer and designer workflows in Vercel’s ecosystem ([Vercel Geist](https://vercel.com/geist/introduction)), while Inter is a free typeface designed for user interfaces ([Inter](https://rsms.me/inter/)).

### Type scale

| Token | CSS variable | Size / line-height | Weight | Use |
|---|---|---:|---:|---|
| Display XL | `--text-display-xl` | 64 / 72 | 700 | Marketing hero only |
| Display | `--text-display` | 48 / 56 | 700 | Marketing section titles |
| H1 | `--text-h1` | 32 / 40 | 650 | Admin page titles |
| H2 | `--text-h2` | 24 / 32 | 625 | Card groups, modal titles |
| H3 | `--text-h3` | 18 / 28 | 600 | Card titles, setup steps |
| Body | `--text-body` | 14 / 22 | 400 | Default UI text |
| Label | `--text-label` | 13 / 18 | 550 | Form labels, table headers |
| Caption | `--text-caption` | 12 / 16 | 450 | Metadata, citation previews |
| Mono | `--text-mono` | 13 / 20 | 450 | API keys, logs, ticket IDs |

## 4. Color tokens

### Core brand scale

| Token | Hex | Use |
|---|---:|---|
| `primary-50` | `#F4F2FF` | Lavender page tint |
| `primary-100` | `#E8E4FF` | Soft gradient stop |
| `primary-200` | `#D7D0FF` | Empty-state illustration fills |
| `primary-300` | `#BBB0FF` | Secondary backgrounds |
| `primary-400` | `#9A88FF` | Hover accent |
| `primary-500` | `#7D66FF` | Primary hover |
| `primary-600` | `#6D56FF` | Primary brand |
| `primary-700` | `#5842E6` | Pressed primary |
| `primary-800` | `#4634B8` | Dark-mode accent text |
| `primary-900` | `#30247A` | Deep gradient stop |

### Pink secondary scale

| Token | Hex | Use |
|---|---:|---|
| `pink-50` | `#FFF1F8` | Soft marketing tint |
| `pink-100` | `#FDD2EA` | User-liked soft pink |
| `pink-200` | `#FBA8D7` | Gradient halo |
| `pink-300` | `#F86EBC` | Secondary brand |
| `pink-400` | `#ED3EA3` | Hover |
| `pink-500` | `#D91D8A` | Darker action accent |
| `pink-700` | `#9B0F62` | Accessible text on pale pink |

### Neutral scale

| Token | Light hex | Dark hex | Use |
|---|---:|---:|---|
| `neutral-0` | `#FFFFFF` | `#050507` | Surface |
| `neutral-25` | `#FCFCFD` | `#08090D` | App canvas |
| `neutral-50` | `#F8FAFC` | `#0B0D12` | Subtle fill |
| `neutral-100` | `#F1F5F9` | `#11141B` | Muted fill |
| `neutral-200` | `#E2E8F0` | `#1D2430` | Border strong |
| `neutral-300` | `#CBD5E1` | `#303846` | Input border |
| `neutral-500` | `#64748B` | `#94A3B8` | Secondary text |
| `neutral-700` | `#334155` | `#CBD5E1` | Body text |
| `neutral-900` | `#0F172A` | `#F8FAFC` | Headings |

### Semantic tokens that fix the muddy pills

Current olive/tan/gray status pills read as accidental because hue, saturation, and contrast are too close. Replace them with explicit semantic fills, borders, text, dots, and icons.

| Domain | State | Fill | Border | Text | Dot | Usage |
|---|---|---:|---:|---:|---:|---|
| Ticket status | New | `#EEF2FF` | `#C7D2FE` | `#3730A3` | `#6366F1` | Newly created, unread |
| Ticket status | In progress | `#EFF6FF` | `#BFDBFE` | `#1D4ED8` | `#3B82F6` | Human/AI is working |
| Ticket status | Waiting | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` | Waiting customer/manager |
| Ticket status | Resolved | `#ECFDF5` | `#A7F3D0` | `#047857` | `#22C55E` | Completed |
| Ticket status | Escalated | `#FEF2F2` | `#FECACA` | `#B91C1C` | `#EF4444` | Human required |
| Priority | Low | `#F8FAFC` | `#E2E8F0` | `#475569` | `#94A3B8` | Low impact |
| Priority | Medium | `#EFF6FF` | `#BFDBFE` | `#1D4ED8` | `#3B82F6` | Normal business impact |
| Priority | High | `#FFF7ED` | `#FED7AA` | `#C2410C` | `#F97316` | SLA/risk concern |
| Priority | Critical | `#FEF2F2` | `#FCA5A5` | `#991B1B` | `#DC2626` | Billing/security/legal risk |
| AI confidence | High | `#ECFDF5` | `#A7F3D0` | `#047857` | `#22C55E` | Auto-answer eligible |
| AI confidence | Medium | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` | Review if risky |
| AI confidence | Low | `#FEF2F2` | `#FECACA` | `#B91C1C` | `#EF4444` | Approval or escalation |

## 5. Dark-mode tokens

Dark mode should be a premium console theme, not an inverted marketing page. Use dark surfaces with low chroma, keep status fills translucent, and preserve text contrast.

```css
:root {
  --brand-h: 248;
  --brand-s: 100%;
  --brand-l: 67%;
  --color-primary: #6D56FF;
  --color-secondary: #F86EBC;
  --bg-canvas: #FCFCFD;
  --bg-surface: #FFFFFF;
  --bg-subtle: #F8FAFC;
  --border-subtle: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --status-new-bg: #EEF2FF;
  --status-new-text: #3730A3;
  --status-progress-bg: #EFF6FF;
  --status-progress-text: #1D4ED8;
  --status-resolved-bg: #ECFDF5;
  --status-resolved-text: #047857;
  --status-escalated-bg: #FEF2F2;
  --status-escalated-text: #B91C1C;
}

.dark {
  --bg-canvas: #08090D;
  --bg-surface: #0D1017;
  --bg-subtle: #11141B;
  --border-subtle: #242A36;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --status-new-bg: rgba(99, 102, 241, 0.16);
  --status-new-text: #C7D2FE;
  --status-progress-bg: rgba(59, 130, 246, 0.16);
  --status-progress-text: #BFDBFE;
  --status-resolved-bg: rgba(34, 197, 94, 0.14);
  --status-resolved-text: #86EFAC;
  --status-escalated-bg: rgba(239, 68, 68, 0.14);
  --status-escalated-text: #FCA5A5;
}
```

## 6. Spacing, radius, elevation, and motion

| Token family | Values | Guidance |
|---|---|---|
| Spacing | `2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96` px | Use 24 px card padding in marketing; 16–20 px in admin cards; 8–12 px inside table cells. |
| Radius | `6, 8, 12, 16, 20, 24, 32` px | Console controls: 8–12 px; marketing cards: 20–24 px; chat widget shell: 24 px desktop and 0–16 px mobile. |
| Border | `1px solid var(--border-subtle)` | Use borders as the default console separation, shadows only for layered surfaces. |
| Elevation 1 | `0 1px 2px rgba(15,23,42,.05)` | Tables, inputs, flat cards. |
| Elevation 2 | `0 8px 24px rgba(15,23,42,.08)` | Floating KPI cards, widget, dropdowns. |
| Elevation 3 | `0 20px 60px rgba(15,23,42,.14)` | Marketing hero cards, modals, command palette. |
| Glow brand | `0 24px 80px rgba(109,86,255,.22)` | Marketing only, never for admin tables. |
| Motion | `160ms ease-out`, `220ms cubic-bezier(.16,1,.3,1)`, `360ms spring-like` | Fast in console; slower and layered on marketing. |

## 7. Tailwind configuration example

Use CSS variables so tenants can override brand hue without recompiling the app. This pattern also keeps the widget white-labelable while preserving accessible semantic states.

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        border: "var(--border-subtle)",
        primary: {
          50: "#F4F2FF", 100: "#E8E4FF", 200: "#D7D0FF",
          300: "#BBB0FF", 400: "#9A88FF", 500: "#7D66FF",
          600: "#6D56FF", 700: "#5842E6", 800: "#4634B8", 900: "#30247A"
        },
        pink: {
          50: "#FFF1F8", 100: "#FDD2EA", 200: "#FBA8D7",
          300: "#F86EBC", 400: "#ED3EA3", 500: "#D91D8A", 700: "#9B0F62"
        },
        success: { bg: "#ECFDF5", border: "#A7F3D0", text: "#047857", solid: "#22C55E" },
        warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", solid: "#F59E0B" },
        danger: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C", solid: "#EF4444" },
        info: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", solid: "#3B82F6" }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.05)",
        panel: "0 8px 24px rgba(15,23,42,.08)",
        modal: "0 20px 60px rgba(15,23,42,.14)",
        glow: "0 24px 80px rgba(109,86,255,.22)"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
        xl4: "2rem"
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(.16,1,.3,1)"
      }
    }
  }
} satisfies Config;
```

## 8. Marketing component inventory

| Component | Styling guidance | Enterprise polish requirement |
|---|---|---|
| Navigation | Transparent over hero, becomes blurred white/dark glass after scroll, 44 px height links, one primary CTA. | Add “Security,” “Docs,” and “Login” links so buyers see credibility quickly. |
| Hero | Gradient mesh background using primary/pink/lavender; glass chat input in foreground; floating approval, citation, and metric cards. | Copy should say “AI support with cited answers and manager approvals,” not generic “automate support.” |
| Conversational hero input | Large rounded input with placeholder examples: “Ask about refunds,” “Check SSO setup,” “Where is my data hosted?” | On submit, animate a grounded answer with source cards and a high-risk approval badge. |
| Gradient proof cards | 24 px radius, subtle border, shadow glow, background blur, 3D stacking. | Show concrete metrics: citation coverage, AI acceptance, escalation SLA, approval queue. |
| Three-step “How it works” | Ingest docs → answer with citations → approve/action/escalate. | Each step should show a mini UI, not an icon-only card. |
| Pricing | Three cards: Lite, Pro, Enterprise; Enterprise has SSO/RBAC/audit/data residency. | Pricing cards should include trust limits and approval workflows, not only message volume. |
| Testimonials/logos | Muted grayscale logo strip with one highlighted quote. | Include security questionnaire / time-to-live proof when available. |
| FAQ | Accordion with RAG, citations, white-labeling, SSO, data retention, and self-hosted AI questions. | Answers must be short and linked to docs/security page. |
| Footer | Dense sitemap, compliance links, subprocessor link, status link, docs link. | Enterprise buyers expect security and legal links in the footer. |

## 9. Admin console component inventory

| Component | Styling guidance | UX behavior |
|---|---|---|
| Sidebar nav | 248 px width desktop, compact 64 px mode, active item with `primary-50` fill and `primary-600` left rail. | Include Overview, Tickets, Approvals, Knowledge, Analytics, Settings, Security, Billing. |
| Top bar | Tenant switcher, environment badge, search/command, notifications, user menu. | Show workspace/domain verification state near tenant switcher. |
| KPI cards | White/dark surface, 1 px border, subtle shadow, 12 px sparkline, 13 px label, 28 px value. | Add comparisons and definitions: “AI acceptance = approved AI replies / total eligible replies.” |
| Data tables | Sticky header, density toggle, row hover, right-side actions, status/priority badges from semantic tokens. | Never use muddy gray/olive/tan pills; all badges must map to token table above. |
| Approval cards | Risk title, confidence meter, source list, policy reason, “approve / edit / reject / escalate” buttons. | Show why review is required: refund, SSO, billing, residency, low retrieval score. |
| Ticket drawer | Timeline left, AI draft center, sources/policy/audit right. | Keep action buttons sticky at bottom; display model and source version metadata. |
| Filters | Saved views, status, priority, risk, assignee, confidence, source freshness. | Provide default views: “Needs approval,” “Low confidence,” “Billing disputes,” “Unassigned.” |
| Empty states | Illustration + one CTA + sample data option. | First-run empty states should launch setup checklist, not dead-end. |
| Charts | Use restrained bars/lines, not rainbow dashboards. | Pair each chart with operational action: “Add article,” “Tune policy,” “Invite manager.” |
| Settings forms | Stripe-like sections, validation, save bar, audit note. | Split Knowledge, Approval policies, Branding, Security, Members, Integrations, Billing. |
| Command palette | `Cmd/Ctrl K`, fuzzy search tickets/actions/settings/docs. | Supports “go to ticket,” “create source,” “invite member,” “verify domain.” |

## 10. Chat widget component inventory

| Component | Styling guidance | States |
|---|---|---|
| Launcher bubble | 56 px circular or rounded-square, tenant brand color, subtle shadow and unread dot. | Hidden, visible, unread, loading, offline. |
| Messenger shell | 380–420 px wide desktop, full-screen mobile, 24 px radius desktop, tenant logo in header. | Compact, expanded, mobile, embedded. |
| Header | Bot avatar, verified domain badge, “AI support” disclosure, human handoff status. | Online, waiting, escalated, maintenance. |
| User bubble | Right aligned, neutral/brand fill. | Sent, failed, retry. |
| AI bubble | Left aligned, surface fill, source chips below. | Streaming, cited, low confidence, approval pending. |
| Citations | Accordion with title, excerpt, source URL, freshness/version. | Collapsed, expanded, stale warning. |
| Typing indicator | Three-dot shimmer with accessible label. | Retrieve, think, draft, waiting approval. |
| Escalation CTA | Card with “Email team,” “Book call,” or “Create ticket.” | Pre-filled from conversation context. |
| Input | 44–52 px height, rounded, upload disabled unless tenant enables. | Disabled during approval or rate limit. |
| Privacy footer | “Answers use [Tenant] docs; sensitive requests may be reviewed by humans.” | Customizable by tenant. |

## 11. Multi-page page map

### Marketing + public pages

| Page | Layout notes |
|---|---|
| Homepage | Gradient hero with conversational input; floating approval/source cards; logo strip; “How it works”; security proof; pricing teaser; FAQ. |
| Platform / Product | Split by capabilities: RAG with citations, approval queue, white-label widget, analytics, integrations, model routing. |
| Services | Implementation packages: 24h launch, knowledge migration, enterprise integration, self-hosted model setup. |
| Pricing | Three cards plus enterprise comparison table; include model-routing and free/self-hosted strategy as a differentiator. |
| FAQ | Buyer objections: accuracy, citations, data privacy, SSO, widget security, free models, human approvals. |
| Blog | Editorial grid with category chips: AI support, RAG, security, cost, product updates. |
| Blog detail | Calm reading layout, sticky table of contents, author/date, related posts, CTA. |
| About | Founder/product story, trust posture, roadmap, customer promise. |
| Auth / login | Minimal card, gradient side panel, workspace-aware login, SSO CTA for enterprise. |
| 404 | Friendly “route not found,” search, docs, support CTA, return home. |

### App pages

| Page | Layout notes |
|---|---|
| Overview | KPI cards, trend chart, setup health, recent tickets, approval backlog, knowledge freshness. |
| Tickets | Table-first inbox with saved views, filters, priority/status badges, ticket drawer. |
| Knowledge | Source health, upload/import, chunk preview, reindex queue, missing-answer report. |
| Approvals | Review cards grouped by risk and SLA, compare AI draft/source/policy, batch actions. |
| Analytics | Deflection, acceptance, escalation, top intents, source gaps, model cost, latency. |
| Settings | Workspace, widget, brand voice, approval policies, domains, escalation routes. |
| Security | Members, roles, SSO, API keys, audit logs, retention, data residency. |
| Billing | Plan, usage, reply bundles, model cost, invoices, enterprise contact. |

## 12. White-label theming implementation

Store theme at the workspace/widget level as token overrides, not arbitrary CSS. This keeps customer branding flexible while preventing low-contrast or broken states.

```ts
export type WorkspaceTheme = {
  brandName: string;
  logoUrl?: string;
  primary: string;      // default #6D56FF
  secondary?: string;   // default #F86EBC
  radius: "soft" | "rounded" | "pill";
  fontFamily: "geist" | "inter" | "system" | "custom";
  customFontUrl?: string;
  mode: "light" | "dark" | "system";
  widgetPosition: "right" | "left";
};
```

```css
[data-workspace-theme] {
  --color-primary: var(--tenant-primary, #6D56FF);
  --color-secondary: var(--tenant-secondary, #F86EBC);
  --radius-widget: var(--tenant-radius-widget, 24px);
}
```

Validate tenant colors before publishing by calculating contrast for primary button text, link text, focus rings, and badge text. If a tenant chooses an inaccessible color, use it for decoration and derive accessible text/button variants automatically.

## 13. Before → after fixes

### Flat landing hero

**Before:** flat white hero, generic cards, no clear product demonstration, little depth.
**After:** premium gradient mesh; single conversational input; animated answer with citations; floating “Needs approval: refund policy” card; security and setup proof directly below hero.

### Muddy admin pills

**Before:** olive/tan/gray pills look accidental and reduce scan speed.
**After:** status and priority badges use the semantic table above, with a colored dot, high-contrast text, and consistent shape: `inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium`.

### Default shadcn console

**Before:** cards are flat and all surfaces share equal weight.
**After:** canvas is slightly tinted, cards have borders and one elevation level, critical review cards have stronger hierarchy, and tables use density, sticky headers, hover states, and right-aligned row actions.

## 14. Implementation sequence

1. Add tokens as CSS variables and Tailwind theme extensions.
2. Replace all status/priority/confidence pills with tokenized `Badge` variants.
3. Build admin shell primitives: sidebar, top bar, page header, KPI card, table, drawer.
4. Redesign landing hero and pricing with the premium gradient system.
5. Add widget theme schema and contrast validation.
6. Add a `DESIGN.md` file containing the reference blend, token rules, and “marketing expressive / console restrained” principle.
