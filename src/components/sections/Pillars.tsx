'use client';

import { Brain, Rocket, Lightbulb, Blocks, ArrowRight } from 'lucide-react';

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function Pillars() {
  return (
    <section id="pijlers" className="py-32 bg-[#FDFBF7]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-3">
            Mijn Expertise
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Drie motoren voor groei
          </h3>
          <p className="text-slate-600 text-lg">
            Van strategisch advies tot hands-on tech ontwikkeling en impactvolle
            workshops. Een integrale aanpak.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-8 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Brain size={28} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Interim & Advies</h4>
              <p className="text-slate-600 mb-6 leading-relaxed">
                The Funding Engine. Ik maak uw organisatie AI-ready en
                implementeer strategisch beleid.
              </p>
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center gap-2 text-slate-900 font-semibold group-hover:text-orange-600 transition-all duration-300"
              >
                <span className="relative">
                  Ontdek meer
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform origin-left transition-transform duration-300 scale-x-100 group-hover:scale-x-100" />
                </span>
                <ArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Pillar 2 - Featured */}
          <div className="group bg-slate-900 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden text-white transform md:-translate-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-white mb-8 shadow-sm group-hover:bg-white group-hover:text-slate-900 transition-colors">
                <Rocket size={28} />
              </div>
              <h4 className="text-2xl font-bold mb-4">DAAR & Tech</h4>
              <p className="text-slate-300 mb-6 leading-relaxed">
                The Growth Engine. Ik bouw schaalbare tech-oplossingen.
                Recurring impact.
              </p>
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center gap-2 text-white font-semibold group-hover:text-orange-300 transition-all duration-300"
              >
                <span className="relative">
                  Bekijk oplossingen
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform origin-left transition-transform duration-300 scale-x-100" />
                </span>
                <ArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-8 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Lightbulb size={28} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Ventures & LSP</h4>
              <p className="text-slate-600 mb-6 leading-relaxed">
                The Playground. Van high-end LEGO&reg; Serious Play sessies tot
                innovatieve concepten die de wereld mooier maken.
              </p>
              <ul className="space-y-1 text-sm text-slate-500 mb-6">
                <li className="flex items-center gap-2">
                  <Blocks size={14} className="text-orange-500" /> LEGO&reg;
                  Serious Play
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  Teambuilding met Impact
                </li>
              </ul>
              <button
                onClick={() => scrollToSection('ventures')}
                className="inline-flex items-center gap-2 text-slate-900 font-semibold group-hover:text-orange-600 transition-all duration-300"
              >
                <span className="relative">
                  Ontdek ventures
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform origin-left transition-transform duration-300 scale-x-100" />
                </span>
                <ArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
