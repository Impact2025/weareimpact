'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, ChevronDown, Heart, Brain, Quote, Linkedin, ArrowUpRight, CheckCircle, Cpu, Clock, TrendingUp, BarChart3, Activity, Plus, Minus, ExternalLink, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScannerSection } from '@/components/sections/ScannerSection';

const diensten = [
  {
    number: '01',
    title: 'Waar kan AI jou lucht geven?',
    description:
      'Je weet dat er iets moet veranderen, maar de waan van de dag wint het steeds. Ik kom binnen, kijk met jou waar je mensen de meeste tijd verliezen aan werk dat hen van hun echte werk afhoudt, en lever je een concrete roadmap op één A4. Geen dik rapport. Geen buzzwords. Gewoon: dit zijn de drie plekken waar AI direct tijd vrijmaakt voor jouw mensen.',
    resultaat: 'Direct inzicht in tijdwinst die terugvloeit naar cliëntcontact.',
  },
  {
    number: '02',
    title: 'We bouwen het samen',
    description:
      'De meeste consultants vertellen wat er moet gebeuren. Ik zorg voor het hoe. Ik implementeer AI-oplossingen die passen bij jouw organisatie, van automatische verslaglegging tot intelligente ondersteuning bij subsidieaanvragen en Wmo-rapportages. Ik configureer het systeem, dek de AVG-risico\'s af en train je medewerkers totdat ze het omarmen. Niet als leverancier die vertrekt, maar als iemand die naast je staat totdat het werkt.',
    resultaat: 'Minder bullshit-work, meer tijd voor de mensen om wie het draait.',
  },
  {
    number: '03',
    title: 'Iedereen mee',
    description:
      'AI roept vragen op. Mag een algoritme iets vinden van een cliënt? Wat als mijn medewerkers het systeem niet vertrouwen? Met LEGO® Serious Play faciliteer ik sessies waarin teams letterlijk bouwen aan hun eigen antwoorden op die vragen. In één dag creëren we draagvlak dat maanden vergaderen niet had opgeleverd. Met concrete afspraken die het team zelf in handen neemt.',
    resultaat: 'Een team dat zich eigenaar voelt van de technologie in plaats van erdoor bedreigd.',
  },
];

const faqs = [
  {
    question: 'Wat kost het om met jou te werken?',
    answer:
      'Dat hangt af van wat je nodig hebt. Een scan is een eenmalige investering. Een implementatietraject loopt over meerdere weken. We beginnen altijd met een vrijblijvend gesprek, dan weet je snel of en hoe ik je kan helpen.',
  },
  {
    question: 'Wat maakt jou anders dan andere AI-consultants?',
    answer:
      'Ik kom uit de sector. Ik heb zelf als directeur in welzijnsorganisaties gewerkt. Ik weet wat een sociaal werker écht nodig heeft, en wat niet. Ik bouw ook zelf, dus ik lever geen rapport maar een werkende oplossing.',
  },
  {
    question: 'Hoe weet ik of mijn organisatie klaar is voor AI?',
    answer:
      'Dat is precies wat de AI-scan uitwijst. In vijf minuten weet je waar AI bij jouw organisatie direct waarde toevoegt, en waar nog niet.',
  },
  {
    question: 'Wat als het toch niet werkt?',
    answer:
      'Dan hoor je dat van mij voordat we beginnen. Ik neem geen opdrachten aan waarvan ik niet geloof dat ze iets opleveren. Dat is niet goed voor jou, en niet voor mij.',
  },
];

