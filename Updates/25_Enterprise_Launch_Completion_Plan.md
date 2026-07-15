# SupportPilot Enterprise Launch Completion Plan

## Purpose

This plan defines the remaining work needed to move SupportPilot from a strong enterprise demo into a launch-ready enterprise product. It is based on the current repo state, the update plans through `Updates/24`, the existing Supabase-backed implementation, and the production-readiness gaps already identified in the audit docs.

The current product has the core portfolio surface: marketing page, admin console, portal, ticket workflows, RAG scaffolding, AI drafts, approval flows, audit logs, onboarding state, billing scaffolding, integrations scaffolding, retention scaffolding, security events, CI gates, and deterministic eval smoke tests. The remaining work is about making those features fail closed, tenant-safe, operationally real, and externally launchable.

## Launch Definition

SupportPilot is launch-ready when:

- production mode cannot silently fall back to demo state,
- every customer, ticket, AI run, document, widget session, billing event, and integration event is scoped to one workspace and one tenant,
- admin, manager, agent, analyst, viewer, owner, and customer permissions are enforced consistently in UI, APIs, Supabase RLS, and portal flows,
- onboarding can create the first real workspace, invite users, verify domains, add knowledge, and install the widget,
- billing entitlements are enforced at runtime and stay in sync with Stripe lifecycle events,
- RAG ingestion, embeddings, AI routing, approvals, audit logs, security events, and retention jobs are observable and repeatable,
- critical end-to-end journeys pass on a clean deployed environment,
- launch docs, runbooks, environment variables, and evidence artifacts are current.

## Phase 0 - Protect The Current Baseline

Status: immediate prerequisite.

- Preserve existing uncommitted CI, golden-eval, docs, package, and graph changes.
- Keep the current marketing/homepage and HTML-handoff dashboard visual system intact.
- Keep Lite chat, widget demo routes, Supabase enterprise flow, `next build --webpack`, and local demo fallback working.
- Keep `Updates/.DS_Store` ignored and excluded.
- Run `git status` before every large edit and avoid reverting unrelated work.

Verification:

- `git status --short --branch`
- `npm run test:evals`
- `git diff --check`

## Phase 1 - Tenant Isolation And Authorization

Priority: P0.

### 1.1 Explicit Application Mode

Add a single app-mode gate:

- `SUPPORTPILOT_APP_MODE=demo|production`
- demo mode may use local/demo fallbacks,
- production mode must require Supabase URL, anon key, service role key, workspace configuration, and auth where applicable,
- production APIs must fail with clear `401`, `403`, or `503` responses instead of silently using demo data.

Code areas:

- `lib/supabase/config.ts`
- `lib/auth/api.ts`
- `lib/db/*`
- `app/api/*`

Verification:

- unit tests for missing env behavior in demo vs production,
- production readiness script asserts no protected API uses unguarded demo fallback.

### 1.2 Workspace Resolver

Centralize workspace resolution:

- resolve workspace by authenticated membership for admin APIs,
- resolve workspace by allowed domain or signed session for widget APIs,
- resolve workspace by customer portal identity for portal APIs,
- do not accept arbitrary client-provided `workspaceId` unless the caller is authorized for it.

Code areas:

- `lib/auth/api.ts`
- `lib/auth/roles.ts`
- `app/api/portal/tickets/route.ts`
- `app/api/chat/route.ts`
- workspace settings/domain APIs.

Verification:

- cross-tenant API tests for admin, portal, and widget paths,
- IDOR tests for ticket creation, message append, draft generation, decision update, knowledge upload, settings mutation, widget key rotation, domain verification, and billing portal access.

### 1.3 RLS Completion

Finish RLS for launch-critical tables:

- tenants,
- workspaces,
- memberships,
- invitations,
- customers,
- tickets,
- ticket messages,
- knowledge docs,
- chunks,
- AI runs,
- approvals,
- audit logs,
- onboarding state,
- billing records,
- integration accounts/events,
- security events,
- portal identities,
- widget sessions,
- retention/evidence jobs.

