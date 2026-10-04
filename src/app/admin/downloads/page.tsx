'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, RefreshCw, Mail, Trash2, Flame, Eye, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDownload } from '@/lib/ai-pm-downloads';
import type { DownloadLeadRow, DownloadStats } from '@/lib/download-leads';

const SEGMENTS: Record<string, string> = {
  overheid: 'Overheid',
  zorg_welzijn: 'Zorg en welzijn',
  zakelijk: 'Zakelijk',
  prive: 'Privé-adres',
  onbekend: 'Onbekend',
};

const RANGES = [7, 30, 90];

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = ms / 3600000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (h < 48) return `${Math.round(h)} u`;
  return `${Math.round(h / 24)} d`;
}

function label(resource: string) {
  return getDownload(resource)?.short ?? resource;
}

function Bars({ items, labelOf }: { items: { name: string; n: number }[]; labelOf?: (n: string) => string }) {
  const max = Math.max(1, ...items.map((i) => i.n));
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Nog geen data.</p>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.name} className="text-sm">
          <div className="flex justify-between gap-3 mb-0.5">
            <span className="truncate">{labelOf ? labelOf(i.name) : i.name}</span>
            <span className="tabular-nums text-muted-foreground">{i.n}</span>
          </div>
          <div className="h-1.5 rounded bg-slate-100">
            <div className="h-1.5 rounded bg-orange-500" style={{ width: `${(i.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DownloadsAdminPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [leads, setLeads] = useState<DownloadLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/downloads?days=${days}`);
      if (!res.ok) throw new Error('laden mislukt');
      const data = await res.json();
      setStats(data.stats);
      setLeads(data.leads);
    } catch {
      setError('Kon de downloads niet laden.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  async function erase(email: string) {
    if (!window.confirm(`Persoonsgegevens van ${email} wissen? Dit kan niet ongedaan worden gemaakt. De anonieme statistiek blijft.`)) return;
    const res = await fetch('/api/admin/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'erase', email }),
    });
    if (res.ok) load();
    else setError('Wissen mislukt.');
  }

  const openRate = stats && stats.uniqueLeads > 0 ? Math.round((stats.opened / stats.uniqueLeads) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Download size={22} /> Downloads
          </h1>
          <p className="text-sm text-muted-foreground">
            Aanvragen van de templates en de toolkit. Nieuwe leads staan ook in{' '}
            <Link href="/admin/inbox" className="underline">Binnenkomend</Link>, waar je ze naar het CRM kunt zetten.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <Button key={r} size="sm" variant={days === r ? 'default' : 'outline'} onClick={() => setDays(r)}>
              {r} dagen
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={load} disabled={loading} aria-label="Vernieuwen">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { l: 'Aanvragen', v: stats.requests },
              { l: 'Unieke leads', v: stats.uniqueLeads },
              { l: 'Warme leads', v: stats.warmLeads },
              { l: 'Document geopend', v: `${stats.opened} (${openRate}%)` },
              { l: 'Opt-in tips', v: stats.optins },
            ].map((c) => (
              <Card key={c.l}>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.l}</p>
                  <p className="text-2xl font-bold tabular-nums">{c.v}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-3">Per document</h2>
                <Bars items={stats.byResource.map((r) => ({ name: r.resource, n: r.n }))} labelOf={label} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-3">Per bron</h2>
                <Bars items={stats.bySource.map((r) => ({ name: r.source, n: r.n }))} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-3">Per segment</h2>
                <Bars items={stats.bySegment.map((r) => ({ name: r.segment, n: r.n }))} labelOf={(n) => SEGMENTS[n] ?? n} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-3">Lead</th>
                <th className="p-3">Segment</th>
                <th className="p-3">Documenten</th>
                <th className="p-3">Bron</th>
                <th className="p-3">Signalen</th>
                <th className="p-3">Wanneer</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    Nog geen aanvragen.
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.email} className="border-b last:border-0 align-top">
                  <td className="p-3">
                    <div className="font-medium break-all">{l.email}</div>
                    {l.organisatie && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 size={12} /> {l.organisatie}
                      </div>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>{SEGMENTS[l.segment ?? 'onbekend'] ?? l.segment}</div>
                    <div className="text-xs text-muted-foreground">score {l.score}/5</div>
                  </td>
                  <td className="p-3">{l.resources.map(label).join(', ')}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[180px] break-words">
                    {l.utmSource || l.sourcePage || 'direct'}
                    {l.referrer && !l.utmSource ? <div>{l.referrer.replace(/^https?:\/\//, '')}</div> : null}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {l.score >= 4 && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                          <Flame size={12} className="mr-1" /> warm
                        </Badge>
                      )}
                      {l.opens > 0 && (
                        <Badge variant="outline">
                          <Eye size={12} className="mr-1" /> geopend
                        </Badge>
                      )}
                      {l.followupOptin && <Badge variant="outline">opt-in</Badge>}
                      {l.inCrm && (
                        <Badge variant="outline">
                          <CheckCircle2 size={12} className="mr-1" /> in CRM
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">{ago(l.lastAt)}</td>
                  <td className="p-3 whitespace-nowrap">
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-orange-600 mr-3" title="Mail">
                      <Mail size={15} />
                    </a>
                    <button onClick={() => erase(l.email)} className="text-slate-400 hover:text-red-600" title="Persoonsgegevens wissen (AVG)">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Gegevens worden na 24 maanden geanonimiseerd, tenzij iemand in het CRM staat of een opt-in gaf. Een warme lead heeft score 4 of 5
        (overheid of zorg/welzijn, met organisatie, of meerdere documenten). &ldquo;Geopend&rdquo; telt geen mailscanners of bots.
      </p>
    </div>
  );
}
