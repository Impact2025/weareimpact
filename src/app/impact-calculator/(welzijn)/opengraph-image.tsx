import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Impact Calculator — Hoeveel waarde laat jouw organisatie liggen?';
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
        {/* Achtergrond gloed */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(251, 146, 60, 0.18) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(251, 146, 60, 0.08) 0%, transparent 40%)',
          }}
        />

        {/* Oranje top-balk */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
          }}
        />

        {/* Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: 'rgba(251, 146, 60, 0.15)',
              border: '1px solid rgba(251, 146, 60, 0.4)',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#fb923c',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Impact Calculator
          </div>
          <div style={{ fontSize: '16px', color: '#475569', fontWeight: '600' }}>
            weareimpact.nl
          </div>
        </div>

        {/* Hoofdvraag */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: '900',
            color: 'white',
            margin: '0 0 24px 0',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            maxWidth: '800px',
          }}
        >
          Hoeveel waarde laat jouw organisatie{' '}
          <span style={{ color: '#f97316' }}>liggen?</span>
        </h1>

        {/* Subtitel */}
        <p
          style={{
            fontSize: '26px',
            color: '#94a3b8',
            margin: '0 0 52px 0',
            maxWidth: '680px',
            lineHeight: 1.4,
            fontWeight: '400',
          }}
        >
          Bereken in 2 minuten hoeveel uren, cliëntgesprekken en budget AI kan vrijmaken voor jouw welzijnsteam.
        </p>

        {/* Drie metric-badges */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Tijdwinst', value: 'Uren/week', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
            { label: 'Cliëntcontact', value: '+Gesprekken/maand', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)' },
            { label: 'ROI', value: '€ per jaar', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
          ].map(({ label, value, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '16px',
                padding: '18px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {label}
              </span>
              <span style={{ fontSize: '20px', color, fontWeight: '800' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Vincent badge rechtsonder */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fb923c, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '900',
              color: 'white',
            }}
          >
            VM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Vincent van Munster</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>WeAreImpact · AI Consultant</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
