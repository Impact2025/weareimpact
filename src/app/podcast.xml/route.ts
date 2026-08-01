import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

// Feed wordt per uur ververst; de blob-URL's veranderen niet, dus een HEAD per
// aflevering is goedkoop genoeg binnen dat venster.
export const revalidate = 3600;

const BASE_URL = 'https://weareimpact.nl';
const OWNER = 'Vincent van Munster';
const OWNER_EMAIL = 'v.munster@weareimpact.nl';
const TITLE = 'WeAreImpact — AI in het sociaal domein';
const DESCRIPTION =
  'Elke aflevering: wat AI concreet betekent voor welzijnsorganisaties, zorginstellingen en gemeenten. Geen hype, geen rapport-en-wegwezen, wel de praktijk — door Vincent van Munster, interim programmamanager en AI-consultant in het sociaal domein.';

type Episode = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  audio_url: string;
  audio_title: string | null;
  audio_duration: number | null;
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** hh:mm:ss — het formaat dat Apple Podcasts verwacht. */
function itunesDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function mimeFor(url: string): string {
  if (/\.mp3(\?|$)/i.test(url)) return 'audio/mpeg';
  if (/\.wav(\?|$)/i.test(url)) return 'audio/wav';
  return 'audio/x-m4a';
}

/**
 * Apple en Spotify verwachten de bestandsgrootte in het enclosure-element.
 * Lukt de HEAD niet, dan vallen we terug op 0 — feeds worden daar door de
 * meeste clients niet op afgekeurd, in tegenstelling tot een ontbrekend attribuut.
 */
async function contentLength(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return Number(res.headers.get('content-length') ?? 0) || 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  let episodes: Episode[] = [];
  try {
    episodes = (await sql`
      SELECT slug, title, excerpt, published_at, audio_url, audio_title, audio_duration
      FROM posts
      WHERE status = 'published' AND audio_url IS NOT NULL AND audio_url <> ''
      ORDER BY published_at DESC
      LIMIT 300
    `) as Episode[];
  } catch {
    // Feed degradeert netjes als de DB even niet bereikbaar is.
  }

  const sizes = await Promise.all(episodes.map((e) => contentLength(e.audio_url)));

  const items = episodes.map((episode, i) => {
    const url = `${BASE_URL}/blog/${episode.slug}`;
    const date = new Date(episode.published_at ?? Date.now()).toUTCString();
    const duration = itunesDuration(episode.audio_duration);
    const summary = episode.excerpt ?? '';

    return `    <item>
      <title>${escapeXml(episode.audio_title || episode.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${escapeXml(episode.audio_url)}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(summary)}</description>
      <itunes:summary>${escapeXml(summary)}</itunes:summary>
      <itunes:author>${escapeXml(OWNER)}</itunes:author>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      <enclosure url="${escapeXml(episode.audio_url)}" length="${sizes[i]}" type="${mimeFor(episode.audio_url)}"/>${
        duration ? `\n      <itunes:duration>${duration}</itunes:duration>` : ''
      }
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${BASE_URL}/blog</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>nl-NL</language>
    <copyright>© ${new Date().getFullYear()} WeAreImpact — ${escapeXml(OWNER)}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/podcast.xml" rel="self" type="application/rss+xml"/>
    <itunes:author>${escapeXml(OWNER)}</itunes:author>
    <itunes:summary>${escapeXml(DESCRIPTION)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${BASE_URL}/podcast-cover.jpg"/>
    <itunes:owner>
      <itunes:name>${escapeXml(OWNER)}</itunes:name>
      <itunes:email>${OWNER_EMAIL}</itunes:email>
    </itunes:owner>
    <itunes:category text="Business">
      <itunes:category text="Management"/>
    </itunes:category>
    <itunes:category text="Technology"/>
    <image>
      <url>${BASE_URL}/podcast-cover.jpg</url>
      <title>${escapeXml(TITLE)}</title>
      <link>${BASE_URL}/blog</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
