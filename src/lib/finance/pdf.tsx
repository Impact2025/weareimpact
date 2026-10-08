import fs from 'fs';
import path from 'path';
import React from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { computeTotals, formatEuro, lineNetCents, lineRegularCents } from './money';
import { parseBlocks, type Inline } from './markdown';
import { planTerms } from './plan';
import { TRIGGER_LABEL } from './types';
import type { FinanceSettings, Invoice, Party, Quote, QuoteSection } from './types';

// Geen woordafbreking: nette Nederlandse regels zonder "se-lecteren".
Font.registerHyphenationCallback((word) => [word]);

// Kleuren gelijk aan de site en de mails.
const C = {
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  line: '#e2e8f0',
  orange: '#ea580c',
  orangeLight: '#f97316',
  orange50: '#fff7ed',
  orange200: '#fed7aa',
  cream: '#FDFBF7',
  white: '#ffffff',
  green: '#15803d',
};

const s = StyleSheet.create({
  page: { paddingTop: 38, paddingBottom: 58, paddingHorizontal: 42, fontFamily: 'Helvetica', fontSize: 9.2, color: C.body, lineHeight: 1.42, backgroundColor: C.white },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 30, height: 30, marginRight: 8 },
  brand: { fontFamily: 'Helvetica-Bold', fontSize: 15, color: C.ink },
  tagline: { fontSize: 8, color: C.muted, marginTop: 3 },
  docTag: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.orange, letterSpacing: 1.6, textAlign: 'right' },
  docMeta: { fontSize: 8.5, color: C.muted, textAlign: 'right', marginTop: 2 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 24, color: C.ink, lineHeight: 1.15, marginBottom: 4 },
  subtitle: { fontSize: 12, color: C.muted, marginBottom: 12 },
  rule: { height: 3, width: 44, backgroundColor: C.orange, marginBottom: 14, borderRadius: 2 },
  partyRow: { flexDirection: 'row', marginBottom: 16 },
  partyBox: { flex: 1, backgroundColor: C.cream, borderWidth: 1, borderColor: C.orange200, borderRadius: 8, padding: 12 },
  partyGap: { width: 12 },
  partyLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.orange, letterSpacing: 1.4, marginBottom: 6 },
  partyLine: { flexDirection: 'row', marginBottom: 2 },
  partyKey: { width: 62, color: C.muted, fontSize: 8.5 },
  partyVal: { flex: 1, color: C.ink, fontSize: 9 },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: C.ink, marginTop: 8, marginBottom: 7 },
  h2Num: { color: C.orange },
  p: { marginBottom: 7 },
  bold: { fontFamily: 'Helvetica-Bold', color: C.ink },
  li: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 12, color: C.orange, fontFamily: 'Helvetica-Bold' },
  liText: { flex: 1 },
  cards: { flexDirection: 'row', marginBottom: 12 },
  card: { flex: 1, borderWidth: 1, borderColor: C.orange200, borderRadius: 8, padding: 11, backgroundColor: C.white },
  cardGap: { width: 9 },
  statValue: { fontFamily: 'Helvetica-Bold', fontSize: 19, color: C.orange, lineHeight: 1.1, marginBottom: 6 },
  cardTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: C.ink, marginBottom: 3 },
  cardText: { fontSize: 8.5, color: C.body, lineHeight: 1.4 },
  phaseLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.orange, letterSpacing: 1.1, marginBottom: 4 },
  tableHead: { flexDirection: 'row', backgroundColor: C.ink, borderTopLeftRadius: 6, borderTopRightRadius: 6, paddingVertical: 6, paddingHorizontal: 9 },
  th: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.white, letterSpacing: 0.4 },
  tr: { flexDirection: 'row', paddingVertical: 6.5, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: C.line },
  cDesc: { flex: 3.1, paddingRight: 8 },
  cSpec: { flex: 1.7, paddingRight: 8 },
  cAmt: { flex: 1.3, textAlign: 'right' },
  rowTitle: { fontFamily: 'Helvetica-Bold', color: C.ink, fontSize: 9.5, marginBottom: 1 },
  rowDetail: { fontSize: 8.5, color: C.muted },
  optBadge: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.orange, letterSpacing: 0.8 },
  totalsBox: { alignSelf: 'flex-end', width: 230, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5 },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.orange, borderRadius: 6, paddingVertical: 7, paddingHorizontal: 9, marginTop: 5 },
  totalFinalText: { fontFamily: 'Helvetica-Bold', color: C.white, fontSize: 10.5 },
  scheduleTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.orange, letterSpacing: 1.3, marginTop: 14, marginBottom: 6 },
  boxes: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4.5 },
  box: { width: '50%', paddingHorizontal: 4.5, marginBottom: 9 },
  boxInner: { backgroundColor: C.cream, borderLeftWidth: 3, borderLeftColor: C.orange, borderRadius: 4, padding: 9 },
  signRow: { flexDirection: 'row', marginTop: 4 },
  signBox: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 12 },
  signLine: { borderBottomWidth: 1, borderBottomColor: C.ink, height: 34, marginTop: 8, marginBottom: 3 },
  signCaption: { fontSize: 7.5, color: C.muted },
  stamp: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 8, padding: 11, marginTop: 8 },
  stampTitle: { fontFamily: 'Helvetica-Bold', color: C.green, fontSize: 10, marginBottom: 3 },
  footer: { position: 'absolute', bottom: 26, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.orange200, paddingTop: 7 },
  footText: { fontSize: 7.5, color: C.muted },
  payBox: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.orange200, borderRadius: 8, padding: 12, marginTop: 16 },
});

