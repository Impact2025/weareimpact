'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Brain,
  Quote,
  Linkedin,
  ArrowUpRight,
  CheckCircle,
  Cpu,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Plus,
  Minus,
  ExternalLink,
  Map,
  Users,
  Layers,
  Zap,
  ShieldCheck,
  Target,
} from 'lucide-react';
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
    title: 'Van strategie naar werkende roadmap',
    description:
      'Je hebt een digitale transformatieagenda, maar het vertalen naar concrete stappen waarbij iedereen meekomt is een ander verhaal. Ik werk samen met jou en je stakeholders om de digitale roadmap te bouwen die écht haalbaar is. Geen 200-pagina-rapport dat in de la belandt, maar een werkende agenda die je organisatie stap voor stap door de transformatie loodst.',
    resultaat: 'Een concrete, gedragen roadmap waar je morgen mee aan de slag kunt.',
  },
  {
    number: '02',
    title: 'AI als versneller van je programma',
    description:
      'Digitale transformatie gaat te langzaam? AI kan je programma versnellen op plekken waar je medewerkers nu tijd verliezen aan handmatige taken, rapportages en coördinatie. Ik identificeer de drie plekken in jouw programma waar AI direct waarde toevoegt, implementeer de oplossingen en zorg dat jouw team het omarmt. Niet als losse tool, maar als integraal onderdeel van de transformatie.',
    resultaat: 'Meer snelheid, minder weerstand, meer resultaat voor jouw programma.',
  },
  {
    number: '03',
    title: 'Draagvlak bouwen met LEGO® Serious Play',
    description:
      'Digitale transformatie strandt op mensen, niet op technologie. Bestuur dat afhaakt, medewerkers die weerstand bieden, teams die niet samenwerken: herkenbaar? Met LEGO® Serious Play faciliteer ik sessies waarbij alle stemmen gehoord worden en teams gezamenlijk bouwen aan de digitale toekomst van de organisatie. In één dag creëren we meer draagvlak dan maanden vergaderen.',
    resultaat: 'Een organisatie die eigenaar is van de digitale verandering, in plaats van erdoor gereden te worden.',
  },
];

