import type { Metadata } from 'next';
import Link from 'next/link';
import { AI_PM_DOWNLOADS, BASE_URL } from '@/lib/ai-pm-downloads';
import { DownloadCard } from '@/components/landing/DownloadCard';
import { BookingButton } from '@/components/landing/BookingButton';

const URL = `${BASE_URL}/ai-projectmanager-templates`;

export const metadata: Metadata = {
  title: 'Gratis templates voor AI-projecten: checklist, projectplan, risicomatrix',
  description:
    'Gratis downloads voor AI-projecten: een go/no-go-checklist, een AI-projectplan op één pagina en een risicomatrix. Direct bruikbaar in zorg, welzijn en gemeenten.',
  keywords: [
    'AI projectplan template',
    'go no go checklist AI',
    'risicomatrix AI project',
    'AI project template download',
    'AI-projectmanager templates',
    'WeAreImpact',
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: URL,
    siteName: 'WeAreImpact',
    title: 'Gratis templates voor AI-projecten | WeAreImpact',
    description: 'Go/no-go-checklist, AI-projectplan en risicomatrix. Gratis te downloaden.',
  },
};

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Gratis templates voor AI-projecten',
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

export default function TemplatesPage() {
  return (
    <main className="pt-32 pb-24 bg-[#FDFBF7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="container mx-auto px-6 max-w-5xl">
        <nav aria-label="Kruimelpad" className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          {' / '}
          <Link href="/ai-projectmanager" className="hover:text-orange-600">AI-projectmanager</Link>
          {' / '}
          <span className="text-slate-700">Templates</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
          Gratis templates voor <span className="text-gradient">AI-projecten.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-4 max-w-3xl leading-relaxed">
          Drie documenten die ik zelf gebruik als AI-projectmanager. Geen verkooppraatje: invullen, bespreken met je opdrachtgever en beslissen.
        </p>
        <p className="text-slate-500 mb-12 max-w-3xl">
          Je krijgt de PDF direct op het scherm en per mail. Geen nieuwsbrief, geen vervolgmails.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {AI_PM_DOWNLOADS.map((d) => (
            <div key={d.id} id={d.id}>
              <DownloadCard d={d} />
            </div>
          ))}
        </div>

        <section className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Zo gebruik je ze samen</h2>
          <ol className="space-y-3 text-slate-600 leading-relaxed list-decimal pl-5">
            <li><strong className="text-slate-900">Projectplan</strong> invullen voor de start. Het dwingt tot een nulmeting, een succescriterium en een eigenaar.</li>
            <li><strong className="text-slate-900">Risicomatrix</strong> doornemen met de projectgroep en elke twee weken bijhouden.</li>
            <li><strong className="text-slate-900">Go/no-go-checklist</strong> invullen vóór de pilot en opnieuw erna. Zo is stoppen een besluit, geen mislukking.</li>
          </ol>
          <p className="text-sm text-slate-500 mt-6">
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