Verification:

- static RLS tests remain,
- live clean Supabase rehearsal is documented and run before launch,
- customer, agent, manager, admin, owner, analyst, and viewer accounts are tested against each table class.

## Phase 2 - Authentication And Onboarding

Priority: P0.

### 2.1 First Workspace Creation

Build the production onboarding path:

- create workspace,
- create tenant,
- create owner membership,
- seed launch checklist rows,
- generate widget key,
- create default settings,
- create default escalation/approval policy,
- redirect to onboarding checklist.

Verification:

- clean account can create first workspace,
- existing account can switch between workspaces,
- duplicate workspace slug is handled safely.

### 2.2 Invitations And Roles

Finish invitation lifecycle:

- owner/admin invite users,
- invited users accept with Supabase Auth,
- invitation tokens are hashed,
- invitations expire,
- role downgrade/upgrade is audited,
- owner role cannot be removed if it would leave the workspace ownerless.

Verification:

- owner/admin/manager/agent/viewer invitation matrix tests,
- audit logs for invite create, accept, revoke, role change.

### 2.3 Portal Identity

Finish customer portal identity:

- customer signs in or verifies email,
- customer can only view own tickets,
- portal ticket creation always binds to one customer identity,
- portal chat can escalate into the same customer record.

Verification:

- customer A cannot read or write customer B tickets,
- anonymous portal behavior is demo-only unless explicitly allowed.

## Phase 3 - Billing And Entitlements

Priority: P0/P1.

### 3.1 Stripe Lifecycle

Move billing from scaffold to launch:

- create Stripe products/prices for Free, Pro, Business, Enterprise,
- configure webhook endpoint,
- validate signed webhooks,
- sync subscriptions, invoices, trial, cancellation, dunning, and plan changes,
- store Stripe customer/subscription IDs by workspace.

Verification:

- Stripe test-mode checkout,
- upgrade,
- downgrade,
- cancel,
- payment failure,
- webhook replay/idempotency,
- billing portal access for owner only.

### 3.2 Runtime Entitlements

Enforce plan limits at runtime:

- message volume,
- AI draft volume,
- knowledge source count,
- document chunk count,
- seats,
- domains,
- integrations,
- retention duration,
- advanced model routes.

Verification:

- exhausted plan returns helpful limit responses,
- upgrade clears limit block,
- background jobs respect entitlements.

## Phase 4 - Knowledge, AI, Widget, And Integrations

Priority: P0/P1.

### 4.1 Ingestion Reliability

Make ingestion production-safe:

- storage-backed file handling for large PDFs,
- background ingestion through QStash or equivalent,
- duplicate detection,
- job retries,
- error states,
- admin-visible ingestion status,
- embedding version metadata and re-embed flow.

Verification:

- large PDF import,
- retry after transient provider failure,
- duplicate upload,
- re-embedding after model/version change.

### 4.2 AI Routing And Evaluation

Finish deterministic model route observability:

- log route, provider, model, token estimate, latency, confidence, risk, cost estimate,
- keep raw prompts/messages out of logs by default,
- store hashes and redacted previews,
- require citations for customer-facing answers,
- route low-confidence, angry, billing, refund, legal, policy-risk, and security content into review.

Verification:

- deterministic golden evals pass,
- model-route logs exist for chat, ticket draft, and approval decisions,
- audit logs link AI run, policy decision, and human action.

### 4.3 Widget Hardening

Finish widget launch requirements:

- allowed-origin validation,
- optional signed widget session through `SUPPORTPILOT_WIDGET_SESSION_SECRET`,
- rate limiting by workspace and origin,
- blocked-origin security events,
- sanitized markdown output,
- no production fallback to demo workspace unless explicitly in demo mode.

Verification:

