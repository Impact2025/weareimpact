const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addBlogHeaderFields() {
  console.log('Adding header_type and header_color fields to posts table...\n');

  try {
    // Add header_type column
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS header_type VARCHAR(20) DEFAULT 'image'
    `;
    console.log('Added header_type column');

    // Add header_color column
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS header_color VARCHAR(20) DEFAULT 'orange'
    `;
    console.log('Added header_color column');

    // Add header_title column (optional custom title for color headers)
    await sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS header_title TEXT
    `;
    console.log('Added header_title column');

    console.log('\nAll columns added successfully!');

    // Verify columns
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'posts'
      AND column_name IN ('header_type', 'header_color', 'header_title')
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

addBlogHeaderFields();
