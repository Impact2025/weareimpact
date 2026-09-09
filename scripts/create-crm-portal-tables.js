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

async function createCrmPortalTables() {
  try {
    console.log('🔧 Creating CRM portal tables...\n');

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS crm_projects (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        client_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_projects');

    await sql`
      CREATE TABLE IF NOT EXISTS crm_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        question TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered')),
        client_answer TEXT,
        answered_at TIMESTAMPTZ,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_questions');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_questions_project
      ON crm_questions(project_slug, sort_order)
    `;
    console.log('✅ Created index: idx_crm_questions_project');

    await sql`
      CREATE TABLE IF NOT EXISTS crm_magic_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_magic_links');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_magic_links_project
      ON crm_magic_links(project_slug)
    `;
    console.log('✅ Created index: idx_crm_magic_links_project');

    await sql`
      CREATE TABLE IF NOT EXISTS crm_chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_chat_messages');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_chat_messages_project
      ON crm_chat_messages(project_slug, created_at)
    `;
    console.log('✅ Created index: idx_crm_chat_messages_project');

    await sql`
      CREATE TABLE IF NOT EXISTS crm_chat_summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        summary TEXT NOT NULL,
        next_steps TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_chat_summaries');

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

createCrmPortalTables();
