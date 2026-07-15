# Client Setup Runbook

Use this checklist to ship a white-label SupportPilot instance. Lite mode can go live first; Enterprise mode adds Supabase, roles, workspace settings, verified domains, RAG, tickets, approval, audit, and analytics.

## 1. Clone and Install

```bash
git clone <repo-url> supportpilot-client
cd supportpilot-client
npm install
cp .env.local.example .env.local
```

## 2. Configure Brand and Tier

Edit `theme.config.ts`.

Set:

- `productName`
- `botName`
- `company`
- logo/avatar URLs
- colors, radius, font, and mode
- welcome copy
- suggestion chips
- escalation URL and label
- `tier: "lite" | "enterprise"`

## 3. Lite Knowledge

Replace sample files in `/knowledge` with client docs:

- pricing
- features
- integrations
- security
- billing
- support policies

Use clear Markdown headings because Lite citations are generated as `filename#heading`.

## 4. Enterprise Supabase

1. Create a Supabase project.
2. Apply `supabase/migrations/001_enterprise_supportpilot.sql`.
3. Apply `supabase/migrations/002_light_mvp_productization.sql`.
4. Run `supabase/seed.sql` for demo data.
5. Create a Storage bucket for source files if the client wants original uploads retained.
6. Add these env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://your-client-domain.example
```

The seeded workspace key is `wk_demo_acmedesk`. Replace it in `/admin/settings` before handing the instance to a client.

Seed staff password:

```text
SupportPilot2026!
```

## 5. LLM Provider

Choose one provider:

```bash
LLM_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=...
GOOGLE_MODEL=gemini-2.5-flash
```

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

## 6. Optional Sentry

```bash
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...
```

## 7. Optional Escalation and Analytics

```bash
RESEND_API_KEY=...
INVITATION_FROM_EMAIL="SupportPilot Invites <invites@your-client-domain.example>"
ESCALATION_FROM_EMAIL="SupportPilot <support@your-client-domain.example>"
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Without these keys, demo escalation email and product analytics routes run as safe no-ops while still writing local usage and audit rows. In `SUPPORTPILOT_APP_MODE=production`, workspace invitations require `RESEND_API_KEY` so invite records are not created without a deliverable email path.

## 8. Verify Locally

```bash
npm run typecheck
npm run test:enterprise
npm run test:health
npm run build
npm run dev
```

Open:

- `http://localhost:3000/admin`
- `http://localhost:3000/admin/tickets`
- `http://localhost:3000/admin/knowledge`
- `http://localhost:3000/admin/approvals`
- `http://localhost:3000/admin/analytics`
- `http://localhost:3000/admin/settings`
- `http://localhost:3000/portal`
- `http://localhost:3000/api/health`

## 9. Configure Workspace

Open `/admin/settings` and set:

- workspace name and bot name
- brand color and welcome message
- escalation email and Calendly link
- verified domains for every host page that will load the widget
- approval policy thresholds

## 10. Install the Widget

Script embed with the workspace key:

```html
<script async src="https://your-client-domain.example/widget.js" data-workspace="wk_demo_acmedesk"></script>
```

Iframe fallback:

```html
<iframe src="https://your-client-domain.example/embed?workspace=wk_demo_acmedesk" width="400" height="620" style="border:0;border-radius:18px"></iframe>
```

## 11. Deploy

Create a Vercel project, add env vars, and deploy.

```bash
vercel deploy --prod
```

After deployment, upload approved docs in `/admin/knowledge`, draft a normal ticket reply, draft a high-risk ticket reply, approve/edit/reject one draft, and confirm `/admin/analytics` updates.
