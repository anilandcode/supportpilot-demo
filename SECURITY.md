# Security

## Authentication

Enterprise mode uses Supabase Auth. `public.users` is the role-backed profile table and references `auth.users`. The `/admin` workspace is protected by `proxy.ts` when Supabase env vars are configured.

## Roles

- `customer`: can read owned customer/ticket/message rows and create owned tickets/messages.
- `support_agent`: can triage tickets, draft AI replies, approve normal-risk drafts, and write support messages.
- `support_manager`: can review escalated/high-risk drafts and manage escalation decisions.
- `admin`: can manage staff profile roles, audit visibility, docs, and rules.

## RLS

The migration enables RLS on every enterprise table. Policies separate customer-owned access from support staff access. Service-role operations are limited to server code in `lib/db/support.ts` and must never be exposed to the browser.

## Secrets

Required production secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- one provider key for `LLM_PROVIDER`
- optional `SENTRY_DSN`

`SUPABASE_SERVICE_ROLE_KEY`, provider keys, and Sentry auth tokens belong only in server-side deployment env vars.

## AI Safety Boundaries

- AI drafts are saved as `ai_runs`; they are not customer-visible until approved or edited.
- High-risk drafts require manager review.
- Prompts instruct the model to answer from retrieved approved context and escalate low-confidence cases.
- Risk flags cover low confidence, angry sentiment, legal/policy, billing/refund, and sensitive data.
- Every draft and decision writes an audit event.

## Current Limits

The app creates ticket messages on approval but does not send email or push to an external helpdesk. Add a connector only after final customer-copy review and audit logging succeed.
