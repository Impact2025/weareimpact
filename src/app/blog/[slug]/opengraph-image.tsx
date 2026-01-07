import { ImageResponse } from 'next/og';
import { sql } from '@/lib/db/neon';

export const runtime = 'edge';
export const alt = 'WeAreImpact Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  let title = 'WeAreImpact Blog';
  let category = 'blog';
  
  try {
    const posts = await sql`
      SELECT title, category FROM posts 
      WHERE slug = ${params.slug} AND status = 'published' 
      LIMIT 1
    `;
    if (posts.length > 0) {
      title = posts[0].title as string;
      category = posts[0].category as string;
    }
  } catch (e) {
    console.error('Error fetching post for OG image:', e);
  }

  const categoryColors: Record<string, string> = {
    ai: '#3b82f6',
    impact: '#22c55e', 
    strategie: '#a855f7',
    nieuws: '#fb923c',
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
          <span style={{ color: '#94a3b8', fontSize: '24px' }}>WeAreImpact Blog</span>
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
              textTransform: 'uppercase',
            }}
          >
            {category}
          </div>
          <span style={{ color: '#64748b', fontSize: '18px' }}>weareimpact.nl</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
