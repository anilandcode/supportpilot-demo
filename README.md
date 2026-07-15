# SupportPilot

SupportPilot is an enterprise AI support workspace with a preserved Lite embeddable chat path. It can run locally from seeded demo data, then switch to Supabase-backed auth, tickets, RAG, approval workflows, audit logs, analytics, and Sentry observability when env vars are configured.

## Stack

- Next.js 16 App Router and React 19
- Tailwind CSS v4
- Vercel AI SDK v6 with Google, OpenAI, or Anthropic providers
- Supabase Auth, Postgres, pgvector, Storage-ready knowledge uploads, and RLS
- Workspace settings, DNS-verified widget domains, usage events, and approval policies
- Onboarding checklist, workspace health, model route logs, security events, signed widget sessions, missing-knowledge tasks, and optional Redis-backed public API rate limits
- Launch/Pro billing usage limits, Stripe checkout/webhook lifecycle foundation, entitlements, invoices, and portal handoff
- Provider-aware knowledge embeddings with deterministic fallback, embedding metadata, re-embedding job scaffolding, and background ingestion job scaffolding
- Slack/generic webhook integration foundation with durable outbound events and delivery logs
- Retention deletion request jobs and tamper-evident audit evidence exports
- Optional Resend invitation/escalation email and PostHog product events
- Sentry for optional app error monitoring
- PDF, Markdown, and text knowledge ingestion

## Run Locally

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

The app works without provider or Supabase credentials by using deterministic seeded enterprise data and the Lite retriever fallback.

## Routes

- `/` - premium marketing page with dashboard hero, widget proof, pricing, security, FAQ, and demo CTAs
- `/embed` - iframe chat panel
- `/widget-test` - script embed test page
- `/portal` - customer-facing support/chat entry point
- `/login` - Supabase staff sign-in when enterprise env vars exist
- `/admin` - enterprise dashboard overview
- `/admin/tickets` - ticket inbox with status, priority, agent, and risk filters
- `/admin/tickets/[ticketId]` - ticket detail, conversation, citations, and AI draft side panel
- `/admin/knowledge` - doc upload, ingestion status, approved source list
- `/admin/approvals` - high-risk draft approval queue
- `/admin/analytics` - resolution, acceptance, response, escalation, and missing-topic metrics
- `/admin/billing` - Launch/Pro usage limits, model route cost, invoices, and optional Stripe portal
- `/admin/settings` - workspace brand, escalation email, widget key, DNS-verified domains, approval policies

## API

