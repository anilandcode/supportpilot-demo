/**
 * Simulates 5 user questions against the local (or live) chat API.
 * Usage:
 *   pnpm test:conversation                      # local dev server
 *   BASE_URL=https://your-app.vercel.app pnpm test:conversation
 */

export {};

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const API_URL = `${BASE_URL}/api/chat`;

const QUESTIONS = [
  "How much is Pro?",
  "Do you integrate with GitHub?",
  "What's your refund policy?",
  "Can I get a custom enterprise plan?",
  "I think there's a bug in my workspace",
];

type UIMessagePart = { type: "text"; text: string } | { type: string };

async function ask(question: string, conversationId: string): Promise<string> {
  const body = {
    id: conversationId,
    messages: [
      {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: question }],
      },
    ],
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  // Collect the streamed text — AI SDK streams newline-delimited JSON parts
  const raw = await res.text();
  const lines = raw.split("\n").filter(Boolean);

  let fullText = "";
  for (const line of lines) {
    // AI SDK v6 data stream format: lines prefixed with type code
    // Text deltas are: 0:"chunk"
    const textMatch = line.match(/^0:"(.*)"/);
    if (textMatch) {
      // Unescape the JSON string value
      try {
        fullText += JSON.parse(`"${textMatch[1]}"`);
      } catch {
        fullText += textMatch[1];
      }
    }
  }

  return fullText.trim() || "(no text in response — check stream format)";
}

async function run() {
  console.log(`\nSupportPilot AI — Conversation Test`);
  console.log(`Target: ${API_URL}`);
  console.log("─".repeat(60));

  const convId = crypto.randomUUID();
  let passed = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    console.log(`\n[${i + 1}/${QUESTIONS.length}] User: ${q}`);

    try {
      const answer = await ask(q, convId);
      console.log(`       Bot: ${answer.slice(0, 300)}${answer.length > 300 ? "…" : ""}`);

      // Spot-check: bug question should mention escalation or human
      if (i === 4) {
        const lower = answer.toLowerCase();
        const escalates =
          lower.includes("human") ||
          lower.includes("support team") ||
          lower.includes("engineer") ||
          lower.includes("escalat") ||
          lower.includes("look into") ||
          lower.includes("investigate");
        console.log(`       ✓ Escalation check: ${escalates ? "PASS — bot routes to human" : "WARN — no escalation signal detected"}`);
      }

      passed++;
    } catch (err) {
      console.error(`       ✗ ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log(`Result: ${passed}/${QUESTIONS.length} questions answered\n`);

  if (passed < QUESTIONS.length) process.exit(1);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
