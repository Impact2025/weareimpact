import { sql } from '@/lib/db/neon';

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '') || 'klant';
}

// Start het klantdossier vanuit een (gewonnen) deal: dossier krijgt company_id
// en deal_id mee, zodat CRM en dossier/LaunchAssist naar elkaar verwijzen.
// Bestaat er al een dossier voor deze deal, dan wordt dat teruggegeven.
export async function ensureDossierForDeal(dealId: string): Promise<{ slug: string; created: boolean }> {
  const existing = await sql`SELECT slug FROM crm_projects WHERE deal_id = ${dealId} LIMIT 1`;
  if (existing.length > 0) return { slug: existing[0].slug as string, created: false };

  const deals = await sql`
    SELECT d.id, d.title, d.description, d.company_id, d.contact_id, co.name AS company_name,
      TRIM(CONCAT(c.first_name, ' ', COALESCE(c.last_name, ''))) AS contact_name
    FROM deals d
    LEFT JOIN companies co ON co.id = d.company_id
    LEFT JOIN contacts c ON c.id = d.contact_id
    WHERE d.id = ${dealId}
  `;
  if (deals.length === 0) throw new Error('Deal niet gevonden');
  const deal = deals[0];

  const name = (deal.company_name as string) || (deal.title as string);
  const base = slugify(name);
  const taken = await sql`SELECT slug FROM crm_projects WHERE slug = ${base} OR slug LIKE ${`${base}-%`}`;
  const takenSet = new Set(taken.map((r) => r.slug as string));
  let slug = base;
  for (let i = 2; takenSet.has(slug); i++) slug = `${base}-${i}`;

  await sql`
    INSERT INTO crm_projects (slug, name, client_name, intake_notes, company_id, deal_id)
    VALUES (${slug}, ${name}, ${(deal.contact_name as string) || null}, ${(deal.description as string) || null},
      ${deal.company_id}, ${dealId})
  `;

  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${deal.company_id}, ${deal.contact_id}, ${dealId}, 'note', 'Klantdossier gestart',
      ${`Dossier /admin/dossiers/${slug} aangemaakt vanuit deal "${deal.title}".`})
  `;

  return { slug, created: true };
}
