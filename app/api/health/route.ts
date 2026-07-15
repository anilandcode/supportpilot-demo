import { buildHealthSnapshot } from "@/lib/ops/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = buildHealthSnapshot();
  return Response.json(snapshot, {
    status: snapshot.status === "fail" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
