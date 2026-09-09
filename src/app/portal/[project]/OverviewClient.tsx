'use client';

import { useEffect, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
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

  useEffect(() => {
    fetch(`/api/crm/portal/${projectSlug}/${audience}/overview`)
      .then((res) => res.json())
      .then(setData);
  }, [projectSlug, audience]);

  if (!data) {
    return <p style={{ color: '#666' }}>Bezig met laden…</p>;
  }

  const { milestones, agreements, actions } = data;
  const nothingShared = milestones.length === 0 && agreements.length === 0 && actions.length === 0;

  if (nothingShared) {
    return (
      <p style={{ color: '#666' }}>
        Hier komt straks een overzicht van de voortgang te staan zodra er iets te delen is.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {milestones.length > 0 && (
        <section>
          <h2 style={sectionTitle}>Voortgang</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map((m) => (
              <div key={m.id} style={cardStyle}>
                <span style={badgeStyle(m.status)}>{STATUS_LABELS[m.status]}</span>
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
