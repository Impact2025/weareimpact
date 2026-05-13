'use client';

import Link from 'next/link';
import { Coffee, CheckCircle, Cpu, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvents } from '@/components/analytics';

export function Contact() {
  const openBookingChat = () => {
    trackEvents.ctaClick('plan_koffie', 'contact_section');
    window.dispatchEvent(new CustomEvent('openBooking'));
  };

  const handleCallClick = () => {
    trackEvents.ctaClick('bel_direct', 'contact_section');
  };

  return (
    <section id="contact" className="py-24 bg-[#FDFBF7]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />

          <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">
            Partnerships
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
            Jouw organisatie, <br />
            <span className="text-orange-600">90 dagen van nu.</span>
          </h2>

          <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
            Je zoekt geen manager die vergaderingen vult. Je zoekt iemand die
            in 90 dagen zichtbaar resultaat boekt — en daarna zorgt dat jouw
            team het zelf kan. Dat is wat ik doe.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 flex-wrap">
            <Button
              size="lg"
              onClick={openBookingChat}
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
            >
              <Coffee size={20} />
              Plan een koffiemoment
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all"
            >
              <Link href="/#scan" className="flex items-center gap-2">
                <Cpu size={18} />
                Doe de gratis AI-scan
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all"
            >
              <Link href="/impact-calculator" className="flex items-center gap-2">
                <BarChart3 size={18} />
                Bereken mijn impact
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
