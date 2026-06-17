# Graph Report - chatbot-demo  (2026-06-17)

## Corpus Check
- 59 files · ~12,939 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 250 nodes · 365 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99cb5b3d`
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 25 edges
2. `POST()` - 14 edges
3. `Client Setup Runbook` - 9 edges
4. `BrandAvatar()` - 7 edges
5. `SupportPilot` - 7 edges
6. `Citation` - 6 edges
7. `Integrations` - 6 edges
8. `Billing and Account Management` - 6 edges
9. `Product Features` - 6 edges
10. `Security and Privacy` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AdminPage()` --calls--> `getStatsSnapshot()`  [EXTRACTED]
  app/admin/page.tsx → lib/analytics.ts
- `GET()` --calls--> `getStatsSnapshot()`  [EXTRACTED]
  app/api/stats/route.ts → lib/analytics.ts
- `Avatar()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts
- `AvatarImage()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts
- `AvatarFallback()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts

## Communities (23 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (21): EscalationButton(), EscalationButtonProps, Feedback(), FeedbackProps, cn(), Avatar(), AvatarBadge(), AvatarFallback() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (13): metadata, RootLayout(), SuggestedQuestionsProps, SupportPilotTheme, LINKS, Footer(), LINKS, Nav() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (21): assistantResponse(), containsSensitiveData(), getClientKey(), getTextContent(), localAnswer(), POST(), SupportUIMessage, toCitations() (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (12): BrandAvatar(), BrandAvatarProps, ChatWindow(), ChatWindowProps, transport, Composer(), ComposerProps, WelcomeCard() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (15): Citations(), CitationsProps, MarkdownMessage(), MarkdownMessageProps, renderInline(), MessageList(), MessageListProps, Message() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (14): AdminPage(), CONVERSATIONS, KNOWLEDGE_FILES, metadata, Status, STATUS_CONFIG, POST(), AnalyticsStore (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): 1. Clone and install, 2. Configure the client, 3. Add knowledge, 4. Add environment variables, 5. Verify locally, 6. Deploy, 7. Install the widget, Client Setup Runbook (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (10): DEFAULT_KNOWLEDGE_FILES, KnowledgeFile, EnterpriseRetriever, getKnowledgeFiles(), KNOWLEDGE_DIR, LiteRetriever, readKnowledgeFiles(), Retriever (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (11): code:bash (npm install), code:html (<script async src="https://your-domain.example/widget.js" da), code:html (<iframe src="https://your-domain.example/embed" width="400" ), code:bash (npm run typecheck), Configure a Client, Embed, Enterprise Boundary, Run Locally (+3 more)

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
Cohesion: 0.33
Nodes (5): code:sql (create extension if not exists vector;), Current implementation status, Enterprise Ingestion Path, Suggested table, Target pipeline

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): Business, Enterprise, Free, Pricing Plans, Pro

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (4): ask(), QUESTIONS, run(), UIMessagePart

## Knowledge Gaps
- **92 isolated node(s):** `config`, `SupportPilotTheme`, `nextConfig`, `metadata`, `metadata` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `Citation` connect `Community 4` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `BrandAvatar()` connect `Community 3` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `config`, `SupportPilotTheme`, `nextConfig` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._