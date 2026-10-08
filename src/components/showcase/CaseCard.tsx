'use client';

import { useState } from 'react';
import type { CaseDraft } from '@/lib/showcase/flow';
import type { CaseRecord } from '@/lib/showcase/case';

export interface DraftRow {
  dealId: string;
  title: string;
  stage: string;
  draft: CaseDraft;
  case: CaseRecord | null;
  problems: string[];
}

const CASE_STATUS: Record<string, { label: string; tone: string }> = {
  concept: { label: 'Concept', tone: 'bg-slate-100 text-slate-700' },
  klant_review: { label: 'Bij klant ter goedkeuring', tone: 'bg-blue-100 text-blue-700' },
  klant_akkoord: { label: 'Klant akkoord, klaar om te publiceren', tone: 'bg-green-100 text-green-700' },
  gepubliceerd: { label: 'Gepubliceerd', tone: 'bg-green-600 text-white' },
  ingetrokken: { label: 'Ingetrokken', tone: 'bg-amber-100 text-amber-800' },
};

// Redactie van de showcase per deal: toestemming, tekst, citaten, naar de klant, publiceren.
export function CaseCard({
  row,
  act,
  busy,
}: {
  row: DraftRow;
  act: (key: string, body: Record<string, unknown>) => Promise<void>;
  busy: string | null;
}) {
  const { draft, dealId } = row;
  const c = row.case;
  const status = c?.status ?? 'concept';
  const locked = status === 'gepubliceerd';
  const [headline, setHeadline] = useState(c?.headline || draft.headline || '');
  const [intro, setIntro] = useState(c?.intro ?? '');
  const [displayName, setDisplayName] = useState(c?.displayName ?? '');
  const [authorName, setAuthorName] = useState(c?.authorName ?? '');
  const [authorRole, setAuthorRole] = useState(c?.authorRole ?? '');
  const [keys, setKeys] = useState<string[]>(c?.quoteKeys ?? []);
  const [suggesting, setSuggesting] = useState(false);
  const key = `case-${dealId}`;

  const m = draft.metrics;
  const tempo: string[] = [];
  if (m.daysIntakeToQuote != null) tempo.push(`${m.daysIntakeToQuote} dagen van eerste gesprek naar offerte`);
  if (m.daysQuoteToAccept != null) tempo.push(`${m.daysQuoteToAccept} dagen tot akkoord`);
  if (m.daysAcceptToLive != null) tempo.push(`${m.daysAcceptToLive} dagen van akkoord naar livegang`);
  if (m.daysEarlyVsPlan != null) {
    tempo.push(m.daysEarlyVsPlan >= 0 ? `${m.daysEarlyVsPlan} dagen eerder dan gepland` : `${Math.abs(m.daysEarlyVsPlan)} dagen later dan gepland`);
  }
  if (m.milestonesTotal > 0) tempo.push(`${m.milestonesDone} van ${m.milestonesTotal} milestones klaar`);

  const save = () =>
    act(key, { action: 'case-save', dealId, headline, intro, displayName, authorName, authorRole, quoteKeys: keys });

  async function suggest() {
    setSuggesting(true);
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'case-suggest', dealId }),
      });
      const json = await res.json();
      if (res.ok && json.intro) setIntro(json.intro);
    } finally {
      setSuggesting(false);
    }
  }

  const field = 'mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm disabled:bg-slate-50';
  const st = CASE_STATUS[status] ?? CASE_STATUS.concept;

  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Showcase: {row.title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}>{st.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-slate-700">Toestemming:</span>
        {(['onbekend', 'naam', 'anoniem', 'nee'] as const).map((v) => (
          <button
            key={v}
            disabled={busy === `c-${dealId}` || locked}
            onClick={() => act(`c-${dealId}`, { action: 'consent', dealId, value: v })}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
              draft.consent === v ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {v === 'onbekend' ? 'Onbekend' : v === 'naam' ? 'Met naam' : v === 'anoniem' ? 'Anoniem' : 'Nee'}
          </button>
        ))}
      </div>

      {c?.clientComment && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">Opmerking van de klant</p>
          <p className="mt-1">{c.clientComment}</p>
        </div>
      )}
      {c?.approvedName && (status === 'klant_akkoord' || status === 'gepubliceerd') && (
        <p className="mt-3 text-sm text-green-700">
          Akkoord van {c.approvedName}
          {c.approvedAt ? ` op ${new Date(c.approvedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}` : ''}.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600 sm:col-span-2">
          Kop
          <input
            disabled={locked}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={draft.headline ?? 'Bijvoorbeeld: Van 15 naar 2 uur per week'}
            className={field}
          />
        </label>
        <label className="text-xs font-medium text-slate-600 sm:col-span-2">
          <span className="flex items-center justify-between">
            Introductie
            <button type="button" disabled={locked || suggesting} onClick={suggest} className="font-semibold text-orange-700 disabled:opacity-40">
              {suggesting ? 'Iris schrijft…' : 'Laat Iris een voorstel maken'}
            </button>
          </span>
          <textarea disabled={locked} rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} className={field} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          {draft.consent === 'anoniem' ? 'Anonieme omschrijving' : 'Naam zoals op de site'}
          <input
            disabled={locked}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={draft.consent === 'anoniem' ? 'een welzijnsorganisatie' : 'Bedrijfsnaam'}
            className={field}
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Functie onder het citaat
          <input disabled={locked} value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} placeholder="Oprichter" className={field} />
        </label>
        {draft.consent !== 'anoniem' && (
          <label className="text-xs font-medium text-slate-600">
            Naam onder het citaat
            <input disabled={locked} value={authorName} onChange={(e) => setAuthorName(e.target.value)} className={field} />
          </label>
        )}
      </div>

      {draft.headline && (
        <p className="mt-4 text-sm text-slate-700">
          Gemeten urenwinst:{' '}
          <strong>
            {draft.hoursBefore} naar {draft.hoursAfter} uur per week
          </strong>
          . De klant bevestigt dit bij het akkoord op de tekst.
        </p>
      )}
      {tempo.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {tempo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}

      {draft.quotes.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">Kies de letterlijke citaten (maximaal 8)</p>
          {draft.quotes.map((q) => (
            <label key={q.key} className="flex cursor-pointer gap-3 rounded-lg bg-white p-3">
              <input
                type="checkbox"
                disabled={locked}
                checked={keys.includes(q.key)}
                onChange={(e) => setKeys((k) => (e.target.checked ? [...k, q.key] : k.filter((x) => x !== q.key)))}
                className="mt-1"
              />
              <span>
                <span className="block text-slate-900">&ldquo;{q.text}&rdquo;</span>
                <span className="block text-xs text-slate-500">
                  {q.moment}: {q.question}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {row.problems.length > 0 && status !== 'gepubliceerd' && status !== 'klant_akkoord' && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Nog nodig voordat het naar de klant kan</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600">
            {row.problems.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {!locked && (
          <button
            disabled={busy === key}
            onClick={save}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-40"
          >
            Opslaan
          </button>
        )}
        {(status === 'concept' || status === 'klant_review' || status === 'ingetrokken') && (
          <button
            disabled={busy === key}
            onClick={async () => {
              await save();
              await act(key, { action: 'case-send', dealId });
            }}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {status === 'klant_review' ? 'Opnieuw naar klant sturen' : 'Stuur naar klant ter goedkeuring'}
          </button>
        )}
        {status === 'klant_akkoord' && (
          <button
            disabled={busy === key}
            onClick={() => act(key, { action: 'case-publish', dealId })}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Publiceer op de site
          </button>
        )}
        {status === 'gepubliceerd' && c?.slug && (
          <>
            <a href={`/showcases/${c.slug}`} target="_blank" rel="noopener" className="text-sm font-semibold text-orange-700">
              Bekijk op de site
            </a>
            <button
              disabled={busy === key}
              onClick={() => act(key, { action: 'case-unpublish', dealId })}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Intrekken
            </button>
          </>
        )}
        {c?.reviewToken && status === 'klant_review' && (
          <a href={`/showcase-akkoord/${c.reviewToken}`} target="_blank" rel="noopener" className="text-sm font-semibold text-orange-700">
            Bekijk wat de klant ziet
          </a>
        )}
      </div>
    </section>
  );
}
