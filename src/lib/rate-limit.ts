/**
 * Lightweight in-memory rate limiter (sliding window).
 *
 * Serverless-vriendelijk zonder externe dependency: houdt per key een lijst
 * van timestamps bij binnen een tijdvenster. Prima voor het afremmen van
 * misbruik op publieke endpoints (AI-scan, e-mailcapture) op één instance.
 *
 * Let op: in een multi-instance serverless-omgeving is dit best-effort —
 * elke instance heeft z'n eigen geheugen. Voor harde garanties zou je later
 * Upstash Redis kunnen inschakelen. Voor deze use case (kostenremming +
 * bot-afweer) is dit ruim voldoende.
 */

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

// Periodieke opschoning om geheugengroei te voorkomen.
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 min

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const key of Array.from(store.keys())) {
    const entry = store.get(key)!;
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * @param key       Unieke sleutel (meestal IP + route).
 * @param limit     Max aantal requests per venster.
 * @param windowMs  Venstergrootte in milliseconden.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const entry = store.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    store.set(key, entry);
    return {
      success: false,
      remaining: 0,
      limit,
      resetMs: windowMs - (now - oldest),
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    success: true,
    remaining: limit - entry.timestamps.length,
    limit,
    resetMs: windowMs,
  };
}

/** Haal het client-IP uit een Next.js request (Vercel-headers first). */
export function getClientIp(request: Request): string {
  const h = request.headers;
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    'unknown'
  );
}
