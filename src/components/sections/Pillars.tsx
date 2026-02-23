'use client';

import { ArrowRight, Rocket, Zap, Heart, Blocks } from 'lucide-react';

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const cards = [
  {
    number: '01',
    icon: Rocket,
    title: 'In 90 dagen AI-ready',
    description:
      'Je weet dat AI kansen biedt voor jouw organisatie, maar je weet niet waar te beginnen. Of je hebt al plannen die niet van de grond komen. Ik stap tijdelijk in als aanjager, niet als beheerder. Ik analyseer waar AI echt waarde toevoegt, implementeer wat werkt en zorg dat jouw team het zelf kan voortzetten.',
    cta: 'Plan een gesprek',
    target: 'contact',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Meer tijd voor mensen',
    description:
      'Je medewerkers besteden te veel tijd aan rapportages, roosters en e-mails en te weinig aan de mensen om wie het draait. Ik breng AI-automatisering die past bij jouw organisatie: van AI-assistenten per medewerker tot autonome workflows die routinetaken volledig overnemen. Geen experiment, maar een werkende oplossing.',
    cta: 'Bekijk de mogelijkheden',
    target: 'contact',
  },
  {
    number: '03',
    icon: Heart,
    title: 'Technologie die voor mensen werkt',
    description:
      'Je zoekt een digitale oplossing, maar wil niet eindigen met een systeem dat niemand gebruikt. Ik bouw tools die aansluiten op de menselijke maat, van vrijwilligerssoftware tot AI-coaching applicaties. Geen leverancier die vertrekt, maar een partner die begrijpt hoe technologie een welzijnsorganisatie versterkt.',
    cta: 'Vertel mij jouw vraagstuk',
    target: 'contact',
  },
  {
    number: '04',
    icon: Blocks,
    title: 'Beweging waar het vastzit',
    description:
      'Samenwerking loopt stroef, een team trekt niet één kant op, of een verandertraject stuit op weerstand. Met LEGO® Serious Play faciliteer ik sessies die in één dag zichtbaar maken wat maanden vergaderen niet lukt, met concrete afspraken en vervolgstappen die je team zelf in handen neemt.',
    cta: 'Ontdek LEGO® Serious Play',
    target: 'ventures',
  },
];

export function Pillars() {
  return (
    <section id="pijlers" className="py-24 bg-[#FDFBF7]">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">
            WeAreImpact in de praktijk
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            In de praktijk
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.number}
                className="group relative bg-white rounded-3xl p-10 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Animated orange top bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

                {/* Ghost number */}
                <span className="absolute -bottom-4 right-6 text-9xl font-black text-slate-50 select-none leading-none transition-colors duration-500 group-hover:text-orange-50/80">
                  {card.number}
                </span>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-7 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug min-h-[3.5rem] flex items-start">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed mb-8 text-[0.925rem]">
                    {card.description}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => scrollToSection(card.target)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors duration-300"
                  >
                    {card.cta}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