- `POST /api/chat` - embeddable/customer chat, with Lite fallback, workspace origin checks, and enterprise AI run/audit logging
- `GET /api/widget/config` - public widget configuration scoped by workspace key and verified origin
- `POST /api/widget/session` - optional signed widget session for verified origins when `SUPPORTPILOT_WIDGET_SESSION_SECRET` is configured
- `GET /api/health` - secret-safe deployment health snapshot for Supabase, invitation email, Sentry, Redis, workers, and Stripe config
- `GET /api/stats` - dashboard metrics from the enterprise service layer, optionally scoped by `workspace`
- `GET /api/onboarding/state` - workspace launch checklist, health, golden questions, missing knowledge, and retention settings
- `POST /api/onboarding/steps/[step]/complete` - mark a launch checklist step complete
- `GET /api/security/events` - workspace security event feed
- `GET|POST /api/security/deletion-requests` - manager/admin data deletion request intake with verification and queued jobs
- `GET|POST /api/security/retention/jobs` - retention cleanup job list and scheduler driven by workspace settings
- `POST /api/security/retention/jobs/[jobId]/run` - manually or worker-run a queued retention/deletion job
- `GET|POST /api/security/audit-exports` - tamper-evident audit/security evidence export records
- `GET /api/model-routes` - AI model route/cost/latency log feed
- `POST /api/billing/checkout` - owner-only Launch/Pro hosted Checkout session creation with demo fallback when Stripe is not configured
- `POST /api/billing/webhook` - verified Stripe webhook receiver for checkout, subscription, invoice, entitlement, and dunning state sync
- `GET /api/billing/subscription` - owner-only internal billing lifecycle state for the active workspace
- `GET|POST /api/billing/portal` - create a Stripe customer portal session from tenant customer mapping or legacy env customer when Stripe env vars exist, otherwise return to the demo billing page
- `GET|POST /api/integrations/accounts` - owner/admin integration account and generic webhook endpoint configuration with redacted reads
- `GET /api/integrations/events` - manager/admin outbound integration event and delivery log feed
- `POST /api/integrations/events/[eventId]/deliver` - manually or worker-run a queued integration delivery
- `GET|POST /api/knowledge/missing` - missing-source task list and creation endpoint
- `GET|POST /api/knowledge/reembed` - manager/admin/owner re-embedding job endpoint for approved knowledge chunks
- `GET /api/knowledge/ingest/jobs` - manager/agent ingestion job history for uploads, PDFs, retries, and extraction failures
- `POST /api/knowledge/ingest/jobs/[jobId]/run` - manually retry or worker-run a queued ingestion job
- `POST /api/feedback` - answer feedback logging
- `POST /api/knowledge/upload` - upload or paste `.md`, `.txt`, or `.pdf`; small text runs inline, large/PDF jobs can queue for background extraction
- `POST /api/tickets/[ticketId]/draft` - create AI draft reply with citations, confidence, rationale, risk flags, and `ai_run`
- `PATCH /api/ai-runs/[aiRunId]/decision` - approve, edit, reject, or escalate drafts with audit logs
- `PATCH /api/workspaces/[workspaceId]/settings` - update workspace identity, brand, welcome copy, and escalation routing
- `GET|POST /api/workspaces/[workspaceId]/domains` - list or add widget origins with DNS verification instructions
- `POST /api/workspaces/[workspaceId]/domains/[domainId]/verify` - check TXT/CNAME records and activate a widget origin
- `POST /api/workspaces/[workspaceId]/domains/recheck` - owner/admin or worker-secret DNS health recheck for verified/pending domains
- `POST /api/escalations/email` - optional Resend-backed escalation email with audit and usage logging
- `POST /api/workspaces/[workspaceId]/invitations` - owner/admin invitation creation with hashed tokens, entitlement checks, Resend delivery, and audit logging

## Enterprise Env

```bash
SUPPORTPILOT_APP_MODE=production # demo | production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

LLM_PROVIDER=google # google | openai | anthropic
GOOGLE_GENERATIVE_AI_API_KEY=...
GOOGLE_MODEL=gemini-2.5-flash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-3-5-haiku-latest

SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...

NEXT_PUBLIC_APP_URL=...
SUPPORTPILOT_WIDGET_SESSION_SECRET=...
SUPPORTPILOT_DOMAIN_CNAME_TARGET=verify.supportpilot.ai
SUPPORTPILOT_DOMAIN_RECHECK_SECRET=...
SUPPORTPILOT_DOMAIN_STALE_DAYS=30
MODEL_ROUTER_DEFAULT=light
EMBEDDING_PROVIDER=deterministic # deterministic | local | openai | google
EMBEDDING_MODEL=...
EMBEDDING_VERSION=v1
EMBEDDING_DIMENSIONS=768
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
GOOGLE_EMBEDDING_MODEL=text-embedding-004
LOCAL_EMBEDDING_MODEL=...
LOCAL_MODEL_ENDPOINT=...
LOCAL_EMBEDDING_ENDPOINT=...
LOCAL_RERANKER_ENDPOINT=...
RESEND_API_KEY=...
INVITATION_FROM_EMAIL=...
ESCALATION_FROM_EMAIL=...
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
QSTASH_TOKEN=...
SUPPORTPILOT_INGESTION_WORKER_SECRET=...
SUPPORTPILOT_INTEGRATION_WORKER_SECRET=...
SUPPORTPILOT_INTEGRATION_DELIVERY_MODE=queued # queued | inline
SUPPORTPILOT_RETENTION_WORKER_SECRET=...
SUPPORTPILOT_HEALTH_ALERT_SECRET=...
SUPPORTPILOT_HEALTH_ALERT_WEBHOOK_URL=...
SUPPORTPILOT_RATE_LIMIT_CHAT_PER_MINUTE=10
SUPPORTPILOT_RATE_LIMIT_WIDGET_CONFIG_PER_MINUTE=120
SUPPORTPILOT_RATE_LIMIT_WIDGET_SESSIONS_PER_5_MINUTES=30
SUPPORTPILOT_RATE_LIMIT_UPLOADS_PER_HOUR=20
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_LAUNCH_MONTHLY_PRICE_ID=...
STRIPE_LAUNCH_ANNUAL_PRICE_ID=...
STRIPE_PRO_MONTHLY_PRICE_ID=...
STRIPE_PRO_ANNUAL_PRICE_ID=...
STRIPE_CUSTOMER_ID=...
SUPPORTPILOT_STRIPE_CUSTOMER_ID=...
STRIPE_BILLING_PORTAL_RETURN_URL=...
```

