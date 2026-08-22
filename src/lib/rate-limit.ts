/**
 * A deliberately small in-process rate limiter.
 *
 * What it is: a sliding window keyed on client IP, held in module scope. On
 * Vercel's Fluid Compute the function instance is reused across requests, so
 * this genuinely holds state between submissions rather than resetting every
 * time — which is what makes it worth having at all.
 *
 * What it is NOT: a distributed limiter. Traffic spread across regions or a
 * cold start after idle both reset the window, so a determined attacker can get
 * more through than the numbers below suggest. That is an accepted trade for a
 * marketing site whose form sends one email to one person: the job here is to
 * stop a bored script and an accidental double-submit, not to withstand a
 * targeted flood. If inquiry spam ever becomes a real problem, the fix is a
 * shared store (Upstash Redis via the Vercel Marketplace) rather than tuning
 * these constants.
 */
type Hit = { count: number; resetAt: number };

const hits = new Map<string, Hit>();

/** Bounded so a spray of unique IPs cannot grow this without limit. */
const MAX_KEYS = 5_000;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets. Only meaningful when `ok` is false. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult {
  const existing = hits.get(key);

  if (!existing || now >= existing.resetAt) {
    if (hits.size >= MAX_KEYS) evictExpired(now);
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Drop expired entries; if that frees nothing, clear rather than grow. */
function evictExpired(now: number) {
  for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
  if (hits.size >= MAX_KEYS) hits.clear();
}

/** Test seam — the module-level map would otherwise leak between cases. */
export function __resetRateLimit() {
  hits.clear();
}
