const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const dir = './content/kennisbank';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

let issues = [];
files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const { data } = matter(content);

  const missing = [];
  if (!data.seo_title) missing.push('seo_title');
  if (!data.seo_description) missing.push('seo_description');
  if (!data.published_at) missing.push('published_at');
  if (!data.faq_items || data.faq_items.length === 0) missing.push('faq_items');
  if (!data.excerpt) missing.push('excerpt');

  if (missing.length > 0) {
    issues.push({ file, missing });
  }
});

if (issues.length === 0) {
  console.log('✓ All articles have complete SEO metadata!');
} else {
  console.log('Issues found:');
  issues.forEach(i => console.log('-', i.file, ':', i.missing.join(', ')));
}
