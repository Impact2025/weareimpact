const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function addChecklistLeadsTable() {
  try {
    console.log('🔧 Adding checklist_leads table...\n');

    const sql = neon(process.env.DATABASE_URL);

    // Create checklist_leads table
    await sql`
      CREATE TABLE IF NOT EXISTS checklist_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        organisatie VARCHAR(255),
        source VARCHAR(100) DEFAULT 'ai-proof-checklist',
        downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: checklist_leads');

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_checklist_leads_created
      ON checklist_leads(created_at DESC)
    `;
    console.log('✅ Created index: idx_checklist_leads_created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_checklist_leads_email
      ON checklist_leads(email)
    `;
    console.log('✅ Created index: idx_checklist_leads_email');

    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

addChecklistLeadsTable();
