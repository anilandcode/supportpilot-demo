# 17 — SupportPilot Feature Set Matrix

## Feature strategy

SupportPilot should ship a **client-ready Light/Launch version** first, then build into **Pro** and **Advanced/Enterprise** without changing the core product thesis. The thesis is: **white-label AI support with cited answers, confidence scoring, approval workflows, human handoff, analytics, and cost-aware model routing**.

The model strategy should use routing rather than one universal model: local or small models handle classification, PII redaction, query rewriting, reranking, and easy grounded answers, while Gemini/Groq/OpenRouter or premium models handle ambiguous and high-risk tickets. Gemini documents rate limits by requests per minute, tokens per minute, and requests per day, with active limits visible in AI Studio, so SupportPilot should instrument route, latency, tokens, confidence, and fallback from day one ([Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)). Vercel AI SDK is a strong fit for the existing Next.js stack because it supports model/provider integration, tool calling, structured outputs, and streaming UI patterns ([Vercel AI SDK](https://vercel.com/docs/ai-sdk)).

## Status legend

| Status | Meaning |
|---|---|
| **Current build** | Already implemented or strongly implied by the current SupportPilot MVP recap. |
| **Add for Launch / Pro** | Needed to make SupportPilot client-ready for small/medium customers. |
| **Add for Enterprise** | Needed for regulated, high-volume, or procurement-heavy customers. |

## Capability matrix

| Capability area | Feature | Why it matters | Tier | Status | Implementation note |
|---|---|---|---|---|---|
| **RAG quality** | Workspace-scoped RAG over customer docs | Core product value: answer from tenant knowledge. | Launch | Current build | Keep `tenant_id`/`workspace_id` enforced on every retrieval path. |
| RAG quality | Chunk-level citations | Builds user/admin trust and reduces hallucination risk. | Launch | Current build | Show source title, excerpt, URL/file, version, freshness. |
| RAG quality | Multi-source ingestion: pasted FAQ, Markdown/TXT | Fastest path to live customer pilots. | Launch | Current build / Add for Launch | Support pasted docs and Markdown first. |
| RAG quality | PDF/DOCX extraction with QA preview | Needed for real enterprise docs. | Pro | Add for Launch / Pro | Add extraction preview before indexing to catch bad parses. |
| RAG quality | Notion/help-center/URL imports | Makes onboarding easier for SaaS customers. | Pro | Add for Launch / Pro | Start manual URL/import; scheduled sync later. |
| RAG quality | Source versioning and freshness score | Prevents stale policy answers. | Pro | Add for Launch / Pro | Store `source_version`, `last_indexed_at`, `freshness_state`. |
| RAG quality | Hybrid search + reranking | Improves answer quality for large corpora. | Enterprise | Add for Enterprise | Use Postgres FTS + pgvector + reranker. |
| RAG quality | Golden-question evals per tenant | Measures faithfulness before/after changes. | Pro/Enterprise | Add for Launch / Pro | Add test set with expected sources and acceptable answer rubric. |
| RAG quality | Missing-knowledge clustering | Turns failed answers into doc backlog. | Pro | Add for Launch / Pro | Cluster low-confidence/escalated tickets by intent. |
| **Agentic actions** | Tool registry with schemas | Foundation for safe actions. | Pro | Add for Launch / Pro | Store tool name, schema, risk class, scopes, tenant availability. |
| Agentic actions | Read-only tools | Useful and lower risk. | Pro | Add for Launch / Pro | Examples: lookup ticket/order/subscription status after identity check. |
| Agentic actions | Create ticket / tag conversation | Safe write actions. | Pro | Add for Launch / Pro | Use idempotency keys and audit logs. |
| Agentic actions | Approval-gated write actions | Enterprise-grade automation without unsafe autonomy. | Enterprise | Add for Enterprise | Refund drafts, billing changes, CRM updates, helpdesk writeback. |
| Agentic actions | Policy engine outside the model | Prevents the model from granting itself permissions. | Pro/Enterprise | Add for Launch / Pro | Deterministic app code evaluates risk, allowed tools, approver role. |
| Agentic actions | Grounding verifier | Checks that claims are supported by sources. | Pro/Enterprise | Add for Enterprise | Use citation coverage and source agreement signals. |
| **Confidence + approvals** | Confidence score | Determines auto-answer vs review. | Launch | Current build / Add polish | Combine retrieval strength, citation coverage, freshness, risk, model route. |
| Confidence + approvals | Approval queue | Core differentiator for enterprise trust. | Launch | Current build | Redesign as risk-centered review workspace. |
| Confidence + approvals | Approval policies by risk category | Lets teams configure autonomy. | Pro | Current build / Add polish | Refunds, billing, SSO, privacy, legal, data residency default to review. |
| Confidence + approvals | Edit/approve/reject/escalate actions | Makes the queue operational. | Launch | Current build / Add polish | Every decision creates an audit event. |
| Confidence + approvals | SLA and reviewer assignment | Needed for support operations. | Pro | Add for Launch / Pro | Queue by risk, team, priority, and SLA. |
| Confidence + approvals | Batch approve safe drafts | Reduces manager workload. | Enterprise | Add for Enterprise | Only for same policy class and high confidence. |
| **Human handoff** | Email escalation | Minimum viable handoff. | Launch | Current build / Add polish | Include transcript, sources, confidence, and customer metadata. |
| Human handoff | Slack notification/escalation | Common support-team workflow. | Pro | Add for Launch / Pro | Post to channel with approve/reject link. |
| Human handoff | Calendly handoff | Useful for onboarding/SSO/security calls. | Pro | Add for Launch / Pro | Start with link; later use API/webhook. |
| Human handoff | Zendesk/Gorgias/Intercom writeback | Required for teams with existing helpdesks. | Enterprise | Add for Enterprise | Start create-ticket; later sync status/comments. |
| Human handoff | Human agent takeover | Expected in serious support. | Enterprise | Add for Enterprise | Show user when human joined; preserve transcript. |
| **White-label branding** | Workspace/widget brand config | Core product promise. | Launch | Current build | Logo, color, bot name, welcome text, position. |
| White-label branding | Theme tokens + contrast validation | Prevents inaccessible customer themes. | Launch | Add for Launch / Pro | Validate primary button, focus ring, widget header text. |
| White-label branding | Live widget preview | Makes setup easier. | Launch | Add for Launch / Pro | Show desktop/mobile preview in settings. |
| White-label branding | Custom domain / verified domains | Enterprise trust and abuse prevention. | Launch/Pro | Current build | Enforce origin/domain allowlist. |
| White-label branding | Per-client agency workspaces | Strong white-label agency feature. | Pro | Current build / Add polish | Workspace switcher and isolated configs. |
| **Multi-tenancy + RBAC** | Orgs/workspaces/memberships | Foundation for SaaS. | Launch | Current build | Ensure RLS tests. |
| Multi-tenancy + RBAC | Roles: owner/admin/manager/agent/viewer | Needed for approvals and settings safety. | Pro | Current build / Add polish | Managers approve; agents handle tickets; viewers audit. |
| Multi-tenancy + RBAC | Domain verification and widget configs | Prevents widget abuse. | Launch | Current build | Signed widget config endpoint. |
| Multi-tenancy + RBAC | Custom roles | Procurement/enterprise requirement. | Enterprise | Add for Enterprise | Scopes for sources, approvals, security, billing. |
| Multi-tenancy + RBAC | SCIM provisioning | Enterprise identity lifecycle. | Enterprise | Add for Enterprise | Add after SAML. |
| **Analytics** | Overview KPI cards | Gives operators confidence. | Launch | Current build | Deflection, acceptance, escalated, cost/conversation. |
| Analytics | Ticket/approval analytics | Improves review process. | Pro | Add for Launch / Pro | Approval backlog, edit rate, SLA, risk category. |
| Analytics | RAG quality metrics | Drives knowledge cleanup. | Pro | Add for Launch / Pro | Citation missing rate, low-confidence clusters, source freshness. |
| Analytics | Model cost metrics | Critical for small-model strategy. | Pro | Add for Launch / Pro | Cost per conversation, route mix, fallback rate. |
| Analytics | Customer-facing report export | Useful for agencies and enterprise QBRs. | Enterprise | Add for Enterprise | PDF/CSV export by workspace/client. |
| **Security** | Row-level tenant isolation | Must-have for multi-tenant SaaS. | Launch | Current build / Verify | Add automated RLS regression tests. |
| Security | Audit logs | Required for approvals and enterprise trust. | Launch/Pro | Current build / Add polish | Log policy changes, approvals, source changes, model routes, tool calls. |
| Security | PII redaction | Protects prompts/logs. | Pro | Add for Launch / Pro | Local small model or deterministic recognizers before analytics. |
| Security | SSO/SAML | Enterprise requirement. | Enterprise | Add for Enterprise | Offer on Enterprise plan. |
| Security | Data retention controls | Procurement requirement. | Enterprise | Add for Enterprise | Tenant-configurable retention/deletion. |
| Security | Data residency option | Regulated/global enterprise requirement. | Enterprise | Add for Enterprise | Region-specific DB/provider routing. |
| Security | SOC 2 readiness package | Required before formal compliance claims. | Enterprise | Add for Enterprise | Evidence exports, access reviews, incident process, vendor list. |
| **Widget** | Embeddable script/iframe | Core delivery channel. | Launch | Current build | Ensure works on Webflow, WordPress, Shopify, Squarespace, Next.js. |
| Widget | Cited answer UI | Differentiates from chatbots. | Launch | Add polish | Source chips + accordion + freshness. |
| Widget | Approval pending state | Avoids misleading users. | Launch | Add for Launch / Pro | “This needs review before we send a final answer.” |
| Widget | Escalation CTA | Completes support loop. | Launch | Add for Launch / Pro | Email ticket, Slack/internal, Calendly. |
| Widget | Authenticated user context | Useful for account-specific support. | Enterprise | Add for Enterprise | JWT/session handoff and identity verification. |
| Widget | Rate limits and abuse controls | Protects cost and tenant sites. | Launch | Add for Launch / Pro | Per domain/session/IP. |
| **Billing** | Stripe subscriptions | Monetization foundation. | Launch | Add for Launch / Pro | Launch/Pro/Enterprise plans and limits. |
| Billing | Usage events | Needed for plans and analytics. | Launch | Current build | Track conversations, AI replies, approvals, sources, seats. |
| Billing | Plan limits | Prevents free overuse. | Launch | Add for Launch / Pro | Workspaces, seats, conversations, sources, model fallback. |
| Billing | Enterprise contracts | Procurement path. | Enterprise | Add for Enterprise | Manual invoicing/Stripe customer portal plus MSA/DPA. |
| **Integrations** | Email/Resend | Minimum escalation. | Launch | Current build / Add polish | Include transcript and source references. |
| Integrations | Slack | Common operations. | Pro | Add for Launch / Pro | Notify, approve/reject deep links. |
| Integrations | Calendly | Handoff for calls. | Pro | Add for Launch / Pro | Link first, API later. |
| Integrations | Webhooks/API keys | Developer-friendly. | Pro | Add for Launch / Pro | Scoped keys and event signatures. |
| Integrations | Zendesk/Intercom/Gorgias | Enterprise/helpdesk fit. | Enterprise | Add for Enterprise | OAuth, retries, health, writeback. |
| Integrations | Stripe/CRM actions | Agentic business workflows. | Enterprise | Add for Enterprise | Approval-gated, idempotent, audited. |
| **Onboarding** | Live-in-24h checklist | Makes sales promise credible. | Launch | Current build / Add polish | Domain, docs, branding, escalation, approvals, test widget. |
| Onboarding | Demo workspace/sample data | Helps prospects understand product. | Launch | Add for Launch / Pro | Seed realistic tickets/approvals/sources. |
| Onboarding | Golden question test suite | Prevents poor go-live quality. | Pro | Add for Launch / Pro | Customer supplies 20–50 known questions. |
| Onboarding | Dedicated onboarding package | Enterprise revenue lever. | Enterprise | Add for Enterprise | Security review, integration mapping, policy design, evals. |

## Launch / Pro minimum feature set

Ship these before selling beyond demos:

1. **Premium landing page** with hero dashboard + widget visual, pricing, security, demo section, and FAQ.
2. **Admin badge/token polish** so status, priority, risk, and confidence states look enterprise-ready.
3. **Approval queue redesign** with draft, confidence meter, risk reason, source cards, and approve/edit/reject/escalate actions.
4. **Widget citations and approval-pending states** so users know when an answer is grounded or waiting for review.
5. **Knowledge source health** with source status, freshness, ingestion status, and missing-knowledge list.
6. **Model route logging** for provider, model, latency, tokens, confidence, cost estimate, and fallback reason.
7. **Deterministic risk router** for refunds, billing, SSO, security, privacy, legal, account deletion, data residency, and low-confidence answers.
8. **Email escalation + optional Slack/Calendly** with transcript and citations.
9. **Stripe plans and usage limits** for Launch and Pro.
10. **Security basics**: RLS tests, audit logs, domain allowlist, rate limits, PII-minimized analytics.

## Enterprise feature set

Add these after Launch/Pro traction:

1. SSO/SAML and later SCIM.
2. Custom roles and access reviews.
3. Audit exports and SOC 2 evidence package.
4. Data retention controls and data-residency options.
5. Advanced helpdesk writeback for Zendesk/Intercom/Gorgias.
6. Approval-gated tool actions for refunds, billing changes, CRM updates, ticket state changes, and scheduling.
7. Hybrid retrieval + local reranker + golden-question eval dashboard.
8. Per-tenant model/provider policy with small-model routes and strong-model fallbacks.
9. Customer-facing analytics exports and QBR reports.
10. Dedicated onboarding and security review workflow.

## Model + stack tie-in

| Route | Launch / Pro | Enterprise |
|---|---|---|
| Classification / risk / PII | Deterministic rules first; optional small local classifier. | Qwen3-0.6B, Phi-4-mini, or similar local helper. |
| Query rewrite | Gemini or deterministic rewrite templates. | Local small model with Gemini fallback. |
| Embeddings | Current Gemini/open embedding path. | Qwen3-Embedding-0.6B or bge-small; benchmark per corpus. |
| Reranking | Lexical/source score boosts. | Qwen3-Reranker-0.6B or bge-reranker. |
| Easy grounded answers | Gemini Flash/Flash-Lite. | Local 4B-class route for low-risk/high-confidence answers. |
| High-risk drafts | Strong model + mandatory approval. | Strong/premium route + policy approval + audit. |
| Tool calling | Vercel AI SDK tools with app-owned policy. | Durable orchestrator / LangGraph if workflows become long-running. |

## What not to build yet

- Do not build autonomous refunds or billing mutations for Launch.
- Do not promise SOC 2 compliance before formal controls and evidence exist.
- Do not rely on free AI quotas as a production guarantee.
- Do not hide confidence, missing sources, or approval reasons.
- Do not let tenant theme overrides break status colors or accessibility.
