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

async function createIndexes() {
  try {
    console.log('🔧 Creating database indexes...');

    const sql = neon(process.env.DATABASE_URL);

    // Create indexes using tagged template literals
    const indexes = [
      { name: 'idx_ai_scan_leads_created', query: () => sql`CREATE INDEX IF NOT EXISTS idx_ai_scan_leads_created ON ai_scan_leads(created_at DESC)` },
      { name: 'idx_ai_scan_leads_status', query: () => sql`CREATE INDEX IF NOT EXISTS idx_ai_scan_leads_status ON ai_scan_leads(status)` },
      { name: 'idx_ai_scan_leads_sector', query: () => sql`CREATE INDEX IF NOT EXISTS idx_ai_scan_leads_sector ON ai_scan_leads(sector)` },
      { name: 'idx_chat_sessions_started', query: () => sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_started ON chat_sessions(started_at DESC)` },
      { name: 'idx_chat_sessions_visitor', query: () => sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions(visitor_id)` },
      { name: 'idx_chat_sessions_status', query: () => sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status)` },
      { name: 'idx_chat_messages_session', query: () => sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)` },
      { name: 'idx_chat_messages_created', query: () => sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC)` },
      { name: 'idx_page_views_created', query: () => sql`CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC)` },
      { name: 'idx_page_views_visitor', query: () => sql`CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id)` },
      { name: 'idx_page_views_path', query: () => sql`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path)` },
      { name: 'idx_activity_log_created', query: () => sql`CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC)` },
      { name: 'idx_activity_log_type', query: () => sql`CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type)` },
    ];

    for (const index of indexes) {
      try {
        await index.query();
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        console.log(`⚠️  Index ${index.name}: ${error.message}`);
      }
    }

    console.log('\n✨ Indexes created successfully!');

  } catch (error) {
    console.error('❌ Index creation failed:', error);
    process.exit(1);
  }
}

createIndexes();
