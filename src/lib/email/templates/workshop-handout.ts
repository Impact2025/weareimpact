import { emailButton, emailCard, emailShell, emailSignature } from './emailLayout';

interface WorkshopHandoutData {
  email: string;
  naam?: string;
  organisatie?: string;
}

export function generateWorkshopHandoutEmail(data: WorkshopHandoutData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Je hand-outs van het AI Leadership Lab';
  const greetName = data.naam ? data.naam.split(' ')[0] : '';

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi${greetName ? ` ${greetName}` : ''},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je aanwezigheid bij het AI Leadership Lab${data.organisatie ? ` namens ${data.organisatie}` : ''}.
                Hieronder vind je de prompt-templates uit de sessie nog eens op een rij, plus een link naar de volledige pagina.
              </p>

              ${emailButton('Bekijk alle materialen', 'https://weareimpact.nl/lab')}

              ${emailCard(`
                <p style="margin: 0 0 16px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
                  Drie prompts om morgen mee te starten
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #fed7aa;"><p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;"><strong style="color: #ea580c;">1. Frictie in kaart brengen —</strong> "Ik werk bij [organisatie] in het sociaal domein. Mijn grootste terugkerende tijdvreter is [taak]. Beschrijf in 3 stappen hoe een AI-assistent het eerste concept zou kunnen maken, en welke stap ik zelf moet blijven controleren."</p></td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #fed7aa;"><p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;"><strong style="color: #ea580c;">2. Mail of verslag samenvatten —</strong> "Vat onderstaande mail/verslag samen in 3 zinnen: wat wordt er gevraagd, wat is de deadline, en wat is mijn voorgestelde reactie? [plak tekst]"</p></td></tr>
                  <tr><td style="padding: 10px 0;"><p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;"><strong style="color: #ea580c;">3. Van bouwwerk naar plan —</strong> "Dit is wat mijn team net met LEGO bouwde: [beschrijf het bouwwerk]. Welke concrete AI-agent zou dit probleem oplossen, wat neemt die over, en wat blijft mensenwerk?"</p></td></tr>
                </table>
              `)}

              ${emailCard(`
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  Wil je hier met Vincent persoonlijk op doorpraten? Plan een gratis 1-op-1 AI-verkenning, direct via de chat op weareimpact.nl of door simpelweg op deze mail te reageren.
                </p>
              `, 'amber')}

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Tot snel,
              </p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: 'De prompt-templates en materialen van het AI Leadership Lab, nog eens op een rij.',
    title: 'AI Leadership Lab',
    subtitle: 'Je hand-outs staan klaar',
    body,
  });

  const text = `
AI LEADERSHIP LAB — JE HAND-OUTS

Hoi${greetName ? ` ${greetName}` : ''},

Bedankt voor je aanwezigheid bij het AI Leadership Lab${data.organisatie ? ` namens ${data.organisatie}` : ''}.

Bekijk alle materialen: https://weareimpact.nl/lab

DRIE PROMPTS OM MORGEN MEE TE STARTEN
--------------------------------------
1. Frictie in kaart brengen
"Ik werk bij [organisatie] in het sociaal domein. Mijn grootste terugkerende tijdvreter is [taak]. Beschrijf in 3 stappen hoe een AI-assistent het eerste concept zou kunnen maken, en welke stap ik zelf moet blijven controleren."

2. Mail of verslag samenvatten
"Vat onderstaande mail/verslag samen in 3 zinnen: wat wordt er gevraagd, wat is de deadline, en wat is mijn voorgestelde reactie? [plak tekst]"

3. Van bouwwerk naar plan
"Dit is wat mijn team net met LEGO bouwde: [beschrijf het bouwwerk]. Welke concrete AI-agent zou dit probleem oplossen, wat neemt die over, en wat blijft mensenwerk?"

Wil je hier met Vincent persoonlijk op doorpraten? Plan een gratis 1-op-1 AI-verkenning, direct via de chat op weareimpact.nl of door simpelweg op deze mail te reageren.

Tot snel,
Vincent van Munster
WeAreImpact.nl
  `.trim();

  return { subject, html, text };
}
