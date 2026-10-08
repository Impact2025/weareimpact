'use client';

import { useEffect, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';
import { VRAGEN_FASE } from './Vragen';

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

type Doel = 'chat' | 'vragen' | 'overview';

// Uren staan in de titel, bv. "Admin en CRM werkend (22 uur)".
function urenUitTitel(title: string): number {
  const m = title.match(/\((\d+(?:[.,]\d+)?)\s*uur\)/i);
  return m ? Number(m[1].replace(',', '.')) : 0;
}

function schoneTitel(title: string): string {
  return title.replace(/\s*\(\d+(?:[.,]\d+)?\s*uur\)/i, '');
}

export default function DashboardClient({
  projectSlug, audience, openVragen, onNavigate,
}: { projectSlug: string; audience: Audience; openVragen: number; onNavigate: (t: Doel) => void }) {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/crm/portal/${projectSlug}/${audience}/overview`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json) => setMilestones((json.milestones as Milestone[]).filter((m) => m.phase !== VRAGEN_FASE)))
      .catch(() => setFailed(true));
  }, [projectSlug, audience]);

  if (failed) {
    return <p style={{ color: '#666' }}>Je sessie is verlopen. Open de link uit je laatste mail opnieuw, of vraag Vincent om een nieuwe inloglink.</p>;
  }
  if (!milestones) return <p style={{ color: '#666' }}>Bezig met laden…</p>;

  const totaal = milestones.length;
  const klaar = milestones.filter((m) => m.status === 'done');
  const bezig = milestones.filter((m) => m.status === 'in_progress');
  const nog = milestones.filter((m) => m.status === 'todo');
  const pct = totaal ? Math.round((klaar.length / totaal) * 100) : 0;

  const urenTotaal = milestones.reduce((s, m) => s + urenUitTitel(m.title), 0);
  const urenKlaar = klaar.reduce((s, m) => s + urenUitTitel(m.title), 0);

  const eerstvolgende = nog.filter((m) => !m.blocked).slice(0, 3);
  const jouwActies = milestones.filter((m) => m.owner === 'klant' && m.status !== 'done' && !m.blocked).length;
  const laatsteKlaar = [...klaar]
    .filter((m) => m.completed_at)
    .sort((a, b) => new Date(b.completed_at as string).getTime() - new Date(a.completed_at as string).getTime())[0];

  const fases: string[] = [];
  for (const m of milestones) {
    const p = m.phase ?? 'Overig';
    if (!fases.includes(p)) fases.push(p);
  }

  if (totaal === 0) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: 28 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#1a1a2e' }}>Het plan wordt uitgewerkt</p>
        <p style={{ margin: '6px 0 0', color: '#666', fontSize: 14 }}>
          Zodra er mijlpalen zijn, zie je hier de voortgang. Heb je intussen een vraag? Stel hem gerust.
        </p>
        <button type="button" onClick={() => onNavigate('chat')} style={{ ...knop, marginTop: 14 }}>Stel een vraag</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {openVragen > 0 && (
        <button type="button" onClick={() => onNavigate('vragen')} style={actieBanner}>
          <span>
            <strong>Er {openVragen === 1 ? 'wacht 1 vraag' : `wachten ${openVragen} vragen`} op jou</strong>
            <span style={{ display: 'block', fontSize: 13, color: '#8a5200', marginTop: 2 }}>Zo kunnen we zonder wachttijd verder.</span>
          </span>
          <span style={{ fontWeight: 700 }}>Beantwoorden →</span>
        </button>
      )}
      {openVragen === 0 && jouwActies > 0 && (
        <button type="button" onClick={() => onNavigate('overview')} style={actieBanner}>
          <span><strong>{jouwActies} {jouwActies === 1 ? 'punt wacht' : 'punten wachten'} op jou</strong></span>
          <span style={{ fontWeight: 700 }}>Bekijken →</span>
        </button>
      )}

      <section style={{ ...card, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#777', fontWeight: 600 }}>Totale voortgang</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1 }}>{pct}%</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: '#666' }}>
            {klaar.length} van {totaal} onderdelen klaar
            {urenTotaal > 0 && <div>{urenKlaar} van {urenTotaal} uur opgeleverd</div>}
          </div>
        </div>
        <div style={{ height: 10, background: '#e5e7eb', borderRadius: 5, overflow: 'hidden', marginTop: 14 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : '#f97316', transition: 'width .4s' }} />
        </div>
        {laatsteKlaar?.completed_at && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
            Laatst afgerond: <strong style={{ color: '#1a1a2e' }}>{schoneTitel(laatsteKlaar.title)}</strong>
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <Tegel getal={klaar.length} label="Klaar" kleur="#2f7a3c" bg="#eef7ef" />
        <Tegel getal={bezig.length} label="Mee bezig" kleur="#a35b00" bg="#fff4e0" />
        <Tegel getal={nog.length} label="Nog te doen" kleur="#555" bg="#f1f2f6" />
      </div>

      {bezig.length > 0 && (
        <section>
          <h2 style={kop}>Hier werken we nu aan</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bezig.map((m) => <Rij key={m.id} m={m} accent="#f59e0b" />)}
          </div>
        </section>
      )}

      {eerstvolgende.length > 0 && (
        <section>
          <h2 style={kop}>Hierna</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {eerstvolgende.map((m) => <Rij key={m.id} m={m} accent="#d1d5db" />)}
          </div>
        </section>
      )}

      {fases.length > 1 && (
        <section>
          <h2 style={kop}>Per onderdeel</h2>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fases.map((fase) => {
              const items = milestones.filter((m) => (m.phase ?? 'Overig') === fase);
              const done = items.filter((m) => m.status === 'done').length;
              const p = Math.round((done / items.length) * 100);
              return (
                <div key={fase}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{fase}</span><span style={{ color: '#888' }}>{done}/{items.length}</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ width: `${p}%`, height: '100%', background: p === 100 ? '#10b981' : '#f97316' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section style={{ ...card, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15 }}>Een vraag of iets te delen?</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Stel een vraag, of deel een document (pdf of tekst).</div>
        </div>
        <button type="button" onClick={() => onNavigate('chat')} style={knop}>Vraag of document</button>
      </section>
    </div>
  );
}

function Tegel({ getal, label, kleur, bg }: { getal: number; label: string; kleur: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: kleur, lineHeight: 1.1 }}>{getal}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: kleur, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Rij({ m, accent }: { m: Milestone; accent: string }) {
  const uren = urenUitTitel(m.title);
  return (
    <div style={{ ...card, borderLeft: `4px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{schoneTitel(m.title)}</span>
        {uren > 0 && <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{uren} uur</span>}
      </div>
      {m.description && <p style={{ margin: '4px 0 0', color: '#555', fontSize: 14, lineHeight: 1.45 }}>{m.description}</p>}
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
};

const kop: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' };

const knop: React.CSSProperties = {
  background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8,
  padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

const actieBanner: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%',
  textAlign: 'left', background: '#fff4e0', border: '1px solid #fde3b4', borderLeft: '4px solid #f59e0b',
  color: '#a35b00', borderRadius: 12, padding: '14px 16px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
};
