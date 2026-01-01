import { Blocks, FlaskConical } from 'lucide-react';

const portfolio = [
  {
    id: 'daar',
    initial: 'D',
    name: 'DAAR',
    tagline: 'Grip op Geluk',
    description:
      'Vrijwilligerswerk is de motor van de samenleving. Met DAAR leveren we software die niet alleen administreert, maar waardeert. We maken "Geluksmomenten" meetbaar voor gemeenten en stichtingen.',
    color: 'text-orange-600',
  },
  {
    id: 'bewaard',
    initial: 'BJ',
    name: 'Bewaardvoorjou',
    tagline: 'Levensverhalen voor de Eeuwigheid',
    description:
      'Een empathische AI-tool die ouderen helpt hun levensverhalen vast te leggen. Geen kille database, maar een warme "Life Journey" die generaties verbindt en eenzaamheid tegengaat.',
    color: 'text-blue-500',
  },
];

const labs = [
  {
    id: 'dating',
    initial: 'DA',
    name: 'DatingAssistent',
    tagline: 'Verbinden zonder Ruis',
    description:
      'Tegenwicht aan de wegwerp-cultuur van dating-apps. Met een "Privacy First" aanpak en AI-coach Iris helpen we singles patronen te doorbreken en duurzame relaties te vinden.',
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
        {/* Portfolio Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-3">
            Portfolio
          </h2>
          <h3 className="text-4xl font-bold text-slate-900 mb-6">
            Strategische oplossingen voor organisaties.
          </h3>
          <p className="text-lg text-slate-600">
            Bewezen digitale ecosystemen die echte maatschappelijke impact maken
            voor gemeenten, stichtingen en zorginstellingen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {portfolio.map((venture) => (
            <div
              key={venture.id}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm ${venture.color} font-bold`}
                >
                  {venture.initial}
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  {venture.name}
                </h4>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {venture.tagline}
              </div>
              <p className="text-slate-600">{venture.description}</p>
            </div>
          ))}
        </div>

        {/* Labs Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <FlaskConical size={14} />
            Labs
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Experimentele concepten.
          </h3>
          <p className="text-slate-500">
            Proof-of-concepts die onze filosofie in de praktijk brengen.
            Innovatieve ideeën in ontwikkeling.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {labs.map((venture) => (
            <div
              key={venture.id}
              className="bg-slate-50/50 p-8 rounded-3xl border border-dashed border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm ${venture.color} font-bold`}
                >
                  {venture.icon ? (
                    <venture.icon size={20} />
                  ) : (
                    venture.initial
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {venture.name}
                  </h4>
                  <span className="text-xs text-slate-400">In ontwikkeling</span>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {venture.tagline}
              </div>
              <p className="text-slate-500">{venture.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
