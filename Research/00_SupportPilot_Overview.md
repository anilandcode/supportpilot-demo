# SupportPilot Enterprise Blueprint — Overview

## Executive summary

SupportPilot should become a white-label, enterprise-grade AI support platform that agencies, SaaS companies, and internal support teams can deploy in under 24 hours while still scaling into SOC 2-ready, multi-tenant, human-supervised automation. The current public seed is already a strong base: the repository describes an “enterprise AI support workspace” with a Lite embeddable chat path, Supabase-backed auth/tickets/RAG/approval/audit/analytics when environment variables are configured, and a route set that includes `/embed`, `/admin`, `/admin/tickets`, `/admin/knowledge`, `/admin/approvals`, and `/admin/analytics` ([GitHub repository page](https://github.com/anilandcode/supportpilot-demo)).

The core wedge is not “another chatbot”; it is a deployable AI support operating layer for businesses that need instant, cited answers, branded embeds, controlled escalation, and manager approval for high-risk AI replies. The demo already names the right enterprise primitives: tickets, knowledge ingestion, RAG, approval workflows, audit logs, analytics, Sentry observability, and provider choice across Google, OpenAI, or Anthropic via Vercel AI SDK ([GitHub repository page](https://github.com/anilandcode/supportpilot-demo)).

The recommended build path is two-tiered: a **Light** version that stays near-zero-cost through Vercel, Neon/Supabase pgvector, Gemini free-tier inference, Resend, PostHog, and Sentry; and an **Advanced** version that adds multi-model routing, reranking, queue-based ingestion, RBAC, audit trails, approval policies, integrations, data-residency controls, and SOC 2 readiness. This mirrors the market’s shift from seat-based helpdesks toward AI outcomes: Intercom prices Fin at $0.99 per outcome, Zendesk publicly frames AI-agent billing around automated resolutions, Sierra promotes outcome-based pricing, and Decagon supports per-conversation or per-resolution AI-agent pricing ([Intercom pricing](https://www.intercom.com/pricing), [Zendesk outcome-pricing announcement](https://www.zendesk.com/newsroom/articles/zendesk-outcome-based-pricing/), [Sierra outcome-based pricing](https://sierra.ai/blog/outcome-based-pricing-for-ai-agents), [Decagon pricing analysis](https://decagon.ai/blog/pricing-ai-agents)).

## Product definition

SupportPilot is a 24/7 white-label AI customer-support agent that answers from customer knowledge sources, cites the source material used, escalates when confidence or risk requires it, and gives managers an approval queue for sensitive AI drafts. The existing demo already exposes seeded customers, tickets, knowledge articles, policy docs, escalated tickets, AI draft replies, feedback, audit logs, and escalation rules, which makes the current repo a credible enterprise seed rather than a throwaway mockup ([GitHub repository page](https://github.com/anilandcode/supportpilot-demo)).

The product should serve five deployment modes:

1. **Self-serve SaaS** — a customer signs up, pastes docs, chooses colors/personality, and installs one script snippet.
2. **Agency white-label** — an agency creates separate tenant workspaces for clients, each with branded bot configuration and separate knowledge bases.
3. **Embedded support copilot** — a SaaS embeds SupportPilot inside its app or docs portal.
4. **Helpdesk augmentation** — SupportPilot drafts answers and escalates to Zendesk/Gorgias/Intercom instead of replacing them.
5. **Enterprise AI service layer** — SupportPilot becomes the policy-aware orchestration layer for chat, email, Slack, Calendly, ticketing, and later voice.

## Strategic thesis

SupportPilot should compete below Sierra/Decagon on accessibility and speed-to-launch while borrowing their enterprise-grade ideas: outcome alignment, agent actions, guardrails, and human supervision. Sierra says outcome-based pricing works where work is highly autonomous and attributable, while Decagon says customers choose between per-conversation and per-resolution pricing for autonomous customer-service agents ([Sierra outcomemaxxing](https://sierra.ai/blog/outcomemaxxing), [Decagon pricing analysis](https://decagon.ai/blog/pricing-ai-agents)).

SupportPilot’s near-term moat should be implementation velocity plus trust infrastructure: citations, approval queue, audit logs, source management, and deploy-anywhere widgets. Compliance demand is rising because the EU AI Act has phased obligations from 2025 onward, and general-purpose AI obligations apply in the 2025–2027 implementation window ([European Commission AI Act page](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), [European Commission GPAI guidelines](https://digital-strategy.ec.europa.eu/en/policies/guidelines-gpai-providers)).

## How this document set is organized

| File | Purpose |
|---|---|
| `00_SupportPilot_Overview.md` | Vision, product definition, strategic thesis, and reading guide. |
| `01_Market_Research_2026.md` | Market size, competitors, pricing models, trends, and 2027 predictions. |
| `02_Enterprise_Architecture.md` | Multi-tenant architecture, RAG, agentic workflows, security, observability, integrations, and Mermaid diagrams. |
| `03_ZeroCost_Tech_Stack.md` | Free-tier and near-free stack table with limits, upgrade triggers, and scaling costs. |
| `04_Design_System.md` | DESIGN.md/getdesign.md guidance, visual references, tokens, and component inventory. |
| `05_Light_vs_Advanced_Plan.md` | Scope, include/exclude tables, and upgrade path from Light MVP to Advanced enterprise. |
| `06_Build_and_Launch_Roadmap.md` | Phased build roadmap, repo structure, CI/CD, tests, security checklist, GTM, pricing, and risks. |

## Recommended north-star metrics

| Metric | Target for Light | Target for Advanced |
|---|---:|---:|
| First response latency | < 2.5s p50 for cached/simple RAG | < 2.0s p50 with streaming and route-aware model selection |
| Citation coverage | 95%+ of factual answers cite at least one source | 98%+ citation coverage with source-span auditability |
| Human escalation accuracy | Manual review in MVP | Policy-driven confidence/risk routing with manager override |
| AI acceptance rate | 40–60% for low-risk FAQ use cases | 65–85% for mature tenants with curated knowledge |
| Approval SLA | Same-day manager approval | Policy-configurable queues, reminders, and audit exports |
| Tenant isolation | Tenant ID filters and RLS | RLS, org-scoped keys, audit logs, per-tenant retention and residency |

## Build principles

- **Ground every answer**: default to “I don’t know” or escalation when retrieval confidence is weak.
- **Treat actions as privileged**: refunds, billing changes, SSO/security changes, and legal/data-residency questions should require policy checks and possibly approval.
- **Keep the Light path cheap**: a single Next.js/Vercel app plus Neon/Supabase pgvector and Gemini can validate demand before introducing more moving parts.
- **Make the Advanced path modular**: ingestion, retrieval, agent orchestration, ticketing, analytics, and integrations should be independently replaceable.
- **Design for white-label from day one**: theme tokens, bot personality, widget domain allowlists, email templates, and client-facing reports should all be tenant-configurable.
