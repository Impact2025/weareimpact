'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Row = {
  url: string;
  hits: string;
  last_seen: string;
};

export default function Page404Logs() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/log-404');
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch {
      setError('Kon 404-log niet laden');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalHits = rows.reduce((s, r) => s + Number(r.hits), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/seo">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={14} className="mr-1.5" />
              Terug
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              404-log
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              URLs die bezoekers en Google niet kunnen vinden — gebruik dit om redirects toe te voegen
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Vernieuwen
        </Button>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">Unieke 404-URLs</p>
            <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">Totale hits</p>
            <p className="text-2xl font-bold text-orange-600">{totalHits}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Laden…</span>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <AlertTriangle size={24} />
            <p className="text-sm">Nog geen 404s gelogd — de tabel vult zich zodra bezoekers een 404 raken.</p>
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">URL</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600 w-24">Hits</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600 w-40">Laatste hit</th>
                <th className="px-5 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const hits = Number(row.hits);
                return (
                  <tr key={row.url} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-700 break-all">
                      {row.url}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Badge
                        variant={hits >= 10 ? 'destructive' : hits >= 3 ? 'secondary' : 'outline'}
                        className="tabular-nums"
                      >
                        {hits}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 text-xs">
                      {new Date(row.last_seen).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`https://weareimpact.nl${row.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-orange-600 transition-colors"
                        title="Open op site"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-sm text-orange-800">
        <p className="font-semibold mb-1">Hoe gebruik je dit?</p>
        <p>
          Zie je een URL met veel hits? Voeg een 301-redirect toe in{' '}
          <code className="bg-orange-100 px-1 rounded font-mono text-xs">next.config.ts</code>{' '}
          in de <code className="bg-orange-100 px-1 rounded font-mono text-xs">redirects()</code> array.
          Google stopt dan met crawlbudget verspillen aan die URL.
        </p>
      </div>
    </div>
  );
}