// ---------- gedeelde stukken ----------

let logoCache: Buffer | null | undefined;
async function loadLogo(): Promise<Buffer | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    logoCache = fs.readFileSync(path.join(process.cwd(), 'public', 'WeAreImpact_hart.png'));
  } catch {
    try {
      const res = await fetch('https://weareimpact.nl/WeAreImpact_hart.png');
      logoCache = res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    } catch {
      logoCache = null;
    }
  }
  return logoCache;
}

const nlDate = (iso: string | null) =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

function Rich({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((i, k) => (i.bold ? <Text key={k} style={s.bold}>{i.text}</Text> : <Text key={k}>{i.text}</Text>))}
    </>
  );
}

function Body({ text }: { text: string }) {
  return (
    <View>
      {parseBlocks(text).map((b, i) =>
        b.type === 'p' ? (
          <Text key={i} style={s.p}><Rich inlines={b.inlines} /></Text>
        ) : (
          <View key={i} style={{ marginBottom: 6 }}>
            {b.items.map((item, j) => (
              <View key={j} style={s.li} wrap={false}>
                <Text style={s.bullet}>•</Text>
                <Text style={s.liText}><Rich inlines={item} /></Text>
              </View>
            ))}
          </View>
        ),
      )}
    </View>
  );
}

function Header({ logo, tag, meta, settings }: { logo: Buffer | null; tag: string; meta: string[]; settings: FinanceSettings }) {
  return (
    <View style={s.headerRow}>
      <View style={s.brandRow}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {logo ? <Image src={logo} style={s.logo} /> : null}
        <View>
          <Text style={s.brand}>{settings.tradeName || 'WeAreImpact'}</Text>
          <Text style={s.tagline}>Procesversneller voor sociale en duurzame ondernemers.</Text>
        </View>
      </View>
      <View>
        <Text style={s.docTag}>{tag}</Text>
        {meta.map((m, i) => <Text key={i} style={s.docMeta}>{m}</Text>)}
      </View>
    </View>
  );
}

