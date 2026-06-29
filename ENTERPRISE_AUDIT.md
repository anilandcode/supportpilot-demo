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
| Required admin UI routes | PASS | `/admin`, `/admin/tickets`, `/admin/tickets/[ticketId]`, `/admin/knowledge`, `/admin/approvals`, `/admin/analytics`, `/admin/billing`. |
| Workspace settings route | PASS | `/admin/settings` manages workspace identity, brand color, escalation email, Calendly link, verified domains, widget snippets, and approval policy summary. |
| Customer portal route | PASS | `/portal` uses the existing chat window and keeps the Lite chat experience available. |
| Knowledge upload for md/txt/pdf/pasted content | PASS | `POST /api/knowledge/upload` parses file or pasted text, chunks content, stores docs/chunks with workspace metadata, and logs audit/usage events. |
| Dashboard metrics from service layer | PASS | `GET /api/stats` reads `getDashboardMetrics()` from `lib/db/support.ts`; Supabase mode uses database rows. |
| Existing embed and Lite chat preserved | PASS | `/api/chat`, `/embed`, `public/widget.js`, `LiteRetriever`, and `/knowledge` fallback remain. |
| Widget workspace key and domain allowlist | PASS | `public/widget.js` supports `data-workspace`, `/api/widget/config` returns public config, and chat/config APIs reject unverified origins. |
| Enterprise mode uses Supabase RAG when env vars are configured | PASS | `EnterpriseRetriever` delegates to `retrieveEnterpriseChunks()`, which calls Supabase RPC and falls back to approved chunk scoring. |
| Portfolio docs | PASS | `DESIGN.md`, `ROLE_ALIGNMENT.md`, `ARCHITECTURE.md`, `EVALS.md`, `SECURITY.md`, `ROADMAP.md`, README, setup, and ingest docs. |
| Automated verification | PARTIAL | Local typecheck and enterprise dataset checks are implemented. Live Supabase migration/RLS checks require a Supabase project. |

## Updates 07-12 Audit

| Requirement | Status | Evidence |
| --- | --- | --- |
| Track update docs as research artifacts | PASS | `Updates/07_Enterprise_Design_System.md` through `Updates/12_Design_and_Model_Upgrade_Summary.md` are preserved as repo docs. |
| Dual visual strategy for marketing/admin | PASS | `DESIGN.md`, `app/page.tsx`, `app/globals.css`, and admin primitives define expressive marketing and dense enterprise admin surfaces. |
| Semantic status, priority, risk, confidence tokens | PASS | `app/globals.css`, `theme.config.ts`, `lib/theme.ts`, `components/ui/badge.tsx`, and `components/enterprise/status-badge.tsx`. |
| Workspace health strip and pinned setup checklist | PASS | `components/enterprise/workspace-health-strip.tsx`, `setup-checklist.tsx`, `/admin`, and `getWorkspaceLaunchState()`. |
| Approval cards with exact risk reason, confidence, sources, draft, audit | PASS | `/admin/approvals`, `ConfidenceMeter`, `SourceDrawer`, `ApprovalAuditTimeline`, and `TicketAiPanel`. |
| Source/citation drawer | PASS | `components/enterprise/source-drawer.tsx` in approval cards and ticket AI panel. |
| Settings hub IA | PASS | `/admin/settings` now exposes Workspace, Knowledge, Approval policies, Escalation routes, Members and roles, Branding, Domains, Security, and Billing cards. |
| Missing-knowledge loop | PASS | `missing_knowledge_tasks`, `POST /api/knowledge/missing`, negative feedback handling, and ticket AI source-gap action. |
| Tenant-aware security tables and RLS | PASS | `supabase/migrations/003_updates_enterprise_readiness.sql` adds tenant-scoped readiness/security/model-route tables with workspace RLS. |
| Redacted AI logging | PASS | `lib/security/redaction.ts`, `/api/chat`, and `draftTicketReply()` store prompt hashes and redacted previews. |
| Optional signed widget sessions | PASS | `POST /api/widget/session`, `public/widget.js`, and `/api/chat` verification via `SUPPORTPILOT_WIDGET_SESSION_SECRET`. |
| Deterministic model routing and cost logging | PASS | `lib/ai/model-router.ts`, `model_route_logs`, `/api/model-routes`, draft workflow, and chat logging. |
| Policy decision shape and approval routing | PASS | `lib/workflows/policy.ts`, `policy_evaluations`, and draft approval status decisions. |
| Grounding verifier | PASS | `lib/workflows/grounding.ts`, `grounding_checks`, and draft response metadata. |
| Read-only tool registry scaffolding | PASS | `lib/workflows/tools.ts`, `tool_definitions`, `tool_calls`, and migration seed rows. |
| Local small-model execution | PARTIAL | Optional endpoint env vars are documented and router-ready; local model execution remains a P2 experiment. |
| Live Supabase RLS verification | PARTIAL | SQL policies exist; live per-role verification still requires a clean Supabase project with service credentials. |

