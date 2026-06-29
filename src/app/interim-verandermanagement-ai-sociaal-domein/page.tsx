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
  Heart,
  Users,
  Layers,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Building2,
  CalendarDays,
  Quote,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScannerSection } from '@/components/sections/ScannerSection';
import { RelevantReading } from '@/components/seo/RelevantReading';

const diensten = [
  {
    number: '01',
    icon: Heart,
    title: 'Menselijke adoptie als fundament',
    description:
      'De harde realiteit: systemen die niet worden gebruikt zijn miljoenen die verdampen. Ik begin niet bij de software maar bij de mensen. Wie zijn de sceptici? Waar zit de echte angst? Wat heeft de werkvloer nodig om de technologie te omarmen? Ik breng die weerstandskaart in één week in beeld — en bouw dan van binnenuit het draagvlak op dat duurzame adoptie mogelijk maakt.',
    resultaat: 'Een team dat de technologie omarmt omdat ze haar eigen plek erin ziet — niet omdat het moet.',
  },
  {
    number: '02',
    icon: Layers,
    title: 'AI-ready via LEGO® Serious Play',
    description:
      'Hoe maak je een team AI-ready in 3 maanden in plaats van 3 jaar? Niet door presentaties. Niet door instructiefilmpjes. Maar door mensen letterlijk te laten bouwen aan hun eigen antwoorden. Via gecertificeerde LEGO® Serious Play sessies creëren we in één dag concrete afspraken, gedeelde taal en eigenaarschap die maanden vergaderen niet had opgeleverd. Bewezen effectief. Verrassend snel.',
    resultaat: 'Een team dat in 3 maanden AI-ready is en de verandering zelf kan voortzetten.',
  },
  {
    number: '03',
    icon: Building2,
    title: 'Interim directie & strategische executie',
    description:
      'Soms is een rapport niet genoeg. Soms moet er iemand zijn die het ook echt doet. Ik kom binnen als Strategic Innovation Partner voor 3 tot 6 maanden — maximaal 3 dagen per week — en doorbreek een vastgeroest patroon. Ik verbind de boardroom met de werkvloer, stel de juiste vragen aan beide kanten en lever zichtbaar resultaat in de eerste 90 dagen. Geen verlengd consultant-traject: ik kom om overbodig te worden.',
    resultaat: 'Een doorbroken patroon, een werkende innovatiestructuur en een team dat het zonder mij voortzet.',
  },
];

const faqs = [
  {
    question: 'Waarom mislukken AI-projecten in de zorg en het welzijn zo vaak?',
    answer:
      'De meeste AI-projecten stranden niet op technologie maar op mensen. Zorgprofessionals die al overbelast zijn, hebben geen draagvlak voor "wéér een digitaal moetje". IT-consultants die mooie tools leveren, begrijpen de werkvloer niet. Het verschil zit in de menselijke adoptie — en dat vereist kennis van de sector, niet alleen van de software.',
  },
  {
    question: 'Wat maakt u anders dan een reguliere IT-consultant of management consultant?',
    answer:
      'Ik kom niet uit de IT — ik kom uit de welzijnshoek. 25 jaar directie- en managementervaring in het sociaal domein, waaronder zorg voor mensen met een verstandelijke beperking. Ik spreek de taal van de werkvloer én van de boardroom. Tegelijkertijd heb ik zelf AI-platforms gebouwd, dus ik begrijp de technologie van binnenuit. Die combinatie is uniek.',
  },
  {
    question: 'Hoe werkt een interim traject in de praktijk?',
    answer:
      'We starten altijd met een gratis strategische verkenning. Daarna volgt een intakediagnose van 1 tot 2 weken waarbij ik in kaart breng waar de echte weerstand zit. Vervolgens rollen we een gefaseerd 90-dagenplan uit — van draagvlak via LEGO® Serious Play tot concrete AI-implementatie. Na 3 tot 6 maanden staat uw organisatie zelfstandig sterk.',
  },
  {
    question: 'Bent u snel inzetbaar en hoe zit het met uw beschikbaarheid?',
    answer:
      'Maximaal 24 uur (3 dagen) per week — bewust beperkt, omdat de combinatie van 25 jaar ervaring en AI-tooling mij in 16 uur laat doen waar een ander 32 uur voor nodig heeft. U koopt geen uren, maar impact. Start is doorgaans binnen 2 tot 4 weken mogelijk na het eerste gesprek.',
  },
  {
    question: 'Wat kost een interim verandermanagement traject?',
    answer:
      'Dat hangt af van de duur, het aantal dagen en de complexiteit van de organisatie. We beginnen altijd met een gratis strategische verkenning van 30 minuten — dan is snel duidelijk of en hoe ik u kan helpen, en wat de investering bedraagt.',
  },
];

