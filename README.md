# SupportPilot

SupportPilot is an enterprise AI support workspace with a preserved Lite embeddable chat path. It can run locally from seeded demo data, then switch to Supabase-backed auth, tickets, RAG, approval workflows, audit logs, analytics, and Sentry observability when env vars are configured.

## Stack

- Next.js 16 App Router and React 19
- Tailwind CSS v4
- Vercel AI SDK v6 with Google, OpenAI, or Anthropic providers
- Supabase Auth, Postgres, pgvector, Storage-ready knowledge uploads, and RLS
- Workspace settings, verified widget domains, usage events, and approval policies
- Onboarding checklist, workspace health, model route logs, security events, signed widget sessions, and missing-knowledge tasks
- Launch/Pro billing usage limits with optional Stripe billing portal handoff
- Optional Resend escalation email and PostHog product events
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
- `/admin/settings` - workspace brand, escalation email, widget key, verified domains, approval policies

## API

- `POST /api/chat` - embeddable/customer chat, with Lite fallback, workspace origin checks, and enterprise AI run/audit logging
- `GET /api/widget/config` - public widget configuration scoped by workspace key and verified origin
- `POST /api/widget/session` - optional signed widget session for verified origins when `SUPPORTPILOT_WIDGET_SESSION_SECRET` is configured
- `GET /api/stats` - dashboard metrics from the enterprise service layer, optionally scoped by `workspace`
- `GET /api/onboarding/state` - workspace launch checklist, health, golden questions, missing knowledge, and retention settings
- `POST /api/onboarding/steps/[step]/complete` - mark a launch checklist step complete
- `GET /api/security/events` - workspace security event feed
- `GET /api/model-routes` - AI model route/cost/latency log feed
- `GET|POST /api/billing/portal` - create a Stripe customer portal session when Stripe env vars exist, otherwise return to the demo billing page
- `GET|POST /api/knowledge/missing` - missing-source task list and creation endpoint
- `POST /api/feedback` - answer feedback logging
- `POST /api/knowledge/upload` - upload or paste `.md`, `.txt`, or `.pdf`, then chunk and store approved sources
- `POST /api/tickets/[ticketId]/draft` - create AI draft reply with citations, confidence, rationale, risk flags, and `ai_run`
- `PATCH /api/ai-runs/[aiRunId]/decision` - approve, edit, reject, or escalate drafts with audit logs
- `PATCH /api/workspaces/[workspaceId]/settings` - update workspace identity, brand, welcome copy, and escalation routing
- `POST /api/workspaces/[workspaceId]/domains` - add a verified widget origin
- `POST /api/escalations/email` - optional Resend-backed escalation email with audit and usage logging

## Enterprise Env

```bash
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
MODEL_ROUTER_DEFAULT=light
LOCAL_MODEL_ENDPOINT=...
LOCAL_EMBEDDING_ENDPOINT=...
LOCAL_RERANKER_ENDPOINT=...
RESEND_API_KEY=...
ESCALATION_FROM_EMAIL=...
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
STRIPE_SECRET_KEY=...
STRIPE_CUSTOMER_ID=...
SUPPORTPILOT_STRIPE_CUSTOMER_ID=...
STRIPE_BILLING_PORTAL_RETURN_URL=...
```

`/api/chat` checks the current workspace plan snapshot before retrieval or generation. If the current billing period has reached the enforced conversation or AI reply limit, the request is escalated with audit/security events and no additional `ai_run` is created.

## Supabase

Apply `supabase/migrations/001_enterprise_supportpilot.sql`, `supabase/migrations/002_light_mvp_productization.sql`, and `supabase/migrations/003_updates_enterprise_readiness.sql`, then run `supabase/seed.sql`. The seed includes 1 organization, 1 workspace, 4 staff memberships, 3 verified domains, widget config, 5 customers, 20 tickets, 10 knowledge articles, 5 policy docs, 5 escalated tickets, 10 AI draft replies, feedback, audit logs, escalation rules, approval policies, usage events, launch checklist rows, golden questions, missing-knowledge tasks, model route logs, grounding checks, policy evaluations, security events, retention settings, and read-only tool definitions.

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
npm run test:enterprise
npm run build
git diff --check
```

Run `npm run test:conversation` against a dev server or live app to exercise `/api/chat`.

## Docs

- `ENTERPRISE_AUDIT.md` - requirement status and evidence
- `DESIGN.md` - product UX and design system decisions
- `ARCHITECTURE.md` - Supabase, RAG, workflow, auth, observability
- `SECURITY.md` - RLS, roles, secrets, AI safety boundaries
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
- `Design Upgrade/` - LynAI-style SupportPilot marketing handoff, clean HTML prototype, and related design artifacts
