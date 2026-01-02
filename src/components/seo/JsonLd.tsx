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

// FAQ Schema for Homepage
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wat doet Vincent van Munster?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vincent van Munster is AI Welzijn Expert en sociaal architect. Hij ontwerpt digitale ecosystemen die technologie inzetten voor menselijk welzijn, met focus op privacy en empathie. Hij helpt organisaties met AI-strategie, sociale innovatie en LEGO Serious Play workshops.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is WeAreImpact?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WeAreImpact is het platform van Vincent van Munster waar digitale oplossingen worden ontworpen voor maatschappelijke impact. Van software voor vrijwilligerswerk (DAAR) tot AI-tools voor ouderen (Bewaardvoorjou) - alle ventures delen dezelfde missie: technologie die mensen verbindt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is LEGO Serious Play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LEGO Serious Play is een gefaciliteerde workshop-methode waarbij deelnemers met LEGO bouwen om complexe vraagstukken te verkennen. Vincent is gecertificeerd LSP facilitator en zet deze methode in voor teamontwikkeling, strategievorming en innovatie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe kan AI helpen in de welzijnssector?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI kan de welzijnssector versterken door administratieve taken te automatiseren, patronen te herkennen in hulpvragen, vrijwilligers efficienter te matchen, en gepersonaliseerde ondersteuning te bieden. Vincent focust op ethische AI-toepassingen die privacy respecteren.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan ik Vincent inhuren voor advies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, Vincent is beschikbaar als Strategic Innovation Partner voor interim opdrachten en adviestrajecten. Hij helpt organisaties AI-ready te worden en sociaal beleid te implementeren. Plan een vrijblijvend kennismakingsgesprek via de website.',
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
