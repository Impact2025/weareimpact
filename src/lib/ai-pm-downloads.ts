// Gratis downloads bij de AI-projectmanager-cluster. De bestanden worden gebouwd met
// scripts/build-ai-pm-downloads.mjs uit content/downloads/ (bestandsnamen moeten overeenkomen
// met de DOCS-lijst in dat script).

export const BASE_URL = 'https://weareimpact.nl';

export type DownloadPhase = 'start' | 'pilot' | 'besluit' | 'inhuren';

export const PHASE_LABELS: Record<DownloadPhase, { title: string; intro: string }> = {
  start: {
    title: 'Voor de start',
    intro: 'Zorg dat het project een eigenaar, een nulmeting, privacy op orde en een goede kick-off heeft voordat de pilot begint.',
  },
  pilot: {
    title: 'Tijdens de pilot',
    intro: 'Meet wat het oplevert en hou de risico\'s in beeld, elke twee weken.',
  },
  besluit: {
    title: 'Besluit en opschalen',
    intro: 'Doorgaan, bijsturen of stoppen, en zorg dat het resultaat zonder jou kan draaien.',
  },
  inhuren: {
    title: 'Een AI-projectmanager kiezen',
    intro: 'Toets kennis en werkwijze, en vergelijk zzp, bureau en intern op totale kosten per resultaat.',
  },
};

export interface AiPmDownload {
  id: string;
  title: string;
  short: string;
  description: string;
  pages: string;
  file: string; // pad onder /downloads
  phase?: DownloadPhase;
  featured?: boolean;
  related: { label: string; href: string };
}

