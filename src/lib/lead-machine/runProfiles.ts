// Runs saved search profiles: discover → score → save new leads above threshold.
// Shared by the Vercel cron route, the Iris "zoek nieuwe leads" action, and the
// manual "Nu draaien" button in the admin UI. Every run is logged to
// lead_search_runs so a silent nightly failure is visible, not invisible.

import { sql } from '@/lib/db/neon';
import { runLeadSearch, saveSearchResult } from './pipeline';
import { DEFAULT_SCORING_CONTEXT } from './scorer';

export type RunTrigger = 'cron' | 'manual' | 'iris';

export interface ProfileRunReport {
  ran: number;
  totalSaved: number;
  // total organizations discovered across all profiles this run
  totalFound: number;
  report: Array<{ profile: string; found: number; saved: number }>;
}

export interface RunDueProfilesOptions {
  // force = ignore cadence window and run all active profiles (used by Iris "nu zoeken")
  force?: boolean;
  // cap profiles processed per call (each search is slow → bound latency/timeout)
  maxProfiles?: number;
  // stop met nieuwe profielen starten zodra dit budget op is (serverless timeout).
  // Niet-gestarte profielen worden niet gestampt en zijn volgende run als eerste aan de beurt.
  timeBudgetMs?: number;
  // who triggered this run — recorded in lead_search_runs
  trigger?: RunTrigger;
}

export async function runDueProfiles({
  force = false,
  maxProfiles = 2,
  timeBudgetMs,
  trigger = 'cron',
}: RunDueProfilesOptions = {}): Promise<ProfileRunReport> {
  const startedAt = Date.now();
  const profiles = force
    ? await sql`
        SELECT * FROM lead_search_profiles
        WHERE tenant_id = 'weareimpact' AND active = TRUE
        ORDER BY last_run_at ASC NULLS FIRST
        LIMIT ${maxProfiles}
      `
    : await sql`
        SELECT * FROM lead_search_profiles
        WHERE tenant_id = 'weareimpact'
          AND active = TRUE
          AND (
            last_run_at IS NULL
            OR (cadence = 'daily'  AND last_run_at < NOW() - INTERVAL '20 hours')
            OR (cadence = 'weekly' AND last_run_at < NOW() - INTERVAL '6 days')
          )
        ORDER BY last_run_at ASC NULLS FIRST
        LIMIT ${maxProfiles}
      `;

  const report: ProfileRunReport['report'] = [];
  let totalFound = 0;

  for (const profile of profiles) {
    if (timeBudgetMs && Date.now() - startedAt > timeBudgetMs) break;
    let saved = 0;
    let found = 0;
    try {
      const results = await runLeadSearch({
        query: profile.query as string,
        maxResults: Number(profile.max_results ?? 10),
        scoringContext: (profile.scoring_context as string) || DEFAULT_SCORING_CONTEXT,
        timeBudgetMs: timeBudgetMs ? Math.max(0, timeBudgetMs - (Date.now() - startedAt)) : undefined,
      });
      found = results.length;
      totalFound += found;

      const minScore = Number(profile.min_score ?? 6);
      for (const r of results) {
        if ((r.aiScore ?? 0) >= minScore && !r.alreadySaved) {
          const id = await saveSearchResult(r);
          if (id) saved++;
        }
      }
      report.push({ profile: profile.name as string, found, saved });
    } catch (err) {
      console.error(`Profile "${profile.name}" failed:`, err);
      report.push({ profile: profile.name as string, found, saved });
    } finally {
      await sql`UPDATE lead_search_profiles SET last_run_at = NOW(), updated_at = NOW() WHERE id = ${profile.id}`;
    }
  }

  const totalSaved = report.reduce((s, r) => s + r.saved, 0);

  // Audit log — one row per run, regardless of outcome. A cron that finds
  // nothing or throws is now inspectable from the admin UI / DB.
  try {
    const status = report.length === 0 ? 'ok'
      : report.some((r) => r.found === 0) && totalSaved === 0 ? 'partial'
      : 'ok';
    await sql`
      INSERT INTO lead_search_runs (trigger, profiles_run, total_found, total_saved, status, detail)
      VALUES (
        ${trigger},
        ${report.length},
        ${totalFound},
        ${totalSaved},
        ${status},
        ${JSON.stringify(report)}::jsonb
      )
    `;
  } catch (logErr) {
    // Never let logging failure break the search run.
    console.error('lead_search_runs insert failed:', logErr);
  }

  return { ran: report.length, totalSaved, totalFound, report };
}
