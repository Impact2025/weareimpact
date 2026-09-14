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
  ShieldCheck,
  Anchor,
  AlertOctagon,
  Building2,
  Scale,
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
    icon: AlertOctagon,
    title: 'Onverwacht vertrek of vacature',
    description:
      'Een directeur of manager vertrekt en de organisatie kan niet wachten op een lange werving. Continuïteit gaat voor.',
  },
  {
    icon: Scale,
    title: 'Ziekte of langdurige uitval',
    description:
      'Leiding valt weg op een moment dat de organisatie het niet kan missen. Een interim manager houdt de koers vast.',
  },
  {
    icon: Building2,
    title: 'Fusie, reorganisatie of transitie',
    description:
      'Een zware verandering vraagt om leiding die niet meebeweegt met de politiek van het zittende team, maar wel het vertrouwen heeft van de werkvloer.',
  },
  {
    icon: ShieldCheck,
    title: 'Raad van Toezicht wil grip houden',
    description:
      'Het bestuur wil zekerheid over financiën, personeel en risico\'s tijdens een overgangsperiode, met iemand die direct verantwoording aflegt.',
  },
];

const aanpak = [
  {
    number: '01',
    title: 'Snelle intake, scherp beeld',
    description:
      'Binnen de eerste weken breng ik de organisatie in kaart: de financiële positie, de mensen, de risico\'s en de verwachtingen van de Raad van Toezicht. Geen langdurig onderzoek, maar een helder beeld van waar ik op moet sturen.',
    resultaat: 'Een concreet beeld van de organisatie en de prioriteiten voor de eerste honderd dagen.',
  },
  {
    number: '02',
    title: 'Rust en regie',
    description:
      'Ik neem de bestuurlijke verantwoordelijkheid over: aansturing van het team, verantwoording aan de Raad van Toezicht, contact met gemeenten, fondsen en andere stakeholders. Continuïteit staat voorop, niet mijn eigen agenda.',
    resultaat: 'Een organisatie die blijft draaien, zonder gat in de leiding.',
  },
  {
    number: '03',
    title: 'Bijsturen waar nodig',
    description:
      'Waar de situatie daarom vraagt, stuur ik bij: in de organisatiestructuur, in de manier van werken, of in de relatie met belangrijke partners. Altijd in overleg met de Raad van Toezicht, nooit op eigen houtje.',
    resultaat: 'Duidelijke keuzes in plaats van een organisatie die op de automatische piloot draait.',
  },
  {
    number: '04',
    title: 'Overdracht',
    description:
      'Zodra er een vaste opvolger is, of de organisatie de transitie doorstaan heeft, draag ik gestructureerd over. Met een overdrachtsdocument en, waar nodig, een periode van gezamenlijk optrekken met de opvolger.',
    resultaat: 'Een organisatie die zelfstandig verder kan, met een opvolger die goed geïnformeerd start.',
  },
];

const faqs = [
  {
    question: 'Wanneer huur je een interim manager in?',
    answer:
      'Bij een onverwachte vacature of vertrek in de directie, ziekte van een bestuurder, of wanneer een Raad van Toezicht tijdens een fusie, reorganisatie of andere transitie tijdelijk stevige, ervaren leiding nodig heeft die snel kan starten.',
  },
  {
    question: 'Wat is het verschil tussen een interim manager en een interim directeur-bestuurder?',
    answer:
      'Een interim manager stuurt doorgaans een team of afdeling aan binnen een bestaande organisatiestructuur. Een interim directeur-bestuurder draagt de volledige eindverantwoordelijkheid: financiën, personeel, de relatie met de Raad van Toezicht en de koers van de hele organisatie. Ik vervul beide rollen, afhankelijk van wat de situatie vraagt.',
  },
  {
    question: 'Hoe snel is een interim manager inzetbaar?',
    answer:
      'Doorgaans binnen 2 tot 4 weken na het eerste gesprek. Bij urgente situaties, zoals een acuut vertrek, is een sneller startmoment vaak bespreekbaar.',
  },
  {
    question: 'Wat kost een interim manager inhuren?',
    answer:
      'Mijn tarief is €125-€140 per uur, voor maximaal 16-24 uur per week. Een eerste verkennend gesprek is altijd gratis en vrijblijvend, zodat snel duidelijk is of en hoe ik kan helpen.',
  },
  {
    question: 'Wat maakt jou anders dan een interim manager uit een bureau?',
    answer:
      'Ik werk zelfstandig, zonder bureau ertussen — geen extra laag, geen opslag op het tarief. Ik heb zelf 25+ jaar directie-ervaring in het sociaal domein, onder meer bij Stichting de Baan, en zet daarnaast moderne technologie in om sneller grip te krijgen op de organisatie die ik tijdelijk leid.',
  },
];

const stats = [
  { value: '25+', label: 'Jaar directie & management' },
  { value: '700+', label: 'Deelnemers aangestuurd' },
  { value: '180', label: 'Vrijwilligers gemanaged' },
  { value: '16-24', label: 'Uur per week' },
];

