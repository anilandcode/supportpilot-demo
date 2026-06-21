# SupportPilot Design System

## Design-system recommendation

SupportPilot should use **shadcn/ui + Radix Primitives + Tailwind CSS + Geist typography + a custom `DESIGN.md` inspired by Linear, Vercel/Geist, Stripe, Intercom, and Supabase**. shadcn/ui provides composable Tailwind/Radix components, Radix Primitives provide accessible unstyled building blocks, and Tailwind’s theme system provides tokenized color/spacing/typography control ([shadcn/ui docs](https://ui.shadcn.com/docs), [Radix Primitives](https://www.radix-ui.com/primitives), [Tailwind theme docs](https://tailwindcss.com/docs/theme)).

The user asked to evaluate getdesign.md / DESIGN.md references, and getdesign.md describes DESIGN.md as a markdown file that explains visual theme, colors, typography, spacing, components, and rationale so AI coding agents can generate consistent UI ([getdesign.md DESIGN.md explainer](https://getdesign.md/what-is-design-md)).

getdesign.md says its catalog includes inspiration files based on Vercel, Stripe, Linear, Notion, Figma, Supabase, and other public design patterns, while also clarifying that these are independent reference materials rather than official design analyses ([getdesign.md DESIGN.md explainer](https://getdesign.md/what-is-design-md), [getdesign.md about page](https://getdesign.md/about)).

## Recommended reference blend

| Reference | What to borrow | Why it fits SupportPilot | Source |
|---|---|---|---|
| Linear | Dense, elegant admin dashboards; keyboard-first operations; issue/ticket clarity | Approval queue, tickets, metrics, and inbox need speed and density | [Linear dashboards docs](https://linear.app/docs/dashboards) |
| Vercel / Geist | Neutral technical aesthetic, excellent typography, subtle borders, low-noise surfaces | SupportPilot is developer-friendly and white-label; Geist avoids “AI toy” visuals | [Vercel Geist](https://vercel.com/geist/introduction), [Vercel design tokens](https://vercel.com/design) |
| Stripe | Developer-first forms, docs, billing, and enterprise trust patterns | Billing, API keys, onboarding, and integration setup should feel safe | [Stripe app design docs](https://docs.stripe.com/stripe-apps/design) |
| Intercom | Conversational widget patterns, messenger customization, support UX expectations | Users already understand corner bubble → messenger → escalation | [Intercom Messenger setup docs](https://www.intercom.com/help/en/articles/6612589-set-up-and-customize-the-messenger) |
| Supabase | Green-accented developer SaaS, database/admin clarity | Fits Postgres/RAG developer audience and admin data views | [Supabase pricing/site](https://supabase.com/pricing) |
| IBM Carbon | Enterprise accessibility, forms, data tables, and governance patterns | Useful when building enterprise admin screens and compliance workflows | [IBM Carbon Design System](https://carbondesignsystem.com) |

## Visual direction

SupportPilot should look like an enterprise operations console, not a mascot chatbot. The admin UI should be calm, dense, and trustworthy; the widget should be branded, lightweight, and friendly without hiding citations or escalation status.

Recommended aesthetic:

- **Base**: Vercel/Geist neutral surfaces, thin borders, precise typography.
- **Dashboard density**: Linear-style tables, keyboard shortcuts, compact filters, and low-friction status changes.
- **Trust moments**: Stripe-style error copy, billing clarity, integration states, API-key screens, and empty states.
- **Conversation**: Intercom-style bubble and messenger affordances, but with SupportPilot-specific citation cards and “escalating to human” transparency.
- **Enterprise options**: Carbon-inspired data tables, form validation, focus rings, and accessibility discipline.

## Token foundation

Vercel’s design page describes Geist Sans for UI/prose and Geist Mono for code/data/tabular figures, with tokens for background surfaces, gray alpha borders, component sizing, shadows, and precise copy guidance ([Vercel design tokens](https://vercel.com/design)).

### Core tokens

```css
:root {
  --font-sans: "Geist", "Inter", system-ui, sans-serif;
  --font-mono: "Geist Mono", "SFMono-Regular", ui-monospace, monospace;

  --bg-canvas: #fafafa;
  --bg-surface: #ffffff;
  --bg-subtle: #f4f4f5;
  --bg-inverse: #09090b;

  --text-primary: #18181b;
  --text-secondary: #52525b;
  --text-muted: #71717a;
  --text-inverse: #fafafa;

  --border-subtle: rgba(24, 24, 27, 0.08);
  --border-strong: rgba(24, 24, 27, 0.16);

  --accent: #10b981;
  --accent-foreground: #ffffff;
  --accent-soft: #d1fae5;

  --risk-low: #10b981;
  --risk-medium: #f59e0b;
  --risk-high: #ef4444;
  --risk-critical: #7f1d1d;

  --priority-low: #22c55e;
  --priority-medium: #f59e0b;
  --priority-critical: #dc2626;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-popover: 0 8px 24px rgba(0,0,0,0.10);
}
```

### Typography

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 32/40 | 650 | Admin page title, marketing hero |
| `title` | 24/32 | 600 | Dashboard sections, modal titles |
| `subtitle` | 18/28 | 550 | Card headings, setup steps |
| `body` | 14/22 | 400 | Default UI copy |
| `label` | 13/18 | 500 | Form labels, table headers |
| `caption` | 12/16 | 400 | Metadata, citations, helper copy |
| `mono` | 13/20 | 450 | API keys, IDs, logs, token counts |

### Color roles

| Role | Token | Use |
|---|---|---|
| Canvas | `--bg-canvas` | Full admin background |
| Surface | `--bg-surface` | Cards, panels, tables, widget body |
| Subtle | `--bg-subtle` | Toolbar backgrounds, inactive tabs |
| Accent | `--accent` | Primary CTA, active nav, resolved metric |
| Risk | `--risk-*` | Approval categories and safety badges |
| Border | `--border-subtle` | Tables, cards, input outlines |

## `DESIGN.md` file strategy

SupportPilot should maintain a project-root `DESIGN.md` that coding agents must read before creating UI. getdesign.md says a DESIGN.md keeps tokens, rules, and rationale together so an agent can make correct design calls when a situation is not explicitly covered ([getdesign.md DESIGN.md explainer](https://getdesign.md/what-is-design-md)).

Recommended `DESIGN.md` sections:

1. Visual theme and atmosphere.
2. Color palette and semantic roles.
3. Typography and numeric/data rules.
4. Component styling rules.
5. Layout principles and responsive breakpoints.
6. Depth, elevation, and motion.
7. Accessibility and keyboard behavior.
8. Do/don’t examples.
9. Agent prompt guide for Cursor/Claude Code.

## Component inventory — chat widget

| Component | Purpose | Key states |
|---|---|---|
| Launcher bubble | Entry point on customer site | closed, unread, loading, offline, hidden by route |
| Messenger shell | Iframe chat container | compact, full, mobile full-screen, embedded fallback |
| Header | Bot name, status, tenant brand | online, human handoff, maintenance |
| Message bubble | User/AI/human messages | streaming, failed, retried, cited |
| Citation card | Source title, quote, doc link | collapsed, expanded, stale source warning |
| Quick replies | Common intents | keyboard focus, disabled after selection |
| Escalation panel | Email/Slack/Calendly handoff | form, sent, scheduled, failed |
| Approval pending notice | Tells user a human must approve reply | pending, approved, rejected, escalated |
| Feedback control | thumbs up/down + reason | submitted, edited |
| Privacy footer | Tenant-specific disclosure | default, enterprise custom text |

## Component inventory — admin dashboard

| Area | Components |
|---|---|
| Navigation | Sidebar, tenant switcher, environment badge, command menu |
| Metrics | KPI cards, trend sparkline, AI acceptance %, escalated %, resolution time |
| Tickets | Data table, status badge, priority badge, risk badge, filters, bulk actions |
| Inbox | Conversation timeline, internal notes, AI draft panel, source drawer |
| Approval queue | Draft comparison, risk reason, citations, approve/edit/reject, audit trail |
| Knowledge | Source list, upload dropzone, Notion connector, chunk preview, reindex button |
| Analytics | Intent chart, missing-docs report, model cost table, resolution funnel |
| Integrations | Slack, Calendly, email, Zendesk, Gorgias, Intercom, webhook tester |
| Security | Members, roles, API keys, domain allowlist, audit log, retention settings |
| Billing | Plan card, usage meters, Stripe portal, outcome telemetry preview |

## Admin dashboard UX rules

- Use compact tables with visible status, priority, customer, assignee, risk, last activity, and SLA columns.
- Keep the AI draft beside the source citations so managers can verify claims quickly.
- Make approval decisions one-click but reversible through audit-aware “reopen” workflows.
- Surface model cost and acceptance rate near AI-performance settings.
- Keep dangerous integration actions behind confirmation dialogs and role checks.

## Widget UX rules

- Always show when an answer is based on sources.
- Never imply a human has reviewed an unapproved draft.
- Use tenant brand color sparingly for launcher, primary CTA, and active state.
- Keep the default widget bundle visually neutral so white-label themes do not clash with customer websites.
- On mobile, use full-height chat with sticky composer and visible close/back controls.

## Accessibility requirements

Radix Primitives are designed as accessible unstyled components, which makes them a strong foundation for dialogs, menus, popovers, tabs, and form controls ([Radix Primitives](https://www.radix-ui.com/primitives)).

SupportPilot should require keyboard navigation, focus rings, reduced-motion support, sufficient contrast, screen-reader labels, and no color-only status communication.

## Alternatives if shadcn is not enough

| Alternative | Use when | Trade-off |
|---|---|---|
| Tailwind UI | Need polished commercial templates quickly | Paid, less custom/systematic than internal DS |
| Radix Themes | Want faster theming and built-in component polish | Less distinctive than custom shadcn implementation |
| Material UI | Need broad enterprise components and familiarity | Heavier, less bespoke, more Google-like |
| IBM Carbon | Need rigorous enterprise forms/tables/accessibility | Strong but visually more corporate and less startup-native |
| Headless UI | Need minimal accessible primitives | Smaller primitive set than Radix |

## Final design recommendation

Use shadcn/ui as the component source, Radix for accessibility primitives, Tailwind for tokens, Geist for type, and a SupportPilot `DESIGN.md` that blends Vercel’s precision, Linear’s operational density, Stripe’s trust patterns, and Intercom’s conversational affordances. This combination is fast for an advanced full-stack developer, friendly to AI coding agents, and credible for enterprise buyers.
