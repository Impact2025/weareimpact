// De zes contactmomenten waarmee een klantreis vanzelf een showcase wordt.
// Alles hier is data en pure logica (geen database), zodat de formuleringen op één plek staan
// en testbaar zijn. Toon: concreet en zakelijk; geen "raakte", "voelde" of "ervaring" behalve
// bij het gevoelsmoment na livegang.

export type MomentKey = 'intake' | 'demo' | 'akkoord' | 'tussen' | 'dag1' | 'dag14';

export type QuestionType =
  | 'score5' // 1-5
  | 'nps' // 0-10
  | 'text' // vrije tekst
  | 'number' // getal (uren)
  | 'choice' // één keuze
  | 'words' // kies tot 4 kernwoorden
  | 'scope'; // per onderdeel uit de offerte: ja / deels / nee

export interface Question {
  key: string;
  type: QuestionType;
  label: string;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
}

export interface MomentDef {
  key: MomentKey;
  /** Korte naam voor in admin en tijdlijn. */
  name: string;
  /** Wanneer het moment ontstaat, voor uitleg in admin. */
  when: string;
  subject: string;
  /** Kop op de pagina; {voornaam} wordt ingevuld. */
  heading: string;
  intro: string;
  questions: Question[];
  /** Vraag die Iris stelt als het model niets passends kan maken. */
  fallbackFollowup: string;
  /** Instructie aan het model voor de vervolgvraag. */
  followupFocus: string;
  /** Slotzin na de vervolgvraag; {citaat} wordt vervangen door een letterlijk stukje van het antwoord. */
  thanks: string;
}

export const WORDS = [
  { value: 'direct', label: 'Direct' },
  { value: 'meedenkend', label: 'Meedenkend' },
  { value: 'rustig', label: 'Rustig' },
  { value: 'snel', label: 'Snel' },
  { value: 'duidelijk', label: 'Duidelijk' },
  { value: 'betrouwbaar', label: 'Betrouwbaar' },
  { value: 'creatief', label: 'Creatief' },
  { value: 'te-druk', label: 'Te druk' },
] as const;