`SUPPORTPILOT_APP_MODE` defaults to `demo` for local previews. Set it to `production` for any deployed environment; production mode fails closed when Supabase URL, anon key, service-role key, or invitation email delivery is missing instead of silently returning demo auth/onboarding responses.

`/api/chat` checks the current workspace plan snapshot before retrieval or generation. If the current billing period has reached the enforced conversation or AI reply limit, the request is escalated with audit/security events and no additional `ai_run` is created.

Public request rate limits use Upstash Redis REST when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured. Without those variables, SupportPilot uses the local in-memory limiter for demos and tests. Chat, widget config, widget session creation, and knowledge upload boundaries all log `rate_limited` security events when blocked.

Knowledge ingestion uses `EMBEDDING_PROVIDER` when configured and falls back to deterministic 768-dimension embeddings for local demos. `document_chunks` store provider, model, version, dimensions, source version ID, content hash, and embedded timestamp so future provider migrations can be audited and re-run through `/api/knowledge/reembed`.

Knowledge uploads now create `knowledge_ingestion_jobs` before extraction/chunking. Small text uploads process immediately; large files and PDFs attempt QStash background delivery when `QSTASH_TOKEN`, `NEXT_PUBLIC_APP_URL`, and `SUPPORTPILOT_INGESTION_WORKER_SECRET` are configured, otherwise they fall back to the local synchronous demo path. Jobs track status, attempts, retry timing, extraction errors, chunk counts, and content-hash dedupe.

Integration delivery is queued by default. Approval-needed drafts and approval decisions create idempotent `outbound_events` for active Slack or generic webhook channels; delivery attempts write `integration_deliveries`. Set `SUPPORTPILOT_INTEGRATION_DELIVERY_MODE=inline` only for controlled server-side demos where immediate external delivery is desired.

Retention workflows use `retention_settings` to schedule `conversation_cleanup` and `ai_log_cleanup` jobs. Verified deletion requests create `deletion_request` jobs with non-PII proof hashes, and audit evidence exports hash the export manifest so SOC 2 readiness evidence is tamper-evident without claiming certification.

Custom widget domains start in `pending` status. Owners/admins add either a TXT record like `supportpilot-verify=...` or a CNAME to `SUPPORTPILOT_DOMAIN_CNAME_TARGET` at `_supportpilot.<domain>`, then call the verification endpoint. Widget config, signed widget sessions, and chat origin checks only allow domains after verification succeeds. The settings page shows domain health, stale checks, and the exact DNS challenge; scheduled jobs can call the recheck endpoint with `x-supportpilot-domain-secret`.

Stripe live-mode activation still requires creating real Stripe products/prices, setting the price IDs above, configuring the webhook endpoint with the matching `STRIPE_WEBHOOK_SECRET`, and running the test/live webhook matrix from `Updates/21_Billing_Stripe_Lifecycle_Plan.md`.

`GET /api/health` returns secret-safe readiness state for uptime probes. `POST /api/health` can be called by a trusted monitor with `x-supportpilot-health-secret` when `SUPPORTPILOT_HEALTH_ALERT_SECRET` is set; degraded/failing snapshots send a sanitized incident payload to `SUPPORTPILOT_HEALTH_ALERT_WEBHOOK_URL`, while healthy snapshots and unconfigured webhooks are no-ops.

## Supabase

