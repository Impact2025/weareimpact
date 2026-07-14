const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addBlogAudioFields() {
  console.log('Adding podcast/audio fields to posts table...\n');

  try {
    // URL of the uploaded .m4a podcast (Vercel Blob)
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS audio_url TEXT
    `;
    console.log('Added audio_url column');

    // Optional display title for the episode (falls back to the post title)
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS audio_title TEXT
    `;
    console.log('Added audio_title column');

    // Duration in seconds (for schema.org AudioObject + player UI)
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS audio_duration INTEGER
    `;
    console.log('Added audio_duration column');

    // Transcript of the podcast — the real SEO payload (indexable unique text)
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS transcript TEXT
    `;
    console.log('Added transcript column');

    console.log('\nAll columns added successfully!');

    // Verify columns
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'posts'
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

addBlogAudioFields();
