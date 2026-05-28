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
    icon: Users,
    title: 'Draagvlak van binnenuit',
    description:
      'De grootste fout bij digitale transformaties: top-down implementeren. Directie besluit, IT voert uit, werkvloer moet mee. Maar zonder eigenaarschap van de mensen die het moeten gebruiken, strandt elke verandering. Ik werk samen met jou en je team om verandering te ontwerpen die medewerkers zelf dragen — van analyse tot uitvoering. Niet voor hen, maar mét hen.',
    resultaat: 'Een team dat zich eigenaar voelt van de verandering, in plaats van erdoor overvallen.',
  },
  {
    number: '02',
    icon: Layers,
    title: 'LEGO® Serious Play sessies',
    description:
      'Hoe zorg je dat mensen die sceptisch of bang zijn toch meedoen? Niet door ze te overtuigen met presentaties. Maar door ze letterlijk te laten bouwen aan hun eigen antwoorden. Met LEGO® Serious Play faciliteer ik sessies waarin teams in één dag concrete afspraken maken over AI, digitalisering en verandering — met draagvlak dat maanden vergaderen niet had opgeleverd. Gecertificeerd. Bewezen. Verrassend effectief.',
    resultaat: 'Concrete afspraken en een gedeeld beeld dat het team zelf in handen neemt.',
  },
  {
    number: '03',
    icon: Heart,
    title: '90-dagenplan voor cultuurverandering',
    description:
      'Verandering is geen project, het is een proces. Ik begeleid jouw organisatie in een gefaseerd 90-dagentraject: van bewustwording en draagvlak naar echte gedragsverandering. Met check-ins, meetpunten en een team dat na 90 dagen zelf het stuur in handen heeft. Geen consultancy die vertrekt als het spannend wordt — maar iemand die naast je staat totdat het werkt.',
    resultaat: 'Een organisatie die na 90 dagen zelfstandig de verandering voortzet.',
  },
];

const faqs = [
  {
    question: 'Waarom mislukken zoveel digitale transformaties?',
    answer:
      '85% van digitale transformaties strandt — niet door technologie maar door mensen. Weerstand, gebrek aan eigenaarschap, angst voor banenverlies, een kloof tussen directie en werkvloer. Technologie is het makkelijke deel. De cultuurverandering die erbij hoort is het echte werk.',
  },
  {
    question: 'Wat is het verschil tussen change management en projectmanagement?',
    answer:
      'Projectmanagement gaat over wat er verandert en wanneer. Change management gaat over hoe mensen meegaan in die verandering. Een perfect uitgerold systeem zonder adoptie is een mislukt project. Goede change management zorgt dat de verandering ook echt landt in de organisatie.',
  },
  {
    question: 'Onze medewerkers zijn bang voor AI. Hoe ga je daarmee om?',
    answer:
      'Die angst is begrijpelijk en terecht. Ik neem hem serieus in plaats van hem weg te redeneren. In de LEGO® Serious Play sessies krijgen medewerkers letterlijk de ruimte om hun zorgen te bouwen en bespreekbaar te maken. Vanuit die eerlijke basis bouwen we samen aan vertrouwen.',
  },
  {
    question: 'Hoe lang duurt een change management traject?',
    answer:
      'Een compacte interventie (workshop + follow-up) kan in 4-6 weken. Een volledig 90-dagentraject loopt — logischerwijs — 90 dagen. We stemmen de omvang af op jouw situatie in een vrijblijvend eerste gesprek.',
  },
  {
    question: 'Kunnen we dit niet intern regelen?',
    answer:
      'Soms wel. Maar interne verandering begeleiding heeft twee blinde vlekken: je zit zelf in het systeem, en mensen zeggen andere dingen tegen een collega dan tegen een externe begeleider. Een buitenstaander met kennis van de sector brengt ruimte die intern moeilijk te creëren is.',
  },
];

const stats = [
  { value: '85%', label: 'van digitale transformaties mislukt door mensen, niet tech' },
  { value: '1 dag', label: 'LEGO® Serious Play — meer draagvlak dan maanden vergaderen' },
  { value: '15+', label: 'jaar ervaring in het sociaal domein' },
  { value: '90', label: 'dagen naar aantoonbare gedragsverandering' },
];

