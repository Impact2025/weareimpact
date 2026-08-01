import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description: 'Privacyverklaring van WeAreImpact — Vincent van Munster. Lees hoe wij omgaan met uw persoonsgegevens conform de AVG/GDPR.',
  robots: { index: true, follow: true },
  // Zonder eigen canonical erft deze pagina die van de root layout (= homepage),
  // waardoor Google haar als duplicaat van / behandelt en niet indexeert.
  alternates: { canonical: 'https://weareimpact.nl/privacy' },
};

const LAST_UPDATED = 'juni 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Privacyverklaring
          </h1>
          <p className="text-sm md:text-base text-slate-500 mb-8 md:mb-12">
            Versie {LAST_UPDATED} — WeAreImpact (KvK 70285888)
          </p>

          <div className="prose prose-slate max-w-none space-y-10 md:space-y-14">

            {/* Inleiding */}
            <section>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                WeAreImpact, vertegenwoordigd door Vincent van Munster, hecht groot belang aan uw privacy. Wij verwerken persoonsgegevens zorgvuldig en alleen voor omschreven doeleinden, conform de Algemene Verordening Gegevensbescherming (AVG/GDPR) en de Uitvoeringswet AVG.
              </p>
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r">
                <p className="text-sm md:text-base text-slate-700 italic">
                  &ldquo;Ik verkoop geen data, ik verkoop impact.&rdquo; — Vincent van Munster
                </p>
              </div>
            </section>

            {/* 1. Verantwoordelijke */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                1. Verantwoordelijke voor de verwerking
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-1 text-sm md:text-base text-slate-700">
                <p><strong>WeAreImpact</strong></p>
                <p>Vincent van Munster</p>
                <p>Nieuw-Vennep / Hoofddorp, Nederland</p>
                <p>KvK-nummer: 70285888</p>
                <p>BTW-nummer: NL858236369B01</p>
                <p>E-mail: <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a></p>
                <p>Telefoon: <a href="tel:+31614470977" className="text-orange-600 hover:underline">+31 6 1447 0977</a></p>
              </div>
            </section>

            {/* 2. Verwerkingsactiviteiten */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                2. Welke persoonsgegevens verwerken wij en waarom?
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-5">
                Hieronder een overzicht van alle verwerkingsactiviteiten, de gegevens die daarvoor worden gebruikt, de rechtsgrondslag en de bewaartermijn.
              </p>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {[
                  {
                    activiteit: 'Contactformulier',
                    gegevens: 'Naam, e-mailadres, telefoonnummer (optioneel), berichtinhoud',
                    grondslag: 'Gerechtvaardigd belang',
                    termijn: '2 jaar',
                  },
                  {
                    activiteit: 'Rate limiting & spambeveiliging',
                    gegevens: 'IP-adres',
                    grondslag: 'Gerechtvaardigd belang (beveiliging)',
                    termijn: '1 uur (automatisch verwijderd)',
                  },
                  {
                    activiteit: 'Activiteitenlog (intern)',
                    gegevens: 'Naam, e-mailadres, type actie, tijdstip',
                    grondslag: 'Gerechtvaardigd belang (bedrijfsadministratie)',
                    termijn: '1 jaar',
                  },
                  {
                    activiteit: 'Chat met AI-assistent Iris',
                    gegevens: 'Berichtinhoud, sessie-ID, bezochte pagina',
                    grondslag: 'Toestemming (impliciet bij gebruik) / gerechtvaardigd belang',
                    termijn: '1 jaar',
                  },
                  {
                    activiteit: 'Afspraakplanning (booking)',
                    gegevens: 'Naam, e-mailadres, telefoonnummer, organisatie',
                    grondslag: 'Uitvoering overeenkomst',
                    termijn: '2 jaar',
                  },
                  {
                    activiteit: 'Nieuwsbrief',
                    gegevens: 'E-mailadres, aanmeldingsbron',
                    grondslag: 'Toestemming (double opt-in)',
                    termijn: 'Tot uitschrijving + 6 maanden',
                  },
                  {
                    activiteit: 'Gratis AI-scan',
                    gegevens: 'Sector, uitdaging, AI-ervaringsniveau, gegenereerd advies',
                    grondslag: 'Gerechtvaardigd belang',
                    termijn: '2 jaar',
                  },
                  {
                    activiteit: 'CRM (klant- en prospectbeheer)',
                    gegevens: 'Naam, functie, bedrijf, contactgegevens, dealinformatie',
                    grondslag: 'Uitvoering overeenkomst / gerechtvaardigd belang',
                    termijn: 'Duur relatie + 2 jaar',
                  },
                  {
                    activiteit: 'B2B-prospecting (intern, Lead Machine)',
                    gegevens: 'Zakelijke contactgegevens van openbare websites (naam organisatie, e-mail, telefoon)',
                    grondslag: 'Gerechtvaardigd belang (eigen marketing)',
                    termijn: '1 jaar',
                  },
                  {
                    activiteit: 'Website-analytics',
                    gegevens: 'Geanonimiseerd IP, bezochte pagina\'s, apparaattype, verwijzende website',
                    grondslag: 'Toestemming',
                    termijn: '14 maanden',
                  },
                  {
                    activiteit: 'Facturatie & administratie',
                    gegevens: 'Naam, adres, bedrijfsnaam, BTW-nummer, betalingsgegevens',
                    grondslag: 'Wettelijke verplichting (art. 52 AWR)',
                    termijn: '7 jaar',
                  },
                ].map((row) => (
                  <div key={row.activiteit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="font-semibold text-slate-900 mb-3">{row.activiteit}</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-700">Gegevens:</span> {row.gegevens}</p>
                      <p><span className="font-medium text-slate-700">Grondslag:</span> {row.grondslag}</p>
                      <p><span className="font-medium text-slate-700">Bewaard:</span> {row.termijn}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="border border-slate-700 p-3 text-left font-semibold">Activiteit</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Gegevens</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Grondslag</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {[
                      ['Contactformulier', 'Naam, e-mail, telefoon (optioneel), bericht', 'Gerechtvaardigd belang', '2 jaar'],
                      ['Rate limiting & spam', 'IP-adres', 'Gerechtvaardigd belang (beveiliging)', '1 uur (auto)'],
                      ['Activiteitenlog (intern)', 'Naam, e-mail, type actie, tijdstip', 'Gerechtvaardigd belang', '1 jaar'],
                      ['Chat — Iris', 'Berichtinhoud, sessie-ID, pagina-URL', 'Toestemming / gerechtvaardigd belang', '1 jaar'],
                      ['Afspraakplanning', 'Naam, e-mail, telefoon, organisatie', 'Uitvoering overeenkomst', '2 jaar'],
                      ['Nieuwsbrief', 'E-mailadres, aanmeldingsbron', 'Toestemming (double opt-in)', 'Tot uitschrijving + 6 mnd'],
                      ['AI-scan', 'Sector, uitdaging, AI-niveau, advies', 'Gerechtvaardigd belang', '2 jaar'],
                      ['CRM', 'Naam, functie, bedrijf, deal-info', 'Overeenkomst / ger. belang', 'Relatie + 2 jaar'],
                      ['B2B-prospecting (intern)', 'Zakelijke contactgegevens (openbaar)', 'Gerechtvaardigd belang', '1 jaar'],
                      ['Website-analytics', 'Geanon. IP, pagina\'s, apparaat', 'Toestemming', '14 maanden'],
                      ['Facturatie & admin.', 'Naam, adres, BTW-nr., betaling', 'Wettelijke verplichting', '7 jaar'],
                    ].map(([act, geg, gr, term]) => (
                      <tr key={act} className="bg-white hover:bg-slate-50 even:bg-slate-50/50">
                        <td className="border border-slate-200 p-3 font-medium">{act}</td>
                        <td className="border border-slate-200 p-3">{geg}</td>
                        <td className="border border-slate-200 p-3">{gr}</td>
                        <td className="border border-slate-200 p-3 whitespace-nowrap">{term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. AI-assistent */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                3. AI-assistent Iris
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                Onze website maakt gebruik van AI-assistent Iris voor het beantwoorden van vragen en het plannen van afspraken. Elk gesprek wordt verwerkt door een externe AI-provider (OpenRouter met modellen van Anthropic en OpenAI) en opgeslagen in onze database voor kwaliteitsverbetering en leadbeheer.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-slate-700">
                <li>Gespreksinhoud wordt verwerkt door AI-modellen in de Verenigde Staten.</li>
                <li>Gesprekken worden maximaal 1 jaar bewaard en daarna automatisch verwijderd.</li>
                <li>Gespreksdata wordt nooit verkocht of gedeeld met derden buiten de verwerkerslijst (zie sectie 4).</li>
                <li>U kunt verwijdering van uw chatgeschiedenis aanvragen via <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a>.</li>
              </ul>
            </section>

            {/* 4. Verwerkers en doorgifte */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                4. Verwerkers en doorgifte buiten de EU
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-5">
                Wij schakelen de volgende verwerkers in. Met elk van hen is een verwerkersovereenkomst gesloten conform art. 28 AVG. Doorgifte naar de VS vindt plaats op basis van het EU-VS Data Privacy Framework (DPF) of Standard Contractual Clauses (SCC&apos;s).
              </p>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3 mb-4">
                {[
                  { naam: 'Vercel', dienst: 'Website hosting', land: 'VS', grondslag: 'Data Privacy Framework' },
                  { naam: 'Neon', dienst: 'Primaire database (PostgreSQL)', land: 'VS', grondslag: "Standard Contractual Clauses" },
                  { naam: 'Supabase', dienst: 'Authenticatie & bestandsopslag', land: 'VS', grondslag: "Standard Contractual Clauses" },
                  { naam: 'Resend', dienst: 'Transactionele e-mail', land: 'VS', grondslag: "Standard Contractual Clauses" },
                  { naam: 'OpenRouter / Anthropic / OpenAI', dienst: 'AI-taalmodellen (chat, scan)', land: 'VS', grondslag: "Standard Contractual Clauses" },
                  { naam: 'Google Analytics', dienst: 'Website-statistieken', land: 'VS', grondslag: 'Data Privacy Framework' },
                  { naam: 'Google Calendar', dienst: 'Afspraakbeheer', land: 'VS', grondslag: 'Data Privacy Framework' },
                  { naam: 'Google Search Console', dienst: 'SEO-monitoring (geen klantdata)', land: 'VS', grondslag: 'Data Privacy Framework' },
                ].map((r) => (
                  <div key={r.naam} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="font-semibold text-slate-900 mb-2">{r.naam}</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Dienst:</span> {r.dienst}</p>
                      <p><span className="font-medium">Land:</span> {r.land}</p>
                      <p><span className="font-medium">Doorgifte:</span> {r.grondslag}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto mb-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="border border-slate-700 p-3 text-left font-semibold">Verwerker</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Dienst</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Land</th>
                      <th className="border border-slate-700 p-3 text-left font-semibold">Grondslag doorgifte</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {[
                      ['Vercel', 'Website hosting', 'VS', 'Data Privacy Framework'],
                      ['Neon', 'Primaire database (PostgreSQL)', 'VS', 'Standard Contractual Clauses'],
                      ['Supabase', 'Authenticatie & bestandsopslag', 'VS', 'Standard Contractual Clauses'],
                      ['Resend', 'Transactionele e-mail', 'VS', 'Standard Contractual Clauses'],
                      ['OpenRouter / Anthropic / OpenAI', 'AI-taalmodellen (chat, scan)', 'VS', 'Standard Contractual Clauses'],
                      ['Google Analytics', 'Website-statistieken', 'VS', 'Data Privacy Framework'],
                      ['Google Calendar', 'Afspraakbeheer', 'VS', 'Data Privacy Framework'],
                      ['Google Search Console', 'SEO-monitoring', 'VS', 'Data Privacy Framework'],
                    ].map(([naam, dienst, land, gr]) => (
                      <tr key={naam} className="bg-white hover:bg-slate-50 even:bg-slate-50/50">
                        <td className="border border-slate-200 p-3 font-semibold">{naam}</td>
                        <td className="border border-slate-200 p-3">{dienst}</td>
                        <td className="border border-slate-200 p-3">{land}</td>
                        <td className="border border-slate-200 p-3">{gr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-slate-600">
                Wij delen nooit persoonsgegevens met derden buiten bovenstaande lijst, tenzij wettelijk verplicht.
              </p>
            </section>

            {/* 5. B2B prospecting */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                5. B2B-prospecting en zakelijke contactgegevens
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                Voor het vinden van potentiële zakelijke partners en opdrachtgevers verzamelen wij intern zakelijke contactgegevens uit openbare bronnen (websites van organisaties). Het gaat uitsluitend om zakelijke contactinformatie (functiegebonden e-mailadressen, telefoonnummers) en nooit om privégegevens.
              </p>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                De rechtsgrondslag is gerechtvaardigd belang (art. 6 lid 1 sub f AVG). Wij hebben een Legitiem Belang Afweging (LIA) opgesteld die op verzoek beschikbaar is.
              </p>
              <p className="text-sm md:text-base text-slate-700">
                Indien u opgenomen bent in onze prospectlijst en bezwaar wilt maken, kunt u contact opnemen via <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a>. Wij verwijderen uw gegevens onmiddellijk.
              </p>
            </section>

            {/* 6. Uw rechten */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                6. Uw rechten
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-4">
                Op grond van de AVG heeft u de volgende rechten. U kunt deze uitoefenen via <a href="mailto:v.munster@weareimpact.nl" className="text-orange-600 hover:underline">v.munster@weareimpact.nl</a>. Wij reageren binnen <strong>30 dagen</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { recht: 'Recht op inzage', omschrijving: 'Opvragen welke gegevens wij van u verwerken.' },
                  { recht: 'Recht op rectificatie', omschrijving: 'Onjuiste of onvolledige gegevens laten corrigeren.' },
                  { recht: 'Recht op verwijdering', omschrijving: 'Verzoeken om wissing van uw gegevens ("recht om vergeten te worden").' },
                  { recht: 'Recht op beperking', omschrijving: 'Verwerking (tijdelijk) laten stopzetten.' },
                  { recht: 'Recht op dataportabiliteit', omschrijving: 'Uw gegevens in een gangbaar formaat ontvangen.' },
                  { recht: 'Recht op bezwaar', omschrijving: 'Bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.' },
                  { recht: 'Intrekking toestemming', omschrijving: 'Eerder gegeven toestemming altijd intrekken, zonder gevolgen voor de rechtmatigheid van eerdere verwerking.' },
                  { recht: 'Klachtrecht', omschrijving: 'Een klacht indienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).' },
                ].map(({ recht, omschrijving }) => (
                  <div key={recht} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="font-semibold text-slate-900 text-sm mb-1">{recht}</div>
                    <div className="text-sm text-slate-600">{omschrijving}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Beveiliging */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                7. Beveiliging
              </h2>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                Wij treffen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen verlies, ongeautoriseerde toegang of misbruik:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-slate-700">
                <li>TLS/HTTPS-versleuteling op alle verbindingen</li>
                <li>Versleutelde databases en back-ups</li>
                <li>Strikt toegangsbeheer: alleen Vincent van Munster heeft toegang tot het admin-systeem</li>
                <li>Automatische rate limiting en spamdetectie op formulieren</li>
                <li>Regelmatige evaluatie van beveiligingsmaatregelen</li>
              </ul>
              <p className="text-sm md:text-base text-slate-700 mt-3">
                Bij een datalek met risico voor uw rechten melden wij dit binnen 72 uur bij de Autoriteit Persoonsgegevens en — indien vereist — direct aan u.
              </p>
            </section>

            {/* 8. Cookies */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                8. Cookies
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Wij gebruiken cookies voor het functioneren van de website en — alleen na uw toestemming — voor analytische doeleinden. Zie ons uitgebreide{' '}
                <Link href="/cookies" className="text-orange-600 hover:underline">Cookiebeleid</Link> voor alle details.
              </p>
            </section>

            {/* 9. Minderjarigen */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                9. Minderjarigen
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Onze website en diensten zijn gericht op zakelijke gebruikers en niet op personen jonger dan 16 jaar. Wij verzamelen niet bewust gegevens van minderjarigen. Als u vermoedt dat wij ten onrechte gegevens van een minderjarige hebben verzameld, neem dan direct contact met ons op.
              </p>
            </section>

            {/* 10. Wijzigingen */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                10. Wijzigingen van deze verklaring
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Wij kunnen deze privacyverklaring aanpassen als onze diensten veranderen of wet- en regelgeving dit vereist. De meest actuele versie staat altijd op deze pagina. Bij substantiële wijzigingen informeren wij bestaande relaties per e-mail.
              </p>
            </section>

            {/* 11. Klachten */}
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                11. Klachten
              </h2>
              <p className="text-sm md:text-base text-slate-700">
                Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem dan eerst contact met ons op. Als wij er samen niet uitkomen, kunt u een klacht indienen bij de{' '}
                <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Autoriteit Persoonsgegevens</a>.
              </p>
            </section>

            {/* Contact */}
            <section className="p-5 md:p-6 bg-slate-100 rounded-xl">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-3">
                Contact
              </h2>
              <div className="text-sm md:text-base text-slate-700 space-y-1">
                <p><strong>WeAreImpact</strong> — Vincent van Munster</p>
                <p>KvK 70285888 · BTW NL858236369B01</p>
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
              <Link href="/cookies" className="text-orange-600 hover:underline">Cookiebeleid</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
