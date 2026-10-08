'use client';

import { useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';
import ChatClient from './ChatClient';
import OverviewClient from './OverviewClient';
import VragenTab from './VragenTab';
import V2Client from './V2Client';
import DashboardClient from './DashboardClient';

// V2-ideeën zijn projectspecifiek (BokaBord/Hans); alleen tonen voor projecten in deze lijst.
const V2_PROJECTS: string[] = [];

export default function PortalTabs({ projectSlug, audience }: { projectSlug: string; audience: Audience }) {
  const [tab, setTab] = useState<'dashboard' | 'chat' | 'overview' | 'vragen' | 'v2'>('dashboard');
  const [openVragen, setOpenVragen] = useState(0);
  const [totaalVragen, setTotaalVragen] = useState(0);
  // Openingsscherm is het overzicht; open vragen staan daar bovenaan als banner.
  const actief = tab;
  const kies = (t: typeof tab) => setTab(t);
  const showV2 = V2_PROJECTS.includes(projectSlug);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => kies('dashboard')} style={tabButtonStyle(actief === 'dashboard')}>
          Overzicht
        </button>
        <button onClick={() => kies('overview')} style={tabButtonStyle(actief === 'overview')}>
          Voortgang
        </button>
        {totaalVragen > 0 && (
          <button onClick={() => kies('vragen')} style={tabButtonStyle(actief === 'vragen')}>
            Vragen
            {openVragen > 0 && (
              <span style={{ marginLeft: 8, background: '#f59e0b', color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 12 }}>
                {openVragen}
              </span>
            )}
          </button>
        )}
        <button onClick={() => kies('chat')} style={tabButtonStyle(actief === 'chat')}>
          Vraag of document
        </button>
        {showV2 && (
          <button onClick={() => kies('v2')} style={tabButtonStyle(actief === 'v2')}>
            V2
          </button>
        )}
      </div>
      <VragenTab
        projectSlug={projectSlug}
        audience={audience}
        zichtbaar={actief === 'vragen'}
        onTelling={(open, totaal) => { setOpenVragen(open); setTotaalVragen(totaal); }}
      />
      {actief === 'vragen' ? null : actief === 'dashboard' ? (
        <DashboardClient projectSlug={projectSlug} audience={audience} openVragen={openVragen} onNavigate={kies} />
      ) : actief === 'chat' ? (
        <>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: '#444', margin: '0 0 12px' }}>
            Iris loopt met je door een paar vragen. Antwoord in je eigen woorden en schrijf gerust
            uitgebreid, hoe meer je deelt, hoe beter we je kunnen helpen. Je kunt ook een document
            delen (pdf of tekst). Je kunt dit venster altijd sluiten en later verdergaan.
          </p>
          <ChatClient projectSlug={projectSlug} audience={audience} />
        </>
      ) : actief === 'overview' ? (
        <OverviewClient projectSlug={projectSlug} audience={audience} />
      ) : showV2 ? (
        <V2Client />
      ) : (
        <ChatClient projectSlug={projectSlug} audience={audience} />
      )}
    </div>
  );
}

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: 8,
    border: active ? 'none' : '1px solid #d1d5db',
    background: active ? '#1a1a2e' : '#fff',
    color: active ? '#fff' : '#444',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
