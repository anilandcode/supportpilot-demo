import { getDashboardMetrics } from "@/lib/db/support";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await getDashboardMetrics(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
