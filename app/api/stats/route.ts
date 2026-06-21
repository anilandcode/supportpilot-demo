import { getDashboardMetrics } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspace") || url.searchParams.get("workspaceId") || undefined;

  return Response.json(await getDashboardMetrics(workspaceId), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
