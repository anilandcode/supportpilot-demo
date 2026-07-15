# Graph Report - chatbot-demo  (2026-07-15)

## Corpus Check
- 237 files · ~181,276 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1993 nodes · 4001 edges · 102 communities (94 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f583fbd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]

## God Nodes (most connected - your core abstractions)
1. `createSupabaseAdminClient()` - 111 edges
2. `getWorkspace()` - 91 edges
3. `requireWorkspaceRole()` - 69 edges
4. `appendAuditLog()` - 33 edges
5. `POST()` - 28 edges
6. `cn()` - 26 edges
7. `getWorkspaceLaunchState()` - 26 edges
8. `draftTicketReply()` - 25 edges
9. `recordUsageEvent()` - 22 edges
10. `maybeUuid()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getPlanLimitBlock()`  [INFERRED]
  app/api/chat/route.ts → lib/billing/core.ts
- `GET()` --calls--> `listRetentionJobs()`  [INFERRED]
  app/api/knowledge/ingest/jobs/route.ts → lib/db/retention.ts
- `POST()` --calls--> `getRetentionJob()`  [INFERRED]
  app/api/knowledge/ingest/jobs/[jobId]/run/route.ts → lib/db/retention.ts
- `POST()` --calls--> `processRetentionJob()`  [INFERRED]
  app/api/knowledge/ingest/jobs/[jobId]/run/route.ts → lib/db/retention.ts
- `OnboardingPage()` --calls--> `getWorkspaceLaunchState()`  [EXTRACTED]
  app/onboarding/page.tsx → lib/db/support.ts