- allowed origin succeeds,
- blocked origin fails and logs security event,
- expired or invalid signed session fails,
- local demo remains usable in demo mode.

### 4.4 Integrations

Launch a narrow integration set:

- Slack alerts,
- generic outbound webhook,
- Zendesk ticket export or sync.

Defer:

- Intercom,
- CRM sync,
- autonomous refunds,
- autonomous account changes,
- external write tools without human approval.

Verification:

- encrypted or redacted secret storage,
- SSRF-safe endpoint validation,
- retry and dead-letter behavior,
- signed outbound payloads.

## Phase 5 - Compliance, Operations, And Scale

Priority: P1.

### 5.1 Evidence And Retention

Make compliance evidence real:

- retention job scheduler,
- audit export,
- deletion/anonymization requests,
- immutable or locked evidence storage,
- security event review surface,
- incident runbook.

Verification:

- retention job applies to old AI/audit/message data according to settings,
- audit export can be generated by authorized roles,
- deletion request is recorded and processed safely.

### 5.2 Production Infrastructure

Target default stack:

- Vercel for app hosting,
- Supabase Pro for Postgres, Auth, Storage, and pgvector,
- Upstash Redis/QStash or equivalent for rate limits and background jobs,
- Stripe for billing,
- Sentry for app errors,
- Resend or equivalent for invite/escalation email,
- object storage with retention/evidence controls for regulated artifacts.

Verification:

- staging environment deployed,
- environment variables documented and configured,
- health checks and error reporting active,
- database backups and PITR confirmed.

### 5.3 Enterprise Auth

Required before broad enterprise launch:

- SAML SSO,
- then WorkOS or equivalent SCIM for user lifecycle.

Verification:

- SAML login creates/links membership correctly,
- SCIM create/update/deactivate is audited,
- owner/admin controls remain intact.

## Phase 6 - QA And Launch Gates

Priority: P0 before public launch.

### 6.1 Automated Checks

Required checks:

- `npm run typecheck`
- `npm run test:billing`
- `npm run test:rate-limit`
- `npm run test:embeddings`
- `npm run test:ingestion`
- `npm run test:integrations`
- `npm run test:retention`
- `npm run test:domains`
- `npm run test:evals`
- `npm run test:rls`
- `npm run test:enterprise`
- `npm run test:production`
- `npm run test:journeys`
- `npm run build`
- `git diff --check`
- `graphify update .`

### 6.2 End-To-End Journeys

Add Playwright checks for:

- marketing page loads,
- owner onboarding,
- knowledge upload,
- ticket inbox and ticket detail,
- AI draft with citations,
- approval approve/edit/reject/escalate,
- customer portal ticket create,
- widget chat,
- billing checkout and portal stubs/test mode,
- settings/domain/widget install flow.

### 6.3 Manual Launch Rehearsal

Run on a clean staging environment:

- apply migrations,
- seed demo data,
- create real workspace,
- invite users,
- verify domain,
- upload docs,
- generate AI draft,
- approve response,
- use portal,
- use widget from allowed origin,
- complete Stripe checkout,
- export audit evidence,
- confirm Sentry events and security logs.

## Current Known Gaps To Close First

The next implementation slices should be:

1. Add `SUPPORTPILOT_APP_MODE` and fail-closed production environment checks.
2. Add API tests that prove protected routes do not use demo fallback in production mode.
3. Tighten portal and widget workspace resolution so client-provided IDs cannot cross tenants.
4. Add owner/admin-only billing and widget-key rotation tests.
5. Add browser Playwright critical journeys after the API and auth gates are stable.
6. Run the full static/test/build/graphify suite.
7. Commit and push `main`.

## Non-Goals For This Launch Pass

- no redesign,
- no autonomous refunds,
- no autonomous account changes,
- no outbound customer email without approval,
- no broad helpdesk marketplace,
- no local small-model production dependency,
- no replacement of the current HTML-handoff dashboard unless a verified layout bug requires a focused patch.
