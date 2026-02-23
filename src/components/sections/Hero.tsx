'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
        {/* Name Tag */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8 animate-fade-in-up hover:border-orange-200 transition-colors cursor-default">
          <span className="font-bold text-slate-900">Vincent van Munster</span>
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
          <span className="text-slate-600 font-medium tracking-wide uppercase text-xs">
            AI Welzijn Expert
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
          Innovatie met een <br className="hidden md:block" />
          <span className="text-gradient">sociaal hart.</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
          Welzijnsorganisaties hebben geen tekort aan goede bedoelingen.
          Wel aan tijd, technologie en de mensen die het verschil maken.
          Ik stap tijdelijk in, implementeer wat werkt, en zorg dat jouw team het zelf kan voortzetten.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
          <Button
            asChild
            size="lg"
            className="px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all group shadow-xl shadow-slate-900/10"
          >
            <Link href="/#ventures" className="flex items-center gap-2">
              Bekijk mijn portfolio
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm"
          >
            <Link href="/#contact">Drink koffie met Vincent</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400">
        <ChevronDown size={24} />
      </div>
    </header>
  );
}
