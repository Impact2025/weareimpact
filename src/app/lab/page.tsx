'use client';

import { useState } from 'react';
import { Blocks, Calendar, Lightbulb, Mail, MapPin, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AILabSlideshow } from '@/components/lab/AILabSlideshow';

// Existing content preserved
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
    icon: Sparkles,
    title: 'Verslaglegging',
    description: 'Van ruwe notities of een LEGO-bouwwerk naar een leesbaar verslag of plan, in de eigen stijl van de organisatie.',
  },
  {
    icon: MessageSquare,
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

export default function AILabPage() {
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
            AI als persoonlijke <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600">hefboom</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Vandaag bouwde je met LEGO Serious Play je grootste administratieve frictie, of je ideale
            AI-collega. Hieronder vind je de volledige slideshow, prompt-templates en een
            interactieve afsluipagina waar je direct met Iris kunt chatten of je bouwwerk via WhatsApp deelt.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={16} className="text-orange-500" />
              31 augustus 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} className="text-orange-500" />
              CIC Rotterdam
            </span>
          </div>
        </div>
      </section>

      {/* Slideshow */}
      <section className="py-0">
        <AILabSlideshow />
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
              <div
                key={idx}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
              >
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
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('openIrisChat', {
                  detail: { prompt: 'Plan een 1-op-1 AI-verkenning met Vincent' },
                })
              )
            }
            className="px-8 py-6 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 text-lg"
          >
            <Calendar className="mr-2" size={20} />
            Plan een gesprek met Vincent
          </Button>
          <div className="mt-6">
            <Link
              href="/contact"
              className="text-sm text-slate-400 hover:text-orange-400 transition-colors"
            >
              Of stuur een e-mail — we reageren binnen 24 uur
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
