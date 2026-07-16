# Evaluations

SupportPilot evaluations are designed around grounded enterprise support behavior, not generic chat quality.

## Automated Checks

Run:

```bash
npm run test:enterprise
```

The script verifies:

- 5 customers
- 1 organization and 1 workspace
- at least 4 workspace memberships
- at least 3 verified domains
- widget config
- 20 tickets
- 10 knowledge articles
- at least 5 policy docs
- at least 10 chunks
- 5 escalated tickets
- 10 AI draft replies
- audit logs
- escalation rules
- approval policies
- usage events
- launch checklist and golden questions
- model route logs
- security events
- grounding checks and policy evaluations
- tenant/workspace fields on tenant-owned demo rows
- chunk embedding metadata
- risky drafts routed to review

Run:

```bash
npm run test:evals
```

The golden-question smoke test runs the seeded demo workspace questions through deterministic retrieval, confidence, grounding, and policy checks. It writes `artifacts/golden-eval-summary.json` with per-question source hits, retrieval score, confidence, grounding status, policy action, and pass/fail state. CI uploads this file as release evidence.

For deployed workspaces, `POST /api/evals/golden/run` is the scheduled evaluation worker. Call it with `x-supportpilot-eval-secret` when `SUPPORTPILOT_EVAL_WORKER_SECRET` is configured. The worker can run all workspaces or a single `workspaceId`, updates each golden question's latest score/pass flag, writes a `golden_eval_runs` evidence row with an artifact hash, and appends an audit log named `eval.golden_questions.completed`.

## Manual Evaluation Matrix

| Eval | Passing behavior |
| --- | --- |
| Groundedness | Draft answer uses only retrieved approved chunks and refuses or escalates when context is missing. |
| Citation quality | Each draft cites source labels returned by RAG and visible in the ticket side panel. |
| Escalation correctness | Low confidence, angry sentiment, legal/policy, billing/refund, and sensitive-data cases require review. |
| Human approval | AI drafts do not create customer messages until approved or edited by staff. |
| Acceptance rate | `/admin/analytics` reflects approved and edited AI runs as accepted. |
| Missing topics | Low-confidence runs appear as missing-topic candidates. |
| Model routing | R2 handles easy cited answers; R4/R5 handle low-confidence, refund, legal, security, and critical cases. |
| Prompt privacy | AI runs store redacted previews and prompt hashes rather than raw private content. |
| Grounding verifier | Drafts with missing citations or low source coverage are marked `needs_review` or `fail`. |
| Workspace scoping | Widget config, chat logging, knowledge retrieval, and analytics resolve the active workspace key. |
| Origin gating | Unverified widget origins receive a 403 from widget config and chat APIs. |
| Widget sessions | When `SUPPORTPILOT_WIDGET_SESSION_SECRET` is configured, unsigned or invalid widget sessions receive a 403. |
| Scheduled evals | Worker-secret golden eval runs persist pass/fail summaries and audit evidence before launch gates are trusted. |
| Responsive UI | `/admin/tickets`, ticket detail, knowledge, approvals, analytics, and `/portal` fit desktop and mobile widths. |

## Suggested Live Supabase Test

1. Apply migrations to a clean Supabase project.
2. Run `supabase/seed.sql`.
3. Sign in as `ava@acmedesk.example`, `lena@acmedesk.example`, and `admin@acmedesk.example` using the seed password.
4. Draft normal, refund, billing, legal, angry, and low-confidence tickets.
5. Approve, edit, reject, and escalate drafts.
6. Open `/admin/settings`, add a verified domain, and confirm the widget snippet includes the workspace key.
7. Confirm `ai_runs`, `ticket_messages`, `audit_logs`, and `usage_events` changed as expected.
