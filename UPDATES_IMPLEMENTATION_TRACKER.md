# SupportPilot Updates Implementation Tracker

Date: 2026-06-24

## P0 Implemented

- Update docs `13` through `18` added and indexed in `README.md`.
- Locked LynAI-inspired marketing visuals, Agentra IA, and SupportPilot enterprise-trust design direction in `DESIGN.md`.
- Premium landing page rebuilt with dashboard hero, cited answer widget proof, approval/risk proof, stats, workflow, use cases, agentic features, live demo, security, integrations, analytics, Launch/Pro/Enterprise pricing, testimonials, FAQ, final CTA, and footer.
- Indigo-violet primary, pink secondary, amber marketing warmth, neutral console, dark proof-band, and semantic badge tokens expanded across `app/globals.css`, `theme.config.ts`, and `lib/theme.ts`.
- Explicit semantic badge primitive for ticket status, priority, risk, confidence, approval, and domain/security states.
- Admin shell updated with 248px sidebar, workspace switcher, verified-domain badge, search affordance, notification icon, and dense topbar.
- Ticket inbox converted to a table-first workflow with saved views, search, confidence, source count, assignee, and last activity columns.
- Approvals redesigned as a split queue/review workspace with queue reason, confidence meter, policy reason, source cards, audit trail, and sticky decision action bar.
- Knowledge page redesigned around source health, ingestion/freshness, selected source detail, chunk preview, and missing-knowledge clusters.
- Analytics page expanded with resolution funnel, confidence distribution, quality metrics, missing-knowledge clusters, and model route/cost table.
- Settings page now includes live widget preview and contrast/security status alongside snippets, domains, policies, retention, and billing placeholders.
- Widget citations expanded into source cards; chat widget now shows cited-answer and approval-pending banners.
- Semantic design tokens and status badges for ticket status, priority, approval, risk, domain, and confidence states.
- Marketing first viewport with SupportPilot-first positioning, conversational input, cited answer, and approval proof card.
- Workspace health strip, launch checklist, and setup state exposed through `/admin` and `GET /api/onboarding/state`.
- Approval queue redesign with risk reason, confidence breakdown, source drawer, draft body, and audit trail.
- Ticket AI panel with policy action, grounding status, source gap action, and confirmation before reject/escalate.
- Settings hub covering workspace, knowledge, approvals, escalation, members, branding, domains, security, and billing.
- Tenant-scoped migration for onboarding, model routes, security events, widget sessions, retention, tools, agent runs, policy evaluations, and grounding checks.
- Redacted prompt logging, prompt hashing, model-route logs, cost metrics, and optional signed widget sessions.

## P1 Implemented

- Query-param saved views for approval, low confidence, billing, unassigned, and stale-knowledge ticket slices.
- Missing-knowledge loop through negative feedback and explicit source-gap creation.
- Analytics cost/fallback metrics from AI run route metadata.
- Read-only tool registry scaffolding for `search_knowledge`, `get_ticket_history`, and `get_workspace_policy`.
- Billing page, optional Stripe customer portal handoff, current-period usage meters, model route cost grouping, and enforced Launch/Pro chat limits.

## Production Readiness Phase 1 Started

- Update docs `19` through `24` added and indexed in `README.md`.
- Added additive production auth migration `004_production_auth_onboarding.sql` for membership status, invitations, portal identities, onboarding sessions, role helper functions, and customer-owned RLS policies.
- Added shared permission rules for owner/admin/manager/agent route access, invite authorization, approval authorization, and legacy profile-role mapping.
- Updated `proxy.ts` to protect `/admin` with active workspace membership roles while keeping `/onboarding` available to authenticated first-run users.
- Added Supabase Auth pages for sign-up, magic link, forgot/reset password, portal login, and auth callback session exchange.
- Added `/onboarding` first-run workspace creation UI and `POST /api/onboarding/workspace`.
- Added invitation create/accept APIs plus `/invite/accept` UI with hashed, single-use invite-token flow.
- Swept protected API routes to use workspace-membership helpers instead of legacy profile-role/demo-user checks.
- Linked portal ticket creation to authenticated portal identities in Supabase mode while preserving demo fallback.
- Added `npm run test:production` for route permission, invitation, onboarding, slug, token, widget-key, and API-auth regression checks.
- Added `npm run test:rls`, `lib/auth/rls-matrix.ts`, and `RLS_VERIFICATION.md` to turn the RLS policy matrix into a repeatable local gate plus clean-project rehearsal checklist.

## Production Readiness Phase 2 Started

