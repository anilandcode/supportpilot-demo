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
- optional `LOCAL_MODEL_ENDPOINT`, `LOCAL_EMBEDDING_ENDPOINT`, `LOCAL_RERANKER_ENDPOINT`

`SUPABASE_SERVICE_ROLE_KEY`, provider keys, Resend keys, and Sentry auth tokens belong only in server-side deployment env vars.

## AI Safety Boundaries

- AI drafts are saved as `ai_runs`; they are not customer-visible until approved or edited.
- High-risk drafts require manager review.
- Prompts instruct the model to answer from retrieved approved context and escalate low-confidence cases.
- Risk flags cover low confidence, angry sentiment, legal/policy, billing/refund, and sensitive data.
- Prompt logging is redacted by default. The app stores prompt hashes, redacted previews, route metadata, token estimates, latency, and cost estimates instead of raw private content.
- The model router selects deterministic R0-R5 routes before generation and logs every route in `model_route_logs`.
- Policy decisions are stored in `policy_evaluations`; citation coverage and source freshness are stored in `grounding_checks`.
- Only read-only agent tools are scaffolded in this pass. Refunds, account changes, outbound email, and external system writes remain approval-gated future work.
- Every draft and decision writes an audit event.
- Usage events track chat, approval, knowledge upload, and escalation activity without storing raw secrets.

## Current Limits

The app can send optional escalation email through Resend, but it does not yet sync approved replies into an external helpdesk. Add Zendesk, Intercom, Slack, or CRM connectors only after final customer-copy review and audit logging succeed.