function Footer({ left, settings }: { left: string; settings: FinanceSettings }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footText}>{left}</Text>
      <Text style={s.footText}>{settings.email} · weareimpact.nl</Text>
      <Text style={s.footText} render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} van ${totalPages}`} />
    </View>
  );
}

function PartyBox({ label, rows }: { label: string; rows: [string, string][] }) {
  return (
    <View style={s.partyBox}>
      <Text style={s.partyLabel}>{label}</Text>
      {rows.filter(([, v]) => v).map(([k, v]) => (
        <View key={k} style={s.partyLine}>
          <Text style={s.partyKey}>{k}</Text>
          <Text style={s.partyVal}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

const clientRows = (c: Party): [string, string][] => [
  ['Organisatie', c.legalName],
  ['T.a.v.', c.signerName],
  ['Functie', c.signerRole],
  ['Adres', [c.address, [c.postcode, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')],
  ['KvK', c.kvk],
  ['BTW-nr', c.btw],
];

const ownRows = (st: FinanceSettings): [string, string][] => [
  ['Aanbieder', st.legalName],
  ['Adres', `${st.address}, ${st.postcode} ${st.city}`],
  ['KvK', st.kvk],
  ['BTW-nr', st.btw],
  ['E-mail', st.email],
];

function LinesTable({ lines, vatRate, showOptional = true }: { lines: Invoice['lines'] | Quote['lines']; vatRate: number; showOptional?: boolean }) {
  const list = lines as (Quote['lines'][number] & { optional?: boolean })[];
  const totals = computeTotals(list.map((l) => ({ ...l, optional: l.optional })), vatRate);
  return (
    <View>
      <View style={s.tableHead}>
        <Text style={[s.th, s.cDesc]}>OMSCHRIJVING</Text>
        <Text style={[s.th, s.cSpec]}>SPECIFICATIE</Text>
        <Text style={[s.th, s.cAmt]}>BEDRAG EXCL. BTW</Text>
      </View>
      {list.filter((l) => showOptional || !l.optional).map((l, i) => {
        const net = lineNetCents(l);
        const spec = l.unit ? `${l.quantity} ${l.unit}` : l.quantity !== 1 ? `${l.quantity}×` : '';
        return (
          <View key={i} style={s.tr} wrap={false}>
            <View style={s.cDesc}>
              {l.optional ? <Text style={s.optBadge}>OPTIONEEL</Text> : null}
              <Text style={s.rowTitle}>{l.description}</Text>
              {l.detail ? <Text style={s.rowDetail}>{l.detail}</Text> : null}
              {l.discountPct > 0 ? (
                <Text style={[s.rowDetail, { color: C.orange, marginTop: 2 }]}>
                  Regulier {formatEuro(lineRegularCents(l))}, {l.discountPct}% korting
                </Text>
              ) : null}
            </View>
            <Text style={s.cSpec}>{spec}</Text>
            <Text style={[s.cAmt, l.optional ? { color: C.muted } : { fontFamily: 'Helvetica-Bold', color: C.ink }]}>{formatEuro(net)}</Text>
          </View>
        );
      })}
      <View style={s.totalsBox} wrap={false}>
        <View style={s.totalRow}><Text>Subtotaal excl. btw</Text><Text>{formatEuro(totals.subtotalCents)}</Text></View>
        <View style={s.totalRow}><Text>Btw {vatRate}%</Text><Text>{formatEuro(totals.vatCents)}</Text></View>
        <View style={s.totalFinal}>
          <Text style={s.totalFinalText}>Totaal incl. btw</Text>
          <Text style={s.totalFinalText}>{formatEuro(totals.totalCents)}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionView({ section, number, quote }: { section: QuoteSection; number: number; quote: Quote }) {
  const heading = section.title ? (
    <Text style={s.h2}><Text style={s.h2Num}>{number}. </Text>{section.title}</Text>
  ) : null;
  if (section.kind === 'investment') {
    const terms = planTerms(quote);
    return (
      <View>
        {heading}
        {section.body ? <Body text={section.body} /> : null}
        <LinesTable lines={quote.lines} vatRate={quote.vatRate} />
        {terms.length > 0 ? (
          <View wrap={false}>
            <Text style={s.scheduleTitle}>BETAALSCHEMA</Text>
            {terms.map((t) => (
              <View key={t.index} style={[s.tr, { paddingVertical: 6 }]}>
                <View style={s.cDesc}>
                  <Text style={s.rowTitle}>{t.item.label}</Text>
                  <Text style={s.rowDetail}>
                    {TRIGGER_LABEL[t.item.trigger]}{t.item.trigger === 'datum' && t.item.dueOn ? ` (${nlDate(t.item.dueOn)})` : ''} · betaaltermijn 14 dagen
                  </Text>
                </View>
                <Text style={s.cSpec}>{formatEuro(t.totals.subtotalCents)} excl.</Text>
                <Text style={[s.cAmt, { fontFamily: 'Helvetica-Bold', color: C.ink }]}>{formatEuro(t.totals.totalCents)} incl.</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }
  if (section.kind === 'stats' || section.kind === 'phases') {
    // Meer dan vier blokken naast elkaar worden te smal voor de titels: dan onder elkaar.
    const stacked = section.items.length > 4;
    return (
      <View wrap={stacked}>
        {heading}
        {section.body ? <Body text={section.body} /> : null}
        <View style={stacked ? { marginBottom: 12 } : s.cards}>
          {section.items.map((it, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <View style={stacked ? { height: 6 } : s.cardGap} /> : null}
              <View style={stacked ? [s.card, { flex: 0, flexGrow: 0, flexBasis: 'auto' }] : s.card} wrap={false}>
                {section.kind === 'stats' ? (
                  <>
                    <Text style={s.statValue}>{it.label}</Text>
                    <Text style={s.cardTitle}>{it.title}</Text>
                  </>
                ) : (
                  <>
                    <Text style={s.phaseLabel}>{it.label.toUpperCase()}</Text>
                    <Text style={s.cardTitle}>{it.title}</Text>
                  </>
                )}
                <Text style={s.cardText}>{it.text}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  }
  if (section.kind === 'boxes') {
    return (
      <View wrap={false}>
        {heading}
        {section.body ? <Body text={section.body} /> : null}
        <View style={s.boxes}>
          {section.items.map((it, i) => (
            <View key={i} style={s.box}>
              <View style={s.boxInner}>
                <Text style={s.cardTitle}>{it.title}</Text>
                <Text style={s.cardText}>{it.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
  return (
    <View>
      {heading}
      <Body text={section.body} />
    </View>
  );
}

// ---------- offerte ----------

function QuoteDoc({ quote, settings, logo }: { quote: Quote; settings: FinanceSettings; logo: Buffer | null }) {
  const hasInvestment = quote.sections.some((sec) => sec.kind === 'investment');
  const sections: QuoteSection[] = hasInvestment
    ? quote.sections
    : [...quote.sections, { kind: 'investment', title: 'Begroting & investering', body: '', items: [] }];
  const accepted = quote.status === 'akkoord' && quote.acceptedAt;
  const acceptedAt = accepted
    ? new Date(quote.acceptedAt!).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Amsterdam' })
    : '';
  const finalNumber = sections.filter((x) => x.title).length + 1;

  return (
    <Document title={`Offerte ${quote.reference}`} author={settings.legalName} subject={quote.title}>
      <Page size="A4" style={s.page}>
        <Header logo={logo} tag="OFFERTEVOORSTEL" meta={[`Referentie: ${quote.reference}`, `Datum: ${nlDate(quote.issuedOn)}`, `Geldig tot: ${nlDate(quote.validUntil)}`]} settings={settings} />
        <Text style={s.title}>{quote.title}</Text>
        {quote.subtitle ? <Text style={s.subtitle}>{quote.subtitle}</Text> : <View style={{ height: 8 }} />}
        <View style={s.rule} />
        <View style={s.partyRow} wrap={false}>
          <PartyBox label="OPDRACHTGEVER" rows={clientRows(quote.client)} />
          <View style={s.partyGap} />
          <PartyBox label="DIENSTVERLENER" rows={ownRows(settings)} />
        </View>

        {(() => {
          let n = 0;
          return sections.map((sec, i) => {
            if (sec.title) n += 1;
            return <SectionView key={i} section={sec} number={n} quote={quote} />;
          });
        })()}

        <View wrap={false}>
          <Text style={s.h2}><Text style={s.h2Num}>{finalNumber}. </Text>Akkoordverklaring</Text>
          <Text style={s.p}>
            Door akkoord te geven verklaart de opdrachtgever in te stemmen met de beschreven scope, fasering en begroting van {settings.legalName}, en met de algemene voorwaarden op weareimpact.nl/voorwaarden.
          </Text>
          {accepted ? (
            <View style={s.stamp}>
              <Text style={s.stampTitle}>Digitaal akkoord vastgelegd</Text>
              <Text>{quote.acceptedName}{quote.acceptedRole ? `, ${quote.acceptedRole}` : ''}, namens {quote.client.legalName}</Text>
              <Text style={{ color: C.muted, marginTop: 2 }}>{acceptedAt} · offerte {quote.reference}</Text>
            </View>
          ) : (
            <View style={s.signRow}>
              <View style={s.signBox}>
                <Text style={s.partyLabel}>VOOR AKKOORD: OPDRACHTGEVER</Text>
                <Text>Naam: {quote.client.signerName}</Text>
                <Text>Functie: {quote.client.signerRole}</Text>
                <Text>Datum: ____________________</Text>
                <View style={s.signLine} />
                <Text style={s.signCaption}>Handtekening opdrachtgever</Text>
              </View>
              <View style={s.partyGap} />
              <View style={s.signBox}>
                <Text style={s.partyLabel}>NAMENS {settings.legalName.toUpperCase()}</Text>
                <Text>Naam: {settings.representedBy}</Text>
                <Text>Functie: {settings.representedRole}</Text>
                <Text>Datum: {nlDate(quote.issuedOn)}</Text>
                <View style={s.signLine} />
                <Text style={s.signCaption}>Handtekening {settings.legalName}</Text>
              </View>
            </View>
          )}
        </View>

        <Footer left={`${settings.tradeName} · Offerte ${quote.reference}`} settings={settings} />
      </Page>
    </Document>
  );
}

export async function renderQuotePdf(quote: Quote, settings: FinanceSettings): Promise<Buffer> {
  const logo = await loadLogo();
  return renderToBuffer(<QuoteDoc quote={quote} settings={settings} logo={logo} />);
}

// ---------- factuur ----------

function InvoiceDoc({ invoice, settings, logo }: { invoice: Invoice; settings: FinanceSettings; logo: Buffer | null }) {
  const credit = Boolean(invoice.creditForId);
  const lines = invoice.lines.map((l) => ({ ...l, optional: false, period: null }));
  const label = credit ? 'CREDITNOTA' : 'FACTUUR';
  const number = invoice.number ?? 'CONCEPT';
  return (
    <Document title={`${credit ? 'Creditnota' : 'Factuur'} ${number}`} author={settings.legalName}>
      <Page size="A4" style={s.page}>
        <Header
          logo={logo}
          tag={label}
          meta={[
            `Nummer: ${number}`,
            `Datum: ${invoice.issuedOn ? nlDate(invoice.issuedOn) : 'nog niet verstuurd'}`,
            ...(invoice.dueOn ? [`Vervaldatum: ${nlDate(invoice.dueOn)}`] : []),
            ...(invoice.quoteReference ? [`Offerte: ${invoice.quoteReference}`] : []),
          ]}
          settings={settings}
        />
        <Text style={s.title}>{invoice.title}</Text>
        {invoice.termLabel ? <Text style={s.subtitle}>{invoice.termLabel}</Text> : <View style={{ height: 8 }} />}
        <View style={s.rule} />
        <View style={s.partyRow} wrap={false}>
          <PartyBox label="FACTUUR AAN" rows={clientRows(invoice.client)} />
          <View style={s.partyGap} />
          <PartyBox label="VAN" rows={ownRows(settings)} />
        </View>

        <LinesTable lines={lines} vatRate={invoice.vatRate} />
        {invoice.notes ? <Text style={[s.p, { marginTop: 10 }]}>{invoice.notes}</Text> : null}

        {!credit ? (
          <View style={s.payBox} wrap={false}>
            <Text style={s.partyLabel}>BETALEN</Text>
            <Text style={s.p}>
              Gelieve <Text style={s.bold}>{formatEuro(invoice.totalCents)}</Text>
              <Text>{"  over te maken"}</Text>
              {invoice.dueOn ? <Text> uiterlijk <Text style={s.bold}>{nlDate(invoice.dueOn)}</Text></Text> : null}
              {settings.iban ? <Text> op IBAN <Text style={s.bold}>{settings.iban}</Text> t.n.v. {settings.legalName}</Text> : null}
              , onder vermelding van <Text style={s.bold}>{number}</Text>.
            </Text>
            <Text style={{ fontSize: 8.5, color: C.muted }}>
              Op alle leveringen zijn de algemene voorwaarden van toepassing (weareimpact.nl/voorwaarden). Bij niet-tijdige betaling zijn wettelijke handelsrente en incassokosten verschuldigd.
            </Text>
          </View>
        ) : null}

        <Footer left={`${settings.legalName} · KvK ${settings.kvk} · BTW ${settings.btw}`} settings={settings} />
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(invoice: Invoice, settings: FinanceSettings): Promise<Buffer> {
  const logo = await loadLogo();
  return renderToBuffer(<InvoiceDoc invoice={invoice} settings={settings} logo={logo} />);
}