- Added additive billing lifecycle migration `005_billing_stripe_lifecycle.sql` for billing products/prices, Stripe customers, checkout sessions, subscriptions, invoices, entitlements, and idempotent webhook events.
- Added Stripe helper layer for Launch/Pro price env mapping, Checkout/Portal calls, webhook signature verification, event normalization, and entitlement derivation.
- Added billing repository with Supabase plus demo fallback for customer mapping, checkout recording, subscription/invoice sync, dunning state, entitlement upserts, and webhook idempotency.
- Added owner-only `/api/billing/checkout`, `/api/billing/subscription`, and signed `/api/billing/webhook` routes while preserving the existing portal fallback.
- Billing page upgrade buttons now start Checkout through the API, synced invoices replace placeholders when present, and activation copy waits for verified webhooks.
- Added `npm run test:billing` for catalog mapping, HMAC webhook verification, subscription entitlement sync, dunning state, and duplicate-event checks.
- Replaced the demo-only chat limiter with scoped rate limiting that uses Upstash Redis REST when configured and falls back to local memory for demos/tests.
- Enforced scoped limits on chat generation, widget config fetches, widget session creation, and knowledge uploads with 429 responses, rate-limit headers, and `rate_limited` security events.
- Added `npm run test:rate-limit` for local-window behavior, reset behavior, redacted key hashing, headers, and Redis pipeline selection.
- Added embedding versioning migration `006_embedding_versioning_jobs.sql` for provider/model/version/dimension metadata, source version IDs, embedded timestamps, workspace-scoped vector matching, and `knowledge_embedding_jobs`.
- Added provider-aware embedding generation for deterministic, local endpoint, OpenAI, and Google embeddings with deterministic fallback for demos and failed provider calls.
- Added manager/admin/owner `/api/knowledge/reembed` endpoint and `lib/db/embeddings.ts` for bounded synchronous re-embedding jobs over approved chunks.
- Added `npm run test:embeddings` for fallback behavior, local endpoint behavior, vector normalization, and re-embedding metadata updates.
- Added background ingestion migration `007_background_ingestion_jobs.sql` for workspace-scoped job status, retry metadata, errors, chunk counts, source hash dedupe, and RLS.
- Added `lib/db/ingestion.ts`, `/api/knowledge/ingest/jobs`, `/api/knowledge/ingest/jobs/[jobId]/run`, and updated `/api/knowledge/upload` so small text runs inline while large/PDF uploads can queue through QStash when worker env vars exist.
- Added `npm run test:ingestion` for synchronous ingestion, duplicate skipping, extraction review state, QStash worker-secret forwarding, and manual retry behavior.

## Production Readiness Phase 3 Started

- Added integration outbound migration `008_integration_outbound_events.sql` for Slack/generic webhook accounts, webhook endpoints, external mappings, idempotent outbound events, delivery attempts, retry metadata, and workspace RLS.
- Added `lib/db/integrations.ts` with local/Supabase storage, approval-needed and approval-decision enqueue hooks, Slack payload delivery, signed generic webhook payloads, audit logging, and manual retry delivery.
- Added `/api/integrations/accounts`, `/api/integrations/events`, and `/api/integrations/events/[eventId]/deliver` for redacted integration configuration, queue visibility, and manager/admin delivery execution.
- Wired ticket draft approval requests and AI-run approval decisions to create durable outbound integration events without sending externally unless a channel is active and delivery is explicitly run or inline mode is enabled.
- Added `npm run test:integrations` for idempotent enqueueing, Slack delivery, generic webhook signing, failed delivery retry metadata, and no-config fallback.

## Production Readiness Phase 4 Started

