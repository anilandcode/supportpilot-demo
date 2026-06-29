import {
  hasProcessedStripeWebhookEvent,
  processStripeBillingEvent,
  recordStripeWebhookEvent,
} from "@/lib/db/billing";
import { verifyStripeWebhookSignature, type StripeBillingEvent } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET is required for billing webhooks" }, { status: 501 });
  }

  const verified = verifyStripeWebhookSignature({
    payload: rawBody,
    signatureHeader: req.headers.get("stripe-signature"),
    secret: webhookSecret,
  });
  if (!verified) return Response.json({ error: "invalid Stripe signature" }, { status: 400 });

  const event = JSON.parse(rawBody) as StripeBillingEvent;
  if (!event.id || !event.type) return Response.json({ error: "invalid Stripe event" }, { status: 400 });

  if (await hasProcessedStripeWebhookEvent(event.id)) {
    return Response.json({ received: true, processed: false, duplicate: true });
  }

  await recordStripeWebhookEvent({
    stripeEventId: event.id,
    type: event.type,
    livemode: Boolean(event.livemode),
    status: "processing",
    payload: event as unknown as Record<string, unknown>,
  });

  try {
    const result = await processStripeBillingEvent(event);
    await recordStripeWebhookEvent({
      stripeEventId: event.id,
      type: event.type,
      livemode: Boolean(event.livemode),
      status: result.action.startsWith("ignored") ? "ignored" : "processed",
      payload: event as unknown as Record<string, unknown>,
    });
    return Response.json({ received: true, processed: !result.action.startsWith("ignored"), action: result.action });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown webhook processing error";
    await recordStripeWebhookEvent({
      stripeEventId: event.id,
      type: event.type,
      livemode: Boolean(event.livemode),
      status: "failed",
      error: message,
      payload: event as unknown as Record<string, unknown>,
    });
    return Response.json({ received: true, processed: false, error: message }, { status: 500 });
  }
}
