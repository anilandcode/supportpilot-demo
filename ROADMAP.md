# Roadmap

## Production Hardening

- Add background ingestion jobs for large PDFs and site crawls.
- Replace deterministic demo embeddings with provider embeddings for production.
- Add scheduled eval runs for groundedness, citations, escalation correctness, and response latency.
- Add row-level automated tests against a Supabase branch database.
- Add deployment health checks for `/api/stats`, `/api/chat`, and draft/decision routes.

## Multi-Tenant Support

- Add `organizations` and `memberships`.
- Scope customers, tickets, docs, chunks, AI runs, feedback, audit logs, and rules by organization.
- Add organization-level provider settings and model policies.
- Add custom domains and per-client widget keys.

## Helpdesk Integrations

- Zendesk and Intercom ticket sync.
- Slack escalation notifications.
- HubSpot or Salesforce customer metadata sync.
- Email sending after approved messages.

## Governance

- Manager approval SLAs.
- Immutable audit export.
- DPA/SOC 2 evidence bundle links.
- Sensitive-data redaction before model calls.
- Admin-configurable escalation thresholds.
