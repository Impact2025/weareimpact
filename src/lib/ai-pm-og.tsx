import { ImageResponse } from 'next/og';
import { getAiPmPage } from '@/lib/ai-pm-pages';

export interface OgContent {
  eyebrow: string;
  title: string;
}

export function ogForPage(slug: string): OgContent {
  const p = getAiPmPage(slug);
  return { eyebrow: p.eyebrow, title: `${p.h1a} ${p.h1b}` };
}

/** Gedeelde 1200x630 afbeelding voor de AI-projectmanager-cluster (OG + Twitter). */
export function renderAiPmOg({ eyebrow, title }: OgContent) {
  const size = title.length > 70 ? 56 : 66;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #fb923c, #ea580c)', display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #fb923c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#fff' }}>W</div>
          <div style={{ fontSize: 26, color: '#fb923c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, display: 'flex' }}>{eyebrow}</div>
        </div>
        <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1, display: 'flex', maxWidth: 1040 }}>{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 28, color: '#94a3b8' }}>
          <div style={{ display: 'flex' }}>Vincent van Munster · WeAreImpact</div>
          <div style={{ display: 'flex', color: '#fb923c', fontWeight: 700 }}>weareimpact.nl</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
