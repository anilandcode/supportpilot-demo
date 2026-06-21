# SupportPilot Enterprise Audit

Date: 2026-06-20

This audit maps the requested enterprise upgrade requirements to the current implementation. Status values are `PASS`, `PARTIAL`, or `FAIL`.

| Requirement | Status | Evidence |
| --- | --- | --- |
| Supabase-first backend with Postgres, pgvector, Storage-ready data model, and RLS | PASS | `supabase/migrations/001_enterprise_supportpilot.sql` enables `vector`; `002_light_mvp_productization.sql` adds workspace tables, tenant columns, RPC metadata, indexes, and workspace-scoped RLS. |
| Supabase Auth with role-backed profile rows | PASS | `public.users` references `auth.users`; `proxy.ts` protects `/admin` in Supabase mode; `lib/auth/roles.ts` reads active roles. |
| Custom observability source of truth | PASS | `ai_runs`, `audit_logs`, and `usage_events` are created in SQL and written by `lib/db/support.ts`, `/api/chat`, draft, decision, upload, and escalation routes. |
| Optional Sentry app error monitoring | PASS | `@sentry/nextjs`, `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and `next.config.ts`. |
| Add required dependencies | PASS | `package.json` includes Supabase, AI SDK OpenAI/Anthropic, Sentry, and `pdf-parse`. |
| Required database tables | PASS | `users`, `customers`, `tickets`, `ticket_messages`, `knowledge_docs`, `document_chunks`, `ai_runs`, `ai_feedback`, `audit_logs`, `escalation_rules`. |
| Workspace productization tables | PASS | `organizations`, `workspaces`, `memberships`, `workspace_domains`, `widget_configs`, `usage_events`, and `approval_policies` are added in migration `002`. |
| Required enums | PASS | Role, status, priority, risk, message sender, and approval enums are in the migration. |
| RLS policies for customer, agent, manager, admin | PASS | Customer-owned read/create policies plus staff/manager/admin policies are in the migration. |
| Seed 5 customers, 20 tickets, 10 docs, 5 policies, 5 escalated tickets, 10 AI drafts | PASS | `lib/enterprise/demo-data.ts` and `supabase/seed.sql`. |
| Supabase clients | PASS | `lib/supabase/browser.ts`, `server.ts`, `admin.ts`, `config.ts`, `session.ts`. |
| Typed DB services | PASS | `lib/db/support.ts` covers tickets, customers, knowledge, AI runs, feedback, audit, metrics, and approvals. |
| RAG chunking, embedding, upsert, match | PASS | `lib/rag/chunking.ts`, `embeddings.ts`, `retrieval.ts`, upload API, and `match_document_chunks`. |
| Risk scoring and escalation rules | PASS | `lib/workflows/risk.ts` and `lib/workflows/draft.ts` flag low confidence, anger, legal/policy, billing/refund, and sensitive data. |
| AI draft generation with citations and rationale | PASS | `POST /api/tickets/[ticketId]/draft` returns draft, citations, confidence, rationale, risk flags, and `ai_run`. |
| Human approval before final customer message | PASS | `PATCH /api/ai-runs/[aiRunId]/decision` only appends an agent message on approved or edited decisions. |
| Manager queue for high-risk drafts | PASS | `/admin/approvals`, `listApprovalQueue()`, and risk flags surface manager-required items. |
| External send/email/helpdesk integration | PARTIAL | Approval creates the canonical ticket message and audit log; optional Resend escalation email exists at `POST /api/escalations/email`, but approved-reply helpdesk sync is still roadmap. |
| Required admin UI routes | PASS | `/admin`, `/admin/tickets`, `/admin/tickets/[ticketId]`, `/admin/knowledge`, `/admin/approvals`, `/admin/analytics`. |
| Workspace settings route | PASS | `/admin/settings` manages workspace identity, brand color, escalation email, Calendly link, verified domains, widget snippets, and approval policy summary. |
| Customer portal route | PASS | `/portal` uses the existing chat window and keeps the Lite chat experience available. |
| Knowledge upload for md/txt/pdf/pasted content | PASS | `POST /api/knowledge/upload` parses file or pasted text, chunks content, stores docs/chunks with workspace metadata, and logs audit/usage events. |
| Dashboard metrics from service layer | PASS | `GET /api/stats` reads `getDashboardMetrics()` from `lib/db/support.ts`; Supabase mode uses database rows. |
| Existing embed and Lite chat preserved | PASS | `/api/chat`, `/embed`, `public/widget.js`, `LiteRetriever`, and `/knowledge` fallback remain. |
| Widget workspace key and domain allowlist | PASS | `public/widget.js` supports `data-workspace`, `/api/widget/config` returns public config, and chat/config APIs reject unverified origins. |
| Enterprise mode uses Supabase RAG when env vars are configured | PASS | `EnterpriseRetriever` delegates to `retrieveEnterpriseChunks()`, which calls Supabase RPC and falls back to approved chunk scoring. |
| Portfolio docs | PASS | `DESIGN.md`, `ROLE_ALIGNMENT.md`, `ARCHITECTURE.md`, `EVALS.md`, `SECURITY.md`, `ROADMAP.md`, README, setup, and ingest docs. |
| Automated verification | PARTIAL | Local typecheck and enterprise dataset checks are implemented. Live Supabase migration/RLS checks require a Supabase project. |
