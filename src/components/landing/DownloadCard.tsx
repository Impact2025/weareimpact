'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvents, event } from '@/components/analytics';
import type { AiPmDownload } from '@/lib/ai-pm-downloads';

export function DownloadCard({ d }: { d: AiPmDownload }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [organisatie, setOrganisatie] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; emailed: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/ai-pm-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, organisatie, website, resource: d.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'mislukt');
      setResult({ url: data.url, emailed: !!data.emailed });
      trackEvents.downloadResource(d.id);
      event({ action: 'generate_lead', category: 'Lead', label: `ai_pm_${d.id}` });
    } catch (err) {
      setError(err instanceof Error && err.message !== 'mislukt' ? err.message : 'Er ging iets mis. Probeer het opnieuw.');
      trackEvents.error('ai_pm_download', d.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col shadow-sm">
      <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
        <FileText className="text-orange-600" size={22} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{d.title}</h2>
      <p className="text-slate-600 leading-relaxed text-[0.95rem] mb-3">{d.description}</p>
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-5">PDF · {d.pages}</p>
      <Link href={d.related.href} className="text-sm text-orange-600 underline mb-6">
        {d.related.label}
      </Link>

      <div className="mt-auto">
        {result ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <p className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
              <CheckCircle size={18} /> Klaar
            </p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-900 font-semibold underline"
            >
              <Download size={16} /> Open de PDF
            </a>
            <p className="text-xs text-emerald-800 mt-2">
              {result.emailed ? 'Ik heb de link ook gemaild.' : 'De mail kon niet worden verstuurd, bewaar deze link.'}
            </p>
          </div>
        ) : !open ? (
          <Button
            onClick={() => {
              setOpen(true);
              trackEvents.ctaClick(`download_open_${d.id}`, 'ai_pm_templates');
            }}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download gratis
          </Button>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="email"
              required
              placeholder="je@organisatie.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="E-mailadres"
              autoComplete="email"
            />
            <Input
              type="text"
              placeholder="Organisatie (optioneel)"
              value={organisatie}
              onChange={(e) => setOrganisatie(e.target.value)}
              aria-label="Organisatie"
              autoComplete="organization"
            />
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              type="submit"
              disabled={busy}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              Stuur mij de PDF
            </Button>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ik gebruik je e-mailadres alleen om je de download te sturen en om te weten wie het document gebruikt. Je krijgt geen nieuwsbrief of vervolgmails. Zie het{' '}
              <Link href="/privacy" className="underline">privacybeleid</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
