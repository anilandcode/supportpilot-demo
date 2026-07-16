# Security

## Authentication

Enterprise mode uses Supabase Auth. `public.users` is the role-backed profile table and references `auth.users`. `public.memberships` maps staff users into workspaces. The `/admin` workspace is protected by `proxy.ts` when Supabase env vars are configured.

## Roles

- `customer`: can read owned customer/ticket/message rows and create owned tickets/messages.
- `support_agent`: can triage tickets, draft AI replies, approve normal-risk drafts, and write support messages.
- `support_manager`: can review escalated/high-risk drafts and manage escalation decisions.
- `admin`: can manage staff profile roles, audit visibility, docs, and rules.
- workspace membership roles: `owner`, `admin`, `manager`, `agent`, `analyst`, and `viewer` scope staff access to a workspace.

## RLS

The migrations enable RLS on every enterprise table. Policies separate customer-owned access from support staff access, then scope staff access through `public.can_access_workspace()` and `public.can_manage_workspace()`. Service-role operations are limited to server code in `lib/db/support.ts` and must never be exposed to the browser.

Widget-facing routes also enforce `workspace_domains` origin checks. A script installed on an unverified host cannot fetch widget config, create a widget session, or post chat messages for that workspace.

Custom domains are not trusted when they are first added. Owners/admins receive a `_supportpilot.<domain>` TXT/CNAME challenge, and `/api/workspaces/[workspaceId]/domains/[domainId]/verify` must observe the expected DNS record before the domain becomes an allowed widget origin. Verification attempts are timestamped and audit logged. The bulk recheck endpoint can run under owner/admin auth or `SUPPORTPILOT_DOMAIN_RECHECK_SECRET` for cron-style DNS health checks.

When `SUPPORTPILOT_WIDGET_SESSION_SECRET` is configured, `POST /api/widget/session` issues a short-lived HMAC-signed session token for a verified origin. `/api/chat` validates that token before accepting widget traffic. Without the secret, local/demo mode keeps the older origin-allowlist behavior.

## Secrets

Required production secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- one provider key for `LLM_PROVIDER`
- optional `SENTRY_DSN`
- optional `RESEND_API_KEY`
- optional `NEXT_PUBLIC_POSTHOG_KEY`
- optional `SUPPORTPILOT_WIDGET_SESSION_SECRET`
- optional `SUPPORTPILOT_DOMAIN_CNAME_TARGET`
- optional `SUPPORTPILOT_DOMAIN_RECHECK_SECRET`
- optional `SUPPORTPILOT_DOMAIN_STALE_DAYS`
- optional `SUPPORTPILOT_INGESTION_WORKER_SECRET`
- optional `SUPPORTPILOT_KNOWLEDGE_SOURCE_BUCKET`
- optional `SUPPORTPILOT_RETENTION_WORKER_SECRET`
- optional `SUPPORTPILOT_AUDIT_EVIDENCE_BUCKET`
- optional `LOCAL_MODEL_ENDPOINT`, `LOCAL_EMBEDDING_ENDPOINT`, `LOCAL_RERANKER_ENDPOINT`

`SUPABASE_SERVICE_ROLE_KEY`, provider keys, Resend keys, invitation sender addresses, and Sentry auth tokens belong only in server-side deployment env vars.

## Knowledge Source Storage

Supabase-backed knowledge ingestion stores uploaded source bytes in the private `supportpilot-knowledge-sources` Storage bucket before queued extraction. The database job payload keeps a `supabase://bucket/path` reference, filename, and byte count instead of raw base64 content when storage succeeds. Workers read sources through the server-side service-role client; browser code never receives the private object path as a public URL.

## Retention And Deletion

Workspace retention settings schedule conversation and AI-log cleanup jobs. Processed jobs redact aged ticket subjects, messages, escalation details, AI prompts, AI responses, rationales, model-route task text, and model-route reasons while preserving non-PII operational metadata, counts, timestamps, costs, confidence, and proof hashes for auditability.

Verified deletion requests create scoped jobs for tickets, customers, or source documents. Ticket/customer requests anonymize personal support content and customer identity fields without deleting the audit trail. Source-document requests delete the approved source and its vector chunks. `POST /api/security/retention/jobs/run` is worker-secret protected and can drain queued jobs for an external scheduler when `SUPPORTPILOT_RETENTION_WORKER_SECRET` is configured.

Audit evidence exports write a non-PII manifest hash to `audit_evidence_exports`. Supabase-backed deployments also upload the JSON artifact to the private `supportpilot-audit-evidence` Storage bucket, or the bucket named by `SUPPORTPILOT_AUDIT_EVIDENCE_BUCKET`, and store only a `supabase://bucket/path` reference in the database. Workspace members can read artifacts through RLS-scoped storage policies; owner/admin/manager roles can write them. Local demos keep a `memory://audit-evidence/...` artifact reference.

## AI Safety Boundaries

- AI drafts are saved as `ai_runs`; they are not customer-visible until approved or edited.
- High-risk drafts require manager review.
- Prompts instruct the model to answer from retrieved approved context and escalate low-confidence cases.
- Risk flags cover low confidence, angry sentiment, legal/policy, billing/refund, and sensitive data.
- Prompt logging is redacted by default. The app stores prompt hashes, redacted previews, route metadata, token estimates, latency, and cost estimates instead of raw private content.
- The model router selects deterministic R0-R5 routes before generation and logs every route in `model_route_logs`.
- Policy decisions are stored in `policy_evaluations`; citation coverage and source freshness are stored in `grounding_checks`.
- Only read-only agent tools are scaffolded in this pass. Refunds, account changes, customer-reply email, and external system writes remain approval-gated future work.
- Every draft and decision writes an audit event.
- Usage events track chat, approval, knowledge upload, and escalation activity without storing raw secrets.

## Current Limits

The app can send invitation and escalation email through Resend, but it does not yet sync approved replies into an external helpdesk. Add Zendesk, Intercom, Slack, or CRM connectors only after final customer-copy review and audit logging succeed.

`GET /api/health` exposes only pass/warn/fail readiness labels for production dependencies. It does not return secret values, tenant data, customer content, prompts, or workspace records.
