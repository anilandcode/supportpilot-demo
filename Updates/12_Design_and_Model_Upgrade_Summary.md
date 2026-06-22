# 12 — SupportPilot Design and Model Upgrade Summary

> Built to deepen the existing SupportPilot 00–06 research set; this document intentionally focuses on design, workflow, security, agentic architecture, and small-model cost strategy rather than repeating the earlier market overview.

## Executive summary

SupportPilot should become enterprise-grade by pairing a premium public brand with a restrained, evidence-first console. The design foundation should be shadcn/ui, Radix, Tailwind, and CSS-variable tokens because shadcn/ui provides editable component code rather than a locked component package ([shadcn/ui docs](https://ui.shadcn.com/docs)), while Radix handles accessibility primitives such as ARIA, focus management, and keyboard navigation ([Radix accessibility docs](https://www.radix-ui.com/primitives/docs/overview/accessibility)).

The visual strategy should be dual-mode: the marketing site can use the user’s preferred indigo-violet/pink gradient, glass cards, conversational hero, and floating proof cards; the admin console should be calmer, denser, and closer to Linear/Vercel/Stripe patterns for dashboards, developer trust, and accessible forms ([Linear dashboards docs](https://linear.app/docs/dashboards), [Vercel Geist](https://vercel.com/geist/introduction), [Stripe Apps design docs](https://docs.stripe.com/stripe-apps/design)).

The model strategy should not chase a single “free model.” It should route work: local small models handle classification, PII redaction, query rewriting, reranking, and easy grounded answers; Gemini/Groq/OpenRouter or a premium model handles ambiguous and high-risk tickets. Gemini documents RPM/TPM/RPD rate-limit dimensions and active limits in AI Studio ([Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)), OpenRouter documents specific free-model request caps ([OpenRouter limits](https://openrouter.ai/docs/api-reference/limits)), and Cloudflare Workers AI documents a 10,000-Neuron daily free allocation ([Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).

## What changes first

| Priority | Change | Why it matters |
|---|---|---|
| P0 | Replace muddy admin pills with semantic status/priority/confidence tokens. | Fixes the most visible “unstyled” enterprise-design issue immediately. |
| P0 | Redesign landing hero around a conversational input, cited answer, approval card, and gradient mesh. | Makes the product look premium while demonstrating the real differentiated workflow. |
| P0 | Redesign approval queue cards with risk reason, confidence, sources, draft, and audit trail. | Turns an MVP feature into an enterprise trust feature. |
| P0 | Add setup checklist and workspace health strip. | Makes “live in 24h” credible and reduces first-run confusion. |
| P1 | Add source/citation drawer across tickets, approvals, and conversations. | Reinforces the grounded-answer contract. |
| P1 | Add model route logging and deterministic risk router. | Enables cost control and safe escalation before self-hosting. |
| P1 | Add local embedding/reranker experiment. | Improves RAG quality without relying on expensive generation. |
| P2 | Add local classifier and small-model answer route. | Starts moving high-volume low-risk tasks toward near-zero marginal cost. |
| P2 | Add SSO/RBAC/audit/retention readiness package. | Helps answer enterprise questionnaires. |

## Design roadmap mapped to existing MVP

| Existing MVP capability | Upgrade |
|---|---|
| Landing page | Premium gradient hero, conversational demo input, floating cited-answer and approval cards, polished pricing. |
| `/admin` dashboard | Console shell with sidebar/topbar, hierarchy, elevation, density, clear KPI cards, semantic badges. |
| Approval queue | Risk-driven review cards with confidence meter, source drawer, policy reason, edit/approve/reject/escalate. |
| Settings | Settings hub with Knowledge, Policies, Branding, Domains, Escalation, Members, Security, Billing. |
| Widget configs | Tokenized tenant theming with contrast validation and live preview. |
| PostHog events | Add route/cost/confidence/approval analytics. |
| Workspace-aware RAG | Add source health, source freshness, reranking, and golden-question evals. |

## Model roadmap mapped to Light and Advanced

| Tier | Recommended stack |
|---|---|
| Light | Keep Gemini Flash/Flash-Lite as default; add deterministic risk routing; use Gemini or open embeddings; no mandatory self-hosting; log model route, tokens, latency, confidence, and approvals. |
| Pro | Add local intent/risk/PII classifier; add bge-small or Qwen3-Embedding-0.6B experiment; fallback to Gemini for hard cases. |
| Advanced | Self-host Qwen3/Gemma/Phi small model for low-risk grounded answers; add Qwen3-Reranker-0.6B; use Gemini/Groq/OpenRouter fallback; reserve premium model for critical tickets. |
| Enterprise | Per-tenant model policy, data-residency-aware routing, SSO/RBAC/audit exports, approval-gated actions, and optional dedicated deployment. |

## Security roadmap in one view

| Area | Immediate | Enterprise |
|---|---|---|
| Multi-tenancy | Enforce RLS tests on every exposed table. | Dedicated region/project for data-residency tenants. |
| RBAC | Owner/admin/manager/agent/viewer roles. | Custom roles and SCIM provisioning. |
| Audit | Log policy changes, approvals, model routes, tool calls. | Immutable exportable audit evidence. |
| PII | Redact prompts/logs and avoid raw analytics. | Tenant-level provider restrictions and deletion workflows. |
| Widget | Domain verification, origin allowlist, signed sessions, rate limits. | WAF, abuse rules, customer-specific keys. |
| AI security | Prompt-injection filters, grounding checks, tool policy. | Formal evals and SOC 2 evidence. |
| Compliance | Privacy policy, DPA, subprocessor page. | SOC 2 Type II readiness and EU AI Act transparency controls. |

## 30-day quick-win plan

1. Tokenize colors, typography, shadows, radii, and status badges.
2. Replace all admin badges with the new semantic badge system.
3. Build the improved admin shell and KPI card/table primitives.
4. Redesign the landing hero and pricing section using the premium gradient system.
5. Redesign approval queue cards and ticket drawer source panels.
6. Add setup checklist and workspace health indicators.
7. Add model route/cost/confidence logging.
8. Add local embedding or reranker proof-of-concept on the demo corpus.
9. Add deterministic policy router for refund, SSO, billing, data residency, deletion, and low-confidence answers.
10. Add RLS/security regression tests and an audit-log viewer.

## Final product thesis

SupportPilot’s enterprise edge is not simply “AI support chatbot.” It is a white-label support agent that can answer from trusted sources, show citations, take safe actions, queue risky drafts for approval, and control cost through small-model routing. The design system should make that thesis visible: premium enough to sell, restrained enough to trust, and operationally clear enough for managers to use every day.
