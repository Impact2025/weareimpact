'use client';

import { useEffect, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  phase: string | null;
  owner: string;
  blocked: boolean;
  completed_at: string | null;
}

interface Agreement {
  id: string;
  title: string;
  description: string | null;
  decided_at: string;
}

interface Action {
  id: string;
  title: string;
  owner: string;
  status: 'open' | 'done';
  due_date: string | null;
}

const STATUS_LABELS: Record<Milestone['status'], string> = {
  todo: 'Nog te doen',
  in_progress: 'Mee bezig',
  done: 'Klaar',
};

export default function OverviewClient({ projectSlug, audience }: { projectSlug: string; audience: Audience }) {
  const [data, setData] = useState<{
    milestones: Milestone[];
    agreements: Agreement[];
    actions: Action[];
  } | null>(null);

  const [failed, setFailed] = useState(false);
  // Moment van het vorige bezoek (per browser); wat daarna klaar kwam krijgt een "Nieuw"-label.
  const [lastSeen, setLastSeen] = useState<number | null>(null);

  useEffect(() => {
    const key = `portal-last-seen:${projectSlug}`;
    try {
      const stored = window.localStorage.getItem(key);
      setLastSeen(stored ? Number(stored) : null);
    } catch {
      // localStorage kan geblokkeerd zijn; dan geen "Nieuw"-labels.
    }

    fetch(`/api/crm/portal/${projectSlug}/${audience}/overview`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json) => {
        setData(json);
        try {
          window.localStorage.setItem(key, String(Date.now()));
        } catch {
          // negeren
        }
      })
      .catch(() => setFailed(true));
  }, [projectSlug, audience]);

  if (failed) {
    return (
      <p style={{ color: '#666' }}>
        Je sessie is verlopen. Open de link uit je laatste mail opnieuw, of vraag Vincent om een nieuwe inloglink.
      </p>
    );
  }

  if (!data) {
    return <p style={{ color: '#666' }}>Bezig met laden…</p>;
  }

  const isNew = (m: Milestone) =>
    lastSeen !== null && m.status === 'done' && m.completed_at !== null && new Date(m.completed_at).getTime() > lastSeen;
  const recentlyDone = data.milestones
    .filter((m) => m.status === 'done' && m.completed_at)
    .sort((a, b) => new Date(b.completed_at as string).getTime() - new Date(a.completed_at as string).getTime())
    .slice(0, 6);

  const { milestones, agreements, actions } = data;
  const nothingShared = milestones.length === 0 && agreements.length === 0 && actions.length === 0;

  if (nothingShared) {
    return (
      <p style={{ color: '#666' }}>
        Hier komt straks een overzicht van de voortgang te staan zodra er iets te delen is.
      </p>
    );
  }

  const yourTurn = milestones.filter((m) => m.owner === 'klant' && m.status !== 'done' && !m.blocked);
  const phaseOrder: string[] = [];
  for (const m of milestones) {
    const p = m.phase ?? 'Overig';
    if (!phaseOrder.includes(p)) phaseOrder.push(p);
  }
  const showPhases = milestones.some((m) => m.phase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {yourTurn.length > 0 && (
        <YourTurn
          items={yourTurn}
          projectSlug={projectSlug}
          audience={audience}
          onCompleted={(id) =>
            setData((d) =>
              d
                ? {
                    ...d,
                    milestones: d.milestones.map((m) =>
                      m.id === id ? { ...m, status: 'done', completed_at: new Date().toISOString() } : m,
                    ),
                  }
                : d,
            )
          }
        />
      )}

      {showPhases && (
        <section>
          <h2 style={sectionTitle}>Lancering</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {phaseOrder.map((phase) => {
              const items = milestones.filter((m) => (m.phase ?? 'Overig') === phase);
              const done = items.filter((m) => m.status === 'done').length;
              const pct = Math.round((done / items.length) * 100);
              return (
                <div key={phase}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{phase}</span><span style={{ color: '#888' }}>{done}/{items.length}</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : '#f97316' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {recentlyDone.length > 0 && (
        <section>
          <h2 style={sectionTitle}>Recent afgerond</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: '2px solid #d1fae5' }}>
            {recentlyDone.map((m) => (
              <li key={m.id} style={{ position: 'relative', padding: '0 0 12px 16px' }}>
                <span
                  style={{
                    position: 'absolute', left: -6, top: 5, width: 10, height: 10,
                    borderRadius: '50%', background: '#10b981',
                  }}
                />
                <div style={{ fontSize: 12, color: '#888' }}>{fmtDone(m.completed_at as string)}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {m.title} {isNew(m) && <span style={newBadge}>Nieuw</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {milestones.length > 0 && (
        <section>
          <h2 style={sectionTitle}>Voortgang</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map((m) => (
              <div key={m.id} style={cardStyle}>
                <span style={badgeStyle(m.status)}>{STATUS_LABELS[m.status]}</span>
                {isNew(m) && <span style={{ ...newBadge, marginLeft: 6 }}>Nieuw</span>}
                {m.status === 'done' && m.completed_at && (
                  <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{fmtDone(m.completed_at)}</span>
                )}
                <p style={{ margin: '6px 0 0', fontWeight: 600 }}>{m.title}</p>
                {m.description && <p style={{ margin: '4px 0 0', color: '#555', fontSize: 14 }}>{m.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {agreements.length > 0 && (
        <section>
          <h2 style={sectionTitle}>Afspraken</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {agreements.map((a) => (
              <div key={a.id} style={cardStyle}>
                <p style={{ margin: 0, fontWeight: 600 }}>{a.title}</p>
                {a.description && <p style={{ margin: '4px 0 0', color: '#555', fontSize: 14 }}>{a.description}</p>}
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: 12 }}>
                  {new Date(a.decided_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {actions.length > 0 && (
        <section>
          <h2 style={sectionTitle}>Actiepunten</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map((a) => (
              <div key={a.id} style={cardStyle}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    textDecoration: a.status === 'done' ? 'line-through' : 'none',
                    color: a.status === 'done' ? '#888' : '#1a1a2e',
                  }}
                >
                  {a.title}
                </p>
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: 12 }}>bij: {a.owner}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const VISIBLE_ACTIONS = 3;

const actionBtn: React.CSSProperties = {
  padding: '6px 12px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
  background: '#fff', color: '#1a1a2e', border: '1px solid #d1d5db',
};

function dueInfo(due: string | null): { label: string; bg: string; fg: string } | null {
  if (!due) return null;
  const day = (d: Date) => new Date(d.toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' })).getTime();
  const diff = Math.round((day(new Date(due)) - day(new Date())) / 86400000);
  const date = new Date(due).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'short' });
  if (diff < 0) return { label: `Verlopen · ${date}`, bg: '#fee2e2', fg: '#b91c1c' };
  if (diff === 0) return { label: 'Vandaag', bg: '#ffedd5', fg: '#c2410c' };
  if (diff === 1) return { label: 'Morgen', bg: '#ffedd5', fg: '#c2410c' };
  return { label: `Voor ${date}`, bg: '#f1f2f6', fg: '#555' };
}

function YourTurn({
  items, projectSlug, audience, onCompleted,
}: { items: Milestone[]; projectSlug: string; audience: Audience; onCompleted: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(m: Milestone, payload: { complete?: boolean; comment?: string }) {
    setBusy(m.id);
    setError(null);
    try {
      const res = await fetch(`/api/crm/portal/${projectSlug}/${audience}/milestones/${m.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Opslaan lukte niet. Probeer het zo nog eens.');
      if (payload.comment) {
        setOpenComment(null);
        setDraft('');
      }
      setNotice(payload.complete ? 'Afgevinkt. Vincent krijgt hier bericht van.' : 'Je opmerking is verstuurd naar Vincent.');
      window.setTimeout(() => setNotice(null), 5000);
      if (payload.complete) onCompleted(m.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Opslaan lukte niet.');
    } finally {
      setBusy(null);
    }
  }

  const sorted = [...items].sort((a, b) => {
    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });
  const shown = expanded ? sorted : sorted.slice(0, VISIBLE_ACTIONS);
  const hidden = sorted.length - shown.length;

  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #fde3b4',
        borderLeft: '4px solid #f59e0b',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
        overflow: 'hidden',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Jouw actie</h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#777' }}>Hier wachten we op jou</p>
        </div>
        <span style={{ background: '#fff4e0', color: '#a35b00', fontWeight: 700, fontSize: 13, padding: '3px 10px', borderRadius: 999 }}>
          {items.length} {items.length === 1 ? 'punt' : 'punten'}
        </span>
      </header>
      {notice && (
        <div role="status" style={{ background: '#ecfdf5', color: '#047857', fontSize: 13, fontWeight: 600, padding: '8px 16px' }}>
          ✓ {notice}
        </div>
      )}
      {error && (
        <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', fontSize: 13, fontWeight: 600, padding: '8px 16px' }}>
          {error}
        </div>
      )}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {shown.map((m, i) => {
          const due = dueInfo(m.due_date);
          return (
            <li
              key={m.id}
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', borderTop: '1px solid #f1f2f6' }}
            >
              <span
                style={{
                  flex: '0 0 auto', width: 24, height: 24, borderRadius: '50%', background: '#fff4e0', color: '#a35b00',
                  fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4 }}>{m.title}</div>
                {m.description && <div style={{ fontSize: 13, color: '#666', marginTop: 3, lineHeight: 1.5 }}>{m.description}</div>}
                {due && (
                  <span
                    style={{
                      display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 600,
                      background: due.bg, color: due.fg, padding: '2px 8px', borderRadius: 999,
                    }}
                  >
                    {due.label}
                  </span>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={busy === m.id}
                    onClick={() => submit(m, { complete: true })}
                    style={{ ...actionBtn, background: '#10b981', color: '#fff', border: '1px solid #10b981' }}
                  >
                    {busy === m.id ? 'Bezig…' : '✓ Afvinken'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpenComment(openComment === m.id ? null : m.id); setDraft(''); }}
                    style={actionBtn}
                  >
                    Opmerking
                  </button>
                </div>
                {openComment === m.id && (
                  <div style={{ marginTop: 10 }}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder="Schrijf hier je opmerking of vraag…"
                      style={{ width: '100%', boxSizing: 'border-box', padding: 8, fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit' }}
                    />
                    <button
                      type="button"
                      disabled={!draft.trim() || busy === m.id}
                      onClick={() => submit(m, { comment: draft })}
                      style={{ ...actionBtn, marginTop: 6, background: '#1a1a2e', color: '#fff', border: '1px solid #1a1a2e', opacity: draft.trim() ? 1 : 0.5 }}
                    >
                      Versturen
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {sorted.length > VISIBLE_ACTIONS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: '100%', padding: '10px 16px', border: 0, borderTop: '1px solid #f1f2f6', background: '#fafafa',
            color: '#a35b00', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
          }}
        >
          {expanded ? 'Minder tonen' : `Toon ${hidden} meer`}
        </button>
      )}
    </section>
  );
}

function fmtDone(date: string): string {
  return new Date(date).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long' });
}

const newBadge: React.CSSProperties = {
  background: '#fff4e0',
  color: '#a35b00',
  fontSize: 11,
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: 6,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1a1a2e',
  marginBottom: 8,
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: 12,
};

function badgeStyle(status: Milestone['status']): React.CSSProperties {
  const colors: Record<Milestone['status'], { bg: string; fg: string }> = {
    todo: { bg: '#f1f2f6', fg: '#555' },
    in_progress: { bg: '#fff4e0', fg: '#a35b00' },
    done: { bg: '#eef7ef', fg: '#2f7a3c' },
  };
  const c = colors[status];
  return {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    background: c.bg,
    color: c.fg,
    padding: '2px 8px',
    borderRadius: 999,
  };
}
