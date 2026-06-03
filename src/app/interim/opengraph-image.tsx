import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Interim Profiel Vincent van Munster — Strategic Innovation Partner WeAreImpact';
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
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(251,146,60,0.15) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(34,197,94,0.08) 0%, transparent 40%)',
          }}
        />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #22c55e 0%, #fb923c 60%, #ea580c 100%)' }} />

        {/* Beschikbaar badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '100px', padding: '8px 20px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#4ade80', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Interim beschikbaar · 16–24 uur/week
            </span>
          </div>
          <span style={{ fontSize: '15px', color: '#475569', fontWeight: '600' }}>weareimpact.nl/interim</span>
        </div>

        {/* Naam */}
        <h1 style={{ fontSize: '68px', fontWeight: '900', color: 'white', margin: '0 0 8px 0', lineHeight: 1.05, letterSpacing: '-2px' }}>
          Vincent van Munster
        </h1>
        <p style={{ fontSize: '28px', color: '#f97316', fontWeight: '700', margin: '0 0 36px 0', letterSpacing: '-0.5px' }}>
          Strategic Innovation Partner
        </p>

        {/* Drie rollen */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '0' }}>
          {[
            { label: 'Interim Projectleider', sub: 'Welzijn & Sociaal Domein', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
            { label: 'Kwartiermaker', sub: 'Innovatie & AI', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
            { label: 'Verandermanager', sub: 'Digitale Transformatie', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
          ].map(({ label, sub, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
              <span style={{ fontSize: '17px', color, fontWeight: '800' }}>{label}</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{sub}</span>
            </div>
          ))}
        </div>

        {/* Regio rechtsonder */}
        <div style={{ position: 'absolute', bottom: '48px', right: '80px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>Regio Amsterdam · Haarlem · Leiden</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>25+ jaar sociaal domein · LEGO® Serious Play certified</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
