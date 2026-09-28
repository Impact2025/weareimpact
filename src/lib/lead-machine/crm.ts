// Kruiscontrole met het CRM: een organisatie die al in `companies` staat (bv.
// de 207 vrijwilligersorganisaties uit de 40km-lijst, met een eigen
// benaderingsplan) mag de Lead Machine nooit als nieuwe koude lead oppakken.

import { sql } from '@/lib/db/neon';
import { emailDomain, registrableDomain } from './domain';

export interface CrmMatch { id: string; name: string }

export interface CrmIndex {
  match(domain: string | null | undefined, name?: string | null): CrmMatch | null;
}

// Webmail- en platformdomeinen zeggen niets over welke organisatie het is.
const SHARED_DOMAINS = /^(gmail|hotmail|outlook|live|yahoo|icloud|ziggo|kpnmail|planet|hetnet|home|xs4all|online)\.|voorelkaar|socialekaart|vrijwilligerswerk/i;

export function normalizeOrgName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\b(stichting|vereniging|coöperatie|cooperatie|b\.?v\.?|gemeente)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export async function loadCrmIndex(): Promise<CrmIndex> {
  const rows = await sql`SELECT id, name, website, email FROM companies`.catch(() => [] as Record<string, unknown>[]);
  const byDomain = new Map<string, CrmMatch>();
  const byName = new Map<string, CrmMatch>();
  for (const r of rows) {
    const m = { id: String(r.id), name: String(r.name) };
    for (const d of [registrableDomain(r.website as string), registrableDomain(emailDomain(r.email as string))]) {
      if (d && !SHARED_DOMAINS.test(d)) byDomain.set(d, m);
    }
    const n = normalizeOrgName(String(r.name ?? ''));
    if (n.length >= 5) byName.set(n, m);
  }
  return {
    match(domain, name) {
      const d = registrableDomain(domain);
      if (d && byDomain.has(d)) return byDomain.get(d)!;
      const n = normalizeOrgName(name ?? '');
      return n.length >= 5 ? byName.get(n) ?? null : null;
    },
  };
}