export default function ChangeManagementDigitaleTransformatie() {
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
              Change Management
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Technologie is niet <br className="hidden md:block" />
            <span className="text-gradient">het probleem.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Digitale transformatie mislukt op mensen, niet op technologie.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Ik begeleid gemeenten en welzijnsorganisaties bij de cultuurverandering die AI-adoptie vraagt — van weerstand naar eigenaarschap.
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
                Transformatie mislukt op mensen, niet op technologie.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                85% van digitale transformaties strandt — niet omdat de technologie niet werkt, maar omdat mensen niet meegaan.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Weerstand, gebrek aan eigenaarschap, angst voor banenverlies, een kloof tussen directie en werkvloer. Dat zijn de echte redenen waarom goede initiatieven stranden. Organisaties investeren in systemen, maar vergeten te investeren in de mensen die ze moeten gebruiken.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Digitale transformatie is geen IT-project. Het is een menselijk veranderproject. En het vraagt andere begeleiding.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Je kunt het beste systeem ter wereld implementeren. Als mensen het niet vertrouwen, gebruiken ze het niet.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <h3 className="text-2xl font-bold mb-6">Herken je dit?</h3>
                <div className="flex flex-col gap-4">
                  {[
                    'Het systeem is er, maar medewerkers werken er omheen.',
                    'Er is weerstand, maar niemand durft dat hardop te zeggen.',
                    'De directie is enthousiast, de werkvloer is sceptisch.',
                    'Eerdere verandertrajecten hebben weinig opgeleverd.',
                    'Mensen zijn bang dat AI hun baan overneemt.',
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
                text: 'Voor gemeenten die merken dat digitale dienstverlening of AI-implementaties niet landen bij medewerkers of inwoners. Die weten dat de technologie klopt, maar dat de cultuur achterblijft.',
              },
              {
                code: 'WZ',
                title: 'Welzijn & zorg',
                text: 'Voor directeuren van welzijnsorganisaties en zorginstellingen die AI willen implementeren zonder de menselijke maat te verliezen — en die weten dat draagvlak het verschil maakt.',
              },
              {
                code: 'SO',
                title: 'Sociaal domein',
                text: 'Voor managers in het sociaal domein die verandering willen realiseren die de werkvloer raakt — van jeugdhulp tot re-integratie tot sociale wijkteams.',
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
                Wat levert goede adoptie jouw organisatie op?
              </h2>
              <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                Bereken in 2 minuten hoeveel tijd en geld een geslaagde digitale transformatie jouw team oplevert.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: TrendingUp, text: 'Hoeveel uur per week wint jouw team terug?' },
                  { icon: BarChart3, text: 'Wat is de financiële waarde per jaar?' },
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
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-600 ring-offset-4 ring-offset-[#1e293b]">
                <Image src="/vincent-van-munster.png" alt="Vincent van Munster" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </div>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Ik ben Vincent van Munster. Sociaal ondernemer, AI-consultant en gecertificeerd{' '}
              <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span> facilitator.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Ik werk al meer dan 15 jaar in het sociale domein. Ik ken de weerstand die digitale verandering oproept — niet uit een boek, maar omdat ik het zelf heb meegemaakt. Als directeur, als bouwer, als iemand die organisaties van binnenuit kent. Ik combineer die ervaringskennis met een hands-on aanpak van AI en verandermanagement.
            </p>
            <div className="p-6 bg-slate-800 rounded-2xl border-l-4 border-orange-500 italic text-slate-300 mb-10 max-w-2xl text-left">
              &ldquo;Ik ben geen snelle jongen met een mooi deck. Ik ben iemand die begrijpt waar jij voor staat, en die naast je staat totdat het werkt.&rdquo;
            </div>
            <a href="https://www.linkedin.com/in/vincentvanmunster" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full transition-colors duration-200">
              <Linkedin size={15} />
              Verbind op LinkedIn
              <ArrowUpRight size={13} className="opacity-60" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van organisaties die vastlopen op verandering.</p>
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
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Change Management</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
              Jouw organisatie, <br />
              <span className="text-orange-600">90 dagen van nu.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Van weerstand naar eigenaarschap. Van experiment naar gedragen verandering. We beginnen altijd met een vrijblijvend gesprek van 30 minuten — dan weet je snel of en hoe ik je kan helpen.
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
