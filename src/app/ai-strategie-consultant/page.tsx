'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  Linkedin,
  ArrowUpRight,
  CheckCircle,
  Cpu,
  BarChart3,
  Brain,
  Map,
  ShieldCheck,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
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
    icon: Target,
    title: 'AI-Strategiediagnose',
    description:
      'Waar staat jouw organisatie nu? En waar liggen de echte kansen? In een gerichte sessie met jou en je team breng ik in kaart wat er al is, wat ontbreekt en wat als eerste de meeste impact oplevert. Geen theoretisch model, maar een eerlijke analyse van jouw specifieke situatie — van werkprocessen tot AVG-risico\'s tot de bereidheid van je medewerkers.',
    resultaat: 'Een helder beeld van je startpositie en de drie kansen die direct aandacht verdienen.',
  },
  {
    number: '02',
    icon: Map,
    title: 'Roadmap op één A4',
    description:
      'De meeste strategie-trajecten leveren een dik rapport dat in de la belandt. Ik lever iets anders: een concrete AI-roadmap op één A4. Gefaseerd, haalbaar, met duidelijke prioriteiten en eigenaarschap per stap. Zodat jij morgen weet wie wat doet, in welke volgorde en waarom. Geen buzzwords, geen consultancy-jargon — gewoon: dit zijn de stappen.',
    resultaat: 'Een uitvoerbare AI-roadmap die je direct kunt presenteren aan bestuur en team.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'AI Governance Framework',
    description:
      'Wie mag welke AI-beslissingen nemen? Hoe ga je om met AVG en de EU AI Act? Wat als een algoritme iets vindt over een cliënt — wie controleert dat? Een AI-strategie zonder governance is een strategie die vroeg of laat spaak loopt. Ik help je de regels, rollen en verantwoordelijkheden op te zetten die ervoor zorgen dat AI-gebruik in jouw organisatie ethisch, veilig en bestuurbaar blijft.',
    resultaat: 'Een governance-kader dat je beschermt én ruimte geeft om te innoveren.',
  },
];

const faqs = [
  {
    question: 'Wat is een AI-strategie precies?',
    answer:
      'Een AI-strategie geeft antwoord op drie vragen: wat willen we bereiken met AI, welke toepassingen passen bij onze organisatie, en hoe zorgen we dat het ook echt werkt — technisch, juridisch en menselijk. Zonder strategie is AI een reeks losse experimenten die niets opleveren.',
  },
  {
    question: 'We zijn een kleine organisatie. Is een AI-strategie dan niet overdreven?',
    answer:
      'Juist niet. Een kleine organisatie heeft minder ruimte voor fouten. Een goede strategie voorkomt dat je budget en energie verspilt aan tools die niet passen. En een eenvoudige, heldere strategie is beter dan helemaal geen kaders hebben.',
  },
  {
    question: 'Hoe lang duurt een strategietraject?',
    answer:
      'Een compacte AI-strategiediagnose + roadmap kan ik in 2 tot 4 weken opleveren. Een uitgebreider traject inclusief governance-framework en implementatiebegeleiding loopt over 6 tot 12 weken. We stemmen dat af in een vrijblijvend eerste gesprek.',
  },
  {
    question: 'Wat kost een AI-strategietraject?',
    answer:
      'Dat hangt af van de diepgang en doorlooptijd. Een compacte diagnose + roadmap start vanaf een eenmalige investering. We bespreken je situatie eerst en dan weet je snel of en hoe ik je kan helpen — zonder verrassingen achteraf.',
  },
  {
    question: 'Onze gemeente heeft al een IT-afdeling. Waarom dan nog een externe consultant?',
    answer:
      'Een IT-afdeling is sterk in technologie en beheer. Maar een AI-strategie raakt ook aan beleid, cultuur, ethiek en processen. Ik verbind die werelden en zorg dat de strategie breed gedragen is — ook buiten IT.',
  },
];

const stats = [
  { value: '57%', label: 'van gemeenten heeft geen AI-strategie' },
  { value: '85%', label: 'van AI-projecten schalen niet' },
  { value: '15+', label: 'jaar in het sociaal domein' },
  { value: '90', label: 'dagen naar zichtbaar resultaat' },
];

