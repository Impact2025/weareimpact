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

// Nazorg: tevredenheidsmeting (crm_feedback) en afrondingsmoment van sprints.
// Alles additief.
async function createNazorgTables() {
  try {
    console.log('🔧 Creating nazorg tables...\n');

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS crm_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT NOT NULL UNIQUE,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        project_slug TEXT REFERENCES crm_projects(slug) ON DELETE SET NULL,
        deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
        email TEXT NOT NULL,
        score INTEGER CHECK (score BETWEEN 0 AND 10),
        comment TEXT,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        answered_at TIMESTAMPTZ
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_feedback_company ON crm_feedback(company_id)`;
    console.log('✅ Created table: crm_feedback');

    await sql`ALTER TABLE sprint_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
    await sql`UPDATE sprint_sessions SET completed_at = updated_at WHERE status = 'afgerond' AND completed_at IS NULL`;
    console.log('✅ Added sprint_sessions.completed_at');

    console.log('\n🎉 Nazorg tables ready');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createNazorgTables();
