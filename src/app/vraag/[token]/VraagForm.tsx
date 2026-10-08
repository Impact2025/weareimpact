'use client';

import { useState } from 'react';
import type { RequestView } from '@/lib/showcase/flow';
import { WORDS, type Question } from '@/lib/showcase/moments';

type AnswerValue = string | number | string[] | Record<string, string> | undefined;

const ring = 'focus:outline-none focus:ring-2 focus:ring-orange-200';
const chip = (on: boolean) =>
  `rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${ring} ${
    on ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-200 text-slate-700 hover:border-orange-300'
  }`;

export function VraagForm({ view }: { view: RequestView }) {
  // Opende de klant een link die al beantwoord was? Dan zeggen we dat, in plaats van "dank je wel".
  const [answeredOnLoad] = useState(view.answered);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [step, setStep] = useState<'vragen' | 'vervolg' | 'klaar'>(
    view.answered ? (view.followupQuestion && !view.followupDone ? 'vervolg' : 'klaar') : 'vragen',
  );
  const [followup, setFollowup] = useState<string | null>(view.followupQuestion);
  const [followupText, setFollowupText] = useState('');
  const [thanks, setThanks] = useState<string | null>(view.thanks);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: AnswerValue) => setAnswers((a) => ({ ...a, [key]: value }));

  function missing(): string | null {
    for (const q of view.questions) {
      if (q.optional) continue;
      const v = answers[q.key];
      if (q.type === 'scope') {
        const map = (v ?? {}) as Record<string, string>;
        if (view.scopeItems.some((i) => !map[i])) return 'Beantwoord elk onderdeel.';
      } else if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
        return 'Beantwoord eerst de vragen hierboven.';
      }
    }
    return null;
  }

  async function post(body: unknown) {
    const res = await fetch(`/api/showcase/${view.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Versturen mislukt');
    return data as { followup?: string | null; thanks?: string };
  }

  async function submit() {
    const problem = missing();
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      const data = await post({ answers });
      setThanks(data.thanks ?? null);
      if (data.followup) {
        setFollowup(data.followup);
        setStep('vervolg');
      } else setStep('klaar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt');
    } finally {
      setBusy(false);
    }
  }

  async function sendFollowup() {
    setBusy(true);
    setError(null);
    try {
      await post({ action: 'followup', text: followupText });
      setStep('klaar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'klaar') {
    const before = answeredOnLoad;
    return (
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{before ? 'Je antwoord is al binnen' : 'Dank je wel!'}</h1>
        <p className="text-slate-600">{before ? 'Dank je wel. Je hoeft niets meer te doen.' : (thanks ?? 'Je antwoord is binnen.')}</p>
        <p className="pt-2 text-sm text-slate-400">Vincent leest elk antwoord zelf.</p>
      </div>
    );
  }

  if (step === 'vervolg' && followup) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Nog één vraag, helemaal optioneel</p>
          <h1 className="text-xl font-bold text-slate-900">{followup}</h1>
        </div>
        <textarea
          rows={4}
          value={followupText}
          onChange={(e) => setFollowupText(e.target.value)}
          aria-label={followup}
          className={`w-full rounded-lg border border-slate-200 p-3 text-sm ${ring}`}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={sendFollowup}
            disabled={busy || followupText.trim().length < 2}
            className="flex-1 rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-40"
          >
            {busy ? 'Versturen…' : 'Verstuur'}
          </button>
          <button
            type="button"
            onClick={() => setStep('klaar')}
            className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:border-orange-300"
          >
            Dit was het
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">{view.heading}</h1>
        <p className="text-slate-600">{view.intro}</p>
      </div>

      {view.questions.map((q) => (
        <QuestionField key={q.key} q={q} value={answers[q.key]} onChange={(v) => set(q.key, v)} scopeItems={view.scopeItems} />
      ))}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-40"
      >
        {busy ? 'Versturen…' : 'Verstuur'}
      </button>
    </div>
  );
}

function QuestionField({
  q,
  value,
  onChange,
  scopeItems,
}: {
  q: Question;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  scopeItems: string[];
}) {
  const id = `q-${q.key}`;
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-900">
        {q.label}
        {q.optional && <span className="ml-1 font-normal text-slate-400">(optioneel)</span>}
      </legend>
      {q.hint && <p className="text-sm text-slate-500">{q.hint}</p>}

      {q.type === 'text' && (
        <textarea
          id={id}
          rows={3}
          value={(value as string) ?? ''}
          placeholder={q.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-label={q.label}
          className={`w-full rounded-lg border border-slate-200 p-3 text-sm ${ring}`}
        />
      )}

      {q.type === 'number' && (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            max={400}
            step="0.5"
            value={(value as number | string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            aria-label={q.label}
            className={`w-28 rounded-lg border border-slate-200 p-3 text-sm ${ring}`}
          />
          <span className="text-sm text-slate-500">uur per week</span>
        </div>
      )}

      {q.type === 'score5' && (
        <div>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={q.label}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)} className={chip(value === n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Niet goed</span>
            <span>Heel goed</span>
          </div>
        </div>
      )}

      {q.type === 'nps' && (
        <div>
          <div className="grid grid-cols-11 gap-1" role="radiogroup" aria-label={q.label}>
            {Array.from({ length: 11 }, (_, n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value === n}
                onClick={() => onChange(n)}
                className={`h-10 rounded-lg border text-sm font-semibold transition-colors ${ring} ${
                  value === n ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Zeker niet</span>
            <span>Zeker wel</span>
          </div>
        </div>
      )}

      {q.type === 'choice' && (
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={q.label}>
          {q.options?.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={value === o.value}
              onClick={() => onChange(o.value)}
              className={`${chip(value === o.value)} text-left`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {q.type === 'words' && (
        <div className="flex flex-wrap gap-2">
          {WORDS.map((w) => {
            const list = (value as string[]) ?? [];
            const on = list.includes(w.value);
            return (
              <button
                key={w.value}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? list.filter((x) => x !== w.value) : list.length >= 4 ? list : [...list, w.value])}
                className={chip(on)}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      )}

      {q.type === 'scope' && (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {scopeItems.map((item) => {
            const map = (value as Record<string, string>) ?? {};
            return (
              <li key={item} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-800">{item}</span>
                <div className="flex gap-1" role="radiogroup" aria-label={item}>
                  {(['ja', 'deels', 'nee'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={map[item] === opt}
                      onClick={() => onChange({ ...map, [item]: opt })}
                      className={chip(map[item] === opt)}
                    >
                      {opt === 'ja' ? 'Ja' : opt === 'deels' ? 'Deels' : 'Nee'}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}
