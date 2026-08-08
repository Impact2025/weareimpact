import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createHash, timingSafeEqual } from 'crypto';
import { sql } from '@/lib/db/neon';
import { pingIndexNow, pingGoogleIndexingAPI } from '@/lib/indexing';
import { generateAndPostSocials, type SocialRunReport } from '@/lib/social/service';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { guardArticle } from '@/lib/content-guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';
const VALID_CATEGORIES = ['ai', 'impact', 'strategie', 'nieuws'];

// Machine-endpoint voor volautomatische publicatie (Agent OS → live):
// artikel in de blog-database, pagina direct live (revalidate), IndexNow +
// Google Indexing pingen, en social posts genereren + plaatsen.
// Auth: Authorization: Bearer <PUBLISH_API_KEY> (of een geldige admin-sessie).

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const key = process.env.PUBLISH_API_KEY;
  const auth = request.headers.get('authorization');
  if (key && auth?.startsWith('Bearer ')) {
    const provided = auth.slice(7);
    // Vergelijk hashes: timing-safe én ongevoelig voor lengteverschil
    const a = createHash('sha256').update(provided).digest();
    const b = createHash('sha256').update(key).digest();
    if (timingSafeEqual(a, b)) return true;
  }
  return isAdminAuthenticated();
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string): Promise<string> {
  const taken = await sql`
    SELECT slug FROM posts WHERE slug = ${base} OR slug LIKE ${base + '-%'}
  `;
  const existing = new Set(taken.map((r: Record<string, unknown>) => String(r.slug)));
  if (!existing.has(base)) return base;
  for (let i = 2; i <= 50; i++) {
    if (!existing.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(request: NextRequest) {
  if (!await isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      slug: requestedSlug,
      renameFrom,
      excerpt,
      category = 'ai',
      tags = [],
      seoTitle,
      seoDescription,
      coverImage,
      socials = true,
      source = 'api',
      force = false,
    } = body as {
      title?: string; content?: string; slug?: string; renameFrom?: string; excerpt?: string;
      category?: string; tags?: string[]; seoTitle?: string; seoDescription?: string;
      coverImage?: string; socials?: boolean; source?: string; force?: boolean;
    };

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'title en content zijn verplicht' }, { status: 400 });
    }

    const safeCategory = VALID_CATEGORIES.includes(category) ? category : 'ai';

    // Verwijder de <h1> — de blogpagina rendert de titel zelf al als H1.
    // Zowel een leidende H1 als een H1 die na een wrapper (<article>, <div>)
    // volgt; verder in het document laten we koppen met rust.
    const cleanContent = content
      .replace(/^(\s*(?:<(?:article|div|section|main)[^>]*>\s*)*)<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '$1')
      .trim();

    // Kwaliteitspoort: dode bronlinks, verzonnen auteurs en tussenkoppen-als-titel
    // horen niet live te komen. `force: true` overschrijft dit bewust.
    const guard = await guardArticle({
      title: title.trim(),
      content: cleanContent,
      seoTitle,
      seoDescription,
      excerpt,
    });
    if (!guard.ok && !force) {
      return NextResponse.json(
        {
          error: 'Publicatie geblokkeerd door de contentcontrole',
          blocking: guard.blocking,
          warnings: guard.warnings,
          checkedLinks: guard.checkedLinks,
          hint: 'Los de blokkerende punten op, of stuur nogmaals met "force": true als je bewust wilt doorzetten.',
        },
        { status: 422 }
      );
    }
    const plainText = stripHtml(cleanContent);

    // Excerpt-afleiding — NOOIT een harde slice midden in een woord.
    // Volgorde: meegegeven excerpt → seoDescription → een samenvatting uit de
    // EIGEN artikeltekst (eerste 1-2 volledige zinnen, op zin-grens afgekapt).
    // Zo verschijnt er nooit '... welzijnsorga...' en nooit tekst van een ánder artikel.
    function deriveExcerpt(text: string, max = 200): string {
      const clean = (text || '').replace(/\s+/g, ' ').trim();
      if (!clean) return '';
      const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
      let out = '';
      for (const s of sentences) {
        const cand = (out + ' ' + s).trim();
        if (cand.length > max && out) break;
        out = cand;
      }
      if (!out) out = clean.slice(0, max).replace(/\s+\S*$/, '');
      return out;
    }
    const finalExcerpt = (
      excerpt?.trim() ||
      seoDescription?.trim() ||
      deriveExcerpt(plainText, 200)
    ).slice(0, 300).replace(/\s+\S*$/, '');

    const baseSlug = slugify(requestedSlug?.trim() || title);
    // Upsert-op-slug: bestaat de slug al → UPDATE (geen duplicaat bij herpublicatie),
    // anders → INSERT met een unieke slug. `renameFrom` (optioneel) matcht op de
    // OUDE slug i.p.v. de nieuwe — voor het herstellen van kapotte/lelijke slugs
    // zonder een dubbele rij achter te laten.
    const lookupSlug = renameFrom?.trim() || baseSlug;
    const existing = await sql`SELECT id FROM posts WHERE slug = ${lookupSlug} LIMIT 1`;
    const isUpdate = existing.length > 0;
    const slug = isUpdate ? baseSlug : await uniqueSlug(baseSlug);
    const readingTime = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200));

    let postId: string;
    let url: string;
    if (isUpdate) {
      const updated = await sql`
        UPDATE posts SET
          title = ${title.trim()},
          slug = ${slug},
          excerpt = ${finalExcerpt},
          content = ${cleanContent},
          cover_image = COALESCE(${coverImage ?? null}, cover_image),
          category = ${safeCategory},
          tags = ${Array.isArray(tags) ? tags : []},
          reading_time = ${readingTime},
          seo_title = ${seoTitle?.trim() || title.trim()},
          seo_description = ${seoDescription?.trim() || finalExcerpt},
          status = 'published',
          published_at = COALESCE(published_at, NOW())
        WHERE slug = ${lookupSlug}
        RETURNING id, slug
      `;
      postId = updated[0].id as string;
      url = `${SITE_URL}/blog/${slug}`;
    } else {
      const inserted = await sql`
        INSERT INTO posts (
          title, slug, excerpt, content, cover_image, category, tags,
          status, reading_time, seo_title, seo_description, published_at,
          header_type, header_color
        ) VALUES (
          ${title.trim()}, ${slug}, ${finalExcerpt}, ${cleanContent}, ${coverImage ?? null},
          ${safeCategory}, ${Array.isArray(tags) ? tags : []},
          'published', ${readingTime}, ${seoTitle?.trim() || title.trim()},
          ${seoDescription?.trim() || finalExcerpt}, NOW(),
          ${coverImage ? 'image' : 'color'}, 'orange'
        )
        RETURNING id, slug
      `;
      postId = inserted[0].id as string;
      url = `${SITE_URL}/blog/${slug}`;
    }

    // Direct live — niet wachten op de ISR-window van een uur
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/sitemap.xml');
    if (renameFrom?.trim() && renameFrom.trim() !== slug) {
      revalidatePath(`/blog/${renameFrom.trim()}`);
    }

    // Zoekmachines pingen (parallel, fouten loggen maar blokkeren niet)
    const [indexNowResult, googleResult] = await Promise.allSettled([
      pingIndexNow([url]),
      pingGoogleIndexingAPI(url),
    ]);

    // Social posts genereren + automatisch plaatsen waar tokens bestaan
    let socialReport: SocialRunReport[] = [];
    let socialError: string | undefined;
    if (socials) {
      try {
        socialReport = await generateAndPostSocials({
          articleId: postId,
          title: title.trim(),
          url,
          excerpt: finalExcerpt,
          category: safeCategory,
          contentText: plainText,
          // Instagram vereist een afbeelding; cover-image indien aanwezig,
          // anders de gegenereerde og-image van het artikel
          imageUrl: coverImage ?? `${url}/opengraph-image`,
        });
      } catch (e) {
        socialError = String(e).slice(0, 300);
        console.error('Social generation failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      id: postId,
      slug,
      url,
      source,
      indexing: {
        indexnow: indexNowResult.status === 'fulfilled' ? 'ok' : 'fout',
        google: googleResult.status === 'fulfilled' ? 'ok' : 'fout',
      },
      socials: socialReport,
      socialError,
      guard: {
        warnings: guard.warnings,
        forced: !guard.ok && force ? guard.blocking : undefined,
        checkedLinks: guard.checkedLinks.length,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Publiceren mislukt', detail: String(error).slice(0, 300) }, { status: 500 });
  }
}
