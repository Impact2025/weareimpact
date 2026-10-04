'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvents, event } from '@/components/analytics';
import type { AiPmDownload } from '@/lib/ai-pm-downloads';

const ATTR_KEY = 'wai_attr';

/** Eerste aanraking van de sessie: UTM-tags en verwijzende site. Staat alleen in sessionStorage en gaat mee bij een aanvraag. */
function captureAttribution() {
  try {
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const q = new URLSearchParams(window.location.search);
    sessionStorage.setItem(
      ATTR_KEY,
      JSON.stringify({
        utm_source: q.get('utm_source'),
        utm_medium: q.get('utm_medium'),
        utm_campaign: q.get('utm_campaign'),
        referrer: document.referrer || null,
      }),
    );
  } catch {
    /* sessionStorage geblokkeerd: niet erg */
  }
}

function readAttribution(): Record<string, string | null> {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}');
  } catch {
    return {};
  }
}

export function DownloadCard({ d, highlight = false }: { d: AiPmDownload; highlight?: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [organisatie, setOrganisatie] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [followup, setFollowup] = useState(false); // optionele opt-in, nooit vooraf aangevinkt

  useEffect(() => {
    captureAttribution();
  }, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; emailed: boolean; followup: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/ai-pm-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          organisatie,
          website,
          resource: d.id,
          followup,
          sourcePage: window.location.pathname,
          ...readAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'mislukt');
      setResult({ url: data.url, emailed: !!data.emailed, followup: !!data.followup });
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
    <div className={`rounded-3xl border p-8 flex flex-col shadow-sm h-full ${highlight ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
      <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
        <FileText className="text-orange-600" size={22} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{d.title}</h3>
      <p className="text-slate-600 leading-relaxed text-[0.95rem] mb-3">{d.description}</p>
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-5">{d.file.endsWith('.zip') ? '' : 'PDF · '}{d.pages}</p>
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
              <Download size={16} /> {d.file.endsWith('.zip') ? 'Download de toolkit' : 'Open de PDF'}
            </a>
            <p className="text-xs text-emerald-800 mt-2">
              {result.emailed ? 'Ik heb de link ook gemaild.' : 'De mail kon niet worden verstuurd, bewaar deze link.'}
              {result.followup ? ' Je krijgt nog een mail om je aanmelding voor de tips te bevestigen.' : ''}
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
            <label className="flex items-start gap-2 text-sm text-slate-600 leading-snug cursor-pointer">
              <input
                type="checkbox"
                checked={followup}
                onChange={(e) => setFollowup(e.target.checked)}
                className="mt-1 h-4 w-4 accent-orange-600"
              />
              <span>Ja, stuur me af en toe een tip over AI-projecten (maximaal één keer per maand, altijd afmeldbaar).</span>
            </label>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <Button
              type="submit"
              disabled={busy}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {d.file.endsWith('.zip') ? 'Stuur mij de toolkit' : 'Stuur mij de PDF'}
            </Button>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ik gebruik je e-mailadres om je het document te sturen en om te zien welke documenten worden gebruikt. Zonder vinkje krijg je geen nieuwsbrief of vervolgmails. Ik bewaar dit maximaal 24 maanden. Zie het{' '}
              <Link href="/privacy" className="underline">privacybeleid</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
