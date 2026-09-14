'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  Quote,
  Linkedin,
  ArrowUpRight,
  CheckCircle,
  Users,
  BarChart3,
  Layers,
  GitBranch,
  Gauge,
  Sprout,
  Compass,
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
    title: 'Versnipperde initiatieven',
    description:
      'Er lopen meerdere AI- en innovatiepilots naast elkaar, zonder dat iemand ze naast elkaar legt, prioriteert of durft te stoppen.',
  },
  {
    icon: GitBranch,
    title: 'Pilots die niet opschalen',
    description:
      'Een proef werkt op één afdeling, maar niemand pakt de regie om het structureel uit te rollen naar de rest van de organisatie.',
  },
  {
    icon: Gauge,
    title: 'Geen zicht op resultaat',
    description:
      'De directie weet niet meer wat elk initiatief kost, oplevert of wanneer het klaar is. Innovatie wordt een grijs vlak op de begroting.',
  },
  {
    icon: Sprout,
    title: 'Behoefte aan een vaste innovatiefunctie',
    description:
      'De organisatie wil structureel blijven vernieuwen, maar heeft nog geen rol of team dat dit als kerntaak heeft.',
  },
];

const aanpak = [
  {
    number: '01',
    title: 'Portfolio in kaart',
    description:
      'Ik inventariseer alle lopende en voorgestelde innovatie- en AI-initiatieven: wat kost het, wat levert het op, wie is eigenaar. Vaak is dit de eerste keer dat een organisatie het complete overzicht ziet.',
    resultaat: 'Eén overzicht van de volledige innovatieportfolio, inclusief kosten en verwachte opbrengst.',
  },
  {
    number: '02',
    title: 'Prioriteren en stoppen',
    description:
      'Niet elk initiatief verdient budget. Samen met directie en teams bepaal ik wat doorgaat, wat wordt bijgesteld en wat wordt gestopt — met heldere criteria, niet op basis van wie het hardst roept.',
    resultaat: 'Een portfolio met minder, maar sterkere initiatieven en draagvlak voor de keuzes.',
  },
  {
    number: '03',
    title: 'Opschalen wat werkt',
    description:
      'Bewezen pilots krijgen een concreet uitrolplan: budget, capaciteit, planning. Ik stuur de uitvoering aan en zorg dat opschaling niet vastloopt op dezelfde weerstand als de pilotfase.',
    resultaat: 'Initiatieven die daadwerkelijk organisatiebreed landen, in plaats van eeuwige pilot blijven.',
  },
  {
    number: '04',
    title: 'Overdracht naar een vaste rol',
    description:
      'Ik richt het ritme, de rapportagelijnen en de besluitvorming zo in dat een vaste innovatiemanager of -team het kan overnemen. Met een overdrachtsdocument en een lopende portfolio die op orde is.',
    resultaat: 'Een innovatiefunctie die blijft bestaan nadat mijn opdracht is afgerond.',
  },
];

const faqs = [
  {
    question: 'Wat doet een interim innovatiemanager?',
    answer:
      'Een interim innovatiemanager bouwt en beheert de innovatie- en AI-portfolio van een organisatie: welke initiatieven lopen er, wat leveren ze op, wat stopt en wat schaalt door. Dat is een doorlopende managementfunctie, geen eenmalig project.',
  },
  {
    question: 'Wat is het verschil tussen een interim innovatiemanager en een kwartiermaker?',
    answer:
      'Een kwartiermaker zet één nieuwe werkwijze of functie neer en draagt over zodra die bewezen is — een eindig traject. Een interim innovatiemanager beheert een lopende portfolio van meerdere initiatieven tegelijk, met budget- en prioriteringsbeslissingen, voor de duur van de opdracht.',
  },
  {
    question: 'Wanneer heb ik een interim innovatiemanager nodig?',
    answer:
      'Wanneer er meerdere innovatie- of AI-initiatieven naast elkaar lopen zonder duidelijke regie, wanneer pilots blijven hangen zonder dat ze opschalen, of wanneer een organisatie structureel behoefte heeft aan iemand die de innovatieagenda bewaakt naast de dagelijkse bedrijfsvoering.',
  },
  {
    question: 'Hoe lang duurt een opdracht als interim innovatiemanager?',
    answer:
      'Doorgaans 6 tot 12 maanden, met een tussentijdse evaluatie na het eerste kwartaal. Lang genoeg om een portfolio echt te laten renderen, kort genoeg om gericht te blijven op overdracht aan een vaste rol.',
  },
  {
    question: 'Wat kost een interim innovatiemanager?',
    answer:
      'Mijn tarief is €125-€140 per uur, voor maximaal 16-24 uur per week. Een eerste verkennend gesprek is altijd gratis en vrijblijvend.',
  },
];

const stats = [
  { value: '25+', label: 'Jaar sectorervaring' },
  { value: '4+', label: 'Live AI-platforms gebouwd' },
  { value: '6-12', label: 'Maanden per opdracht' },
  { value: '16-24', label: 'Uur per week' },
];

