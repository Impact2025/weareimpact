// JSON-LD Structured Data Components for SEO

const BASE_URL = 'https://weareimpact.nl';

// Person Schema - Vincent van Munster
export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${BASE_URL}/#person`,
  name: 'Vincent van Munster',
  givenName: 'Vincent',
  familyName: 'van Munster',
  jobTitle: 'AI Welzijn Expert',
  description: 'Sociaal architect en AI Welzijn Expert die digitale ecosystemen ontwerpt voor menselijk geluk.',
  url: BASE_URL,
  image: `${BASE_URL}/vincent-avatar.jpg`,
  sameAs: [
    'https://www.linkedin.com/in/vincent-van-münster',
    'https://twitter.com/vincentvmunster',
  ],
  knowsAbout: [
    'Artificial Intelligence',
    'Welzijn',
    'Sociale Innovatie',
    'LEGO Serious Play',
    'Strategisch Advies',
    'Digital Transformation',
  ],
  worksFor: {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
  },
};

// Organization Schema - WeAreImpact
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'WeAreImpact',
  alternateName: 'We Are Impact',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'WeAreImpact ontwerpt digitale ecosystemen voor menselijk geluk. AI met een sociaal hart.',
  foundingDate: '2020',
  founder: {
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NL',
    addressLocality: 'Nederland',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'v.munster@weareimpact.nl',
    telephone: '+31614470977',
    availableLanguage: ['Dutch', 'English'],
  },
  sameAs: [
    'https://www.linkedin.com/company/weareimpact/',
  ],
  areaServed: {
    '@type': 'Country',
    name: 'Netherlands',
  },
  serviceType: [
    'AI Strategie',
    'Sociale Innovatie',
    'LEGO Serious Play Facilitatie',
    'Interim Management',
    'Strategisch Advies',
  ],
};

// WebSite Schema with SearchAction
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'WeAreImpact',
  url: BASE_URL,
  description: 'Vincent van Munster - AI Welzijn Expert. Digitale ecosystemen voor menselijk geluk.',
  publisher: {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
  },
  inLanguage: 'nl-NL',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// FAQ Schema for Homepage - Persoonlijke Aanpak
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Mijn organisatie moet vernieuwen. Is AI dan altijd de oplossing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nee, zeker niet. Innovatie gaat over mensen, niet over systemen. Als Sociaal Architect kijk ik eerst naar uw vraagstuk. Soms is een slimme AI-toepassing de versneller die u zoekt, maar soms ligt de oplossing in cultuurverandering of een creatieve sessie (zoals LEGO® Serious Play). Ik gebruik technologie als het moet, maar menselijk contact waar het kan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Waarin verschilt jouw rol als \'Strategic Innovation Partner\' van een consultant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een consultant schrijft een rapport; ik breng beweging. Ik word ingehuurd als veranderaar. Of we nu innoveren met geavanceerde AI of via sociale interventies: ik zorg dat u binnen 3 maanden resultaat ziet. Ik help patronen te doorbreken en maak uw organisatie klaar voor de toekomst, met of zonder stekker.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat houdt de \'3-maanden transformatie\' in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ik hanteer een bewezen methodiek om organisaties in precies één kwartaal in een nieuwe versnelling te krijgen. We bepalen samen de koers: wordt het \'The Growth Engine\' (tech & AI) of \'The Playground\' (creatieve innovatie)? Mijn doel is altijd: impact maken en uw team eigenaarschap geven.',
      },
    },
    {
      '@type': 'Question',
      name: 'Ben je beschikbaar voor een interim-opdracht?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Omdat ik geloof in kwaliteit boven kwantiteit, neem ik slechts een beperkt aantal partnerschappen aan. Voor Q2 2026 heb ik momenteel nog 2 plekken beschikbaar voor organisaties die durven te vernieuwen met een sociaal hart.',
      },
    },
  ],
};

// Service Schema
export const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'Service',
      position: 1,
      name: 'AI Strategiesessie',
      description: 'Concrete AI-strategie voor jouw organisatie in 60 minuten.',
      provider: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#person`,
      },
      areaServed: 'Netherlands',
      serviceType: 'Consulting',
    },
    {
      '@type': 'Service',
      position: 2,
      name: 'LEGO Serious Play Workshop',
      description: 'Gefaciliteerde workshop voor teamontwikkeling en strategievorming met LEGO.',
      provider: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#person`,
      },
      areaServed: 'Netherlands',
      serviceType: 'Workshop',
    },
    {
      '@type': 'Service',
      position: 3,
      name: 'Interim Management',
      description: 'Strategische innovatie en implementatie van sociaal beleid.',
      provider: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#person`,
      },
      areaServed: 'Netherlands',
      serviceType: 'Management Consulting',
    },
  ],
};

