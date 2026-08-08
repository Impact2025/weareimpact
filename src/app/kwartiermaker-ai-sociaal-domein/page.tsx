'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Compass,
  Flag,
  Quote,
  Linkedin,
  ArrowUpRight,
  CheckCircle,
  Map,
  Users,
  Puzzle,
  Milestone,
  Plus,
  Minus,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  Backpack,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RelevantReading } from '@/components/seo/RelevantReading';

const situaties = [
  {
    icon: Layers,
    title: 'Fusie of reorganisatie',
    description:
      'Innovatie of AI krijgt een nieuwe plek in de organisatie, maar niemand weet nog hoe die plek eruitziet of wie erover gaat.',
  },
  {
    icon: Map,
    title: 'Strategie op papier, niet in de praktijk',
    description:
      'Er ligt een AI-visiedocument. Niemand durft de eerste stap te zetten omdat er geen concreet startpunt is aangewezen.',
  },
  {
    icon: Puzzle,
    title: 'Nieuwe dienst die bewezen moet worden',
    description:
      'Een idee dat kansrijk klinkt, maar eerst in het klein moet aantonen dat het werkt voordat je er structureel in investeert.',
  },
  {
    icon: Flag,
    title: 'Bestuur wil regie houden',
    description:
      'De bestuurstafel wil grip houden op de uitkomst, maar mist de trekker die tussen visie en werkvloer kan schakelen.',
  },
];

const fasen = [
  {
    number: '01',
    title: 'Verkenning: richting bepalen',
    description:
      'Ik breng de organisatie, de urgentie en de betrokken partijen in kaart. Waar zit de onduidelijkheid precies? Wat moet er in ieder geval uit dit traject komen? Dit levert geen dik rapport op, maar een heldere richting op één A4 — waar bestuur, team en betrokken partijen zich in herkennen.',
    resultaat: 'Een scherp geformuleerde opdracht, waar voorheen alleen een vaag gevoel van urgentie was.',
  },
  {
    number: '02',
    title: 'Kaders en draagvlak',
    description:
      'Met LEGO® Serious Play-sessies laat ik teams en bestuurders zelf de spelregels vaststellen voor de nieuwe werkwijze. Top-down opleggen werkt zelden in het sociaal domein — mensen die zelf mogen bouwen aan iets nieuws, dragen het ook. Zo ontstaan de kaders die een projectleider straks nodig heeft om uit te voeren.',
    resultaat: 'Kaders die het team zelf heeft vastgesteld — en dus ook zelf verdedigt.',
  },
  {
    number: '03',
    title: 'Bewijzen: een eerste werkend concept',
    description:
      'Geen blauwdruk op papier, maar een pilot die aantoont dat de aanpak werkt. Klein beginnen, op één afdeling of proces, met een meetbaar resultaat. Bijsturen waar nodig, voordat er structureel budget en mensen aan worden verbonden.',
    resultaat: 'Een bewezen aanpak in plaats van een aanname — met cijfers die het bestuur overtuigen.',
  },
  {
    number: '04',
    title: 'Overdracht',
    description:
      'Zodra het concept bewezen is, draag ik over aan een vast team of een projectleider die de uitvoering overneemt. Dat is het natuurlijke einde van een kwartiermakersopdracht: ik zorg dat mijn eigen rol overbodig wordt, en blijf niet langer dan nodig.',
    resultaat: 'Een team dat zelfstandig verder kan — zonder dat de kennis met mij vertrekt.',
  },
];