const stats = [
  { value: '70%', label: 'van AI-implementaties strandt op weerstand, niet op technologie' },
  { value: '25+', label: 'jaar directie & management in het sociaal domein' },
  { value: '180', label: 'vrijwilligers + 700+ deelnemers procesoptimalisatie bewezen' },
  { value: '90', label: 'dagen naar aantoonbaar resultaat' },
];

const anderediensten = [
  {
    href: '/ai-strategie-consultant',
    label: 'AI Strategie',
    title: 'AI Strategie Consultant',
    text: 'Van losse experimenten naar een AI-strategie die beklijft. Roadmap op 1 A4.',
    color: 'border-l-violet-400',
    code: 'AS',
    codeColor: 'text-violet-600',
  },
  {
    href: '/change-management-digitale-transformatie',
    label: 'Change Management',
    title: 'Change Management & Digitale Transformatie',
    text: 'Van weerstand naar eigenaarschap. 90-dagentraject voor cultuurverandering.',
    color: 'border-l-amber-400',
    code: 'CM',
    codeColor: 'text-amber-600',
  },
  {
    href: '/programmamanager-digitale-transformatie',
    label: 'Programmamanager',
    title: 'Programmamanager Digitale Transformatie',
    text: 'De schakel tussen bestuur en werkvloer bij complexe digitale transformaties.',
    color: 'border-l-sky-400',
    code: 'PM',
    codeColor: 'text-sky-600',
  },
  {
    href: '/ai-consultant-sociaal-domein',
    label: 'AI Consultant',
    title: 'AI Consultant Sociaal Domein',
    text: 'AI-implementatie met een sociaal hart. Handen uit de mouwen, niet alleen advies.',
    color: 'border-l-emerald-400',
    code: 'AC',
    codeColor: 'text-emerald-600',
  },
];