// Combined schema for homepage
export const homePageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    personSchema,
    organizationSchema,
    websiteSchema,
    faqSchema,
    servicesSchema,
  ],
};

// Article Schema Generator for blog posts
export function generateArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
  audioUrl?: string | null;
  audioDuration?: number | null;
  hasTranscript?: boolean;
}) {
  // schema.org AudioObject for the podcast episode (if present).
  const audioObject = article.audioUrl
    ? {
        associatedMedia: {
          '@type': 'AudioObject',
          contentUrl: article.audioUrl,
          encodingFormat: 'audio/mp4',
          name: article.title,
          description: article.description,
          ...(article.audioDuration
            ? { duration: `PT${Math.round(article.audioDuration)}S` }
            : {}),
        },
        // Lets voice assistants (Google Assistant) read the article aloud.
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.prose'],
        },
      }
    : {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${BASE_URL}/blog/${article.slug}#article`,
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: article.authorName || 'Vincent van Munster',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${article.slug}`,
    },
    inLanguage: 'nl-NL',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
    },
    ...(article.category && { articleSection: article.category }),
    ...(article.tags && { keywords: article.tags.join(', ') }),
    ...(article.readingTime && { timeRequired: `PT${article.readingTime}M` }),
    ...audioObject,
  };
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// Component to render JSON-LD
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// FAQ Schema Generator for kennisbank articles
export function generateFAQSchema(faqItems: Array<{ question: string; answer: string }>) {
  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/\*\*/g, '').replace(/\n/g, ' ').trim(),
      },
    })),
  };
}

// Pre-built components for easy use
export function HomePageJsonLd() {
  return <JsonLd data={homePageSchema} />;
}

export function ArticleJsonLd({ article }: { article: Parameters<typeof generateArticleSchema>[0] }) {
  return <JsonLd data={generateArticleSchema(article)} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return <JsonLd data={generateBreadcrumbSchema(items)} />;
}

export function FAQPageJsonLd({ faqItems }: { faqItems: Array<{ question: string; answer: string }> }) {
  const schema = generateFAQSchema(faqItems);
  if (!schema) return null;
  return <JsonLd data={schema} />;
}

// HowTo Schema Generator for step-by-step guides
interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export function generateHowToSchema(data: {
  title: string;
  description: string;
  totalTime?: string; // ISO 8601 duration format, e.g., "PT30M" for 30 minutes
  steps: HowToStep[];
  url: string;
}) {
  if (!data.steps || data.steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.title,
    description: data.description,
    ...(data.totalTime && { totalTime: data.totalTime }),
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
      ...(step.image && { image: step.image }),
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
  };
}

export function HowToJsonLd({ data }: { data: Parameters<typeof generateHowToSchema>[0] }) {
  const schema = generateHowToSchema(data);
  if (!schema) return null;
  return <JsonLd data={schema} />;
}

// Extract steps from markdown content (looks for numbered lists or ## Stap patterns)
export function extractStepsFromContent(content: string): HowToStep[] {
  const steps: HowToStep[] = [];

  // Pattern 1: ## Stap 1: Title or ## 1. Title
  const stepHeadingRegex = /^##\s*(?:Stap\s*)?(\d+)[:.]\s*(.+)$/gm;
  let match;

  while ((match = stepHeadingRegex.exec(content)) !== null) {
    const stepNumber = parseInt(match[1]);
    const stepTitle = match[2].trim();

    // Get content until next heading
    const startIndex = match.index + match[0].length;
    const nextHeadingMatch = content.slice(startIndex).match(/^##\s/m);
    const endIndex = nextHeadingMatch
      ? startIndex + (nextHeadingMatch.index || content.length)
      : content.length;

    const stepContent = content.slice(startIndex, endIndex).trim();
    // Clean markdown formatting
    const cleanContent = stepContent
      .replace(/\*\*/g, '')
      .replace(/\n+/g, ' ')
      .replace(/- /g, '')
      .slice(0, 500)
      .trim();

    steps.push({
      name: stepTitle,
      text: cleanContent || stepTitle,
    });
  }

  // Pattern 2: Numbered list items (1. 2. 3.)
  if (steps.length === 0) {
    const numberedListRegex = /^(\d+)\.\s+\*\*(.+?)\*\*[:\s]*(.*)$/gm;
    while ((match = numberedListRegex.exec(content)) !== null) {
      steps.push({
        name: match[2].trim(),
        text: match[3].trim() || match[2].trim(),
      });
    }
  }

  return steps;
}
