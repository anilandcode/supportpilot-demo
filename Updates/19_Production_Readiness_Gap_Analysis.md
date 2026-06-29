# 19 — SupportPilot Production Readiness Gap Analysis

## Purpose

This document converts the remaining SupportPilot gaps into a production-readiness matrix. It builds on the existing enterprise architecture, zero-cost stack, security, agentic architecture, small-model strategy, feature matrix, and roadmap documents rather than repeating them ([02 architecture](./02_Enterprise_Architecture.md), [03 zero-cost stack](./03_ZeroCost_Tech_Stack.md), [09 security](./09_Security_Enterprise_Readiness.md), [10 agentic architecture](./10_Agentic_Architecture.md), [11 small models](./11_Small_Models_and_Cost_Strategy.md), [17 feature matrix](./17_Feature_Set_Matrix.md), [06 roadmap](./06_Build_and_Launch_Roadmap.md), [18 redesign plan](./18_Redesign_Action_Plan.md)).

## Executive readiness verdict

SupportPilot is now **feature-complete as a portfolio/demo and product proof**, but it is not yet **production-complete as a real multi-tenant SaaS**. The biggest remaining blocker is not the landing page, UI, RAG, approvals, or analytics; it is **production identity plus tenant lifecycle**: real sign-up, login, role-based access, workspace creation, invites, onboarding, and live Supabase RLS verification against a clean project.

