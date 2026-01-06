// Run with: node scripts/migrate-kennisbank-header.js
// This migration adds header_type, header_color, and header_title columns to kb_articles
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function migrateKennisbankHeader() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('Migrating kb_articles table - adding header columns...\n');

  try {
    // Add header_type column (for image or color background)
    console.log('Adding header_type column...');
    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS header_type TEXT DEFAULT 'image'
    `;
    console.log('   header_type column added\n');

    // Add header_color column (orange or slate)
    console.log('Adding header_color column...');
    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS header_color TEXT DEFAULT 'orange'
    `;
    console.log('   header_color column added\n');

    // Add header_title column (custom title for color headers)
    console.log('Adding header_title column...');
    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS header_title TEXT DEFAULT ''
    `;
    console.log('   header_title column added\n');

    console.log('Migration complete!');
    console.log('\nNew columns added to kb_articles:');
    console.log('  - header_type: "image" (default) or "color"');
    console.log('  - header_color: "orange" (default) or "slate"');
    console.log('  - header_title: Custom title for color headers');

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateKennisbankHeader();
