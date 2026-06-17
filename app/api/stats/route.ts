import { getStatsSnapshot } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(getStatsSnapshot(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
