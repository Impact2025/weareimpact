// Los van inbox.ts zodat client-componenten de labels kunnen importeren
// zonder de database-driver mee te bundelen.
export const INBOX_SOURCES = {
  ai_scan: { label: 'AI-scanner', adminHref: '/admin/leads' },
  contact: { label: 'Contactformulier', adminHref: '/admin/contact' },
  intake: { label: 'Intake', adminHref: null },
  lead: { label: 'Lead', adminHref: null },
  impact_calc: { label: 'Impact-calculator', adminHref: null },
  workshop: { label: 'Workshop', adminHref: null },
  cv_download: { label: 'CV-download', adminHref: null },
  doorbraak_download: { label: 'Doorbraak-download', adminHref: null },
  scan: { label: 'Scan', adminHref: null },
  ai_pm_download: { label: 'Template-download', adminHref: '/admin/downloads' },
} as const;

export type InboxSource = keyof typeof INBOX_SOURCES;

export function isInboxSource(value: string): value is InboxSource {
  return value in INBOX_SOURCES;
}
