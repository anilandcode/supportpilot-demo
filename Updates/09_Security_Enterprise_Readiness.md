# 09 — SupportPilot Security and Enterprise Readiness

> Built to deepen the existing SupportPilot 00–06 research set; this document intentionally focuses on design, workflow, security, agentic architecture, and small-model cost strategy rather than repeating the earlier market overview.

## 1. Security posture

SupportPilot’s enterprise story should be “tenant-isolated, source-grounded, approval-governed AI support.” Supabase states that Row Level Security is the right tool for granular authorization rules and should be enabled on exposed schemas, and that RLS can combine with Supabase Auth for end-to-end user security from browser to database ([Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)). OWASP’s 2025 GenAI Top 10 covers LLM and generative-AI risks across development, deployment, and management, including prompt injection and improper output handling ([OWASP GenAI Top 10](https://genai.owasp.org/llm-top-10/)). NIST’s AI RMF is a voluntary framework for managing AI risks to individuals, organizations, and society, and NIST AI 600-1 applies the framework specifically to generative AI ([NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework), [NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

## 2. Multi-tenant isolation

| Control | Enterprise target | Free-tier-friendly implementation |
|---|---|---|
| Tenant IDs everywhere | Every row belongs to `org_id` and usually `workspace_id`. | Add non-null `org_id` / `workspace_id` foreign keys and composite indexes. |
| Postgres RLS | Database denies cross-tenant reads/writes even if API code is wrong. | Enable RLS on all exposed tables and write policies using `auth.uid()` and membership joins, following Supabase RLS guidance ([Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)). |
| Service-role isolation | Server-only keys never reach browser or widget. | Keep service role in Vercel/Supabase secrets; widget uses signed public session token. |
| Workspace-aware RAG | Retrieval filters by workspace and allowed source origins. | Add `workspace_id`, `source_version_id`, and `embedding_model` columns to chunks. |
| Object storage | Docs and exports are private by default. | Store files under `org_id/workspace_id/source_id`; issue short-lived signed URLs. |
| Tenant test suite | Prevent regressions. | Add tests that attempt cross-org reads for tickets, messages, chunks, approvals, settings. |

### RLS policy sketch

```sql
alter table tickets enable row level security;

create policy "members can read workspace tickets"
on tickets for select
using (
  exists (
    select 1 from memberships m
    where m.user_id = auth.uid()
      and m.org_id = tickets.org_id
      and m.workspace_id = tickets.workspace_id
  )
);
```

## 3. RBAC model

| Role | Permissions |
|---|---|
| Owner | Billing, delete workspace, security settings, SSO, all approvals, all data exports. |
| Admin | Workspace settings, knowledge, members except owner changes, integrations, policies. |
| Manager | Tickets, approvals, analytics, policy suggestions, audit read. |
| Agent | Tickets, conversations, drafts, internal notes, low-risk replies. |
| Analyst | Analytics and reports only. |
| Viewer | Read-only docs/tickets where allowed. |

Implement RBAC at three layers: UI gating, API authorization, and RLS policies. UI gating improves usability, API checks prevent direct-route abuse, and RLS acts as database-level defense in depth.

## 4. Audit logging

| Event category | Examples | Required fields |
|---|---|---|
| Auth | login, logout, failed login, SSO change | actor, IP, user agent, org, timestamp. |
| Access | ticket read, export created, API key used | actor, resource, purpose, request ID. |
| Admin | policy changed, domain verified, member invited | before/after JSON, actor, timestamp. |
| AI | answer generated, model route, retrieval, confidence | model, prompt hash, source IDs, latency, cost. |
| Approval | draft queued, approved, edited, rejected | reviewer, original, final, risk reason, citations. |
| Security | origin blocked, rate limit hit, prompt-injection flag | severity, IP, domain, mitigation. |

Use append-only logs for security-sensitive events. For the Light MVP, keep audit logs in Postgres with RLS and export CSV; for Enterprise, add immutable storage, retention controls, and periodic access reviews.

## 5. PII handling and prompt/log hygiene

| Risk | Control | Implementation |
|---|---|---|
| PII in prompts | Minimize and redact before model calls. | Add regex + small-model PII classifier for emails, phones, tokens, addresses, IDs. |
| PII in logs | Avoid raw prompt logging by default. | Store prompt hash, message IDs, risk category, and redacted preview. |
| PII in analytics | Prevent support content from leaking to product analytics. | Send metadata events to PostHog, not raw messages. |
| PII in evals | Use synthetic or redacted conversations. | Add anonymization job before exporting eval datasets. |
| PII in provider APIs | Route sensitive tenants to self-hosted/local or approved providers. | Per-tenant model route policy and DPA/subprocessor disclosure. |

## 6. Secrets management

| Secret | Rule |
|---|---|
| Supabase service key | Server-only; never exposed to widget or client bundle. |
| Model provider keys | Stored in hosting secret manager; rotate quarterly or after incident. |
| Integration OAuth tokens | Encrypt at rest; scope minimally; store refresh metadata. |
| Widget signing key | Per workspace or per org; rotate without breaking active sessions. |
| Webhook secrets | Use HMAC signatures and replay windows. |

## 7. Widget and origin security

| Threat | Control |
|---|---|
| Unauthorized embed | Domain verification plus origin allowlist. |
| Origin spoofing | Validate `Origin` and `Referer` server-side; issue signed widget sessions. |
| Abuse / bot traffic | Per-domain, per-IP, per-session rate limits; proof-of-work or CAPTCHA fallback for abuse. |
| Tenant data leakage | Widget token includes workspace only; every API route checks workspace/domain. |
| XSS in responses | Render Markdown through a sanitizer; no raw HTML in AI output. |
| Clickjacking / frame issues | Widget runs in controlled iframe; parent communication uses strict `postMessage` origin checks. |
| Supply-chain widget risk | Version the widget loader and support rollback. |

## 8. RAG and prompt-injection defense

OWASP identifies prompt injection as a core LLM application risk, so SupportPilot should treat every retrieved document and user message as untrusted content ([OWASP GenAI Top 10](https://genai.owasp.org/llm-top-10/)).

| Layer | Defense |
|---|---|
| Ingestion | Strip scripts/HTML, preserve provenance, classify docs by trust level. |
| Retrieval | Filter by tenant, source status, source trust, and freshness. |
| Prompt | Separate system instructions, user input, and retrieved content; mark retrieved content as untrusted evidence. |
| Model output | Require citations for factual claims; refuse if citations are missing. |
| Tool calls | Tools cannot be called from retrieved text instructions; only app-defined policy enables tools. |
| Post-check | Run grounding check: answer claims must map to retrieved chunks. |
| Monitoring | Log injection signals and add source quarantine workflow. |

## 9. Data retention and residency

| Capability | Light | Enterprise |
|---|---|---|
| Retention | Workspace-level default: keep conversations 180 days, logs 365 days. | Per-tenant retention schedules and legal hold. |
| Deletion | Manual delete workspace/export. | GDPR deletion workflow with audit record. |
| Residency | Single region disclosure. | Region-specific Supabase/Neon projects or dedicated deployment. |
| Backups | Provider default backups. | Documented backup windows, restore tests, and customer commitments. |
| Exports | CSV/JSON admin export. | Signed, audited exports with requester approval. |

## 10. SSO/SAML and enterprise auth

SSO should be an Enterprise feature because larger buyers expect centralized identity and access lifecycle. Start with Clerk/Supabase/Auth.js for Light, then add SAML/OIDC SSO, SCIM provisioning, domain capture, enforced SSO by verified domain, and emergency owner bypass for Enterprise. Sentry’s pricing page illustrates that SAML and SCIM commonly sit in business/enterprise tiers for developer tooling ([Sentry pricing](https://sentry.io/pricing/)), while Clerk advertises B2B authentication and administration capabilities as part of its plans ([Clerk pricing](https://clerk.com/pricing)).

## 11. SOC 2 Type II readiness checklist

AICPA describes SOC 2 as reporting on controls relevant to security, availability, processing integrity, confidentiality, or privacy ([AICPA SOC suite](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2)).

| Trust area | Readiness evidence | Free/low-cost path |
|---|---|---|
| Security | Access controls, RLS tests, MFA, secrets policy, vulnerability process. | GitHub branch protection, Sentry, Supabase logs, quarterly access review spreadsheet. |
| Availability | Uptime monitoring, incident runbook, backups, status page. | Free uptime monitor + manual incident log. |
| Confidentiality | Data classification, encryption, least privilege, private storage. | Supabase/Postgres encryption by provider, RLS, private buckets. |
| Processing integrity | Tests for RAG, approvals, billing usage, ticket state transitions. | CI test suite and migration checks. |
| Privacy | Privacy policy, DPA, deletion/export process, subprocessor page. | Static legal pages plus admin export/delete workflows. |
| Change management | PR reviews, CI, migrations, deployment approvals. | GitHub required checks and release checklist. |
| Vendor management | Subprocessor list and risk notes. | Maintain `security/subprocessors.md`. |
| Incident response | Severity matrix, notification template, postmortem format. | Repo runbook and private incident log. |

## 12. GDPR and EU AI Act considerations

The EU AI Act is described by the European Commission as the first comprehensive AI legal framework and uses a risk-based approach ([European Commission AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)). For SupportPilot, the default customer-support bot is likely closer to a transparency/governance product than a prohibited or high-risk system, but the risk profile can change if tenants use it for regulated decisions, employment, credit, healthcare, or legal advice.

| Requirement area | Product response |
|---|---|
| AI disclosure | Widget clearly says “AI support assistant” and identifies when a human joins. |
| Human oversight | Approval queue for high-risk and low-confidence drafts. |
| Data minimization | Redact PII before prompts and logs; avoid raw analytics content. |
| Access/export/delete | Admin export and deletion workflows by user/conversation. |
| Lawful basis | Customer config records what data is processed and why. |
| Processor terms | DPA and subprocessor page for customer contracts. |
| High-risk tenant use | Contractually restrict unsupported regulated decisions or require enterprise controls. |

## 13. Security roadmap

| Phase | Deliverables |
|---|---|
| 0–2 weeks | RLS tests, semantic audit logs, origin allowlist hardening, redacted model logs, badge for verified domain. |
| 2–6 weeks | RBAC matrix, API key scopes, policy-change audit diffs, retention settings, widget rate limits. |
| 6–12 weeks | SSO/OIDC/SAML, SCIM planning, export/delete workflows, security questionnaire packet. |
| 12+ weeks | SOC 2 readiness evidence, data residency architecture, customer-managed keys exploration, annual pen test. |
