// Opmerkingen van de klant bij een stap in het portaal. Idempotent.
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
  await sql`
    CREATE TABLE IF NOT EXISTS crm_milestone_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      milestone_id UUID NOT NULL REFERENCES crm_milestones(id) ON DELETE CASCADE,
      project_slug TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'klant',
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_milestone_comments ON crm_milestone_comments(milestone_id, created_at)`;
  console.log('✅ crm_milestone_comments klaar');
}

main().catch((e) => { console.error(e); process.exit(1); });
