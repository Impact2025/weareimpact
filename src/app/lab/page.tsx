'use client';

import { useState } from 'react';
import {
  Blocks,
  Calendar,
  CheckCircle,
  Copy,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVisitorId } from '@/components/analytics';

// Door Vincent zelf aan te vullen/wijzigen na de sessie — de structuur staat,
// de inhoud is de eerste versie op basis van wat er behandeld wordt.
const USE_CASES = [
  {
    icon: Mail,
    title: 'Mail & intake',
    description: 'Binnenkomende vragen samenvatten en een conceptantwoord klaarzetten, altijd met een menselijke goedkeurknop.',
  },
  {
    icon: Calendar,
    title: 'Agenda & afspraken',
    description: 'Afspraakverzoeken uit mail of app herkennen en als voorstel klaarzetten, inclusief reistijd en conflictcheck.',
  },
  {
    icon: Users,
    title: 'Verslaglegging',
    description: 'Van ruwe notities of een LEGO-bouwwerk naar een leesbaar verslag of plan, in de eigen stijl van de organisatie.',
  },
  {
    icon: Sparkles,
    title: 'Content & subsidies',
    description: 'Een eerste concept voor een artikel, social post of subsidieaanvraag, klaar om door een mens te worden aangescherpt.',
  },
];

const METHOD_STEPS = [
  {
    step: '1',
    title: 'Bouw de frictie',
    description: 'Met LEGO, niet met woorden. Het bouwwerk dwingt je concreet te worden over wat er nu misgaat, in plaats van er in vage termen over te praten.',
  },
  {
    step: '2',
    title: 'Vertaal naar een agent',
    description: 'Elk bouwwerk wijst naar een taak die een AI-agent kan overnemen: het eerste concept maken, niet het laatste woord hebben.',
  },
  {
    step: '3',
    title: 'Trek de grens',
    description: 'De belangrijkste vraag is niet wat de agent kan overnemen, maar welke stap een mens moet blijven doen — en waarom het misgaat als je dat te snel loslaat.',
  },
];

const PROMPT_TEMPLATES = [
  {
    title: 'Frictie in kaart brengen',
    prompt:
      'Ik werk bij [organisatie] in het sociaal domein. Mijn grootste terugkerende tijdvreter is [taak]. Beschrijf in 3 stappen hoe een AI-assistent het eerste concept zou kunnen maken, en welke stap ik zelf moet blijven controleren.',
  },
  {
    title: 'Mail of verslag samenvatten',
    prompt:
      'Vat onderstaande mail/verslag samen in 3 zinnen: wat wordt er gevraagd, wat is de deadline, en wat is mijn voorgestelde reactie? [plak tekst]',
  },
  {
    title: 'Van bouwwerk naar plan',
    prompt:
      'Dit is wat mijn team net met LEGO bouwde: [beschrijf het bouwwerk]. Welke concrete AI-agent zou dit probleem oplossen, wat neemt die over, en wat blijft mensenwerk?',
  },
];

function CopyableTemplate({ title, prompt }: { title: string; prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Klembord niet beschikbaar (bv. geen HTTPS-context) — negeer stil,
      // de tekst staat gewoon zichtbaar op de pagina om te selecteren.
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Gekopieerd' : 'Kopieer'}
        </button>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-lg p-3">
        {prompt}
      </p>
    </div>
  );
}

export default function AILeadershipLabPage() {
  const [email, setEmail] = useState('');
  const [naam, setNaam] = useState('');
  const [organisatie, setOrganisatie] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const openIrisChat = (prompt?: string) => {
    window.dispatchEvent(new CustomEvent('openIrisChat', { detail: prompt ? { prompt } : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/workshop-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, naam, organisatie, visitorId: getVisitorId() }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setIsUnlocked(true);
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-white">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-slate-200/40 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm mb-6">
            <Blocks className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 font-medium">AI Leadership Lab · WeAreImpact × Grantmaster</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Van LEGO-bouwwerk naar je eigen <span className="text-gradient">AI-agent</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Vandaag bouwde je met LEGO Serious Play je grootste administratieve frictie, of je ideale
            AI-collega. Hier staan de prompt-templates en voorbeelden uit de sessie, zodat je er
            morgen zelf mee verder kunt.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={16} className="text-orange-500" />
              27 augustus 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} className="text-orange-500" />
              CIC Rotterdam
            </span>
          </div>
        </div>
      </section>

      {/* Method: van bouwwerk naar agent */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              De methode
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Waarom we eerst bouwden, en pas daarna praatten
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {METHOD_STEPS.map((s) => (
              <div key={s.step} className="text-center md:text-left">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center mb-4 mx-auto md:mx-0">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Behandelde use cases
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Waar AI-agents vandaag al het verschil maken
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {USE_CASES.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-3 bg-orange-50 rounded-xl shrink-0">
                  <item.icon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gated: prompt templates */}
      <section id="materialen" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-[#FDFBF7] rounded-[2.5rem] p-8 md:p-12 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  <Lightbulb size={14} />
                  Prompt-templates
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  {isUnlocked ? 'Hier zijn ze' : 'Laat je e-mailadres achter'}
                </h2>
                <p className="text-slate-600">
                  {isUnlocked
                    ? 'We hebben ze ook naar je mailadres gestuurd, samen met een link naar deze pagina.'
                    : 'Dan krijg je de templates direct te zien én in je inbox — met een korte, persoonlijke follow-up van Vincent.'}
                </p>
              </div>

              {!isUnlocked && (
                <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto mb-2">
                  <Input
                    type="email"
                    placeholder="Je e-mailadres"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-6 text-base rounded-xl border-slate-200"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Naam (optioneel)"
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      className="py-6 text-base rounded-xl border-slate-200"
                    />
                    <Input
                      type="text"
                      placeholder="Organisatie (optioneel)"
                      value={organisatie}
                      onChange={(e) => setOrganisatie(e.target.value)}
                      className="py-6 text-base rounded-xl border-slate-200"
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full px-8 py-6 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Even geduld...
                      </>
                    ) : (
                      'Bekijk de templates'
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Geen spam. Alleen deze hand-outs en eventueel een persoonlijke reactie van Vincent.
                  </p>
                </form>
              )}

              {isUnlocked && (
                <div className="space-y-4 mt-6">
                  {PROMPT_TEMPLATES.map((t, idx) => (
                    <CopyableTemplate key={idx} title={t.title} prompt={t.prompt} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Facilitators */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-block px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            Vraag het gerust na
          </div>
          <p className="text-slate-600 leading-relaxed">
            Loop je vast op een van de templates, of wil je je eigen bouwwerk nog eens doorpraten?
            Vincent en André hielpen je vandaag al verder tijdens de sessie, en staan ook nu voor je klaar.
          </p>
        </div>
      </section>

      {/* CTA: 1-op-1 */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <MessageSquare className="w-10 h-10 text-orange-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Wil je dit vertalen naar jouw organisatie?
          </h3>
          <p className="text-slate-300 mb-8">
            Plan een gratis 1-op-1 AI-verkenning met Vincent, direct via de chat.
          </p>
          <Button
            size="lg"
            onClick={() => openIrisChat('Plan een 1-op-1 AI-verkenning met Vincent')}
            className="px-8 py-6 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 text-lg"
          >
            <Calendar className="mr-2" size={20} />
            Plan een gesprek met Vincent
          </Button>
        </div>
      </section>
    </>
  );
}
