# Graph Report - chatbot-demo  (2026-06-29)

## Corpus Check
- 193 files · ~150,633 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1571 nodes · 2669 edges · 96 communities (88 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd85c645`
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
- [[_COMMUNITY_Community 95|Community 95]]

## God Nodes (most connected - your core abstractions)
1. `createSupabaseAdminClient()` - 56 edges
2. `getWorkspace()` - 38 edges
3. `POST()` - 27 edges
4. `cn()` - 26 edges
5. `getWorkspaceLaunchState()` - 26 edges
6. `draftTicketReply()` - 24 edges
7. `recordUsageEvent()` - 22 edges
8. `appendAuditLog()` - 20 edges
9. `14 — SupportPilot Landing Page IA and Copy` - 20 edges
10. `maybeUuid()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getPlanLimitBlock()`  [INFERRED]
  app/api/chat/route.ts → lib/billing/core.ts
- `OnboardingPage()` --calls--> `getWorkspaceLaunchState()`  [EXTRACTED]
  app/onboarding/page.tsx → lib/db/support.ts
- `proxy()` --calls--> `decideAdminRouteAccess()`  [EXTRACTED]
  proxy.ts → lib/auth/permissions.ts
- `PortalPage()` --calls--> `getWorkspaceLaunchState()`  [EXTRACTED]
  app/portal/page.tsx → lib/db/support.ts
- `GET()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  app/auth/callback/route.ts → lib/supabase/server.ts

## Communities (96 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (14): Feedback(), FeedbackProps, cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.47
Nodes (5): ConfidenceBreakdown, calculateConfidenceBreakdown(), clamp(), ConfidenceInput, round()

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): Academic integrity controls, Architecture and evidence infrastructure, Building a Production-Ready MVP for Veritas AI, Citation extraction and metadata policy, code:mermaid (gantt), Cost estimates, Deployment plan, Executive summary (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (6): getCurrentEnterpriseUser, BillingSearchParams, metadata, AdminShell(), AdminShellProps, NAV_ITEMS

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (22): ApprovalsPage(), metadata, TABS, CitationsProps, listAuditLogs(), ApprovalAuditTimeline(), ApprovalAuditTimelineProps, ConfidenceMeter() (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (13): CONVERSATIONS, KNOWLEDGE_FILES, metadata, Status, STATUS_CONFIG, KpiCard(), KpiCardProps, SetupChecklist() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (31): 10. Install the Widget, 11. Deploy, 1. Clone and Install, 2. Configure Brand and Tier, 2. Configure the client, 3. Add knowledge, 3. Lite Knowledge, 4. Add environment variables (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (20): listDocumentChunks(), toDocumentChunkRow(), DEFAULT_KNOWLEDGE_FILES, KnowledgeFile, Chunk, EnterpriseRetriever, formatContext(), getKnowledgeFiles() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (17): API, code:bash (npm install), code:bash (NEXT_PUBLIC_SUPABASE_URL=...), code:text (wk_demo_acmedesk), code:text (SupportPilot2026!), code:bash (npm run typecheck), Configure a Client, Docs (+9 more)

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
Cohesion: 0.5
Nodes (4): ask(), QUESTIONS, run(), UIMessagePart

### Community 23 - "Community 23"
Cohesion: 0.1
Nodes (12): contentHash(), hydrateSupabaseTicket(), localState, mapCustomer(), mapDocumentChunk(), mapTicket(), mapUser(), TicketFilters (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.05
Nodes (50): checklist, demoAgentRuns, demoAiRuns, demoApprovalPolicies, demoAuditLogs, demoChecklistItems, demoCustomers, demoDocumentChunks (+42 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (31): AnyRecord, appendConversationBubble(), appendPortalChat(), askChatApi(), confidenceLabel(), decideApproval(), escapeHtml(), HandoffRuntimeProps (+23 more)

### Community 26 - "Community 26"
Cohesion: 0.04
Nodes (46): 24 — SupportPilot Production Execution Roadmap, Billing and usage, Build order, Build order, Build order, Build order, Build order, code:mermaid (gantt) (+38 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (34): ModelRouteDecision, RouteInput, AgentRun, AIFeedback, ApprovalPolicy, AuditLog, Customer, DashboardMetrics (+26 more)

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
Cohesion: 0.48
Nodes (6): createPortalResult(), dashboardUrl(), GET(), PortalResult, POST(), returnUrl()

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
Cohesion: 0.19
Nodes (7): DomainForm(), KnowledgeUploader(), WorkspaceSettingsForm(), metadata, SettingsPage(), Button(), ButtonProps

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
Cohesion: 0.07
Nodes (17): extractBetween(), extractBlock(), faqs, features, integrationGroups, pageMarkup, pricing, stage14Css (+9 more)

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
Cohesion: 0.25
Nodes (7): code:bash (npm run typecheck), Deferred, P0 Implemented, P1 Implemented, Production Readiness Phase 1 Started, SupportPilot Updates Implementation Tracker, Verification Commands

### Community 49 - "Community 49"
Cohesion: 0.17
Nodes (20): assistantResponse(), containsSensitiveData(), getClientKey(), getTextContent(), ipHash(), localAnswer(), logProviderFallback(), POST() (+12 more)

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (5): Automated Checks, code:bash (npm run test:enterprise), Evaluations, Manual Evaluation Matrix, Suggested Live Supabase Test

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (5): Governance, Helpdesk Integrations, Multi-Tenant Support, Production Hardening, Roadmap

### Community 52 - "Community 52"
Cohesion: 0.11
Nodes (23): CaptureInput, captureProductEvent(), hasEnterpriseRole(), addWorkspaceDomain(), appendAuditLog(), getTicket(), hydrateTicket(), mapAiRun() (+15 more)

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
Cohesion: 0.16
Nodes (9): listAgents(), listTickets(), TicketList(), TicketListProps, metadata, PortalPage(), metadata, SearchParams (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (8): HandoffPageKey, HandoffRuntime(), extractAll(), extractBody(), HtmlHandoffPage(), HtmlHandoffPageProps, rewritePrototypeLinks(), scopeHandoffCss()

### Community 63 - "Community 63"
Cohesion: 0.12
Nodes (25): BILLING_PLANS, BillingPlanDefinition, BillingPlanKey, BillingRouteCost, BillingSnapshot, BillingSnapshotInput, BillingUsageMetric, buildBillingSnapshot() (+17 more)

### Community 64 - "Community 64"
Cohesion: 0.18
Nodes (10): 13 — SupportPilot Design Direction Decision, code:css (--hero-gradient:), Console: restrained, dense, evidence-first, Executive decision, Final recommendation, Final visual language, Marketing site: vivid, premium, dashboard-forward, Palette decision: keep indigo-violet as the brand, add warm amber as a marketing accent (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (8): 17 — SupportPilot Feature Set Matrix, Capability matrix, Enterprise feature set, Feature strategy, Launch / Pro minimum feature set, Model + stack tie-in, Status legend, What not to build yet

### Community 66 - "Community 66"
Cohesion: 0.23
Nodes (17): GET(), appendSecurityEvent(), createWidgetSession(), getWidgetConfig(), getWorkspace(), isOriginAllowed(), mapWidgetConfig(), mapWorkspace() (+9 more)

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (3): 15 — ChatGPT Landing Build Prompt, code:text (You are a senior front-end designer and engineer. Build a co), Source notes for the prompt

### Community 68 - "Community 68"
Cohesion: 0.13
Nodes (8): metadata, RootLayout(), SuggestedQuestionsProps, SupportPilotTheme, LINKS, getThemeCssVariables(), ThemeStyle, metadata

### Community 69 - "Community 69"
Cohesion: 0.16
Nodes (12): Citations(), MarkdownMessage(), MarkdownMessageProps, renderInline(), MessageListProps, Message(), MessageProps, parseCitations() (+4 more)

### Community 70 - "Community 70"
Cohesion: 0.16
Nodes (17): getRetentionSetting(), getWorkspaceHealth(), getWorkspaceLaunchState(), listApprovalPolicies(), listApprovalQueue(), listGoldenQuestions(), listMissingKnowledgeTasks(), listSecurityEvents() (+9 more)

### Community 71 - "Community 71"
Cohesion: 0.07
Nodes (51): acceptSchema, POST(), createInviteToken(), hashInviteToken(), inviteUrlFromRequest(), makeUniqueSlug(), makeWidgetKey(), ONBOARDING_CHECKLIST (+43 more)

### Community 72 - "Community 72"
Cohesion: 0.05
Nodes (41): 22 — SupportPilot Integrations, Infrastructure Hardening, and Local Runtime Plan, Acceptance criteria — domain verification, Acceptance criteria — embeddings, Acceptance criteria — ingestion, Acceptance criteria — integrations, Acceptance criteria — local runtime, Acceptance criteria — rate limiting, Acceptance criteria — retention/audit (+33 more)

### Community 73 - "Community 73"
Cohesion: 0.11
Nodes (9): enterpriseCards, faqs, flowTabs, integrations, MarketingLandingPage(), pricing, storyRows, testimonials (+1 more)

### Community 74 - "Community 74"
Cohesion: 0.13
Nodes (11): ChatWindow(), ChatWindowProps, transport, Composer(), ComposerProps, EscalationButton(), EscalationButtonProps, MessageList() (+3 more)

### Community 75 - "Community 75"
Cohesion: 0.21
Nodes (11): appendFeedback(), createMissingKnowledgeTask(), toFeedbackRow(), toMissingKnowledgeTaskRow(), POST(), AnalyticsStore, ConversationLog, FeedbackLog (+3 more)

### Community 76 - "Community 76"
Cohesion: 0.22
Nodes (3): daysOld(), KnowledgePage(), metadata

### Community 77 - "Community 77"
Cohesion: 0.15
Nodes (9): AdminPage(), AnalyticsPage(), metadata, calculateMetrics(), getDashboardMetrics(), listModelRouteLogs(), getStatsSnapshot(), GET() (+1 more)

### Community 78 - "Community 78"
Cohesion: 0.08
Nodes (25): 21 — SupportPilot Billing and Stripe Lifecycle Plan, Acceptance criteria, Billing flow, Checkout plan, code:mermaid (sequenceDiagram), code:txt (usage_events), Create checkout session, Customer portal (+17 more)

### Community 79 - "Community 79"
Cohesion: 0.5
Nodes (4): BodySchema, POST(), STEPS, completeOnboardingStep()

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (3): Footer(), FOOTER_COLUMNS, marqueeItems

### Community 81 - "Community 81"
Cohesion: 0.5
Nodes (3): LINKS, Nav(), PRODUCT_LINKS

### Community 82 - "Community 82"
Cohesion: 0.09
Nodes (22): 23 — SupportPilot Testing and QA Strategy, Before every production release, Before first paid launch, CI gates, code:mermaid (flowchart TD), code:mermaid (journey), Critical E2E tests, Done means (+14 more)

### Community 83 - "Community 83"
Cohesion: 0.27
Nodes (17): estimateTokenCount(), selectModelRoute(), logChatRun(), appendAgentRun(), appendGroundingCheck(), appendPolicyEvaluation(), appendToolCall(), createAiRun() (+9 more)

### Community 84 - "Community 84"
Cohesion: 0.13
Nodes (8): AuthForm(), AuthFormMode, AuthFormProps, MODE_COPY, metadata, metadata, metadata, metadata

### Community 85 - "Community 85"
Cohesion: 0.33
Nodes (6): AIRun, GroundingCheck, GroundingStatus, GroundingInput, round(), verifyGrounding()

### Community 86 - "Community 86"
Cohesion: 0.12
Nodes (17): createPortalTicket(), maybeUuid(), resolveCustomerId(), toAgentRunRow(), toAiRunRow(), toAuditLogRow(), toGroundingCheckRow(), toModelRouteLogRow() (+9 more)

### Community 87 - "Community 87"
Cohesion: 0.15
Nodes (12): 19 — SupportPilot Production Readiness Gap Analysis, Bottom line, Executive readiness verdict, P0 — must build before any real production customer, P1 — must build before paid SaaS launch, P2 — must build before enterprise sales motion, Priority stack, Production-readiness classification (+4 more)

### Community 88 - "Community 88"
Cohesion: 0.27
Nodes (10): createKnowledgeDocument(), toKnowledgeDocRow(), DocumentChunk, chunkDocument(), makeChunk(), PendingDocumentChunk, splitSections(), extractText() (+2 more)

### Community 89 - "Community 89"
Cohesion: 0.27
Nodes (8): appendTicketMessage(), updateAiRunDecision(), DecisionSchema, PATCH(), POST(), POST(), TicketMessageSchema, getDemoUser()

### Community 90 - "Community 90"
Cohesion: 0.31
Nodes (6): BrandAvatar(), BrandAvatarProps, TypingIndicator(), WelcomeCard(), WelcomeCardProps, getInitials()

### Community 91 - "Community 91"
Cohesion: 0.33
Nodes (5): OnboardingWizard(), OnboardingWizardProps, WorkspaceLaunchState, metadata, OnboardingPage()

### Community 92 - "Community 92"
Cohesion: 0.47
Nodes (5): hasSensitiveFindings(), previewRedactedText(), REDACTION_PATTERNS, RedactionResult, redactSensitiveText()

### Community 94 - "Community 94"
Cohesion: 0.5
Nodes (3): demoUsers, EnterpriseUser, UserRole

## Knowledge Gaps
- **703 isolated node(s):** `config`, `config`, `SupportPilotTheme`, `nextConfig`, `metadata` (+698 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 35`, `Community 4`, `Community 69`, `Community 5`, `Community 3`, `Community 90`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `createSupabaseAdminClient()` connect `Community 71` to `Community 66`, `Community 4`, `Community 70`, `Community 7`, `Community 75`, `Community 77`, `Community 79`, `Community 83`, `Community 52`, `Community 86`, `Community 23`, `Community 88`, `Community 89`, `Community 61`, `Community 63`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `getWorkspace()` connect `Community 66` to `Community 4`, `Community 70`, `Community 71`, `Community 75`, `Community 79`, `Community 49`, `Community 83`, `Community 52`, `Community 86`, `Community 23`, `Community 88`, `Community 63`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `config`, `config`, `SupportPilotTheme` to the rest of the system?**
  _703 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._