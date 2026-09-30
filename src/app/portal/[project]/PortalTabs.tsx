'use client';

import { useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';
import ChatClient from './ChatClient';
import OverviewClient from './OverviewClient';
import V2Client from './V2Client';

export default function PortalTabs({ projectSlug, audience }: { projectSlug: string; audience: Audience }) {
  const [tab, setTab] = useState<'chat' | 'overview' | 'v2'>('chat');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('chat')} style={tabButtonStyle(tab === 'chat')}>
          Gesprek
        </button>
        <button onClick={() => setTab('overview')} style={tabButtonStyle(tab === 'overview')}>
          Voortgang
        </button>
        <button onClick={() => setTab('v2')} style={tabButtonStyle(tab === 'v2')}>
          V2
        </button>
      </div>
      {tab === 'chat' ? (
        <ChatClient projectSlug={projectSlug} audience={audience} />
      ) : tab === 'overview' ? (
        <OverviewClient projectSlug={projectSlug} audience={audience} />
      ) : (
        <V2Client />
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
