'use client';

import { useRef, useState } from 'react';
import {
  ArrowRight,
  Mail,
  Calendar,
  Share2,
  ShieldCheck,
  FileText,
  Phone,
  Quote,
  TrendingUp,
  Users,
  Brain,
  RefreshCw,
  PenLine,
  Eye,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CLUSTERS = [
  {
    icon: Compass,
    title: 'Sparring & communicatie',
    count: 2,
    agents: ['Persoonlijke Sparringpartner & Coach', 'Email Manager'],
    description: 'Mijn eigen dagelijkse klankbord: helpt prioriteiten stellen, bereidt complexe vraagstukken scherp voor en denkt kritisch mee over strategische keuzes. Ernaast sorteert en beantwoordt een tweede agent de inkomende mail, twintig seconden per mail in plaats van een avond inbox.',
  },
  {
    icon: TrendingUp,
    title: 'Markt & inzicht',
    count: 3,
    agents: ['Analytics Analist', 'Radar Trend-Analist', 'GEO Specialist'],
    description: 'Lezen elke dag de cijfers: wat scoort goed bij Google, wat beweegt er bij concurrenten, en hoe vind je ons terug als je AI het antwoord geeft in plaats van een zoekmachine.',
  },
  {
    icon: FileText,
    title: 'Content & publiceren',
    count: 6,
    agents: ['SEO Copywriter', 'SEO Editor', 'Content Editor', 'Content Judge', 'Video Director', 'Social Media Copywriter'],
    description: 'Van eerste concept tot artikel, social post of video. De schrijver en de criticus binnen dit team zijn altijd twee verschillende agents, zodat er nooit één iemand zijn eigen huiswerk nakijkt.',
  },
  {
    icon: Users,
    title: 'Groei & acquisitie',
    count: 4,
    agents: ['Lead Prospect Researcher', 'Outreach Copywriter', 'Outreach Beoordelaar', 'Vacature Fit-Analist'],
    description: 'Zoeken nieuwe klanten, partners en kansen, schrijven het eerste contact, en laten een tweede agent daar altijd overheen kijken vóórdat het mijn goedkeuringswachtrij bereikt.',
  },
];

const STATS = [
  { value: '20 sec', label: 'per mail, in plaats van een avond inbox' },
  { value: '6-8 uur', label: 'tijdwinst per week, per proceseigenaar' },
  { value: '100%', label: 'gecontroleerd door een tweede agent vóór het bij mij komt' },
  { value: '3 min', label: 'van goedkeuring tot live op de site' },
];

const STARTER_PROMPTS = [
  'Wat kan Iris betekenen voor een welzijnsorganisatie?',
  'Plan een kennismaking in met Vincent.',
  'Doe een korte AI-scan voor mijn team.',
];

const WHATSAPP_NUMBER = '31626760739';

export default function IrisPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const openIrisChat = (prompt?: string) => {
    window.dispatchEvent(new CustomEvent('openIrisChat', { detail: prompt ? { prompt } : undefined }));
  };

  const openBooking = () => {
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  return (
    <>
      {/* HERO */}
      <header className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8">
              <span className="font-bold text-slate-900">Iris</span>
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
              <span className="text-slate-600 font-medium tracking-wide uppercase text-xs">
                AI-manager van AgentOS
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Maak kennis met Iris. <br />
              <span className="text-gradient">Mijn AI-manager voor rust, overzicht en impact.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl font-light leading-relaxed">
              Geen chatbot die wat terugkletst. Iris stuurt 15 gespecialiseerde agents aan, onthoudt wat er speelt, en neemt zo de administratieve rompslomp weg die jou weghoudt van de mensen om wie het gaat.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => openIrisChat()}
                className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                Praat met Iris
                <ArrowRight size={18} />
              </Button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hoi Iris, ik heb een vraag over AgentOS.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-full font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all"
              >
                <Phone size={18} />
                Stuur Iris een WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[9/16] max-w-xs mx-auto rounded-3xl overflow-hidden shadow-2xl bg-slate-900">
              <video
                ref={videoRef}
                src="/videos/iris/welcome.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur text-white flex items-center justify-center hover:bg-slate-900/90 transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* WAAROM & ZELF GEBOUWD */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Waarom ik dit zelf bouwde</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
              Geen leverancier. Ik bouw en onderhoud dit systeem zelf.
            </h2>
          </div>
          <div className="space-y-5 text-lg text-slate-600 leading-relaxed font-light max-w-2xl mx-auto">
            <p>
              Als sociaal ondernemer, manager en directeur in het sociaal domein weet ik hoe het voelt als de administratie wint van de mensen om wie het gaat. Ik ben niet begonnen met code, maar met kijken naar mijn eigen werkweek: welk proces kost mij de meeste tijd en energie? Uit die analyse kwamen mijn eerste drie agents, niet gekocht maar gebouwd, en daaruit is Iris gegroeid tot wat ze nu is.
            </p>
            <p>
              Ik gebruik AI niet om mensen te vervangen. Ik gebruik het om ruimte te maken: voor echte gesprekken, voor echte verbinding, voor het werk waarvoor je ooit in het sociaal domein bent begonnen. Dat is ook waarom ik dit systeem eerst op mezelf en mijn eigen projecten heb losgelaten, voordat ik het aan een ander aanbied.
            </p>
          </div>
          <div className="mt-10 bg-slate-900 rounded-2xl p-8 max-w-2xl mx-auto text-center">
            <p className="text-white text-lg font-medium leading-relaxed">
              Iris stelt voor, agents controleren elkaar, maar ik bepaal. Elke autonome actie eindigt vóór publicatie of verzending bij mijn eigen, handmatige klik. Niet omdat het moet van de wet, maar omdat het zo hoort.
            </p>
          </div>
        </div>
      </section>

      {/* DE 15 AGENTS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              De 15 agents die Iris aanstuurt
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Geen los AI-abonnement per taak, maar één team met vaste rollen. Iris verdeelt het werk, elke agent doet zijn eigen ding, elke dag opnieuw. Dit team runt vandaag WeAreImpact zelf; bij een implementatie bij jouw organisatie bouw ik een vergelijkbaar team toegespitst op jouw processen: dossiers, rapportage, verantwoording.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CLUSTERS.map((cluster) => (
              <div
                key={cluster.title}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <cluster.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cluster.title}</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {cluster.count} {cluster.count === 1 ? 'agent' : 'agents'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{cluster.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cluster.agents.map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-medium text-slate-600"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GEHEUGEN */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-6">
                <Brain size={20} className="text-orange-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Eén geheugen voor het hele team
              </h2>
              <p className="text-slate-300 leading-relaxed font-light">
                In de meeste organisaties zit de kennis in het hoofd van één persoon. Zodra die persoon vakantie heeft, druk is of vertrekt, staat het werk stil. Bij Iris zit die kennis in een gedeelde kennisbank waar alle 15 agents uit putten: casuïstiek, merkstem, eerdere beslissingen, wat wel en niet werkte.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-200 font-medium mb-1">Niet per gesprek, maar structureel</p>
                <p className="text-sm text-slate-400 leading-relaxed">Een chatvenster onthoudt niets zodra je het sluit. Iris draait door, ook als jij dat niet doet, en elke agent leest uit dezelfde kennisbank.</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-200 font-medium mb-1">Ook 's nachts actief</p>
                <p className="text-sm text-slate-400 leading-relaxed">Terwijl ik slaap, structureert Iris dossiers en signaleert ze wat morgenochtend mijn aandacht nodig heeft.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIER OGEN */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Het vier-ogen-principe
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Agents controleren agents, vóórdat ik het te zien krijg.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-4">
                <PenLine size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Concept geschreven</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Eén agent levert een eerste versie: artikel, mail of advies.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-4">
                <Eye size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Een andere agent keurt</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Een onafhankelijke criticus beoordeelt op kwaliteit, feiten en merkstem.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-4">
                <RefreshCw size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Herschreven tot het klopt</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Onder de lat? Terug naar de schrijver. Dit kan een paar rondes duren, volledig automatisch.</p>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center">
              <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Pas dan naar mij</h3>
              <p className="text-sm text-slate-300 leading-relaxed">Alleen wat de lat haalt, bereikt de wachtrij. Ik bepaal altijd zelf of iets geplaatst of verstuurd wordt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEER-LUS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Iris rekent zichzelf af
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-light mb-8">
            Bij elke briefing legt Iris een paar concrete verwachtingen vast: dit artikel gaat klimmen, deze aanpak levert meer reacties op. Weken later toetst ze die verwachting aan wat er echt is gebeurd. Klopte het? Dan wint die aanpak vertrouwen. Klopte het niet, drie keer op rij, dan laat ze die aanpak los. Zo leert het systeem van bewijs, niet van herhaling, en wordt Iris' advies elke maand een beetje scherper.
          </p>
        </div>
      </section>

      {/* FILOSOFIE */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Ruimte voor de menselijke maat
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-light">
            AI moet overbelasting en burn-out in het sociaal domein voorkomen, niet vervangen wat mensen samen doen. Iris neemt het werk over dat jou weghoudt van de mensen voor wie je er wilt zijn. Zo krijg je die tijd terug.
          </p>
        </div>
      </section>

      {/* IRIS AAN HET WOORD */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-8">
            <Quote size={20} className="text-orange-400" />
          </div>
          <p className="text-xl md:text-2xl text-white font-light leading-relaxed mb-8">
            "Terwijl hij slaapt, structureer ik dossiers en signaleer ik operationele risico's. Ik leer van mezelf: elke inschatting die ik maak, toets ik later aan wat er echt is gebeurd. En het belangrijkste: er gaat nooit iets de deur uit zonder Vincents definitieve goedkeuring."
          </p>
          <p className="text-slate-400 font-light">
            Vanaf vandaag ben ik ook rechtstreeks bereikbaar, via mijn eigen WhatsApp-nummer.
          </p>
          <p className="text-slate-500 text-sm mt-2">— Iris</p>
        </div>
      </section>

      {/* CIJFERS */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">{s.value}</div>
                <div className="text-sm text-slate-500 font-light">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRAAT MET IRIS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Praat met Iris
          </h2>
          <p className="text-slate-500 mb-10 font-light">
            Stel meteen een vraag, ze denkt met je mee.
          </p>

          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => openIrisChat(prompt)}
                className="w-full text-left px-5 py-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-orange-300 hover:bg-orange-50 transition-all flex items-center justify-between gap-3"
              >
                {prompt}
                <ArrowRight size={16} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
            <Calendar size={14} />
            Interim beschikbaar per 1 september
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Ook zo'n systeem voor jouw organisatie?
          </h2>
          <p className="text-lg text-slate-600 mb-10 font-light max-w-xl mx-auto">
            Wil je zien hoe een AI-team jouw organisatie 5 tot 10 uur per week aan administratie bespaart, volledig gecontroleerd vóórdat er iets de deur uitgaat? Als interim kwartiermaker bouw ik die aanpak op maat, geen kant-en-klaar pakket. Boek een verkenning of test Iris direct.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={openBooking}
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30"
            >
              Koffie met Vincent
            </Button>
            <a
              href="/ai-scan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-full font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all"
            >
              <Share2 size={18} />
              Doe de gratis AI-scan
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
