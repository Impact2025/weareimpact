import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description: 'Algemene voorwaarden van WeAreImpact — Vincent van Munster. KvK 70285888.',
  robots: { index: true, follow: true },
};

const LAST_UPDATED = 'juni 2026';

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Algemene Voorwaarden
          </h1>
          <p className="text-sm md:text-base text-slate-500 mb-8 md:mb-12">
            Versie {LAST_UPDATED} — WeAreImpact (KvK 70285888)
          </p>

          <div className="prose prose-slate max-w-none space-y-10">

            {/* Art. 1 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 1 — Identiteit en definities</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>
                  <strong>Opdrachtnemer:</strong> WeAreImpact, eenmanszaak van Vincent van Munster, gevestigd te Nieuw-Vennep / Hoofddorp, Nederland. KvK-nummer 70285888. BTW-nummer NL858236369B01. E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a>.
                </li>
                <li><strong>Opdrachtgever:</strong> De natuurlijke of rechtspersoon die met WeAreImpact een overeenkomst aangaat of een offerte aanvraagt.</li>
                <li><strong>Diensten:</strong> Alle werkzaamheden en producten waartoe opdracht is gegeven, waaronder AI-strategieadvies, change management, programmamanagement digitale transformatie, LEGO® Serious Play workshops, interim management, kennisoverdracht, e-learnings en digitale dienstverlening.</li>
                <li><strong>Schriftelijk:</strong> Communicatie per e-mail voldoet aan het vereiste van schriftelijkheid, tenzij een specifieke bepaling anders vereist.</li>
                <li><strong>Overeenkomst:</strong> Elke afspraak tussen Opdrachtgever en Opdrachtnemer tot het verlenen van Diensten, tot stand gekomen door schriftelijke bevestiging of aanvaarding van een offerte.</li>
              </ol>
            </section>

            {/* Art. 2 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 2 — Toepasselijkheid</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes, werkzaamheden, overeenkomsten en leveringen van diensten of producten door of namens WeAreImpact.</li>
                <li>Afwijkingen zijn uitsluitend geldig indien schriftelijk overeengekomen en ondertekend door beide partijen.</li>
                <li>De toepasselijkheid van inkoop- of andere voorwaarden van Opdrachtgever wordt uitdrukkelijk van de hand gewezen.</li>
                <li>Indien een bepaling van deze voorwaarden nietig is of wordt vernietigd, blijven de overige bepalingen volledig van kracht. Partijen treden in dat geval in overleg over een vervangende bepaling die het doel van de nietige bepaling zo dicht mogelijk benadert.</li>
                <li>WeAreImpact behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen treden in werking 30 dagen na bekendmaking. Bij wezenlijke wijzigingen worden bestaande Opdrachtgevers schriftelijk geïnformeerd.</li>
              </ol>
            </section>

            {/* Art. 3 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 3 — Aanbiedingen en offertes</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Alle aanbiedingen en offertes van WeAreImpact zijn vrijblijvend, tenzij uitdrukkelijk anders vermeld.</li>
                <li>Een offerte is geldig gedurende 30 dagen na dagtekening, tenzij een andere termijn is vermeld.</li>
                <li>WeAreImpact kan niet aan een offerte worden gehouden indien de Opdrachtgever redelijkerwijs had kunnen begrijpen dat de offerte een kennelijke vergissing of verschrijving bevat.</li>
                <li>Vermelde prijzen zijn in euro's en exclusief BTW en andere heffingen van overheidswege, tenzij uitdrukkelijk anders aangegeven.</li>
                <li>Een samengestelde offerte verplicht WeAreImpact niet tot uitvoering van een deel ervan tegen een overeenkomstig deel van de opgegeven prijs.</li>
              </ol>
            </section>

            {/* Art. 4 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 4 — Uitvoering van de overeenkomst</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>WeAreImpact voert de overeenkomst naar beste inzicht en vermogen uit, conform de eisen van goed vakmanschap. Het betreft een inspanningsverplichting tenzij uitdrukkelijk een resultaat is overeengekomen.</li>
                <li>WeAreImpact heeft het recht bepaalde werkzaamheden te laten verrichten door derden. Dit doet geen afbreuk aan de verantwoordelijkheid van WeAreImpact jegens Opdrachtgever.</li>
                <li>De Opdrachtgever draagt er zorg voor dat alle gegevens en informatie die WeAreImpact nodig heeft voor de uitvoering, tijdig worden verstrekt. WeAreImpact is niet aansprakelijk voor schade die voortvloeit uit onjuiste of onvolledige informatie van Opdrachtgever.</li>
                <li>Overeengekomen termijnen zijn indicatief, tenzij uitdrukkelijk schriftelijk als fatale termijn overeengekomen.</li>
                <li>Indien de Opdrachtgever in gebreke blijft bij de levering van benodigde medewerking, heeft WeAreImpact het recht de uitvoering op te schorten en eventuele meerkosten in rekening te brengen.</li>
              </ol>
            </section>

            {/* Art. 5 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 5 — Tarieven en betaling</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Alle tarieven zijn in euro's en exclusief BTW, tenzij anders vermeld.</li>
                <li>Betaling dient te geschieden binnen 14 dagen na factuurdatum, tenzij schriftelijk anders overeengekomen.</li>
                <li>Bij niet-tijdige betaling is de Opdrachtgever van rechtswege in verzuim en is WeAreImpact gerechtigd de wettelijke handelsrente (art. 6:119a BW) in rekening te brengen.</li>
                <li>Alle redelijke buitengerechtelijke incassokosten komen voor rekening van de Opdrachtgever, met een minimum van € 75.</li>
                <li>WeAreImpact behoudt zich het recht voor om tarieven jaarlijks te indexeren aan de hand van de CBS-consumentenprijsindex.</li>
                <li>Bij opdrachten met een looptijd langer dan één maand kan WeAreImpact tussentijdse declaraties sturen voor reeds verrichte werkzaamheden.</li>
              </ol>
            </section>

            {/* Art. 6 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 6 — LEGO® Serious Play workshops</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>LEGO® is een geregistreerd handelsmerk van de LEGO Group, die deze diensten niet sponsort, autoriseert of onderschrijft.</li>
                <li>Vincent van Munster is gecertificeerd LEGO® Serious Play facilitator.</li>
                <li>Annulering dient minimaal 14 kalenderdagen voor de workshopdatum schriftelijk te geschieden. Bij annulering binnen 14 dagen is 50% van het overeengekomen bedrag verschuldigd; binnen 48 uur 100%.</li>
                <li>De Opdrachtgever draagt zorg voor een geschikte locatie met voldoende ruimte, tafels en verlichting.</li>
                <li>De Opdrachtgever verstrekt vooraf een deelnemerslijst met namen. WeAreImpact verwerkt deze persoonsgegevens uitsluitend voor de uitvoering van de workshop en verwijdert ze daarna.</li>
              </ol>
            </section>

            {/* Art. 7 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 7 — AI-diensten en digitale producten</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>AI-strategieadvies en digitale diensten worden geleverd op basis van de op dat moment beschikbare technologie, kennis en wetgeving (waaronder de EU AI Act).</li>
                <li>WeAreImpact garandeert niet dat AI-tools, -modellen of -adviezen foutloos zijn of aan specifieke resultaatsverwachtingen voldoen. AI-systemen kunnen onjuiste, onvolledige of verouderde informatie genereren (&ldquo;hallucinaties&rdquo;). De Opdrachtgever dient uitkomsten altijd zelfstandig te verifiëren.</li>
                <li>De Opdrachtgever blijft te allen tijde eindverantwoordelijk voor beslissingen die worden genomen op basis van AI-adviezen of AI-gegenereerde content.</li>
                <li>WeAreImpact is niet aansprakelijk voor schade die direct of indirect voortvloeit uit het gebruik van AI-modellen van derden (zoals Anthropic, OpenAI of Google), waaronder schade door systeemuitval, onnauwkeurige uitkomsten of wijzigingen in modelgedrag.</li>
                <li>Toegang tot digitale producten of platforms kan worden opgeschort bij niet-nakoming van betalingsverplichtingen.</li>
                <li>De Opdrachtgever draagt er zorg voor dat bij gebruik van AI-tools voor de verwerking van persoonsgegevens van zijn klanten, cliënten of medewerkers, de vereiste privacywaarborgen zijn getroffen (zie ook artikel 16).</li>
              </ol>
            </section>

            {/* Art. 8 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 8 — Intellectueel eigendom</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Alle intellectuele eigendomsrechten op door WeAreImpact ontwikkelde materialen, methoden, adviezen, rapporten, workshops, e-learnings en andere documenten berusten bij WeAreImpact, tenzij schriftelijk anders overeengekomen.</li>
                <li>De Opdrachtgever verkrijgt een niet-exclusief, niet-overdraagbaar gebruiksrecht voor het overeengekomen doel en de overeengekomen duur.</li>
                <li>Het is niet toegestaan materialen te vermenigvuldigen, openbaar te maken, te bewerken of aan derden ter beschikking te stellen zonder voorafgaande schriftelijke toestemming van WeAreImpact.</li>
                <li>Bij overtreding van dit artikel is de Opdrachtgever een direct opeisbare boete verschuldigd van € 5.000 per overtreding, onverminderd het recht van WeAreImpact op volledige schadevergoeding.</li>
                <li>WeAreImpact behoudt het recht de naam van Opdrachtgever te gebruiken als referentie, tenzij Opdrachtgever schriftelijk bezwaar maakt.</li>
              </ol>
            </section>

            {/* Art. 9 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 9 — Geheimhouding</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Beide partijen zijn verplicht tot geheimhouding van alle vertrouwelijke informatie die zij in het kader van de overeenkomst hebben verkregen of waarvan zij het vertrouwelijk karakter redelijkerwijs konden begrijpen.</li>
                <li>Deze verplichting geldt ook na beëindiging van de overeenkomst, zonder beperking in tijd.</li>
                <li>De geheimhoudingsverplichting geldt niet voor informatie die algemeen bekend is of wordt buiten toedoen van de partij, of waarvan openbaarmaking is vereist krachtens wet of rechterlijk bevel.</li>
              </ol>
            </section>

            {/* Art. 10 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 10 — Aansprakelijkheid</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>WeAreImpact is slechts aansprakelijk voor directe schade die het rechtstreekse gevolg is van een aan WeAreImpact toerekenbare tekortkoming.</li>
                <li>De aansprakelijkheid van WeAreImpact is beperkt tot het bedrag dat in het desbetreffende geval door de aansprakelijkheidsverzekering wordt uitgekeerd, vermeerderd met het eigen risico.</li>
                <li>Indien geen verzekering uitkeert, is de aansprakelijkheid beperkt tot het bedrag dat WeAreImpact voor de desbetreffende opdracht in de drie maanden voorafgaand aan de schadeveroorzakende gebeurtenis heeft gefactureerd, met een absoluut maximum van € 10.000.</li>
                <li>WeAreImpact is nimmer aansprakelijk voor indirecte schade, gevolgschade, gederfde winst, gemiste besparingen, bedrijfsstagnatie, reputatieschade of schade door het gebruik van AI-gegenereerde uitkomsten.</li>
                <li>Vorderingen tot schadevergoeding vervallen één jaar nadat de Opdrachtgever bekend was of redelijkerwijs bekend had kunnen zijn met de schade.</li>
                <li>De beperkingen in dit artikel gelden niet indien de schade het gevolg is van opzet of bewuste roekeloosheid van WeAreImpact.</li>
              </ol>
            </section>

            {/* Art. 11 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 11 — Overmacht</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>WeAreImpact is niet gehouden tot nakoming van enige verplichting indien nakoming onmogelijk is geworden door overmacht.</li>
                <li>Onder overmacht wordt verstaan: ziekte, brand, overstroming, aardbeving, pandemie, overheidsmaatregelen, stakingen, uitval van internet of energievoorziening, storingen bij essentiële AI- of cloudproviders, en andere omstandigheden buiten de invloedssfeer van WeAreImpact.</li>
                <li>Indien de overmachtsituatie langer dan 60 dagen voortduurt, hebben beide partijen het recht de overeenkomst te ontbinden, zonder gehouden te zijn tot enige schadevergoeding.</li>
              </ol>
            </section>

            {/* Art. 12 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 12 — Beëindiging en ontbinding</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Beide partijen kunnen een overeenkomst voor onbepaalde tijd schriftelijk opzeggen met inachtneming van een opzegtermijn van één kalendermaand.</li>
                <li>WeAreImpact is gerechtigd de overeenkomst per direct te ontbinden indien: (a) de Opdrachtgever zijn betalingsverplichtingen niet nakomt en nalatig blijft na schriftelijke aanmaning met een termijn van 14 dagen; (b) de Opdrachtgever in staat van faillissement verkeert of surseance van betaling is verleend; of (c) de Opdrachtgever anderszins toerekenbaar tekortkomt in de nakoming van zijn verplichtingen.</li>
                <li>Bij voortijdige beëindiging door Opdrachtgever blijven reeds gefactureerde en nog te factureren bedragen voor verrichte werkzaamheden verschuldigd. WeAreImpact heeft recht op vergoeding van aantoonbare schade die door de voortijdige beëindiging is veroorzaakt.</li>
              </ol>
            </section>

            {/* Art. 13 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 13 — Klachten</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Klachten over de uitgevoerde werkzaamheden dienen binnen 14 dagen na ontdekking schriftelijk gemeld te worden bij WeAreImpact, met een duidelijke omschrijving van de klacht.</li>
                <li>WeAreImpact streeft ernaar klachten binnen 30 dagen af te handelen. Bij complexe klachten informeert WeAreImpact de Opdrachtgever over de verwachte afhandelingstermijn.</li>
                <li>Het indienen van een klacht schort de betalingsverplichting niet op.</li>
              </ol>
            </section>

            {/* Art. 14 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 14 — Toepasselijk recht en geschillen</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Op alle overeenkomsten tussen WeAreImpact en Opdrachtgever is uitsluitend Nederlands recht van toepassing.</li>
                <li>Geschillen worden in eerste instantie beslecht door minnelijk overleg. Partijen zijn verplicht minimaal één serieuze poging tot overleg te ondernemen alvorens een juridische procedure te starten.</li>
                <li>Indien partijen niet tot overeenstemming komen, worden geschillen voorgelegd aan de bevoegde rechter van de Rechtbank Noord-Holland, locatie Haarlem.</li>
              </ol>
            </section>

            {/* Art. 15 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 15 — Privacy en gegevensbescherming (door WeAreImpact als verwerkingsverantwoordelijke)</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>WeAreImpact verwerkt persoonsgegevens van Opdrachtgever(s) en contactpersonen conform de Algemene Verordening Gegevensbescherming (AVG) en de uitgebreide <Link href="/privacy" className="text-orange-600 hover:underline">Privacyverklaring</Link> op de website.</li>
                <li>Persoonsgegevens worden uitsluitend verwerkt voor de uitvoering van de overeenkomst, bedrijfsadministratie en — met toestemming — voor nieuwsbrieven en marketingcommunicatie.</li>
                <li>WeAreImpact deelt persoonsgegevens van Opdrachtgever niet met derden buiten de verwerkerslijst in de Privacyverklaring, tenzij wettelijk verplicht.</li>
              </ol>
            </section>

            {/* Art. 16 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 16 — Privacy en gegevensbescherming (WeAreImpact als verwerker)</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>Indien WeAreImpact in het kader van een opdracht persoonsgegevens verwerkt namens en ten behoeve van Opdrachtgever (als &lsquo;verwerker&rsquo; in de zin van de AVG), sluiten partijen een verwerkersovereenkomst conform art. 28 AVG voordat de verwerking aanvangt.</li>
                <li>WeAreImpact verwerkt in dat geval persoonsgegevens uitsluitend op basis van gedocumenteerde instructies van Opdrachtgever, die als verwerkingsverantwoordelijke optreedt.</li>
                <li>WeAreImpact treft passende technische en organisatorische maatregelen om de verwerkte persoonsgegevens te beschermen.</li>
                <li>Bij het gebruik van AI-tools voor de verwerking van persoonsgegevens van cliënten van Opdrachtgever, wordt separaat schriftelijk overeengekomen welke tools worden ingezet, met welke instellingen en op welke rechtsgrondslag.</li>
              </ol>
            </section>

            {/* Art. 17 */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Artikel 17 — Nieuwsbrief en communicatie</h2>
              <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base text-slate-700">
                <li>WeAreImpact verstuurt een nieuwsbrief uitsluitend aan personen die zich via de website hebben aangemeld en hun aanmelding hebben bevestigd via een verificatielink (double opt-in).</li>
                <li>Afmelding is te allen tijde mogelijk via de afmeldlink in elke nieuwsbrief of via e-mail aan <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a>. Verwerking van afmeldingen geschiedt binnen 10 werkdagen.</li>
              </ol>
            </section>

            {/* Contactgegevens */}
            <section className="p-5 md:p-6 bg-slate-100 rounded-xl">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-3">Contactgegevens</h2>
              <div className="text-sm md:text-base text-slate-700 space-y-1">
                <p><strong>WeAreImpact</strong> — eenmanszaak van Vincent van Munster</p>
                <p>Nieuw-Vennep / Hoofddorp, Nederland</p>
                <p>KvK-nummer: 70285888</p>
                <p>BTW-nummer: NL858236369B01</p>
                <p>E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a></p>
                <p>Telefoon: <a href="tel:+31614470977" className="text-orange-600 hover:underline">+31 6 1447 0977</a></p>
                <p>Website: <a href="https://weareimpact.nl" className="text-orange-600 hover:underline">weareimpact.nl</a></p>
              </div>
            </section>

          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-xs md:text-sm">
              Zie ook onze{' '}
              <Link href="/privacy" className="text-orange-600 hover:underline">Privacyverklaring</Link>{' '}
              en{' '}
              <Link href="/cookies" className="text-orange-600 hover:underline">Cookiebeleid</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
