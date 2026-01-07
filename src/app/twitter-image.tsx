import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'WeAreImpact - Vincent van Munster | AI Welzijn Expert';
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
          }}
        />
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)',
          }}
        >
          <span style={{ fontSize: '60px', color: 'white', fontWeight: 'bold' }}>W</span>
        </div>
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 16px 0',
            textAlign: 'center',
            letterSpacing: '-2px',
          }}
        >
          WeAreImpact
        </h1>
        <p
          style={{
            fontSize: '32px',
            color: '#fb923c',
            margin: '0 0 24px 0',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          Vincent van Munster
        </p>
        <p
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            margin: 0,
            textAlign: 'center',
          }}
        >
          AI Welzijn Expert • Digitale motoren voor menselijk geluk
        </p>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '40px', height: '2px', background: '#fb923c' }} />
          <span style={{ color: '#64748b', fontSize: '18px' }}>weareimpact.nl</span>
          <div style={{ width: '40px', height: '2px', background: '#fb923c' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
