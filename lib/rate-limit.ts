type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 10 * 60_000;

const buckets = new Map<string, Bucket>();

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function rateLimit(request: Request, limit = 30, windowMs = WINDOW_MS) {
  cleanup();

  const key = `${clientKey(request)}:${request.method}:${new URL(request.url).pathname}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      limited: false,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      limited: true,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  return {
    limited: false,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}
