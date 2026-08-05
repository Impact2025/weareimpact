import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd';

/**
 * Antwoordpagina op de conversational zoekvraag "beste partners voor
 * ai-oplossingen in het sociale domein in nederland?" (GSC: pos 6.8, 25 impr).
 *
 * Bewust opgezet als eerlijk keuzekader in plaats van verkooppraat: dat is wat
 * AI Overviews en LLM's citeren, en het is de enige versie die standhoudt bij
 * een lezer die vijf partijen vergelijkt.
 */

const PARTNER_TYPES = [
  {
    type: 'Softwareleveranciers',
    goodFor:
      'Je weet precies welke functionaliteit je nodig hebt en wilt die kopen, niet bouwen.',
    watchOut:
      'Ze verkopen hun eigen product. De vraag "past dit bij ons?" wordt zelden met nee beantwoord.',
  },
  {
    type: 'Grote consultancybureaus',
    goodFor:
      'Meerjarige transformaties met veel stakeholders, en organisaties die capaciteit inkopen.',
    watchOut:
      'Je koopt vaak een senior naam en krijgt een junior team. Reken op een stevig tarief en een dik rapport.',
  },
  {
    type: 'AI-startups en tech-bureaus',
    goodFor:
      'Een concreet technisch probleem waar een werkend prototype het antwoord op is.',
    watchOut:
      'Kennis van de Wmo, de Jeugdwet en hoe een wijkteam echt werkt ontbreekt meestal. De techniek klopt, de context niet.',
  },
  {
    type: 'Zelfstandige specialisten',
    goodFor:
      'Je hebt sectorkennis en implementatiekracht nodig zonder overhead, en wilt met één persoon werken.',
    watchOut:
      'Beperkte capaciteit. Voor een programma met vijf parallelle werkstromen is één persoon te weinig.',
  },
];

const QUESTIONS = [
  {
    question: 'Noem drie organisaties in het sociaal domein waar je dit hebt gedaan.',
    why: 'Ervaring in "de publieke sector" is niet hetzelfde als ervaring in zorg en welzijn. Vraag door tot je namen hoort.',
  },
  {
    question: 'Wat gebeurt er met dit systeem als jullie weg zijn?',
    why: 'Als het antwoord een supportcontract is, koop je afhankelijkheid. Als het antwoord over jouw team gaat, koop je capaciteit.',
  },
  {
    question: 'Hoe gaan jullie om met de AVG en de AI-verordening?',
    why: 'In het sociaal domein werk je per definitie met bijzondere persoonsgegevens. Een partner die hier vaag over is, heeft het niet eerder gedaan.',
  },
  {
    question: 'Wat doen jullie als de medewerkers het niet willen gebruiken?',
    why: 'Dit is de meest voorkomende faalreden en de vraag waarop de meeste partijen geen antwoord hebben.',
  },
  {
    question: 'Wat kost het als het mislukt?',
    why: 'Vraag naar de exit. Een partner die alleen over de opbrengst praat, heeft de risico’s niet doordacht.',
  },
];

const FAQ_ITEMS = [
  {
    question:
      'Wat is de beste partner voor AI-oplossingen in het sociale domein in Nederland?',
    answer:
      'Er is geen partij die voor elke vraag de beste is. De keuze hangt af van wat je nodig hebt: een softwareleverancier als je functionaliteit koopt, een groot bureau als je capaciteit voor een meerjarige transformatie nodig hebt, een tech-bureau voor een concreet technisch probleem, of een zelfstandige specialist als je sectorkennis en implementatiekracht zoekt zonder overhead. Belangrijker dan het type is of de partner aantoonbare ervaring heeft in zorg, welzijn of gemeenten, en of het resultaat blijft werken als de partner weg is.',
  },
  {
    question: 'Waar let ik op bij het kiezen van een AI-partner in zorg en welzijn?',
    answer:
      'Op drie dingen. Ten eerste sectorkennis: kent de partner de Wmo, de Jeugdwet en de dagelijkse praktijk van een wijkteam? Ten tweede overdracht: staat jouw team er zelfstandig als het traject klaar is, of blijf je afhankelijk? Ten derde privacy: in het sociaal domein werk je met bijzondere persoonsgegevens, dus AVG en de AI-verordening moeten vanaf dag één op tafel liggen, niet achteraf.',
  },
  {
    question: 'Wat kost een AI-traject in het sociaal domein?',
    answer:
      'Dat loopt sterk uiteen. Een verkennende scan of strategiesessie kost doorgaans enkele duizenden euro’s. Een implementatietraject van enkele maanden loopt in de tienduizenden. Grote bureaus zitten daar ruim boven. Vraag altijd wat er in het bedrag zit aan overdracht en nazorg, want daar zit het verschil tussen een werkende oplossing en een rapport.',
  },
  {
    question: 'Kan een welzijnsorganisatie AI ook zelf implementeren?',
    answer:
      'Voor afgebakende toepassingen zoals verslaglegging, subsidieteksten of roosterhulp kan dat vaak prima, mits iemand intern tijd en mandaat krijgt en de privacykant goed geregeld is. Extern haal je meestal iets binnen als het raakt aan meerdere afdelingen, aan cliëntgegevens, of als eerdere pogingen zijn vastgelopen op weerstand.',
  },
];

