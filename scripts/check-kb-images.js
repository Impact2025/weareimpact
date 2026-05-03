const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    const articles = await sql`
      SELECT title, slug, featured_image, header_type, header_color, header_title
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 10
    `;
    console.log('Kennisbank articles:');
    articles.forEach(a => {
      console.log('\n---');
      console.log('Title:', a.title);
      console.log('Slug:', a.slug);
      console.log('Header Type:', a.header_type);
      console.log('Header Color:', a.header_color);
      console.log('Header Title:', a.header_title);
      console.log('Featured Image:', a.featured_image);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
