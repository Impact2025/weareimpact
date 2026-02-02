import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description: 'Cookiebeleid van WeAreImpact. Informatie over welke cookies wij gebruiken en hoe u uw voorkeuren kunt beheren.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 md:mb-8">
            Cookiebeleid
          </h1>

          <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8">
            Laatst bijgewerkt: januari 2025
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8 md:mb-12">
              <p className="text-sm md:text-lg text-slate-700 mb-4 md:mb-6">
                WeAreImpact maakt gebruik van cookies en vergelijkbare technologieen op deze website. In dit cookiebeleid leggen wij uit welke cookies wij gebruiken, waarom we deze gebruiken, en hoe u uw voorkeuren kunt beheren.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                1. Wat zijn cookies?
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u een website bezoekt. Ze worden veel gebruikt om websites goed te laten functioneren, de gebruikerservaring te verbeteren en informatie te verzamelen over het gebruik van de website.
              </p>
              <p className="text-sm md:text-base text-slate-700">
                Er zijn verschillende soorten cookies:
              </p>
              <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base text-slate-700 mt-4">
                <li><strong>Sessiecookies:</strong> Tijdelijke cookies die worden verwijderd wanneer u uw browser sluit.</li>
                <li><strong>Permanente cookies:</strong> Cookies die op uw apparaat blijven staan totdat ze verlopen of u ze verwijdert.</li>
                <li><strong>First-party cookies:</strong> Cookies die door onze website worden geplaatst.</li>
                <li><strong>Third-party cookies:</strong> Cookies die door externe diensten worden geplaatst.</li>
              </ul>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                2. Welke cookies gebruiken wij?
              </h2>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 md:mt-8 mb-3 md:mb-4">
                2.1 Strikt noodzakelijke cookies
              </h3>
              <p className="text-sm md:text-base text-slate-700 mb-4 md:mb-6">
                Deze cookies zijn essentieel voor het functioneren van de website. Zonder deze cookies kunnen bepaalde functies niet werken.
              </p>

              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3 mb-6">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2 break-all">__vercel_live_token</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Sessie-authenticatie</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> Sessie</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">admin_session</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Admin login sessie</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 7 dagen</div>
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Cookie</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Doel</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">__vercel_live_token</td>
                      <td className="border-2 border-slate-300 p-3">Sessie-authenticatie</td>
                      <td className="border-2 border-slate-300 p-3">Sessie</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">admin_session</td>
                      <td className="border-2 border-slate-300 p-3">Admin login sessie</td>
                      <td className="border-2 border-slate-300 p-3">7 dagen</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 md:mt-8 mb-3 md:mb-4">
                2.2 Functionele cookies
              </h3>
              <p className="text-sm md:text-base text-slate-700 mb-4 md:mb-6">
                Deze cookies onthouden uw voorkeuren en keuzes om uw ervaring te verbeteren.
              </p>

              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3 mb-6">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">chat_session</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Chatgeschiedenis behouden tijdens sessie</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> Sessie</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">cookie_consent</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Onthouden van uw cookievoorkeuren</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 1 jaar</div>
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Cookie</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Doel</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">chat_session</td>
                      <td className="border-2 border-slate-300 p-3">Chatgeschiedenis behouden tijdens sessie</td>
                      <td className="border-2 border-slate-300 p-3">Sessie</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">cookie_consent</td>
                      <td className="border-2 border-slate-300 p-3">Onthouden van uw cookievoorkeuren</td>
                      <td className="border-2 border-slate-300 p-3">1 jaar</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 md:mt-8 mb-3 md:mb-4">
                2.3 Analytische cookies
              </h3>
              <p className="text-sm md:text-base text-slate-700 mb-4 md:mb-6">
                Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken. Wij gebruiken Google Analytics met geanonimiseerde IP-adressen.
              </p>

              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3 mb-6">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">_ga</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Google Analytics - onderscheiden van gebruikers</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 2 jaar</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">_ga_*</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Google Analytics 4 - sessie-ID</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 2 jaar</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">_gid</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Google Analytics - onderscheiden van gebruikers</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 24 uur</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-base mb-2">_gat</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Google Analytics - verzoeksnelheid beperken</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 1 minuut</div>
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Cookie</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Doel</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">_ga</td>
                      <td className="border-2 border-slate-300 p-3">Google Analytics - onderscheiden van gebruikers</td>
                      <td className="border-2 border-slate-300 p-3">2 jaar</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">_ga_*</td>
                      <td className="border-2 border-slate-300 p-3">Google Analytics 4 - sessie-ID</td>
                      <td className="border-2 border-slate-300 p-3">2 jaar</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">_gid</td>
                      <td className="border-2 border-slate-300 p-3">Google Analytics - onderscheiden van gebruikers</td>
                      <td className="border-2 border-slate-300 p-3">24 uur</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-mono font-semibold text-sm">_gat</td>
                      <td className="border-2 border-slate-300 p-3">Google Analytics - verzoeksnelheid beperken</td>
                      <td className="border-2 border-slate-300 p-3">1 minuut</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 md:mt-8 mb-3 md:mb-4">
                2.4 Marketing cookies
              </h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Wij gebruiken momenteel <strong>geen</strong> marketing of tracking cookies voor advertenties. Wij geloven in privacy-first en tonen geen gepersonaliseerde advertenties.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                3. Externe diensten
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Onze website maakt gebruik van enkele externe diensten die mogelijk cookies kunnen plaatsen:
              </p>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">Google Analytics</h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Wij gebruiken Google Analytics om inzicht te krijgen in het bezoekersgedrag. IP-adressen worden geanonimiseerd en wij hebben een verwerkersovereenkomst met Google gesloten. Gegevens worden niet gedeeld met Google voor advertentiedoeleinden.
              </p>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                U kunt Google Analytics cookies uitschakelen via de <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">Vercel</h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Onze website wordt gehost op Vercel. Vercel kan technische cookies plaatsen voor de werking en beveiliging van de website.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                4. Uw keuzes
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                U heeft verschillende mogelijkheden om cookies te beheren:
              </p>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">Browserinstellingen</h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                U kunt via uw browserinstellingen cookies weigeren of verwijderen. Hieronder vindt u links naar instructies voor veelgebruikte browsers:
              </p>
              <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base text-slate-700">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/nl-nl/windows/cookies-verwijderen-en-beheren-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Microsoft Edge</a></li>
              </ul>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">Google Analytics uitschakelen</h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Installeer de <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google Analytics Opt-out Browser Add-on</a> om tracking door Google Analytics te voorkomen.
              </p>

              <div className="p-3 md:p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r mt-4 md:mt-6">
                <p className="text-sm md:text-base text-slate-700">
                  <strong>Let op:</strong> Het uitschakelen van cookies kan invloed hebben op de werking van bepaalde functies op onze website, zoals de chatbot en het plannen van afspraken.
                </p>
              </div>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                5. Local Storage
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Naast cookies gebruiken wij ook Local Storage (lokale opslag in uw browser) voor:
              </p>
              <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base text-slate-700">
                <li><strong>Chatgeschiedenis:</strong> Om uw gesprekken met de AI-assistent te bewaren tijdens uw sessie.</li>
                <li><strong>Formuliergegevens:</strong> Om ingevulde gegevens tijdelijk te bewaren bij navigatie.</li>
              </ul>
              <p className="text-sm md:text-base text-slate-700 mt-4">
                Local Storage data wordt niet naar onze servers verzonden en blijft op uw apparaat. U kunt Local Storage wissen via uw browserinstellingen.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                6. Updates van dit beleid
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Wij kunnen dit cookiebeleid van tijd tot tijd aanpassen, bijvoorbeeld wanneer wij nieuwe functionaliteiten toevoegen of wanneer wet- en regelgeving wijzigt. De meest recente versie is altijd beschikbaar op deze pagina met vermelding van de datum van de laatste update.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                7. Vragen?
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Heeft u vragen over ons cookiebeleid? Neem dan contact met ons op:
              </p>
            </section>

            <section className="p-4 md:p-6 bg-slate-100 rounded-lg">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                Contact
              </h2>
              <div className="text-sm md:text-base text-slate-700 space-y-2">
                <p><strong>WeAreImpact</strong></p>
                <p>Vincent van Munster</p>
                <p>E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline break-all">v.munster@weareimpact.nl</a></p>
                <p>Telefoon: <a href="tel:+31614470977" className="text-orange-600 hover:underline">+31 6 1447 0977</a></p>
              </div>
            </section>
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-xs md:text-sm">
              Zie ook onze <Link href="/voorwaarden" className="text-orange-600 hover:underline">Algemene Voorwaarden</Link> en <Link href="/privacy" className="text-orange-600 hover:underline">Privacyverklaring</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
