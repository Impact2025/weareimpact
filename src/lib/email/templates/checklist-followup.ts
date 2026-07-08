import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';

interface FollowupData {
  organisatie?: string;
}

/** Mail 1 — concrete tip (2 dagen na download). */
export function generateChecklistFollowup1Email(data: FollowupData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Tip 1/3: zo krijg je grip op AI in je organisatie';

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi${data.organisatie ? ` (${data.organisatie})` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je hebt de AI-Proof Checklist gedownload — mooi begin. Maar een checklist verandert niets zolang hij in een laatje ligt. De belangrijkste quick win van allemaal: <strong style="color: #0f172a;">maak zichtbaar welke AI-tools er al in je team rondzingen.</strong>
              </p>

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">Doe deze week (30 min)</p>
                <p style="margin: 0 0 10px; font-size: 15px; color: #1e293b;">Stuur je team één vraag:</p>
                <p style="margin: 0; font-size: 15px; color: #1e293b; font-style: italic;">"Welke AI-tool heb jij deze maand gebruikt — en waarvoor?"</p>
                <p style="margin: 12px 0 0; font-size: 15px; color: #1e293b;">Zet de antwoorden in een simpel lijstje. Je zult verrast zijn wat er al gebeurt zónder beleid.</p>
              `)}

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Volgende mail: een Nederlandse case study van een welzijnsorganisatie die precies dit deed.
              </p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: 'De belangrijkste quick win: maak zichtbaar welke AI-tools er al rondzingen in je team.',
    title: 'Tip 1 van 3',
    subtitle: 'Zo krijg je grip op AI',
    body,
  });

  const text = `
TIP 1/3: ZO KRIJG JE GRIP OP AI

Hoi${data.organisatie ? ` (${data.organisatie})` : ''},

De belangrijkste quick win: maak zichtbaar welke AI-tools er al in je team rondzingen.

DOE DEZE WEEK (30 MIN):
Stuur je team één vraag: "Welke AI-tool heb jij deze maand gebruikt — en waarvoor?"
Zet de antwoorden in een simpel lijstje. Je zult verrast zijn wat er al gebeurt zonder beleid.

Volgende mail: een Nederlandse case study.

Vincent van Munster
WeAreImpact.nl
  `.trim();

  return { subject, html, text };
}

/** Mail 2 — Nederlandse case study (4 dagen na download). */
export function generateChecklistFollowup2Email(data: FollowupData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Tip 2/3: hoe een welzijnsorganisatie in 6 weken AI-proof werd';

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi${data.organisatie ? ` (${data.organisatie})` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Case study uit de praktijk. Een welzijnsorganisatie in Noord-Holland (120 medewerkers) wilde "iets met AI" maar zag door de bomen het bos niet.
              </p>

              ${emailCard(`
                <p style="margin: 0 0 10px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">Wat ze deden</p>
                <p style="margin: 0 0 8px; font-size: 15px; color: #1e293b;">→ Week 1: inventarisatie — 14 tools bleken al in gebruik, niemand wist het van elkaar.</p>
                <p style="margin: 0 0 8px; font-size: 15px; color: #1e293b;">→ Week 2-3: één one-pager spelregels, goedgekeurd door de OR.</p>
                <p style="margin: 0; font-size: 15px; color: #1e293b;">→ Week 4-6: 2 medewerkers als "AI-ambassadeur" — geen extern bureau, eigen mensen.</p>
              `)}

              ${emailCard(`
                <p style="margin: 0 0 10px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">Resultaat</p>
                <p style="margin: 0 0 6px; font-size: 15px; color: #1e293b;">· 9 uur/week teruggewonnen op administratie per team</p>
                <p style="margin: 0 0 6px; font-size: 15px; color: #1e293b;">· 0 privacy-incidenten door heldere spelregels</p>
                <p style="margin: 0; font-size: 15px; color: #1e293b;">· Bestuur rustig — ze hebben nu zélf het overzicht</p>
              `, 'amber')}

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Volgende mail: hoe je van die ene checklist naar een concreet plan komt.
              </p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: 'Case study: een welzijnsorganisatie van 120 medewerkers werd in 6 weken AI-proof.',
    title: 'Tip 2 van 3',
    subtitle: 'Nederlandse case study',
    body,
  });

  const text = `
TIP 2/3: NEDERLANDSE CASE STUDY

Hoi${data.organisatie ? ` (${data.organisatie})` : ''},

Een welzijnsorganisatie in Noord-Holland (120 medewerkers) wilde iets met AI.

WAT ZE DEDEN:
- Week 1: inventarisatie — 14 tools bleken al in gebruik, niemand wist het van elkaar
- Week 2-3: één one-pager spelregels, goedgekeurd door de OR
- Week 4-6: 2 medewerkers als AI-ambassadeur (eigen mensen, geen extern bureau)

RESULTAAT:
- 9 uur/week teruggewonnen per team
- 0 privacy-incidenten door heldere spelregels
- Bestuur rustig — ze hebben nu zelf het overzicht

Volgende mail: van checklist naar concreet plan.

Vincent van Munster
WeAreImpact.nl
  `.trim();

  return { subject, html, text };
}

/** Mail 3 — van checklist naar concreet plan (6 dagen na download). */
export function generateChecklistFollowup3Email(data: FollowupData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Tip 3/3: van checklist naar concreet AI-plan (gratis sessie)';

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi${data.organisatie ? ` (${data.organisatie})` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Laatste mail van de reeks. Je hebt nu de checklist, een tip en een case study. De volgende stap is 'm vastmaken: <strong style="color: #0f172a;">van inventarisatie naar een concreet plan dat het bestuur draagt.</strong>
              </p>

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">Jouw concreet plan in 3 stappen</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 6px 0;"><strong style="color: #f97316;">1.</strong> <span style="color: #1e293b; font-size: 15px;">Inventarisatie → deel het lijstje met je bestuur</span></td></tr>
                  <tr><td style="padding: 6px 0;"><strong style="color: #f97316;">2.</strong> <span style="color: #1e293b; font-size: 15px;">One-pager spelregels → vaststellen in een teamoverleg</span></td></tr>
                  <tr><td style="padding: 6px 0;"><strong style="color: #f97316;">3.</strong> <span style="color: #1e293b; font-size: 15px;">Bestuurssessie → kies 1 pilot, geen 10 tegelijk</span></td></tr>
                </table>
              `)}

              <p style="margin: 24px 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Wil je dat ik met je meekijk? Boek een gratis <strong style="color: #0f172a;">AI-scan</strong> — 45 minuten, we zetten jouw quick wins op papier.
              </p>

              ${emailButton('Plan je gratis AI-scan', 'https://weareimpact.nl/ai-scan')}

              ${emailSignature()}
              <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                PS: Liever even bellen? Reply op deze mail, dan plannen we het in.
              </p>
  `.trim();

  const html = emailShell({
    preheader: 'Van checklist naar concreet plan: boek een gratis 45-minuten AI-scan met Vincent.',
    title: 'Tip 3 van 3',
    subtitle: 'Van checklist naar concreet plan',
    body,
  });

  const text = `
TIP 3/3: VAN CHECKLIST NAAR CONCREET PLAN

Hoi${data.organisatie ? ` (${data.organisatie})` : ''},

Van inventarisatie naar een concreet plan dat het bestuur draagt:

1. Inventarisatie -> deel het lijstje met je bestuur
2. One-pager spelregels -> vaststellen in een teamoverleg
3. Bestuurssessie -> kies 1 pilot, geen 10 tegelijk

Wil je dat ik meekijk? Boek een gratis AI-scan (45 min):
https://weareimpact.nl/ai-scan

Vincent van Munster
WeAreImpact.nl

PS: Liever even bellen? Reply op deze mail.
  `.trim();

  return { subject, html, text };
}
