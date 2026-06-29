# RLS Verification

SupportPilot now has two RLS verification layers:

1. `npm run test:rls` is the local static migration gate. It proves the required tenant tables, helper functions, RLS enables, and policy evidence are present in `supabase/migrations`.
2. A clean Supabase project rehearsal is still required before production. It proves the policies work with real JWT-authenticated requests and not only by SQL inspection.

## Local Static Gate

Run:

```bash
npm run test:rls
```

The gate checks:

- all tenant tables have `alter table ... enable row level security`;
- helper functions exist: `can_access_workspace`, `can_manage_workspace`, `has_workspace_role`, `is_org_owner`, `is_customer_for_workspace`;
- customer-owned ticket/message policies are present;
- membership access requires `status = 'active'`;
- invitation policies are owner/admin gated;
- portal identities are unique by workspace/user and workspace/email;
- the role matrix from `lib/auth/rls-matrix.ts` has policy evidence in migrations.

## Clean Supabase Rehearsal

Use a new staging project, not the production project.

1. Apply migrations from zero:

```bash
supabase db push
```

2. Create auth users:

- `owner_a@supportpilot.test`
- `admin_a@supportpilot.test`
- `manager_a@supportpilot.test`
- `agent_a@supportpilot.test`
- `customer_a@supportpilot.test`
- `agent_b@supportpilot.test`
- `customer_b@supportpilot.test`

3. Create two organizations and two workspaces.

4. Add memberships:

- owner/admin/manager/agent in Workspace A;
- agent in Workspace B;
- one disabled membership in Workspace A.

5. Add portal identities:

- customer A in Workspace A;
- customer B in Workspace B.

6. Seed at least one ticket, message, source, approval, audit log, and onboarding row in each workspace.

7. Run the role matrix:

| Actor | Expected allow | Expected deny |
| --- | --- | --- |
| Anonymous | Public landing and verified widget config only | Tenant tables, admin APIs, portal account data |
| Customer A | Own customer row, own tickets, own customer messages | Customer B data, sources, approvals, billing, other orgs |
| Agent A | Workspace A tickets/messages/drafts | Workspace B, manager approvals, settings, billing |
| Manager A | Workspace A tickets, approvals, analytics | Billing/security/owner-only settings, Workspace B |
| Admin A | Workspace A settings, sources, policies, non-owner members | Owner transfer/delete, Workspace B |
| Owner A | Workspace/org admin, billing, audit export | Workspace/org B |
| Disabled user | No workspace data | All tenant tables |

8. Save the output as a release artifact named `rls-verification-YYYY-MM-DD.md`.

## Production Gate

Do not mark SupportPilot production-complete until:

- `npm run test:rls` passes locally and in CI;
- migrations apply from an empty Supabase project;
- the clean-project role matrix above passes using authenticated Supabase clients;
- the verification artifact is attached to the release checklist.
