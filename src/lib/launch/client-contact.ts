import { sql } from '@/lib/db/neon';

/** E-mailadres van de klant-doelgroep: de laatste inloglink die voor dit project is uitgegeven. */
export async function getClientEmail(slug: string): Promise<string | null> {
  const rows = await sql`
    SELECT email FROM crm_magic_links
    WHERE project_slug = ${slug} AND audience = 'klant'
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows.length ? (rows[0].email as string) : null;
}
