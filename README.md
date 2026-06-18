# SupportPilot

SupportPilot is an enterprise AI support workspace with a preserved Lite embeddable chat path. It can run locally from seeded demo data, then switch to Supabase-backed auth, tickets, RAG, approval workflows, audit logs, analytics, and Sentry observability when env vars are configured.

## Stack

- Next.js 16 App Router and React 19
- Tailwind CSS v4
- Vercel AI SDK v6 with Google, OpenAI, or Anthropic providers
- Supabase Auth, Postgres, pgvector, Storage-ready knowledge uploads, and RLS
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

- `/` - marketing page and live Lite demo
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

## API

- `POST /api/chat` - embeddable/customer chat, with Lite fallback and enterprise AI run/audit logging
- `GET /api/stats` - dashboard metrics from the enterprise service layer
- `POST /api/feedback` - answer feedback logging
- `POST /api/knowledge/upload` - upload `.md`, `.txt`, or `.pdf`, then chunk and store approved sources
- `POST /api/tickets/[ticketId]/draft` - create AI draft reply with citations, confidence, rationale, risk flags, and `ai_run`
- `PATCH /api/ai-runs/[aiRunId]/decision` - approve, edit, reject, or escalate drafts with audit logs

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
```

## Supabase

Apply `supabase/migrations/001_enterprise_supportpilot.sql`, then run `supabase/seed.sql`. The seed includes 5 customers, 20 tickets, 10 knowledge articles, 5 policy docs, 5 escalated tickets, 10 AI draft replies, feedback, audit logs, and escalation rules.

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
- `ARCHITECTURE.md` - Supabase, RAG, workflow, auth, observability
- `SECURITY.md` - RLS, roles, secrets, AI safety boundaries
- `EVALS.md` - automated and manual evaluation plan
- `ROLE_ALIGNMENT.md` - portfolio role mapping
- `ROADMAP.md` - production hardening and integrations
- `CLIENT_SETUP.md` - client rollout runbook
- `INGEST.md` - knowledge ingestion flow
