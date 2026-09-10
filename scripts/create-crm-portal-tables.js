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

    await sql`
      CREATE TABLE IF NOT EXISTS crm_milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        prd_section TEXT,
        status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
        due_date DATE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        client_visible BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_milestones');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_milestones_project
      ON crm_milestones(project_slug, sort_order)
    `;
    console.log('✅ Created index: idx_crm_milestones_project');

    await sql`
      CREATE TABLE IF NOT EXISTS crm_agreements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        decided_at DATE NOT NULL DEFAULT CURRENT_DATE,
        client_visible BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_agreements');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_agreements_project
      ON crm_agreements(project_slug, decided_at DESC)
    `;
    console.log('✅ Created index: idx_crm_agreements_project');

    await sql`
      CREATE TABLE IF NOT EXISTS crm_actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        title TEXT NOT NULL,
        owner TEXT NOT NULL DEFAULT 'vincent' CHECK (owner IN ('vincent', 'klant', 'waiterAid')),
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
        due_date DATE,
        source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'chat_summary')),
        client_visible BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_actions');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_actions_project
      ON crm_actions(project_slug, status)
    `;
    console.log('✅ Created index: idx_crm_actions_project');

    await sql`ALTER TABLE crm_projects ADD COLUMN IF NOT EXISTS intake_notes TEXT`;
    console.log('✅ Added column: crm_projects.intake_notes');

    await sql`ALTER TABLE crm_questions ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'admin'`;
    await sql`
      ALTER TABLE crm_questions DROP CONSTRAINT IF EXISTS crm_questions_origin_check
    `;
    await sql`
      ALTER TABLE crm_questions ADD CONSTRAINT crm_questions_origin_check
      CHECK (origin IN ('admin', 'iris'))
    `;
    console.log('✅ Added column: crm_questions.origin');

    // Doelgroep: één project kan meerdere gesprekspartners hebben (bv. de
    // restaurant-klant én de opdrachtgever/projecteigenaar), elk met een
    // eigen vragenlijst, chat en magic link.
    for (const table of ['crm_questions', 'crm_chat_messages', 'crm_chat_summaries', 'crm_magic_links']) {
      await sql.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'klant'`);
      await sql.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${table}_audience_check`);
      await sql.query(`ALTER TABLE ${table} ADD CONSTRAINT ${table}_audience_check CHECK (audience IN ('klant', 'opdrachtgever'))`);
      console.log(`✅ Added column: ${table}.audience`);
    }

    await sql`
      CREATE TABLE IF NOT EXISTS crm_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_slug TEXT NOT NULL REFERENCES crm_projects(slug) ON DELETE CASCADE,
        audience TEXT NOT NULL DEFAULT 'klant' CHECK (audience IN ('klant', 'opdrachtgever')),
        filename TEXT NOT NULL,
        content_type TEXT,
        size_bytes INTEGER,
        blob_url TEXT,
        extracted_text TEXT,
        source TEXT NOT NULL DEFAULT 'upload' CHECK (source IN ('upload', 'pasted')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created table: crm_documents');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_crm_documents_project
      ON crm_documents(project_slug, audience, created_at)
    `;
    console.log('✅ Created index: idx_crm_documents_project');

    // Onderscheidt een samenvatting die Iris zelf tijdens het gesprek heeft
    // gemaakt (finish_conversation) van een die Vincent achteraf handmatig
    // heeft laten genereren als vangnet wanneer Iris dat zelf niet deed.
    await sql`ALTER TABLE crm_chat_summaries ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'iris'`;
    await sql`ALTER TABLE crm_chat_summaries DROP CONSTRAINT IF EXISTS crm_chat_summaries_source_check`;
    await sql`
      ALTER TABLE crm_chat_summaries ADD CONSTRAINT crm_chat_summaries_source_check
      CHECK (source IN ('iris', 'admin'))
    `;
    console.log('✅ Added column: crm_chat_summaries.source');

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

createCrmPortalTables();
