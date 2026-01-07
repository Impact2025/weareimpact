import { ImageResponse } from 'next/og';
import { sql } from '@/lib/db/neon';

export const runtime = 'edge';
export const alt = 'WeAreImpact Kennisbank';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  let title = 'WeAreImpact Kennisbank';
  let category = 'kennisbank';
  
  try {
    const articles = await sql`
      SELECT title, category_slug FROM kb_articles 
      WHERE slug = ${params.slug} AND status = 'published' 
      LIMIT 1
    `;
    if (articles.length > 0) {
      title = articles[0].title as string;
      category = articles[0].category_slug as string;
    }
  } catch (e) {
    console.error('Error fetching article for OG image:', e);
  }

  const categoryColors: Record<string, string> = {
    'sociaal-ondernemen': '#fb923c',
    'ai-tech': '#3b82f6',
    'vrijwilligers': '#22c55e',
    'impact-meten': '#a855f7',
    'subsidie-funding': '#eab308',
    'lego-serious-play': '#ef4444',
  };
  const accentColor = categoryColors[category] || '#fb923c';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
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
            background: accentColor,
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '30px', color: 'white', fontWeight: 'bold' }}>W</span>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '24px' }}>Kennisbank</span>
        </div>
        
        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <h1
            style={{
              fontSize: title.length > 60 ? '48px' : '56px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '8px 20px',
              background: accentColor,
              borderRadius: '20px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            📚 Kennisbank
          </div>
          <span style={{ color: '#64748b', fontSize: '18px' }}>weareimpact.nl</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
