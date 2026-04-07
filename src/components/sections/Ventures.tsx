import { FlaskConical, CheckCircle2, Clock, ExternalLink, Bot } from 'lucide-react';

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
    url: null,
    badge: 'Live',
    badgeColor: 'bg-green-50 text-green-700',
    dotColor: 'bg-green-400',
  },
  {
    id: 'teambuildingmetimpact',
    initial: 'TI',
    name: 'Teambuilding met Impact',
    tagline: 'Samen bouwen aan sterke teams én een betere wereld',
    description:
      'Een teamdag die méér is dan gezellig samen zijn. We combineren teamontwikkeling met maatschappelijke betekenis: samenwerken, plezier maken én bijdragen aan een concreet goed doel.',
    color: 'text-teal-600',
    accent: 'border-teal-400',
    dot: 'bg-teal-400',
    url: 'https://teambuildingmetimpact.nl',
    badge: 'Live',
    badgeColor: 'bg-green-50 text-green-700',
    dotColor: 'bg-green-400',
  },
  {
    id: 'bijeen',
    initial: 'BN',
    name: 'Bijeen',
    tagline: 'Evenementen die écht verbinding maken',
    description:
      'Het eerste eventplatform gebouwd voor de welzijnssector. Van vrijwilligersdag tot buurtfestival: organiseer met impact, meet wat je bereikt.',
    color: 'text-amber-600',
    accent: 'border-amber-400',
    dot: 'bg-amber-400',
    url: 'https://bijeen.app',
    badge: 'Live',
    badgeColor: 'bg-green-50 text-green-700',
    dotColor: 'bg-green-400',
  },
];

const labs = [
  {
    id: 'iris',
    initial: null,
    icon: Bot,
    name: 'Iris: AI Werkassistent',
    tagline: 'Jouw team, geautomatiseerd',
    description:
      'Ik heb een AI-werkassistent gebouwd die agenda, mail en rapportages automatiseert. Dit implementeer ik ook voor jouw team. Geen theorie, ik gebruik het zelf dagelijks.',
    color: 'text-violet-500',
  },
  {
    id: 'ictusgo',
    initial: 'IG',
    name: 'IctusGO',
    tagline: 'GPS teambuilding met impact',
    description:
      'IctusGo combineert GPS-avontuur met sociale missies. Voor bedrijven, gezinnen, scholen en voetbalclubs — in 5 varianten die passen bij jouw groep en doel.',
    color: 'text-sky-500',
    url: 'https://ictusgo.nl',
  },
  {
    id: 'brickme',
    initial: 'BM',
    name: 'Brickme',
    tagline: 'Bouw wat je niet kunt zeggen',
    description:
      'Sommige dingen zijn te groot voor woorden. Brickme helpt ze zichtbaar te maken door te bouwen, te fotograferen en een reflectie te ontvangen. Een concept van WeAreImpact.',
    color: 'text-orange-500',
    url: 'https://brickme.nl',
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {portfolio.map((venture) => {
            const inner = (
              <>
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
                  <div className="flex items-center gap-2 shrink-0">
                    {venture.url && (
                      <ExternalLink size={14} className="text-slate-400" />
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${venture.badgeColor} rounded-full text-xs font-semibold`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${venture.dotColor} animate-pulse`} />
                      {venture.badge}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">{venture.description}</p>
              </>
            );
            return venture.url ? (
              <a
                key={venture.id}
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block bg-white p-8 rounded-3xl border border-slate-100 border-l-4 ${venture.accent} hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
              >
                {inner}
              </a>
            ) : (
              <div
                key={venture.id}
                className={`bg-white p-8 rounded-3xl border border-slate-100 border-l-4 ${venture.accent} hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
              >
                {inner}
              </div>
            );
          })}
        </div>

        {/* Labs Divider */}
        <div className="relative mb-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-6 flex items-center gap-2 text-slate-400">
              <FlaskConical size={16} />
              <span className="text-sm font-bold uppercase tracking-widest">In de praktijk</span>
            </div>
          </div>
        </div>

        {/* Labs Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Clock size={13} />
            Ventures &amp; tools
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Wat ik bouw en inzet
          </h3>
          <p className="text-slate-600">
            Van AI-automatisering tot buurtverbinding: concepten die ik zelf gebruik en implementeer.
          </p>
        </div>

        {/* Labs Cards */}
        <div className="grid md:grid-cols-3 gap-6">
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
              {'url' in venture && venture.url && (
                <a
                  href={venture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ExternalLink size={12} />
                  {venture.url.replace('https://', '')}
                </a>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
