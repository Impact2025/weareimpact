import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

const NOTIFY_EMAIL = 'v.munster@weareimpact.nl';
const SITE_URL = 'https://weareimpact.nl';

export async function POST(request: NextRequest) {
  try {
    const { articleId, email, leadMagnetType } = await request.json();

    if (!articleId || !email) {
      return NextResponse.json(
        { error: 'articleId and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get article details — markdown articles use a non-UUID id like "kb-slug"
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);

    let article: { id: string; title: string; slug: string; lead_magnet_file: string | null; lead_magnet_title: string | null } | null = null;

    if (isUuid) {
      const articles = await sql`
        SELECT id, title, slug, lead_magnet_file, lead_magnet_title
        FROM kb_articles
        WHERE id = ${articleId}::uuid
      `;
      if (articles.length > 0) article = articles[0] as { id: string; title: string; slug: string; lead_magnet_file: string | null; lead_magnet_title: string | null };
    }

    // For markdown-based articles (non-UUID id), still log the lead without a DB lookup
    if (!article && !isUuid) {
      article = { id: articleId, title: articleId, slug: articleId.replace(/^kb-/, ''), lead_magnet_file: null, lead_magnet_title: null };
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const resourceTitle = article.lead_magnet_title || article.title;
    const downloadUrl = article.lead_magnet_file
      ? `${SITE_URL}${article.lead_magnet_file}`
      : null;
    const articleUrl = `${SITE_URL}/kennisbank/${article.slug}`;

    // Record the download/lead (only for DB articles with a real UUID)
    if (isUuid) {
      await sql`
        INSERT INTO kb_downloads (article_id, email, lead_magnet_type, source)
        VALUES (${articleId}::uuid, ${email}, ${leadMagnetType || 'unknown'}, 'article')
      `;
    }

    // Log activity
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          'Lead magnet download',
          ${`${email} downloaded "${resourceTitle}"`},
          ${JSON.stringify({ articleId, articleSlug: article.slug, email, type: leadMagnetType })}
        )
      `;
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    // Send emails (fire-and-forget, don't block the response)
    Promise.all([
      // 1. Notification to Vincent
      sendEmail({
        to: NOTIFY_EMAIL,
        subject: `Nieuwe lead: ${email} downloadde "${resourceTitle}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Nieuwe lead via kennisbank</h2>
            <p style="color: #475569; margin-bottom: 24px;">Iemand heeft een bestand gedownload via de kennisbank.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">E-mail</td>
                <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Bestand</td>
                <td style="padding: 8px 0; color: #0f172a;">${resourceTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Artikel</td>
                <td style="padding: 8px 0;"><a href="${articleUrl}" style="color: #ea580c;">${articleUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Type</td>
                <td style="padding: 8px 0; color: #0f172a;">${leadMagnetType || 'onbekend'}</td>
              </tr>
            </table>
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <a href="${SITE_URL}/admin/leads" style="background: #ea580c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Bekijk alle leads</a>
            </div>
          </div>
        `,
      }),

      // 2. Confirmation + download link to the downloader
      downloadUrl
        ? sendEmail({
            to: email,
            subject: `Jouw download: ${resourceTitle}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #0f172a; margin-bottom: 8px;">Jouw download staat klaar</h2>
                <p style="color: #475569; margin-bottom: 24px;">
                  Bedankt voor je interesse! Hier is de link naar <strong>${resourceTitle}</strong>.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${downloadUrl}" style="background: #ea580c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Download nu</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">
                  Of kopieer deze link: <a href="${downloadUrl}" style="color: #ea580c;">${downloadUrl}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 13px;">
                  Wil je meer weten over AI en digitalisering voor welzijnsorganisaties?
                  Lees het volledige artikel op <a href="${articleUrl}" style="color: #ea580c;">weareimpact.nl</a>
                  of plan een gratis kennismaking.
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
                  WeAreImpact.nl &mdash; Vincent van Munster<br>
                  Je kunt je afmelden door te antwoorden op deze e-mail.
                </p>
              </div>
            `,
          })
        : Promise.resolve(),
    ]).catch((err) => console.error('Email send error:', err));

    return NextResponse.json({
      success: true,
      downloadUrl: article.lead_magnet_file || null,
      message: 'Bedankt! Je download start zo.',
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}