const faqs = [
  {
    question: 'Wat maakt jou anders dan een traditioneel adviesbureau?',
    answer:
      'Ik kom uit de sector, heb zelf leidinggegeven aan organisaties en bouw de tools die ik adviseer ook zelf. Ik lever geen rapport maar een werkende aanpak. En ik blijf totdat het werkt, niet totdat het contract afloopt.',
  },
  {
    question: 'Hoe lang duurt een typisch traject?',
    answer:
      'Dat hangt af van de scope van je programma. Een roadmap-sessie kan in een dag. Een volledige implementatiebegeleidng loopt over drie tot zes maanden. We beginnen altijd met een vrijblijvend gesprek om te kijken wat jouw situatie vraagt.',
  },
  {
    question: 'Wij hebben al een IT-leverancier. Hoe verhoudt jouw rol zich daartoe?',
    answer:
      'Ik ben geen IT-leverancier en geen concurrent van jouw bestaande partners. Ik werk aan de menselijke en strategische kant van de transformatie: roadmap, draagvlak, verandermanagement en het bouwen van AI-toepassingen die jouw programma versnellen. Ik werk naast je leveranciers, niet in plaats van hen.',
  },
  {
    question: 'We lopen achter op schema. Kan jij helpen versnellen?',
    answer:
      'Dat is precies het soort situatie waar ik het meeste waarde toevoeg. Ik kom snel in kaart wat de blokkades zijn, of dat nu technologie, mensen of processen zijn, en help je het programma weer op de rails te krijgen.',
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
    tagline: 'AI-assistent voor professionals',
    description:
      'Iris is mijn eigen AI-assistent, gebouwd voor professionals in het sociale domein. Ze helpt bij intakegesprekken, ondersteunt bij verslaglegging en beantwoordt vragen van cliënten op een warme, menselijke manier. Een concreet voorbeeld van hoe digitale transformatie er in de praktijk uitziet.',
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

export default function ProgrammamanagerDigitaleTransformatie() {
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
              Programmamanager Digitale Transformatie
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Digitale transformatie <br className="hidden md:block" />
            <span className="text-gradient">die écht landt.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Voor programmamanagers die willen dat technologie niet alleen wordt ingevoerd, maar ook echt wordt omarmd.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Van roadmap tot draagvlak. Van strategie tot werkende AI-toepassingen. Ik sta naast je, niet ernaast.
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
              <Link href="/impact-calculator" className="flex items-center gap-2">
                <BarChart3 size={18} />
                Bereken mijn impact
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
                De realiteit
              </div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                Transformatie mislukt op mensen, niet op technologie.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Dat weet jij als programmamanager al lang.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Je hebt het plan. Je hebt het budget. Je hebt de technologie. En toch lopen projecten vertraging op. Medewerkers die de nieuwe systemen omzeilen. Bestuurders die afhaken zodra het concreet wordt. Ketenpartners die niet meewerken. De agenda die krimpt zodra de waan van de dag terugkomt.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Dat kan anders. En ik help je daarmee.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Ik combineer strategisch inzicht met hands-on AI-kennis én een achtergrond in het sociale domein. Ik weet hoe organisaties van binnenuit werken, waar weerstand vandaan komt en hoe je draagvlak bouwt dat beklijft.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Digitale transformatie is geen IT-project. Het is een menselijk veranderproject, met technologie als instrument.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Strategie én uitvoering.</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Ik werk met programmamanagers die niet alleen een plan willen, maar ook iemand die meebouwt aan de uitvoering.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-orange-500 rounded-lg text-white"><Map size={20} /></div>
                    <div>
                      <div className="font-bold">Concrete roadmaps</div>
                      <div className="text-xs text-slate-400">Van visie naar werkende stappen</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-blue-500 rounded-lg text-white"><Users size={20} /></div>
                    <div>
                      <div className="font-bold">Draagvlak en adoptie</div>
                      <div className="text-xs text-slate-400">Mensen meenemen in de verandering</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-violet-500 rounded-lg text-white"><Zap size={20} /></div>
                    <div>
                      <div className="font-bold">AI als versneller</div>
                      <div className="text-xs text-slate-400">Technologie die het programma sterker maakt</div>
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
              Herken jij dit?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                code: 'GM',
                title: 'Gemeenten',
                text: 'Je leidt de digitale transformatie van een gemeente. Er zijn goede plannen, maar de uitvoering loopt spaak op weerstand, trage besluitvorming en afdelingen die niet op één lijn zitten.',
              },
              {
                code: 'WZ',
                title: 'Zorg & welzijn',
                text: 'Je wil jouw zorg- of welzijnsorganisatie klaarstomen voor de digitale toekomst, maar medewerkers zijn sceptisch en de systemen sluiten niet op elkaar aan. Jij zoekt iemand die dat begrijpt én het kan oplossen.',
              },
              {
                code: 'SO',
                title: 'Sociaal domein',
                text: 'Je werkt in het brede sociaal domein: maatschappelijke opvang, participatie, jeugd. De transformatieagenda is ambitieus. Het tempo ligt te laag. Jij hebt behoefte aan een sparringpartner die mee in de modder staat.',
              },
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
                Hoeveel waarde laat jouw transformatieprogramma nu liggen?
              </h2>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                Bereken in 2 minuten hoeveel uren, gesprekken en budgetruimte AI kan vrijmaken binnen jouw digitale transformatieprogramma.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Clock, text: 'Hoeveel uur per week wint jouw team terug?' },
                  { icon: TrendingUp, text: 'Wat is de financiële waarde per jaar?' },
                  { icon: Activity, text: 'Wat is de verwachte daling in werkdruk?' },
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
                  { label: 'Werkdruk daling', value: '15–19%', unit: 'verwacht', color: 'text-violet-400' },
                  { label: 'Extra capaciteit', value: '+149', unit: 'uur per maand', color: 'text-sky-400' },
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
                <Image src="/vincent-van-munster.png" alt="Vincent van Munster" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </div>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik ben Vincent van Munster. Sociaal ondernemer, programmamanager en gecertificeerd{' '}
              <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator.
            </p>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik werk al meer dan 15 jaar in het sociale domein, als directeur, als bouwer, als iemand die organisaties van binnenuit kent. Ik heb digitale transformaties begeleid bij gemeenten en stichtingen. Ik weet wat er speelt op de werkvloer, wat er misgaat in bestuurskamers en waarom goede programma's vastlopen.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Ik combineer dat met hands-on kennis van AI die de meeste adviseurs niet hebben. Ik bouw het zelf. Ik gebruik het zelf. En ik help jou het in te zetten als versneller van jouw transformatieprogramma.
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
            Alles wat ik voor jou inzet, heb ik zelf gebouwd en bewezen. Van software die gemeenten dagelijks gebruiken tot AI-tools die teams tijd teruggeven. Geen concepten, maar werkende oplossingen.
          </p>
          <ProjectCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van programmamanagers die willen versnellen.</p>
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
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Samenwerking</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
              Jouw programma, <br />
              <span className="text-orange-600">90 dagen van nu.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Je zoekt geen adviseur die rapporten schrijft en verder gaat. Je zoekt iemand die in 90 dagen zichtbaar resultaat boekt in jouw transformatieprogramma, en daarna zorgt dat jouw team het zelf kan voortzetten.
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
