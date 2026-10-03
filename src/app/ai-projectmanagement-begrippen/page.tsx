import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/ai-pm-pages';

const URL = `${BASE_URL}/ai-projectmanagement-begrippen`;

export const metadata: Metadata = {
  title: 'AI-projectmanagement begrippen: uitleg voor opdrachtgevers',
  description:
    'Begrippenlijst voor opdrachtgevers van AI-projecten: pilot, proof of concept, go/no-go, human-in-the-loop, DPIA, hallucinatie, AI-geletterdheid en meer, in gewone taal uitgelegd.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: URL,
    siteName: 'WeAreImpact',
    title: 'AI-projectmanagement begrippen | WeAreImpact',
    description: 'De belangrijkste begrippen uit AI-projecten, in gewone taal.',
  },
};

const TERMS: { term: string; definition: string }[] = [
  { term: 'AI-projectmanager', definition: 'Projectmanager die een AI-traject leidt van probleem tot productie en daarbij techniek, mensen, privacy en budget verbindt.' },
  { term: 'Pilot', definition: 'Een kleine, tijdelijke toepassing van AI op één proces, met een meetbaar doel, bedoeld om te leren voordat je opschaalt.' },
  { term: 'Proof of concept', definition: 'Een eerste werkend voorbeeld dat laat zien dat iets technisch kan. Zegt nog niets over of het in jouw organisatie werkt; dat toetst een pilot.' },
  { term: 'Productie', definition: 'De situatie waarin een toepassing dagelijks door echte gebruikers wordt gebruikt, met beheer, monitoring en scholing.' },
  { term: 'Go/no-go-besluit', definition: 'Het vooraf vastgelegde moment waarop wordt besloten: doorgaan, bijsturen of stoppen, op basis van afgesproken criteria.' },
  { term: 'Nulmeting', definition: 'De meting van hoeveel tijd, geld of fouten een proces kost vóór AI wordt ingezet. Zonder nulmeting kun je het effect niet aantonen.' },
  { term: 'Human-in-the-loop', definition: 'Werkwijze waarin een mens elke AI-uitkomst beoordeelt of goedkeurt voordat die wordt gebruikt.' },
  { term: 'Hallucinatie', definition: 'Wanneer een taalmodel iets overtuigend formuleert dat niet klopt, zoals een verzonnen bron of cijfer. Reden voor menselijke controle.' },
  { term: 'Prompt', definition: 'De opdracht of vraag die je aan een AI-model geeft. De kwaliteit van de prompt bepaalt mede de kwaliteit van de uitkomst.' },
  { term: 'AI-agent', definition: 'Een AI-systeem dat niet alleen antwoordt maar ook stappen uitvoert, zoals zoeken, data ophalen of een taak voorbereiden, vaak met meerdere tools.' },
  { term: 'AVG', definition: 'Algemene verordening gegevensbescherming: het Europese kader voor het verwerken van persoonsgegevens, ook van toepassing op AI.' },
  { term: 'Verwerkersovereenkomst', definition: 'Contract waarin een leverancier die namens jou persoonsgegevens verwerkt afspraken vastlegt over beveiliging en gebruik.' },
  { term: 'DPIA', definition: 'Gegevensbeschermingseffectbeoordeling: een onderzoek naar privacyrisico\'s, verplicht bij verwerking met een hoog risico.' },
  { term: 'AI-verordening (AI Act)', definition: 'Europese wet die AI-systemen indeelt naar risico en eisen stelt. Werkt gefaseerd; onder meer AI-geletterdheid van medewerkers is al verplicht.' },
  { term: 'AI-geletterdheid', definition: 'Voldoende kennis en vaardigheid bij medewerkers om verantwoord met AI te werken, een verplichting onder de AI-verordening.' },
  { term: 'Algoritmeregister', definition: 'Openbaar register waarin overheidsorganisaties impactvolle algoritmen en hoogrisico-AI vermelden.' },
  { term: 'Datakwaliteit', definition: 'In hoeverre je gegevens volledig, actueel en betrouwbaar zijn. AI kan slechte data niet repareren.' },
  { term: 'Leverancierslock-in', definition: 'Afhankelijkheid van één leverancier doordat overstappen te duur of te lastig is. Voorkom je met afspraken over overdraagbaarheid.' },
  { term: 'Overdrachtsplan', definition: 'Afspraak vanaf de start over wie het resultaat overneemt, zodat kennis niet vertrekt met de externe projectmanager.' },
  { term: 'Adoptie', definition: 'De mate waarin medewerkers een nieuwe toepassing daadwerkelijk gebruiken. Vaak de bepalende factor voor succes.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'AI-projectmanagement begrippen',
  url: URL,
  hasDefinedTerm: TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.term,
    description: t.definition,
    inDefinedTermSet: URL,
  })),
};

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'AI-projectmanager', item: `${BASE_URL}/ai-projectmanager` },
    { '@type': 'ListItem', position: 3, name: 'Begrippen', item: URL },
  ],
};

export default function BegrippenPage() {
  return (
    <main className="pt-32 pb-24 bg-[#FDFBF7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="container mx-auto px-6 max-w-3xl">
        <nav aria-label="Kruimelpad" className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          {' / '}
          <Link href="/ai-projectmanager" className="hover:text-orange-600">AI-projectmanager</Link>
          {' / '}
          <span className="text-slate-700">Begrippen</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">AI-projectmanagement begrippen in gewone taal</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-12">
          De woorden die je tegenkomt als je een AI-project laat leiden, zonder jargon uitgelegd. Heb je een begrip dat hier ontbreekt of wil je weten wat het voor jouw organisatie betekent? <Link href="/contact" className="text-orange-600 underline">Stuur me een bericht</Link>.
        </p>
        <dl className="space-y-6">
          {TERMS.map((t) => (
            <div key={t.term} id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="bg-white rounded-2xl p-6 border border-slate-100">
              <dt className="text-lg font-bold text-slate-900 mb-2">{t.term}</dt>
              <dd className="text-slate-600 leading-relaxed">{t.definition}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-12 text-slate-600">
          Meer weten over de rol zelf? Lees <Link href="/ai-projectmanager" className="text-orange-600 underline">wat een AI-projectmanager doet</Link> of <Link href="/kennisbank/wat-doet-een-ai-projectmanager" className="text-orange-600 underline">het uitgebreide artikel</Link>.
        </p>
      </div>
    </main>
  );
}
