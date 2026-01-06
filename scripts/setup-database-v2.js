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

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...\n');

    const sql = neon(process.env.DATABASE_URL);

    // Create ai_scan_leads table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS ai_scan_leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255),
          name VARCHAR(255),
          organization VARCHAR(255),
          phone VARCHAR(50),
          sector VARCHAR(50) NOT NULL,
          challenge VARCHAR(50) NOT NULL,
          ai_usage VARCHAR(50) NOT NULL,
          ai_advice TEXT,
          source VARCHAR(100) DEFAULT '/ai-scanner',
          status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
          starred BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created table: ai_scan_leads');
    } catch (error) {
      console.log(`⚠️  Table ai_scan_leads: ${error.message}`);
    }

    // Create chat_sessions table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          visitor_id VARCHAR(100) NOT NULL,
          source VARCHAR(20) DEFAULT 'widget' CHECK (source IN ('widget', 'booking', 'scan', 'kennisbank')),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
          page_url VARCHAR(500),
          referrer VARCHAR(500),
          device VARCHAR(50),
          user_agent TEXT,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ended_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created table: chat_sessions');
    } catch (error) {
      console.log(`⚠️  Table chat_sessions: ${error.message}`);
    }

    // Create chat_messages table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created table: chat_messages');
    } catch (error) {
      console.log(`⚠️  Table chat_messages: ${error.message}`);
    }

    // Create page_views table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS page_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          visitor_id VARCHAR(100) NOT NULL,
          page_path VARCHAR(500) NOT NULL,
          page_title VARCHAR(255),
          referrer VARCHAR(500),
          user_agent TEXT,
          device VARCHAR(50),
          country VARCHAR(100),
          city VARCHAR(100),
          duration_seconds INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created table: page_views');
    } catch (error) {
      console.log(`⚠️  Table page_views: ${error.message}`);
    }

    // Create leads table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          company VARCHAR(255),
          source VARCHAR(100) NOT NULL,
          notes TEXT,
          status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
          starred BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created table: leads');
    } catch (error) {
      console.log(`⚠️  Table leads: ${error.message}`);
    }

    // Create activity_log table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS activity_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(50) NOT NULL CHECK (type IN ('scan', 'chat', 'blog', 'lead', 'page_view', 'booking', 'newsletter')),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created table: activity_log');
    } catch (error) {
      console.log(`⚠️  Table activity_log: ${error.message}`);
    }

    console.log('\n📊 Creating indexes...\n');

    // Create indexes
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

    console.log('\n✨ Database setup complete!');
    console.log('\nYou can now use the admin leads page at /admin/leads');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
