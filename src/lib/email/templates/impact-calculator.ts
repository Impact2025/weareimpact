// Bronnen:
// - Movisie (2024): "De stand van administratie- en regeldruk in het sociaal werk"
// - GemeenteNL (2025): AI-adoptie gemeenten Nederland
// - AZW (2024): Staat van de arbeidsmarkt sociaal werk
// - ZonMW: Burn-out in SWJK sector

const SECTOR_ADMIN_GEMIDDELDE = 37;       // Movisie 2024: gemiddeld 37% van werkdag
const SECTOR_ADMIN_ACCEPTABEL = 19;       // Movisie 2024: wat sociaal werkers zelf acceptabel vinden
const AI_ADOPTIE_WELZIJN_MIN = 15;        // GemeenteNL 2025: ondergrens adoptie
const AI_ADOPTIE_GEMEENTEN = 38;          // GemeenteNL 2025: 38% van gemeenten zet AI in
const SECTOR_VERZUIM = 7.4;              // AZW 2024: ziekteverzuim sociaal werk
const ADMIN_STRESS_PCT = 80;              // Movisie 2024: 80% ervaart stress door admin
const VERTREK_OVERWEGING_PCT = 30;        // Movisie 2024: 30% overweegt te vertrekken door admin

interface ImpactCalculatorEmailData {
  email: string;
  naam?: string;
  organisatie?: string;
  inputs: {
    fte: number;
    adminPct: number;
    aiPct: number;
    uurloon: number;
  };
  results: {
    weeklyHoursSaved: number;
    yearlyHoursSaved: number;
    extraContactsPerMonth: number;
    grossSavingsPerYear: number;
    hoursPerFTE: number;
    burnoutRange: string;
  };
}

function fmtN(n: number): string {
  return Math.round(n).toLocaleString('nl-NL');
}

function fmtEuro(n: number): string {
  if (n >= 100000) return `€ ${Math.round(n / 1000)}k`;
  const rounded = Math.round(n / 500) * 500;
  return `€ ${rounded.toLocaleString('nl-NL')}`;
}

interface Insight {
  title: string;
  body: string;
  type: 'warning' | 'neutral' | 'positive';
}

