import type { QuoteLine, QuoteSection, ScheduleItem } from './types';

export interface QuoteTemplate {
  key: string;
  label: string;
  description: string;
  title: string;
  subtitle: string;
  sections: QuoteSection[];
  lines: QuoteLine[];
  schedule: ScheduleItem[];
}

const text = (title: string, body: string): QuoteSection => ({ kind: 'text', title, body, items: [] });

// Sjabloon 1: de AI Diagnose & Doorbraak Sprint, gebaseerd op het offertesjabloon
// (WAI-2026-0842): vaste prijs, 50% bij bevestiging en 50% na het sprintdagdeel.
const sprint: QuoteTemplate = {
  key: 'sprint',
  label: 'AI Doorbraak Sprint',
  description: 'Vaste prijs €1.750, 50% bij akkoord en 50% na het sprintdagdeel.',
  title: 'AI Doorbraak Sprint',
  subtitle: 'AI & Innovatie in het Sociaal Domein',
  sections: [
    text(
      'Aanleiding & doelstelling',
      'Binnen het sociaal domein en de zorgsector ervaren professionals een aanhoudend hoge werkdruk door toenemende administratielast. Tijd die bedoeld is voor cliënten, jeugdigen en inwoners gaat verloren aan repetitieve verslaglegging, herformulering van plannen en handmatige dossierverwerking.\n\n**Eén tijdlek. Eén dagdeel. Structureel 5 tot 10 uur per week terug.**\n\nGeen open-einde interimcontract en geen theoretisch adviesrapport. Met de AI Diagnose & Doorbraak Sprint brengen we binnen één dagdeel op locatie een gekozen administratief werkproces live en werkend in uw eigen IT-omgeving, mét strikte menselijke controle en 14 dagen intensieve nazorg.',
    ),
    {
      kind: 'stats',
      title: 'Verwacht resultaat & impact',
      body: 'We richten ons niet op vage vergezichten, maar lossen één concreet knelpunt binnen uw organisatie pragmatisch en direct op.',
      items: [
        { label: '5–10 uur', title: 'Tijdswinst per week', text: 'Per betrokken professional direct teruggegeven aan primaire zorg- en cliëntcontacten.' },
        { label: '1 dagdeel', title: 'Live op locatie', text: 'Geen langdurig implementatietraject; dezelfde dag operationeel binnen uw huidige werkomgeving.' },
        { label: '100% AVG', title: 'Veilig & mensgericht', text: 'Altijd met menselijke validatie (human-in-the-loop) en zonder dat data wordt gebruikt voor modeltraining.' },
      ],
    },
    text(
      '',
      'Veelgekozen doorbraakprocessen: zorgverslaglegging en evaluatieverslagen, Wmo/Jeugdwet indicatie-samenvattingen, intakeverslaglegging, het omzetten van ruwe aantekeningen naar uniforme rapportages, en geautomatiseerde formats voor beschikkingen.',
    ),
    {
      kind: 'phases',
      title: 'Fasering & uitvoering',
      body: '',
      items: [
        { label: 'Fase 1 · Voorbereiding', title: 'Fit & Focus Intake', text: 'Voorafgaande Zoom-sessie (30 min) waarin we het primaire tijdlek selecteren, datastromen in kaart brengen en IT-toegangen afstemmen.' },
        { label: 'Fase 2 · Dagdeel op locatie', title: 'De Doorbraak Sprint', text: 'Hands-on bouwen en finetunen met uw team. Aan het eind van de sessie staat het gekozen werkproces live en werkend in uw IT-omgeving.' },
        { label: 'Fase 3 · Borging', title: '14 dagen nazorg', text: 'Ondersteuning bij de praktijkadoptie, optimalisatie van prompts en sjablonen en verificatie van de menselijke kwaliteitscontrole.' },
      ],
    },
    { kind: 'investment', title: 'Begroting & investering', body: '', items: [] },
    {
      kind: 'boxes',
      title: 'Privacy, AVG & condities',
      body: '',
      items: [
        { label: '', title: 'Eigen IT-omgeving', text: 'Oplossingen draaien binnen uw bestaande goedgekeurde software en tenants.' },
        { label: '', title: 'Geen datatraining', text: 'Gevoelige cliëntgegevens worden nooit gebruikt voor publieke AI-modellen.' },
        { label: '', title: 'Human-in-the-loop', text: 'Professionals behouden te allen tijde de finale beoordeling en regie.' },
        { label: '', title: 'Garantie', text: 'Geen werkend proces aan het eind van de dag? Wij finetunen kosteloos door.' },
      ],
    },
  ],
  lines: [
    {
      optional: false,
      description: 'De AI Diagnose & Doorbraak Sprint',
      detail: 'Volledige intake, 1 dagdeel op locatie voor 1 specifiek werkproces, implementatie in eigen IT en documentatie.',
      quantity: 1,
      unit: 'dagdeel op locatie + voorbereiding',
      unitPriceCents: 175000,
      discountPct: 0,
      period: null,
    },
    {
      optional: false,
      description: 'Borging, finetuning & nazorgperiode',
      detail: '14 dagen actieve begeleiding, feedbackverwerking en validatie van werkprocessen voor direct resultaat.',
      quantity: 14,
      unit: 'dagen inbegrepen',
      unitPriceCents: 0,
      discountPct: 0,
      period: null,
    },
    {
      optional: true,
      description: 'Optioneel: vervolg-sprint of teamtraining',
      detail: 'Extra werkproces digitaliseren of verdiepende AI-workshop voor behandelaren en consulenten.',
      quantity: 1,
      unit: 'extra dagdeel',
      unitPriceCents: 125000,
      discountPct: 0,
      period: null,
    },
  ],
  schedule: [
    { label: 'Termijn 1 · bij opdrachtbevestiging', trigger: 'akkoord', percent: 50 },
    { label: 'Termijn 2 · na afronding sprintdagdeel', trigger: 'oplevering', percent: 50 },
  ],
};

