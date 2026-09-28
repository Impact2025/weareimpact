'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QUOTE_TEMPLATES } from '@/lib/finance/templates';

// Start een conceptofferte uit een sjabloon; vanuit een deal of bedrijf zijn de klantgegevens al ingevuld.
export function NewQuoteButton({
  dealId,
  companyId,
  label = 'Nieuwe offerte',
  variant = 'default',
  size = 'default',
}: {
  dealId?: string;
  companyId?: string;
  label?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create(templateKey: string) {
    setBusy(templateKey);
    setError(null);
    try {
      const res = await fetch('/api/admin/finance/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey, dealId, companyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Aanmaken mislukt');
      router.push(`/admin/finance/offertes/${data.quote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt');
      setBusy(null);
    }
  }

  return (
    <div className="relative inline-block">
      <Button variant={variant} size={size} onClick={() => setOpen((o) => !o)} className={variant === 'default' ? 'bg-orange-600 hover:bg-orange-700' : ''}>
        <FilePlus2 size={16} className="mr-2" aria-hidden /> {label}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Kies een sjabloon</p>
            {QUOTE_TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => create(t.key)}
                disabled={busy !== null}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-orange-50 disabled:opacity-60"
              >
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{t.label}</span>
                  <span className="block text-xs text-slate-500">{t.description}</span>
                </span>
                {busy === t.key && <Loader2 size={16} className="mt-1 animate-spin text-orange-600" aria-hidden />}
              </button>
            ))}
            {error && <p className="px-3 py-2 text-xs text-red-600">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
