// Gebruik: node scripts/send-crm-magic-link.js <project-slug> <email>
const { neon } = require('@neondatabase/serverless');
const { Resend } = require('resend');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const [projectSlug, email] = process.argv.slice(2);

if (!projectSlug || !email) {
  console.error('Gebruik: node scripts/send-crm-magic-link.js <project-slug> <email>');
  process.exit(1);
}

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  const projectRows = await sql`SELECT name FROM crm_projects WHERE slug = ${projectSlug}`;
  if (projectRows.length === 0) {
    console.error(`❌ Project "${projectSlug}" bestaat niet. Draai eerst het seed-script.`);
    process.exit(1);
  }
  const projectName = projectRows[0].name;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO crm_magic_links (project_slug, email, token_hash, expires_at)
    VALUES (${projectSlug}, ${email}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weareimpact.nl';
  const url = `${baseUrl}/portal/${projectSlug}/verify?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY niet geconfigureerd — link is aangemaakt maar niet gemaild.');
    console.log(`Link (7 dagen geldig): ${url}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const result = await resend.emails.send({
    from: fromEmail,
    to: [email],
    replyTo: 'v.munster@weareimpact.nl',
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

  if (result.error) {
    console.error('❌ Mail versturen mislukt:', result.error);
    console.log(`Link (7 dagen geldig): ${url}`);
    process.exit(1);
  }

  console.log(`✅ Magic link verstuurd naar ${email}`);
  console.log(`Link (7 dagen geldig, ook handig om zelf te testen): ${url}`);
}

main().catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
