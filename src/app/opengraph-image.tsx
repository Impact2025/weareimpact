import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'WeAreImpact - Innovatie met een sociaal hart';
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FDFBF7',
          backgroundImage: 'linear-gradient(135deg, #FDFBF7 0%, #FFF7ED 100%)',
        }}
      >
        {/* Orange accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: '#F97316',
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            backgroundColor: '#F97316',
            opacity: 0.05,
          }}
        />

        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
              boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)',
            }}
          >
            <span style={{ fontSize: 40, color: 'white' }}>W</span>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}
          >
            WeAreImpact
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: 16,
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.2,
            }}
          >
            Innovatie met een sociaal hart
          </span>
          <span
            style={{
              fontSize: 28,
              color: '#64748B',
              textAlign: 'center',
              maxWidth: 700,
            }}
          >
            AI & Technologie voor menselijk welzijn
          </span>
        </div>

        {/* Author badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 60,
            padding: '12px 24px',
            backgroundColor: 'white',
            borderRadius: 50,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <span style={{ fontSize: 18, color: 'white', fontWeight: 700 }}>VM</span>
          </div>
          <span style={{ fontSize: 20, color: '#334155', fontWeight: 500 }}>
            Vincent van Munster
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
