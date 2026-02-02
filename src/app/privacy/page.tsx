import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description: 'Privacyverklaring van WeAreImpact. Lees hoe wij omgaan met uw persoonsgegevens conform de AVG/GDPR.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 md:mb-8">
            Privacyverklaring
          </h1>

          <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8">
            Laatst bijgewerkt: januari 2025
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8 md:mb-12">
              <p className="text-sm md:text-lg text-slate-700 mb-4 md:mb-6">
                WeAreImpact, vertegenwoordigd door Vincent van Munster, hecht groot belang aan de privacy van bezoekers en klanten. Wij behandelen persoonsgegevens vertrouwelijk en zorgvuldig, conform de Algemene Verordening Gegevensbescherming (AVG/GDPR).
              </p>
              <p className="text-sm md:text-lg text-slate-700 mb-4 md:mb-6 p-3 md:p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r">
                <strong>&ldquo;Ik verkoop geen data, ik verkoop impact.&rdquo;</strong> - Vincent van Munster
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                1. Verantwoordelijke
              </h2>
              <div className="text-sm md:text-base text-slate-700 space-y-2">
                <p><strong>WeAreImpact</strong></p>
                <p>Vincent van Munster</p>
                <p>E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline break-all">v.munster@weareimpact.nl</a></p>
                <p>Telefoon: <a href="tel:+31614470977" className="text-orange-600 hover:underline">+31 6 1447 0977</a></p>
              </div>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                2. Welke gegevens verzamelen wij?
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Wij verzamelen alleen persoonsgegevens die u zelf aan ons verstrekt of die noodzakelijk zijn voor onze dienstverlening:
              </p>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">2.1 Contactgegevens</h3>
              <ul className="list-disc pl-5 md:pl-6 space-y-1 text-sm md:text-base text-slate-700">
                <li>Naam</li>
                <li>E-mailadres</li>
                <li>Telefoonnummer</li>
                <li>Organisatie/bedrijfsnaam</li>
              </ul>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">2.2 Communicatiegegevens</h3>
              <ul className="list-disc pl-5 md:pl-6 space-y-1 text-sm md:text-base text-slate-700">
                <li>Inhoud van berichten via het contactformulier</li>
                <li>Chat-conversaties met onze AI-assistent (Iris)</li>
                <li>E-mailcorrespondentie</li>
              </ul>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">2.3 Technische gegevens</h3>
              <ul className="list-disc pl-5 md:pl-6 space-y-1 text-sm md:text-base text-slate-700">
                <li>IP-adres (geanonimiseerd)</li>
                <li>Browsertype en -versie</li>
                <li>Bezochte pagina&apos;s en klikgedrag</li>
                <li>Verwijzende website</li>
                <li>Datum en tijd van bezoek</li>
              </ul>

              <h3 className="text-lg md:text-xl font-medium text-slate-800 mt-4 md:mt-6 mb-2 md:mb-3">2.4 AI-scan gegevens</h3>
              <ul className="list-disc pl-5 md:pl-6 space-y-1 text-sm md:text-base text-slate-700">
                <li>Organisatie-informatie die u invoert voor de AI-scan</li>
                <li>Scanresultaten en aanbevelingen</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                3. Doeleinden van verwerking
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4 md:mb-6">
                Wij verwerken persoonsgegevens voor de volgende doeleinden:
              </p>

              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Uitvoeren van overeenkomsten</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Grondslag:</span> Uitvoering overeenkomst</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Beantwoorden van vragen</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Grondslag:</span> Gerechtvaardigd belang</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Versturen van nieuwsbrieven</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Grondslag:</span> Toestemming</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Verbeteren van onze website</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Grondslag:</span> Gerechtvaardigd belang</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Facturatie en administratie</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Grondslag:</span> Wettelijke verplichting</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">AI-scan en advies op maat</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Grondslag:</span> Toestemming / Uitvoering</div>
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Doeleinde</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Grondslag</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Uitvoeren van overeenkomsten</td>
                      <td className="border-2 border-slate-300 p-3">Uitvoering overeenkomst</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Beantwoorden van vragen</td>
                      <td className="border-2 border-slate-300 p-3">Gerechtvaardigd belang</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Versturen van nieuwsbrieven</td>
                      <td className="border-2 border-slate-300 p-3">Toestemming</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Verbeteren van onze website</td>
                      <td className="border-2 border-slate-300 p-3">Gerechtvaardigd belang</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Facturatie en administratie</td>
                      <td className="border-2 border-slate-300 p-3">Wettelijke verplichting</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">AI-scan en advies op maat</td>
                      <td className="border-2 border-slate-300 p-3">Toestemming / Uitvoering</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                4. AI-assistent en Chatbot
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Onze website maakt gebruik van een AI-assistent (Iris) voor het beantwoorden van vragen en het plannen van afspraken.
              </p>
              <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base text-slate-700">
                <li><strong>Verwerking:</strong> Chatgesprekken worden verwerkt door OpenRouter/OpenAI om relevante antwoorden te genereren.</li>
                <li><strong>Opslag:</strong> Gesprekken kunnen worden opgeslagen voor kwaliteitsverbetering en leadgeneratie.</li>
                <li><strong>Geen verkoop:</strong> Chatgegevens worden nooit verkocht aan derden.</li>
                <li><strong>Anonimisering:</strong> Voor analyse worden gegevens waar mogelijk geanonimiseerd.</li>
              </ul>
              <p className="text-sm md:text-base text-slate-700 mt-4">
                U kunt altijd verzoeken om verwijdering van uw chatgeschiedenis via <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline break-all">v.munster@weareimpact.nl</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                5. Bewaartermijnen
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4 md:mb-6">
                Wij bewaren persoonsgegevens niet langer dan noodzakelijk:
              </p>

              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Klantgegevens</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 7 jaar na laatste contact (fiscale verplichting)</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Contactformulier berichten</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 2 jaar</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Chat-conversaties</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 1 jaar</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Nieuwsbrief abonnees</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> Tot uitschrijving + 1 jaar</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">AI-scan resultaten</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 2 jaar</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2">Website analytics</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Termijn:</span> 26 maanden (Google Analytics)</div>
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Type gegevens</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Klantgegevens</td>
                      <td className="border-2 border-slate-300 p-3">7 jaar na laatste contact (fiscale verplichting)</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Contactformulier berichten</td>
                      <td className="border-2 border-slate-300 p-3">2 jaar</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Chat-conversaties</td>
                      <td className="border-2 border-slate-300 p-3">1 jaar</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Nieuwsbrief abonnees</td>
                      <td className="border-2 border-slate-300 p-3">Tot uitschrijving + 1 jaar</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">AI-scan resultaten</td>
                      <td className="border-2 border-slate-300 p-3">2 jaar</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-medium">Website analytics</td>
                      <td className="border-2 border-slate-300 p-3">26 maanden (Google Analytics)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                6. Delen met derden
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4 md:mb-6">
                Wij delen persoonsgegevens alleen met derden wanneer dit noodzakelijk is voor onze dienstverlening:
              </p>

              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3 mb-4">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-lg mb-3">Vercel</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Website hosting</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Locatie:</span> EU/VS (Privacy Shield)</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-lg mb-3">Google Analytics</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Website statistieken</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Locatie:</span> EU/VS (SCCs)</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-lg mb-3">OpenRouter/OpenAI</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> AI-chatbot</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Locatie:</span> VS (DPA)</div>
                </div>
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
                  <div className="font-bold text-slate-900 text-lg mb-3">Google Calendar</div>
                  <div className="text-sm text-slate-700 mb-2"><span className="font-medium">Doel:</span> Afspraakplanning</div>
                  <div className="text-sm text-slate-600"><span className="font-medium">Locatie:</span> EU/VS (SCCs)</div>
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Partij</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Doel</th>
                      <th className="border-2 border-slate-700 p-3 text-left font-semibold text-white">Locatie</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-bold">Vercel</td>
                      <td className="border-2 border-slate-300 p-3">Website hosting</td>
                      <td className="border-2 border-slate-300 p-3">EU/VS (Privacy Shield)</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-bold">Google Analytics</td>
                      <td className="border-2 border-slate-300 p-3">Website statistieken</td>
                      <td className="border-2 border-slate-300 p-3">EU/VS (SCCs)</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-bold">OpenRouter/OpenAI</td>
                      <td className="border-2 border-slate-300 p-3">AI-chatbot</td>
                      <td className="border-2 border-slate-300 p-3">VS (DPA)</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="border-2 border-slate-300 p-3 font-bold">Google Calendar</td>
                      <td className="border-2 border-slate-300 p-3">Afspraakplanning</td>
                      <td className="border-2 border-slate-300 p-3">EU/VS (SCCs)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm md:text-base text-slate-700">
                Met alle verwerkers zijn verwerkersovereenkomsten gesloten conform de AVG.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                7. Uw rechten
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Op grond van de AVG heeft u de volgende rechten:
              </p>
              <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base text-slate-700">
                <li><strong>Recht op inzage:</strong> U kunt opvragen welke gegevens wij van u hebben.</li>
                <li><strong>Recht op rectificatie:</strong> U kunt onjuiste gegevens laten corrigeren.</li>
                <li><strong>Recht op verwijdering:</strong> U kunt verzoeken om verwijdering van uw gegevens (&ldquo;recht om vergeten te worden&rdquo;).</li>
                <li><strong>Recht op beperking:</strong> U kunt verwerking tijdelijk laten stopzetten.</li>
                <li><strong>Recht op dataportabiliteit:</strong> U kunt uw gegevens in een gangbaar formaat ontvangen.</li>
                <li><strong>Recht op bezwaar:</strong> U kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.</li>
                <li><strong>Recht op intrekking toestemming:</strong> U kunt eerder gegeven toestemming altijd intrekken.</li>
              </ul>
              <p className="text-sm md:text-base text-slate-700 mt-4">
                Om uw rechten uit te oefenen, stuurt u een e-mail naar <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline break-all">v.munster@weareimpact.nl</a>. Wij reageren binnen 30 dagen op uw verzoek.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                8. Beveiliging
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen:
              </p>
              <ul className="list-disc pl-5 md:pl-6 space-y-2 text-sm md:text-base text-slate-700">
                <li>SSL/TLS-versleuteling op alle pagina&apos;s</li>
                <li>Beveiligde hosting via Vercel met automatische updates</li>
                <li>Beperkte toegang tot persoonsgegevens</li>
                <li>Regelmatige back-ups</li>
                <li>Sterke wachtwoorden en waar mogelijk twee-factor-authenticatie</li>
              </ul>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                9. Cookies
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Voor informatie over het gebruik van cookies verwijzen wij naar ons <Link href="/cookies" className="text-orange-600 hover:underline">Cookiebeleid</Link>.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                10. Minderjarigen
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Onze website en diensten zijn niet gericht op personen jonger dan 16 jaar. Wij verzamelen niet bewust gegevens van minderjarigen. Als u vermoedt dat wij gegevens van een minderjarige hebben verzameld, neem dan contact met ons op.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                11. Wijzigingen
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Wij kunnen deze privacyverklaring aanpassen. De meest actuele versie vindt u altijd op deze pagina. Bij substantiele wijzigingen informeren wij u via de website of per e-mail.
              </p>
            </section>

            <section className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">
                12. Klachten
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem dan eerst contact met ons op. Komen wij er samen niet uit, dan heeft u het recht om een klacht in te dienen bij de <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Autoriteit Persoonsgegevens</a>.
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
              Zie ook onze <Link href="/voorwaarden" className="text-orange-600 hover:underline">Algemene Voorwaarden</Link> en <Link href="/cookies" className="text-orange-600 hover:underline">Cookiebeleid</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
