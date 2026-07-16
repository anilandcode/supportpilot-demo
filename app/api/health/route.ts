import { buildDeploymentHealthSnapshot, sendHealthAlert, verifyHealthAlertSecret } from "@/lib/ops/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await buildDeploymentHealthSnapshot();
  return Response.json(snapshot, {
    status: snapshot.status === "fail" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: Request) {
  if (!verifyHealthAlertSecret(req.headers.get("x-supportpilot-health-secret"))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const snapshot = await buildDeploymentHealthSnapshot();
  const alert = await sendHealthAlert(snapshot);
  return Response.json(
    { snapshot, alert },
    {
      status: snapshot.status === "fail" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
