type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const globalForRateLimit = globalThis as typeof globalThis & {
  __supportpilotRateLimit?: Map<string, RateLimitEntry>;
};

const buckets =
  globalForRateLimit.__supportpilotRateLimit ??
  (globalForRateLimit.__supportpilotRateLimit = new Map<string, RateLimitEntry>());

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(MAX_REQUESTS - current.count, 0),
    resetAt: current.resetAt,
  };
}
