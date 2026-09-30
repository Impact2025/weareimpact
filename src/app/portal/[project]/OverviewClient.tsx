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
        <section style={{ ...cardStyle, borderColor: '#f59e0b', background: '#fffbeb' }}>
          <h2 style={sectionTitle}>Jouw actie</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {yourTurn.map((m) => (
              <li key={m.id} style={{ marginBottom: 4 }}>
                <strong>{m.title}</strong>
                {m.due_date && <span style={{ color: '#888', fontSize: 13 }}> · voor {new Date(m.due_date).toLocaleDateString('nl-NL')}</span>}
              </li>
            ))}
          </ul>
        </section>
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
