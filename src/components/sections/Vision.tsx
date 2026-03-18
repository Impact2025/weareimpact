import { Heart, Brain, Quote } from 'lucide-react';

export function Vision() {
  return (
    <section id="visie" className="py-24 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Het Manifest
            </div>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
              Tech die ons menselijker maakt.
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Technologie belooft ons te verbinden. Maar te vaak maakt het ons
              eenzamer, verslaafder en afhankelijker van systemen die ons niet
              kennen en er geen bal om geven wie jij bent.
            </p>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Ik geloof dat het anders kan.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Mijn naam is Vincent van Munster. Ik ben geen standaard
              tech-ondernemer. Ik ben een sociaal architect. Mijn missie is
              helder: ik bouw platforms en processen waarbij technologie mensen
              dichter bij elkaar brengt, niet verder van elkaar af.
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700 mb-6">
              &ldquo;Ik verkoop geen data. Ik verkoop impact. Ik ontwerp geen apps om
              je online te houden, maar tools die je helpen offline te
              leven.&rdquo;
            </div>

            <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-orange-600">Waarom WeAreImpact?</span>{' '}
                &ldquo;We&rdquo; staat niet voor een groot bureau. Het staat voor jou,
                mijn AI-collega&apos;s en een netwerk van mensen die begrijpen wat
                impact écht betekent. Samen, gericht op echte verandering.
              </p>
            </div>
          </div>

          <div className="relative mt-8 md:mt-0">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />

            <div className="relative bg-slate-900 text-white p-10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Quote size={120} />
              </div>
              <h3 className="text-2xl font-bold mb-6">
                Niet efficiënter. Menselijker.
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Ik werk met gemeenten, stichtingen en zorginstellingen die willen
                innoveren zonder de menselijke maat te verliezen.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                  <div className="p-2 bg-orange-500 rounded-lg text-white">
                    <Heart size={20} />
                  </div>
                  <div>
                    <div className="font-bold">Echt Contact</div>
                    <div className="text-xs text-slate-400">
                      Technologie als verbinder
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors cursor-default">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <Brain size={20} />
                  </div>
                  <div>
                    <div className="font-bold">Privacy & Empathie</div>
                    <div className="text-xs text-slate-400">
                      Ethische AI-toepassingen
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
