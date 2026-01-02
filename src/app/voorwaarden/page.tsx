import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description: 'Algemene voorwaarden van WeAreImpact - Vincent van Munster. Lees hier onze leveringsvoorwaarden, aansprakelijkheid en betalingsvoorwaarden.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">
            Algemene Voorwaarden
          </h1>

          <p className="text-slate-600 mb-8">
            Laatst bijgewerkt: januari 2025
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 1 - Definities
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li><strong>WeAreImpact:</strong> WeAreImpact, gevestigd in Nederland, vertegenwoordigd door Vincent van Munster, hierna te noemen &ldquo;Opdrachtnemer&rdquo;.</li>
                <li><strong>Opdrachtgever:</strong> De natuurlijke of rechtspersoon die met WeAreImpact een overeenkomst aangaat.</li>
                <li><strong>Diensten:</strong> Alle werkzaamheden waartoe opdracht is gegeven, of die voortvloeien uit, dan wel direct verband houden met de opdracht, waaronder begrepen: AI-strategieadvies, LEGO Serious Play workshops, interim management, consultancy en digitale dienstverlening.</li>
                <li><strong>Overeenkomst:</strong> Elke afspraak tussen Opdrachtgever en Opdrachtnemer tot het verlenen van Diensten.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 2 - Toepasselijkheid
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes, werkzaamheden, overeenkomsten en leveringen van diensten of producten door of namens WeAreImpact.</li>
                <li>Afwijkingen van deze voorwaarden zijn slechts geldig indien deze uitdrukkelijk schriftelijk zijn overeengekomen.</li>
                <li>De toepasselijkheid van eventuele inkoop- of andere voorwaarden van Opdrachtgever wordt uitdrukkelijk van de hand gewezen.</li>
                <li>Indien een bepaling van deze voorwaarden nietig is of vernietigd wordt, blijven de overige bepalingen volledig van kracht.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 3 - Aanbiedingen en Offertes
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Alle aanbiedingen en offertes van WeAreImpact zijn vrijblijvend, tenzij uitdrukkelijk anders vermeld.</li>
                <li>Een offerte is geldig gedurende 30 dagen na dagtekening, tenzij anders aangegeven.</li>
                <li>WeAreImpact kan niet aan een offerte worden gehouden indien de Opdrachtgever redelijkerwijs had kunnen begrijpen dat de offerte een kennelijke vergissing of verschrijving bevat.</li>
                <li>De in een offerte vermelde prijzen zijn exclusief BTW en andere heffingen van overheidswege, tenzij anders aangegeven.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 4 - Uitvoering van de Overeenkomst
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>WeAreImpact zal de overeenkomst naar beste inzicht en vermogen uitvoeren, overeenkomstig de eisen van goed vakmanschap.</li>
                <li>WeAreImpact heeft het recht bepaalde werkzaamheden te laten verrichten door derden.</li>
                <li>De Opdrachtgever draagt er zorg voor dat alle gegevens en informatie die WeAreImpact nodig heeft, tijdig worden verstrekt.</li>
                <li>WeAreImpact is niet aansprakelijk voor schade die voortvloeit uit onjuiste of onvolledige informatie van de Opdrachtgever.</li>
                <li>Indien de Opdrachtgever in gebreke blijft in de tijdige levering van benodigde informatie, heeft WeAreImpact het recht de uitvoering op te schorten en/of de hieruit voortvloeiende kosten in rekening te brengen.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 5 - Tarieven en Betaling
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Alle tarieven zijn in euro&apos;s en exclusief BTW, tenzij anders vermeld.</li>
                <li>Betaling dient te geschieden binnen 14 dagen na factuurdatum, tenzij schriftelijk anders overeengekomen.</li>
                <li>Bij niet-tijdige betaling is de Opdrachtgever van rechtswege in verzuim en is WeAreImpact gerechtigd de wettelijke handelsrente in rekening te brengen.</li>
                <li>Alle redelijke kosten ter verkrijging van voldoening buiten rechte komen voor rekening van de Opdrachtgever.</li>
                <li>WeAreImpact behoudt zich het recht voor om jaarlijks de tarieven aan te passen.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 6 - LEGO Serious Play Workshops
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>LEGO&reg; is een geregistreerd handelsmerk van de LEGO Group, die deze diensten niet sponsort, autoriseert of onderschrijft.</li>
                <li>Vincent van Munster is gecertificeerd LEGO Serious Play facilitator.</li>
                <li>Annulering van workshops dient minimaal 14 dagen voor de geplande datum schriftelijk te geschieden. Bij latere annulering wordt 50% van het overeengekomen bedrag in rekening gebracht. Bij annulering binnen 48 uur voor aanvang is het volledige bedrag verschuldigd.</li>
                <li>De Opdrachtgever zorgt voor een geschikte locatie met voldoende ruimte voor de workshop.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 7 - AI-diensten en Digitale Producten
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>AI-strategieadvies en digitale diensten worden geleverd op basis van de op dat moment beschikbare technologie en kennis.</li>
                <li>WeAreImpact garandeert niet dat AI-tools of software foutloos werken of aan specifieke verwachtingen voldoen.</li>
                <li>De Opdrachtgever blijft te allen tijde verantwoordelijk voor het gebruik en de implementatie van gegeven adviezen.</li>
                <li>Toegang tot digitale producten of platforms kan worden opgeschort bij niet-nakoming van betalingsverplichtingen.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 8 - Intellectueel Eigendom
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Alle intellectuele eigendomsrechten op door WeAreImpact ontwikkelde materialen, methoden, adviezen en andere documenten berusten bij WeAreImpact.</li>
                <li>De Opdrachtgever verkrijgt een niet-exclusief gebruiksrecht voor het doel waarvoor de materialen zijn verstrekt.</li>
                <li>Het is niet toegestaan materialen te vermenigvuldigen, openbaar te maken of aan derden ter beschikking te stellen zonder voorafgaande schriftelijke toestemming.</li>
                <li>Bij overtreding van dit artikel is de Opdrachtgever een direct opeisbare boete verschuldigd van &euro;5.000 per overtreding, onverminderd het recht van WeAreImpact op volledige schadevergoeding.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 9 - Geheimhouding
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Beide partijen zijn verplicht tot geheimhouding van alle vertrouwelijke informatie die zij in het kader van de overeenkomst van elkaar hebben verkregen.</li>
                <li>Deze verplichting geldt ook na beeindiging van de overeenkomst.</li>
                <li>WeAreImpact mag de naam van de Opdrachtgever vermelden als referentie, tenzij schriftelijk anders overeengekomen.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 10 - Aansprakelijkheid
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>WeAreImpact is slechts aansprakelijk voor directe schade die het rechtstreeks en uitsluitend gevolg is van een aan WeAreImpact toe te rekenen tekortkoming.</li>
                <li>De aansprakelijkheid van WeAreImpact is beperkt tot het bedrag dat in het desbetreffende geval door de aansprakelijkheidsverzekering wordt uitgekeerd, vermeerderd met het eigen risico.</li>
                <li>Indien geen uitkering plaatsvindt, is de aansprakelijkheid beperkt tot maximaal het factuurbedrag van de opdracht waarop de aansprakelijkheid betrekking heeft, met een maximum van &euro;10.000.</li>
                <li>WeAreImpact is nimmer aansprakelijk voor indirecte schade, waaronder begrepen gevolgschade, gederfde winst, gemiste besparingen, schade door bedrijfsstagnatie of reputatieschade.</li>
                <li>De in dit artikel opgenomen beperkingen gelden niet indien de schade te wijten is aan opzet of grove schuld van WeAreImpact.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 11 - Overmacht
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>WeAreImpact is niet gehouden tot het nakomen van enige verplichting indien dit onmogelijk is geworden door overmacht.</li>
                <li>Onder overmacht wordt verstaan: ziekte, brand, natuurrampen, oorlog, overheidsmaatregelen, stakingen, storingen in de levering van energie of internet, en andere omstandigheden buiten de invloedssfeer van WeAreImpact.</li>
                <li>Indien de overmacht langer dan 60 dagen duurt, hebben beide partijen het recht de overeenkomst te ontbinden.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 12 - Beeindiging
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Beide partijen kunnen de overeenkomst schriftelijk opzeggen met inachtneming van een opzegtermijn van 1 maand.</li>
                <li>WeAreImpact is gerechtigd de overeenkomst per direct te ontbinden indien de Opdrachtgever niet aan zijn betalingsverplichtingen voldoet of in staat van faillissement verkeert.</li>
                <li>Bij voortijdige beeindiging door de Opdrachtgever blijven reeds gefactureerde bedragen verschuldigd.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 13 - Klachten
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Klachten over de uitgevoerde werkzaamheden dienen binnen 14 dagen na ontdekking schriftelijk te worden gemeld aan WeAreImpact.</li>
                <li>WeAreImpact zal zich inspannen om klachten binnen 30 dagen af te handelen.</li>
                <li>Het indienen van een klacht schort de betalingsverplichting niet op.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 14 - Toepasselijk Recht en Geschillen
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Op alle overeenkomsten tussen WeAreImpact en de Opdrachtgever is Nederlands recht van toepassing.</li>
                <li>Geschillen zullen in eerste instantie worden beslecht door minnelijk overleg.</li>
                <li>Indien partijen niet tot overeenstemming kunnen komen, worden geschillen voorgelegd aan de bevoegde rechter in het arrondissement waar WeAreImpact is gevestigd.</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Artikel 15 - Wijzigingen
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>WeAreImpact behoudt zich het recht voor deze algemene voorwaarden te wijzigen.</li>
                <li>Wijzigingen treden in werking 30 dagen na bekendmaking of op een latere datum die in de bekendmaking is vermeld.</li>
                <li>Bij wezenlijke wijzigingen worden bestaande Opdrachtgevers hiervan op de hoogte gesteld.</li>
              </ol>
            </section>

            <section className="mb-12 p-6 bg-slate-100 rounded-lg">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Contactgegevens
              </h2>
              <div className="text-slate-700 space-y-2">
                <p><strong>WeAreImpact</strong></p>
                <p>Vincent van Munster</p>
                <p>E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a></p>
                <p>Telefoon: <a href="tel:+31614470977" className="text-orange-600 hover:underline">+31 6 1447 0977</a></p>
                <p>Website: <a href="https://weareimpact.nl" className="text-orange-600 hover:underline">weareimpact.nl</a></p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm">
              Zie ook onze <Link href="/privacy" className="text-orange-600 hover:underline">Privacyverklaring</Link> en <Link href="/cookies" className="text-orange-600 hover:underline">Cookiebeleid</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
