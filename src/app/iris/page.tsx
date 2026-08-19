'use client';

import {
  ArrowRight,
  Mail,
  Calendar,
  Share2,
  MessageSquare,
  ShieldCheck,
  FileText,
  Search,
  Phone,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AGENTS = [
  {
    icon: FileText,
    title: 'Content-agent',
    description: 'Schrijft blogs en artikelen, checkt de SEO-score, zet ze klaar in mijn goedkeuringswachtrij.',
  },
  {
    icon: Search,
    title: 'SEO-agent',
    description: 'Volgt Google Search Console, signaleert stijgers en dalers, spot nieuwe kansen.',
  },
  {
    icon: Mail,
    title: 'Mail-agent',
    description: 'Sorteert en beantwoordt inkomende mail. Twintig seconden per mail in plaats van een avond inbox.',
  },
  {
    icon: Calendar,
    title: 'Agenda-agent',
    description: 'Plant afspraken, checkt conflicten en reistijd, boekt nooit zonder mijn akkoord.',
  },
  {
    icon: MessageSquare,
    title: 'Klantenservice-agent',
    description: 'Beantwoordt vragen van klanten via WhatsApp, escaleert naar mij zodra ze twijfelt.',
  },
  {
    icon: ShieldCheck,
    title: 'Research-agent',
    description: 'Spoort trends en kansen op in de markt, legt ze voor voordat er iets mee gebeurt.',
  },
];

const STATS = [
  { value: '20 sec', label: 'per mail, in plaats van een avond inbox' },
  { value: '96', label: 'artikelen geschreven in 30 dagen' },
  { value: '12', label: 'sites die op hetzelfde systeem draaien' },
  { value: '3 min', label: 'van goedkeuring tot live op de site' },
];

const STARTER_PROMPTS = [
  'Wat kan Iris betekenen voor een welzijnsorganisatie?',
  'Plan een kennismaking in met Vincent.',
  'Doe een korte AI-scan voor mijn team.',
];

const WHATSAPP_NUMBER = '31626760739';

export default function IrisPage() {
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
              Geen chatbot die wat terugkletst. Een AgentOS dat administratieve rompslomp wegneemt, zodat jij weer toekomt aan de mensen om wie het gaat.
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
                src="/videos/iris/welcome.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </header>

      {/* 5 PIJLERS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Agents die ik aanstuur
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Iris is de manager. Dit zijn de zes die het werk doen, elke dag.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AGENTS.map((agent) => (
              <div
                key={agent.title}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                  <agent.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{agent.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
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
            Als interim kwartiermaker help ik organisaties in het sociaal domein met een AI-aanpak die bij hen past, geen kant-en-klaar pakket.
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
