'use client';

import { useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';
import ChatClient from './ChatClient';
import OverviewClient from './OverviewClient';
import VragenTab from './VragenTab';
import V2Client from './V2Client';
import DashboardClient from './DashboardClient';
import DocumentenTab from './DocumentenTab';

// V2-ideeën zijn projectspecifiek (BokaBord/Hans); alleen tonen voor projecten in deze lijst.
const V2_PROJECTS: string[] = [];

export default function PortalTabs({
  projectSlug,
  audience,
  pulseEnabled = false,
  initialTab,
  conversational = false,
}: {
  projectSlug: string;
  audience: Audience;
  pulseEnabled?: boolean;
  initialTab?: string;
  conversational?: boolean;
}) {
  const [tab, setTab] = useState<'dashboard' | 'chat' | 'overview' | 'vragen' | 'documenten' | 'v2' | 'pulse'>(
    initialTab === 'pulse' && pulseEnabled ? 'pulse' : 'dashboard',
  );
  const [openVragen, setOpenVragen] = useState(0);
  const [aantalDocumenten, setAantalDocumenten] = useState(0);
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
        {aantalDocumenten > 0 && (
          <button onClick={() => kies('documenten')} style={tabButtonStyle(actief === 'documenten')}>
            Documenten
          </button>
        )}
        <button onClick={() => kies('chat')} style={tabButtonStyle(actief === 'chat')}>
          {conversational ? 'Gesprek met Iris' : 'Vraag of document'}
        </button>
        {pulseEnabled && (
          <button onClick={() => kies('pulse')} style={tabButtonStyle(actief === 'pulse')}>
            Weekcheck
          </button>
        )}
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
      <DocumentenTab
        projectSlug={projectSlug}
        audience={audience}
        zichtbaar={actief === 'documenten'}
        onTelling={setAantalDocumenten}
      />
      {actief === 'vragen' || actief === 'documenten' ? null : actief === 'dashboard' ? (
        <DashboardClient projectSlug={projectSlug} audience={audience} openVragen={openVragen} onNavigate={kies} />
      ) : actief === 'chat' ? (
        <>
          {conversational ? (
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#444', margin: '0 0 12px' }}>
              Een gesprek met Iris over hoe jij werkt. Antwoord zoals je het aan een collega zou vertellen,
              kort mag ook. Je kunt altijd stoppen en later verdergaan; je kunt ook een document delen.
            </p>
          ) : (
          <p style={{ fontSize: 15, lineHeight: 1.5, color: '#444', margin: '0 0 12px' }}>
            Iris loopt met je door een paar vragen. Antwoord in je eigen woorden en schrijf gerust
            uitgebreid, hoe meer je deelt, hoe beter we je kunnen helpen. Je kunt ook een document
            delen (pdf of tekst). Je kunt dit venster altijd sluiten en later verdergaan.
          </p>
          )}
          <ChatClient projectSlug={projectSlug} audience={audience} />
        </>
      ) : actief === 'pulse' ? (
        <>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: '#444', margin: '0 0 12px' }}>
            Een korte weekcheck met Iris: drie vragen, ongeveer twee minuten.
          </p>
          <ChatClient projectSlug={projectSlug} audience={audience} mode="pulse" />
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
    border: active ? '1px solid #a5b4fc' : '1px solid #e5e7eb',
    background: active ? '#eef2ff' : '#fff',
    color: active ? '#3730a3' : '#555',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