// Sjabloon 2: platformbouw of -licentie over meerdere jaren met partnerkorting,
// gebaseerd op de offerte voor het Samenmakers Platform (We Shape The Future).
// {{klant}} wordt bij aanmaken vervangen door de naam van de opdrachtgever.
const platform: QuoteTemplate = {
  key: 'platform',
  label: 'Platform & samenwerking (meerjarig)',
  description: 'Tweejarig model met partnerkorting per jaar en jaarlijkse facturatie vooraf.',
  title: 'Samenmakers Platform',
  subtitle: 'Offerte & samenwerkingsovereenkomst voor {{klant}}',
  sections: [
    text(
      'De uitdaging',
      '{{klant}} beschikt over een krachtig netwerk van meer dan 300 gedreven sociaal ondernemers. Om deze doelgroep duurzaam te faciliteren, ontbreekt momenteel één centrale, interactieve omgeving waarin alumni elkaar eenvoudig vinden, samenwerken en continu verbonden blijven.\n\nIn de huidige situatie verloopt de communicatie gefragmenteerd via e-mail, losse documenten en verschillende tools. Hierdoor blijven netwerkkansen, spontane kennisuitwisseling en de algehele community-betrokkenheid achter bij het werkelijke potentieel van het netwerk.',
    ),
    text(
      'De oplossing: het Samenmakers Platform',
      'Met het Samenmakers Platform realiseren we één geïntegreerd ecosysteem. Het platform combineert interactieve community-functies, een kennisbank, event-ticketing en een volwaardig leerplatform met cohorten en een docentdashboard.\n\nHet platform is technisch al grotendeels gerealiseerd en wordt via een gestructureerde fasering afgebouwd, getest en overgedragen.\n\n**Voor gebruikers (makers en alumni)**\n- **Verbinden & netwerken:** slimme matching op sector en vraagstukken, profielen van makers, 1-op-1 chat, mentorschap-koppelingen en realtime notificaties.\n- **Kennis delen:** centrale kennisbank, vraag-en-aanbod module, blogs, praktijkervaringen en een persoonlijke bewaarfunctie.\n- **Leren & ontwikkelen:** gestructureerde programma\'s, modulaire lessen, leertrajecten per editie of cohort en directe interactie met docenten en coaches.\n- **Events & ticketing:** evenementenkalender, online ticketverkoop, veilige online betalingen en toegang via QR-codes.\n- **Persoonlijk dashboard:** onboarding, profielbeheer en instellingen voor privacy en notificaties.\n- **Marketing & merkidentiteit:** volledige publieke website met homepage, over ons, sectoroverzichten, FAQ, privacyverklaring, algemene voorwaarden en SEO-optimalisatie.\n\n**Voor beheerders en docenten**\n- **Docentdashboard:** overzicht om deelnemers binnen cohorten te volgen, opdrachten in te zien en feedback te geven.\n- **Programma- en cohortenbeheer:** beheerschermen voor lesprogramma\'s, cohorten en edities.\n- **Community CRM & analytics:** inzicht in platformgroei, gebruikersactiviteit, cohortstatistieken en ledenbeheer.\n- **AI-contentgeneratie:** ingebouwde AI-ondersteuning voor blogs, updates en programmabeschrijvingen.\n- **Geïntegreerde communicatie:** gerichte mailcampagnes en notificatiestromen naar specifieke groepen of het hele netwerk.\n- **Beveiliging & AVG:** wachtwoord-reset, rolgebaseerde authenticatie, veilige uploads, audit-logs en AVG-tools voor databeheer.',
    ),
    { kind: 'investment', title: 'Investering', body: 'Voor deze samenwerking hanteren we een tweejarig model met een substantiële partnervoorwaarde: in jaar 1 een partnervoorziening van 50% korting, gevolgd door 20% korting in jaar 2. Het reguliere basistarief bedraagt €3.750,00 excl. btw per jaar.', items: [] },
    text(
      'Voorwaarden & uitgangspunten',
      '**1. Licentieovereenkomst & duur.** De samenwerking wordt aangegaan voor een vaste periode van twee (2) jaar met ingang van de opleveringsdatum. De startdatum van de operationele fase wordt in gezamenlijk overleg tijdens de kick-off vastgelegd.\n\n**2. Volledig intellectueel eigendom & hosting.** In tegenstelling tot standaard software-as-a-service oplossingen behoudt {{klant}} de volledige regie:\n- **Codebase & eigendom:** alle ontwikkelde broncode wordt ondergebracht in een GitHub-organisatie op naam van {{klant}}. Het intellectueel eigendom en alle programmatuur behoren volledig toe aan de opdrachtgever.\n- **Cloudinfrastructuur:** de hostingaccounts (o.a. Vercel voor hosting en frontend, Neon voor database) worden ingericht op naam en beheer van {{klant}}.\n- **Toegang na oplevering:** WeAreImpact heeft na afronding en oplevering geen productietoegang meer, tenzij dit expliciet schriftelijk wordt verzocht voor technisch support of updates.\n\n**3. Data-integriteit & AVG.** Persoonsgegevens van deelnemers en ondernemers worden strikt verwerkt conform de AVG. Beveiliging (beveiligde uploads, veilige token-authenticatie en wachtwoord-resets) is integraal onderdeel van de bouw. Het platform beschikt over ingebouwde audit-logs en functies voor geautomatiseerde gegevensbescherming.\n\n**4. Preferred partnership & doorontwikkeling.** Na de succesvolle oplevering en overdracht blijft WeAreImpact beschikbaar als preferred technology partner. Toekomstig functioneel onderhoud, doorontwikkeling, geavanceerde AI-workflows en aanvullende maatwerkmodules worden vastgelegd in een aparte onderhouds- en partnerovereenkomst.',
    ),
    {
      kind: 'phases',
      title: 'Fasering & vervolgstappen',
      body: '',
      items: [
        { label: 'Stap 1', title: 'Ondertekening', text: 'Bevestiging van dit voorstel en de bijbehorende voorwaarden.' },
        { label: 'Stap 2', title: 'Kick-off & intake', text: 'Detailafstemming over de afronding van de openstaande ontwikkeling en specifieke configuratiewensen.' },
        { label: 'Stap 3', title: 'Afbouw & acceptatietest', text: 'Voltooiing van de resterende functionaliteiten en een gezamenlijke acceptatietest.' },
        { label: 'Stap 4', title: 'Overdracht & go-live', text: 'Overdracht van de GitHub-repository en hostingomgeving, waarna het platform officieel in gebruik wordt genomen.' },
      ],
    },
  ],
  lines: [
    {
      optional: false,
      description: 'Samenmakers Platform, jaar 1',
      detail: 'Licentie, afbouw, hosting-overdracht en ondersteuning. Partnervoorziening 50%.',
      quantity: 1,
      unit: 'jaar',
      unitPriceCents: 375000,
      discountPct: 50,
      period: 'Jaar 1',
    },
    {
      optional: false,
      description: 'Samenmakers Platform, jaar 2',
      detail: 'Licentie en ondersteuning. Partnervoorziening 20%.',
      quantity: 1,
      unit: 'jaar',
      unitPriceCents: 375000,
      discountPct: 20,
      period: 'Jaar 2',
    },
  ],
  schedule: [
    { label: 'Jaar 1 · vooraf', trigger: 'akkoord', period: 'Jaar 1' },
    { label: 'Jaar 2 · vooraf', trigger: 'datum', period: 'Jaar 2', dueOn: null },
  ],
};

export const QUOTE_TEMPLATES: QuoteTemplate[] = [sprint, platform];

export function getTemplate(key: string): QuoteTemplate {
  return QUOTE_TEMPLATES.find((t) => t.key === key) ?? sprint;
}

export function applyClientName<T extends { title: string; subtitle: string; sections: QuoteSection[] }>(
  template: T,
  clientName: string,
): T {
  const sub = (s: string) => s.replaceAll('{{klant}}', clientName);
  return {
    ...template,
    title: sub(template.title),
    subtitle: sub(template.subtitle),
    sections: template.sections.map((s) => ({
      ...s,
      title: sub(s.title),
      body: sub(s.body),
      items: s.items.map((i) => ({ ...i, title: sub(i.title), text: sub(i.text) })),
    })),
  };
}