export const MOMENTS: Record<MomentKey, MomentDef> = {
  intake: {
    key: 'intake',
    name: 'Na de intake',
    when: '1 uur na het kennismakingsgesprek',
    subject: 'Twee korte vragen na ons gesprek',
    heading: 'Hoi {voornaam}, bedankt voor ons gesprek',
    intro: 'Twee korte vragen, zodat ik niets mis en het voorstel past bij wat jij nodig hebt. Het kost een halve minuut.',
    questions: [
      { key: 'intake_score', type: 'score5', label: 'Hoe vond je het intakegesprek?' },
      {
        key: 'pijn',
        type: 'text',
        label: 'Wat kost je nu de meeste tijd of energie?',
        placeholder: 'Eén of twee zinnen is genoeg',
      },
      {
        key: 'uren_voor',
        type: 'number',
        label: 'Hoeveel uur per week gaat daar ongeveer aan op?',
        hint: 'Een schatting is prima. Zo kunnen we later meten wat het oplevert.',
        optional: true,
      },
    ],
    fallbackFollowup: 'Sinds wanneer speelt dit, en wat heb je al geprobeerd?',
    followupFocus:
      'Vraag door op wat ze als grootste pijn noemden: sinds wanneer het speelt en wat ze al geprobeerd hebben. Gebruik hun eigen woorden.',
    thanks: 'Dank je wel. Ik neem "{citaat}" mee in het voorstel.',
  },
  demo: {
    key: 'demo',
    name: 'Na de demo',
    when: '1 uur na de demo',
    subject: 'Wat dacht je van de demo?',
    heading: 'Hoi {voornaam}, wat vond je van de demo?',
    intro: 'Eén korte vraag. Je eerste reactie is precies wat ik wil weten.',
    questions: [
      {
        key: 'demo_reactie',
        type: 'text',
        label: 'Wat is je eerste reactie op de demo?',
        placeholder: 'Eén zin is genoeg',
      },
    ],
    fallbackFollowup: 'Wat uit de demo zou je morgen al willen gebruiken?',
    followupFocus:
      'Verwijs naar hun eerste reactie en vraag dan: wat uit de demo zouden ze morgen al willen gebruiken? Houd het concreet en praktisch.',
    thanks: 'Duidelijk. Ik zorg dat "{citaat}" terugkomt in het plan.',
  },
  akkoord: {
    key: 'akkoord',
    name: 'Bij akkoord',
    when: 'Direct na het akkoord op de offerte',
    subject: 'Fijn dat we beginnen',
    heading: 'Fijn dat we gaan samenwerken, {voornaam}',
    intro: 'Je akkoord staat vast. Twee korte vragen, geheel vrijblijvend.',
    questions: [
      {
        key: 'besluit',
        type: 'text',
        label: 'Wat gaf de doorslag om met ons verder te gaan?',
        placeholder: 'Eén of twee zinnen',
      },
      {
        key: 'consent',
        type: 'choice',
        label: 'Mogen we dit traject straks als voorbeeld laten zien?',
        hint: 'Je beslist later mee over de tekst. Er verschijnt niets zonder jouw akkoord.',
        optional: true,
        options: [
          { value: 'naam', label: 'Ja, met naam' },
          { value: 'anoniem', label: 'Ja, maar anoniem' },
          { value: 'nee', label: 'Liever niet' },
        ],
      },
    ],
    fallbackFollowup: 'Hoe zou je een collega uitleggen waarom je voor ons koos?',
    followupFocus:
      'Vraag waar ze nog over twijfelden en wat die twijfel wegnam. Noemen ze geen twijfel, vraag dan hoe ze een collega zouden uitleggen waarom ze voor ons kozen. Noem geen concurrenten.',
    thanks: 'Dank je wel. Dit helpt me om het juiste te bouwen.',
  },
  tussen: {
    key: 'tussen',
    name: 'Halverwege',
    when: 'Als de helft van de milestones klaar is',
    subject: 'Hoe gaat het tot nu toe?',
    heading: 'Hoi {voornaam}, we zijn halverwege',
    intro: 'Twee korte vragen over de samenwerking en het tempo, zodat ik tijdig kan bijsturen.',
    questions: [
      {
        key: 'stijl',
        type: 'words',
        label: 'Hoe bevalt het samenwerken tot nu toe?',
        hint: 'Kies maximaal vier woorden.',
      },
      {
        key: 'tempo',
        type: 'choice',
        label: 'Hoe vind je het tempo?',
        options: [
          { value: 'te-langzaam', label: 'Te langzaam' },
          { value: 'precies-goed', label: 'Precies goed' },
          { value: 'te-snel', label: 'Te snel' },
        ],
      },
    ],
    fallbackFollowup: 'Wat zou ik anders moeten doen?',
    followupFocus: 'Vraag wat Vincent anders zou moeten doen, in één korte vraag.',
    thanks: 'Dank je wel. Ik neem het mee in de rest van het traject.',
  },
  dag1: {
    key: 'dag1',
    name: 'Dag na livegang',
    when: '1 dag na livegang',
    subject: 'Het staat live. Hoe voelt het?',
    heading: 'Hoi {voornaam}, het staat live',
    intro: 'Eén korte vraag nu je het echt gebruikt.',
    questions: [
      {
        key: 'gevoel',
        type: 'choice',
        label: 'Hoe voelt het nu je het echt gebruikt?',
        options: [
          { value: '5', label: '😄 Heel goed' },
          { value: '4', label: '🙂 Goed' },
          { value: '3', label: '😐 Gaat wel' },
          { value: '2', label: '🙁 Niet zoals ik hoopte' },
          { value: '1', label: '😟 Het werkt niet voor me' },
        ],
      },
    ],
    fallbackFollowup: 'Wat viel je als eerste op?',
    followupFocus: 'Vraag wat hen als eerste opviel toen ze het gebruikten.',
    thanks: 'Dank je wel. Dit is waardevol zo vlak na de start.',
  },
  dag14: {
    key: 'dag14',
    name: 'Dag 14 na livegang',
    when: '14 dagen na livegang',
    subject: 'Twee weken live: wat levert het op?',
    heading: 'Hoi {voornaam}, twee weken verder',
    intro: 'Een paar korte vragen over wat het je oplevert. Zo kan ik laten zien wat het waard is.',
    questions: [
      { key: 'scope', type: 'scope', label: 'Past het bij wat je wilde? Per onderdeel:' },
      {
        key: 'uren_na',
        type: 'number',
        label: 'Hoeveel uur per week kost het je nu?',
        hint: 'Een schatting is prima.',
        optional: true,
      },
      { key: 'nps', type: 'nps', label: 'Hoe waarschijnlijk is het dat je WeAreImpact aanbeveelt aan een collega?' },
      { key: 'toelichting', type: 'text', label: 'Wil je nog iets toelichten?', optional: true },
    ],
    fallbackFollowup: 'Wat doe je met de tijd die je overhoudt?',
    followupFocus:
      'Vraag wat ze doen met de tijd of rust die het oplevert. Noem alleen cijfers die letterlijk in de context staan.',
    thanks: 'Dank je wel. Dit helpt me enorm.',
  },
};

