# SupportPilot AI — 24/7 AI Customer Support

SupportPilot AI is a production-quality customer support chatbot that answers questions from your knowledge base, cites its sources, and escalates to a human when it can't help. Built as a portfolio case study for a fictional SaaS client ("Linear-clone") — the same architecture deploys in under a day for any real business.

**Built by [Anil Pervaiz](https://anilpervaiz.com) — full-stack AI architect**

---

## Live Demo

> **[chatbot-demo-anil.vercel.app](https://chatbot-demo-anil.vercel.app)** ← try it here
>
> Admin dashboard: [chatbot-demo-anil.vercel.app/admin](https://chatbot-demo-anil.vercel.app/admin)
> Embeddable widget: [chatbot-demo-anil.vercel.app/embed](https://chatbot-demo-anil.vercel.app/embed)

---

## Screenshots

| Landing page | Chat demo | Admin dashboard |
|---|---|---|
| *(screenshot after deploy)* | *(screenshot after deploy)* | *(screenshot after deploy)* |

| Dark mode | Mobile widget | Embed code |
|---|---|---|
| *(screenshot after deploy)* | *(screenshot after deploy)* | *(screenshot after deploy)* |

---

## Tech Stack

| Layer | Technology |
|---|---|
| ![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white) | App Router, Edge runtime, static generation |
| ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black) | Server + client components |
| ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white) | Strict mode, full type coverage |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38BDF8?logo=tailwindcss&logoColor=white) | CSS-only config via `@theme {}`, zero JS config file |
| ![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?logo=google&logoColor=white) | Streaming responses via Vercel AI SDK v6 |
| ![Vercel AI SDK](https://img.shields.io/badge/AI_SDK_v6-000000?logo=vercel&logoColor=white) | `useChat`, `streamText`, `DefaultChatTransport` |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion_12-0055FF?logo=framer&logoColor=white) | Message animations, widget open/close |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) | Edge deployment, automatic HTTPS |

---

## How It Works

1. **Knowledge base ingestion** — product docs (pricing, features, integrations, security, billing) live in `lib/knowledge.ts` as structured Markdown, injected into the system prompt at runtime
2. **Streaming AI responses** — user messages hit `/api/chat` (edge function), Claude claude-sonnet-4-5 streams back answers that cite their source with `[Source: ...]` tags
3. **Source citations** — the UI strips citation tags from visible text and renders them as subtle badges below each message, showing exactly where the answer came from
4. **Human escalation** — whenever the bot can't help confidently, it surfaces a "Talk to a human" button that opens a Calendly booking link

---

## Run Locally

```bash
# 1. Clone and install
git clone https://github.com/anilpervaiz/supportpilot-demo.git
cd supportpilot-demo
pnpm install

# 2. Set your Google AI key (free — no credit card)
# Get one at: https://aistudio.google.com/apikey
echo 'GOOGLE_GENERATIVE_AI_API_KEY=AIza...' > .env.local

# 3. Start the dev server
pnpm dev
# → http://localhost:3000
```

**Routes:**
- `/` — landing page + live chat demo
- `/admin` — dashboard (no auth, for demo purposes)
- `/embed` — embeddable widget (use in an `<iframe>`)
- `/api/chat` — streaming chat endpoint (POST)

---

## Test the Bot

```bash
# Simulate 5 questions and print responses
pnpm test:conversation
```

This script verifies the bot answers pricing/feature questions correctly and escalates on bug reports — useful before recording demos or after updating the knowledge base.

---

## What This Would Cost a Business

| Option | Monthly cost | Notes |
|---|---|---|
| Hire a virtual assistant | ~$2,000/mo | Part-time, 4–6 hr response time |
| Hire a support agent | ~$4,000/mo | Full-time, covers one timezone |
| **SupportPilot AI** | **~$50/mo** | 24/7, <3s responses, scales infinitely |

API costs at typical volume (1,500 conversations/mo × avg 800 tokens): ~$1–3/mo on Gemini 2.5 Flash. The $50 estimate includes Vercel hosting and comfortable buffer.

---

## Project Structure

```
app/
  page.tsx            # Landing page
  admin/page.tsx      # Dashboard (demo)
  embed/page.tsx      # Embeddable widget host
  api/chat/route.ts   # Streaming chat endpoint (edge)
components/
  chat/
    chat-window.tsx         # Main chat UI
    chat-widget.tsx         # Floating widget
    message.tsx             # Single message + citations
    message-list.tsx        # Scrollable message feed
    typing-indicator.tsx    # Animated dots
    suggested-questions.tsx
    escalation-button.tsx
  ui/
    badge.tsx  button.tsx  card.tsx  input.tsx
    scroll-area.tsx  copy-button.tsx  theme-toggle.tsx
lib/
  knowledge.ts      # Product knowledge base (~2,000 words)
  system-prompt.ts  # Bot persona + rules + injected knowledge
  types.ts          # Shared TypeScript types
  utils.ts          # cn() helper
scripts/
  test-conversation.ts  # End-to-end bot verification
```

---

## Want One for Your Business?

This same stack — custom knowledge base, your brand, your escalation flow — deploys in under a day.

**[Book a free 15-minute call →](https://calendly.com/anilpervaiz/15min)**

---

*SupportPilot AI is a portfolio project by [Anil Pervaiz](https://anilpervaiz.com). "Linear-clone" is a fictional client used for demonstration purposes.*
