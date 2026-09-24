// LaunchAssist-templates: fases + taken die bij het aanmaken van een launch in
// crm_milestones worden gezaaid. Een taak met `checkKey` wordt automatisch
// afgevinkt zodra die check slaagt (zie checks.ts).

export type Owner = 'vincent' | 'klant' | 'agent';

export const PHASES = ['Intake', 'Content & merk', 'Techniek', 'Testen', 'Go-live', 'Nazorg'] as const;
export type Phase = (typeof PHASES)[number];

export interface TemplateTask {
  title: string;
  phase: Phase;
  owner: Owner;
  blocking?: boolean;
  clientVisible?: boolean;
  checkKey?: string;
  description?: string;
}

export interface LaunchTemplate {
  key: string;
  label: string;
  description: string;
  tasks: TemplateTask[];
}

const WEBSITE_TECH: TemplateTask[] = [
  { title: 'Site bereikbaar via HTTPS', phase: 'Techniek', owner: 'agent', blocking: true, checkKey: 'https' },
  { title: 'Eén canonical domein (www ↔ apex zonder loop)', phase: 'Techniek', owner: 'agent', blocking: true, checkKey: 'canonical_domain' },
  { title: 'Sitemap klopt en verwijst alleen naar eigen site', phase: 'Techniek', owner: 'agent', blocking: true, checkKey: 'sitemap' },
  { title: 'robots.txt staat indexatie toe', phase: 'Techniek', owner: 'agent', blocking: true, checkKey: 'robots' },
  { title: 'Title, meta description en canonical op homepage', phase: 'Techniek', owner: 'agent', checkKey: 'meta' },
  { title: 'Privacy- en cookiebeleid aanwezig', phase: 'Techniek', owner: 'agent', blocking: true, checkKey: 'privacy' },
  { title: 'GSC-property gekoppeld en sitemap ingediend', phase: 'Techniek', owner: 'vincent' },
  { title: 'Analytics-ID actief', phase: 'Techniek', owner: 'vincent' },
];

const INTAKE: TemplateTask[] = [
  { title: 'Intakegesprek gevoerd', phase: 'Intake', owner: 'vincent', blocking: true, clientVisible: true },
  { title: 'Vragenlijst door klant ingevuld', phase: 'Intake', owner: 'klant', blocking: true, clientVisible: true },
  { title: 'Scope en afspraken schriftelijk bevestigd', phase: 'Intake', owner: 'vincent', blocking: true, clientVisible: true },
];

const GO_LIVE: TemplateTask[] = [
  { title: 'Klant heeft opleverpunten goedgekeurd', phase: 'Go-live', owner: 'klant', blocking: true, clientVisible: true },
  { title: 'DNS omgezet en site live', phase: 'Go-live', owner: 'vincent', blocking: true, clientVisible: true },
  { title: 'Lancering aangekondigd', phase: 'Go-live', owner: 'vincent', clientVisible: true },
];

const AFTERCARE: TemplateTask[] = [
  { title: "Week 1: fouten, 404's en indexatie gecontroleerd", phase: 'Nazorg', owner: 'vincent' },
  { title: 'Dag 30: evaluatie met klant', phase: 'Nazorg', owner: 'vincent', clientVisible: true },
  { title: 'Overdracht naar doorlopende SEO/social-routine', phase: 'Nazorg', owner: 'vincent' },
];

export const TEMPLATES: LaunchTemplate[] = [
  {
    key: 'vertical-site',
    label: 'Vertical-site',
    description: 'Branchesite op het gedeelde platform (bv. loodgieter, kapper) met eigen content en sitemap.',
    tasks: [
      ...INTAKE,
      { title: 'Merk, toon en doelgroep vastgelegd in SKILL.md', phase: 'Content & merk', owner: 'vincent', blocking: true },
      { title: 'Vertical-systeemprompt en -config aangemaakt', phase: 'Content & merk', owner: 'vincent', blocking: true },
      { title: 'Logo en huisstijl aangeleverd', phase: 'Content & merk', owner: 'klant', clientVisible: true },
      { title: 'Eerste 5 artikelen gegenereerd en gecontroleerd (700–1000 woorden)', phase: 'Content & merk', owner: 'agent', clientVisible: true },
      ...WEBSITE_TECH,
      { title: 'Vertical-isolatie: geraden slug van andere vertical geeft 404', phase: 'Testen', owner: 'agent', blocking: true, checkKey: 'vertical_isolation' },
      { title: '/api/publish getest met Bearer-key en guard', phase: 'Testen', owner: 'vincent', blocking: true },
      { title: 'Formulieren en notificatiemail getest', phase: 'Testen', owner: 'vincent', blocking: true },
      ...GO_LIVE,
      ...AFTERCARE,
    ],
  },
  {
    key: 'website',
    label: 'Website',
    description: 'Losse klantwebsite van intake tot nazorg.',
    tasks: [
      ...INTAKE,
      { title: 'Teksten aangeleverd of goedgekeurd', phase: 'Content & merk', owner: 'klant', blocking: true, clientVisible: true },
      { title: 'Beeldmateriaal aangeleverd', phase: 'Content & merk', owner: 'klant', clientVisible: true },
      ...WEBSITE_TECH,
      { title: 'Formulieren en notificatiemail getest', phase: 'Testen', owner: 'vincent', blocking: true },
      { title: 'Mobiel en snelheid gecontroleerd', phase: 'Testen', owner: 'vincent' },
      ...GO_LIVE,
      ...AFTERCARE,
    ],
  },
  {
    key: 'community-app',
    label: 'Community-app',
    description: 'App-traject met requirements, planning, branded app en nieuwe deelnemers.',
    tasks: [
      ...INTAKE,
      { title: 'Requirements: communitystructuur', phase: 'Content & merk', owner: 'vincent', blocking: true, clientVisible: true },
      { title: 'Organisatie-informatie en feedback aangeleverd', phase: 'Content & merk', owner: 'klant', clientVisible: true },
      { title: 'App-design goedgekeurd', phase: 'Techniek', owner: 'klant', blocking: true, clientVisible: true },
      { title: 'Registratieformulier en betaalde tickets werken', phase: 'Testen', owner: 'vincent', blocking: true, clientVisible: true },
      { title: 'Testronde iOS en Android', phase: 'Testen', owner: 'vincent', blocking: true, clientVisible: true },
      ...GO_LIVE,
      ...AFTERCARE,
    ],
  },
  {
    key: 'sprint',
    label: 'Sprint',
    description: 'Diagnose, Doorbraak, Borging op locatie.',
    tasks: [
      ...INTAKE,
      { title: 'Sprintbrief ingevuld', phase: 'Content & merk', owner: 'klant', blocking: true, clientVisible: true },
      { title: 'Diagnose uitgevoerd', phase: 'Techniek', owner: 'vincent', blocking: true, clientVisible: true },
      { title: 'Doorbraak uitgevoerd', phase: 'Testen', owner: 'vincent', blocking: true, clientVisible: true },
      { title: 'Borging: 1-A4 SOP opgeleverd', phase: 'Go-live', owner: 'vincent', blocking: true, clientVisible: true },
      ...AFTERCARE,
    ],
  },
];

export function getTemplate(key: string): LaunchTemplate | undefined {
  return TEMPLATES.find((t) => t.key === key);
}
