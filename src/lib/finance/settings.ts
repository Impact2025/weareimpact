import { sql } from '@/lib/db/neon';
import { ensureFinanceSchema } from './schema';
import type { FinanceSettings } from './types';

// Standaardwaarden uit KvK-uittreksel (WeAreImpact B.V., 70285888) en de
// bestaande voorwaardenpagina. IBAN staat bewust leeg: dat vult Vincent in.
export const DEFAULT_SETTINGS: FinanceSettings = {
  legalName: 'WeAreImpact B.V.',
  tradeName: 'WeAreImpact',
  representedBy: 'Vincent van Munster',
  representedRole: 'Directeur',
  kvk: '70285888',
  btw: 'NL858236369B01',
  iban: '',
  address: 'Planetenweg 5',
  postcode: '2132 HN',
  city: 'Hoofddorp',
  email: 'contact@weareimpact.nl',
  phone: '',
  paymentDays: 14,
  quoteValidDays: 30,
  vatRate: 21,
};

export async function getFinanceSettings(): Promise<FinanceSettings> {
  await ensureFinanceSchema();
  const rows = await sql`SELECT data FROM finance_settings WHERE id = 1`;
  const stored = (rows[0]?.data ?? {}) as Partial<FinanceSettings>;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveFinanceSettings(input: Partial<FinanceSettings>): Promise<FinanceSettings> {
  const current = await getFinanceSettings();
  const next: FinanceSettings = { ...current };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof FinanceSettings)[]) {
    const value = input[key];
    if (value === undefined) continue;
    if (typeof DEFAULT_SETTINGS[key] === 'number') {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) (next[key] as number) = n;
    } else if (typeof value === 'string') {
      (next[key] as string) = value.trim().slice(0, 300);
    }
  }
  await sql`
    INSERT INTO finance_settings (id, data, updated_at) VALUES (1, ${JSON.stringify(next)}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
  return next;
}