export default function AIStrategieConsultant() {
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
              AI Strategie Consultant
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Van AI-experiment <br className="hidden md:block" />
            <span className="text-gradient">naar strategie die beklijft.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            AI-strategie voor gemeenten, welzijnsorganisaties en non-profit.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Geen dik rapport dat in de la belandt. Maar een concrete roadmap die past bij jouw organisatie, mensen en budget.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300 flex-wrap">
            <Button
              size="lg"
              onClick={openBookingChat}
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-xl shadow-orange-500/20 flex items-center gap-2"
            >
              Plan een gesprek
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

      {/* DE REALITEIT */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                De realiteit
              </div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                Strategie ontbreekt. Niet de ambitie.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                57% van de Nederlandse gemeenten heeft geen AI-strategie. 85% van AI-pilotprojecten schalen niet.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Niet omdat de ambitie er niet is. Maar omdat AI-strategie meer vraagt dan een tool uitproberen. Het vraagt om keuzes: wat willen we écht bereiken? Welke processen lenen zich voor AI? Wie is verantwoordelijk? Hoe zorgen we dat medewerkers meegaan?
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Zonder die keuzes wordt elke AI-implementatie een experiment. Soms werkt het. Vaker niet. En intussen loopt de organisatie achter de feiten aan.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;De meeste organisaties beginnen met een tool. Niet met een vraag. Dat is precies waarom het zo vaak misloopt.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <h3 className="text-2xl font-bold mb-6">Herken je dit?</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: AlertTriangle, text: 'We proberen van alles, maar er landt niets structureel.' },
                    { icon: AlertTriangle, text: 'Het bestuur wil AI, maar niemand weet waar te beginnen.' },
                    { icon: AlertTriangle, text: 'We missen kaders — AVG, EU AI Act, governance.' },
                    { icon: AlertTriangle, text: 'Medewerkers zijn sceptisch of bang voor hun baan.' },
                    { icon: Lightbulb, text: 'We weten dat er kansen liggen, maar welke dan precies?' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl">
                      <item.icon size={18} className={i < 4 ? 'text-orange-400 shrink-0 mt-0.5' : 'text-emerald-400 shrink-0 mt-0.5'} />
                      <p className="text-slate-300 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VOOR WIE */}
      <section className="py-24 bg-[#FDFBF7]">
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
              {
                code: 'GM',
                title: 'Gemeenten',
                text: 'Voor gemeentesecretarissen, beleidsadviseurs en managers die AI verantwoord en effectief willen inzetten — van dienstverlening tot het sociaal domein. Met oog voor AVG, de EU AI Act en de menselijke maat.',
              },
              {
                code: 'WZ',
                title: 'Welzijn & zorg',
                text: 'Voor directeuren en bestuurders van welzijnsorganisaties en zorginstellingen die AI willen inzetten om medewerkers te ontlasten, zonder de kernwaarden van de sector te verliezen.',
              },
              {
                code: 'NP',
                title: 'Non-profit & stichtingen',
                text: 'Voor stichtingen en non-profitorganisaties die met beperkte middelen toch serieus aan de slag willen met AI — slim, gefaseerd en met oog voor impact.',
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">WeAreImpact in de praktijk</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Hoe ik je help</h2>
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

      {/* STATS */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="p-6 bg-slate-800 rounded-2xl text-center">
                <div className="text-3xl md:text-4xl font-black text-orange-400 mb-2">{stat.value}</div>
                <div className="text-xs text-slate-400 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT CALCULATOR TEASER */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
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
                Bereken in 2 minuten hoeveel uren en budgetruimte AI kan vrijmaken voor jouw team.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: TrendingUp, text: 'Hoeveel uur per week wint jouw team terug?' },
                  { icon: BarChart3, text: 'Wat is de financiële waarde per jaar?' },
                  { icon: Brain, text: 'Wat levert een goede AI-strategie concreet op?' },
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
      <section className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <Link href="/vincent-van-munster" className="relative mb-8 block">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b] hover:ring-orange-500/60 transition-all duration-200">
                <Image src="/vincent-van-munster.png" alt="Vincent van Munster" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </Link>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik ben Vincent van Munster. Sociaal ondernemer, AI-consultant en gecertificeerd{' '}
              <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Ik werk al meer dan 15 jaar in het sociale domein. Ik heb platforms gebouwd die dagelijks impact maken voor gemeenten en stichtingen. Ik weet wat er speelt op de werkvloer, wat er misgaat in bestuurskamers en waarom goede initiatieven vaak stranden. Ik combineer dat met hands-on kennis van AI die de meeste consultants niet hebben — ik bouw het zelf en gebruik het zelf.
            </p>
            <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300 mb-10 max-w-2xl text-left">
              &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik ben iemand die begrijpt waar jij voor staat, en die naast je staat totdat het werkt.&rdquo;
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
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van organisaties die een AI-strategie willen opzetten.</p>
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
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">AI Strategie</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
              Jouw organisatie, <br />
              <span className="text-orange-600">90 dagen van nu.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Van losse experimenten naar een AI-strategie die beklijft. We beginnen altijd met een vrijblijvend gesprek van 30 minuten — dan weet je snel of en hoe ik je kan helpen.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button size="lg" onClick={openBookingChat} className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
                Plan een gesprek
                <ArrowRight size={18} />
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="#scan" className="flex items-center gap-2">
                  <Cpu size={18} />
                  Doe de gratis AI-scan
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
