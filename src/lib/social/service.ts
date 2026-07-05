// Orkestratie: social posts genereren, opslaan en (waar geconfigureerd) direct
// plaatsen. Posts zonder geconfigureerd platform blijven status 'draft' en zijn
// zichtbaar/plaatsbaar via /admin/social.

import { sql } from '@/lib/db/neon';
import { generateSocialDrafts, SOCIAL_PLATFORMS, type ArticleInput, type SocialPlatform } from './generator';
import { postToPlatform } from './posters';

export interface SocialPostRow {
  id: string;
  platform: SocialPlatform;
  content: string;
  status: 'draft' | 'posted' | 'failed';
  externalId?: string;
  error?: string;
  articleTitle: string;
  articleUrl: string;
  imageUrl?: string;
  postedAt?: string;
  createdAt: string;
}

let tableEnsured = false;

export async function ensureSocialTable(): Promise<void> {
  if (tableEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS social_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(50) DEFAULT 'weareimpact',
      article_type VARCHAR(20) DEFAULT 'blog',
      article_id UUID,
      article_title VARCHAR(500) NOT NULL,
      article_url VARCHAR(500) NOT NULL,
      platform VARCHAR(20) NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'x')),
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'failed')),
      external_id VARCHAR(255),
      error TEXT,
      posted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC)`;
  tableEnsured = true;
}

export interface SocialRunReport {
  platform: SocialPlatform;
  status: 'posted' | 'failed' | 'draft';
  detail?: string;
}

// Genereer posts voor alle platforms, sla ze op, en plaats direct op elk
// platform met geconfigureerde credentials. autoPost=false → alles blijft draft.
export async function generateAndPostSocials(
  article: ArticleInput & { articleId?: string; imageUrl?: string },
  autoPost = true,
): Promise<SocialRunReport[]> {
  await ensureSocialTable();

  const drafts = await generateSocialDrafts(article);
  const report: SocialRunReport[] = [];

  for (const platform of SOCIAL_PLATFORMS) {
    const content = drafts[platform];
    const inserted = await sql`
      INSERT INTO social_posts (article_id, article_title, article_url, platform, content, image_url)
      VALUES (${article.articleId ?? null}, ${article.title}, ${article.url}, ${platform}, ${content}, ${article.imageUrl ?? null})
      RETURNING id
    `;
    const id = inserted[0].id as string;

    if (!autoPost) {
      report.push({ platform, status: 'draft' });
      continue;
    }

    const result = await postToPlatform(platform, {
      content,
      url: article.url,
      imageUrl: article.imageUrl,
    });

    if (result.ok) {
      await sql`
        UPDATE social_posts
        SET status = 'posted', external_id = ${result.externalId ?? null}, error = NULL, posted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}
      `;
      report.push({ platform, status: 'posted' });
    } else if (!result.configured) {
      // Geen credentials → bewust concept, geen fout
      report.push({ platform, status: 'draft', detail: result.error });
    } else {
      await sql`
        UPDATE social_posts SET status = 'failed', error = ${result.error ?? 'Onbekende fout'}, updated_at = NOW()
        WHERE id = ${id}
      `;
      report.push({ platform, status: 'failed', detail: result.error });
    }
  }

  return report;
}

// Eén bestaande post (opnieuw) plaatsen — gebruikt door de admin-UI.
export async function postSocialById(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensureSocialTable();

  const rows = await sql`
    SELECT * FROM social_posts WHERE id = ${id} AND tenant_id = 'weareimpact' LIMIT 1
  `;
  if (rows.length === 0) return { ok: false, error: 'Niet gevonden' };
  const row = rows[0];
  if (row.status === 'posted') return { ok: false, error: 'Al geplaatst' };

  const result = await postToPlatform(row.platform as SocialPlatform, {
    content: row.content as string,
    url: row.article_url as string,
    imageUrl: (row.image_url as string) ?? undefined,
  });

  if (result.ok) {
    await sql`
      UPDATE social_posts
      SET status = 'posted', external_id = ${result.externalId ?? null}, error = NULL, posted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
    return { ok: true };
  }

  const error = result.error ?? 'Onbekende fout';
  // Niet-geconfigureerd platform laten we draft — dat is geen mislukte poging
  if (result.configured) {
    await sql`UPDATE social_posts SET status = 'failed', error = ${error}, updated_at = NOW() WHERE id = ${id}`;
  }
  return { ok: false, error };
}
