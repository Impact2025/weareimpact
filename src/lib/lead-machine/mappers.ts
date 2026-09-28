import type { ProspectLead } from './types';

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p.map(String) : []; } catch { return []; }
  }
  return [];
}

const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : undefined);

export function mapLead(r: Record<string, unknown>): ProspectLead {
  return {
    id: r.id as string,
    tenantId: r.tenant_id as string,
    kvkNumber: (r.kvk_number as string) ?? undefined,
    name: r.name as string,
    domain: (r.domain as string) ?? undefined,
    address: (r.address as string) ?? undefined,
    city: (r.city as string) ?? undefined,
    postalCode: (r.postal_code as string) ?? undefined,
    website: (r.website as string) ?? undefined,
    email: (r.email as string) ?? undefined,
    emailCandidates: arr(r.email_candidates),
    phone: (r.phone as string) ?? undefined,
    contactPerson: (r.contact_person as string) ?? undefined,
    aiScore: r.ai_score != null ? Number(r.ai_score) : undefined,
    aiRationale: (r.ai_rationale as string) ?? undefined,
    orgType: (r.org_type as string) ?? undefined,
    segment: ((r.segment as string)?.trim() || undefined) as ProspectLead['segment'],
    summary: (r.summary as string) ?? undefined,
    hooks: arr(r.hooks),
    signal: (r.signal as string) ?? undefined,
    source: (r.source as ProspectLead['source']) ?? undefined,
    sourceUrl: (r.source_url as string) ?? undefined,
    status: r.status as ProspectLead['status'],
    starred: Boolean(r.starred),
    notes: (r.notes as string) ?? undefined,
    crmCompanyId: (r.crm_company_id as string) ?? undefined,
    unsubscribed: Boolean(r.unsubscribed),
    firstContactedAt: iso(r.first_contacted_at),
    lastContactedAt: iso(r.last_contacted_at),
    repliedAt: iso(r.replied_at),
    meetingAt: iso(r.meeting_at),
    wonAt: iso(r.won_at),
    lostReason: (r.lost_reason as string) ?? undefined,
    createdAt: iso(r.created_at) as string,
    updatedAt: iso(r.updated_at) as string,
  };
}
