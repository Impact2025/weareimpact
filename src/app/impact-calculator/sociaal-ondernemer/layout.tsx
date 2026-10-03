import type { Metadata } from 'next';

const URL = 'https://weareimpact.nl/impact-calculator/sociaal-ondernemer';
const TITLE = 'Tijdwinst-calculator voor sociale en duurzame ondernemers';
const DESCRIPTION =
  'Bereken in 2 minuten wat één terugkerend proces jou aan uren en geld kost, hoeveel AI daarvan overneemt en wanneer je de investering terugverdient. Gratis, eerlijk gerekend en zonder verkooppraatjes.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'AI tijdwinst calculator ondernemer',
    'AI voor sociale ondernemers',
    'AI voor duurzame ondernemers',
    'procesautomatisering sociale onderneming',
    'AI terugverdientijd berekenen',
    'AI besparing kleine organisatie',
    'tijdwinst AI offertes',
    'subsidieverantwoording automatiseren',
    'WeAreImpact',
    'Procesversneller',
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: URL,
    siteName: 'WeAreImpact',
    title: `${TITLE} | WeAreImpact`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tijdwinst-calculator voor sociale en duurzame ondernemers — WeAreImpact',
  description: DESCRIPTION,
  url: URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Person', name: 'Vincent van Munster', url: 'https://weareimpact.nl' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoe rekent de calculator voor ondernemers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Je kiest één terugkerend proces en vult in hoeveel uur per week jullie daaraan kwijt zijn en wat een uur waard is. De calculator gaat ervan uit dat AI 30 tot 50 procent van die tijd overneemt, met 40 procent als middenwaarde. Dat is een eigen aanname, geen gemeten resultaat. Een mens blijft elk resultaat controleren.',
      },
    },
    {
      '@type': 'Question',
      name: 'Waarom gaat het om één proces en niet om mijn hele organisatie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een AI-oplossing werkt het best op één afgebakend, terugkerend proces met vaste stappen, zoals intake, offertes of subsidieverantwoording. Dat maakt de uitkomst controleerbaar en de investering klein. Daarom rekent de calculator op procesniveau.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is dit geschikt voor een kleine of eenmansorganisatie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. De calculator werkt vanaf één persoon. Bij kleine organisaties telt elk uur dat vrijkomt zwaar, en de investering (de Doorbraak Sprint kost een vast bedrag van 1.750 euro excl. btw) is overzichtelijk.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is de calculator gratis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. De hoofduitkomst zie je direct. Het volledige rapport met onderbouwing, bandbreedte en terugverdientijd ontvang je gratis per e-mail.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Impact Calculator', item: 'https://weareimpact.nl/impact-calculator' },
    { '@type': 'ListItem', position: 3, name: 'Voor ondernemers', item: URL },
  ],
};

export default function OndernemerCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