The recommended auth path is Supabase Auth because the app already depends on Supabase/Postgres/pgvector/RLS, and Supabase Auth is integrated with Postgres Row Level Security so JWT-authenticated requests can be authorized at the database layer ([Supabase Auth](https://supabase.com/auth), [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)). Supabase Free includes 50,000 Auth MAUs, while Pro starts at $25/month and includes 100,000 MAUs before $0.00325/MAU overage, making it the cheapest aligned path for SupportPilot’s long-term identity layer ([Supabase pricing](https://supabase.com/pricing)).

## Production-readiness classification

| Classification | Meaning | Examples |
|---|---|---|
| **Blocks any real customer** | Cannot safely onboard even one paying self-serve or pilot customer until fixed. | Auth, tenant creation, RLS verification, production embeddings, rate limits, basic billing. |
| **Blocks enterprise deal** | Can launch SMB/agency pilots without it, but procurement-heavy buyers will block or delay. | SSO/SAML/SCIM, immutable audit exports, SOC 2 evidence automation, Zendesk/Intercom writeback. |
| **Nice-to-have / optimization** | Improves margin, scale, or UX but should not block first production customers. | Full local model runtime, advanced reranker, custom Figma/Stitch export, custom domains at scale. |

## Readiness matrix

| Area | Current status | Production target | Effort | Risk if delayed | Priority | Block type |
|---|---|---|---:|---|---|---|
| Auth foundation | Supabase Auth scaffold exists, but full real flows are missing. | Email/password, magic link, optional social OAuth, email verification, password reset, secure sessions, protected routes. | L | Nobody can safely use the product outside seeded demo flows. | P0 | Blocks any real customer |
| Multi-role RBAC | Roles are represented conceptually in docs and UI, but not fully enforced end to end. | Owner/admin/manager/agent/customer roles enforced in UI, API, and Postgres RLS. | L | Cross-role access, approval bypass, and data leakage risk. | P0 | Blocks any real customer |
| Workspace/org lifecycle | Seed workspace exists; dynamic org/workspace creation and invites are incomplete. | Sign-up → create org → create workspace → invite members → assign roles → launch checklist. | L | Product cannot become self-serve SaaS. | P0 | Blocks any real customer |
| Live Supabase migration/RLS verification | Migrations and RLS exist, but clean-project verification is deferred. | Fresh Supabase project, migrations applied, seed/dev data separated, automated RLS tests for every role. | M | Tenant isolation bug becomes the highest-severity production incident. | P0 | Blocks any real customer |
| Onboarding wizard | Checklist exists; full guided onboarding is not complete. | Live-in-24h wizard: workspace, docs, brand/voice, domain, embed, golden questions, go-live. | M | Buyers cannot activate without handholding. | P0 | Blocks any real customer |
| Stripe subscription lifecycle | Billing page and limits exist, but checkout/webhooks/invoice sync are partial. | Stripe products/prices, checkout, customer portal, subscription/invoice webhooks, entitlements, dunning. | M | Revenue leakage and unsupported upgrades/downgrades. | P1 | Blocks paid launch |
| Usage enforcement | Basic usage limits exist; persistence and webhook-backed entitlements need completion. | Plan-aware persistent counters with workspace-level quotas and grace states. | M | Customers exceed limits or get incorrectly blocked. | P1 | Blocks paid launch |
| Production embeddings | Deterministic/demo embeddings and provider envs exist. | Provider-grade embeddings with model/version metadata and re-embedding migration path. | M | RAG quality is demo-grade and hard to trust. | P1 | Blocks any real customer |
| Background ingestion | Upload/chunk/embed exists; large PDFs/site imports need async jobs. | Queue-backed ingestion with retries, progress, failure states, and reindex jobs. | M | Large docs time out and onboarding fails. | P1 | Blocks larger customers |
| Persistent rate limiting | In-memory/demo limits exist. | Upstash Redis or equivalent per workspace/domain/IP/session limiter. | S/M | Widget abuse can burn model quota and hurt uptime. | P1 | Blocks public widget launch |
| Domain verification automation | Verified-domain checks exist, automation needs completion. | DNS TXT/CNAME verification, status polling, automatic allowed-origin activation. | M | Manual ops burden and spoofing risk. | P1 | Blocks scalable self-serve |
| External helpdesk sync | Email escalation exists; helpdesk writeback deferred. | Slack first, then Zendesk approved-reply/ticket writeback, then Intercom/CRM/webhook. | M/L | Teams cannot keep existing support systems as source of record. | P2 | Blocks enterprise deal |
| Enterprise SSO/SAML | Deferred. | Supabase SAML on Pro+ or WorkOS SSO per enterprise connection. | M/L | Enterprise procurement rejects app. | P2 | Blocks enterprise deal |
| SCIM provisioning | Deferred. | Directory Sync/SCIM after SSO, mapping groups to SupportPilot roles. | L | Enterprise lifecycle/access reviews remain manual. | P2 | Blocks larger enterprise deal |
| Retention/deletion jobs | Settings placeholders exist. | Scheduled deletion jobs by workspace retention policy, legal hold, export before delete. | M | GDPR/privacy promises cannot be operationalized. | P2 | Blocks enterprise/privacy deals |
| Immutable audit/evidence exports | Audit timeline exists; immutable export automation deferred. | Append-only audit, signed exports to immutable storage, monthly evidence packets. | M | SOC 2 readiness story remains manual. | P2 | Blocks enterprise deal |
| SOC 2 evidence automation | Readiness copy exists, not certification. | Automated evidence folder for access reviews, RLS tests, incidents, changes, vendors, backup tests. | M | Procurement delays and claim risk. | P2 | Blocks enterprise deal |
| Local model runtime | Env vars exist; runtime calls are experimental. | Ollama/dev, vLLM/production GPU, local embeddings/reranker plugged into R0–R5 router. | L | Higher model costs, but not launch-blocking. | P2 | Nice-to-have / margin |
| Custom domain support | Planned. | Tenant CNAME setup, SSL automation, app/widget host routing. | L | White-label premium story incomplete for some buyers. | P3 | Blocks some enterprise/agency deals |
| Stitch/Figma exports | Not required for code pass. | Optional design handoff artifacts if future design team requires. | S | No production runtime impact. | P3 | Nice-to-have |

## Priority stack

### P0 — must build before any real production customer

1. Supabase Auth end-to-end.
2. Org/workspace creation and invites.
3. Multi-role enforcement in middleware, APIs, and RLS.
4. Clean Supabase project migration and RLS test suite.
5. Live-in-24h onboarding wizard.

### P1 — must build before paid SaaS launch

1. Stripe checkout, customer portal, webhook ingestion, invoice/subscription sync, entitlements.
2. Persistent workspace limits and rate limiting.
3. Production embeddings and re-embedding migration.
4. Background ingestion for larger docs and site imports.
5. Domain verification automation.

### P2 — must build before enterprise sales motion

1. Slack + Zendesk writeback, then Intercom/CRM/webhooks.
2. SAML SSO, then SCIM.
3. Retention jobs, deletion workflows, immutable audit exports.
4. SOC 2 evidence-packet automation with honest readiness framing.
5. Local model runtime for cost/data-control enterprise use cases.

## Risk map

| Risk | Severity | Trigger | Mitigation |
|---|---:|---|---|
| Tenant data leakage | Critical | RLS policy gap, API query without tenant filter, service-role misuse. | RLS on every exposed table, role test matrix, service-role isolation, tenant-scoped repositories. |
| Broken identity onboarding | Critical | User signs up but has no org/workspace/membership. | Transactional create-org flow; first user becomes owner; invite accept creates membership. |
| Billing mismatch | High | Stripe state differs from internal entitlements. | Webhook-first subscription state, idempotent event handler, nightly reconciliation. |
| Model quota/cost spike | High | Public widget receives bot traffic. | Upstash Redis limiter, workspace quotas, signed sessions, CAPTCHA fallback under attack. |
| Poor RAG quality after launch | High | Demo embeddings or bad PDF extraction. | Provider embeddings, extraction preview, golden-question evals, source freshness. |
| Enterprise claim risk | High | Marketing implies SOC 2 certification before audit. | Use “SOC 2 readiness” until an independent SOC 2 report exists; AICPA describes SOC 2 as an examination over controls relevant to security, availability, processing integrity, confidentiality, or privacy ([AICPA SOC 2](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2)). |
| Integration side effects | Medium | Duplicate approved replies or failed retries. | Idempotency keys, outbound event table, retry/DLQ, external IDs. |
| SSO cost surprise | Medium | Many enterprise SSO customers. | Start Supabase SAML on Pro+ for low SSO MAU; move to WorkOS only when per-connection economics and SCIM justify it. |

## Production readiness scorecard

| Capability | Demo-ready | Pilot-ready | Production SaaS-ready | Enterprise-ready |
|---|---:|---:|---:|---:|
| Marketing site | Yes | Yes | Yes | Mostly |
| Widget | Yes | Mostly | Needs rate limits/domain automation | Needs custom domains/identity handoff |
| Portal | Yes | Mostly | Needs customer auth | Needs SSO/domain policies |
| Admin console | Yes | Mostly | Needs real RBAC/auth | Needs SSO/SCIM/audit exports |
| RAG + approvals | Yes | Mostly | Needs production embeddings/evals | Needs reranker/evidence exports |
| Analytics | Yes | Mostly | Needs billing-grade usage reconciliation | Needs report exports |
| Billing | Partial | Partial | Needs Stripe lifecycle | Needs contracts/invoicing path |
| Security | Partial | Needs RLS proof | Needs retention/rate limits | Needs SSO/SCIM/SOC evidence |

## Bottom line

The next build cycle should not start with more UI polish. It should start with **identity, tenancy, RLS proof, and onboarding**. Once those are real, billing, embeddings, rate limiting, and background ingestion convert SupportPilot from a strong demo into a sellable SaaS; integrations, SSO/SCIM, retention, immutable audit, and SOC 2 evidence then convert it into an enterprise product.
