import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { faqPageSchema, breadcrumbSchema } from '@/lib/seo-kit'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen — WeAreImpact',
  description:
    'Antwoorden op veelgestelde vragen over WeAreImpact: AI-advies voor het sociaal domein, interim verandermanagement, kwartiermaken en praktische workshops.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Veelgestelde vragen — WeAreImpact',
    description: 'Alles over AI-advies, interim en verandermanagement in het sociaal domein.',
    url: '/faq',
  },
}

const APP_URL = 'https://weareimpact.nl'

const FAQ = [
  {
    question: 'Wat is WeAreImpact?',
    answer:
      'WeAreImpact is een sociaal innovatiebureau dat organisaties in het sociaal domein helpt met AI-advies, interim verandermanagement en kwartiermaken.',
  },
  {
    question: 'Voor welke organisaties werken jullie?',
    answer:
      'Gemeenten, welzijnsorganisaties, zorginstellingen en maatschappelijke initiatieven die mensgericht willen digitaliseren.',
  },
  {
    question: 'Wat doen jullie met AI in het sociaal domein?',
    answer:
      'We zetten AI in voor triage, signalering en ondersteuning van professionals — met oog voor privacy, ethiek en de menselijke maat.',
  },
  {
    question: 'Bieden jullie ook interim ondersteuning?',
    answer:
      'Ja. We leveren interim verandermanagers en kwartiermakers voor digitale transformatietrajecten in het sociaal domein.',
  },
  {
    question: 'Werken jullie landelijk?',
    answer:
      'Ja, WeAreImpact werkt voor opdrachtgevers in heel Nederland, zowel lokaal als regionaal.',
  },
  {
    question: 'Hoe start ik een traject?',
    answer:
      'Neem contact op via de contactpagina. We bespreken de vraag en stellen een concreet, praktisch plan op.',
  },
]

export default function FaqPage() {
  const jsonLd = [
    faqPageSchema(FAQ),
    breadcrumbSchema([
      { name: 'Home', url: `${APP_URL}/` },
      { name: 'FAQ', url: `${APP_URL}/faq` },
    ]),
  ]

  return (
    <div className="min-h-screen">
      {jsonLd.map((s, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">
            Home
          </Link>{' '}
          / <span>FAQ</span>
        </nav>
        <h1 className="text-3xl font-bold mb-2">Veelgestelde vragen</h1>
        <p className="text-muted-foreground mb-8">
          Korte, feitelijke antwoorden — direct citeerbaar voor AI-zoekresultaten.
        </p>
        <div className="divide-y border rounded-lg">
          {FAQ.map((it, i) => (
            <details key={i} className="p-4">
              <summary className="cursor-pointer font-medium">{it.question}</summary>
              <p className="mt-2 text-muted-foreground">{it.answer}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