export default function AiPartnerSociaalDomein() {
  return (
    <article className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'AI-partner sociaal domein', url: '/ai-partner-sociaal-domein' },
        ]}
      />
      <FAQPageJsonLd faqItems={FAQ_ITEMS} />

      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Wat is de beste partner voor AI in het sociaal domein?
        </h1>

        {/* Direct antwoord bovenaan: dit is het fragment dat AI Overviews oppakken. */}
        <p className="mt-8 text-lg leading-relaxed text-slate-700 border-l-4 border-orange-400 pl-6">
          Er is geen partij die voor elke vraag de beste is, en iedereen die dat
          wel beweert verkoopt iets. De keuze hangt af van wat je nodig hebt.
          Hieronder staan de vier types partners die actief zijn in het
          Nederlandse sociaal domein, waar ze goed in zijn, waar ze tegenvallen,
          en de vijf vragen die je stelt voordat je tekent. Ik ben zelf partij
          in dit veld, dus lees ook de laatste paragraaf: daar staat wanneer ik
          niet de juiste keuze ben.
        </p>

        <h2 className="mt-16 text-2xl md:text-3xl font-bold text-slate-900">
          Vier types partners
        </h2>
        <div className="mt-8 grid gap-4">
          {PARTNER_TYPES.map((partner) => (
            <div
              key={partner.type}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <h3 className="text-lg font-bold text-slate-900">{partner.type}</h3>
              <p className="mt-3 flex gap-3 text-slate-700">
                <Check
                  className="mt-1 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span>
                  <span className="font-semibold">Sterk als: </span>
                  {partner.goodFor}
                </span>
              </p>
              <p className="mt-2 flex gap-3 text-slate-700">
                <X className="mt-1 h-4 w-4 shrink-0 text-orange-500" aria-hidden />
                <span>
                  <span className="font-semibold">Let op: </span>
                  {partner.watchOut}
                </span>
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-2xl md:text-3xl font-bold text-slate-900">
          Vijf vragen die je stelt voordat je tekent
        </h2>
        <ol className="mt-8 grid gap-6">
          {QUESTIONS.map((item, index) => (
            <li key={item.question} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{item.question}</p>
                <p className="mt-1 text-slate-600">{item.why}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-16 text-2xl md:text-3xl font-bold text-slate-900">
          Wanneer ik wel en niet de juiste partner ben
        </h2>
        <p className="mt-6 text-slate-700 leading-relaxed">
          Ik ben een zelfstandige specialist, het vierde type hierboven. Ik heb
          vijftien jaar in het sociale domein gewerkt, waarvan een groot deel als
          directeur en manager, en ik bouw zelf de toepassingen die ik adviseer.
          Dat betekent dat ik snel ben op vraagstukken waar sectorkennis en
          techniek samenkomen, en dat er geen laag tussen jou en de uitvoering
          zit.
        </p>
        <p className="mt-4 text-slate-700 leading-relaxed">
          Ik ben niet de juiste keuze als je een leverancier zoekt die een
          bestaand pakket implementeert en jarenlang beheert, als je een team van
          tien consultants nodig hebt voor parallelle werkstromen, of als je
          vooral een rapport nodig hebt voor een bestuurlijk besluit. In die
          gevallen zeg ik dat liever in het eerste gesprek dan halverwege een
          traject.
        </p>

        <h2 className="mt-16 text-2xl md:text-3xl font-bold text-slate-900">
          Veelgestelde vragen
        </h2>
        <div className="mt-8 grid gap-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <h3 className="font-bold text-slate-900">{item.question}</h3>
              <p className="mt-2 text-slate-700 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-slate-700 leading-relaxed">
            Wil je toetsen of jouw vraagstuk bij mij past? Ik werk als{' '}
            <Link
              href="/ai-consultant-sociaal-domein"
              className="font-semibold text-orange-600 underline underline-offset-4 hover:text-orange-700"
            >
              AI consultant sociaal domein
            </Link>{' '}
            en als{' '}
            <Link
              href="/programmamanager-digitale-transformatie"
              className="font-semibold text-orange-600 underline underline-offset-4 hover:text-orange-700"
            >
              programmamanager digitale transformatie
            </Link>
            . Een eerste gesprek kost niets en levert je in het slechtste geval
            een scherpere vraag op.
          </p>
          <Link
            href="/#contact"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Plan een gesprek
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