function generateInsights(
  inputs: { fte: number; adminPct: number; aiPct: number; uurloon: number },
  results: { weeklyHoursSaved: number; grossSavingsPerYear: number; hoursPerFTE: number }
): Insight[] {
  const insights: Insight[] = [];
  const adminDiff = inputs.adminPct - SECTOR_ADMIN_GEMIDDELDE;
  const totalAdminHours = Math.round(inputs.fte * 36 * inputs.adminPct / 100);
  const extraVsAcceptabel = Math.round(inputs.fte * 36 * (inputs.adminPct - SECTOR_ADMIN_ACCEPTABEL) / 100);

  // Insight 1: Admin druk positionering t.o.v. sectorgemiddelde
  if (adminDiff > 5) {
    insights.push({
      title: `Jouw administratiedruk is ${adminDiff}% bóven het sectorgemiddelde`,
      body: `Jouw team besteedt ${inputs.adminPct}% van de werkdag aan administratie. Het Movisie-onderzoek (2024, n=1.191 sociaal werkers) meet een sectorgemiddelde van 37%. Dat verschil van ${adminDiff} procentpunt staat gelijk aan ${fmtN(adminDiff / 100 * inputs.fte * 36)} extra uur per week die verloren gaan ten opzichte van vergelijkbare organisaties — en sociaal werkers zelf vinden 19% het maximum.`,
      type: 'warning',
    });
  } else if (adminDiff < -5) {
    insights.push({
      title: `Jouw team presteert beter dan 60% van de sector`,
      body: `Met ${inputs.adminPct}% administratiedruk zit jouw organisatie ${Math.abs(adminDiff)} procentpunt ónder het sectorgemiddelde van 37% (Movisie, 2024). Dat is een sterk signaal van efficiënte processen. Toch zijn er nog ${fmtN(results.weeklyHoursSaved)} uur per week vrij te maken — het verschil tussen goed en excellent.`,
      type: 'positive',
    });
  } else {
    insights.push({
      title: `Jouw administratiedruk zit op het sectorgemiddelde — maar 'normaal' is niet genoeg`,
      body: `${inputs.adminPct}% van de werkdag gaat op aan verslaglegging — dat is ${fmtN(totalAdminHours)} uur per week. Sociaal werkers zelf zeggen dat 19% het maximum zou mogen zijn (Movisie, 2024). Dat betekent dat er momenteel ${fmtN(extraVsAcceptabel)} uur per week bóvenop het acceptable niveau wordt besteed aan administratie in jouw team.`,
      type: 'neutral',
    });
  }

  // Insight 2: AI adoptie gap
  if (inputs.aiPct < AI_ADOPTIE_WELZIJN_MIN) {
    insights.push({
      title: `AI-adoptiegat: ${AI_ADOPTIE_WELZIJN_MIN - inputs.aiPct}% onder het marktgemiddelde`,
      body: `Jouw organisatie zet ${inputs.aiPct}% AI in, terwijl 38% van de Nederlandse gemeenten al actief AI toepast (GemeenteNL, 2025). Organisaties die dit gat nu dichten bouwen een structureel voordeel op in de strijd om vakpersoneel — want ${VERTREK_OVERWEGING_PCT}% van sociaal werkers overweegt de sector te verlaten vanwege administratiedruk (Movisie, 2024). Vroeg adopteren is ook een retentiestrategie.`,
      type: 'warning',
    });
  } else if (inputs.aiPct <= AI_ADOPTIE_GEMEENTEN) {
    insights.push({
      title: `Jouw AI-adoptie zit in de middenmoot — er is ruimte om koploper te worden`,
      body: `Met ${inputs.aiPct}% AI-adoptie zit jouw organisatie op het marktgemiddelde (15–38%, GemeenteNL 2025). De organisaties die nu doorpakken worden de magneet voor vakpersoneel: minder rapportagelast betekent hogere medewerkerstevredenheid en lagere uitstroom. Het sector-ziekteverzuim staat op ${SECTOR_VERZUIM}% (AZW, 2024) — elke procentpunt minder kost jouw organisatie gemiddeld ${fmtEuro(inputs.fte * inputs.uurloon * 36 * 0.074 * 0.01)}/jaar.`,
      type: 'neutral',
    });
  } else {
    insights.push({
      title: `Jouw organisatie loopt voorop — de volgende stap is verdieping`,
      body: `Met ${inputs.aiPct}% AI-adoptie behoort jouw organisatie tot de koplopers in de sector (marktgemiddelde: 15–38%, GemeenteNL 2025). De winst zit niet meer in starten, maar in integreren: losse tools omzetten naar end-to-end workflows die ${fmtN(results.weeklyHoursSaved)} uur per week structureel vrijmaken.`,
      type: 'positive',
    });
  }

  // Insight 3: Burn-out risico en personeelskosten
  if (inputs.adminPct >= 45) {
    insights.push({
      title: `Hoogste risicosignaal: burn-out als kostenpost`,
      body: `Bij een administratiedruk van ${inputs.adminPct}% bevindt jouw team zich in de hoogste risicocategorie. ZonMW-onderzoek toont aan dat burn-out in de sector Sociaal Werk, Jeugdzorg en Kinderopvang de #1 oorzaak is van langdurig ziekteverzuim. Met een sector-verzuimpercentage van ${SECTOR_VERZUIM}% en een gemiddelde verzuimkosten van 350–450 euro per dag, kost elke maand uitstel jouw organisatie naar schatting ${fmtEuro(results.grossSavingsPerYear / 12)} aan vermijdbare personeelskosten.`,
      type: 'warning',
    });
  } else if (inputs.adminPct >= SECTOR_ADMIN_GEMIDDELDE) {
    insights.push({
      title: `${ADMIN_STRESS_PCT}% van jouw medewerkers ervaart waarschijnlijk stress door rapportages`,
      body: `Op of boven het sectorgemiddelde van 37% administratiedruk ervaart ${ADMIN_STRESS_PCT}% van sociaal werkers stress (Movisie, 2024). Dat is geen zachte factor: het sector-ziekteverzuim staat op ${SECTOR_VERZUIM}% (AZW, 2024) en burn-out is de #1 oorzaak van langdurig verzuim in jouw sector. Elke uur dat AI wegneemt van de rapportagedruk verlaagt direct het risico op uitval.`,
      type: 'neutral',
    });
  } else {
    insights.push({
      title: `Retentiekans: jouw lage admin-druk is een werkgeversvoordeel`,
      body: `Met ${inputs.adminPct}% administratiedruk — onder het sectorgemiddelde — heeft jouw organisatie al een relatief voordeel in werknemerstevredenheid. ${VERTREK_OVERWEGING_PCT}% van sociaal werkers overweegt vertrek juist vanwege rapportagedruk (Movisie, 2024). Door dit voordeel nu verder te versterken met AI, vergroot je de afstand tot concurrerende werkgevers en bespaar je op wervings- en inloopkosten.`,
      type: 'positive',
    });
  }

  return insights;
}

