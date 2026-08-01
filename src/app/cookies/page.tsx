import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description: 'Cookiebeleid van WeAreImpact. Welke cookies wij plaatsen, waarom en hoe u uw voorkeuren beheert.',
  alternates: { canonical: 'https://weareimpact.nl/cookies' },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = 'juni 2026';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Cookiebeleid
          </h1>
          <p className="text-sm md:text-base text-slate-500 mb-8 md:mb-12">
            Versie {LAST_UPDATED} — WeAreImpact (KvK 70285888)
          </p>

          <div className="prose prose-slate max-w-none space-y-10 md:space-y-14">

            {/* Inleiding */}
            <section>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                WeAreImpact gebruikt cookies en vergelijkbare technologieën (zoals Local Storage) op deze website. In dit beleid leggen wij uit welke cookies er worden geplaatst, waarvoor en hoe u uw keuze kunt beheren.
              </p>
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                <p className="text-sm text-slate-700">
                  <strong>Ons uitgangspunt:</strong> Strikt noodzakelijke cookies worden altijd geplaatst. Analytische cookies plaatsen wij pas na uw uitdrukkelijke toestemming via de cookiebanner onderaan de pagina.
                </p>
              </div>
            </section>

            {/* 1. Wat zijn cookies */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                1. Wat zijn cookies?
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                Cookies zijn kleine tekstbestanden die uw browser opslaat op uw apparaat wanneer u een website bezoekt. Ze maken het mogelijk dat een website u herkent bij een volgend bezoek of bepaalde instellingen onthoudt.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { type: 'Sessiecookies', omschrijving: 'Tijdelijk — worden verwijderd zodra u de browser sluit.' },
                  { type: 'Permanente cookies', omschrijving: 'Blijven staan totdat de vervaldatum verstreken is of u ze verwijdert.' },
                  { type: 'First-party cookies', omschrijving: 'Geplaatst door weareimpact.nl zelf.' },
                  { type: 'Third-party cookies', omschrijving: 'Geplaatst door externe diensten (bijv. Google Analytics).' },
                ].map(({ type, omschrijving }) => (
                  <div key={type} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="font-semibold text-slate-900 text-sm mb-1">{type}</div>
                    <div className="text-sm text-slate-600">{omschrijving}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Welke cookies */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                2. Welke cookies gebruiken wij?
              </h2>

              {/* 2.1 Strikt noodzakelijk */}
              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 mb-3">
                2.1 Strikt noodzakelijke cookies
              </h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Deze cookies zijn essentieel voor het functioneren van de website en kunnen niet worden uitgeschakeld. Zij slaan geen informatie op die u identificeerbaar maakt.
              </p>

              <div className="md:hidden space-y-3 mb-6">
                {[
                  { naam: 'cookie_consent', doel: 'Onthoudt uw cookievoorkeur (accepteren/weigeren)', termijn: '1 jaar' },
                  { naam: 'admin_session', doel: 'Admin-loginsessie (alleen voor beheerder)', termijn: '7 dagen' },
                ].map((c) => (
                  <div key={c.naam} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="font-mono font-semibold text-slate-900 text-sm mb-2">{c.naam}</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Doel:</span> {c.doel}</p>
                      <p><span className="font-medium">Bewaard:</span> {c.termijn}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto mb-8">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="border border-slate-700 p-3 text-left font-semibold">Cookie</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Doel</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border border-slate-200 p-3 font-mono font-semibold">cookie_consent</td>
                      <td className="border border-slate-200 p-3">Onthoudt uw cookievoorkeur</td>
                      <td className="border border-slate-200 p-3">1 jaar</td>
                    </tr>
                    <tr className="bg-slate-50 hover:bg-slate-100">
                      <td className="border border-slate-200 p-3 font-mono font-semibold">admin_session</td>
                      <td className="border border-slate-200 p-3">Admin-loginsessie (alleen beheerder)</td>
                      <td className="border border-slate-200 p-3">7 dagen</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2.2 Analytische cookies */}
              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 mb-3">
                2.2 Analytische cookies — alleen na toestemming
              </h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Deze cookies worden uitsluitend geplaatst nadat u toestemming heeft gegeven via de cookiebanner. Ze helpen ons begrijpen hoe bezoekers de website gebruiken. IP-adressen worden geanonimiseerd vóór verwerking.
              </p>

              <div className="md:hidden space-y-3 mb-6">
                {[
                  { naam: '_ga', doel: 'Google Analytics — unieke gebruikers onderscheiden', termijn: '2 jaar' },
                  { naam: '_ga_*', doel: 'Google Analytics 4 — sessie-ID', termijn: '2 jaar' },
                  { naam: '_gid', doel: 'Google Analytics — gebruikers onderscheiden (24u)', termijn: '24 uur' },
                ].map((c) => (
                  <div key={c.naam} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="font-mono font-semibold text-slate-900 text-sm mb-2">{c.naam}</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Doel:</span> {c.doel}</p>
                      <p><span className="font-medium">Bewaard:</span> {c.termijn}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto mb-8">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="border border-slate-700 p-3 text-left font-semibold">Cookie</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Doel</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {[
                      ['_ga', 'Google Analytics — unieke gebruikers onderscheiden', '2 jaar'],
                      ['_ga_*', 'Google Analytics 4 — sessie-ID', '2 jaar'],
                      ['_gid', 'Google Analytics — gebruikers onderscheiden', '24 uur'],
                    ].map(([naam, doel, termijn]) => (
                      <tr key={naam} className="bg-white hover:bg-slate-50 even:bg-slate-50/50">
                        <td className="border border-slate-200 p-3 font-mono font-semibold">{naam}</td>
                        <td className="border border-slate-200 p-3">{doel}</td>
                        <td className="border border-slate-200 p-3 whitespace-nowrap">{termijn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2.3 Marketing */}
              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-6 mb-3">
                2.3 Marketing- en trackingcookies
              </h3>
              <p className="text-sm md:text-base text-slate-700">
                Wij gebruiken <strong>geen</strong> marketing- of trackingcookies voor gepersonaliseerde advertenties.
              </p>
            </section>

            {/* 3. Local Storage */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                3. Local Storage en Session Storage
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                Naast cookies gebruiken wij ook browser-opslag:
              </p>
              <div className="md:hidden space-y-3 mb-4">
                {[
                  { sleutel: 'wai_visitor_id', opslag: 'Local Storage', doel: 'Anonieme bezoeker-ID voor interne analytics (alleen na toestemming)', consent: true },
                  { sleutel: 'wai_session_id', opslag: 'Session Storage', doel: 'Tijdelijke sessie-ID voor interne analytics (zonder toestemming)', consent: false },
                ].map((r) => (
                  <div key={r.sleutel} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="font-mono font-semibold text-slate-900 text-sm mb-2">{r.sleutel}</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Opslag:</span> {r.opslag}</p>
                      <p><span className="font-medium">Doel:</span> {r.doel}</p>
                      <p><span className="font-medium">Vereist toestemming:</span> {r.consent ? 'Ja' : 'Nee (sessie-only)'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto mb-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="border border-slate-700 p-3 text-left font-semibold">Sleutel</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Type opslag</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Doel</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Toestemming</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border border-slate-200 p-3 font-mono font-semibold">wai_visitor_id</td>
                      <td className="border border-slate-200 p-3">Local Storage</td>
                      <td className="border border-slate-200 p-3">Anonieme bezoeker-ID, interne analytics</td>
                      <td className="border border-slate-200 p-3">Ja — persistent na toestemming</td>
                    </tr>
                    <tr className="bg-slate-50 hover:bg-slate-100">
                      <td className="border border-slate-200 p-3 font-mono font-semibold">wai_session_id</td>
                      <td className="border border-slate-200 p-3">Session Storage</td>
                      <td className="border border-slate-200 p-3">Tijdelijke sessie-ID zonder toestemming</td>
                      <td className="border border-slate-200 p-3">Nee — vervalt bij sluiten browser</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-slate-600">
                Local Storage data wordt niet naar onze servers verzonden en blijft op uw apparaat. U kunt het wissen via de ontwikkelaarstools van uw browser.
              </p>
            </section>

            {/* 4. Toestemming beheren */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                4. Uw cookievoorkeur beheren
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                U kunt uw toestemming op elk moment intrekken of aanpassen:
              </p>

              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="font-semibold text-slate-900 mb-2">Via de cookiebanner</div>
                  <p className="text-sm text-slate-700">Kies bij uw eerste bezoek &ldquo;Alleen noodzakelijk&rdquo; of &ldquo;Alles accepteren&rdquo;. Uw keuze wordt 1 jaar bewaard.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="font-semibold text-slate-900 mb-2">Browserinstellingen</div>
                  <p className="text-sm text-slate-700 mb-2">U kunt cookies in uw browser blokkeren of verwijderen:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Apple Safari</a></li>
                    <li><a href="https://support.microsoft.com/nl-nl/windows/cookies-verwijderen-en-beheren-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Microsoft Edge</a></li>
                  </ul>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="font-semibold text-slate-900 mb-2">Google Analytics opt-out</div>
                  <p className="text-sm text-slate-700">
                    Installeer de{' '}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>{' '}
                    om tracking door Google Analytics te voorkomen, ook als u toestemming heeft gegeven.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r">
                <p className="text-sm text-slate-700">
                  <strong>Let op:</strong> Het weigeren van analytische cookies heeft geen invloed op de werking van de website.
                </p>
              </div>
            </section>

            {/* 5. Externe diensten */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                5. Externe diensten
              </h2>

              <h3 className="text-base font-semibold text-slate-800 mb-2">Google Analytics</h3>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Wij gebruiken Google Analytics 4 voor inzicht in bezoekersgedrag. IP-adressen worden geanonimiseerd vóór verwerking. Er is een verwerkersovereenkomst met Google. Gegevens worden niet gedeeld met Google voor advertentiedoeleinden. Google deelt data via het EU-VS Data Privacy Framework.
              </p>

              <h3 className="text-base font-semibold text-slate-800 mb-2">Vercel</h3>
              <p className="text-sm md:text-base text-slate-700">
                Onze website wordt gehost op Vercel. Vercel kan technische cookies plaatsen voor de beveiliging en werking van de hosting-infrastructuur.
              </p>
            </section>

            {/* 6. Wijzigingen */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                6. Wijzigingen
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Wij passen dit cookiebeleid aan als wij nieuwe functionaliteiten toevoegen of als wet- en regelgeving wijzigt. De meest recente versie staat altijd op deze pagina met vermelding van de datum van de laatste update.
              </p>
            </section>

            {/* Contact */}
            <section className="p-5 md:p-6 bg-slate-100 rounded-xl">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-3">Vragen?</h2>
              <div className="text-sm md:text-base text-slate-700 space-y-1">
                <p><strong>WeAreImpact</strong> — Vincent van Munster</p>
                <p>E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a></p>
                <p>Telefoon: <a href="tel:+31614470977" className="text-orange-600 hover:underline">+31 6 1447 0977</a></p>
              </div>
            </section>

          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-xs md:text-sm">
              Zie ook onze{' '}
              <Link href="/voorwaarden" className="text-orange-600 hover:underline">Algemene Voorwaarden</Link>{' '}
              en{' '}
              <Link href="/privacy" className="text-orange-600 hover:underline">Privacyverklaring</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
