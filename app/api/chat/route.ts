import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/system-prompt";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: UIMessage[] = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: buildSystemPrompt(),
      messages: modelMessages,
      maxOutputTokens: 1024,
      temperature: 0.5,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[/api/chat]", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