- Added retention/evidence migration `009_retention_evidence_jobs.sql` for data deletion requests, retention cleanup jobs, audit evidence exports, proof hashes, affected counts, retry metadata, and workspace RLS.
- Added `lib/db/retention.ts` plus `/api/security/deletion-requests`, `/api/security/retention/jobs`, `/api/security/retention/jobs/[jobId]/run`, and `/api/security/audit-exports`.
- Verified deletion requests now queue deletion jobs; retention settings schedule conversation and AI-log cleanup jobs; evidence exports produce tamper-evident hashes and SOC 2 readiness claim boundaries.
- Added `npm run test:retention` for deletion request verification, queued deletion processing, proof hashes, settings-driven cleanup scheduling, and evidence export item counts.
- Added domain verification migration `010_domain_verification_tokens.sql` for widget-origin verification tokens, DNS records, timestamps, and verification errors.
- Added staff-readable and owner/admin-manageable workspace domain APIs, including TXT/CNAME verification through `/api/workspaces/[workspaceId]/domains/[domainId]/verify`.
- Widget origin checks now remain blocked for newly added custom domains until DNS proof succeeds; successful and failed verification attempts write audit logs.
- Added `npm run test:domains` for pending-domain blocking, failed TXT checks, successful TXT verification, CNAME verification, and widget-origin activation.
- Added domain health classification, stale-domain detection, settings-page DNS challenge visibility, manual per-domain verification, and bulk rechecks through a cron-ready worker-secret endpoint.
- Added `.github/workflows/ci.yml` to run production gates and the Next.js build on pull requests and `main`, including an uploaded RLS report artifact.
- Added `npm run test:evals` for deterministic golden-question retrieval, grounding, confidence, and policy smoke checks, with CI artifact upload.
- Added `Updates/25_Enterprise_Launch_Completion_Plan.md` to lock the remaining enterprise launch gates.
- Added explicit `SUPPORTPILOT_APP_MODE=demo|production`; production mode now fails closed without Supabase URL, anon key, and service-role key for core auth/onboarding/invitation paths, with `npm run test:production` coverage.
- Hardened workspace data APIs so billing, integrations, knowledge jobs, model routes, onboarding state/steps, security events, retention jobs, audit exports, deletion requests, stats, and missing-knowledge endpoints authorize through `requireWorkspaceRole()` before reading workspace-scoped data.
- Added membership lifecycle APIs for role changes and disabling, final-active-owner protection, and audited pending-invitation revocation.
- Updated first-workspace onboarding to seed default escalation rules and approval policies for low confidence, angry sentiment, legal/policy, billing/refund, and sensitive-data risk.
- Hardened portal identity binding so portal ticket creation explicitly links the authenticated user to the created customer, portal ticket listing only returns that identity's customer tickets, and customer ticket-message writes cannot self-bind to foreign tickets.
- Expanded runtime entitlement enforcement beyond conversations and AI replies to approved sources, document chunks, members, workspaces, domains, integrations, and advanced model routes; knowledge upload, domain creation, integration setup, invitations, chat, and ticket draft APIs now return explicit `402` plan-limit responses.
- Centralized widget workspace resolution for chat, widget config, and widget session routes; production widget traffic now requires an `Origin`, blocked/missing origins write security events, and signed widget-session validation remains enforced when configured.
- Added retention-duration as an enforced billing metric and clamped scheduled conversation/AI cleanup jobs to the plan retention limit, with audit evidence when the configured setting is reduced for plan compliance.
- Hardened invitation acceptance so expired pending invites are marked `expired` and produce `member.invite.expired` audit logs instead of only returning a transient 410 response.

## Deferred

- Live Google Stitch/Figma exports are not required for the production code pass; prompt files remain committed as references.
- Full live Stripe launch remains a follow-up: create real test/live products and prices, configure webhook endpoint secrets, run Stripe CLI replay, add nightly reconciliation, and complete live-mode activation checks.
- Full live rate-limit launch remains a follow-up: provision Upstash Redis, set production env vars, run public widget abuse/load tests, and tune per-tenant thresholds from traffic.
- Full production embedding launch remains a follow-up: configure managed embedding credentials, run golden-question before/after comparisons, move re-embedding to QStash/background jobs, and add rollback promotion gates.
- Full background ingestion launch remains a follow-up: provision QStash, configure `SUPPORTPILOT_INGESTION_WORKER_SECRET`, move large files through Supabase Storage object references, add worker runbooks, and load-test large PDF/import queues.
- Full integration launch remains a follow-up: provision real Slack incoming webhooks or OAuth, add webhook health UI, schedule delivery workers/retries, encrypt production secrets with a managed key strategy, and build Zendesk/Intercom approved-reply connectors.
- Full custom-domain launch remains a follow-up: configure an external scheduler for the recheck endpoint, add expiry/stale-check alerts, and production DNS monitoring around `SUPPORTPILOT_DOMAIN_CNAME_TARGET`.
- Full QA launch remains a follow-up: add Playwright critical journeys, richer golden-question dashboards, and release/load gates to CI.
- Full local small-model execution, local embeddings, and reranker runtime calls remain optional P2 experiments behind environment variables.
- SSO/SAML/SCIM, live Supabase data deletion/anonymization, private storage retention lock, SOC2 evidence packet automation, and external helpdesk sync remain roadmap items.
- Live Supabase RLS role verification requires a real Supabase project and credentials.

## Verification Commands

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
npm run build
git diff --check
graphify update .
```
