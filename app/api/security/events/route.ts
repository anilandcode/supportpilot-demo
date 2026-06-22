import { listSecurityEvents } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const events = await listSecurityEvents(url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined);
  return Response.json({ events });
}
