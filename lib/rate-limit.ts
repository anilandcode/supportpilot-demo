import { createHash } from "node:crypto";

export type RateLimitScope = "chat" | "widget_config" | "widget_session" | "knowledge_upload" | "billing_webhook";

export type RateLimitInput = {
  scope: RateLimitScope;
  workspaceId?: string | null;
  key: string;
  limit?: number;
  windowMs?: number;
  nowMs?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
  windowMs: number;
  scope: RateLimitScope;
  keyHash: string;
  store: "redis" | "memory";
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type NormalizedRateLimitInput = {
  scope: RateLimitScope;
  workspaceId: string;
  key: string;
  keyHash: string;
  limit: number;
  windowMs: number;
  nowMs: number;
};

const DEFAULT_LIMITS: Record<RateLimitScope, { limit: number; windowMs: number }> = {
  chat: {
    limit: Number(process.env.SUPPORTPILOT_RATE_LIMIT_CHAT_PER_MINUTE || 10),
    windowMs: 60_000,
  },
  widget_config: {
    limit: Number(process.env.SUPPORTPILOT_RATE_LIMIT_WIDGET_CONFIG_PER_MINUTE || 120),
    windowMs: 60_000,
  },
  widget_session: {
    limit: Number(process.env.SUPPORTPILOT_RATE_LIMIT_WIDGET_SESSIONS_PER_5_MINUTES || 30),
    windowMs: 300_000,
  },
  knowledge_upload: {
    limit: Number(process.env.SUPPORTPILOT_RATE_LIMIT_UPLOADS_PER_HOUR || 20),
    windowMs: 3_600_000,
  },
  billing_webhook: {
    limit: Number(process.env.SUPPORTPILOT_RATE_LIMIT_BILLING_WEBHOOKS_PER_MINUTE || 120),
    windowMs: 60_000,
  },
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __supportpilotRateLimit?: Map<string, RateLimitEntry>;
};

const buckets =
  globalForRateLimit.__supportpilotRateLimit ??
  (globalForRateLimit.__supportpilotRateLimit = new Map<string, RateLimitEntry>());

export async function checkRateLimit(input: RateLimitInput | string): Promise<RateLimitResult> {
  const normalized = typeof input === "string" ? normalizeInput({ scope: "chat", key: input }) : normalizeInput(input);
  if (hasRedisRateLimitEnv()) {
    const redis = await checkRedisRateLimit(normalized).catch(() => null);
    if (redis) return redis;
  }
  return checkMemoryRateLimit(normalized);
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Store": result.store,
  };
}

export function retryAfterSeconds(result: RateLimitResult, nowMs = Date.now()) {
  return Math.max(Math.ceil((result.resetAt - nowMs) / 1000), 1);
}

export function rateLimitIdentityHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function hasRedisRateLimitEnv() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function resetLocalRateLimitForTests() {
  buckets.clear();
}

function normalizeInput(input: RateLimitInput): NormalizedRateLimitInput {
  const defaults = DEFAULT_LIMITS[input.scope];
  const rawKey = input.key || "anonymous";
  return {
    scope: input.scope,
    workspaceId: input.workspaceId || "global",
    key: rawKey,
    keyHash: rateLimitIdentityHash(`${input.scope}:${input.workspaceId || "global"}:${rawKey}`),
    limit: positiveNumber(input.limit, defaults.limit),
    windowMs: positiveNumber(input.windowMs, defaults.windowMs),
    nowMs: input.nowMs ?? Date.now(),
  };
}

function positiveNumber(value: number | undefined, fallback: number) {
  return Number.isFinite(value) && value && value > 0 ? value : fallback;
}

function bucketKey(input: ReturnType<typeof normalizeInput>) {
  return `sp:rl:${input.scope}:${input.workspaceId}:${input.keyHash}`;
}

function checkMemoryRateLimit(input: ReturnType<typeof normalizeInput>): RateLimitResult {
  const key = bucketKey(input);
  const current = buckets.get(key);
  if (!current || current.resetAt <= input.nowMs) {
    const resetAt = input.nowMs + input.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return toResult(input, true, input.limit - 1, resetAt, "memory");
  }

  if (current.count >= input.limit) {
    return toResult(input, false, 0, current.resetAt, "memory");
  }

  current.count += 1;
  return toResult(input, true, Math.max(input.limit - current.count, 0), current.resetAt, "memory");
}

async function checkRedisRateLimit(input: ReturnType<typeof normalizeInput>): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = bucketKey(input);
  const resetAt = input.nowMs + input.windowMs;
  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, String(input.windowMs), "NX"],
    ]),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  const count = Number(data?.[0]?.result);
  if (!Number.isFinite(count) || count < 1) return null;
  return toResult(input, count <= input.limit, Math.max(input.limit - count, 0), resetAt, "redis");
}

function toResult(
  input: ReturnType<typeof normalizeInput>,
  allowed: boolean,
  remaining: number,
  resetAt: number,
  store: RateLimitResult["store"],
): RateLimitResult {
  return {
    allowed,
    remaining,
    resetAt,
    limit: input.limit,
    windowMs: input.windowMs,
    scope: input.scope,
    keyHash: input.keyHash,
    store,
  };
}