export default function InterimVerandermanagement() {
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
              Strategic Innovation Partner
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Interim Verandermanagement <br className="hidden md:block" />
            <span className="text-gradient">AI & Innovatie in het Sociaal Domein</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Waarom de meeste AI-projecten in de zorg mislukken (en hoe mijn welzijnsachtergrond dat voorkomt).
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Niet de IT-consultant die een systeem oplevert en vertrekt. Maar iemand die de taal van de werkvloer én de boardroom spreekt — en zorgt dat het ook echt landt.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300 flex-wrap">
            <Button
              size="lg"
              onClick={openBookingChat}
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-xl shadow-orange-500/20 flex items-center gap-2"
            >
              Plan een strategische verkenning
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

      {/* DE HOOK — HET PIJNPUNT */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                De harde realiteit
              </div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
                IT-consultants leveren systemen. De werkvloer weigert ze.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                70% van AI-implementaties in de zorg strandt — niet op technologie, maar op mensen.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Zorgprofessionals bezwijken al onder de werkdruk. Ze hebben geen zin in "wéér een digitaal moetje" van mensen die niet begrijpen wat hun werk werkelijk inhoudt. Het gevolg: prachtige systemen die ongebruikt staan. Miljoeneninvesteringen die verdampen. En een organisatie die achteruit boert terwijl de bestuurskamer denkt dat het goed gaat.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Het risico is niet de technologie. Het risico is de kloof tussen de architect die code praat en de professional die mensen helpt.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Je kunt het beste systeem ter wereld implementeren. Als mensen het niet vertrouwen, gebruiken ze het niet. En dan heb je niets.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={100} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Herken je dit?</h3>
                <div className="flex flex-col gap-4">
                  {[
                    'Het systeem is er, maar medewerkers werken er omheen.',
                    'Miljoeneninvestering dreigt te stranden op adoptie.',
                    'Medewerkers overbelast — geen ruimte voor nieuwe tools.',
                    'IT-consultant begrijpt de sector niet. Werkvloer voelt dat.',
                    'Directie wil AI, maar medewerkers zijn bang voor hun baan.',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl">
                      <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DE SUPERPOWER — POSITIONERING */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              De vertaler
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Ik ben geen IT-architect die in code praat.
            </h2>
            <p className="text-xl text-slate-600 mt-4 max-w-3xl mx-auto leading-relaxed">
              Ik kom uit de welzijnshoek. En dat maakt precies het verschil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-3xl p-10 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Heart size={22} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">De zachte kant van harde innovatie</h3>
              <p className="text-slate-600 leading-relaxed text-[0.925rem]">
                Ik focús niet op de software, maar op de menselijke adoptie. 25 jaar directie- en managementervaring — onder andere in de zorg voor mensen met een verstandelijke beperking — geeft mij iets wat geen IT-consultant heeft: ik ken de angst, de trots en de taal van de zorgprofessional van binnenuit.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={22} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Bewezen tech-vlieguren</h3>
              <p className="text-slate-600 leading-relaxed text-[0.925rem]">
                Tegelijkertijd ben ik oprichter van landelijke, AI-gestuurde platforms zoals Bijeen.app en DatingAssistent. Ik weet hoe je systemen bouwt die wél worden geaccepteerd — omdat ik ze zelf heb gebouwd en de adoptie van binnenuit heb meegemaakt. Geen theorie, maar executie.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-10 md:p-14">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: 'Cultuur & adoptie',
                  text: 'Bij een grote welzijnsorganisatie met 180 vrijwilligers en 700+ deelnemers processen slimmer ingericht. Administratieve druk daalde, tijd voor warme zorg nam toe.',
                },
                {
                  icon: Zap,
                  title: 'Bewezen tech-vlieguren',
                  text: 'Oprichter van meerdere AI-gestuurde platforms. Ik weet hoe je systemen bouwt die worden geaccepteerd — en hoe je de adoptie organiseert die het verschil maakt.',
                },
                {
                  icon: Layers,
                  title: 'Strategische versnelling',
                  text: 'Via high-end LEGO® Serious Play sessies teams in 3 maanden AI-ready gemaakt. Gecertificeerd facilitator met bewezen resultaat in het sociaal domein.',
                },
              ].map((item) => (
                <div key={item.title} className="flex flex-col gap-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <item.icon size={20} className="text-orange-400" />
                  </div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
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

      {/* INTERIM PROFIEL — SPELREGELS */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Exclusiviteit
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Geen winkeloppasser. Een doorbreker.
            </h2>
            <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
              Ik kom niet om gaten te vullen. Ik kom om een vastgeroest patroon te doorbreken.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: CalendarDays,
                title: '3 tot 6 maanden',
                subtitle: 'Duur van een traject',
                text: 'Lang genoeg om echte verandering te realiseren. Kort genoeg om scherp te blijven en gericht te werken. Na het traject staat uw organisatie er zelfstandig voor.',
              },
              {
                icon: Clock,
                title: 'Maximaal 3 dagen per week',
                subtitle: '24 uur, bewust beperkt',
                text: 'Dankzij 25 jaar ervaring en AI-tooling doe ik in 16 uur wat een ander 32 uur kost. U koopt geen uren — u koopt impact.',
              },
              {
                icon: TrendingUp,
                title: 'Zichtbaar resultaat in 90 dagen',
                subtitle: 'Geen consultancy-jargon',
                text: 'In de eerste 90 dagen zijn de eerste concrete doorbraken zichtbaar: van draagvlak tot aantoonbare tijdwinst op de werkvloer. Geen dikke rapporten, maar meetbare verandering.',
              },
              {
                icon: Zap,
                title: 'Impact, geen uren',
                subtitle: 'De spelregel',
                text: 'Ik neem geen opdrachten aan waarvan ik niet geloof dat ze iets opleveren. Als uw organisatie er niet klaar voor is, zeg ik dat voor we beginnen. Eerlijk duurt het langst.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                    <item.icon size={22} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.subtitle}</p>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-[0.925rem]">{item.text}</p>
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
                Wat kost een mislukte AI-implementatie uw organisatie?
              </h2>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                Bereken in 2 minuten hoeveel tijd en budget verloren gaan — en wat het oplevert als het wél landt.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Clock, text: 'Hoeveel uur per week wint uw team terug?' },
                  { icon: TrendingUp, text: 'Wat is de financiële waarde van geslaagde adoptie?' },
                  { icon: Heart, text: 'Wat is de verwachte daling in werkdruk en burn-out?' },
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
              Ik ben Vincent van Munster. Sociaal ondernemer, Strategic Innovation Partner en gecertificeerd{' '}
              <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator.
            </p>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-2xl">
              25 jaar lang heb ik als directeur en manager gewerkt in het sociaal domein — van welzijnsorganisaties tot zorg voor mensen met een verstandelijke beperking. Ik weet wat er écht speelt op de werkvloer, wat er misgaat in bestuurskamers en waarom goede initiatieven stranden. Ik combineer die ervaringskennis met een hands-on kennis van AI die de meeste consultants niet hebben: ik bouw platforms zelf en gebruik ze dagelijks.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Die combinatie — welzijnsachtergrond plus technologische executiekracht — maakt mij tot de vertaler die organisaties nodig hebben om AI-innovatie écht te laten landen.
            </p>
            <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300 mb-10 max-w-2xl text-left">
              &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik ben iemand die begrijpt waar jij voor staat, de taal van je werkvloer spreekt én technologie kan bouwen die past. En die naast je staat totdat het werkt.&rdquo;
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
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van bestuurders en directeuren die overwegen om samen te werken.</p>
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
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Strategische verkenning</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
              Heeft u een AI-project dat dreigt <br />
              <span className="text-orange-600">vast te lopen op de werkvloer?</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Laten we koffie drinken voor een strategische verkenning. In 30 minuten is duidelijk of ik u kan helpen, hoe dat eruitziet en wat het kost. Geen verkooppraatje — gewoon een eerlijk gesprek.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button size="lg" onClick={openBookingChat} className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
                Plan een strategische verkenning
                <ArrowRight size={18} />
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

      {/* ANDERE DIENSTEN */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Andere diensten
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Meer van WeAreImpact</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
              Interim verandermanagement is één van de manieren waarop ik organisaties help. Bekijk ook de andere specialisaties.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {anderediensten.map((dienst) => (
              <Link
                key={dienst.href}
                href={dienst.href}
                className={`group rounded-2xl border border-l-4 ${dienst.color} border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300 p-6 flex items-start gap-5`}
              >
                <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm ${dienst.codeColor} font-bold text-xs shrink-0`}>
                  {dienst.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{dienst.label}</p>
                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">{dienst.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{dienst.text}</p>
                </div>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <RelevantReading
        items={[
          {
            title: 'AI-agents voor welzijnsorganisaties 2026',
            href: '/blog/ai-agents-voor-welzijnsorganisaties-in-2026-van-handige-tool-naar-onmisbare-digitale-collega',
            description: 'Hoe AI-agents de administratiedruk in welzijn verlagen en tijd vrijmaken voor cliënten.',
          },
          {
            title: 'Hoeveel tijd verspilt jouw organisatie aan administratie?',
            href: '/blog/hoeveel-waarde-laat-jouw-welzijnsorganisatie-liggen-ik-heb-het-uitgerekend',
            description: '40% van de werkdag gaat aan administratie. Reken uit wat dat kost.',
          },
          {
            title: 'AI implementeren in je non-profit: stappenplan',
            href: '/kennisbank/ai-implementeren-non-profit-stappenplan',
            description: 'Van weerstand naar adoptie in 8 weken. Praktisch stappenplan voor welzijnsorganisaties.',
          },
        ]}
      />
    </>
  );
}