export const MOMENT_ORDER: MomentKey[] = ['intake', 'demo', 'akkoord', 'tussen', 'dag1', 'dag14'];

export type AppointmentKind = 'sparring' | 'intake' | 'demo' | 'tussenevaluatie' | 'oplevering';

export const APPOINTMENT_KIND_LABEL: Record<AppointmentKind, string> = {
  sparring: 'Sparringsessie',
  intake: 'Intake',
  demo: 'Demo',
  tussenevaluatie: 'Tussenevaluatie',
  oplevering: 'Oplevering',
};

/** Welk moment volgt op een afspraak die geweest is. Oplevering heeft er geen: daar volgt dag 1. */
export function momentForAppointment(kind: AppointmentKind): MomentKey | null {
  switch (kind) {
    case 'sparring':
    case 'intake':
      return 'intake';
    case 'demo':
      return 'demo';
    case 'tussenevaluatie':
      return 'tussen';
    default:
      return null;
  }
}

export type Answers = Record<string, string | number | string[] | Record<string, string> | null | undefined>;

/** Een antwoord is zorgwekkend: dan stelt Iris geen vervolgvraag maar krijgt Vincent een taak. */
export function isConcerning(moment: MomentKey, answers: Answers): boolean {
  const num = (k: string) => (typeof answers[k] === 'number' ? (answers[k] as number) : Number(answers[k]));
  if (moment === 'intake' && num('intake_score') <= 2) return true;
  if (moment === 'dag1' && num('gevoel') <= 2) return true;
  if (moment === 'dag14' && answers.nps != null && num('nps') <= 6) return true;
  if (moment === 'tussen') {
    if (answers.tempo === 'te-langzaam') return true;
    const words = Array.isArray(answers.stijl) ? (answers.stijl as string[]) : [];
    if (words.includes('te-druk')) return true;
  }
  if (moment === 'dag14' && answers.scope && typeof answers.scope === 'object') {
    const values = Object.values(answers.scope as Record<string, string>);
    if (values.length > 0 && values.filter((v) => v === 'nee').length >= Math.ceil(values.length / 2)) return true;
  }
  return false;
}

// Woorden die we niet in een vervolgvraag willen: te zweverig of te vaag voor een drukke ondernemer.
const BANNED = /\b(raak\w*|voel\w*|ervaring|ervaar\w*|waarom)\b/i;

/** Controleert de door het model gemaakte vervolgvraag; geeft de schone vraag of null. */
export function cleanFollowup(raw: string | null | undefined, moment: MomentKey): string | null {
  if (!raw) return null;
  const text = raw.replace(/^["'“”]+|["'“”]+$/g, '').replace(/\s+/g, ' ').trim();
  if (text.length < 12 || text.length > 220) return null;
  if (!text.endsWith('?')) return null;
  if ((text.match(/\?/g) ?? []).length > 1) return null; // één vraag per keer
  // Gevoel mag alleen bij het gevoelsmoment.
  if (moment !== 'dag1' && BANNED.test(text)) return null;
  return text;
}

/** Eerste bruikbare letterlijke stukje uit een antwoord, voor de bedankzin. */
export function pickQuote(answers: Answers, keys = ['pijn', 'demo_reactie', 'besluit', 'toelichting']): string | null {
  for (const k of keys) {
    const v = answers[k];
    if (typeof v === 'string') {
      const t = v.replace(/\s+/g, ' ').trim();
      if (t.length >= 4) return t.length > 90 ? `${t.slice(0, 87).trimEnd()}…` : t;
    }
  }
  return null;
}

export function fillName(text: string, firstName: string | null): string {
  if (firstName) return text.replace('{voornaam}', firstName);
  return text.replace(', {voornaam}', '').replace(' {voornaam}', '').replace('{voornaam}', '');
}

/** Verstuurtijd: niet 's nachts en niet in het weekend. Geeft true als het nu mag. */
export function isSendWindow(parts: { weekday: number; hour: number }): boolean {
  if (parts.weekday === 0 || parts.weekday === 6) return false;
  return parts.hour >= 8 && parts.hour < 19;
}
