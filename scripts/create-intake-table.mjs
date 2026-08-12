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
  console.log('📦 Creating intake_submissions table...');

  await sql`
    CREATE TABLE IF NOT EXISTS intake_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      organisation VARCHAR(255),
      phone VARCHAR(50),
      answers JSONB NOT NULL,
      duration_seconds INTEGER,
      source VARCHAR(100) DEFAULT '/intake',
      status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
      starred BOOLEAN DEFAULT FALSE,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_intake_submissions_created ON intake_submissions(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_intake_submissions_status ON intake_submissions(status)`;

  console.log('✅ intake_submissions table ready');
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
