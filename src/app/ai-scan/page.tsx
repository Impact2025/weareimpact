'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  Clock,
  Sparkles,
  BarChart3,
  ChevronDown,
  Zap,
  Shield,
  Target,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScannerSection } from '@/components/sections/ScannerSection';

const voordelen = [
  {
    icon: Target,
    title: 'Sector-specifiek advies',
    description:
      'Geen generiek verhaal. De scan past zich aan op jouw sector — zorg, welzijn, gemeente of non-profit — en geeft advies dat aansluit bij jouw werkelijkheid.',
  },
  {
    icon: Zap,
    title: 'Direct resultaat',
    description:
      'Geen wachttijd. Na 5 vragen ontvang je meteen een gepersonaliseerde analyse met concrete kansen en aanbevolen eerste stappen.',
  },
  {
    icon: Shield,
    title: 'Geen technische kennis nodig',
    description:
      'De scan is gemaakt voor bestuurders, directeuren en managers — niet voor IT\'ers. Toegankelijk, helder en direct toepasbaar.',
  },
  {
    icon: Brain,
    title: 'AI-gestuurde analyse',
    description:
      'De scan gebruikt AI om jouw antwoorden te vertalen naar relevante inzichten. Geen vaste antwoorden, maar echte analyse op maat.',
  },
];

const faqs = [
  {
    question: 'Wat is een AI Readiness Scan?',
    answer:
      'Een AI Readiness Scan brengt in kaart hoe ver jouw organisatie is met AI en waar de concrete kansen liggen. De scan is afgestemd op jouw sector en geeft direct praktisch advies — geen buzzwords, maar acties die je morgen kunt oppakken.',
  },
  {
    question: 'Hoe lang duurt de scan?',
    answer:
      'De scan duurt ongeveer 5 minuten. Je beantwoordt een paar gerichte vragen over jouw sector, uitdagingen en huidige AI-gebruik. Direct daarna ontvang je een gepersonaliseerd rapport.',
  },
  {
    question: 'Voor wie is de scan bedoeld?',
    answer:
      'De scan is specifiek ontwikkeld voor sociale organisaties: welzijnsorganisaties, zorginstellingen, gemeenten, stichtingen en non-profits. Je hebt geen technische achtergrond nodig.',
  },
  {
    question: 'Is de scan echt gratis?',
    answer:
      'Ja, volledig gratis en vrijblijvend. Er zijn geen verplichtingen aan verbonden.',
  },
  {
    question: 'Wat gebeurt er na de scan?',
    answer:
      'Je krijgt direct inzicht in de AI-kansen voor jouw organisatie. Wil je daarna dieper ingaan op de resultaten? Dan kun je een gratis gesprek van 30 minuten inplannen om de uitkomsten samen te bespreken.',
  },
];

export default function AIScanPage() {
  const openBookingChat = () => {
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  return (
    <>
      {/* HERO */}
      <header className="relative min-h-[80vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-8">
            <Cpu size={14} /> Gratis AI-scan
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Wat levert AI jouw organisatie{' '}
            <span className="text-gradient">concreet op?</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-2xl mx-auto font-light leading-relaxed">
            Doe de gratis scan en ontdek in 5 minuten waar AI bij jouw organisatie écht waarde toevoegt.
          </p>

          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Geen buzzwords. Sector-specifiek advies afgestemd op jouw uitdagingen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            {[
              { icon: Clock, text: '5 minuten' },
              { icon: CheckCircle, text: 'Gratis & vrijblijvend' },
              { icon: Sparkles, text: 'Direct resultaat' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
                <Icon size={14} className="text-orange-500" />
                {text}
              </span>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2 mx-auto"
          >
            <a href="#scan" className="inline-flex items-center gap-2">
              Start de scan
              <ArrowRight size={18} />
            </a>
          </Button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400">
          <ChevronDown size={24} />
        </div>
      </header>

      {/* DE SCAN */}
      <ScannerSection />

      {/* VOORDELEN */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Wat je krijgt
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Geen generiek rapport. Maar echt inzicht.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {voordelen.map((v) => (
              <div key={v.title} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                  <v.icon size={20} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{v.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT CALCULATOR TEASER */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-slate-900 text-white rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <BarChart3 size={14} /> Gratis Impact Calculator
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Hoeveel waarde laat jouw team nu liggen?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Bereken in 2 minuten hoeveel uren en budget AI kan vrijmaken. Inclusief financiële waarde per jaar.
              </p>
              <Link href="/impact-calculator">
                <Button size="lg" className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/30 inline-flex items-center gap-2 transition-all">
                  <BarChart3 size={18} />
                  Bereken mijn impact
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">Veelgestelde vragen</h2>
          <p className="text-slate-600 text-center mb-12">Alles over de gratis AI Readiness Scan.</p>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-slate-50 border border-slate-200 rounded-lg px-6 overflow-hidden">
                <AccordionTrigger className="text-left hover:no-underline py-5 text-slate-900 font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">
              Meer dan de scan
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 relative z-10">
              Wil je de uitkomsten <br />
              <span className="text-orange-600">samen doornemen?</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-xl mx-auto leading-relaxed">
              Plan een gratis gesprek van 30 minuten. Geen verkooppraatje — gewoon een eerlijk gesprek over wat AI voor jouw organisatie kan betekenen.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Button
                size="lg"
                onClick={openBookingChat}
                className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                Plan een gesprek
                <ArrowRight size={18} />
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                <Link href="/ai-strategie-consultant" className="flex items-center gap-2">
                  <Cpu size={18} />
                  Bekijk AI-strategie diensten
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
