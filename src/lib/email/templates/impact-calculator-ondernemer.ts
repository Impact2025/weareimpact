// Rapportmail voor de ondernemersvariant van de Impact Calculator.
// Alle cijfers komen uit calculateOndernemer (server-side herberekend), niet uit de browser.

import {
  PROCESSEN,
  REDUCTIE,
  SPRINT_PRIJS,
  WERKWEKEN_PER_JAAR,
  type OndernemerInputs,
  type OndernemerResults,
} from '@/lib/impact-calculator/ondernemer';

interface OndernemerEmailData {
  email: string;
  naam?: string;
  organisatie?: string;
  inputs: OndernemerInputs;
  results: OndernemerResults;
}

function fmtN(n: number): string {
  return Math.round(n).toLocaleString('nl-NL');
}

function fmtUren(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString('nl-NL', { maximumFractionDigits: 1 });
}

function fmtEuro(n: number): string {
  const rounded = n >= 100000 ? Math.round(n / 1000) * 1000 : Math.round(n / 500) * 500;
  return `€ ${rounded.toLocaleString('nl-NL')}`;
}

function fmtTijd(weken: number | null): string {
  if (weken === null) return 'niet binnen bereik';
  if (weken < 1) return 'minder dan 1 week';
  if (weken <= 20) return `${Math.round(weken)} ${Math.round(weken) === 1 ? 'week' : 'weken'}`;
  return `${Math.round(weken / 4.33)} maanden`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface Insight {
  title: string;
  body: string;
  type: 'warning' | 'neutral' | 'positive';
}

function generateInsights(i: OndernemerInputs, r: OndernemerResults, procesNaam: string): Insight[] {
  const insights: Insight[] = [];

  // 1. Omvang van het lek
  const jaarUren = i.urenPerWeek * WERKWEKEN_PER_JAAR;
  const jaarKosten = jaarUren * i.uurwaarde;
  insights.push({
    title: `${procesNaam} kost je nu ongeveer ${fmtN(jaarUren)} uur per jaar`,
    body: `Bij ${i.urenPerWeek} uur per week en € ${i.uurwaarde} per uur is dat ${fmtEuro(jaarKosten)} aan tijd, ruim ${fmtN(jaarUren / 8)} werkdagen. Dat is het totaal van dit ene proces. Daarvan gaat naar onze inschatting ${fmtUren(r.weeklyHoursSavedLaag)} tot ${fmtUren(r.weeklyHoursSavedHoog)} uur per week naar AI, met jouw controle erover.`,
    type: 'neutral',
  });

  // 2. Terugverdientijd
  if (r.terugverdientijdWeken === null) {
    insights.push({
      title: 'Met deze invoer dekt de tijdwinst de toolkosten niet',
      body: `Je verwacht € ${i.toolkostenPerMaand} per maand aan toolkosten, terwijl de vrijgekomen tijd ${fmtEuro(r.grossSavingsPerYear)} per jaar waard is. Kies een proces waar meer uren in zitten, of kijk of de toolkosten lager kunnen. Dat bespreken we graag voordat je iets koopt.`,
      type: 'warning',
    });
  } else if (r.terugverdientijdWeken <= 12) {
    insights.push({
      title: `De Sprint verdient zichzelf terug in ${fmtTijd(r.terugverdientijdWeken)}`,
      body: `Tegenover de vaste Sprintprijs van € ${fmtN(SPRINT_PRIJS)} (excl. btw) staat na toolkosten ${fmtEuro(r.nettoPerYear)} per jaar aan vrijgekomen tijd. Ook bij de voorzichtige variant (${Math.round(REDUCTIE.laag * 100)}% tijdwinst) is dat ${fmtTijd(r.terugverdientijdWekenLaag)}.`,
      type: 'positive',
    });
  } else {
    insights.push({
      title: `Terugverdientijd van ${fmtTijd(r.terugverdientijdWeken)}`,
      body: `Dat is te doen, maar niet ontzettend snel. Bij de voorzichtige variant (${Math.round(REDUCTIE.laag * 100)}% tijdwinst) is het ${fmtTijd(r.terugverdientijdWekenLaag)}. Een proces met meer wekelijkse uren verbetert dit het snelst. Kijk daarom ook naar een ander proces voordat je kiest.`,
      type: 'neutral',
    });
  }

  // 3. Eerste stap
  insights.push({
    title: 'Begin met dit ene proces, niet met alles tegelijk',
    body: `Een AI-oplossing werkt het best op één afgebakend proces met vaste stappen. In het Fit & Focus gesprek (20 tot 30 minuten) kiezen we samen of ${procesNaam} daarvoor de beste kandidaat is, en wat jij nodig hebt om het na de Sprint zelf te blijven doen.`,
    type: 'positive',
  });

  return insights;
}

const INSIGHT_COLORS: Record<Insight['type'], { bg: string; border: string; titleColor: string; bodyColor: string; dot: string }> = {
  warning: { bg: '#fff7ed', border: '#fed7aa', titleColor: '#9a3412', bodyColor: '#7c2d12', dot: '#f97316' },
  neutral: { bg: '#f8fafc', border: '#e2e8f0', titleColor: '#0f172a', bodyColor: '#475569', dot: '#64748b' },
  positive: { bg: '#f0fdf4', border: '#bbf7d0', titleColor: '#14532d', bodyColor: '#166534', dot: '#16a34a' },
};

export function generateOndernemerEmail(data: OndernemerEmailData): { subject: string; html: string; text: string } {
  const { naam, organisatie, inputs, results } = data;
  const greeting = esc(naam ? naam.split(' ')[0] : organisatie || 'daar');
  const procesNaam = PROCESSEN.find((p) => p.id === inputs.proces)?.korteNaam ?? 'dit proces';
  const orgLine = organisatie ? ` voor ${organisatie}` : '';
  const subject = `Jouw tijdwinst-rapport${orgLine}: ${fmtUren(results.weeklyHoursSaved)} uur per week`;
  const insights = generateInsights(inputs, results, procesNaam);

  const details: [string, string][] = [
    ['Proces', procesNaam],
    ['Uren per week aan dit proces', `${inputs.urenPerWeek} uur`],
    ['Waarde van een uur', `€ ${inputs.uurwaarde}`],
    ['Aangenomen tijdwinst', `${Math.round(REDUCTIE.midden * 100)}% (bandbreedte ${Math.round(REDUCTIE.laag * 100)} tot ${Math.round(REDUCTIE.hoog * 100)}%, eigen aanname)`],
    ['Tijdwinst per week', `${fmtUren(results.weeklyHoursSaved)} uur (${fmtUren(results.weeklyHoursSavedLaag)} tot ${fmtUren(results.weeklyHoursSavedHoog)})`],
    ['Tijdwinst per jaar', `${fmtN(results.yearlyHoursSaved)} uur (${WERKWEKEN_PER_JAAR} werkweken)`],
    ['Gelijk aan', `${fmtUren(results.dagenPerJaar)} werkdagen per jaar`],
    ['Waarde van de vrijgekomen tijd', `${fmtEuro(results.grossSavingsPerYear)} per jaar`],
    ['Toolkosten (eigen inschatting)', `€ ${inputs.toolkostenPerMaand} per maand`],
    ['Netto na toolkosten', `${fmtEuro(results.nettoPerYear)} per jaar`],
    ['Investering Doorbraak Sprint', `€ ${fmtN(SPRINT_PRIJS)} excl. btw`],
    ['Terugverdientijd', fmtTijd(results.terugverdientijdWeken)],
  ];

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jouw tijdwinst-rapport</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;color:#334155;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <tr>
      <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:48px 40px 40px;text-align:center;">
        <p style="margin:0 0 16px;font-size:11px;letter-spacing:3px;color:#f97316;font-weight:700;text-transform:uppercase;">Persoonlijk rapport</p>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:30px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
          Jouw proces laat<br><span style="color:#f97316;">${fmtUren(results.weeklyHoursSaved)} uur</span> per week liggen
        </h1>
        <p style="margin:16px 0 0;color:#94a3b8;font-size:15px;">
          ${esc(procesNaam)} · ${inputs.urenPerWeek} uur per week · € ${inputs.uurwaarde} per uur
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:40px 40px 0;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#475569;">Hoi ${greeting},</p>
        <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#475569;">
          Hieronder staat je berekening, met alle aannames erbij. De tijdwinst is een inschatting en geen garantie: het werkelijke resultaat meten we pas in jouw situatie.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="32%" style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tijdwinst</p>
              <p style="margin:0;font-size:36px;font-weight:900;color:#ffffff;line-height:1;">${fmtUren(results.weeklyHoursSaved)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">uur / week</p>
            </td>
            <td width="4%">&nbsp;</td>
            <td width="32%" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Waarde</p>
              <p style="margin:0;font-size:28px;font-weight:900;color:#15803d;line-height:1.1;">${fmtEuro(results.grossSavingsPerYear)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">aan tijd / jaar</p>
            </td>
            <td width="4%">&nbsp;</td>
            <td width="32%" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Terugverdiend</p>
              <p style="margin:0;font-size:22px;font-weight:900;color:#0f172a;line-height:1.2;">${fmtTijd(results.terugverdientijdWeken)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#475569;">na de Sprint</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">3 inzichten voor jouw situatie</h2>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">Op basis van jouw invoer, niet generiek.</p>
        ${insights.map((insight, idx) => {
          const c = INSIGHT_COLORS[insight.type];
          return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border:1px solid ${c.border};border-radius:12px;margin-bottom:12px;">
          <tr>
            <td style="padding:20px 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:top;padding-top:3px;">
                    <span style="display:inline-block;width:20px;height:20px;background:${c.dot};border-radius:50%;color:#fff;font-weight:900;font-size:10px;text-align:center;line-height:20px;">${idx + 1}</span>
                  </td>
                  <td>
                    <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:${c.titleColor};">${insight.title}</p>
                    <p style="margin:0;font-size:13px;color:${c.bodyColor};line-height:1.65;">${insight.body}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
        }).join('')}
      </td>
    </tr>

    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 16px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">Jouw berekening in detail</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          ${details.map(([label, value], idx) => `
          <tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
            <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">${esc(value)}</td>
          </tr>`).join('')}
        </table>
        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
          De waarde is de waarde van vrijgekomen tijd en geen extra omzet. De tijdwinstpercentages zijn een eigen aanname voor één afgebakend, terugverdienend proces met menselijke controle.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:32px 40px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:16px;">
          <tr>
            <td style="padding:32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Volgende stap</p>
              <h3 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
                Kies samen met mij het juiste proces
              </h3>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                In een Fit &amp; Focus gesprek van 20 tot 30 minuten bepalen we welk proces zich het best leent. Daarna zet ik het in één dagdeel live in jouw eigen omgeving, met menselijke controle en 14 dagen nazorg. Vaste prijs € ${fmtN(SPRINT_PRIJS)} excl. btw.
              </p>
              <a href="https://weareimpact.nl/doorbraak-sprint" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:100px;font-weight:800;font-size:15px;letter-spacing:0.3px;">
                Bekijk de Doorbraak Sprint →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
                Of mail direct: <a href="mailto:v.munster@weareimpact.nl" style="color:#f97316;">v.munster@weareimpact.nl</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0;font-size:15px;font-weight:800;color:#0f172a;">Vincent van Munster</p>
        <p style="margin:2px 0 0;font-size:13px;color:#64748b;">WeAreImpact · Procesversneller voor sociale en duurzame ondernemers</p>
      </td>
    </tr>

    <tr>
      <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
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

  const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');
  const text = `
JOUW TIJDWINST-RAPPORT, WEAREIMPACT
===================================

Hoi ${naam ? naam.split(' ')[0] : organisatie || 'daar'},

Hieronder staat je berekening, met alle aannames erbij. De tijdwinst is een inschatting en geen garantie.

KERNRESULTATEN
--------------
- Tijdwinst:       ${fmtUren(results.weeklyHoursSaved)} uur per week (${fmtUren(results.weeklyHoursSavedLaag)} tot ${fmtUren(results.weeklyHoursSavedHoog)})
- Waarde:          ${fmtEuro(results.grossSavingsPerYear)} per jaar aan vrijgekomen tijd
- Terugverdiend:   ${fmtTijd(results.terugverdientijdWeken)} (Sprint € ${fmtN(SPRINT_PRIJS)} excl. btw)

INZICHTEN
---------
${insights.map((ins, idx) => `${idx + 1}. ${stripTags(ins.title)}\n   ${stripTags(ins.body)}`).join('\n\n')}

BEREKENING
----------
${details.map(([l, v]) => `- ${l}: ${v}`).join('\n')}

VOLGENDE STAP
-------------
Kies samen met mij het juiste proces in een Fit & Focus gesprek van 20 tot 30 minuten:
https://weareimpact.nl/doorbraak-sprint

Of mail direct: v.munster@weareimpact.nl

Vincent van Munster
WeAreImpact, Procesversneller voor sociale en duurzame ondernemers
  `.trim();

  return { subject, html, text };
}
