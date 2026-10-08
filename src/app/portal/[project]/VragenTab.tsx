'use client';

import { useEffect, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';
import Vragen, { VRAGEN_FASE, type Vraag } from './Vragen';

// Haalt het overzicht op en toont alleen de vragen aan de klant. Meldt het aantal open vragen aan de tabbalk.
export default function VragenTab({
  projectSlug, audience, zichtbaar, onTelling,
}: { projectSlug: string; audience: Audience; zichtbaar: boolean; onTelling: (open: number, totaal: number) => void }) {
  const [vragen, setVragen] = useState<Vraag[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/crm/portal/${projectSlug}/${audience}/overview`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json) => {
        const lijst = (json.milestones as (Vraag & { phase: string | null })[])
          .filter((m) => m.phase === VRAGEN_FASE)
          .map((m) => ({ ...m, comments: m.comments ?? [] }));
        setVragen(lijst);
        onTelling(lijst.filter((v) => v.status !== 'done').length, lijst.length);
      })
      .catch(() => setFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug, audience]);

  if (!zichtbaar) return null;
  if (failed) {
    return <p style={{ color: '#666' }}>Je sessie is verlopen. Open de link uit je laatste mail opnieuw, of vraag Vincent om een nieuwe inloglink.</p>;
  }
  if (!vragen) return <p style={{ color: '#666' }}>Bezig met laden…</p>;
  if (vragen.length === 0) return <p style={{ color: '#666' }}>Er zijn nu geen vragen voor je. Dank je wel!</p>;

  return (
    <Vragen
      items={vragen}
      projectSlug={projectSlug}
      audience={audience}
      onAnswered={(id, antwoord) => {
        const nu = new Date().toISOString();
        const nieuw = vragen.map((v) =>
          v.id === id
            ? { ...v, status: 'done' as const, comments: [...v.comments, { author: 'klant', body: antwoord, created_at: nu }] }
            : v,
        );
        setVragen(nieuw);
        onTelling(nieuw.filter((v) => v.status !== 'done').length, nieuw.length);
      }}
    />
  );
}
