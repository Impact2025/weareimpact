import { emailShell, emailButton, emailSignature } from './emailLayout';
import { MOMENTS, fillName, type MomentKey } from '@/lib/showcase/moments';

const P = 'margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;';
const SMALL = 'margin: 24px 0 0; font-size: 13px; line-height: 1.5; color: #64748b;';

// Korte, persoonlijke openingszin per moment. De rest van de mail is gelijk: één knop, één pagina, een halve minuut.
const OPENING: Record<MomentKey, string> = {
  intake: 'Bedankt voor ons gesprek. Ik werk nu jouw voorstel uit. Om niets te missen heb ik twee korte vragen.',
  demo: 'Fijn dat je de demo hebt bekeken. Ik ben benieuwd wat je eerste reactie is.',
  akkoord: 'Fijn dat we gaan samenwerken.',
  tussen: 'We zijn halverwege. Ik wil graag weten hoe het tot nu toe gaat, zodat ik tijdig kan bijsturen.',
  dag1: 'Het staat sinds gisteren live. Ik ben benieuwd hoe het is om er nu echt mee te werken.',
  dag14: 'Het draait nu twee weken. Een paar korte vragen over wat het je oplevert.',
};

const BUTTON: Record<MomentKey, string> = {
  intake: 'Beantwoord twee vragen',
  demo: 'Geef je reactie',
  akkoord: 'Beantwoord twee vragen',
  tussen: 'Vertel hoe het gaat',
  dag1: 'Deel je eerste indruk',
  dag14: 'Beantwoord een paar vragen',
};

export function showcaseRequestEmail(d: { moment: MomentKey; firstName: string | null; url: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const def = MOMENTS[d.moment];
  const hi = d.firstName ? `Hoi ${d.firstName},` : 'Hoi,';
  const opening = OPENING[d.moment];
  const body = `
    <p style="${P}">${hi}</p>
    <p style="${P}">${opening}</p>
    ${emailButton(BUTTON[d.moment], d.url)}
    <p style="${P} margin-top: 24px;">Je hoeft niet in te loggen en het kost minder dan een minuut. Je antwoord gaat rechtstreeks naar mij.</p>
    ${emailSignature()}
    <p style="${SMALL}">Deze vraag wordt voor mij klaargezet door Iris, mijn AI-assistent. Je antwoord lees ik zelf.</p>`;
  const html = emailShell({
    preheader: fillName(def.heading, null),
    title: fillName(def.heading, d.firstName),
    subtitle: 'WeAreImpact',
    body,
  });
  const text = `${hi}

${opening}

${BUTTON[d.moment]}: ${d.url}

Je hoeft niet in te loggen en het kost minder dan een minuut. Je antwoord gaat rechtstreeks naar mij.

Vincent van Munster
WeAreImpact

Deze vraag wordt voor mij klaargezet door Iris, mijn AI-assistent. Je antwoord lees ik zelf.`;
  return { subject: def.subject, html, text };
}

/** Naar de klant: de showcasetekst ter goedkeuring. */
export function showcaseReviewEmail(d: { firstName: string | null; url: string; anonymous: boolean }): {
  subject: string;
  html: string;
  text: string;
} {
  const hi = d.firstName ? `Hoi ${d.firstName},` : 'Hoi,';
  const intro = d.anonymous
    ? 'Je gaf aan dat ik ons traject anoniem als voorbeeld mag laten zien. Ik heb een tekst klaargezet, zonder jullie naam en zonder herkenbare gegevens.'
    : 'Je gaf aan dat ik ons traject als voorbeeld mag laten zien. Ik heb een tekst klaargezet die ik graag eerst aan jou voorleg.';
  const body = `
    <p style="${P}">${hi}</p>
    <p style="${P}">${intro}</p>
    <p style="${P}">Je ziet precies wat er op de site zou komen. Er verschijnt niets zonder jouw akkoord. Je kunt ook iets laten aanpassen of liever niet meedoen.</p>
    ${emailButton('Bekijk de tekst', d.url)}
    ${emailSignature()}`;
  const html = emailShell({
    preheader: 'Er verschijnt niets zonder jouw akkoord.',
    title: 'Mag dit als voorbeeld?',
    subtitle: 'Bekijk de tekst en beslis zelf',
    body,
  });
  const text = `${hi}

${intro}

Je ziet precies wat er op de site zou komen. Er verschijnt niets zonder jouw akkoord. Je kunt ook iets laten aanpassen of liever niet meedoen.

Bekijk de tekst: ${d.url}

Vincent van Munster
WeAreImpact`;
  return { subject: 'Mag dit als voorbeeld? Bekijk de tekst', html, text };
}