## Updates 13-18 Audit

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add update docs 13-18 as research artifacts | PASS | `Updates/13_Design_Direction_Decision.md` through `Updates/18_Redesign_Action_Plan.md` are present and indexed in `README.md`. |
| Lock LynAI visual direction + Agentra IA + SupportPilot enterprise trust | PASS | `DESIGN.md` documents the locked direction; `app/page.tsx` implements the dashboard-forward hero, governance copy, product proof, and full IA. |
| Keep indigo-violet brand with amber marketing warmth | PASS | `theme.config.ts`, `lib/theme.ts`, and `app/globals.css` set `#6D56FF` primary, `#F86EBC` secondary, and `#FFB24A` warm accent. |
| Premium landing page with required sections | PASS | `/` now includes hero, proof strip, stats, how it works, use cases, agentic features, widget demo, security/trust, integrations, analytics, pricing, testimonials, FAQ, final CTA, and procurement footer. |
| Hero shows dashboard, widget, cited answer, approval queue, confidence, and sources | PASS | `HeroProductMockup()` and `WidgetPreview()` in `app/page.tsx` show Overview KPIs, approval queue, refund/SSO examples, citations, confidence, and manager review. |
| Launch/Pro/Enterprise pricing and enterprise-safe copy | PASS | `app/page.tsx` pricing uses Launch `$49/mo`, Pro `$149/mo`, and Enterprise custom; FAQ avoids unsupported SOC 2 compliance claims. |
| Console remains restrained, dense, evidence-first | PASS | `components/enterprise/admin-shell.tsx`, `/admin/tickets`, `/admin/approvals`, `/admin/knowledge`, and `/admin/analytics` use compact tables, borders, source/citation panels, route metadata, and audit surfaces. |
| Ticket inbox table-first workflow with saved views | PASS | `/admin/tickets` adds search and saved views; `TicketList` renders ID, customer, subject, intent, status, priority, AI confidence, sources, assignee, and last activity. |
| Approval queue split review workspace | PASS | `/admin/approvals` now has risk tabs, summary metrics, left queue cards, selected review workspace, confidence meter, source drawer, policy reason, audit trail, and sticky decision action bar. |
| Knowledge source health and missing-knowledge loop | PASS | `/admin/knowledge` shows source table, ingestion/freshness/chunk metrics, selected source detail, chunk previews, and missing-knowledge clusters from `listMissingKnowledgeTasks()`. |
| Analytics covers RAG quality, approval quality, and model cost | PASS | `/admin/analytics` shows deflection, acceptance, escalation, confidence distribution, missing knowledge, quality metrics, and `model_route_logs`. |
| Launch/Pro billing page and plan-limit enforcement | PASS | `/admin/billing`, `lib/billing/plans.ts`, `/api/billing/portal`, and `/api/chat` expose current-period usage, model route cost, Stripe portal handoff, and enforced conversation/AI reply limits before generation. |
| Settings hub has widget preview and contrast/security placeholders | PASS | `/admin/settings` includes settings hub cards, install snippets, verified domains, approval policies, live widget preview, contrast message, and retention/security settings. |
| Widget citations and approval-pending states are visible | PASS | `components/chat/citations.tsx` renders expandable source cards; `ChatWindow` displays cited-answer and approval-pending banners from metadata. |
| Semantic badges use explicit token table | PASS | `app/globals.css`, `lib/theme.ts`, `theme.config.ts`, `components/enterprise/status-badge.tsx`, and `DESIGN.md` define and use semantic fill/border/text/dot tokens. |
| Google Stitch output treated as reference, not pasted production code | PASS | `Updates/16_GoogleStitch_Dashboard_Prompts.md` is preserved as a reference; production implementation remains in local Next.js/Tailwind components. |
| Stripe subscriptions and live billing limits | PARTIAL | Plan-limit enforcement and optional Stripe portal session handoff are implemented; full Stripe subscription lifecycle, checkout, webhook reconciliation, and invoice sync remain Launch/Pro hardening. |
| External Stitch screenshots/Figma assets in `/design/stitch/` | PARTIAL | Prompt workflow is documented in `Updates/16` and `Updates/18`; no external Stitch image assets are required for the current code pass. |