const faqs = [
  {
    question: 'Wat is het verschil tussen een kwartiermaker en een projectleider?',
    answer:
      'Bij een projectleider liggen doel, scope en kaders al vast — de opdracht is uitvoeren. Bij een kwartiermaker ligt dat nog open: je weet dat er iets moet veranderen, maar niet precies hoe het eruit gaat zien. Ik bepaal eerst de richting en de spelregels, en draag pas over aan uitvoering zodra er een bewezen aanpak staat. Huur je een projectleider in voor een opdracht zonder kader, dan ontstaat vaak wrijving: die vraagt om besluiten die er nog niet zijn.',
  },
  {
    question: 'Wanneer heb ik een kwartiermaker AI nodig in plaats van een AI-consultant?',
    answer:
      'Een AI-consultant adviseert en implementeert vaak binnen een bestaand proces. Een kwartiermaker AI zet iets nieuws neer: een AI-functie, -afdeling of -werkwijze die nog niet bestaat, bijvoorbeeld na een fusie of wanneer een AI-strategie van papier naar uitvoering moet. Ligt het kader al vast? Dan zoek je waarschijnlijk een AI-consultant of interim projectleider, geen kwartiermaker.',
  },
  {
    question: 'Hoe lang duurt een traject als kwartiermaker?',
    answer:
      'Doorgaans 3 tot 6 maanden: de tijd die nodig is om van een open opdracht naar een bewezen, overdraagbare aanpak te komen. Korter kan, maar dan is er meestal al meer duidelijkheid vooraf. Langer is meestal een teken dat de kwartiermakersfase is overgeslagen naar een uitvoeringsfase die eigenlijk aan een projectleider toebehoort.',
  },
  {
    question: 'Waarom is jouw kwartiermakerschap anders?',
    answer:
      'Ik combineer 25+ jaar directie-ervaring in het sociaal domein met hands-on AI-kennis — ik bouw zelf AI-toepassingen die live staan bij professionals. Ik lever geen adviesrapport, maar een bewezen aanpak. En ik werk met LEGO® Serious Play om draagvlak te organiseren dat van binnenuit komt, niet van bovenaf wordt opgelegd.',
  },
  {
    question: 'Wat gebeurt er als het kwartiermakerstraject is afgerond?',
    answer:
      'Ik draag over aan een vast team of een projectleider die de uitvoering overneemt, met een concreet overdrachtsdocument en — waar nodig — begeleiding in de eerste weken van die overgang. Mijn rol is per definitie tijdelijk: het doel is dat de organisatie zonder mij verder kan.',
  },
];

const stats = [
  { value: '25+', label: 'Jaar sectorervaring' },
  { value: '3-6', label: 'Maanden per traject' },
  { value: 'LSP', label: 'Certified facilitator' },
  { value: '16-24', label: 'Uur per week' },
];

const projects = [
  {
    id: 'iris',
    initials: 'IR',
    color: 'text-violet-600',
    accent: 'border-violet-400',
    name: 'Iris',
    tagline: 'AI-assistent voor welzijnsprofessionals',
    description:
      'Iris is mijn eigen AI-assistent, gebouwd voor professionals in het sociale domein. Een voorbeeld van hoe een kwartiermakerstraject eruit kan zien: van idee naar werkend concept, nu in gebruik bij professionals.',
    url: null,
  },
  {
    id: 'bijeen',
    initials: 'BN',
    color: 'text-amber-600',
    accent: 'border-amber-400',
    name: 'Bijeen.app',
    tagline: 'Evenementenbeheer voor de welzijnssector',
    description:
      'Bijeen helpt welzijnsorganisaties en gemeenten bijeenkomsten te organiseren, deelnemers te beheren en impact te meten. Zelf opgezet, bewezen en overgedragen.',
    url: 'https://bijeen.app',
  },
  {
    id: 'brickme',
    initials: 'BM',
    color: 'text-orange-600',
    accent: 'border-orange-400',
    name: 'Brickme.nl',
    tagline: 'Zelfontdekking via AI en LEGO® Serious Play',
    description:
      'Brickme combineert mijn achtergrond als LEGO® Serious Play facilitator met AI. Zelf de kaders bepaald, zelf gebouwd, zelf bewezen.',
    url: 'https://brickme.nl',
  },
];

