// Nederlandse labels voor CRM

import { DealStage, ActivityType, TaskPriority, TaskStatus } from './types';

export const dealStageLabels: Record<DealStage, string> = {
  lead: 'Lead',
  qualified: 'Gekwalificeerd',
  proposal: 'Voorstel',
  negotiation: 'Onderhandeling',
  won: 'Gewonnen',
  lost: 'Verloren',
};

export const dealStageColors: Record<DealStage, string> = {
  lead: 'bg-gray-100 text-gray-700',
  qualified: 'bg-blue-100 text-blue-700',
  proposal: 'bg-purple-100 text-purple-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

export const dealStageProbabilities: Record<DealStage, number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
};

export const activityTypeLabels: Record<ActivityType, string> = {
  call: 'Telefoongesprek',
  email: 'Email',
  meeting: 'Afspraak',
  note: 'Notitie',
};

export const activityTypeIcons: Record<ActivityType, string> = {
  call: 'Phone',
  email: 'Mail',
  meeting: 'Calendar',
  note: 'FileText',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Laag',
  normal: 'Normaal',
  high: 'Hoog',
  urgent: 'Urgent',
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Open',
  in_progress: 'Bezig',
  completed: 'Afgerond',
  cancelled: 'Geannuleerd',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const companySizeLabels: Record<string, string> = {
  '1-10': '1-10 medewerkers',
  '11-50': '11-50 medewerkers',
  '51-200': '51-200 medewerkers',
  '201-500': '201-500 medewerkers',
  '500+': '500+ medewerkers',
};

export const industryLabels: Record<string, string> = {
  zorg: 'Zorg & Welzijn',
  onderwijs: 'Onderwijs',
  overheid: 'Overheid',
  tech: 'Tech & IT',
  zakelijk: 'Zakelijke Dienstverlening',
  retail: 'Retail & E-commerce',
  productie: 'Productie & Industrie',
  nonprofit: 'Non-profit',
  anders: 'Anders',
};

export const sourceLabels: Record<string, string> = {
  website: 'Website',
  ai_scanner: 'AI Scanner',
  referral: 'Referral',
  linkedin: 'LinkedIn',
  event: 'Event',
  cold: 'Cold outreach',
  anders: 'Anders',
};

// Formatting helpers
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Vandaag';
  if (diffDays === 1) return 'Gisteren';
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
  return formatDate(dateString);
}

export function getContactFullName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}
