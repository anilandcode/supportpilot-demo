# Client Setup Runbook

Use this checklist to clone and ship a new white-label SupportPilot instance.

## 1. Clone and install

```bash
git clone <repo-url> supportpilot-client
cd supportpilot-client
npm install
```

## 2. Configure the client

Edit `theme.config.ts`.

Set:

- `productName`
- `botName`
- `company`
- `colors.accent`, `colors.fg`, `colors.bg`, `colors.surface`, `colors.card`
- `welcome`
- `suggestions`
- `escalation.url`
- `tier`

Drop optional logo/avatar files into `public/` and point `logoUrl` or `avatarUrl` to them.

## 3. Add knowledge

Replace the sample files in `/knowledge` with the client's docs:

- `pricing.md`
- `features.md`
- `integrations.md`
- `security.md`
- `billing.md`
- any extra `.md` or `.txt` files

Use clear headings because citations are generated as `filename#heading`.

## 4. Add environment variables

Lite:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=...
LLM_PROVIDER=google
GOOGLE_MODEL=gemini-2.5-flash
```

Enterprise, when vector retrieval is wired:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 5. Verify locally

```bash
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`, ask one pricing question, one security question, and one off-topic question.

## 6. Deploy

Create a Vercel project, add the env vars above, and deploy.

```bash
vercel deploy --prod
```

## 7. Install the widget

Script embed:

```html
<script async src="https://your-client-domain.example/widget.js" data-accent="#2563eb"></script>
```

Iframe fallback:

```html
<iframe src="https://your-client-domain.example/embed" width="400" height="620" style="border:0;border-radius:18px"></iframe>
```

## Platform notes

- Webflow: paste the script before `</body>` in custom code.
- WordPress: add the script through a header/footer code plugin.
- Shopify: paste the script in `theme.liquid` before `</body>`.
- Plain HTML: paste the script before `</body>`.
