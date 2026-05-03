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

export function generateImpactCalculatorEmail(data: ImpactCalculatorEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { naam, organisatie, inputs, results } = data;
  const greeting = naam ? naam.split(' ')[0] : organisatie || 'daar';
  const orgLine = organisatie ? ` voor ${organisatie}` : '';
  const subject = `Jouw Impact Rapport${orgLine} — ${fmtN(results.weeklyHoursSaved)} uur/week tijdwinst`;

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
        <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#475569;">
          Hier is jouw gepersonaliseerde Impact Rapport op basis van de gegevens die je hebt ingevoerd in de <strong style="color:#0f172a;">We Are Impact Tijdwinst Checker</strong>.
        </p>
        <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#475569;">
          De conclusie is helder: er is significante ruimte om tijd, cliëntcontact en budget terug te winnen — met bewezen AI-technologie die al beschikbaar is.
        </p>
      </td>
    </tr>

    <!-- Drie hoofd-KPI's -->
    <tr>
      <td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <!-- KPI 1 -->
            <td width="32%" style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Tijdwinst</p>
              <p style="margin:0;font-size:36px;font-weight:900;color:#ffffff;line-height:1;">${fmtN(results.weeklyHoursSaved)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">uur / week</p>
            </td>
            <td width="4%">&nbsp;</td>
            <!-- KPI 2 -->
            <td width="32%" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Cliëntcontact</p>
              <p style="margin:0;font-size:36px;font-weight:900;color:#15803d;line-height:1;">+${fmtN(results.extraContactsPerMonth)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">gesprekken / maand</p>
            </td>
            <td width="4%">&nbsp;</td>
            <!-- KPI 3 -->
            <td width="32%" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:16px;padding:24px 20px;text-align:center;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:11px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:1px;">ROI / jaar</p>
              <p style="margin:0;font-size:28px;font-weight:900;color:#0f172a;line-height:1;">${fmtEuro(results.grossSavingsPerYear)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#475569;">operationele waarde</p>
            </td>
          </tr>
        </table>
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
            ['Sectorgemiddelde (NL)', '40% van de werkdag'],
            ['Huidige AI-adoptie', `${inputs.aiPct}%`],
            ['Gehanteerde AI-reductiefactor', '40% (conservatief)'],
            ['Tijdwinst per medewerker', `${Math.round(results.hoursPerFTE * 10) / 10} uur per week`],
            ['Totale teamtijdwinst per week', `${fmtN(results.weeklyHoursSaved)} uur`],
            ['Totale teamtijdwinst per jaar', `${fmtN(results.yearlyHoursSaved)} uur`],
            ['Extra cliëntgesprekken / maand', `${fmtN(results.extraContactsPerMonth)} gesprekken (à 90 min)`],
            ['Bruto operationele waarde / jaar', fmtEuro(results.grossSavingsPerYear)],
            ['Verwachte daling burn-out', results.burnoutRange],
          ].map(([label, value], i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
              <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">${value}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>

    <!-- Wat betekent dit? -->
    <tr>
      <td style="padding:32px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 12px 12px 0;padding:24px;">
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Wat betekent dit in de praktijk?</p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#7c2d12;">
                Jouw ${inputs.fte}-koppig team besteedt momenteel circa <strong>${fmtN(inputs.fte * 36 * inputs.adminPct / 100)} uur per week</strong> aan verslaglegging en administratie.
                Met Voice-to-Report en procesautomatisering kunnen <strong>${fmtN(results.weeklyHoursSaved)} van die uren per week</strong> worden vrijgespeeld.
                Dat is per medewerker gemiddeld <strong>${Math.round(results.hoursPerFTE * 10) / 10} uur per werkdag meer</strong> voor wat er echt toe doet: de cliënt.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Hoe realiseren we dit? -->
    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0 0 20px;font-size:16px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">Hoe realiseren we dit?</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            { n: '01', title: 'Voice-to-Report', desc: 'Medewerkers spreken hun rapportage in; AI schrijft de notitie in 2 minuten.' },
            { n: '02', title: 'Slimme Intakeprocessen', desc: 'Digitale voorbereiding op basis van cliëntdata — nooit meer alles opnieuw uitvragen.' },
            { n: '03', title: 'AI Readiness Scan', desc: 'Volledig beeld van jouw organisatie + concreet implementatieplan.' },
          ].map(({ n, title, desc }) => `
            <tr>
              <td style="padding:0 0 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right:14px;vertical-align:top;">
                            <span style="display:inline-block;width:28px;height:28px;background:#f97316;border-radius:8px;color:#fff;font-weight:900;font-size:11px;text-align:center;line-height:28px;">${n}</span>
                          </td>
                          <td>
                            <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#0f172a;">${title}</p>
                            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">${desc}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `).join('')}
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
                Plan een gratis 30-minuten AI Readiness Gesprek. Samen bekijken we welke tools en aanpak het best passen bij jouw organisatie.
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

  const text = `
PERSOONLIJK IMPACT RAPPORT — WE ARE IMPACT
==========================================

Hoi ${greeting},

Hier zijn jouw berekende resultaten op basis van de Tijdwinst Checker.

JOUW DRIE KERN-RESULTATEN
--------------------------
• Tijdwinst:        ${fmtN(results.weeklyHoursSaved)} uur per week
• Cliëntcontact:   +${fmtN(results.extraContactsPerMonth)} extra gesprekken per maand
• Operationele waarde: ${fmtEuro(results.grossSavingsPerYear)} per jaar

JOUW INSTELLINGEN
-----------------
• Team: ${inputs.fte} medewerkers
• Administratiedruk: ${inputs.adminPct}% (sectorgemiddelde: 40%)
• Huidige AI-adoptie: ${inputs.aiPct}%
• Uurloon: € ${inputs.uurloon}

VOLLEDIGE BEREKENING
--------------------
• Tijdwinst per medewerker/week: ${Math.round(results.hoursPerFTE * 10) / 10} uur
• Totale tijdwinst/week:         ${fmtN(results.weeklyHoursSaved)} uur
• Totale tijdwinst/jaar:         ${fmtN(results.yearlyHoursSaved)} uur
• Extra gesprekken/maand:        ${fmtN(results.extraContactsPerMonth)} (à 90 min)
• Bruto waarde/jaar:             ${fmtEuro(results.grossSavingsPerYear)}
• Verwachte burn-out daling:     ${results.burnoutRange}

HOE REALISEREN WE DIT?
-----------------------
1. Voice-to-Report — Medewerkers spreken hun rapportage in; AI schrijft de notitie
2. Slimme Intakeprocessen — Digitale voorbereiding op basis van cliëntdata
3. AI Readiness Scan — Volledig beeld + concreet implementatieplan

VOLGENDE STAP
-------------
Plan een gratis 30-minuten AI Readiness Gesprek:
https://weareimpact.nl/contact

Of mail direct: v.munster@weareimpact.nl

Succes!

Vincent van Munster
WeAreImpact — Innovatie met een sociaal hart
weareimpact.nl
  `.trim();

  return { subject, html, text };
}
