import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Laad .env.local handmatig (geen dotenv dependency nodig)
const envPath = join(__dirname, '..', '.env.local');
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('📦 Creating omi_memories table...');

  // Inbox voor Omi-gesprekken (wearable). Omi weet niets van ons CRM/dossiers,
  // dus elk gesprek landt hier eerst ongekoppeld. Een simpele naam-match tegen
  // bedrijven/contacten/dossiers levert een suggestie; Vincent bevestigt met
  // 1 klik in /admin/omi, wat pas dan een crm_activities-notitie of
  // crm_agreements-afspraak aanmaakt. Zo komt er nooit ruis in het CRM zonder
  // dat hij het ziet.
  await sql`
    CREATE TABLE IF NOT EXISTS omi_memories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      omi_id TEXT NOT NULL UNIQUE,
      uid TEXT,
      title TEXT,
      overview TEXT,
      category TEXT,
      transcript TEXT,
      action_items JSONB NOT NULL DEFAULT '[]',
      started_at TIMESTAMPTZ,
      finished_at TIMESTAMPTZ,
      omi_created_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'linked', 'ignored')),
      linked_type TEXT CHECK (linked_type IN ('company', 'contact', 'deal', 'project')),
      linked_id TEXT,
      linked_label TEXT,
      activity_id UUID REFERENCES crm_activities(id) ON DELETE SET NULL,
      suggested_type TEXT CHECK (suggested_type IN ('company', 'contact', 'deal', 'project')),
      suggested_id TEXT,
      suggested_label TEXT,
      raw JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_omi_memories_status ON omi_memories(status, created_at DESC)`;

  console.log('✅ omi_memories table ready');
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
