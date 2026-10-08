'use client';

import { useState } from 'react';

type Done = 'akkoord' | 'opmerking' | 'afwijzen';

export function ReviewActions({ token, status, decided }: { token: string; status: string; decided: 'akkoord' | 'afgewezen' | null }) {
  const [mode, setMode] = useState<'keuze' | 'opmerking' | 'afwijzen'>('keuze');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(decided === 'akkoord' ? 'akkoord' : decided === 'afgewezen' ? 'afwijzen' : null);

  async function send(body: Record<string, unknown>, result: Done) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/showcase/review/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Versturen mislukt');
      setDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt');
    } finally {
      setBusy(false);
    }
  }

  const card = 'mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8';

  if (done) {
    return (
      <section className={`${card} border-green-200 text-center`}>
        <h2 className="text-2xl font-bold text-slate-900">
          {done === 'akkoord' ? 'Dank je wel, akkoord ontvangen' : done === 'opmerking' ? 'Dank je wel, ik pas het aan' : 'Helder, dan doen we het niet'}
        </h2>
        <p className="mt-2 text-slate-600">
          {done === 'akkoord'
            ? 'Ik laat het je weten zodra de pagina live staat.'
            : done === 'opmerking'
              ? 'Je krijgt een nieuwe versie te zien zodra ik hem heb aangepast.'
              : 'Er verschijnt niets op de site. Dank voor de fijne samenwerking.'}
        </p>
      </section>
    );
  }

  if (status !== 'klant_review') {
    return (
      <section className={`${card} border-slate-200 text-center`}>
        <p className="text-slate-600">Op deze tekst is nu niets te beslissen. Ik neem contact op als er een nieuwe versie klaarstaat.</p>
      </section>
    );
  }

  return (
    <section className={`${card} border-orange-100`} aria-labelledby="beslis">
      <h2 id="beslis" className="text-xl font-bold text-slate-900">Wat vind je?</h2>

      {mode === 'keuze' && (
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="naam" className="text-sm font-medium text-slate-700">Typ je naam om akkoord te geven</label>
            <input
              id="naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <p className="mt-1 text-xs text-slate-500">Hiermee ga je akkoord met precies de tekst hierboven. Je kunt dit later laten intrekken.</p>
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button
            type="button"
            disabled={busy || name.trim().length < 2}
            onClick={() => send({ action: 'akkoord', name }, 'akkoord')}
            className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-40"
          >
            {busy ? 'Versturen…' : 'Akkoord, publiceer dit'}
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setMode('opmerking')} className="flex-1 rounded-lg border border-slate-200 py-3 font-semibold text-slate-700 hover:border-orange-300">
              Ik wil iets laten aanpassen
            </button>
            <button type="button" onClick={() => setMode('afwijzen')} className="flex-1 rounded-lg border border-slate-200 py-3 font-semibold text-slate-700 hover:border-orange-300">
              Liever niet meedoen
            </button>
          </div>
        </div>
      )}

      {mode === 'opmerking' && (
        <div className="mt-5 space-y-4">
          <label htmlFor="opm" className="text-sm font-medium text-slate-700">Wat moet er anders?</label>
          <textarea
            id="opm"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || text.trim().length < 3}
              onClick={() => send({ action: 'opmerking', text }, 'opmerking')}
              className="flex-1 rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-40"
            >
              {busy ? 'Versturen…' : 'Verstuur'}
            </button>
            <button type="button" onClick={() => setMode('keuze')} className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-600">
              Terug
            </button>
          </div>
        </div>
      )}

      {mode === 'afwijzen' && (
        <div className="mt-5 space-y-4">
          <p className="text-slate-700">Weet je het zeker? Er verschijnt dan niets op de site, en je hoeft geen reden te geven.</p>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => send({ action: 'afwijzen' }, 'afwijzen')}
              className="flex-1 rounded-lg bg-slate-900 py-3 font-semibold text-white disabled:opacity-40"
            >
              {busy ? 'Versturen…' : 'Ja, niet publiceren'}
            </button>
            <button type="button" onClick={() => setMode('keuze')} className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-600">
              Terug
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
