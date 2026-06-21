# Architecture

SupportPilot has two operating modes:

- Lite mode: file-based retrieval from `/knowledge`, deterministic fallback answers when no model key exists, and the embeddable chat/widget flow.
- Enterprise mode: Supabase Auth, Postgres, pgvector retrieval, tenant/workspace routes, verified widget domains, AI draft replies, human approval, audit logs, and analytics.

```mermaid
flowchart LR
  Widget["Widget script"] --> ConfigAPI["GET /api/widget/config"]
  ConfigAPI --> Domains["workspace_domains"]
  Portal["Customer portal or widget"] --> ChatAPI["POST /api/chat"]
  Admin["Enterprise admin workspace"] --> Tickets["Tickets and approvals"]
  Admin --> Settings["/admin/settings"]
  Settings --> Workspace["workspaces + widget_configs"]
  Tickets --> DraftAPI["POST /api/tickets/[ticketId]/draft"]
  DraftAPI --> RAG["EnterpriseRetriever"]
  ChatAPI --> RAG
  RAG --> Supabase["Supabase Postgres + pgvector"]
  Supabase --> Context["Approved chunks with citations"]
  Context --> Model["Google, OpenAI, or Anthropic model"]
  Model --> AIRuns["ai_runs"]
  AIRuns --> Usage["usage_events"]
  Tickets --> DecisionAPI["PATCH /api/ai-runs/[aiRunId]/decision"]
  DecisionAPI --> Messages["ticket_messages"]
  DecisionAPI --> Audit["audit_logs"]
  DecisionAPI --> EscalationEmail["optional Resend escalation"]
```

## Data Layer

`supabase/migrations/001_enterprise_supportpilot.sql` defines the core support schema. `supabase/migrations/002_light_mvp_productization.sql` adds the Lite MVP productization layer:

- Identity and tenancy: `users`, `organizations`, `workspaces`, `memberships`, `customers`
- Widget/product setup: `workspace_domains`, `widget_configs`, `usage_events`
- Support operations: `tickets`, `ticket_messages`
- Knowledge and RAG: `knowledge_docs`, `document_chunks`, `match_document_chunks`
- AI governance: `ai_runs`, `ai_feedback`, `audit_logs`, `escalation_rules`, `approval_policies`

`lib/db/support.ts` is the application data boundary. It uses Supabase admin access when `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are present. Without those env vars, it uses deterministic seeded data for portfolio review.

## RAG

Uploaded `.md`, `.txt`, `.pdf`, and pasted text are normalized in `POST /api/knowledge/upload`, chunked by `lib/rag/chunking.ts`, embedded with `lib/rag/embeddings.ts`, and stored as approved workspace chunks. Retrieval calls `match_document_chunks` first, then falls back to lexical scoring over approved chunks for the active workspace if vector results are empty.

## AI Workflow

`lib/workflows/draft.ts` builds a ticket-specific prompt from customer metadata, conversation history, and approved source chunks. Drafts are saved to `ai_runs` with citations, confidence, rationale, risk flags, and approval status.

`lib/workflows/risk.ts` escalates low-confidence, angry, legal/policy, billing/refund, and sensitive-data cases. AI never writes a final customer reply directly. Approval or edit decisions create the customer-facing `ticket_messages` row and always write `audit_logs`.

## Auth and Roles

`proxy.ts` protects `/admin` when Supabase env vars exist. Staff roles are `support_agent`, `support_manager`, and `admin`; workspace membership roles are `owner`, `admin`, `manager`, `agent`, and `viewer`. Customers are routed to `/portal`. Local demo mode remains open so the portfolio can run without credentials.

## Observability

`ai_runs`, `audit_logs`, and `usage_events` are the product source of truth. Sentry is optional and activated by `SENTRY_DSN`; PostHog capture is optional through `NEXT_PUBLIC_POSTHOG_KEY`; Resend email escalation is optional through `RESEND_API_KEY`.
