const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Define related articles by category and topic
const relatedLinks = {
  // AI articles link to each other
  'ai-tech': {
    articles: [
      'administratieve-druk-verlagen-ai',
      'ai-implementeren-non-profit-stappenplan',
      'ai-prompts-voor-non-profits',
      'ai-tools-vergelijking-welzijn-2025',
      'ai-voor-warme-handen-technologie-die-mensen-verbindt',
      'chatgpt-voor-non-profits-praktische-toepassingen',
      'privacy-ai-zorg-avg-checklist',
      'team-ai-ready-maken'
    ]
  },
  // Vrijwilligers articles
  'vrijwilligers': {
    articles: [
      '180-vrijwilligers-beheren-systeem',
      'vier-generaties-vrijwilligers-managen',
      'vog-aanvragen-vrijwilligers-stappenplan-2025',
      'vrijwilligers-werven-die-blijven',
      'vrijwilligersbeleid-schrijven-dat-werkt',
      'vrijwilligerscheck-talenten-matchen',
      'vrijwilligersplatform-bouwen-of-kopen',
      'impact-reserve-vrijwilligers-uitlenen'
    ]
  },
  // Impact meten
  'impact-meten': {
    articles: [
      'impact-box-70000-geluksmomenten',
      'impact-meten-zonder-excel-drama',
      'theory-of-change-in-een-middag'
    ]
  },
  // Sociaal ondernemen
  'sociaal-ondernemen': {
    articles: [
      'code-sociale-ondernemingen-complete-gids',
      'sociaal-ondernemen-starten-checklist',
      'social-enterprise-businessmodel-canvas',
      'cultuurverandering-top-down-inside-out',
      'innovatie-geen-hype-project',
      'interim-manager-kiezen-welzijn'
    ]
  },
  // Subsidie & funding
  'subsidie-funding': {
    articles: [
      'fondsenwerving-voor-sociale-organisaties',
      'subsidie-aanvragen-zonder-bureaucratie-stappenplan',
      'organisatie-funding-ready-90-dagen'
    ]
  },
  // LEGO
  'lego-serious-play': {
    articles: [
      'lego-serious-play-uitleg-voor-beslissers',
      'lego-serious-play-voor-teamontwikkeling'
    ]
  }
};

// Cross-category links
const crossLinks = {
  'ai-implementeren-non-profit-stappenplan': ['vrijwilligersplatform-bouwen-of-kopen', 'impact-meten-zonder-excel-drama'],
  'administratieve-druk-verlagen-ai': ['subsidie-aanvragen-zonder-bureaucratie-stappenplan', 'vrijwilligersbeleid-schrijven-dat-werkt'],
  'vrijwilligers-werven-die-blijven': ['vrijwilligersbeleid-schrijven-dat-werkt', 'vier-generaties-vrijwilligers-managen'],
  'impact-meten-zonder-excel-drama': ['theory-of-change-in-een-middag', 'organisatie-funding-ready-90-dagen'],
  'sociaal-ondernemen-starten-checklist': ['code-sociale-ondernemingen-complete-gids', 'fondsenwerving-voor-sociale-organisaties'],
  'subsidie-aanvragen-zonder-bureaucratie-stappenplan': ['organisatie-funding-ready-90-dagen', 'fondsenwerving-voor-sociale-organisaties']
};

const dir = './content/kennisbank';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

// Load all article titles
const articleTitles = {};
files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const { data } = matter(content);
  articleTitles[file.replace('.md', '')] = data.title;
});

// Function to create related articles section
function createRelatedSection(currentSlug, category) {
  const categoryArticles = relatedLinks[category]?.articles || [];
  const crossLinkArticles = crossLinks[currentSlug] || [];

  // Get related articles (excluding current)
  let related = [...new Set([...categoryArticles, ...crossLinkArticles])]
    .filter(slug => slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return null;

  let section = '\n\n---\n\n## Gerelateerde artikelen\n\n';
  related.forEach(slug => {
    const title = articleTitles[slug];
    if (title) {
      section += `- [${title}](/kennisbank/${slug})\n`;
    }
  });

  return section;
}

// Process each file
files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  const slug = file.replace('.md', '');

  // Skip if already has related articles section
  if (content.includes('## Gerelateerde artikelen')) {
    console.log('Skip (has links):', file);
    return;
  }

  const relatedSection = createRelatedSection(slug, data.category_slug);

  if (relatedSection) {
    // Add before the last --- (before author signature)
    // Find the last occurrence of the author signature pattern
    const authorPattern = /\n---\n\n\*Dit artikel is geschreven/;

    if (content.match(authorPattern)) {
      content = content.replace(authorPattern, relatedSection + '\n---\n\n*Dit artikel is geschreven');
    } else {
      // Just append to end
      content = content + relatedSection;
    }

    fs.writeFileSync(filePath, content);
    console.log('Added links to:', file);
  } else {
    console.log('No links for:', file);
  }
});

console.log('Done adding internal links');
