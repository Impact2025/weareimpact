import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Vincent van Munster — Strategic Innovation Partner & Interim Manager | WeAreImpact';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          padding: '72px 80px',
        }}
      >
        {/* Subtiele glow */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(251,146,60,0.12) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(34,197,94,0.06) 0%, transparent 40%)',
          }}
        />

        {/* Kleurlijn boven */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #f97316 0%, #fb923c 60%, #fbbf24 100%)' }} />

        {/* Beschikbaar badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)', borderRadius: '100px', padding: '8px 20px' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Beschikbaar per direct · 16–24 uur/week
            </span>
          </div>
          <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>weareimpact.nl/vincent-van-munster</span>
        </div>

        {/* Naam */}
        <h1 style={{ fontSize: '72px', fontWeight: '900', color: 'white', margin: '0 0 6px 0', lineHeight: 1.02, letterSpacing: '-2px' }}>
          Vincent van Munster
        </h1>
        <p style={{ fontSize: '26px', color: '#f97316', fontWeight: '700', margin: '0 0 36px 0', letterSpacing: '-0.3px' }}>
          Strategic Innovation Partner &amp; Interim Manager
        </p>

        {/* Drie rollen */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Interim Projectleider', sub: 'Welzijn & Sociaal Domein' },
            { label: 'Kwartiermaker', sub: 'Innovatie & AI' },
            { label: 'Verandermanager', sub: 'Digitale Transformatie' },
          ].map(({ label, sub }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
              <span style={{ fontSize: '16px', color: '#f97316', fontWeight: '800' }}>{label}</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{sub}</span>
            </div>
          ))}
        </div>

        {/* Regio rechtsonder */}
        <div style={{ position: 'absolute', bottom: '48px', right: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Regio Amsterdam · Haarlem · Leiden</span>
          <span style={{ fontSize: '12px', color: '#475569' }}>25+ jaar sociaal domein · €125–€140/u · WeAreImpact</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