## Design Upgrade Audit

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add `Design Upgrade/` artifacts while ignoring system junk | PASS | `Design Upgrade/SUPPORTPILOT_DESIGN.md`, `supportpilot-lynai-stage-14-clean.html`, and `deep-research-report (1).md` are preserved; `.DS_Store` remains ignored by `.gitignore`. |
| Treat Veritas research as unrelated implementation input | PASS | The implementation uses `SUPPORTPILOT_DESIGN.md` and the clean HTML prototype only; no Veritas research requirements drive code changes. |
| Replace homepage with LynAI-style SupportPilot marketing site | PASS | `app/page.tsx` now renders `components/marketing/landing-page.tsx`, which covers hero, trust strip, story rows, integrations, support-flow tabs, enterprise governance, analytics, pricing, testimonial/use cases, FAQ, CTA, and footer. |
| Keep admin, portal, embed, widget, backend, API, Supabase, and RAG contracts unchanged | PASS | Changes are scoped to `app/page.tsx`, marketing layout components, marketing CSS, font links, and docs. |
| Add clean marketing tokens without breaking enterprise tokens | PASS | `app/globals.css` adds `--m-*` marketing tokens and `.marketing-*` selectors while leaving existing enterprise/admin token names intact. |
| Accessible interactions for mobile menu, tabs, FAQ, carousel, and reduced motion | PASS | `components/layout/nav.tsx` adds `aria-expanded`, hidden state, and Escape close; `landing-page.tsx` adds tab keyboard support, FAQ buttons, testimonial controls, and CSS reduced-motion fallbacks. |
| Stable marketing anchors and existing product links | PASS | `#product`, `#integrations`, `#support-flow`, `#security`, `#analytics`, `#pricing`, `#solutions`, `#docs`, and `#demo` are present; links to `/admin`, `/portal`, `/embed`, knowledge, analytics, and demo URL are preserved. |
| Update docs for design direction and repo index | PASS | `DESIGN.md` records the warm editorial marketing system and admin boundary; `README.md` indexes `Design Upgrade/`. |

## Production Readiness Updates 19-24 Audit

| Requirement | Status | Evidence |
| --- | --- | --- |
| Add production readiness docs 19-24 as research artifacts | PASS | `Updates/19_Production_Readiness_Gap_Analysis.md` through `Updates/24_Production_Execution_Roadmap.md` are present and indexed in `README.md`. |
| Start with identity, tenancy, RLS proof, and onboarding before more UI polish | PASS | This pass adds `supabase/migrations/004_production_auth_onboarding.sql`, membership-aware route protection, `/onboarding`, auth screens, invitation APIs, and production-readiness tests. |
| Add invitation and membership lifecycle foundations | PARTIAL | `invitations`, membership `status`/`accepted_at`, invite create/accept APIs, token hashing, and role gating are implemented; email delivery and member-management UI are still future work. |
| Add customer portal identity foundation | PARTIAL | `portal_identities` table, RLS helper, portal login route, and customer-owned RLS policies are implemented; full portal account dashboard remains future work. |
| Add live-in-24h onboarding flow | PARTIAL | `/onboarding` creates first workspace state and shows launch checklist using existing onboarding services; full multi-step wizard screens for docs, brand, domains, widget, and golden-question execution remain follow-up work. |
| Enforce membership roles in route protection | PARTIAL | `proxy.ts` now resolves active `memberships.role` and uses `lib/auth/permissions.ts` for admin route gating; API routes still need a full sweep from legacy profile-role checks to workspace-role checks. |
| Add production-readiness automated checks | PASS | `npm run test:production` covers route role matrix, invite permissions, token hashing, onboarding checklist shape, slugging, and widget key generation. |
| Clean Supabase RLS proof on live project | PARTIAL | Migration `004` adds helper functions and policies for invitations, portal identities, onboarding sessions, and customer-owned tickets/messages; live clean-project execution still requires Supabase credentials. |
| Stripe lifecycle production implementation | FAIL | Still planned in `Updates/21`; current app retains the previous optional portal handoff and usage-limit demo path. |
| Integrations, production embeddings, persistent limits, background ingestion, retention, and local runtime | FAIL | Still planned in `Updates/22`; no implementation in this pass beyond preserving existing optional Resend/widget/session foundations. |
