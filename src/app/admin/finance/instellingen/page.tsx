'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Check, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FinanceSettings } from '@/lib/finance/types';

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100';

const TEXT: [keyof FinanceSettings, string][] = [
  ['legalName', 'Juridische naam (op offerte en factuur)'], ['tradeName', 'Handelsnaam (logo-tekst)'],
  ['representedBy', 'Tekenbevoegde'], ['representedRole', 'Functie'],
  ['kvk', 'KvK-nummer'], ['btw', 'BTW-nummer'],
  ['iban', 'IBAN'], ['email', 'E-mail op documenten'],
  ['address', 'Adres'], ['postcode', 'Postcode'], ['city', 'Plaats'], ['phone', 'Telefoon'],
];

export default function FinanceSettingsPage() {
  const [s, setS] = useState<FinanceSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/finance/settings').then((r) => r.json()).then((d) => setS(d.settings)).catch(() => setError('Laden mislukt'));
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/finance/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Opslaan mislukt');
      setS(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  }

  if (!s) return <div className="flex justify-center py-24 text-slate-400"><Loader2 className="animate-spin" aria-hidden /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-20">
      <Link href="/admin/finance" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={15} aria-hidden />Financiën</Link>
      <h1 className="text-2xl font-bold text-slate-900">Gegevens op offertes en facturen</h1>

      {!s.iban && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          Vul je IBAN in: zonder IBAN missen facturen het betaaladres.
        </p>
      )}
      <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
        Controleer of KvK, BTW-nummer en naam kloppen met de entiteit die factureert (B.V. of eenmanszaak). Deze gegevens staan straks op elke offerte en factuur.
      </p>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        {TEXT.map(([k, l]) => (
          <div key={k}>
            <label className="mb-1 block text-xs font-medium text-slate-600">{l}</label>
            <input className={field} value={String(s[k])} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
          </div>
        ))}
      </section>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
        {([['paymentDays', 'Betaaltermijn (dagen)'], ['quoteValidDays', 'Offerte geldig (dagen)'], ['vatRate', 'Standaard btw %']] as [keyof FinanceSettings, string][]).map(([k, l]) => (
          <div key={k}>
            <label className="mb-1 block text-xs font-medium text-slate-600">{l}</label>
            <input type="number" className={field} value={Number(s[k])} onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })} />
          </div>
        ))}
      </section>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Button onClick={save} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
        {saving ? <Loader2 size={16} className="mr-2 animate-spin" aria-hidden /> : saved ? <Check size={16} className="mr-2" aria-hidden /> : <Save size={16} className="mr-2" aria-hidden />}
        {saved ? 'Opgeslagen' : 'Opslaan'}
      </Button>
    </div>
  );
}