export const AI_PM_DOWNLOADS: AiPmDownload[] = [
  // ── Voor de start ──
  {
    id: 'ai-projectplan',
    title: 'AI-projectplan op één pagina',
    short: 'AI-projectplan',
    description:
      'Probleem, nulmeting, succescriterium, zes fases, privacy, mensen, budget en besluitmomenten op één A4. Invulbaar en geschikt voor een stuurgroep.',
    pages: '1 pagina, A4',
    file: 'AI-Projectplan_Template_WeAreImpact.pdf',
    phase: 'start',
    featured: true,
    related: { label: 'Lees AI-implementatie in 6 fases', href: '/kennisbank/ai-implementatie-in-6-fases' },
  },
  {
    id: 'kickoff-agenda',
    title: 'Kick-off agenda voor een AI-project',
    short: 'Kick-off agenda',
    description:
      'Een gesprek van 90 minuten met tijden, doelen en een vak voor besluiten en acties, zodat je project met eigenaar, nulmeting en afspraken van start gaat.',
    pages: '1 pagina, A4',
    file: 'Kickoff-agenda_AI-project_WeAreImpact.pdf',
    phase: 'start',
    related: { label: 'Lees de zes fases', href: '/kennisbank/ai-implementatie-in-6-fases' },
  },
  {
    id: 'stakeholderkaart',
    title: 'Stakeholderkaart voor een AI-project',
    short: 'Stakeholderkaart',
    description:
      'Bestuur, juridisch, IT, werkvloer, leverancier en inwoners: hun zorgen, wat ze van je nodig hebben en hoe en wanneer je ze betrekt.',
    pages: '1 pagina, A4 liggend',
    file: 'Stakeholderkaart_AI-project_WeAreImpact.pdf',
    phase: 'start',
    related: { label: 'Lees stakeholders meenemen', href: '/kennisbank/stakeholders-meenemen-bij-ai-projecten' },
  },
  {
    id: 'privacychecklist',
    title: 'Privacychecklist voor een AI-project',
    short: 'Privacychecklist',
    description:
      'Zestien vragen in vijf stappen: gegevens, leverancier, DPIA en risicoklasse, mensen en controle, verantwoording. Geen juridisch advies, wel de juiste volgorde.',
    pages: '2 pagina\'s, A4',
    file: 'Privacychecklist_AI-project_WeAreImpact.pdf',
    phase: 'start',
    related: { label: 'Lees AI Act en AVG in een AI-project', href: '/kennisbank/ai-act-en-avg-in-een-ai-project' },
  },
  // ── Tijdens de pilot ──
  {
    id: 'meetblad',
    title: 'Meetblad: nulmeting en nameting',
    short: 'Meetblad nulmeting',
    description:
      'Acht meetpunten met uitleg hoe je meet: tijd per taak, fouten, doorlooptijd, tijd voor menselijke controle, gebruik, ervaring en kosten.',
    pages: '1 pagina, A4 liggend',
    file: 'Meetblad_Nulmeting-Nameting_WeAreImpact.pdf',
    phase: 'pilot',
    related: { label: 'Lees AI-implementatie in 6 fases', href: '/kennisbank/ai-implementatie-in-6-fases' },
  },
  {
    id: 'risicomatrix',
    title: 'Risicomatrix voor een AI-project',
    short: 'Risicomatrix',
    description:
      'Twaalf risico\'s die ik in AI-projecten het vaakst zie, elk met een eerste maatregel, plus ruimte voor kans, impact, eigenaar en status.',
    pages: '1 pagina, A4 liggend',
    file: 'Risicomatrix_AI-project_WeAreImpact.pdf',
    phase: 'pilot',
    featured: true,
    related: { label: 'Lees waarom AI-projecten stranden', href: '/kennisbank/waarom-ai-projecten-stranden' },
  },
  // ── Besluit en opschalen ──
  {
    id: 'go-no-go-checklist',
    title: 'Go/no-go-checklist voor een AI-project',
    short: 'Go/no-go-checklist',
    description:
      '12 vragen om vóór de pilot te beslissen of het mag beginnen, plus vier extra vragen en een besluitvak voor na de pilot. Met uitleg hoe je de uitkomst leest.',
    pages: '2 pagina\'s, A4',
    file: 'Go-No-Go_Checklist_AI-project_WeAreImpact.pdf',
    phase: 'besluit',
    featured: true,
    related: { label: 'Lees de toelichting in het artikel', href: '/kennisbank/go-no-go-checklist-ai-project' },
  },
  {
    id: 'besluit-leerblad',
    title: 'Besluit- en leerblad na de pilot',
    short: 'Besluit- en leerblad',
    description:
      'Zes signalen om te stoppen, drie vragen om bij te sturen, een besluitvak en een leerpagina: verwachting, uitkomst en wat je de volgende keer anders doet.',
    pages: '1 pagina, A4',
    file: 'Besluit-en-leerblad_AI-project_WeAreImpact.pdf',
    phase: 'besluit',
    related: { label: 'Lees wanneer je een AI-project stopt', href: '/kennisbank/wanneer-stop-je-een-ai-project' },
  },
  {
    id: 'overdrachtsplan',
    title: 'Overdrachtsplan voor een AI-project',
    short: 'Overdrachtsplan',
    description:
      'Wat wordt overgedragen, wie doet wat na de overdracht, welke documentatie hoort erbij, wat kost beheer en wanneer is de overdracht echt klaar.',
    pages: '2 pagina\'s, A4',
    file: 'Overdrachtsplan_AI-project_WeAreImpact.pdf',
    phase: 'besluit',
    related: { label: 'Lees van AI-pilot naar productie', href: '/kennisbank/ai-pilot-naar-productie' },
  },
  // ── Een AI-projectmanager kiezen ──
  {
    id: 'scorekaart',
    title: 'Scorekaart voor het kennismakingsgesprek',
    short: 'Scorekaart AI-projectmanager',
    description:
      'Tien vragen met sterk antwoord en waarschuwingssignaal, en kolommen om drie kandidaten naast elkaar te scoren. Ook bruikbaar voor een gesprek met mij.',
    pages: '1 pagina, A4 liggend',
    file: 'Scorekaart_AI-projectmanager_WeAreImpact.pdf',
    phase: 'inhuren',
    related: { label: 'Lees de tien vragen', href: '/kennisbank/vragen-aan-ai-projectmanager-voor-inhuur' },
  },
  {
    id: 'inhuurvergelijker',
    title: 'Inhuurvergelijker: zzp, bureau of intern',
    short: 'Inhuurvergelijker',
    description:
      'Vergelijk op totale kosten tot het resultaat in plaats van op uurtarief, inclusief de kosten van een mislukte poging en wat je vooraf moet vastleggen.',
    pages: '1 pagina, A4 liggend',
    file: 'Inhuurvergelijker_AI-projectmanager_WeAreImpact.pdf',
    phase: 'inhuren',
    related: { label: 'Lees wat een AI-projectmanager kost', href: '/kennisbank/wat-kost-een-ai-projectmanager' },
  },
];

/** Alles in één zip: één aanvraag, alle documenten. */
export const AI_PM_TOOLKIT: AiPmDownload = {
  id: 'toolkit',
  title: 'De complete AI-projectmanager-toolkit',
  short: 'Complete toolkit (zip)',
  description: `Alle ${AI_PM_DOWNLOADS.length} templates en checklists in één zip, in de volgorde waarin je ze in een AI-project gebruikt.`,
  pages: `ZIP met ${AI_PM_DOWNLOADS.length} PDF's`,
  file: 'AI-Projectmanager_Toolkit_WeAreImpact.zip',
  related: { label: 'Lees wat een AI-projectmanager doet', href: '/kennisbank/wat-doet-een-ai-projectmanager' },
};

export function getDownload(id: string): AiPmDownload | undefined {
  if (id === AI_PM_TOOLKIT.id) return AI_PM_TOOLKIT;
  return AI_PM_DOWNLOADS.find((d) => d.id === id);
}

export function downloadUrl(d: AiPmDownload): string {
  return `${BASE_URL}/downloads/${d.file}`;
}

export function downloadsByPhase(): { phase: DownloadPhase; items: AiPmDownload[] }[] {
  return (Object.keys(PHASE_LABELS) as DownloadPhase[]).map((phase) => ({
    phase,
    items: AI_PM_DOWNLOADS.filter((d) => d.phase === phase),
  }));
}
