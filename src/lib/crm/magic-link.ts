import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';

const LINK_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagen om de link te gebruiken

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface CreateMagicLinkResult {
  url: string;
  expiresAt: Date;
}

/**
 * Maakt een single-use magic link voor één project + e-mailadres, en
 * verstuurt die. Het ruwe token bestaat alleen in deze functie en de
 * verzonden e-mail — in de database staat uitsluitend de hash.
 */
export async function createAndSendMagicLink(
  projectSlug: string,
  email: string,
): Promise<CreateMagicLinkResult> {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + LINK_MAX_AGE_MS);

  await sql`
    INSERT INTO crm_magic_links (project_slug, email, token_hash, expires_at)
    VALUES (${projectSlug}, ${email}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weareimpact.nl';
  const url = `${baseUrl}/portal/${projectSlug}/verify?token=${token}`;

  const projectRows = await sql`SELECT name FROM crm_projects WHERE slug = ${projectSlug}`;
  const projectName = projectRows[0]?.name ?? projectSlug;

  await sendEmail({
    to: email,
    subject: `Toegang tot je vragen — ${projectName}`,
    html: `
      <p>Hoi,</p>
      <p>Via onderstaande link kun je de openstaande vragen over <strong>${projectName}</strong> bekijken en beantwoorden:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Deze link is 7 dagen geldig en persoonlijk — deel 'm niet met anderen.</p>
      <p>Groet,<br/>WeAreImpact</p>
    `,
    text: `Via deze link kun je de openstaande vragen over ${projectName} bekijken en beantwoorden: ${url}\n\nDeze link is 7 dagen geldig en persoonlijk — deel 'm niet met anderen.`,
  });

  return { url, expiresAt };
}

export interface VerifiedMagicLink {
  projectSlug: string;
}

/**
 * Valideert en verbruikt een magic-linktoken (single-use). Geeft het
 * project terug waarvoor het gold, of null als het token ongeldig,
 * verlopen, of al gebruikt is.
 */
export async function consumeMagicLinkToken(
  projectSlug: string,
  token: string,
): Promise<VerifiedMagicLink | null> {
  const tokenHash = await sha256Hex(token);

  const rows = await sql`
    SELECT id, project_slug, expires_at, used_at
    FROM crm_magic_links
    WHERE token_hash = ${tokenHash} AND project_slug = ${projectSlug}
  `;
  const row = rows[0];
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  await sql`UPDATE crm_magic_links SET used_at = NOW() WHERE id = ${row.id}`;

  return { projectSlug: row.project_slug };
}
