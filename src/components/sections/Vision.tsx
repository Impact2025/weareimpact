import { Heart, Brain, Quote } from 'lucide-react';
import Image from 'next/image';

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
              We leven in een tijdperk van exponentiële technologie. Maar te
              vaak wordt AI ingezet om ons verslaafd te maken aan schermen of om
              onze data te verkopen aan Big Tech.
            </p>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Ik geloof dat het anders kan.
            </p>
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-shrink-0">
                <Image
                  src="/vincent-van-munster.png"
                  alt="Vincent van Munster"
                  width={128}
                  height={128}
                  className="rounded-full border-2 border-orange-200 shadow-lg"
                />
              </div>
              <p className="text-lg text-slate-600 leading-relaxed flex-1">
                Mijn naam is Vincent van Munster. Ik ben geen standaard
                tech-ondernemer. Ik ben een sociaal architect. Mijn missie voor
                2026 is helder: ik ontwerp ecosystemen waarin technologie dient als
                enabler voor echt contact.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-orange-500 italic text-slate-700 mb-6">
              &ldquo;Ik verkoop geen data. Ik verkoop impact. Ik ontwerp geen apps om
              je online te houden, maar tools die je helpen offline te
              leven.&rdquo;
            </div>

            <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-orange-600">Waarom WeAreImpact?</span>{' '}
                Omdat ik niet alleen werk. Samen met jou, mijn AI-collega&apos;s en
                een sterk netwerk van experts maak ik impact. &ldquo;We&rdquo; staat voor
                de kracht van samenwerking &mdash; mens én machine, gericht op
                echte verandering.
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
                Welkom in de toekomst van welzijn.
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Van strategisch advies voor gemeenten tot AI-coaching voor
                singles: ik combineer slimme technologie met menselijke waarden.
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
