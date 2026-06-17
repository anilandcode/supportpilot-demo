# SupportPilot

White-label AI customer support for a client knowledge base. The app streams answers, cites retrieved docs, supports human escalation, ships an async script embed, and keeps a small demo analytics surface.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4 via `@theme`
- Vercel AI SDK v6
- Gemini 2.5 Flash by default
- Framer Motion and lucide-react

## Run Locally

```bash
npm install
echo 'GOOGLE_GENERATIVE_AI_API_KEY=your_key_here' > .env.local
npm run dev
```

Routes:

- `/` - marketing page and live demo
- `/embed` - iframe fallback chat panel
- `/admin` - demo stats dashboard
- `/api/chat` - streaming chat endpoint
- `/api/stats` - read-only analytics snapshot
- `/api/feedback` - answer feedback logging

The chat still works without a model key by returning a deterministic cited answer from the Lite retriever. Add `GOOGLE_GENERATIVE_AI_API_KEY` for real model streaming.

## Configure a Client

Branding lives in `theme.config.ts`:

- `productName`, `botName`, `company`
- logo/avatar URLs
- colors, radius, font, mode
- welcome copy and suggestion chips
- escalation URL and label
- `tier: "lite" | "enterprise"`

Knowledge lives in `/knowledge/*.md|*.txt`. Lite mode reads those files, chunks them by heading, scores them against the user query, and passes only the top chunks into the model. Citations use `filename#heading` labels.

## Embed

Script embed:

```html
<script async src="https://your-domain.example/widget.js" data-accent="#2563eb"></script>
```

Iframe fallback:

```html
<iframe src="https://your-domain.example/embed" width="400" height="620" style="border:0;border-radius:18px"></iframe>
```

## Verify

```bash
npm run typecheck
npm run build
npm run test:conversation
```

`npm run test:conversation` expects a dev server or live app at `BASE_URL` and checks the streaming chat endpoint.

## Enterprise Boundary

`lib/retriever.ts` exposes `Retriever`, `LiteRetriever`, and `EnterpriseRetriever`. Enterprise currently falls back to Lite unless Supabase env vars are present; the UI, prompt, citations, feedback, and analytics already use the retriever interface so pgvector can be wired without changing the chat surface.

See `CLIENT_SETUP.md` for the 15-minute client deployment runbook and `INGEST.md` for the Enterprise ingestion path.
