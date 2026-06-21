# SupportPilot Build and Launch Roadmap

## Roadmap summary

SupportPilot should launch in three engineering releases: **Light MVP**, **Pro workflow platform**, and **Advanced enterprise platform**. The sequencing should preserve the demo’s existing strengths—Next.js app, embed route, admin routes, Supabase-ready RAG/tickets/approvals/audits/analytics—while turning them into production systems ([GitHub repository page](https://github.com/anilandcode/supportpilot-demo)).

## Phase roadmap

| Phase | Timeline | Goal | Major deliverables | Exit criteria |
|---|---:|---|---|---|
| 0. Repo audit and product baseline | 2–4 days | Stabilize current demo into a production-ready foundation | Env matrix, route audit, schema review, seed scripts, README, deployment checklist | Demo deploys from clean clone with seeded data and documented env vars |
| 1. Light MVP | 2–3 weeks | Sell “live in 24h” white-label RAG support bot | Tenant setup, docs upload/paste, pgvector RAG, cited answers, widget, admin metrics, email escalation, basic approval queue | First 3 pilot customers installed and answering from their docs |
| 2. Pro workflow | 3–5 weeks | Make support ops useful beyond chatbot | Inbox, ticket lifecycle, Slack/Calendly, feedback loop, source-quality dashboard, PostHog/Sentry, Stripe billing | Customers can manage escalations and approve drafts daily |
| 3. Advanced agentic | 6–10 weeks | Add safe actions and enterprise controls | Tool registry, model router, reranking, policies, RBAC, audit exports, Zendesk/Gorgias/Intercom integrations | AI can draft/action low-risk workflows and queue high-risk approvals |
| 4. Enterprise readiness | 8–12 weeks parallel | Prepare for larger customers | SSO, retention, DPA, subprocessor page, SOC 2 evidence, pen-test fixes, SLAs | Enterprise security questionnaire can be answered confidently |
| 5. Voice and vertical packs | 2027 | Add high-ACV differentiation | Voice channel, ecommerce/SaaS/legal templates, QA automation | Voice or vertical pack closes expansion deals |

## Suggested monorepo structure

```txt
supportpilot/
  apps/
    web/                       # Next.js admin, portal, marketing, embed route
    widget/                    # Tiny widget loader package if split from app
  packages/
    ui/                        # shadcn components, tokens, DESIGN.md helpers
    db/                        # schema, migrations, typed repositories
    rag/                       # ingestion, chunking, retrieval, citations
    ai/                        # model router, providers, prompts, evals
    agent-runtime/             # tool calling, policies, approval orchestration
    integrations/              # Slack, Calendly, Zendesk, Gorgias, Intercom, email
    analytics/                 # events, PostHog, usage metering
    security/                  # RBAC, audit, PII redaction, rate limits
    config/                    # tenant config, plan entitlements
  workers/
    ingestion-worker/
    eval-worker/
    webhook-worker/
  supabase/ or migrations/
    schema.sql
    policies.sql
    seed.sql
  docs/
    architecture.md
    api.md
    deployment.md
    security.md
    runbooks/
  tests/
    e2e/
    evals/
    fixtures/
```

## CI/CD plan

| Area | Recommendation |
|---|---|
| Branching | `main` for production, `dev` for integration, preview branches for PRs. |
| CI | Typecheck, lint, unit tests, migration dry-run, prompt/eval smoke tests. |
| Preview | Vercel preview deployments with isolated preview DB branch when possible. |
| Migrations | Use Drizzle/Prisma/Supabase migrations; never mutate production manually. |
| Secrets | Store provider keys in Vercel/hosting secret manager; never expose server keys to widget. |
| Release | Version API routes and widget loader; maintain rollback for widget JS. |
| Monitoring | Sentry release tracking and PostHog feature flags from first pilot. |

Sentry Free includes alerts, notifications, unlimited users, dashboards, and 5k errors, which is enough for initial production monitoring but should be upgraded as customer volume grows ([Sentry pricing](https://sentry.io/pricing/)).

PostHog Free includes product analytics, session replay, feature flags, surveys, error tracking, AI observability events, workflows, and logs across monthly quotas, which makes it a strong default for launch telemetry ([PostHog pricing](https://posthog.com/pricing)).

## Environment plan

| Environment | Purpose | Data |
|---|---|---|
| Local | Development with seeded demo data | Synthetic data only |
| Preview | PR review and customer demos | Disposable DB branch or demo tenant |
| Staging | Integration tests and migration rehearsal | Sanitized production-like data |
| Production | Paying customers | Backed up, monitored, tenant-isolated |

## Testing plan

| Test type | What to test |
|---|---|
| Unit | Chunking, citation formatting, policy decisions, model-router selection, RBAC checks. |
| Integration | Upload → chunk → embed → retrieve → answer → cite; ticket escalation; approval decisions. |
| E2E | Widget install, conversation, source citation, email escalation, admin approval. |
| Security | RLS bypass attempts, widget origin spoofing, API key scope, prompt injection, PII leakage. |
| AI evals | Faithfulness, citation relevance, refusal behavior, escalation accuracy, tone, hallucination. |
| Load | Concurrent widget sessions, large docs upload, vector query latency, dashboard metrics. |
| Regression | Golden questions per tenant before/after doc/model/prompt changes. |

OWASP’s LLM Top 10 should guide AI security tests for prompt injection, sensitive data disclosure, insecure output handling, and excessive agency ([OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)).

NIST’s AI Risk Management Framework should guide governance artifacts for mapping AI use cases, measuring risks, managing mitigations, and governing ownership ([NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)).

## Security checklist

### Application security

- Enforce tenant-scoped repository methods and RLS policies on all tenant tables.
- Add widget domain allowlists and validate request `Origin`/`Referer`.
- Use separate publishable workspace IDs and secret API keys.
- Rate-limit by tenant, IP, visitor, and endpoint.
- Encrypt OAuth tokens and integration secrets.
- Rotate secrets and document break-glass access.

### AI security

- Strip or sandbox untrusted HTML from ingested docs.
- Mark retrieved content as untrusted context in prompts.
- Never let the model directly execute tools; application code must validate schemas and policies.
- Require approval for financial, security, billing-dispute, legal, or data-residency actions.
- Log prompts, retrieved source IDs, model IDs, tool calls, and approval decisions with redaction.
- Run adversarial evals for prompt injection, fake policy sources, and source-conflict scenarios.

### Compliance readiness

- Maintain a data map of customer docs, chat transcripts, tickets, and integration credentials.
- Publish DPA, subprocessors list, retention policy, security overview, and incident-contact process.
- Add access reviews, audit logs, backup policies, vulnerability management, and change-management evidence.
- Offer data deletion/export workflows per tenant.
- Prepare SSO/SAML and SCIM for enterprise expansion.

The EU AI Act and GPAI guidance make AI governance and documentation increasingly important for vendors operating near EU customers or using general-purpose AI models ([European Commission AI Act page](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), [European Commission GPAI guidelines](https://digital-strategy.ec.europa.eu/en/policies/guidelines-gpai-providers)).

## Build backlog by milestone

### Milestone 0 — harden the seed

- Normalize environment variables and create `.env.example`.
- Add migration reset and seed commands.
- Confirm `/embed`, `/widget-test`, `/admin`, `/admin/tickets`, `/admin/knowledge`, `/admin/approvals`, and `/admin/analytics` are production-route ready.
- Add typed event taxonomy for chat, retrieval, AI run, approval, escalation, and billing usage.
- Add a `DESIGN.md` file and enforce shared UI tokens.

### Milestone 1 — Light MVP

- Tenant creation and settings.
- Widget configuration and domain allowlist.
- Markdown/text ingestion.
- Chunk table and embeddings table.
- Chat API with streaming response and citations.
- Email escalation via Resend.
- Basic admin metrics and ticket table.
- Risk-category classifier and simple approval queue.
- Stripe Checkout and customer portal.

Resend Free supports 100 emails/day and 3,000 emails/month, so it is sufficient for early escalation emails but should be upgraded before higher-volume customers ([Resend account quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits)).

### Milestone 2 — Pro workflow

- Slack webhook escalation.
- Calendly escalation CTA.
- Feedback capture and AI acceptance tracking.
- Source quality dashboard.
- Knowledge-gap report.
- Conversation inbox with internal notes.
- Customer-facing monthly report.
- PostHog dashboards and Sentry release tracking.

Slack Incoming Webhooks are enough for posting escalation messages into Slack channels, and Calendly’s developer platform can support scheduling workflows and webhooks as escalation matures ([Slack Incoming Webhooks docs](https://api.slack.com/messaging/webhooks), [Calendly developer docs](https://developer.calendly.com/api-docs)).

### Milestone 3 — Advanced agentic

- Tool registry with JSON schemas.
- Policy engine and approval rules.
- Tool execution logs and idempotency keys.
- Model router with provider fallback.
- Reranking/hybrid search.
- RBAC roles and permissions.
- Audit log export.
- Zendesk ticket creation/update integration.

Zendesk’s ticket API supports ticket operations, making it a practical first helpdesk writeback target for enterprise customers already standardized on Zendesk ([Zendesk Tickets API](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/)).

### Milestone 4 — enterprise readiness

- SAML/SSO integration.
- SCIM or user provisioning path.
- Data retention policies.
- Per-tenant export/delete.
- Security questionnaire packet.
- DPA and subprocessors page.
- Incident response runbook.
- SOC 2 evidence folder.

## GTM and launch checklist

### Positioning

Use: **“White-label AI support agent with cited answers, approval workflows, and human escalation — live in 24 hours.”**

Avoid: **“Fully autonomous support replacement.”** Gartner-reported 2026 findings suggest service leaders are expanding human responsibilities and redesigning roles rather than simply eliminating humans ([Financial Times Markets / Gartner release](https://markets.ft.com/data/announce/detail?dockey=600-202604280330BIZWIRE_USPRX____20260428_BW850485-1)).

### Ideal initial customers

| Segment | Pain | Offer |
|---|---|---|
| Web agencies | Need recurring AI services for clients | White-label client workspaces and “AI support in 24h” setup |
| SaaS startups | Repetitive docs/support questions | Embeddable cited RAG bot and email escalation |
| Shopify/ecommerce brands | Returns, shipping, product questions | Product/return-policy bot with human escalation |
| B2B service firms | Lead/support intake after hours | Bot + Calendly/email escalation |
| Internal teams | Need knowledge assistant for support ops | Admin-only knowledge bot with approval queue |

### Onboarding flow

1. Create workspace and choose brand colors/bot name.
2. Add domain allowlist.
3. Paste FAQ or upload Markdown.
4. Run ingestion and preview top questions.
5. Configure escalation email and optional Calendly link.
6. Install script snippet.
7. Run test questions and approve launch.
8. Review first-week analytics and missing-docs report.

### Pricing to test

| Plan | Price | Target | Notes |
|---|---:|---|---|
| Lite | $49–$99/month | Small business | 1 bot, email escalation, 500–1,000 AI replies |
| Agency | $199–$399/month | Agencies | 5 client workspaces, white-label reports |
| Pro | $499–$999/month | SaaS/ecommerce | Slack/Calendly, approvals, analytics, higher usage |
| Enterprise | Custom annual | Regulated/high volume | SSO, audit exports, custom integrations, SLA |

Intercom, Zendesk, Sierra, Decagon, Gorgias, Crisp, and Chatbase show that the market accepts a mix of outcome, usage, seat, and flat workspace models, so SupportPilot should start simple and instrument for future outcome pricing ([Intercom pricing](https://www.intercom.com/pricing), [Zendesk outcome-pricing announcement](https://www.zendesk.com/newsroom/articles/zendesk-outcome-based-pricing/), [Sierra outcome-based pricing](https://sierra.ai/blog/outcome-based-pricing-for-ai-agents), [Decagon pricing analysis](https://decagon.ai/blog/pricing-ai-agents), [Gorgias billing docs](https://docs.gorgias.com/en-US/how-youre-billed-for-using-gorgias-199385), [Crisp pricing](https://crisp.chat/en/pricing/), [Chatbase pricing](https://www.chatbase.co/pricing)).

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Hallucinated answers | Loss of trust and customer harm | Cite every factual answer, confidence gate, no-source escalation, golden evals. |
| Prompt injection through docs | Tool misuse or bad answers | Treat retrieved docs as untrusted, separate system instructions, tool-policy checks, OWASP-guided tests. |
| Free-tier exhaustion | Downtime or degraded UX | Usage meters, tenant quotas, provider fallback, upgrade thresholds. |
| Weak tenant isolation | Security incident | RLS, tenant-scoped repositories, audit logs, automated tests for cross-tenant access. |
| Approval queue overload | Slow human response | Better risk thresholds, templates, batching, priority queues. |
| Integration failures | Escalations lost | Retry queues, dead-letter logs, integration health checks, manual fallback email. |
| Competitive compression | Price pressure from incumbents | White-label agency channel, deployment speed, approval workflows, source governance. |
| Compliance blockers | Enterprise deals stall | DPA, subprocessors, audit logs, access reviews, SSO roadmap, SOC 2 readiness folder. |
| Model-provider volatility | Cost or quality changes | Multi-model router, stored model metadata, prompt evals, fallback providers. |

## First 30 days action plan

| Day range | Actions |
|---|---|
| Days 1–3 | Audit repo, confirm routes, write env/deploy docs, create migration baseline. |
| Days 4–7 | Ship tenant config, widget settings, domain allowlist, source upload/paste. |
| Days 8–12 | Implement RAG answer contract with citations, confidence, risk, and escalation result. |
| Days 13–16 | Build admin metrics, tickets table, inbox view, and basic approval queue. |
| Days 17–20 | Add Resend escalation, PostHog events, Sentry release tracking, and Stripe checkout. |
| Days 21–24 | Install for 2–3 pilot customers, collect questions, patch missing docs and UX issues. |
| Days 25–30 | Publish landing page, onboarding docs, pricing page, demo video, agency outreach list. |

## Launch assets

- Landing page with “live in 24h” promise.
- Interactive widget demo with citations and escalation.
- Admin dashboard screenshots: metrics, tickets, approval queue, knowledge.
- Security one-pager: data handling, tenant isolation, model providers, retention.
- Integration docs: Webflow, WordPress, Shopify, Squarespace, plain HTML.
- API docs for chat, feedback, source upload, tickets, and approvals.
- Pilot case-study template showing deflection, acceptance, and escalation metrics.

## Final recommendation

Ship Light quickly, but lay enterprise foundations immediately: tenant IDs, source versions, model metadata, audit events, approval policies, and usage metering. The market is moving toward agentic/outcome-priced support, but the winning near-term product is the one businesses can trust, install, and understand.
