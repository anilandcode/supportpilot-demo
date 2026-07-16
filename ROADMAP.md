# Roadmap

## Production Hardening

- Add site-crawl ingestion jobs after the current upload/PDF background ingestion baseline.
- Replace deterministic demo embeddings with provider embeddings for production.
- Add scheduled eval runs for groundedness, citations, escalation correctness, and response latency.
- Add row-level automated tests against a Supabase branch database.
- Add deployment health checks for `/api/stats`, `/api/chat`, and draft/decision routes.
- Add WORM/retention-lock policy rehearsal for private knowledge-source and audit-evidence Storage buckets.
- Add rate-limit persistence by workspace instead of in-memory demo limits.

## Multi-Tenant Support

- Add workspace creation and invite flows beyond the seeded demo workspace.
- Add tenant-scoped billing and plan enforcement.
- Add organization-level provider settings and model policies.
- Add custom domain verification automation rather than manual verified-domain rows.

## Helpdesk Integrations

- Zendesk and Intercom ticket sync.
- Slack escalation notifications.
- HubSpot or Salesforce customer metadata sync.
- Send approved replies through connected email/helpdesk channels.

## Governance

- Manager approval SLAs.
- Immutable audit export.
- DPA/SOC 2 evidence bundle links.
- Sensitive-data redaction before model calls.
- Admin-configurable escalation thresholds.