Apply all files in `supabase/migrations/` in order, then run `supabase/seed.sql` for demo data. The migrations include enterprise support tables, productization tables, update-pass security/model-route tables, production auth/onboarding tables, Stripe billing lifecycle tables, embedding versioning/re-embedding job tables, background knowledge ingestion jobs, outbound integration event tables, retention/evidence job tables, and domain verification metadata. The seed includes 1 organization, 1 workspace, 4 staff memberships, 3 verified domains, widget config, 5 customers, 20 tickets, 10 knowledge articles, 5 policy docs, 5 escalated tickets, 10 AI draft replies, feedback, audit logs, escalation rules, approval policies, usage events, launch checklist rows, golden questions, missing-knowledge tasks, model route logs, grounding checks, policy evaluations, security events, retention settings, and read-only tool definitions.

Default workspace key:

```text
wk_demo_acmedesk
```

Seed staff password:

```text
SupportPilot2026!
```

## Verify

```bash
npm run typecheck
npm run test:billing
npm run test:rate-limit
npm run test:embeddings
npm run test:ingestion
npm run test:integrations
npm run test:retention
npm run test:domains
npm run test:evals
npm run test:rls
npm run test:enterprise
npm run test:production
npm run test:journeys
npm run test:health
npm run build
git diff --check
```

GitHub Actions runs the same production gates plus critical journey contract checks on pull requests and pushes to `main` through `.github/workflows/ci.yml`, then runs `npm run build` after the test gate passes. The workflow uploads static RLS and golden-question eval summaries as artifacts for release evidence.

Run `npm run test:conversation` against a dev server or live app to exercise `/api/chat`.

## Docs

- `ENTERPRISE_AUDIT.md` - requirement status and evidence
- `DESIGN.md` - product UX and design system decisions
- `ARCHITECTURE.md` - Supabase, RAG, workflow, auth, observability
- `SECURITY.md` - RLS, roles, secrets, AI safety boundaries
- `RLS_VERIFICATION.md` - static RLS gate and clean Supabase project rehearsal checklist
- `EVALS.md` - automated and manual evaluation plan
- `ROLE_ALIGNMENT.md` - portfolio role mapping
- `ROADMAP.md` - production hardening and integrations
- `CLIENT_SETUP.md` - client rollout runbook
- `INGEST.md` - knowledge ingestion flow
- `UPDATES_IMPLEMENTATION_TRACKER.md` - compact implementation tracker for update passes
- `Updates/07_Enterprise_Design_System.md` through `Updates/12_Design_and_Model_Upgrade_Summary.md` - enterprise readiness, security, workflow, agentic, and model-cost planning
- `Updates/13_Design_Direction_Decision.md` - locked LynAI visual direction, Agentra IA, and SupportPilot trust layer
- `Updates/14_Landing_Page_IA_and_Copy.md` - definitive landing IA, copy, pricing, FAQ, trust, and widget proof sections
- `Updates/15_ChatGPT_Landing_Build_Prompt.md` - self-contained landing HTML generation prompt used as implementation reference
- `Updates/16_GoogleStitch_Dashboard_Prompts.md` - admin, ticket, approval, knowledge, analytics, settings, security, billing, and widget screen prompts
- `Updates/17_Feature_Set_Matrix.md` - Launch, Pro, and Enterprise feature/tier matrix
- `Updates/18_Redesign_Action_Plan.md` - phased redesign and launch-readiness action plan
- `Updates/19_Production_Readiness_Gap_Analysis.md` - production gap matrix and priority stack
- `Updates/20_Auth_and_Onboarding_Plan.md` - Supabase Auth, RBAC, invite, portal identity, and onboarding plan
- `Updates/21_Billing_Stripe_Lifecycle_Plan.md` - Stripe checkout, webhook, subscription, entitlement, and dunning plan
- `Updates/22_Integrations_and_Infra_Hardening_Plan.md` - integrations, RLS proof, embeddings, rate limits, domains, retention, and local runtime plan
- `Updates/23_Testing_and_QA_Strategy.md` - production test pyramid, RLS matrix, Playwright journeys, evals, and CI gates
- `Updates/24_Production_Execution_Roadmap.md` - phased production-completion roadmap and go-live runbook
- `Updates/25_Enterprise_Launch_Completion_Plan.md` - remaining launch gates for production mode, tenancy, auth, billing, AI, widget, integrations, compliance, infrastructure, and QA
- `Design Upgrade/` - LynAI-style SupportPilot marketing handoff, clean HTML prototype, and related design artifacts
