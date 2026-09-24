// LaunchAssist: breidt crm_milestones/crm_projects uit en voegt crm_launch_checks toe.
// Idempotent — veilig om opnieuw te draaien.
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS template TEXT`;
  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS site_url TEXT`;
  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS probe_url TEXT`;
  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS go_live_date DATE`;
  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS live_at TIMESTAMPTZ`;

  await sql`ALTER TABLE crm_milestones ADD COLUMN IF NOT EXISTS phase TEXT`;
  await sql`ALTER TABLE crm_milestones ADD COLUMN IF NOT EXISTS owner TEXT NOT NULL DEFAULT 'vincent'`;
  await sql`ALTER TABLE crm_milestones ADD COLUMN IF NOT EXISTS blocking BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE crm_milestones ADD COLUMN IF NOT EXISTS depends_on UUID`;
  await sql`ALTER TABLE crm_milestones ADD COLUMN IF NOT EXISTS check_key TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS crm_launch_checks (
      project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
      check_key TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pass', 'warn', 'fail')),
      detail TEXT,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (project_slug, check_key)
    )
  `;
  console.log('✅ LaunchAssist-tabellen klaar');
}

main().catch((e) => { console.error(e); process.exit(1); });
