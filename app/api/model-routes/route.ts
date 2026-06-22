import { listModelRouteLogs } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const routes = await listModelRouteLogs(url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined);
  return Response.json({ routes });
}