export default function InterimInnovatiemanager() {
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
              Interim Directeur &amp; Kwartiermaker Sociaal Domein
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Interim <br className="hidden md:block" />
            <span className="text-gradient">innovatiemanager.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Voor organisaties met meerdere innovatie- en AI-initiatieven die om regie vragen.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Geen losse pilot, maar een portfolio die geprioriteerd, opgeschaald en overgedragen wordt.
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
              <Link href="/kwartiermaker-ai-sociaal-domein" className="flex items-center gap-2">
                Kwartiermaker vs. innovatiemanager
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
                Vijf losse pilots zijn geen innovatiestrategie.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                &ldquo;We doen van alles met AI, maar niemand heeft er overzicht op.&rdquo;
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Dat hoor ik bij organisaties die, vaak met de beste bedoelingen, meerdere innovatie- of AI-initiatieven tegelijk zijn gestart. Een pilot hier, een proef daar. Zonder iemand die ze naast elkaar legt, ontstaat er geen portfolio maar een verzameling losse experimenten — met een onduidelijk totaalbudget en resultaten die niemand meer kan navertellen.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Dat is het moment waarop je een interim innovatiemanager nodig hebt.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Iemand die de volledige portfolio beheert: prioriteren, opschalen wat werkt, stoppen wat niet werkt, en verantwoording afleggen aan de directie. Geen eenmalig project, maar een doorlopende functie — voor de duur van de opdracht.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Innovatie zonder regie is een verzameling losse experimenten. Mijn werk is er één portfolio van maken — met keuzes die ergens toe leiden.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Innovatiemanager versus kwartiermaker.</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Het verschil tussen één traject en een doorlopende functie.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-orange-500 rounded-lg text-white"><Layers size={20} /></div>
                    <div>
                      <div className="font-bold">Innovatiemanager: portfolio beheren</div>
                      <div className="text-xs text-slate-400">Meerdere initiatieven, doorlopend geprioriteerd</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white"><Compass size={20} /></div>
                    <div>
                      <div className="font-bold">Kwartiermaker: één functie opzetten</div>
                      <div className="text-xs text-slate-400">Eindig traject, eindigt bij overdracht</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-blue-500 rounded-lg text-white"><Gauge size={20} /></div>
                    <div>
                      <div className="font-bold">Budget- en prioriteringsmandaat</div>
                      <div className="text-xs text-slate-400">Keuzes over wat doorgaat en wat stopt</div>
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
              Wanneer een interim innovatiemanager
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
            Heb je nog geen enkel initiatief lopen en moet er eerst één nieuwe werkwijze van de grond komen? Dan zoek je waarschijnlijk geen innovatiemanager, maar een{' '}
            <Link href="/kwartiermaker-ai-sociaal-domein" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              kwartiermaker
            </Link>{' '}
            of{' '}
            <Link href="/interim-manager" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              interim manager
            </Link>.
          </p>
        </div>
      </section>

      {/* AANPAK */}
      <section id="aanpak" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">Hoe ik werk</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Van losse pilots naar portfolio</h2>
          </div>
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {aanpak.map((fase) => (
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

      {/* OVER VINCENT */}
      <section id="over" className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <Link href="/vincent-van-munster" className="relative mb-8 block">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b] hover:ring-orange-500/60 transition-all duration-200">
                <Image src="/vincent-van-munster.webp" alt="Vincent van Munster — Interim Innovatiemanager" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </Link>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik ben Vincent van Munster. 25+ jaar directie-ervaring in het sociaal domein, en zelf bouwer van meerdere AI-platforms die nu live staan bij professionals in de sector.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Als innovatiemanager weet ik uit ervaring welke pilots kansrijk zijn en welke nooit gaan opschalen — omdat ik ze zelf heb gebouwd, getest en soms weer stopgezet. Ik lever geen adviesrapport over jullie portfolio, maar stuur die daadwerkelijk aan.
            </p>
            <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300 mb-10 max-w-2xl text-left">
              &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik stap aan boord, pak het stuur over en zorg dat het ook echt werkt.&rdquo;
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

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van organisaties die twijfelen tussen een innovatiemanager en een kwartiermaker.</p>
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
              Innovatie zonder regie? <br />
              <span className="text-orange-600">Dat los ik op.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Je zoekt geen consultant die één pilot begeleidt. Je zoekt iemand die de hele portfolio overziet, keuzes maakt en verantwoording aflegt totdat er een vaste rol staat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button size="lg" onClick={openBookingChat} className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
                Drink koffie met Vincent
                <ArrowRight size={18} />
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="/interim-manager" className="flex items-center gap-2">
                  <Users size={18} />
                  Gat in de directie? Interim manager
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
            description: 'Wat een kwartiermaker precies doet, en hoe dat verschilt van een innovatiemanager of projectleider.',
          },
          {
            title: 'Interim verandermanagement AI sociaal domein',
            href: '/interim-verandermanagement-ai-sociaal-domein',
            description: 'Begeleiding bij AI-adoptie en innovatietrajecten in welzijnsorganisaties, zorg en gemeenten.',
          },
          {
            title: 'AI-agents voor welzijnsorganisaties: eerlijk verhaal',
            href: '/blog/eerlijke-taakverdeling-mens-machine-virtuele-collega-iris',
            description: 'Hoe Iris — zelf een innovatieproject — mij 11+ uur per week bespaart.',
          },
          {
            title: 'Programmamanager digitale transformatie inhuren',
            href: '/programmamanager-digitale-transformatie',
            description: 'Voor organisaties die één transformatieprogramma nodig hebben, geen doorlopende portfoliofunctie.',
          },
        ]}
      />
    </>
  );
}
