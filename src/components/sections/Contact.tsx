import Link from 'next/link';
import { Coffee, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-[#FDFBF7]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />

          <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 relative z-10">
            Voor Zakelijke Klanten
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 relative z-10">
            Huur mij in als <br />
            <span className="text-orange-600">Strategic Innovation Partner</span>
          </h2>

          <p className="text-slate-600 text-lg mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
            Zoek je geen manager die op de winkel past, maar iemand die je
            organisatie in 3 maanden AI-ready maakt? Ik help organisaties met
            strategische innovatie en het implementeren van sociaal beleid.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 font-medium mb-10 relative z-10">
            <CheckCircle size={16} className="text-orange-500" />
            Q1 2026: Nog 2 trajectplekken beschikbaar
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Button
              asChild
              size="lg"
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30"
            >
              <Link
                href="mailto:v.munster@weareimpact.nl"
                className="flex items-center gap-2"
              >
                <Coffee size={20} />
                Plan een koffiemoment
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all"
            >
              <Link href="tel:0614470977">Bel direct</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
