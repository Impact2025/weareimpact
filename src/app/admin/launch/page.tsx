'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Rocket, ArrowRight, Lock, Users, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Launch {
  slug: string;
  name: string;
  client_name: string | null;
  template: string;
  go_live_date: string | null;
  live_at: string | null;
  total: string;
  done: string;
  blockers: string;
  waiting_on_client: string;
  overdue: string;
  failing_checks: string;
}

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function LaunchPortfolioPage() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/launch')
      .then((r) => r.json())
      .then((d) => setLaunches(d.launches ?? []))
      .finally(() => setLoading(false));
  }, []);

  const active = launches.filter((l) => !l.live_at);
  const live = launches.filter((l) => l.live_at);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-orange-600" /> LaunchAssist
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Alle lopende lanceringen. Open een klantdossier en kies "Launch" om er een te starten.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : launches.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-slate-500">
          Nog geen launches. Ga naar <Link className="underline" href="/admin/dossiers">Klantdossiers</Link>, open een project en kies "Launch".
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          {[{ title: 'Onderweg', items: active }, { title: 'Live', items: live }].map(({ title, items }) =>
            items.length === 0 ? null : (
              <section key={title}>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{title} · {items.length}</h2>
                <div className="space-y-2">
                  {items.map((l) => {
                    const total = Number(l.total), done = Number(l.done);
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    const days = daysUntil(l.go_live_date);
                    return (
                      <Link key={l.slug} href={`/admin/dossiers/${l.slug}/launch`}>
                        <Card className="hover:border-orange-300 transition"><CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{l.name}</div>
                              <div className="text-xs text-slate-500">
                                {l.client_name ?? '—'} · {l.template}
                                {days !== null && !l.live_at && (
                                  <span className={days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : ''}>
                                    {' '}· {days < 0 ? `${-days} dagen over tijd` : days === 0 ? 'go-live vandaag' : `go-live over ${days} dagen`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {Number(l.blockers) > 0 && !l.live_at && <Badge className="bg-red-100 text-red-700"><Lock className="w-3 h-3 mr-1" />{l.blockers}</Badge>}
                              {Number(l.waiting_on_client) > 0 && <Badge className="bg-amber-100 text-amber-800"><Users className="w-3 h-3 mr-1" />{l.waiting_on_client}</Badge>}
                              {Number(l.overdue) > 0 && <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />{l.overdue}</Badge>}
                              {Number(l.failing_checks) > 0 && <Badge className="bg-red-100 text-red-700"><ShieldAlert className="w-3 h-3 mr-1" />{l.failing_checks}</Badge>}
                              <span className="text-sm font-semibold text-slate-700 w-10 text-right">{pct}%</span>
                              <ArrowRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div className={`h-full ${pct === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </CardContent></Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}