function ProjectCards() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {projects.map((p) => {
        const isOpen = open === p.id;
        return (
          <div
            key={p.id}
            className={`rounded-2xl border border-l-4 ${p.accent} border-slate-100 transition-all duration-300 ${isOpen ? 'shadow-lg' : 'hover:shadow-md'}`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : p.id)}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm ${p.color} font-bold text-xs shrink-0`}>
                  {p.initials}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">{p.name}</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{p.tagline}</p>
                </div>
              </div>
              <div className={`shrink-0 w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center transition-colors ${isOpen ? 'bg-slate-900 border-slate-900 text-white' : 'text-slate-400'}`}>
                {isOpen ? <Minus size={13} /> : <Plus size={13} />}
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                <p className="text-slate-600 leading-relaxed text-sm mb-4">
                  {p.description}
                </p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ExternalLink size={13} />
                    {p.url.replace('https://', '')}
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function KwartiermakerAiSociaalDomein() {
  const openBookingChat = () => {
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  return (
    <>
      {/* HERO */}
      <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8 animate-fade-in-up hover:border-orange-200 transition-colors cursor-default">
            <span className="font-bold text-slate-900">Vincent van Munster</span>
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            <span className="text-slate-600 font-medium tracking-wide uppercase text-xs">
              Kwartiermaker Innovatie & AI
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Kwartiermaker AI <br className="hidden md:block" />
            <span className="text-gradient">sociaal domein.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Voor organisaties die een nieuwe AI-werkwijze moeten opzetten, maar nog geen blauwdruk hebben.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Van visie naar bewezen concept, in 3 tot 6 maanden — met overdracht aan jouw eigen team.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300 flex-wrap">
            <Button
              size="lg"
              onClick={openBookingChat}
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-xl shadow-orange-500/20 flex items-center gap-2"
            >
              Koffie met Vincent
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <Link href="#voor-wie" className="flex items-center gap-2">
                <Compass size={18} />
                Herken ik dit?
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <Link href="/kennisbank/kwartiermaker-ai-sociaal-domein-inhuren" className="flex items-center gap-2">
                Kwartiermaker vs. projectleider
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400">
          <ChevronDown size={24} />
        </div>
      </header>

      {/* HET PROBLEEM */}
      <section id="manifest" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Het probleem
              </div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                Een projectleider inhuren zonder kader is vragen om wrijving.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                &ldquo;We weten dat we iets met AI moeten, maar niemand weet nog hoe dat er bij ons uit gaat zien.&rdquo;
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Die zin hoor ik vaak bij organisaties die eerst een projectleider hadden ingehuurd — en er al snel achter kwamen dat een projectleider niet is wat ze nodig hadden. Een projectleider voert uit binnen een kader. Het probleem is: dat kader bestaat nog niet. Er is nog geen blauwdruk, geen vastgesteld doel, geen bewezen aanpak.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Dat is het moment waarop je een kwartiermaker nodig hebt.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Een kwartiermaker gaat de organisatie vooruit: hij of zij bepaalt de richting, organiseert draagvlak en bouwt een eerste werkend concept — vóórdat er een compleet team, budget of proces staat. Zodra dat kwartier gemaakt is, draag ik over. Dat is geen bijkomstigheid, maar het doel.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Mijn werk is klaar zodra de organisatie mij niet meer nodig heeft. Dat is geen verlies — dat is het doel van kwartiermaken.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Kwartiermaker versus projectleider.</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Het verschil dat de meeste organisaties zich niet op tijd stellen.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-orange-500 rounded-lg text-white"><Compass size={20} /></div>
                    <div>
                      <div className="font-bold">Kwartiermaker: kader ontwerpen</div>
                      <div className="text-xs text-slate-400">Richting, draagvlak en een bewezen aanpak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white"><Target size={20} /></div>
                    <div>
                      <div className="font-bold">Projectleider: uitvoeren binnen kader</div>
                      <div className="text-xs text-slate-400">Doel en scope liggen al vast</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-blue-500 rounded-lg text-white"><Milestone size={20} /></div>
                    <div>
                      <div className="font-bold">Overdracht is het eindpunt</div>
                      <div className="text-xs text-slate-400">Niet blijven hangen, maar overbodig worden</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VOOR WIE */}
      <section id="voor-wie" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Wanneer een kwartiermaker
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Herken jij een van deze situaties?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {situaties.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-start gap-5">
                <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  <item.icon size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-[0.925rem]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 mt-10 max-w-2xl mx-auto leading-relaxed">
            Ligt het kader bij jou al vast, en zoek je iemand die daarbinnen implementeert? Dan zoek je waarschijnlijk geen kwartiermaker, maar een{' '}
            <Link href="/ai-consultant-sociaal-domein" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              AI-consultant
            </Link>{' '}
            of{' '}
            <Link href="/interim-verandermanagement-ai-sociaal-domein" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              interim projectleider
            </Link>.
          </p>
        </div>
      </section>

      {/* FASEN */}
      <section id="fasen" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">Hoe ik werk</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Vier fasen, 3 tot 6 maanden</h2>
          </div>
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {fasen.map((fase) => (
              <div key={fase.number} className="group relative bg-slate-50 rounded-3xl p-10 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:bg-white">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <span className="absolute -bottom-4 right-6 text-9xl font-black text-white select-none leading-none transition-colors duration-500 group-hover:text-orange-50/80">{fase.number}</span>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest">{fase.number}</span>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{fase.title}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 text-[0.925rem] max-w-3xl">{fase.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700">
                    <CheckCircle size={15} className="text-orange-500 shrink-0" />
                    <span><span className="font-semibold">Resultaat:</span> {fase.resultaat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BACKPACKER VS VAKANTIEGANGER */}
      <section id="mandaatvacuum" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Het mandaatvacuüm
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
              De backpacker, niet de vakantieganger
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Zo omschrijft het kwartiermakersvak het verschil met een projectmanager — en het verklaart precies waarom kwartiermaken een ander vak is.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <Briefcase size={20} className="text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">De vakantieganger — projectmanager</h3>
              <p className="text-slate-600 leading-relaxed text-[0.925rem]">
                Alles is geboekt: budget, personeel, systemen. De route ligt vast. Sturen betekent het schema bewaken en risico&apos;s beheersen binnen een kader dat al bestaat.
              </p>
            </div>
            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800">
              <div className="w-11 h-11 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-5">
                <Backpack size={20} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">De backpacker — kwartiermaker</h3>
              <p className="text-slate-300 leading-relaxed text-[0.925rem]">
                Geen all-inclusive mandaat. De route wordt uitgestippeld terwijl hij bewandeld wordt. Het instrument is niet macht, maar relatie en vertrouwen.
              </p>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-start gap-4 max-w-3xl mx-auto">
            <AlertTriangle size={22} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed text-[0.925rem]">
              <span className="font-bold">De valkuil: de Hiërarchische Reflex.</span> Zodra een kwartiermaker in dat mandaatvacuüm alsnog top-down besluiten probeert af te dwingen, conformeren partners zich uiterlijk maar haken ze innerlijk af. Het traject sterft dan een stille dood — pas maanden later zichtbaar. Daarom stuur ik op vertrouwen, niet op hiërarchie die er nog niet is.
            </p>
          </div>
          <p className="text-center mt-8">
            <Link href="/kennisbank/kwartiermaker-regionaal-werkcentrum-wet-suwi" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              Lees de uitwerking: kwartiermaken in een mandaatvacuüm
            </Link>
          </p>
        </div>
      </section>

      {/* WAAROM SECTORKENNIS */}
      <section id="waarom-kwartiermaker" className="py-24 bg-[#FDFBF7] border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Waarom sectorkennis telt
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Wat is een kwartiermaker voor het sociaal domein?
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-5">
            <p>
              Kwartiermaken in het sociaal domein is anders dan in het bedrijfsleven. Je werkt met gevoelige cliëntdata, beperkte budgetten, vrijwilligers naast professionals, en een cultuur waarin de menselijke maat zwaarder weegt dan efficiëntie. Een kwartiermaker die dat niet kent, ontwerpt kaders die op papier kloppen maar in de praktijk niet landen.
            </p>
            <p>
              Ik heb 25+ jaar directie-ervaring in het sociaal domein — onder meer bij Stichting de Baan — en weet daardoor niet alleen hóe je een nieuwe AI-werkwijze opzet, maar ook wélke weerstand je onderweg tegenkomt en hoe je die met het team zelf oplost, in plaats van eromheen te werken.
            </p>
            <p>
              Zoek je een kwartiermaker AI voor het sociaal domein die verder kijkt dan een adviesrapport? Dan begint het met een gesprek over waar bij jou de kaders nog ontbreken.
            </p>
          </div>
        </div>
      </section>

      {/* OVER VINCENT */}
      <section id="over" className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <Link href="/vincent-van-munster" className="relative mb-8 block">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b] hover:ring-orange-500/60 transition-all duration-200">
                <Image src="/vincent-van-munster.webp" alt="Vincent van Munster — Kwartiermaker Innovatie & AI" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </Link>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik ben Vincent van Munster. Sociaal ondernemer, kwartiermaker innovatie & AI en gecertificeerd{' '}
              <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator.
            </p>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik werk al meer dan 25 jaar in het sociale domein — als directeur, als bouwer, als sociaal ondernemer. Ik ken organisaties van binnenuit. Ik heb gezien waar het misgaat: op de werkvloer, in bestuurskamers en in de kloof tussen ambitie en dagelijkse praktijk.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Als kwartiermaker bouw ik zelf mee: mijn AI-assistent Iris begon als kwartiermakersproject en draait nu bij professionals in het sociaal domein. Ik lever geen blauwdruk op papier, maar een bewezen aanpak — en ik blijf niet langer dan nodig.
            </p>
            <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300 mb-10 max-w-2xl text-left">
              &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik ben iemand die begrijpt waar jij voor staat, en die naast je staat totdat het werkt.&rdquo;
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="p-5 bg-slate-800 rounded-2xl">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://www.linkedin.com/in/vincentvanmunster" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full transition-colors duration-200">
                <Linkedin size={15} />
                Verbind op LinkedIn
                <ArrowUpRight size={13} className="opacity-60" />
              </a>
              <Link href="/vincent-van-munster" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-full transition-colors duration-200">
                Profiel Vincent van Munster
                <ArrowUpRight size={13} className="opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* IN DE PRAKTIJK */}
      <section id="praktijk" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Portfolio</div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">In de praktijk</h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
            Elk platform hieronder begon als kwartiermakersproject: geen bestaand kader, wel een idee. Zelf verkend, zelf bewezen, zelf overgedragen aan gebruik.
          </p>
          <ProjectCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van organisaties die twijfelen tussen een kwartiermaker en een projectleider.</p>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="bg-white border border-slate-200 rounded-lg px-6 overflow-hidden">
                <AccordionTrigger className="text-left hover:no-underline py-5 text-slate-900 font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Samenwerken</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
              Nog geen blauwdruk? <br />
              <span className="text-orange-600">Dat is precies mijn werk.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Je zoekt geen consultant die een rapport schrijft en vertrekt. Je zoekt iemand die de kaders zet, het bewijst, en overdraagt zodra jouw team het zelf kan voortzetten.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button size="lg" onClick={openBookingChat} className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
                Drink koffie met Vincent
                <ArrowRight size={18} />
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="/ai-consultant-sociaal-domein" className="flex items-center gap-2">
                  <Users size={18} />
                  Kader ligt al vast? AI-consultant
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="/impact-calculator" className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Bereken mijn impact
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <RelevantReading
        items={[
          {
            title: 'Kwartiermaker AI in het sociaal domein inhuren',
            href: '/kennisbank/kwartiermaker-ai-sociaal-domein-inhuren',
            description: 'Wat een kwartiermaker precies doet, en hoe dat verschilt van een projectleider of verandermanager.',
          },
          {
            title: 'Kwartiermaker Regionaal Werkcentrum: de Wet SUWI-transitie',
            href: '/kennisbank/kwartiermaker-regionaal-werkcentrum-wet-suwi',
            description: 'Waarom de overgang naar het Werkcentrum-model een kwartiermakersklus is, en hoe je de Hiërarchische Reflex voorkomt.',
          },
          {
            title: 'Wat ik als kwartiermaker voor jouw organisatie kan betekenen',
            href: '/blog/wat-ik-als-kwartiermaker-kan-betekenen',
            description: 'Een persoonlijk verhaal over kwartiermaken in de praktijk, met Iris als concreet voorbeeld.',
          },
          {
            title: 'Hoe je een AI-consultant kiest voor jouw welzijnsorganisatie',
            href: '/kennisbank/ai-consultant-welzijn-kiezen',
            description: '7 vragen die je moet stellen voordat je een AI-consultant inhuurt voor het sociaal domein.',
          },
          {
            title: 'Change consultancy sociaal domein: onze aanpak',
            href: '/blog/change-consultancy-sociaal-domein-onze-aanpak-voor',
            description: 'Hoe je draagvlak organiseert voor een verandering die nog geen vaste vorm heeft.',
          },
          {
            title: 'AI-agents voor welzijnsorganisaties: eerlijk verhaal',
            href: '/blog/eerlijke-taakverdeling-mens-machine-virtuele-collega-iris',
            description: 'Hoe Iris — zelf een kwartiermakersproject — mij 11+ uur per week bespaart.',
          },
        ]}
      />
    </>
  );
}