const stats = [
  { value: '15+', label: 'Jaar ervaring' },
  { value: '2', label: 'Live platforms' },
  { value: 'LSP', label: 'Certified facilitator' },
  { value: 'AI', label: 'Gedreven aanpak' },
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
      'Iris is mijn eigen AI-assistent, gebouwd voor professionals in het sociale domein. Ze helpt bij intakegesprekken, ondersteunt bij verslaglegging en beantwoordt vragen van cliënten op een warme, menselijke manier. Iris toont aan dat AI niet koud en afstandelijk hoeft te zijn, maar juist de menselijke professional kan versterken.',
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
      'Bijeen helpt welzijnsorganisaties en gemeenten bijeenkomsten te organiseren, deelnemers te beheren en impact te meten. Van QR-check-in tot automatische e-mailcommunicatie, gebouwd voor de sector die niet altijd het budget heeft voor dure enterprise software.',
    url: 'https://bijeen.app',
  },
  {
    id: 'brickme',
    initials: 'BM',
    color: 'text-orange-600',
    accent: 'border-orange-400',
    name: 'Brickme.nl',
    tagline: 'Zelfontdekking via AI en LEGO® Serious Play®',
    description:
      'Brickme combineert mijn achtergrond als LEGO® Serious Play facilitator met AI. Gebruikers doorlopen een begeleide zelfsessie, ze bouwen, fotograferen en krijgen reflectieve feedback van een AI-coach. Een tool voor iedereen die vastloopt op wat hij of zij écht wil.',
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

export default function Home() {
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
              AI Consultant
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Ik verbind mensen, <br className="hidden md:block" />
            <span className="text-gradient">teams en technologie.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            AI consultant voor welzijnsorganisaties, gemeenten en sociaal ondernemers.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-6 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Geen rapport en wegwezen. Maar iemand die naast je staat en het ook echt laat werken.
          </p>

          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-12 animate-fade-in-up delay-200">
            {[
              'Interim Projectleider Welzijn & Sociaal Domein',
              'Kwartiermaker Innovatie & AI',
              'Verandermanager Digitale Transformatie',
            ].map((title, i, arr) => (
              <span key={title} className="flex items-center gap-3 text-[0.8rem] text-slate-400 font-medium">
                {title}
                {i < arr.length - 1 && <span className="text-slate-200">|</span>}
              </span>
            ))}
          </div>

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
              <Link href="#scan" className="flex items-center gap-2">
                <Cpu size={18} />
                Doe de gratis AI-scan
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <Link href="/vincent-van-munster" className="flex items-center gap-2">
                <Briefcase size={18} />
                Interim Profiel &amp; CV
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400">
          <ChevronDown size={24} />
        </div>
      </header>

      {/* AI-SCAN */}
      <ScannerSection />

      {/* HET MANIFEST */}
      <section id="manifest" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Het Manifest
              </div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                Ik weet wat impact écht betekent.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Niet uit een boek. Maar omdat ik het heb geleefd.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Ik heb gezien hoe goede mensen vastlopen in systemen die niet voor hen zijn gebouwd. Hoe sociaal werkers die elke dag het verschil willen maken, verdrinken in rapportages en administratie. Hoe organisaties die ertoe doen, achterblijven bij technologie die hen juist verder had kunnen brengen.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Dat kan anders. Dat moet anders.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Ik gebruik AI niet om mensen te vervangen. Ik gebruik het om ruimte te maken. Ruimte voor echte gesprekken. Voor echte verbinding. Voor wat er werkelijk toe doet.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Technologie belooft ons te verbinden. Maar te vaak maakt het ons eenzamer. Ik geloof dat het anders kan.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Niet efficiënter. Menselijker.</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Ik werk met gemeenten, welzijnsorganisaties en sociaal ondernemers die willen innoveren zonder de menselijke maat te verliezen.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-orange-500 rounded-lg text-white"><Heart size={20} /></div>
                    <div>
                      <div className="font-bold">Ruimte voor mensen</div>
                      <div className="text-xs text-slate-400">AI als enabler van echt contact</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-blue-500 rounded-lg text-white"><Brain size={20} /></div>
                    <div>
                      <div className="font-bold">Ethische AI-toepassingen</div>
                      <div className="text-xs text-slate-400">Privacy en menselijke maat centraal</div>
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
              Voor wie
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Voor wie is dit?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { code: 'WZ', title: 'Welzijn en zorg', text: 'Voor directeuren en managers in de welzijns- en zorgsector die weten dat AI kansen biedt, maar niet weten waar te beginnen. Of die al begonnen zijn, maar merken dat het niet landt in de organisatie.' },
              { code: 'GM', title: 'Gemeenten', text: 'Voor gemeenten die technologie willen inzetten die de menselijke maat versterkt, niet ondermijnt.' },
              { code: 'SO', title: 'Sociaal ondernemers', text: 'Voor sociaal ondernemers die willen bouwen aan iets wat écht werkt, en iemand zoeken die dat ook begrijpt.' },
            ].map((item) => (
              <div key={item.code} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-orange-600 font-black text-sm">{item.code}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-[0.925rem]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIENSTEN */}
      <section id="diensten" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">WeAreImpact in de praktijk</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Wat ik doe</h2>
          </div>
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {diensten.map((dienst) => (
              <div key={dienst.number} className="group relative bg-white rounded-3xl p-10 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <span className="absolute -bottom-4 right-6 text-9xl font-black text-slate-50 select-none leading-none transition-colors duration-500 group-hover:text-orange-50/80">{dienst.number}</span>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest">{dienst.number}</span>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{dienst.title}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 text-[0.925rem] max-w-3xl">{dienst.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700">
                    <CheckCircle size={15} className="text-orange-500 shrink-0" />
                    <span><span className="font-semibold">Resultaat:</span> {dienst.resultaat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT CALCULATOR TEASER */}
      <section id="calculator-teaser" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <BarChart3 size={14} /> Gratis Impact Calculator
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Hoeveel waarde laat jouw organisatie nu liggen?
              </h2>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                Bereken in 2 minuten hoeveel uren, cliëntgesprekken en budgetruimte AI kan vrijmaken voor jouw welzijnsteam.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Clock, text: 'Hoeveel uur per week wint jouw team terug?' },
                  { icon: TrendingUp, text: 'Wat is de financiële waarde per jaar?' },
                  { icon: Activity, text: 'Wat is de verwachte daling in burn-out?' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-orange-400" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/impact-calculator">
                <Button size="lg" className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all">
                  <BarChart3 size={18} />
                  Bereken mijn impact
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
            <div className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Voorbeeld: team van 30 medewerkers</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tijdwinst/week', value: '58', unit: 'uur per week', color: 'text-orange-400' },
                  { label: 'Financieel/jaar', value: '€ 106k', unit: 'operationele waarde', color: 'text-emerald-400' },
                  { label: 'Burn-out daling', value: '15–19%', unit: 'verwacht', color: 'text-violet-400' },
                  { label: 'Extra gesprekken', value: '+149', unit: 'per maand', color: 'text-sky-400' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${color}`}>{label}</p>
                    <p className="text-4xl font-black text-white tabular-nums">{value}</p>
                    <p className="text-sm text-slate-400 mt-1">{unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVER VINCENT */}
      <section id="over" className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b]">
                <Image src="/vincent-van-munster.webp" alt="Vincent van Munster" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </div>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik ben Vincent van Munster. Sociaal ondernemer, AI-consultant en gecertificeerd{' '}
              <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator.
            </p>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik werk al meer dan 15 jaar in het sociale domein, als directeur, als bouwer, als sociaal ondernemer, als iemand die organisaties van binnenuit kent. Ik heb platforms gebouwd die dagelijks impact maken voor gemeenten en stichtingen. Ik weet wat er speelt op de werkvloer, wat er misgaat in bestuurskamers en waarom goede initiatieven vaak stranden.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Ik combineer dat met een hands-on kennis van AI die de meeste consultants niet hebben. Ik bouw het zelf. Ik gebruik het zelf. En ik help jou het te begrijpen en te benutten.
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
            <a href="https://www.linkedin.com/in/vincentvanmunster" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full transition-colors duration-200">
              <Linkedin size={15} />
              Verbind op LinkedIn
              <ArrowUpRight size={13} className="opacity-60" />
            </a>
          </div>
        </div>
      </section>

      {/* IN DE PRAKTIJK */}
      <section id="praktijk" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Portfolio</div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">In de praktijk</h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
            Alles wat ik voor jou inzet, heb ik zelf gebouwd en bewezen. Van vrijwilligerssoftware die gemeenten dagelijks gebruiken tot AI-tools die sociaal werkers tijd teruggeven. Geen concepten, maar werkende oplossingen.
          </p>
          <ProjectCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van organisaties die willen vernieuwen.</p>
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
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Partnerships</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
              Jouw organisatie, <br />
              <span className="text-orange-600">90 dagen van nu.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Je zoekt geen manager die vergaderingen vult. Je zoekt iemand die in 90 dagen zichtbaar resultaat boekt, en daarna zorgt dat jouw team het zelf kan voortzetten.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button size="lg" onClick={openBookingChat} className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
                Drink koffie met Vincent
                <ArrowRight size={18} />
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="#scan" className="flex items-center gap-2">
                  <Cpu size={18} />
                  Doe de gratis AI-scan
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
    </>
  );
}
