const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addKbAudioFields() {
  console.log('Adding podcast/audio fields to kb_articles table...\n');

  try {
    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS audio_url TEXT
    `;
    console.log('Added audio_url column');

    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS audio_title TEXT
    `;
    console.log('Added audio_title column');

    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS audio_duration INTEGER
    `;
    console.log('Added audio_duration column');

    await sql`
      ALTER TABLE kb_articles
      ADD COLUMN IF NOT EXISTS transcript TEXT
    `;
    console.log('Added transcript column');

    console.log('\nAll columns added successfully!');

    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'kb_articles'
      AND column_name IN ('audio_url', 'audio_title', 'audio_duration', 'transcript')
      ORDER BY column_name
    `;

    console.log('\nVerification:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addKbAudioFields();
