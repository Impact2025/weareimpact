export function About() {
  const stats = [
    { value: '15+', label: 'Jaar Ervaring' },
    { value: 'LSP', label: 'Facilitator' },
    { value: 'AI', label: 'Gedreven Aanpak' },
    { value: '∞', label: 'Sociale Impact' },
  ];

  return (
    <section id="over" className="py-24 bg-[#1e293b] text-white">
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <div className="w-24 h-24 bg-slate-600 rounded-full mx-auto mb-8 flex items-center justify-center overflow-hidden ring-4 ring-slate-700 ring-offset-4 ring-offset-slate-900">
          <span className="text-3xl font-bold">VM</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          &ldquo;Ik geloof dat ieder mens een talent heeft en creëer de ruimte
          om dat tot bloei te laten komen.&rdquo;
        </h2>

        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Ik ben Vincent van Munster. Als sociaal ondernemer, bruggenbouwer en
          gecertificeerd{' '}
          <span className="text-orange-400 font-bold">LEGO&reg; Serious Play</span>{' '}
          facilitator combineer ik jarenlange bestuurlijke ervaring met
          creatieve innovatiekracht.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
