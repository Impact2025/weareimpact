'use client';

import { useEffect, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';

export const VRAGEN_FASE = 'Vragen aan de klant';

export interface Reactie {
  author: string;
  body: string;
  created_at: string;
}

export interface Vraag {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  blocked: boolean;
  comments: Reactie[];
}

const GEEN_IDEE = 'Dat weet ik nog niet, ik zoek het uit.';

function datum(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long' });
}

/** Laatste antwoord van de klant: dat geldt als het huidige antwoord. */
function laatsteAntwoord(v: Vraag): Reactie | undefined {
  return [...v.comments].reverse().find((c) => c.author === 'klant');
}

export default function Vragen({
  items, projectSlug, audience, onAnswered,
}: {
  items: Vraag[];
  projectSlug: string;
  audience: Audience;
  onAnswered: (id: string, antwoord: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const beantwoord = items.filter((v) => v.status === 'done').length;
  const eerstOpen = items.find((v) => v.status !== 'done' && !v.blocked)?.id ?? null;
  const [alleenOpen, setAlleenOpen] = useState(beantwoord < items.length);
  const zichtbaar = alleenOpen ? items.filter((v) => v.status !== 'done') : items;
  const pct = items.length ? Math.round((beantwoord / items.length) * 100) : 0;

  return (
    <section
      aria-labelledby="vragen-kop"
      style={{
        background: '#fff', border: '1px solid #fde3b4', borderLeft: '4px solid #f59e0b', borderRadius: 12,
        boxShadow: '0 1px 3px rgba(16,24,40,0.06)', overflow: 'hidden',
      }}
    >
      <header style={{ padding: '16px 16px 12px' }}>
        <h2 id="vragen-kop" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Vragen aan jou</h2>
        <p style={{ margin: '4px 0 12px', fontSize: 14, color: '#555', lineHeight: 1.5 }}>
          Een kort antwoord per vraag is genoeg. Je antwoord wordt direct opgeslagen en je kunt het later nog aanpassen.
          Weet je het niet? Kies &ldquo;Weet ik nog niet&rdquo;, dan zoeken wij het mee uit.
        </p>
        <div
          role="progressbar"
          aria-valuenow={beantwoord}
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-label="Aantal beantwoorde vragen"
          style={{ height: 8, background: '#f1f2f6', borderRadius: 999, overflow: 'hidden' }}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', transition: 'width .3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
            {beantwoord} van {items.length} beantwoord
          </span>
          {beantwoord > 0 && beantwoord < items.length && (
            <button type="button" onClick={() => setAlleenOpen((v) => !v)} style={link}>
              {alleenOpen ? 'Ook beantwoorde tonen' : 'Alleen openstaande tonen'}
            </button>
          )}
        </div>
        {beantwoord === items.length && items.length > 0 && (
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#047857', fontWeight: 600 }}>
            Alles beantwoord. Dank je wel! Vincent verwerkt het en laat het je weten.
          </p>
        )}
      </header>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {zichtbaar.map((v) => (
          <VraagKaart
            key={v.id}
            v={v}
            nummer={items.indexOf(v) + 1}
            projectSlug={projectSlug}
            audience={audience}
            open={open === v.id || (open === null && v.id === eerstOpen && v.status !== 'done')}
            onToggle={() => setOpen(open === v.id ? '' : v.id)}
            onAnswered={(t) => {
              onAnswered(v.id, t);
              const volgende = items.find((x) => x.id !== v.id && x.status !== 'done' && !x.blocked);
              setOpen(volgende?.id ?? '');
            }}
          />
        ))}
      </ol>
    </section>
  );
}

function VraagKaart({
  v, nummer, projectSlug, audience, open, onToggle, onAnswered,
}: {
  v: Vraag; nummer: number; projectSlug: string; audience: Audience; open: boolean;
  onToggle: () => void; onAnswered: (antwoord: string) => void;
}) {
  const draftKey = `portal-antwoord:${projectSlug}:${v.id}`;
  const antwoord = laatsteAntwoord(v);
  const [tekst, setTekst] = useState('');
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const klaar = v.status === 'done';
  const reacties = v.comments.filter((c) => c.author !== 'klant');

  // Een concept blijft bewaard in deze browser, zodat een half antwoord niet verloren gaat.
  useEffect(() => {
    try {
      const d = window.localStorage.getItem(draftKey);
      if (d) setTekst(d);
      else if (antwoord) setTekst(antwoord.body);
    } catch {
      if (antwoord) setTekst(antwoord.body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  function wijzig(t: string) {
    setTekst(t);
    try {
      if (t) window.localStorage.setItem(draftKey, t);
      else window.localStorage.removeItem(draftKey);
    } catch {
      // negeren
    }
  }

  async function opslaan(t: string) {
    const schoon = t.trim();
    if (!schoon) return;
    setBusy(true);
    setFout(null);
    try {
      const res = await fetch(`/api/crm/portal/${projectSlug}/${audience}/milestones/${v.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: schoon, complete: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Opslaan lukte niet. Je tekst is bewaard, probeer het zo nog eens.');
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // negeren
      }
      onAnswered(schoon);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Opslaan lukte niet.');
    } finally {
      setBusy(false);
    }
  }

  const wijzigd = antwoord !== undefined && tekst.trim() === antwoord.body.trim();

  return (
    <li style={{ borderTop: '1px solid #f1f2f6' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: 'transparent',
          border: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit',
        }}
      >
        <span
          aria-hidden
          style={{
            flex: '0 0 auto', width: 26, height: 26, borderRadius: '50%', marginTop: 1,
            background: klaar ? '#10b981' : '#fff4e0', color: klaar ? '#fff' : '#a35b00',
            fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {klaar ? '✓' : nummer}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4 }}>{v.title}</span>
          {!open && klaar && antwoord && (
            <span style={{ display: 'block', marginTop: 4, fontSize: 13, color: '#047857', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Jouw antwoord: {antwoord.body}
            </span>
          )}
        </span>
        <span aria-hidden style={{ color: '#9ca3af', fontSize: 14, marginTop: 2 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px 54px' }}>
          {v.description && (
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{v.description}</p>
          )}
          {reacties.map((r, i) => (
            <div
              key={i}
              style={{ margin: '0 0 10px', padding: '8px 12px', background: '#eef2ff', borderRadius: 8, fontSize: 14, color: '#1a1a2e', lineHeight: 1.5 }}
            >
              <strong style={{ fontSize: 12, color: '#4338ca' }}>Vincent · {datum(r.created_at)}</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>
            </div>
          ))}
          <label htmlFor={`antwoord-${v.id}`} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>
            Jouw antwoord
          </label>
          <textarea
            id={`antwoord-${v.id}`}
            value={tekst}
            onChange={(e) => wijzig(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Typ hier je antwoord…"
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, fontSize: 15, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit' }}
          />
          {fout && (
            <p role="alert" style={{ margin: '6px 0 0', fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{fout}</p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              disabled={!tekst.trim() || busy || wijzigd}
              onClick={() => opslaan(tekst)}
              style={{
                ...knop, background: '#10b981', color: '#fff', border: '1px solid #10b981',
                opacity: !tekst.trim() || wijzigd ? 0.5 : 1,
              }}
            >
              {busy ? 'Bezig…' : klaar ? 'Antwoord bijwerken' : 'Antwoord opslaan'}
            </button>
            {!klaar && (
              <button type="button" disabled={busy} onClick={() => opslaan(GEEN_IDEE)} style={knop}>
                Weet ik nog niet
              </button>
            )}
            {klaar && wijzigd && <span style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>✓ Opgeslagen</span>}
          </div>
        </div>
      )}
    </li>
  );
}

const knop: React.CSSProperties = {
  padding: '8px 14px', fontSize: 14, fontWeight: 600, borderRadius: 8, border: '1px solid #d1d5db',
  background: '#fff', color: '#1a1a2e', cursor: 'pointer',
};

const link: React.CSSProperties = {
  background: 'transparent', border: 0, padding: 0, color: '#a35b00', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
};
