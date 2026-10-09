// Seed voor dossier dinestar-vaste-vrijdagen: 7 faseopeningsvragen voor Iris + briefing,
// en een testmagiclink. Gebruik: node scripts/seed-crm-dinestar-vaste-vrijdagen.js <email>
const { neon } = require('@neondatabase/serverless');
const { Resend } = require('resend');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8').split('\n').forEach((line) => {
  const m = line.match(/^([^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

const SLUG = 'dinestar-vaste-vrijdagen';

const QUESTIONS = [
  'Welke AI-tools en software gebruik je nu in je dagelijkse praktijk en workshops (transcriptie, presentaties, brainstormtools, andere AI-assistenten)? Welke bevalt uitzonderlijk goed, en wat ontbreekt er nog fundamenteel?',
  'Hoeveel tijd ben je na een workshop kwijt aan transcripties, prompts, samenvattingen, het nakijken van canvassen en het geven van persoonlijke feedback? Geef zo mogelijk getallen: uren per workshop of per canvas, en hoeveel deelnemers of canvassen per ronde. Welke handmatige stap is de grootste energielek?',
  'Hoe werk je liever tijdens een workshop: op een vrij visueel whiteboard met post-its, of met gestructureerde invulrasters zoals het One-Page Strategic Plan? En wat zou de AI na de sessie automatisch met het canvas moeten doen?',
  'Hoe prompt je Claude nu, en hoe moet een ideale terugkoppeling of samenvatting klinken (zakelijk-strategisch of warm-menselijk, met aandacht voor maatschappelijke impact)? Welke fouten maakt Claude nu steeds, die je altijd handmatig moet rechtzetten?',
  'Verkennend: hoe zit je verdienmodel in elkaar (vaste kwartaalretainer, dagdeelprijzen, aanbetalingen) en met welk facturatiesysteem werk je? Waar zit daar de meeste frictie?',
  'Verkennend: hoe houd je het executieritme (de Rocks) warm in de weken tussen sessies, en zou het helpen als voortgang automatisch in de Slack-kanalen van je klanten verschijnt?',
  'Verkennend: hoe evalueer je sessies en meet je maatschappelijke impact, en hoe initieer je het doortrekken naar het volgende kwartaal?',
];

const BRIEFING_EXTRA = `

WERKAFSPRAKEN VOOR IRIS (project Vaste Vrijdagen)
- Je spreekt met Stéphanie van Gerven, Scaling Up Coach voor scale-ups en sociale ondernemingen, voormalig directeur-bestuurder van Stichting Thuisgekookt. Ze geeft workshops met canvassen, neemt sessies op, analyseert audio met Claude en communiceert veel met MT's via Slack.
- Doel van dit project: haar workshopcyclus stroomlijnen (canvassen nakijken en persoonlijke feedback sneller geven, met behoud van kwaliteit), daarna de conversie naar Dinestar-pilots inrichten. Er zijn circa 52 uur beschikbaar, verdeeld over 10 vrijdagen. Dit is NIET een volledig platform of cockpit: doe daar geen toezeggingen over.
- Stel per bericht maximaal 1 à 2 gerichte vragen, nooit een waslijst. Vat haar antwoord eerst kort samen in wat het betekent voor het product of de aanpak, en vraag dan door.
- Vraag waar mogelijk naar getallen (uren per week, aantal klanten, aantal stappen in het proces). Dit is de nulmeting voor het project.
- Gebruik Scaling Up-termen waar passend (Rocks, OPSP, Cash Flow Story, MT, kwartaalritme, impact-KPI's), energiek en adviserend.
- Vragen 5 tot 7 zijn verkennend: haal alleen globaal op hoe het nu werkt en wat knelt, zonder iets in het vooruitzicht te stellen.
- Gebruik of vergelijk nooit informatie uit een ander dossier (ook niet uit Dinestar Boost of het Matching Platform).
- Open het eerste bericht warm en persoonlijk: je hebt al een vliegende start gemaakt, en vandaag wil je scherp krijgen hoe zij het liefst werkt, waar de grootste tijdswinst ligt en welke tools slim aan elkaar geknoopt kunnen worden. Begin dan bij de eerste vraag over haar gereedschapskist; noem Claude en Slack, die gebruikt ze al veel.`;

(async () => {
  const email = process.argv[2];
  if (!email) throw new Error('E-mailadres ontbreekt');
  const sql = neon(process.env.DATABASE_URL);

  const [p] = await sql`SELECT intake_notes FROM crm_projects WHERE slug = ${SLUG}`;
  if (!p) throw new Error('Project niet gevonden');
  if (!(p.intake_notes || '').includes('WERKAFSPRAKEN VOOR IRIS')) {
    await sql`UPDATE crm_projects SET intake_notes = ${(p.intake_notes || '').trim() + BRIEFING_EXTRA} WHERE slug = ${SLUG}`;
    console.log('Briefing aangevuld');
  }

  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM crm_questions WHERE project_slug = ${SLUG}`;
  if (n === 0) {
    for (let i = 0; i < QUESTIONS.length; i++) {
      await sql`INSERT INTO crm_questions (project_slug, audience, question, sort_order, origin)
                VALUES (${SLUG}, 'klant', ${QUESTIONS[i]}, ${i}, 'admin')`;
    }
    console.log(`${QUESTIONS.length} vragen toegevoegd`);
  } else console.log('Vragen bestonden al, overgeslagen');

  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await sql`INSERT INTO crm_magic_links (project_slug, audience, email, token_hash, expires_at)
            VALUES (${SLUG}, 'klant', ${email}, ${hash}, ${new Date(Date.now() + 7 * 864e5).toISOString()})`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weareimpact.nl'}/portal/${SLUG}/verify?token=${token}`;

  const res = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.MAIL_FROM || 'Vincent van WeAreImpact <nieuws@weareimpact.nl>',
    to: [email],
    replyTo: 'v.munster@weareimpact.nl',
    subject: 'Vaste Vrijdagen: Iris heeft een paar vragen voor je',
    html: `<p>Hoi Stéphanie,</p><p>Voor onze vrijdagen heeft Iris, mijn AI-assistent, een paar vragen over hoe jij nu werkt. Via deze link kun je met haar chatten, op elk moment en in je eigen tempo:</p><p><a href="${url}">${url}</a></p><p>De link is 7 dagen geldig en persoonlijk.</p><p>Groet,<br/>Vincent</p>`,
    text: `Hoi Stéphanie,\n\nVoor onze vrijdagen heeft Iris, mijn AI-assistent, een paar vragen over hoe jij nu werkt. Via deze link kun je met haar chatten: ${url}\n\nDe link is 7 dagen geldig en persoonlijk.\n\nGroet,\nVincent`,
  });
  console.log('Mail:', res.error ? 'FOUT ' + res.error.message : 'verstuurd naar ' + email);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
