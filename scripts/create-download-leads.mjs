// Maakt de tabellen voor het downloadsysteem (AI-projectmanager-templates).
// Veilig om opnieuw te draaien (IF NOT EXISTS). Gebruik: node scripts/create-download-leads.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf-8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
}
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS download_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    organisatie TEXT,
    resource TEXT NOT NULL,
    source_page TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    segment TEXT,
    score INT NOT NULL DEFAULT 0,
    ip_hash TEXT,
    consent_version TEXT,
    consented_at TIMESTAMPTZ,
    followup_optin BOOLEAN NOT NULL DEFAULT FALSE,
    emailed BOOLEAN NOT NULL DEFAULT FALSE,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    anonymized_at TIMESTAMPTZ
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_download_leads_email ON download_leads (LOWER(email))`;
await sql`CREATE INDEX IF NOT EXISTS idx_download_leads_created ON download_leads (created_at DESC)`;
await sql`CREATE INDEX IF NOT EXISTS idx_download_leads_ip ON download_leads (ip_hash, created_at DESC)`;

await sql`
  CREATE TABLE IF NOT EXISTS download_opens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES download_leads(id) ON DELETE CASCADE,
    resource TEXT,
    likely_bot BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_download_opens_lead ON download_opens (lead_id)`;

console.log('download_leads en download_opens klaar');
