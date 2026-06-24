export const runtime = "nodejs";

type PortalResult =
  | { mode: "stripe"; url: string }
  | { mode: "demo"; url: string; reason: "demo" | "stripe_error" };

function dashboardUrl(req: Request, reason?: "demo" | "stripe_error") {
  const url = new URL("/admin/billing", req.url);
  if (reason) url.searchParams.set("portal", reason);
  return url;
}

function returnUrl(req: Request) {
  return process.env.STRIPE_BILLING_PORTAL_RETURN_URL || process.env.NEXT_PUBLIC_APP_URL
    ? new URL("/admin/billing", process.env.STRIPE_BILLING_PORTAL_RETURN_URL || process.env.NEXT_PUBLIC_APP_URL).toString()
    : new URL("/admin/billing", req.url).toString();
}

async function createPortalResult(req: Request): Promise<PortalResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const customer = process.env.STRIPE_CUSTOMER_ID || process.env.SUPPORTPILOT_STRIPE_CUSTOMER_ID;
  if (!secretKey || !customer) {
    return { mode: "demo", url: dashboardUrl(req, "demo").toString(), reason: "demo" };
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer,
        return_url: returnUrl(req),
      }),
    });
    if (!response.ok) {
      return { mode: "demo", url: dashboardUrl(req, "stripe_error").toString(), reason: "stripe_error" };
    }
    const data = await response.json();
    if (typeof data.url === "string") return { mode: "stripe", url: data.url };
    return { mode: "demo", url: dashboardUrl(req, "stripe_error").toString(), reason: "stripe_error" };
  } catch {
    return { mode: "demo", url: dashboardUrl(req, "stripe_error").toString(), reason: "stripe_error" };
  }
}

export async function GET(req: Request) {
  const result = await createPortalResult(req);
  return Response.redirect(result.url, 303);
}

export async function POST(req: Request) {
  const result = await createPortalResult(req);
  return Response.json(result, { status: result.mode === "stripe" || result.reason === "demo" ? 200 : 502 });
}
