// Draait opgeslagen zoekprofielen: bronnen → filter → kwalificeren → opslaan
// boven de drempel. Gedeeld door de Vercel-cron, Iris ("zoek nieuwe leads") en
// de knop "Nu draaien". Elke run komt in lead_search_runs, mét providerfouten.
//
// Twee regels die de eerste versie miste:
//  - Een run waarin de zoekprovider plat lag, telt niet als gedraaid: het
//    profiel wordt niet afgestempeld en is de volgende dag weer aan de beurt.
//  - De cursor schuift door zodra een resultaatpagina niets nieuws meer
//    oplevert, zodat een wekelijks profiel niet eeuwig dezelfde top 10 ziet.

import { sql } from '@/lib/db/neon';
import { runLeadSearch, saveSearchResult, recordSeen, type ProfileKind } from './pipeline';
import { DEFAULT_SCORING_CONTEXT } from './scorer';

export type RunTrigger = 'cron' | 'manual' | 'iris';

const MAX_CURSOR = 5; // Brave geeft max 10 pagina's; na 5 pagina's is het signaal op

export interface ProfileReport {
  profile: string;
  found: number;      // unieke organisaties na filter
  evaluated: number;
  saved: number;
  rejected: number;
  provider: string;
  errors: string[];
  status: 'ok' | 'empty' | 'error';
}

export interface ProfileRunReport {
  ran: number;
  totalSaved: number;
  totalFound: number;
  report: ProfileReport[];
}

export interface RunDueProfilesOptions {
  force?: boolean;
  maxProfiles?: number;
  timeBudgetMs?: number;
  trigger?: RunTrigger;
  profileId?: string; // één specifiek profiel draaien (knop "Nu draaien")
}

export async function runDueProfiles({
  force = false,
  maxProfiles = 2,
  timeBudgetMs = 240_000,
  trigger = 'cron',
  profileId,
}: RunDueProfilesOptions = {}): Promise<ProfileRunReport> {
  const startedAt = Date.now();
  const profiles = profileId
    ? await sql`SELECT * FROM lead_search_profiles WHERE tenant_id = 'weareimpact' AND id = ${profileId}`
    : force
      ? await sql`
          SELECT * FROM lead_search_profiles
          WHERE tenant_id = 'weareimpact' AND active = TRUE
          ORDER BY last_run_at ASC NULLS FIRST
          LIMIT ${maxProfiles}`
      : await sql`
          SELECT * FROM lead_search_profiles
          WHERE tenant_id = 'weareimpact' AND active = TRUE
            AND (
              last_run_at IS NULL
              OR (cadence = 'daily'  AND last_run_at < NOW() - INTERVAL '20 hours')
              OR (cadence = 'weekly' AND last_run_at < NOW() - INTERVAL '6 days')
            )
          ORDER BY last_run_at ASC NULLS FIRST
          LIMIT ${maxProfiles}`;

  const report: ProfileReport[] = [];

  for (const profile of profiles) {
    const left = timeBudgetMs - (Date.now() - startedAt);
    if (left < 60_000) break; // niet gestart → niet afgestempeld → volgende run eerst

    const name = profile.name as string;
    const cursor = Number(profile.cursor ?? 0);
    let entry: ProfileReport = { profile: name, found: 0, evaluated: 0, saved: 0, rejected: 0, provider: 'none', errors: [], status: 'ok' };

    try {
      const run = await runLeadSearch({
        query: profile.query as string,
        kind: ((profile.kind as string) === 'vacancy' ? 'vacancy' : 'search') as ProfileKind,
        maxResults: Number(profile.max_results ?? 10),
        scoringContext: (profile.scoring_context as string) || DEFAULT_SCORING_CONTEXT,
        offset: cursor,
        timeBudgetMs: left - 15_000,
      });

      const minScore = Number(profile.min_score ?? 6);
      let saved = 0;
      const below: Array<{ key: string; kind: string; outcome: string; reason?: string }> = [];
      for (const r of run.results) {
        if (r.aiScore == null) continue; // kwalificatie mislukt: niet opslaan, niet afwijzen → volgende run opnieuw
        if (r.aiScore >= minScore) {
          if (await saveSearchResult(r, profile.id as string)) saved++;
        } else {
          below.push({ key: r.domain, kind: 'domain', outcome: 'onder drempel', reason: `score ${r.aiScore}/10: ${r.aiRationale ?? ''}`.slice(0, 300) });
        }
      }
      await recordSeen(below);

      const providerDown = run.provider === 'none';
      entry = {
        profile: name,
        found: run.stats.candidates,
        evaluated: run.stats.evaluated,
        saved,
        rejected: run.rejected.length + below.length,
        provider: run.provider,
        errors: run.errors,
        status: providerDown ? 'error' : run.stats.candidates === 0 ? 'empty' : 'ok',
      };

      // Cursor: niets nieuws meer op deze pagina → volgende pagina; op het eind opnieuw beginnen.
      const nextCursor = providerDown ? cursor : run.freshCandidates === 0 ? (cursor + 1) % MAX_CURSOR : cursor;

      if (providerDown) {
        await sql`
          UPDATE lead_search_profiles SET
            last_status = 'error', last_error = ${run.errors.join(' · ').slice(0, 1000) || 'zoekprovider gaf niets terug'},
            updated_at = NOW()
          WHERE id = ${profile.id}`;
      } else {
        await sql`
          UPDATE lead_search_profiles SET
            last_run_at = NOW(), cursor = ${nextCursor},
            last_status = ${entry.status}, last_error = ${run.errors.length ? run.errors.join(' · ').slice(0, 1000) : null},
            last_found = ${entry.found}, last_saved = ${saved}, updated_at = NOW()
          WHERE id = ${profile.id}`;
      }
    } catch (err) {
      console.error(`Profiel "${name}" mislukt:`, err);
      entry = { ...entry, status: 'error', errors: [String(err).slice(0, 300)] };
      await sql`
        UPDATE lead_search_profiles SET last_status = 'error', last_error = ${String(err).slice(0, 1000)}, updated_at = NOW()
        WHERE id = ${profile.id}`.catch(() => {});
    }
    report.push(entry);
  }

  const totalSaved = report.reduce((s, r) => s + r.saved, 0);
  const totalFound = report.reduce((s, r) => s + r.found, 0);

  try {
    const status = report.some((r) => r.status === 'error')
      ? (report.every((r) => r.status === 'error') ? 'error' : 'partial')
      : 'ok';
    const firstError = report.flatMap((r) => r.errors)[0] ?? null;
    await sql`
      INSERT INTO lead_search_runs (trigger, profiles_run, total_found, total_saved, status, error, detail)
      VALUES (${trigger}, ${report.length}, ${totalFound}, ${totalSaved}, ${status}, ${firstError}, ${JSON.stringify(report)}::jsonb)
    `;
  } catch (logErr) {
    console.error('lead_search_runs insert failed:', logErr);
  }

  return { ran: report.length, totalSaved, totalFound, report };
}
