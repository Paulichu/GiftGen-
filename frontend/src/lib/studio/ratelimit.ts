export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Per-key sliding window limiter. State is process-local, so it protects a
 * single deployment instance from a chatty client (not a distributed attacker);
 * restarting the server resets the counters.
 */
export class SlidingWindowLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  get size(): number {
    return this.hits.size;
  }

  check(key: string, now = Date.now()): RateLimitResult {
    return this.result(key, now, true);
  }

  /** Reports whether one more hit fits, without counting it. */
  peek(key: string, now = Date.now()): RateLimitResult {
    return this.result(key, now, false);
  }

  /** Counts a hit after the fact, e.g. only once an attempt is known to be wrong. */
  record(key: string, now = Date.now()): RateLimitResult {
    return this.result(key, now, true);
  }

  private result(key: string, now: number, record: boolean): RateLimitResult {
    const since = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((stamp) => stamp > since);

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + this.windowMs - now) / 1000));
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    if (!record) {
      this.hits.set(key, recent);
      return { allowed: true, remaining: this.limit - recent.length, retryAfterSeconds: 0 };
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.prune(now);
    return { allowed: true, remaining: this.limit - recent.length, retryAfterSeconds: 0 };
  }

  reset(): void {
    this.hits.clear();
  }

  private prune(now: number): void {
    if (this.hits.size <= 500) return;
    const since = now - this.windowMs;
    this.hits.forEach((stamps: number[], key: string) => {
      if (!stamps.some((stamp: number) => stamp > since)) this.hits.delete(key);
    });
  }
}

/** Uses the first proxy address so the limit follows the buyer, not the proxy. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "";
  return ip || "unknown";
}