const INSIGHT_COLORS: Record<Insight['type'], { bg: string; border: string; titleColor: string; bodyColor: string; dot: string }> = {
  warning: { bg: '#fff7ed', border: '#fed7aa', titleColor: '#9a3412', bodyColor: '#7c2d12', dot: '#f97316' },
  neutral: { bg: '#f8fafc', border: '#e2e8f0', titleColor: '#0f172a', bodyColor: '#475569', dot: '#64748b' },
  positive: { bg: '#f0fdf4', border: '#bbf7d0', titleColor: '#14532d', bodyColor: '#166534', dot: '#16a34a' },
};

export function generateImpactCalculatorEmail(data: ImpactCalculatorEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { naam, organisatie, inputs, results } = data;
  const greeting = naam ? naam.split(' ')[0] : organisatie || 'daar';
  const orgLine = organisatie ? ` voor ${organisatie}` : '';
  const subject = `Jouw Impact Rapport${orgLine} — ${fmtN(results.weeklyHoursSaved)} uur/week tijdwinst`;

  const insights = generateInsights(inputs, results);

  const adminVsSector = inputs.adminPct - SECTOR_ADMIN_GEMIDDELDE;
  const adminPositie = adminVsSector > 2 ? `↑ ${adminVsSector}% boven gem.` : adminVsSector < -2 ? `↓ ${Math.abs(adminVsSector)}% onder gem.` : '= op gem.';
  const adminPositieColor = adminVsSector > 2 ? '#dc2626' : adminVsSector < -2 ? '#16a34a' : '#64748b';

  const aiVsSector = inputs.aiPct - AI_ADOPTIE_WELZIJN_MIN;
  const aiPositie = aiVsSector >= 0 ? `↑ ${inputs.aiPct}% (boven min.)` : `↓ ${Math.abs(aiVsSector)}% onder gem.`;
  const aiPositieColor = aiVsSector >= 0 ? '#16a34a' : '#dc2626';

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jouw Impact Rapport</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;color:#334155;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:48px 40px 40px;text-align:center;">
        <p style="margin:0 0 16px;font-size:11px;letter-spacing:3px;color:#f97316;font-weight:700;text-transform:uppercase;">Persoonlijk Impact Rapport</p>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:30px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
          Jouw welzijnsorganisatie<br>kan <span style="color:#f97316;">${fmtN(results.weeklyHoursSaved)} uur</span> per week<br>terugwinnen
        </h1>
        <p style="margin:16px 0 0;color:#94a3b8;font-size:15px;">
          ${inputs.fte} medewerkers · ${inputs.adminPct}% administratie · ${inputs.aiPct}% AI-adoptie
        </p>
      </td>
    </tr>

    <!-- Intro -->
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#475569;">
          Hoi ${greeting},
        </p>
        <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#475569;">
          Hier is jouw persoonlijke impactanalyse — inclusief jouw berekende tijdwinst, een vergelijking met actuele sectorbenchmarks en drie inzichten die specifiek gelden voor jouw situatie.
        </p>
      </td>
    </tr>

    <!-- Drie hoofd-KPI's -->
    <tr>
      <td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="32%" style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tijdwinst</p>
              <p style="margin:0;font-size:36px;font-weight:900;color:#ffffff;line-height:1;">${fmtN(results.weeklyHoursSaved)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">uur / week</p>
            </td>
            <td width="4%">&nbsp;</td>
            <td width="32%" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Cliëntcontact</p>
              <p style="margin:0;font-size:36px;font-weight:900;color:#15803d;line-height:1;">+${fmtN(results.extraContactsPerMonth)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">gesprekken / maand</p>
            </td>
            <td width="4%">&nbsp;</td>
            <td width="32%" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:1px;">ROI / jaar</p>
              <p style="margin:0;font-size:28px;font-weight:900;color:#0f172a;line-height:1;">${fmtEuro(results.grossSavingsPerYear)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#475569;">operationele waarde</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SECTOR VERGELIJKING -->
    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">Sectorvergelijking</h2>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Hoe staat jouw organisatie t.o.v. actuele benchmarks?</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr style="background:#f1f5f9;">
            <td style="padding:10px 16px;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Indicator</td>
            <td style="padding:10px 16px;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Jouw org.</td>
            <td style="padding:10px 16px;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Sectorgemiddelde</td>
            <td style="padding:10px 16px;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Positie</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">Administratiedruk</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;text-align:center;border-bottom:1px solid #f1f5f9;">${inputs.adminPct}%</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">37% <span style="font-size:11px;">(Movisie, 2024)</span></td>
            <td style="padding:12px 16px;font-size:12px;font-weight:700;color:${adminPositieColor};text-align:center;border-bottom:1px solid #f1f5f9;">${adminPositie}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">Gewenste admin-druk (sector)</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">—</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">19% <span style="font-size:11px;">(Movisie, 2024)</span></td>
            <td style="padding:12px 16px;font-size:12px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">Doel</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">AI-adoptie voor admin</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;text-align:center;border-bottom:1px solid #f1f5f9;">${inputs.aiPct}%</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">15–38% <span style="font-size:11px;">(GemeenteNL, 2025)</span></td>
            <td style="padding:12px 16px;font-size:12px;font-weight:700;color:${aiPositieColor};text-align:center;border-bottom:1px solid #f1f5f9;">${aiPositie}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">Ziekteverzuim sector</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">—</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">7,4% <span style="font-size:11px;">(AZW, 2024)</span></td>
            <td style="padding:12px 16px;font-size:12px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">Benchmark</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:12px 16px;font-size:13px;color:#475569;">Stress door admin (sector)</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;">—</td>
            <td style="padding:12px 16px;font-size:13px;color:#64748b;text-align:center;">80% <span style="font-size:11px;">(Movisie, 2024)</span></td>
            <td style="padding:12px 16px;font-size:12px;color:#dc2626;text-align:center;">Risicofactor</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- GEPERSONALISEERDE INZICHTEN -->
    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">3 Inzichten voor jouw organisatie</h2>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Op basis van jouw inputs — niet generiek, maar specifiek voor ${inputs.fte} FTE met ${inputs.adminPct}% administratiedruk.</p>
        ${insights.map((insight, i) => {
          const colors = INSIGHT_COLORS[insight.type];
          return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.bg};border:1px solid ${colors.border};border-radius:12px;margin-bottom:12px;">
          <tr>
            <td style="padding:20px 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:top;padding-top:3px;">
                    <span style="display:inline-block;width:20px;height:20px;background:${colors.dot};border-radius:50%;color:#fff;font-weight:900;font-size:10px;text-align:center;line-height:20px;">${i + 1}</span>
                  </td>
                  <td>
                    <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:${colors.titleColor};">${insight.title}</p>
                    <p style="margin:0;font-size:13px;color:${colors.bodyColor};line-height:1.65;">${insight.body}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
        }).join('')}
      </td>
    </tr>

    <!-- Detailtabel -->
    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 16px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">Jouw berekening in detail</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          ${[
            ['Teamomvang', `${inputs.fte} medewerkers (FTE)`],
            ['Huidige administratiedruk', `${inputs.adminPct}% van de werkdag`],
            ['Sectorgemiddelde (Movisie 2024)', `${SECTOR_ADMIN_GEMIDDELDE}% van de werkdag`],
            ['Huidige AI-adoptie', `${inputs.aiPct}%`],
            ['Gehanteerde AI-reductiefactor', '40% (conservatief; range 30–50% uit pilots)'],
            ['Tijdwinst per medewerker', `${Math.round(results.hoursPerFTE * 10) / 10} uur per week`],
            ['Totale teamtijdwinst per week', `${fmtN(results.weeklyHoursSaved)} uur`],
            ['Totale teamtijdwinst per jaar', `${fmtN(results.yearlyHoursSaved)} uur`],
            ['Extra cliëntgesprekken / maand', `${fmtN(results.extraContactsPerMonth)} gesprekken (à 90 min)`],
            ['Bruto operationele waarde / jaar', fmtEuro(results.grossSavingsPerYear)],
            ['Verwachte daling burn-out risico', results.burnoutRange],
          ].map(([label, value], i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">${value}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>

    <!-- IMPLEMENTATIEPLAN 12 weken -->
    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">12-weekse implementatieroadmap</h2>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Bewezen aanpak voor welzijnsorganisaties van ${inputs.fte <= 30 ? 'klein' : inputs.fte <= 100 ? 'middelgroot' : 'groot'} formaat.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            { weeks: 'Week 1–2', phase: 'AI Readiness Scan', desc: `Inventarisatie van de huidige rapportageprocessen, tooling en pijnpunten. Output: prioriteitenlijst met quick wins voor jouw ${inputs.fte} FTE.`, color: '#f97316' },
            { weeks: 'Week 3–4', phase: 'Toolselectie & Pilot Setup', desc: 'Selectie van Voice-to-Report tooling passend bij jouw ECD-systeem. Privacy-check (AVG), DPIA-opzet en pilotgroep samenstellen (5–8 medewerkers).', color: '#8b5cf6' },
            { weeks: 'Week 5–8', phase: 'Pilot Voice-to-Report', desc: `Pilotgroep werkt met AI-rapportage. Wekelijkse retrospectives. Doel: ${Math.round(results.hoursPerFTE * 10) / 10} uur/medewerker/week terugwinnen — aantoonbaar, meetbaar.`, color: '#0ea5e9' },
            { weeks: 'Week 9–12', phase: 'Uitrol & Borging', desc: `Uitrol naar de volledige organisatie. Training, handleiding en meetpunt na 90 dagen. Verwachte structurele tijdwinst: ${fmtN(results.weeklyHoursSaved)} uur/week.`, color: '#16a34a' },
          ].map(({ weeks, phase, desc, color }) => `
          <tr>
            <td style="padding:0 0 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border-left:4px solid ${color};">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${weeks}</p>
                    <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#0f172a;">${phase}</p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.55;">${desc}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:32px 40px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:16px;">
          <tr>
            <td style="padding:32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Volgende stap</p>
              <h3 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
                Zet jouw ${fmtN(results.weeklyHoursSaved)} uur/week om in realiteit
              </h3>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                Plan een gratis 30-minuten AI Readiness Gesprek. Samen bekijken we welke aanpak het best past bij jouw ${inputs.fte}-koppige team en jouw specifieke situatie.
              </p>
              <a href="https://weareimpact.nl/contact" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:100px;font-weight:800;font-size:15px;letter-spacing:0.3px;">
                Plan een gratis gesprek →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
                Of mail direct: <a href="mailto:v.munster@weareimpact.nl" style="color:#f97316;">v.munster@weareimpact.nl</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Bronnen -->
    <tr>
      <td style="padding:0 40px 32px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Bronnen</p>
        <p style="margin:0;font-size:11px;color:#cbd5e1;line-height:1.8;">
          Movisie (2024). <em>De stand van administratie- en regeldruk in het sociaal werk</em> (n=1.191 sociaal werkers).<br>
          GemeenteNL (2025). <em>AI-adoptie Nederlandse gemeenten</em> (n=784 gemeentelijke functionarissen).<br>
          AZW / Arbeidsmarkt Zorg & Welzijn (2024). <em>De staat van de arbeidsmarkt sociaal werk 2024</em>.<br>
          ZonMW. <em>Burn-out bij werknemers binnen de sector Sociaal Werk, Jeugdzorg en Kinderopvang</em>.
        </p>
      </td>
    </tr>

    <!-- Signature -->
    <tr>
      <td style="padding:0 40px 40px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:16px;vertical-align:top;">
              <div style="width:48px;height:48px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:16px;text-align:center;line-height:48px;">VM</div>
            </td>
            <td>
              <p style="margin:0;font-size:15px;font-weight:800;color:#0f172a;">Vincent van Munster</p>
              <p style="margin:2px 0 0;font-size:13px;color:#64748b;">WeAreImpact · AI Strategie voor de sociale sector</p>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;font-style:italic;">
                "Goede zorg begint met tijd voor de cliënt."
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-align:center;">
          WeAreImpact — Innovatie met een sociaal hart
        </p>
        <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
          <a href="https://weareimpact.nl" style="color:#f97316;text-decoration:none;">weareimpact.nl</a>
          &nbsp;·&nbsp;
          <a href="mailto:v.munster@weareimpact.nl" style="color:#f97316;text-decoration:none;">v.munster@weareimpact.nl</a>
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>
  `.trim();

  const adminVsSectorText = adminVsSector > 2
    ? `${adminVsSector}% BOVEN het sectorgemiddelde (37%, Movisie 2024)`
    : adminVsSector < -2
    ? `${Math.abs(adminVsSector)}% ONDER het sectorgemiddelde (37%, Movisie 2024)`
    : `OP het sectorgemiddelde (37%, Movisie 2024)`;

  const text = `
PERSOONLIJK IMPACT RAPPORT — WE ARE IMPACT
==========================================

Hoi ${greeting},

Hier is jouw gepersonaliseerde impactanalyse inclusief sectorbenchmarks en implementatieplan.

JOUW DRIE KERN-RESULTATEN
--------------------------
• Tijdwinst:             ${fmtN(results.weeklyHoursSaved)} uur per week
• Cliëntcontact:        +${fmtN(results.extraContactsPerMonth)} extra gesprekken per maand
• Operationele waarde:   ${fmtEuro(results.grossSavingsPerYear)} per jaar

SECTORVERGELIJKING
------------------
• Jouw administratiedruk: ${inputs.adminPct}% — ${adminVsSectorText}
• Gewenst door sector:    19% (Movisie 2024, wat sociaal werkers zelf acceptabel vinden)
• Jouw AI-adoptie:        ${inputs.aiPct}% (sectorbandbreedte: 15–38%, GemeenteNL 2025)
• Ziekteverzuim sector:   7,4% (AZW 2024) — burn-out = #1 oorzaak langdurig verzuim

JOUW 3 GEPERSONALISEERDE INZICHTEN
------------------------------------
${insights.map((ins, i) => `${i + 1}. ${ins.title}\n   ${ins.body}`).join('\n\n')}

BEREKENING
----------
• Team:                    ${inputs.fte} medewerkers
• Administratiedruk:       ${inputs.adminPct}% (sectorgemiddelde: ${SECTOR_ADMIN_GEMIDDELDE}%)
• Huidige AI-adoptie:      ${inputs.aiPct}%
• AI-reductiefactor:       40% (conservatief; range 30–50% uit pilots)
• Tijdwinst per mdw/week:  ${Math.round(results.hoursPerFTE * 10) / 10} uur
• Totale tijdwinst/week:   ${fmtN(results.weeklyHoursSaved)} uur
• Totale tijdwinst/jaar:   ${fmtN(results.yearlyHoursSaved)} uur
• Extra gesprekken/maand:  ${fmtN(results.extraContactsPerMonth)} (à 90 min)
• Bruto waarde/jaar:       ${fmtEuro(results.grossSavingsPerYear)}

12-WEEKSE IMPLEMENTATIEROADMAP
-------------------------------
Week 1–2:  AI Readiness Scan — inventarisatie processen en pijnpunten
Week 3–4:  Toolselectie & Pilot Setup — AVG-check, DPIA, pilotgroep
Week 5–8:  Pilot Voice-to-Report — meten, bijsturen, aantonen
Week 9–12: Uitrol & Borging — training, handleiding, 90-dagenmetingen

BRONNEN
-------
• Movisie (2024). De stand van administratie- en regeldruk in het sociaal werk (n=1.191)
• GemeenteNL (2025). AI-adoptie Nederlandse gemeenten (n=784)
• AZW (2024). De staat van de arbeidsmarkt sociaal werk 2024
• ZonMW. Burn-out bij werknemers binnen de sector SWJK

VOLGENDE STAP
-------------
Plan een gratis 30-minuten AI Readiness Gesprek:
https://weareimpact.nl/contact

Of mail direct: v.munster@weareimpact.nl

Vincent van Munster
WeAreImpact — Innovatie met een sociaal hart
weareimpact.nl
  `.trim();

  return { subject, html, text };
}
