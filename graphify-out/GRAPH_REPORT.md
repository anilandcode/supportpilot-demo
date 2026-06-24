# Graph Report - chatbot-demo  (2026-06-24)

## Corpus Check
- 156 files · ~86,678 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1103 nodes · 1923 edges · 68 communities (61 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85d1c5a9`
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

## God Nodes (most connected - your core abstractions)
1. `createSupabaseAdminClient()` - 43 edges
2. `getWorkspace()` - 32 edges
3. `cn()` - 26 edges
4. `draftTicketReply()` - 24 edges
5. `POST()` - 23 edges
6. `recordUsageEvent()` - 22 edges
7. `14 — SupportPilot Landing Page IA and Copy` - 20 edges
8. `Client Setup Runbook` - 19 edges
9. `maybeUuid()` - 17 edges
10. `publicId()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `SettingsPage()` --calls--> `getWorkspaceLaunchState()`  [EXTRACTED]
  app/admin/settings/page.tsx → lib/db/support.ts
- `GET()` --calls--> `listMissingKnowledgeTasks()`  [EXTRACTED]
  app/api/knowledge/missing/route.ts → lib/db/support.ts
- `POST()` --calls--> `completeOnboardingStep()`  [EXTRACTED]
  app/api/onboarding/steps/[step]/complete/route.ts → lib/db/support.ts
- `AdminPage()` --calls--> `getDashboardMetrics()`  [EXTRACTED]
  app/admin/page.tsx → lib/db/support.ts
- `AdminPage()` --calls--> `listApprovalQueue()`  [EXTRACTED]
  app/admin/page.tsx → lib/db/support.ts

## Communities (68 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (16): Feedback(), FeedbackProps, cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (8): metadata, RootLayout(), SuggestedQuestionsProps, SupportPilotTheme, LINKS, getThemeCssVariables(), ThemeStyle, metadata

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): ConfidenceBreakdown, PolicyDecision, RiskLevel, TicketWithRelations, ToolDefinition, calculateConfidenceBreakdown(), clamp(), ConfidenceInput (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (24): getRetentionSetting(), getWorkspaceHealth(), getWorkspaceLaunchState(), listDocumentChunks(), listGoldenQuestions(), listKnowledgeDocs(), listMissingKnowledgeTasks(), listSecurityEvents() (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): Citations(), CitationsProps, MarkdownMessage(), MarkdownMessageProps, renderInline(), MessageList(), MessageListProps, Message() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (13): CONVERSATIONS, KNOWLEDGE_FILES, metadata, Status, STATUS_CONFIG, KpiCard(), KpiCardProps, SetupChecklist() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (31): 10. Install the Widget, 11. Deploy, 1. Clone and Install, 2. Configure Brand and Tier, 2. Configure the client, 3. Add knowledge, 3. Lite Knowledge, 4. Add environment variables (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (20): LoginForm(), DEFAULT_KNOWLEDGE_FILES, KnowledgeFile, EnterpriseRetriever, getKnowledgeFiles(), KNOWLEDGE_DIR, LiteRetriever, readKnowledgeFiles() (+12 more)

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
Cohesion: 0.05
Nodes (100): estimateTokenCount(), ModelRouteDecision, RouteInput, selectModelRoute(), CaptureInput, captureProductEvent(), assistantResponse(), containsSensitiveData() (+92 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (49): checklist, demoAgentRuns, demoApprovalPolicies, demoAuditLogs, demoChecklistItems, demoCustomers, demoDocumentChunks, demoDomains (+41 more)

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (31): canPerformMembershipAction(), getCurrentEnterpriseUser, hasEnterpriseRole(), hasWorkspacePermission(), profileRoleToMembershipRole(), ROLE_RANK, addWorkspaceDomain(), normalizeDomain() (+23 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (21): ApprovalsPage(), metadata, TABS, listApprovalQueue(), listAuditLogs(), ApprovalAuditTimeline(), ApprovalAuditTimelineProps, ConfidenceMeter() (+13 more)

### Community 27 - "Community 27"
Cohesion: 0.08
Nodes (25): AgentRun, AuditLog, DashboardMetrics, DocumentChunk, EscalationRule, GoldenQuestion, KnowledgeDoc, Membership (+17 more)

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
Cohesion: 0.09
Nodes (13): contentHash(), hydrateSupabaseTicket(), localState, mapCustomer(), mapDocumentChunk(), mapTicket(), mapUser(), TicketFilters (+5 more)

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
Cohesion: 0.17
Nodes (11): BrandAvatar(), BrandAvatarProps, ChatWindowProps, transport, Composer(), ComposerProps, EscalationButton(), EscalationButtonProps (+3 more)

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
Cohesion: 0.09
Nodes (13): faqs, features, integrationGroups, pricing, stats, steps, trustCards, useCases (+5 more)

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
Cohesion: 0.2
Nodes (4): ChatWindow(), EmbedPageProps, metadata, metadata

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
Cohesion: 0.29
Nodes (6): code:bash (npm run typecheck), Deferred, P0 Implemented, P1 Implemented, SupportPilot Updates Implementation Tracker, Verification Commands

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (6): AIRun, GroundingCheck, GroundingStatus, GroundingInput, round(), verifyGrounding()

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (5): Automated Checks, code:bash (npm run test:enterprise), Evaluations, Manual Evaluation Matrix, Suggested Live Supabase Test

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (5): Governance, Helpdesk Integrations, Multi-Tenant Support, Production Hardening, Roadmap

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (4): BodySchema, POST(), STEPS, LaunchChecklistStep

### Community 55 - "Community 55"
Cohesion: 0.06
Nodes (30): 18 — SupportPilot Redesign Action Plan, code:mermaid (flowchart LR), Component map, Decisions to lock, Design QA, Enterprise backlog, Goal, Immediate next 10 actions (+22 more)

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (3): SupportPilot Enterprise Audit, Updates 07-12 Audit, Updates 13-18 Audit

### Community 59 - "Community 59"
Cohesion: 0.08
Nodes (23): 16 — Google Stitch Dashboard Prompts, code:text (Design a premium enterprise SaaS admin UI for SupportPilot, ), code:text (Create a high-fidelity SupportPilot embeddable chat widget d), code:text (Create the SupportPilot Admin Overview screen using the glob), code:text (Create the SupportPilot Tickets screen with a table-first in), code:text (Create the SupportPilot Knowledge screen for managing RAG so), code:text (Create the SupportPilot Approvals screen for reviewing risky), code:text (Create the SupportPilot Analytics screen for AI support perf) (+15 more)

### Community 60 - "Community 60"
Cohesion: 0.09
Nodes (21): 10. Integrations, 11. Analytics / performance metrics, 12. Pricing, 13. Testimonials, 14. FAQ, 14 — SupportPilot Landing Page IA and Copy, 15. Final CTA, 16. Footer (+13 more)

### Community 61 - "Community 61"
Cohesion: 0.16
Nodes (9): DomainForm(), KnowledgeUploader(), WorkspaceSettingsForm(), metadata, SettingsPage(), Button(), ButtonProps, CopyButton() (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.18
Nodes (8): AdminPage(), listAgents(), listTickets(), TicketList(), TicketListProps, metadata, SearchParams, TicketsPage()

### Community 63 - "Community 63"
Cohesion: 0.18
Nodes (6): AnalyticsPage(), metadata, calculateMetrics(), getDashboardMetrics(), listModelRouteLogs(), GET()

### Community 64 - "Community 64"
Cohesion: 0.18
Nodes (10): 13 — SupportPilot Design Direction Decision, code:css (--hero-gradient:), Console: restrained, dense, evidence-first, Executive decision, Final recommendation, Final visual language, Marketing site: vivid, premium, dashboard-forward, Palette decision: keep indigo-violet as the brand, add warm amber as a marketing accent (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (8): 17 — SupportPilot Feature Set Matrix, Capability matrix, Enterprise feature set, Feature strategy, Launch / Pro minimum feature set, Model + stack tie-in, Status legend, What not to build yet

### Community 66 - "Community 66"
Cohesion: 0.32
Nodes (6): AnalyticsStore, ConversationLog, FeedbackLog, getStatsSnapshot(), globalForAnalytics, GET()

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (3): 15 — ChatGPT Landing Build Prompt, code:text (You are a senior front-end designer and engineer. Build a co), Source notes for the prompt

## Knowledge Gaps
- **454 isolated node(s):** `config`, `STAFF_ROLES`, `config`, `SupportPilotTheme`, `nextConfig` (+449 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 35`, `Community 4`, `Community 5`, `Community 25`, `Community 61`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Citation` connect `Community 4` to `Community 66`, `Community 23`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `createSupabaseAdminClient()` connect `Community 23` to `Community 3`, `Community 7`, `Community 25`, `Community 26`, `Community 63`, `Community 62`, `Community 31`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `config`, `STAFF_ROLES`, `config` to the rest of the system?**
  _454 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._