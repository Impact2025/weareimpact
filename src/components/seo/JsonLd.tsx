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

// FAQ Schema for Homepage - Sociale Innovatie & AI
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // Categorie 1: Visie & Strategie
    {
      '@type': 'Question',
      name: 'Wat betekent de rol van \'Strategic Innovation Partner\' precies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dit is fundamenteel anders dan een interim-manager die \'op de winkel past\'. Als Strategic Innovation Partner is Vincent van Munster een veranderaar. Zijn belofte is concreet: hij maakt uw organisatie in precies 3 maanden AI-ready. Dit omvat niet alleen de techniek, maar vooral de implementatie van strategisch sociaal beleid en het ontwerpen van ecosystemen voor menselijk geluk.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe kijkt u aan tegen de ethiek van AI en privacy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De kernvisie is: "Ik verkoop geen data, ik verkoop impact." In een tijd waarin Big Tech data vaak ziet als handelswaar, ontwikkelt Vincent ecosystemen waarin privacy en empathie leidend zijn. Technologie wordt hier ingezet als een \'enabler\' voor echt contact en om mensen te helpen offline te leven, in plaats van ze aan een scherm te binden.',
      },
    },
    // Categorie 2: Impact & Software
    {
      '@type': 'Question',
      name: 'Hoe maakt software als DAAR maatschappelijke impact meetbaar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Traditionele systemen richten zich op administratie. DAAR is ontwikkeld om vrijwilligerswerk te waarderen. De software introduceert een unieke metric voor gemeenten en stichtingen: het meetbaar maken van \'Geluksmomenten\'. Hiermee verschuift de focus van kille cijfers naar daadwerkelijke maatschappelijke waarde.',
      },
    },
    {
      '@type': 'Question',
      name: 'Waarin verschilt \'Bewaardvoorjou\' van standaard zorgsystemen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Veel systemen zijn functionele databases. Bewaardvoorjou is een empathische AI-tool gericht op de \'Life Journey\' van ouderen. Het doel is niet opslag, maar verbinding: het vastleggen van levensverhalen om generaties te verbinden en eenzaamheid actief tegen te gaan.',
      },
    },
    // Categorie 3: Samenwerking
    {
      '@type': 'Question',
      name: 'Wat houdt de \'3-maanden transformatie\' in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dit is een intensief traject voor organisaties die willen innoveren zonder jarenlange consultancy-trajecten. In één kwartaal (Q1, Q2, etc.) wordt de \'Funding Engine\' (strategie) gekoppeld aan de \'Growth Engine\' (tech). Let op: Vanwege de intensiteit zijn er per kwartaal slechts beperkte plekken beschikbaar (Status Q1 2026: nog 2 plekken).',
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
}) {
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