## Communities (102 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (30): 1.1 Explicit Application Mode, 1.2 Workspace Resolver, 1.3 RLS Completion, 2.1 First Workspace Creation, 2.2 Invitations And Roles, 2.3 Portal Identity, 3.1 Stripe Lifecycle, 3.2 Runtime Entitlements (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (65): AccountSchema, GET(), POST(), redactAccount(), redactConfig(), redactEndpoint(), WebhookEndpointSchema, buildApprovalPayload() (+57 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): Academic integrity controls, Architecture and evidence infrastructure, Building a Production-Ready MVP for Veritas AI, Citation extraction and metadata policy, code:mermaid (gantt), Cost estimates, Deployment plan, Executive summary (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (17): contentHash(), getWorkspaceDomainFromSupabase(), hydrateSupabaseTicket(), listAgents(), localState, mapCustomer(), mapDocumentChunk(), mapTicket() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (20): metadata, TABS, ApprovalAuditTimeline(), ApprovalAuditTimelineProps, ConfidenceMeter(), ConfidenceMeterProps, SourceDrawer(), SourceDrawerProps (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (13): CONVERSATIONS, KNOWLEDGE_FILES, metadata, Status, STATUS_CONFIG, KpiCard(), KpiCardProps, SetupChecklist() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (31): 10. Install the Widget, 11. Deploy, 1. Clone and Install, 2. Configure Brand and Tier, 2. Configure the client, 3. Add knowledge, 3. Lite Knowledge, 4. Add environment variables (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (4): listKnowledgeDocs(), daysOld(), KnowledgePage(), metadata

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (17): API, code:bash (npm install), code:bash (SUPPORTPILOT_APP_MODE=production # demo | production), code:text (wk_demo_acmedesk), code:text (SupportPilot2026!), code:bash (npm run typecheck), Configure a Client, Docs (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (6): Annual discount, Billing and Account Management, Cancellation, Payment methods, Refund policy, Upgrades and downgrades

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): Cycles, Issues, Product Features, Projects, Roadmaps, Views and notifications

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): Figma, GitHub, Integrations, Notion, Other integrations, Slack

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): Encryption, GDPR, Role-Based Access Control, Security and Privacy, Single Sign-On, SOC 2

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (12): code:sql (public.match_document_chunks(query_embedding vector(768), ma), Current implementation status, Enterprise Ingestion, Enterprise Ingestion Path, Enterprise Upload Path, Future Hardening, Lite Path, Query Path (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): Business, Enterprise, Free, Pricing Plans, Pro

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (24): appendAgentRun(), appendGroundingCheck(), appendPolicyEvaluation(), appendToolCall(), toAgentRunRow(), toGroundingCheckRow(), toPolicyEvaluationRow(), toToolCallRow() (+16 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (22): canAccessAnyRole(), decideAdminRouteAccess(), getRequiredAdminRoles(), config, proxy(), STAFF_ROLES, apiDemoFallbackFiles, apiFiles (+14 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (50): checklist, demoAgentRuns, demoAiRuns, demoApprovalPolicies, demoAuditLogs, demoChecklistItems, demoCustomers, demoDocumentChunks (+42 more)

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (34): AnyRecord, appendConversationBubble(), appendPortalChat(), askChatApi(), confidenceLabel(), decideApproval(), domainHealthRow(), escapeHtml() (+26 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (46): 24 — SupportPilot Production Execution Roadmap, Billing and usage, Build order, Build order, Build order, Build order, Build order, code:mermaid (gantt) (+38 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (36): demoUsers, AgentRun, AIFeedback, AIRun, ApprovalPolicy, AuditLog, Customer, DashboardMetrics (+28 more)

### Community 28 - "Community 28"
Cohesion: 0.07
Nodes (29): 07 — SupportPilot Enterprise Design System, 10. Chat widget component inventory, 11. Multi-page page map, 12. White-label theming implementation, 13. Before → after fixes, 14. Implementation sequence, 1. Design strategy: premium marketing, restrained enterprise console, 2. Reference aesthetic blend (+21 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (27): Advanced production topology, Agentic layer, Architecture goals, code:mermaid (flowchart LR), code:mermaid (flowchart TD), code:ts (type SupportPilotAnswer = {), code:mermaid (sequenceDiagram), code:ts (type ConfidenceFeatures = {) (+19 more)

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (27): AI security, Application security, Build backlog by milestone, CI/CD plan, code:txt (supportpilot/), Compliance readiness, Environment plan, Final recommendation (+19 more)

### Community 31 - "Community 31"
Cohesion: 0.05
Nodes (81): getBillingPlans(), BillingPage(), BILLING_PLAN_KEY_BY_TIER, createStripeCheckoutSession(), createStripeCustomer(), createStripePortalSession(), dashboardBillingUrl(), deriveBillingEntitlementLimits() (+73 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (21): 08 — SupportPilot Product Workflow and UX Plan, 1. Product UX principle, 2. Workflow A — customer onboarding: “live in 24h”, 3. Workflow B — end-user support conversation, 4. Workflow C — human agent / manager approval flow, 5. Workflow D — admin configuration, 6. Ease-of-use improvements for the current MVP, 7. Metrics instrumentation (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.1
Nodes (19): Advanced architecture additions, Advanced version — scope, code:mermaid (flowchart LR), code:ts (type ApprovalPolicy = {), Include/exclude comparison, Light acceptance criteria, Light stack, Light version — scope (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (18): 10. Pragmatic implementation plan, 10 — SupportPilot True Agentic Architecture, 11. Database additions, 12. Anti-patterns to avoid, 1. What “true agentic” means for SupportPilot, 2. Agentic capabilities by maturity level, 3. System architecture, 4. Agent loop (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.21
Nodes (6): DomainForm(), KnowledgeUploader(), WorkspaceSettingsForm(), metadata, Button(), ButtonProps

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (17): Accessibility requirements, Admin dashboard UX rules, Alternatives if shadcn is not enough, code:css (:root {), Color roles, Component inventory — admin dashboard, Component inventory — chat widget, Core tokens (+9 more)

### Community 37 - "Community 37"
Cohesion: 0.11
Nodes (17): 10. License guidance, 11. Practical 30-day implementation plan, 11 — SupportPilot Small Models and Cost Strategy, 12. Bottom line, 1. Executive recommendation, 2. Model landscape for mid-2026 / near-future 2026–2027, 3. Hardware and deployment guidance, 4. Free API tiers and low-cost offload (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (16): 09 — SupportPilot Security and Enterprise Readiness, 10. SSO/SAML and enterprise auth, 11. SOC 2 Type II readiness checklist, 12. GDPR and EU AI Act considerations, 13. Security roadmap, 1. Security posture, 2. Multi-tenant isolation, 3. RBAC model (+8 more)

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (25): extractBetween(), extractBlock(), faqs, features, integrationGroups, pageMarkup, pricing, stage14Css (+17 more)

### Community 40 - "Community 40"
Cohesion: 0.13
Nodes (14): Admin Component Inventory, Approval UX, code:html (<script async src="https://your-client-domain.example/widget), Interface Principles, Marketing Page Requirements, Modes, Navigation, Product Positioning (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.15
Nodes (12): 1. Agentic support is replacing FAQ-only chatbots, 2. Voice support is becoming a premium frontier, 3. Humans are not disappearing; their role is shifting, 4. Compliance and data controls are becoming product features, Competitive landscape, Late-2026 to 2027 predictions, Market size and growth, Pricing-model patterns (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (10): code:mermaid (flowchart LR), code:mermaid (flowchart TB), Cost-control playbook, Practical “near-zero infra” recommendation, Recommended Advanced stack, Recommended free-tier stack by layer, Recommended Light stack, Stack strategy (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.06
Nodes (32): 10. Responsive behavior, 11. Code quality / refactor requirement, 12. Acceptance checklist, 1. Purpose, 2. Non-negotiable visual rules, 3. Brand tokens, 4. Patterns, gradients, and textures, 5. Page architecture (+24 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (8): 12 — SupportPilot Design and Model Upgrade Summary, 30-day quick-win plan, Design roadmap mapped to existing MVP, Executive summary, Final product thesis, Model roadmap mapped to Light and Advanced, Security roadmap in one view, What changes first

### Community 45 - "Community 45"
Cohesion: 0.25
Nodes (7): AI Workflow, Architecture, Auth and Roles, code:mermaid (flowchart LR), Data Layer, Observability, RAG

### Community 46 - "Community 46"
Cohesion: 0.25
Nodes (7): AI Safety Boundaries, Authentication, Current Limits, RLS, Roles, Secrets, Security

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (7): Build principles, Executive summary, How this document set is organized, Product definition, Recommended north-star metrics, Strategic thesis, SupportPilot Enterprise Blueprint — Overview

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (10): code:bash (npm run typecheck), Deferred, P0 Implemented, P1 Implemented, Production Readiness Phase 1 Started, Production Readiness Phase 2 Started, Production Readiness Phase 3 Started, Production Readiness Phase 4 Started (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.12
Nodes (33): appendAuditLog(), appendFeedback(), completeOnboardingStep(), createAiRun(), createKnowledgeDocument(), createMissingKnowledgeTask(), createModelRouteLog(), createPortalTicket() (+25 more)

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (6): Automated Checks, code:bash (npm run test:enterprise), code:bash (npm run test:evals), Evaluations, Manual Evaluation Matrix, Suggested Live Supabase Test

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (5): Governance, Helpdesk Integrations, Multi-Tenant Support, Production Hardening, Roadmap

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (19): acceptSchema, POST(), ensurePortalIdentity(), createInviteToken(), hashInviteToken(), inviteUrlFromRequest(), DELETE(), inviteSchema (+11 more)

### Community 54 - "Community 54"
Cohesion: 0.04
Nodes (44): 20 — SupportPilot Authentication and Onboarding Plan, Acceptance criteria, Admin/owner login, Agent login, Agent/manager/admin invite flow, Auth, Auth cost note: stay free until X, then Y, Auth flows by persona (+36 more)

### Community 55 - "Community 55"
Cohesion: 0.06
Nodes (30): 18 — SupportPilot Redesign Action Plan, code:mermaid (flowchart LR), Component map, Decisions to lock, Design QA, Enterprise backlog, Goal, Immediate next 10 actions (+22 more)

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (5): Design Upgrade Audit, Production Readiness Updates 19-24 Audit, SupportPilot Enterprise Audit, Updates 07-12 Audit, Updates 13-18 Audit

### Community 59 - "Community 59"
Cohesion: 0.08
Nodes (23): 16 — Google Stitch Dashboard Prompts, code:text (Design a premium enterprise SaaS admin UI for SupportPilot, ), code:text (Create a high-fidelity SupportPilot embeddable chat widget d), code:text (Create the SupportPilot Admin Overview screen using the glob), code:text (Create the SupportPilot Tickets screen with a table-first in), code:text (Create the SupportPilot Knowledge screen for managing RAG so), code:text (Create the SupportPilot Approvals screen for reviewing risky), code:text (Create the SupportPilot Analytics screen for AI support perf) (+15 more)

### Community 60 - "Community 60"
Cohesion: 0.09
Nodes (21): 10. Integrations, 11. Analytics / performance metrics, 12. Pricing, 13. Testimonials, 14. FAQ, 14 — SupportPilot Landing Page IA and Copy, 15. Final CTA, 16. Footer (+13 more)

### Community 61 - "Community 61"
Cohesion: 0.18
Nodes (14): listGoldenQuestions(), DocumentChunk, GoldenQuestion, PolicyAction, ARTIFACT_PATH, EvalCase, evaluateGoldenQuestion(), main() (+6 more)

### Community 62 - "Community 62"
Cohesion: 0.07
Nodes (49): AuditExportSchema, GET(), POST(), resolvePlanForWorkspace(), countOlderThan(), createAuditEvidenceExport(), createDeletionRequest(), CreateDeletionRequestInput (+41 more)

### Community 63 - "Community 63"
Cohesion: 0.06
Nodes (49): getChunksForReembedding(), listEmbeddingJobs(), localEmbeddingJobs, mapDocumentChunk(), maybeUuid(), publicId(), runReembeddingJob(), toEmbeddingJobRow() (+41 more)

### Community 64 - "Community 64"
Cohesion: 0.18
Nodes (10): 13 — SupportPilot Design Direction Decision, code:css (--hero-gradient:), Console: restrained, dense, evidence-first, Executive decision, Final recommendation, Final visual language, Marketing site: vivid, premium, dashboard-forward, Palette decision: keep indigo-violet as the brand, add warm amber as a marketing accent (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (8): 17 — SupportPilot Feature Set Matrix, Capability matrix, Enterprise feature set, Feature strategy, Launch / Pro minimum feature set, Model + stack tie-in, Status legend, What not to build yet

### Community 66 - "Community 66"
Cohesion: 0.14
Nodes (15): Citations(), CitationsProps, MarkdownMessage(), MarkdownMessageProps, renderInline(), MessageList(), MessageListProps, Message() (+7 more)

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (3): 15 — ChatGPT Landing Build Prompt, code:text (You are a senior front-end designer and engineer. Build a co), Source notes for the prompt

### Community 68 - "Community 68"
Cohesion: 0.11
Nodes (12): metadata, RootLayout(), BrandAvatar(), BrandAvatarProps, SuggestedQuestionsProps, WelcomeCardProps, SupportPilotTheme, LINKS (+4 more)

### Community 69 - "Community 69"
Cohesion: 0.1
Nodes (25): BILLING_PLANS, BillingPlanDefinition, BillingPlanKey, BillingRouteCost, BillingSnapshot, BillingSnapshotInput, BillingUsageMetric, buildBillingSnapshot() (+17 more)

### Community 70 - "Community 70"
Cohesion: 0.12
Nodes (20): canManageMembershipMutation(), MembershipMutationDecision, ADMIN_ROLES, APPROVAL_ROLES, AuthPersona, canApproveDraft(), canInviteRole(), canPerformMembershipAction() (+12 more)

### Community 71 - "Community 71"
Cohesion: 0.23
Nodes (15): ApprovalsPage(), getWorkspaceHealth(), getWorkspaceLaunchState(), listApprovalPolicies(), listApprovalQueue(), listAuditLogs(), listSecurityEvents(), listTickets() (+7 more)

### Community 72 - "Community 72"
Cohesion: 0.05
Nodes (41): 22 — SupportPilot Integrations, Infrastructure Hardening, and Local Runtime Plan, Acceptance criteria — domain verification, Acceptance criteria — embeddings, Acceptance criteria — ingestion, Acceptance criteria — integrations, Acceptance criteria — local runtime, Acceptance criteria — rate limiting, Acceptance criteria — retention/audit (+33 more)

### Community 73 - "Community 73"
Cohesion: 0.11
Nodes (9): enterpriseCards, faqs, flowTabs, integrations, MarketingLandingPage(), pricing, storyRows, testimonials (+1 more)

### Community 74 - "Community 74"
Cohesion: 0.22
Nodes (18): addWorkspaceDomain(), domainExpectedCname(), domainExpectedTxt(), domainStaleMs(), domainVerificationRecord(), getDomainHealth(), getWorkspaceDomainHealth(), listWorkspaceDomains() (+10 more)

### Community 75 - "Community 75"
Cohesion: 0.15
Nodes (16): Feedback(), FeedbackProps, cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount() (+8 more)

### Community 76 - "Community 76"
Cohesion: 0.17
Nodes (5): BillingSearchParams, metadata, AdminShell(), AdminShellProps, NAV_ITEMS

### Community 77 - "Community 77"
Cohesion: 0.32
Nodes (8): GET(), POST(), createSupabaseBrowserClient(), getMissingSupabaseConfig(), getSupabaseAnonKey(), getSupabaseUrl(), SupportPilotAppMode, createSupabaseServerClient()

### Community 78 - "Community 78"
Cohesion: 0.08
Nodes (25): 21 — SupportPilot Billing and Stripe Lifecycle Plan, Acceptance criteria, Billing flow, Checkout plan, code:mermaid (sequenceDiagram), code:txt (usage_events), Create checkout session, Customer portal (+17 more)

### Community 79 - "Community 79"
Cohesion: 0.15
Nodes (9): AdminPage(), AnalyticsPage(), metadata, calculateMetrics(), getDashboardMetrics(), listModelRouteLogs(), getStatsSnapshot(), GET() (+1 more)

### Community 80 - "Community 80"
Cohesion: 0.35
Nodes (10): clientKey(), GET(), appendSecurityEvent(), createWidgetSession(), getWidgetConfig(), isOriginAllowed(), mapWidgetConfig(), retryAfterSeconds() (+2 more)

### Community 81 - "Community 81"
Cohesion: 0.17
Nodes (20): estimateTokenCount(), ModelRouteDecision, RouteInput, selectModelRoute(), getBillingSnapshot(), assistantResponse(), containsSensitiveData(), getClientKey() (+12 more)

### Community 82 - "Community 82"
Cohesion: 0.09
Nodes (22): 23 — SupportPilot Testing and QA Strategy, Before every production release, Before first paid launch, CI gates, code:mermaid (flowchart TD), code:mermaid (journey), Critical E2E tests, Done means (+14 more)

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (6): CaptureInput, captureProductEvent(), EscalationEmailSchema, POST(), EscalationEmailInput, sendEscalationEmail()

### Community 84 - "Community 84"
Cohesion: 0.13
Nodes (8): AuthForm(), AuthFormMode, AuthFormProps, MODE_COPY, metadata, metadata, metadata, metadata

### Community 85 - "Community 85"
Cohesion: 0.13
Nodes (20): ApiAuthResult, getAuthenticatedUser(), requireWorkspaceRole(), getCurrentEnterpriseUser, hasEnterpriseRole(), BodySchema, POST(), STEPS (+12 more)

### Community 86 - "Community 86"
Cohesion: 0.47
Nodes (7): requireTicketWorkspaceRole(), appendTicketMessage(), getTicket(), POST(), POST(), TicketMessageSchema, getDemoUser()

### Community 87 - "Community 87"
Cohesion: 0.15
Nodes (12): 19 — SupportPilot Production Readiness Gap Analysis, Bottom line, Executive readiness verdict, P0 — must build before any real production customer, P1 — must build before paid SaaS launch, P2 — must build before enterprise sales motion, Priority stack, Production-readiness classification (+4 more)

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (8): HandoffPageKey, HandoffRuntime(), extractAll(), extractBody(), HtmlHandoffPage(), HtmlHandoffPageProps, rewritePrototypeLinks(), scopeHandoffCss()

### Community 89 - "Community 89"
Cohesion: 0.25
Nodes (13): hashSensitiveValue(), hasSensitiveFindings(), previewRedactedText(), REDACTION_PATTERNS, RedactionResult, redactSensitiveText(), base64url(), createSignedWidgetSession() (+5 more)

### Community 90 - "Community 90"
Cohesion: 0.57
Nodes (5): makeUniqueSlug(), makeWidgetKey(), ONBOARDING_CHECKLIST, slugifyWorkspaceName(), POST()

### Community 91 - "Community 91"
Cohesion: 0.4
Nodes (4): OnboardingWizard(), OnboardingWizardProps, metadata, OnboardingPage()

### Community 92 - "Community 92"
Cohesion: 0.19
Nodes (11): describeRlsMatrix(), REQUIRED_RLS_HELPERS, REQUIRED_RLS_TABLES, RLS_EXPECTATIONS, RlsActor, RlsExpectation, RlsOperation, checks (+3 more)

### Community 93 - "Community 93"
Cohesion: 0.08
Nodes (51): buildPayload(), createIngestionJob(), CreateIngestionJobInput, enqueueWithQStash(), extractJobText(), findDuplicateSuccessfulJob(), getIngestionJob(), getLocalIngestionJobs() (+43 more)

### Community 96 - "Community 96"
Cohesion: 0.5
Nodes (4): listMissingKnowledgeTasks(), GET(), MissingKnowledgeSchema, POST()

### Community 97 - "Community 97"
Cohesion: 0.13
Nodes (11): ChatWindow(), ChatWindowProps, transport, Composer(), ComposerProps, EscalationButton(), EscalationButtonProps, WelcomeCard() (+3 more)

### Community 99 - "Community 99"
Cohesion: 0.5
Nodes (4): ask(), QUESTIONS, run(), UIMessagePart

### Community 100 - "Community 100"
Cohesion: 0.4
Nodes (4): AnalyticsStore, ConversationLog, FeedbackLog, globalForAnalytics

### Community 101 - "Community 101"
Cohesion: 0.29
Nodes (6): Clean Supabase Rehearsal, code:bash (npm run test:rls), code:bash (supabase db push), Local Static Gate, Production Gate, RLS Verification

## Knowledge Gaps
- **802 isolated node(s):** `config`, `config`, `SupportPilotTheme`, `nextConfig`, `metadata` (+797 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseAdminClient()` connect `Community 52` to `Community 1`, `Community 3`, `Community 7`, `Community 15`, `Community 31`, `Community 49`, `Community 61`, `Community 62`, `Community 63`, `Community 69`, `Community 71`, `Community 74`, `Community 77`, `Community 79`, `Community 80`, `Community 85`, `Community 86`, `Community 90`, `Community 93`, `Community 96`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `getWorkspace()` connect `Community 49` to `Community 1`, `Community 3`, `Community 4`, `Community 69`, `Community 71`, `Community 74`, `Community 15`, `Community 80`, `Community 81`, `Community 83`, `Community 93`, `Community 85`, `Community 52`, `Community 63`, `Community 62`, `Community 31`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `requireWorkspaceRole()` connect `Community 85` to `Community 96`, `Community 1`, `Community 70`, `Community 74`, `Community 79`, `Community 83`, `Community 52`, `Community 86`, `Community 23`, `Community 31`, `Community 93`, `Community 62`, `Community 63`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `config`, `config`, `SupportPilotTheme` to the rest of the system?**
  _802 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._