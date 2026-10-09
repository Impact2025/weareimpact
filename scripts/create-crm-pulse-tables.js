// Wekelijkse pulse-chat met Iris. Gebruik: node scripts/create-crm-pulse-tables.js [slug-om-aan-te-zetten]
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8').split('\n').forEach((l) => {
  const m = l.match(/^([^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS pulse_enabled BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS last_pulse_at TIMESTAMPTZ`;
  await sql`CREATE TABLE IF NOT EXISTS crm_pulses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    score INTEGER CHECK (score BETWEEN 1 AND 10),
    helped TEXT,
    adjust TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_pulses_project ON crm_pulses(project_slug, created_at DESC)`;
  await sql`CREATE TABLE IF NOT EXISTS crm_pulse_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pulse_id UUID NOT NULL REFERENCES crm_pulses(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_pulse_messages ON crm_pulse_messages(pulse_id, created_at)`;
  const slug = process.argv[2];
  if (slug) await sql`UPDATE crm_projects SET pulse_enabled = TRUE WHERE slug = ${slug}`;
  console.log('OK', slug ? `pulse aan voor ${slug}` : '');
})().catch((e) => { console.error(e.message); process.exit(1); });
