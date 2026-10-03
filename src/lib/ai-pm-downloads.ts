// Gratis downloads bij de AI-projectmanager-cluster. De PDF's worden gebouwd met
// scripts/build-ai-pm-downloads.mjs uit content/downloads/*.html.

export const BASE_URL = 'https://weareimpact.nl';

export interface AiPmDownload {
  id: string;
  title: string;
  short: string;
  description: string;
  pages: string;
  file: string; // pad onder /downloads
  related: { label: string; href: string };
}

export const AI_PM_DOWNLOADS: AiPmDownload[] = [
  {
    id: 'go-no-go-checklist',
    title: 'Go/no-go-checklist voor een AI-project',
    short: 'Go/no-go-checklist',
    description:
      '12 vragen om vóór de pilot te beslissen of het mag beginnen, plus vier extra vragen en een besluitvak voor na de pilot. Met uitleg hoe je de uitkomst leest.',
    pages: '2 pagina\'s, A4',
    file: 'Go-No-Go_Checklist_AI-project_WeAreImpact.pdf',
    related: { label: 'Lees de toelichting in het artikel', href: '/kennisbank/go-no-go-checklist-ai-project' },
  },
  {
    id: 'ai-projectplan',
    title: 'AI-projectplan op één pagina',
    short: 'AI-projectplan',
    description:
      'Probleem, nulmeting, succescriterium, zes fases, privacy, mensen, budget en besluitmomenten op één A4. Invulbaar en geschikt voor een stuurgroep.',
    pages: '1 pagina, A4',
    file: 'AI-Projectplan_Template_WeAreImpact.pdf',
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
    related: { label: 'Lees waarom AI-projecten stranden', href: '/kennisbank/waarom-ai-projecten-stranden' },
  },
];

export function getDownload(id: string): AiPmDownload | undefined {
  return AI_PM_DOWNLOADS.find((d) => d.id === id);
}

export function downloadUrl(d: AiPmDownload): string {
  return `${BASE_URL}/downloads/${d.file}`;
}
