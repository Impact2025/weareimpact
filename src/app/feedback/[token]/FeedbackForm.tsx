'use client';

import { useState } from 'react';

export function FeedbackForm({
  token,
  firstName,
  subjectName,
}: {
  token: string;
  firstName: string | null;
  subjectName: string;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (score == null) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Versturen mislukt');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Dank je wel!</h1>
        <p className="text-slate-600">
          {score != null && score <= 6
            ? 'Ik neem snel contact met je op om te kijken wat er beter moet.'
            : 'Fijn om te horen. Ik neem het mee.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {firstName ? `Hoi ${firstName}, hoe bevalt het?` : 'Hoe bevalt het?'}
        </h1>
        <p className="text-slate-600">
          Hoe waarschijnlijk is het dat je WeAreImpact aanbeveelt aan een collega, op basis van {subjectName}?
        </p>
      </div>

      <div>
        <div className="grid grid-cols-11 gap-1" role="radiogroup" aria-label="Score van 0 tot 10">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={score === n}
              onClick={() => setScore(n)}
              className={`h-10 rounded-lg border text-sm font-semibold transition-colors ${
                score === n
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Zeker niet</span>
          <span>Zeker wel</span>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="comment" className="text-sm font-medium text-slate-700">
          {score != null && score <= 6 ? 'Wat moet er beter?' : 'Wil je nog iets toelichten? (optioneel)'}
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={score == null || sending}
        className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-40"
      >
        {sending ? 'Versturen…' : 'Verstuur'}
      </button>
    </div>
  );
}
