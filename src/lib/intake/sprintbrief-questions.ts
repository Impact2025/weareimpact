import type { IntakeGroup } from './questions';

// De Sprintbrief is de gerichte vragenlijst die na goedkeuring van de gratis
// Fit & Focus-intake naar de klant gaat, specifiek voor het gekozen proces
// (zie SPRINTS in src/app/doorbraak-sprint/page.tsx). Vincent gebruikt de
// antwoorden om zich voor te bereiden vóórdat hij op locatie is.
export const SPRINT_TITLES: Record<string, string> = {
  'sprint-triage': 'Sprint 1: Intake- & Vraagtriage',
  'sprint-offerte': 'Sprint 2: Offerte- & Leadmachine',
  'sprint-impact': 'Sprint 3: Impact & Subsidies',
};

const COMMON_GROUP: IntakeGroup = {
  id: 'procesgrenzen',
  title: 'Procesgrenzen',
  intro: 'Om het proces op locatie meteen scherp te kunnen ontleden, wil ik van tevoren weten waar het precies begint en eindigt.',
  questions: [
    {
      id: 'trigger',
      text: 'Wat is het startpunt van dit proces — welke gebeurtenis of welk bericht zet het in gang?',
      multiline: true,
    },
    {
      id: 'eindresultaat',
      text: 'Wat is het eindresultaat als het proces goed is afgerond?',
      multiline: true,
    },
    {
      id: 'systemen',
      text: 'Welke systemen zijn erbij betrokken (mail, CRM, spreadsheet, specifieke software)?',
      multiline: true,
    },
    {
      id: 'systeemtoegang',
      text: 'Heb je op de sprintdag zelf toegang (inloggegevens) tot deze systemen op locatie, of moet dat nog geregeld worden?',
    },
  ],
};

const CASES_GROUP: IntakeGroup = {
  id: 'cases',
  title: 'Cases',
  intro: 'Met een paar echte (geanonimiseerde) voorbeelden kan ik de flow direct herkennen in plaats van te gokken.',
  questions: [
    {
      id: 'cases_aanleveren',
      text: 'Beschrijf 3 tot 10 geanonimiseerde, representatieve cases: wat kwam er binnen en wat deed diegene ermee? (Losse bijlage mag ook, dan hier kort samenvatten.)',
      multiline: true,
    },
    {
      id: 'uitzonderingen',
      text: 'Wat zijn de lastigste uitzonderingen die je nu tegenkomt in dit proces?',
      multiline: true,
    },
  ],
};

const SPRINT_SPECIFIC_GROUPS: Record<string, IntakeGroup> = {
  'sprint-triage': {
    id: 'triage',
    title: 'Intake & matching',
    intro: 'Specifiek voor de vraagtriage: hoe ziet de matching tussen hulpvraag en aanbod er nu uit?',
    questions: [
      {
        id: 'matching_criteria',
        text: 'Op welke criteria match je een hulpvraag met het juiste aanbod of de juiste collega?',
        multiline: true,
      },
      {
        id: 'huidige_categorisering',
        text: 'Categoriseer je binnenkomende vragen nu al (handmatig of automatisch), en zo ja, hoe?',
      },
    ],
  },
  'sprint-offerte': {
    id: 'offerte',
    title: 'Gesprek naar offerte',
    intro: 'Specifiek voor de offerte- en leadmachine: hoe gaat een gesprek nu naar een concept-offerte?',
    questions: [
      {
        id: 'offerte_sjabloon',
        text: 'Werk je met een vast offertesjabloon of moet elke offerte nu los worden opgebouwd?',
      },
      {
        id: 'crm_gebruik',
        text: 'Waar leg je klantgegevens en dealstatus nu vast (CRM, spreadsheet, niet gestructureerd)?',
      },
    ],
  },
  'sprint-impact': {
    id: 'impact',
    title: 'Impactbewijs & verantwoording',
    intro: 'Specifiek voor impact & subsidies: hoe verzamel je nu bewijs voor je rapportages?',
    questions: [
      {
        id: 'kpi_bronnen',
        text: "Uit welke bronnen haal je nu de uren, KPI's en bewijsstukken voor een rapportage?",
        multiline: true,
      },
      {
        id: 'rapportage_deadline',
        text: 'Hoe vaak en aan wie rapporteer je, en wanneer is de eerstvolgende deadline?',
      },
    ],
  },
};

export function getSprintbriefGroups(sprintSlug: string): IntakeGroup[] {
  const specific = SPRINT_SPECIFIC_GROUPS[sprintSlug];
  return specific ? [COMMON_GROUP, specific, CASES_GROUP] : [COMMON_GROUP, CASES_GROUP];
}

export function getSprintTitle(sprintSlug: string): string {
  return SPRINT_TITLES[sprintSlug] || 'De AI Diagnose & Doorbraak Sprint';
}
