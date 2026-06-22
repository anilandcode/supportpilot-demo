import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { hashSensitiveValue } from "@/lib/security/redaction";

type WidgetSessionPayload = {
  workspaceId: string;
  origin: string;
  expiresAt: number;
  nonce: string;
};

function base64url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function getWidgetSessionSecret() {
  return process.env.SUPPORTPILOT_WIDGET_SESSION_SECRET || "";
}

export function createSignedWidgetSession(input: { workspaceId: string; origin: string; ttlSeconds?: number }) {
  const secret = getWidgetSessionSecret();
  if (!secret) return null;
  const payload: WidgetSessionPayload = {
    workspaceId: input.workspaceId,
    origin: input.origin,
    expiresAt: Date.now() + (input.ttlSeconds ?? 30 * 60) * 1000,
    nonce: randomUUID(),
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  return {
    token: `${encodedPayload}.${sign(encodedPayload, secret)}`,
    tokenHash: hashSensitiveValue(encodedPayload),
    expiresAt: new Date(payload.expiresAt).toISOString(),
    payload,
  };
}

export function verifySignedWidgetSession(token: string | null | undefined, expected: { workspaceId: string; origin: string | null }) {
  const secret = getWidgetSessionSecret();
  if (!secret) return { ok: true as const, reason: "not_configured" };
  if (!token) return { ok: false as const, reason: "missing_session" };

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return { ok: false as const, reason: "malformed_session" };

  const expectedSignature = sign(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { ok: false as const, reason: "invalid_signature" };
  }

  let payload: WidgetSessionPayload;
  try {
    payload = JSON.parse(fromBase64url(encodedPayload)) as WidgetSessionPayload;
  } catch {
    return { ok: false as const, reason: "invalid_payload" };
  }

  if (payload.expiresAt < Date.now()) return { ok: false as const, reason: "expired_session" };
  if (payload.workspaceId !== expected.workspaceId) return { ok: false as const, reason: "workspace_mismatch" };
  if (expected.origin && payload.origin !== expected.origin) return { ok: false as const, reason: "origin_mismatch" };

  return { ok: true as const, reason: "verified", payload, tokenHash: hashSensitiveValue(encodedPayload) };
}