export default function InterimManager() {
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
            Interim manager <br className="hidden md:block" />
            <span className="text-gradient">sociaal domein.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Voor welzijnsorganisaties, zorginstellingen en gemeenten die tijdelijk stevige leiding nodig hebben.
          </p>

          <p className="text-lg md:text-xl text-slate-500 mb-6 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Geen dikke adviesrapporten vanaf de zijlijn. Wel een ervaren interim-leider die aan het roer stapt, rust brengt en de organisatie draaiende houdt.
          </p>

          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-12 animate-fade-in-up delay-200">
            {[
              'Ex-Directeur Stichting de Baan',
              'Kwartiermaker C-Beta',
              '25+ jaar ondernemerschap',
            ].map((title, i, arr) => (
              <span key={title} className="flex items-center gap-3 text-[0.75rem] text-slate-400 font-medium uppercase tracking-wide">
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
              <Link href="#voor-wie" className="flex items-center gap-2">
                <Anchor size={18} />
                Herken ik dit?
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              <Link href="/vincent-van-munster" className="flex items-center gap-2">
                CV en trackrecord
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
                Een gat in de directie wacht niet op een werving van drie maanden.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                &ldquo;We hebben iemand nodig die nu binnenstapt, niet over drie maanden.&rdquo;
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Dat hoor ik van Raden van Toezicht op het moment dat een directeur onverwacht vertrekt, langdurig uitvalt, of wanneer een fusie of reorganisatie om leiding vraagt die niet gebonden is aan de politiek van het zittende team. Een reguliere werving kost maanden. Die tijd is er vaak niet.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Dat is het moment waarop je een interim manager nodig hebt.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Iemand die de volledige bestuurlijke verantwoordelijkheid overneemt: financiën, personeel, de relatie met de Raad van Toezicht en de dagelijkse koers. Niet vrijblijvend naast het bestuur, maar aan het roer.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700">
                &ldquo;Ik stap aan boord, pak het stuur over en zorg dat de organisatie blijft draaien — ook als het spannend wordt.&rdquo;
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Quote size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6">Wat een interim manager meebrengt.</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Geen adviesrol, maar bestuurlijke eindverantwoordelijkheid.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-orange-500 rounded-lg text-white"><ShieldCheck size={20} /></div>
                    <div>
                      <div className="font-bold">Continuïteit vanaf dag één</div>
                      <div className="text-xs text-slate-400">Geen gat in de leiding tijdens de overgang</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white"><Scale size={20} /></div>
                    <div>
                      <div className="font-bold">Onafhankelijk van interne politiek</div>
                      <div className="text-xs text-slate-400">Beslissingen op basis van de organisatie, niet van belangen</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                    <div className="p-2 bg-blue-500 rounded-lg text-white"><Users size={20} /></div>
                    <div>
                      <div className="font-bold">Rechtstreekse verantwoording</div>
                      <div className="text-xs text-slate-400">Korte lijnen met de Raad van Toezicht</div>
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
              Wanneer een interim manager
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
            Zoek je juist iemand die een nieuwe werkwijze of AI-functie van de grond af opzet zonder bestaand kader? Dan zoek je waarschijnlijk geen interim manager, maar een{' '}
            <Link href="/kwartiermaker-ai-sociaal-domein" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              kwartiermaker
            </Link>{' '}
            of{' '}
            <Link href="/interim-innovatiemanager" className="text-orange-600 font-semibold underline underline-offset-4 hover:text-orange-700">
              interim innovatiemanager
            </Link>.
          </p>
        </div>
      </section>

      {/* AANPAK */}
      <section id="aanpak" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">Hoe ik werk</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Van intake tot overdracht</h2>
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
                <Image src="/vincent-van-munster.webp" alt="Vincent van Munster — Interim Directeur & Manager" width={112} height={112} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1e293b]" />
            </Link>
            <div className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Over Vincent</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">Wie is Vincent?</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
              Tot oktober 2025 was ik directeur van Stichting De Baan in Haarlem — een welzijnsorganisatie met 180 vrijwilligers, 700+ deelnemers en 70.000+ geluksmomenten per jaar voor mensen met een verstandelijke beperking.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Daarvoor negen jaar voorzitter en directeur van Stichting Philia. Ik ken de bestuurskamer én de werkvloer van binnenuit, en weet wat er nodig is om een organisatie stabiel te houden op het moment dat de leiding wegvalt.
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
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">De vragen die ik het vaakst krijg van Raden van Toezicht en besturen die een interim manager overwegen.</p>
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
              Gat in de directie? <br />
              <span className="text-orange-600">Ik stap in.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
              Je zoekt geen consultant die een rapport schrijft en vertrekt. Je zoekt iemand die de eindverantwoordelijkheid neemt, rust brengt en de organisatie draaiende houdt totdat er een vaste opvolger staat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
              <Button size="lg" onClick={openBookingChat} className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2">
                Drink koffie met Vincent
                <ArrowRight size={18} />
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="/kwartiermaker-ai-sociaal-domein" className="flex items-center gap-2">
                  <Users size={18} />
                  Nieuw op te zetten? Kwartiermaker
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
            description: 'Wat een kwartiermaker precies doet, en hoe dat verschilt van een interim manager of projectleider.',
          },
          {
            title: 'Interim verandermanagement AI sociaal domein',
            href: '/interim-verandermanagement-ai-sociaal-domein',
            description: 'Begeleiding bij AI-adoptie en innovatietrajecten in welzijnsorganisaties, zorg en gemeenten.',
          },
          {
            title: 'Wat ik als kwartiermaker voor jouw organisatie kan betekenen',
            href: '/blog/wat-ik-als-kwartiermaker-kan-betekenen',
            description: 'Een persoonlijk verhaal over kwartiermaken en interim leiderschap in de praktijk.',
          },
          {
            title: 'Programmamanager digitale transformatie inhuren',
            href: '/programmamanager-digitale-transformatie',
            description: 'Voor organisaties die een transformatieprogramma nodig hebben, geen eindverantwoordelijke directeur.',
          },
        ]}
      />
    </>
  );
}
