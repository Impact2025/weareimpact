import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkContent() {
  try {
    const posts = await sql`
      SELECT slug, title, LEFT(content, 500) as content_preview
      FROM posts
      WHERE slug = 'ai-tools-non-profits'
      LIMIT 1
    `;

    if (posts.length > 0) {
      console.log('Slug:', posts[0].slug);
      console.log('Title:', posts[0].title);
      console.log('\nContent preview (first 500 chars):');
      console.log(posts[0].content_preview);
      console.log('\n---');

      // Check if it's HTML or plain text
      const hasHTMLTags = /<[^>]+>/.test(posts[0].content_preview);
      console.log('Contains HTML tags:', hasHTMLTags);
    } else {
      console.log('No post found with that slug');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkContent();
