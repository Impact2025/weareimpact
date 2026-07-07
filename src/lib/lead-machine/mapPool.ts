// Bounded-concurrency async map with:
//  - global minimum delay between task *starts* (rate limiting / politeness)
//  - exponential backoff + jitter on transient failures (limited retries)
//  - optional AbortSignal + hard time budget
// Used by the lead scraper and scorer so external calls never hammer a host
// or blow the serverless timeout.
//
// Failures that exhaust retries are returned via onError (default: undefined),
// so a single bad item never kills the whole batch (lossless).

export interface MapPoolOptions {
  // max simultaneous in-flight tasks
  concurrency?: number;
  // minimum ms between the *start* of two tasks (global rate limit)
  minDelayMs?: number;
  // AbortSignal — when aborted, pending tasks stop being started
  signal?: AbortSignal;
  // hard deadline: once Date.now() - start > budgetMs, don't start new tasks
  timeBudgetMs?: number;
  // retries on thrown errors (default 0 = no retry)
  retries?: number;
  // base backoff ms (doubled each attempt, capped) — default 400
  backoffMs?: number;
  // max backoff ms — default 4000
  maxBackoffMs?: number;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function mapPool<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  opts: MapPoolOptions = {},
): Promise<Array<R | undefined>> {
  const {
    concurrency = 3,
    minDelayMs = 0,
    signal,
    timeBudgetMs,
    retries = 0,
    backoffMs = 400,
    maxBackoffMs = 4000,
  } = opts;

  const startedAt = Date.now();
  const results: Array<R | undefined> = new Array(items.length);
  const queue = items.map((item, index) => ({ item, index }));
  let lastStart = 0;

  async function runOne(): Promise<void> {
    while (queue.length > 0) {
      if (signal?.aborted) return;
      if (timeBudgetMs && Date.now() - startedAt > timeBudgetMs) return;

      // Global rate limit: ensure minDelayMs since the previous task started.
      const now = Date.now();
      const wait = minDelayMs - (now - lastStart);
      if (wait > 0) await sleep(wait);
      if (signal?.aborted) return;
      if (timeBudgetMs && Date.now() - startedAt > timeBudgetMs) return;

      const task = queue.shift()!;
      lastStart = Date.now();

      let attempt = 0;
      while (true) {
        try {
          results[task.index] = await worker(task.item, task.index);
          break;
        } catch (err) {
          if (attempt >= retries) {
            // Lossless: leave undefined, don't throw — caller can fill a fallback.
            console.error(`mapPool task ${task.index} failed after ${retries} retries:`, err);
            results[task.index] = undefined;
            break;
          }
          attempt++;
          const cap = Math.min(maxBackoffMs, backoffMs * 2 ** (attempt - 1));
          const jitter = Math.random() * cap * 0.3;
          await sleep(cap + jitter);
          if (signal?.aborted) return;
        }
      }
    }
  }

  const n = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: n }, runOne));
  return results;
}
