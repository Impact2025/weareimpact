const { neon } = require('@neondatabase/serverless');
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

// Klantreis: één inbox over alle leadbronnen (inbox_triage) en de koppeling
// dossier ↔ CRM (crm_projects.company_id / deal_id). Alles additief.
async function createKlantreisTables() {
  try {
    console.log('🔧 Creating klantreis tables...\n');

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS inbox_triage (
        source TEXT NOT NULL,
        source_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('converted', 'dismissed')),
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
        handled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (source, source_id)
      )
    `;
    console.log('✅ Created table: inbox_triage');

    await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_projects_company ON crm_projects(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_projects_deal ON crm_projects(deal_id)`;
    console.log('✅ Added crm_projects.company_id / deal_id');

    console.log('\n🎉 Klantreis tables ready');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createKlantreisTables();
