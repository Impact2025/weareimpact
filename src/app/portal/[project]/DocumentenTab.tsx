'use client';

import { useEffect, useState } from 'react';
import type { Audience } from '@/lib/crm/portal-session';

interface SharedDoc {
  id: string;
  filename: string;
  description: string | null;
  size_bytes: number | null;
  created_at: string;
}

export default function DocumentenTab({
  projectSlug,
  audience,
  zichtbaar,
  onTelling,
}: {
  projectSlug: string;
  audience: Audience;
  zichtbaar: boolean;
  onTelling: (totaal: number) => void;
}) {
  const [docs, setDocs] = useState<SharedDoc[]>([]);

  useEffect(() => {
    let weg = false;
    fetch(`/api/crm/portal/${projectSlug}/${audience}/shared-documents`)
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((d) => {
        if (weg) return;
        setDocs(d.documents ?? []);
        onTelling((d.documents ?? []).length);
      })
      .catch(() => {});
    return () => { weg = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug, audience]);

  if (!zichtbaar) return null;

  return (
    <div>
      <p style={{ fontSize: 15, lineHeight: 1.5, color: '#444', margin: '0 0 12px' }}>
        Documenten die WeAreImpact met je deelt. Download, print en onderteken ze waar dat
        gevraagd wordt.
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        {docs.map((d) => (
          <div key={d.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 15 }}>{d.filename}</div>
            {d.description && <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: '#444' }}>{d.description}</p>}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={`/api/crm/portal/${projectSlug}/${audience}/shared-documents/${d.id}`}
                style={{ background: '#1a1a2e', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                Downloaden
              </a>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {new Date(d.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                {d.size_bytes ? ` · ${Math.max(1, Math.round(d.size_bytes / 1024))} KB` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
