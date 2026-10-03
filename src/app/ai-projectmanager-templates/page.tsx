import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AI_PM_DOWNLOADS,
  AI_PM_TOOLKIT,
  BASE_URL,
  PHASE_LABELS,
  downloadsByPhase,
} from '@/lib/ai-pm-downloads';
import { DownloadCard } from '@/components/landing/DownloadCard';
import { BookingButton } from '@/components/landing/BookingButton';

const URL = `${BASE_URL}/ai-projectmanager-templates`;
const N = AI_PM_DOWNLOADS.length;

export const metadata: Metadata = {
  title: `${N} gratis templates en checklists voor AI-projecten`,
  description: `Gratis downloads voor AI-projecten: projectplan, kick-off agenda, stakeholderkaart, privacychecklist, meetblad, risicomatrix, go/no-go-checklist, overdrachtsplan en meer. Alles in één toolkit.`,
  keywords: [
    'AI projectplan template',
    'go no go checklist AI',
    'risicomatrix AI project',
    'privacychecklist AI project',
    'AI project template download',
    'AI-projectmanager toolkit',
    'WeAreImpact',
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: URL,
    siteName: 'WeAreImpact',
    title: `${N} gratis templates voor AI-projecten | WeAreImpact`,
    description: 'Van kick-off tot overdracht: alle documenten die ik zelf gebruik als AI-projectmanager.',
  },
};

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Gratis templates en checklists voor AI-projecten',
  numberOfItems: N,
  itemListElement: AI_PM_DOWNLOADS.map((d, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'DigitalDocument',
      name: d.title,
      description: d.description,
      encodingFormat: 'application/pdf',
      inLanguage: 'nl-NL',
      isAccessibleForFree: true,
      author: { '@type': 'Person', name: 'Vincent van Munster', url: `${BASE_URL}/vincent-van-munster` },
      url: `${URL}#${d.id}`,
    },
  })),
};

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'AI-projectmanager', item: `${BASE_URL}/ai-projectmanager` },
    { '@type': 'ListItem', position: 3, name: 'Templates', item: URL },
  ],
};

const faqs = [
  {
    q: 'Zijn de templates echt gratis?',
    a: 'Ja. Je laat je e-mailadres achter zodat ik je de link kan sturen en weet wie de documenten gebruikt. Je krijgt geen nieuwsbrief en geen vervolgmails.',
  },
  {
    q: 'Wat zijn de bestanden?',
    a: 'PDF\'s in A4, bedoeld om uit te printen of digitaal in te vullen en met je projectgroep te bespreken. De toolkit is een zip met alle PDF\'s.',
  },
  {
    q: 'Zijn dit juridische documenten?',
    a: 'Nee. Het zijn praktische hulpmiddelen. Leg vragen over privacy en de Europese AI-verordening altijd voor aan je functionaris gegevensbescherming of jurist.',
  },
  {
    q: 'In welke volgorde gebruik ik ze?',
    a: 'Begin met het projectplan en de kick-off, regel privacy en de stakeholders, meet met het meetblad en houd de risicomatrix bij tijdens de pilot, en sluit af met de go/no-go-checklist, het besluit- en leerblad en het overdrachtsplan.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function TemplatesPage() {
  return (
    <main className="pt-32 pb-24 bg-[#FDFBF7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="container mx-auto px-6 max-w-6xl">
        <nav aria-label="Kruimelpad" className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          {' / '}
          <Link href="/ai-projectmanager" className="hover:text-orange-600">AI-projectmanager</Link>
          {' / '}
          <span className="text-slate-700">Templates</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
          {N} gratis templates voor <span className="text-gradient">AI-projecten.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-4 max-w-3xl leading-relaxed">
          Van kick-off tot overdracht: de documenten die ik zelf gebruik als AI-projectmanager. Geen verkooppraatje, maar invullen, bespreken met je opdrachtgever en beslissen.
        </p>
        <p className="text-slate-500 mb-12 max-w-3xl">
          Je krijgt de PDF direct op het scherm en per mail. Geen nieuwsbrief, geen vervolgmails. Lees ook de{' '}
          <Link href="/blog/gratis-templates-ai-project" className="text-orange-600 underline">uitleg in welke volgorde je ze gebruikt</Link>.
        </p>

        {/* Toolkit: alles in één */}
        <div id={AI_PM_TOOLKIT.id} className="mb-16 max-w-3xl">
          <DownloadCard d={AI_PM_TOOLKIT} highlight />
        </div>

        {downloadsByPhase().map(({ phase, items }, idx) => (
          <section key={phase} className="mb-16" aria-labelledby={`fase-${phase}`}>
            <div className="mb-6">
              <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-1">Fase {idx + 1}</p>
              <h2 id={`fase-${phase}`} className="text-2xl md:text-3xl font-bold text-slate-900">
                {PHASE_LABELS[phase].title}
              </h2>
              <p className="text-slate-600 mt-2 max-w-3xl">{PHASE_LABELS[phase].intro}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((d) => (
                <div key={d.id} id={d.id}>
                  <DownloadCard d={d} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Meer gratis hulpmiddelen</h2>
          <ul className="space-y-3 text-slate-600 leading-relaxed">
            <li><Link href="/ai-proof-checklist" className="text-orange-600 font-semibold underline">AI-Proof Checklist</Link>: 15 stappen om je organisatie klaar te maken voor AI.</li>
            <li><Link href="/ai-scan" className="text-orange-600 font-semibold underline">Gratis AI-scan</Link>: waar staat jouw organisatie nu?</li>
            <li><Link href="/impact-calculator" className="text-orange-600 font-semibold underline">Impact-calculator</Link>: wat kan AI in jouw team opleveren aan tijd?</li>
            <li><Link href="/ai-projectmanagement-begrippen" className="text-orange-600 font-semibold underline">Begrippenlijst</Link>: de woorden uit AI-projecten in gewone taal.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Veelgestelde vragen</h2>
          <dl className="space-y-5 max-w-3xl">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-slate-900">{f.q}</dt>
                <dd className="text-slate-600 mt-1 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-slate-500 mt-6 max-w-3xl">
            Dit zijn praktische hulpmiddelen, geen juridisch advies. Leg privacy- en AI-verordeningsvragen voor aan je functionaris gegevensbescherming of jurist.
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Liever dat iemand het met je invult?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Ik werk als <Link href="/ai-projectmanager" className="text-orange-600 underline">AI-projectmanager</Link> voor gemeenten, zorg en welzijn. Een eerste gesprek van 30 minuten is gratis.
          </p>
          <div className="flex justify-center">
            <BookingButton label="Plan een gesprek" location="ai_pm_templates" />
          </div>
        </section>
      </div>
    </main>
  );
}
