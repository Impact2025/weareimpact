import { Blocks, FlaskConical, CheckCircle2, Clock } from 'lucide-react';

const portfolio = [
  {
    id: 'daar',
    initial: 'D',
    name: 'DAAR',
    tagline: 'Grip op Geluk',
    description:
      'Vrijwilligerswerk is de motor van de samenleving. Met DAAR lever ik software die niet alleen administreert, maar waardeert. Ik maak "Geluksmomenten" meetbaar voor gemeenten en stichtingen.',
    color: 'text-orange-600',
    accent: 'border-orange-400',
    dot: 'bg-orange-400',
  },
  {
    id: 'bewaard',
    initial: 'BJ',
    name: 'Bewaardvoorjou',
    tagline: 'Levensverhalen voor de Eeuwigheid',
    description:
      'Een empathische AI-tool die ouderen helpt hun levensverhalen vast te leggen. Geen kille database, maar een warme "Life Journey" die generaties verbindt en eenzaamheid tegengaat.',
    color: 'text-blue-500',
    accent: 'border-blue-400',
    dot: 'bg-blue-400',
  },
];

const labs = [
  {
    id: 'dating',
    initial: 'DA',
    name: 'DatingAssistent → Iris',
    tagline: 'Verbinden zonder Ruis',
    description:
      'Wat in 2009 begon als pionierswerk met LiefdevoorIedereen.nl en in 2014 startte als de eerste DatingAssistent, is nu geëvolueerd tot Iris: mijn geavanceerde AI-coach.',
    color: 'text-pink-500',
  },
  {
    id: 'steentje',
    initial: null,
    icon: Blocks,
    name: 'SteentjeBijSteentje',
    tagline: 'Bouwen aan je Relatie',
    description:
      'Omdat liefde een werkwoord is. Een hybride platform dat koppels helpt om letterlijk en figuurlijk weer aan hun relatie te bouwen, ondersteund door LEGO Serious Play workshops.',
    color: 'text-green-500',
  },
];

export function Ventures() {
  return (
    <section id="ventures" className="py-24 bg-white">
      <div className="container mx-auto px-6">

        {/* Portfolio Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <CheckCircle2 size={13} />
            Live in productie
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Platforms die al impact maken
          </h2>
          <p className="text-lg text-slate-600">
            Bewezen digitale ecosystemen voor gemeenten, stichtingen en zorginstellingen.
          </p>
        </div>

        {/* Portfolio Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {portfolio.map((venture) => (
            <div
              key={venture.id}
              className={`bg-white p-8 rounded-3xl border border-slate-100 border-l-4 ${venture.accent} hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm ${venture.color} font-bold text-sm`}
                  >
                    {venture.initial}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 leading-none mb-1">
                      {venture.name}
                    </h4>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {venture.tagline}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${venture.dot} animate-pulse`} />
                  Live
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{venture.description}</p>
            </div>
          ))}
        </div>

        {/* Labs Divider */}
        <div className="relative mb-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-6 flex items-center gap-2 text-slate-400">
              <FlaskConical size={16} />
              <span className="text-sm font-bold uppercase tracking-widest">Labs</span>
            </div>
          </div>
        </div>

        {/* Labs Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Clock size={13} />
            In ontwikkeling
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Experimentele concepten
          </h3>
          <p className="text-slate-600">
            Proof-of-concepts die mijn filosofie in de praktijk brengen.
          </p>
        </div>

        {/* Labs Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {labs.map((venture) => (
            <div
              key={venture.id}
              className="bg-slate-50/60 p-8 rounded-3xl border border-dashed border-slate-200 hover:border-slate-300 transition-all duration-300 opacity-80 hover:opacity-100"
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm ${venture.color} font-bold text-sm`}
                >
                  {venture.icon ? <venture.icon size={20} /> : venture.initial}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 leading-none mb-1">
                    {venture.name}
                  </h4>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {venture.tagline}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed">{venture.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
