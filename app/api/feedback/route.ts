import { appendFeedback } from "@/lib/db/support";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const messageId = typeof body?.messageId === "string" ? body.messageId : "";
  const value = body?.value === "up" || body?.value === "down" ? body.value : null;

  if (!messageId || !value) {
    return Response.json({ error: "messageId and value are required" }, { status: 400 });
  }

  await appendFeedback({ messageId, rating: value });
  return Response.json({ ok: true });
}
