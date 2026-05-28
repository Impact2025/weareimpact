'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, Loader2, AlertTriangle,
  CheckCircle2, AlertCircle, ExternalLink, FileText, BookOpen, ImagePlus, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AuditRow } from '@/app/api/admin/seo/content-audit/route';

type Summary = { total: number; critical: number; warning: number; good: number; markdown_only: number };

type Filter = 'all' | 'critical' | 'warning' | 'good';

function ScoreBadge({ score }: { score: number }) {
  if (score < 40) return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle size={13} />{score}</span>;
  if (score < 70) return <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600"><AlertTriangle size={13} />{score}</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 size={13} />{score}</span>;
}

function ReadingBadge({ words }: { words: number }) {
  if (words < 300) return <Badge variant="destructive" className="text-xs">{words}w</Badge>;
  if (words < 600) return <Badge variant="secondary" className="text-xs">{words}w</Badge>;
  return <Badge variant="outline" className="text-xs text-green-700">{words}w</Badge>;
}

export default function ContentAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  async function generateImages() {
    setGenerating(true);
    setGenerateResult(null);
    try {
      const res = await fetch('/api/admin/seo/bulk-featured-images', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setGenerateResult(`Fout: ${data.error}`);
      } else {
        setGenerateResult(`✓ ${data.total} afbeeldingen gegenereerd (${data.kb} kennisbank, ${data.blog} blog)`);
        await load();
      }
    } catch {
      setGenerateResult('Verbindingsfout');
    } finally {
      setGenerating(false);
    }
  }

  async function submitAll() {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/admin/seo/submit-all', { method: 'POST' });
      const data = await res.json();
      const parts = [`${data.submitted} URLs ingediend`];
      if (data.google) parts.push('Google ✓');
      if (data.bing) parts.push('Bing ✓');
      setSubmitResult(parts.join(' · '));
    } catch {
      setSubmitResult('Verbindingsfout');
    } finally {
      setSubmitting(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/seo/content-audit');
      const data = await res.json();
      setRows(data.rows ?? []);
      setSummary(data.summary ?? null);
    } catch {
      setError('Kon audit niet laden');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const visible = rows.filter((r) => {
    if (filter === 'critical') return r.score < 40;
    if (filter === 'warning')  return r.score >= 40 && r.score < 70;
    if (filter === 'good')     return r.score >= 70;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/seo">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={14} className="mr-1.5" />
              Terug
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content Audit</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Gepubliceerde kennisbank- en blogartikelen gescoord op SEO-kwaliteit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {submitResult && (
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              {submitResult}
            </span>
          )}
          {generateResult && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              {generateResult}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={submitAll} disabled={submitting || loading}>
            {submitting
              ? <Loader2 size={14} className="mr-1.5 animate-spin" />
              : <Send size={14} className="mr-1.5" />
            }
            {submitting ? 'Indienen…' : 'Submit IndexNow'}
          </Button>
          <Button variant="outline" size="sm" onClick={generateImages} disabled={generating || loading}>
            {generating
              ? <Loader2 size={14} className="mr-1.5 animate-spin" />
              : <ImagePlus size={14} className="mr-1.5" />
            }
            {generating ? 'Genereren…' : 'Genereer afbeeldingen'}
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Totaal', value: summary.total, color: 'text-slate-900', bg: 'bg-white', f: 'all' },
            { label: 'Kritiek (<40)', value: summary.critical, color: 'text-red-600', bg: 'bg-red-50', f: 'critical' },
            { label: 'Matig (40–69)', value: summary.warning, color: 'text-yellow-600', bg: 'bg-yellow-50', f: 'warning' },
            { label: 'Goed (≥70)', value: summary.good, color: 'text-green-600', bg: 'bg-green-50', f: 'good' },
            ...(summary.markdown_only > 0
              ? [{ label: 'Alleen markdown', value: summary.markdown_only, color: 'text-orange-600', bg: 'bg-orange-50', f: 'all' }]
              : []),
          ].map(({ label, value, color, bg, f }) => (
            <button
              key={label}
              onClick={() => setFilter(f as Filter)}
              className={`${bg} border rounded-xl px-4 py-4 text-left transition-all hover:shadow-sm ${filter === f ? 'ring-2 ring-orange-400' : 'border-slate-200'}`}
            >
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter chips */}
      {!loading && rows.length > 0 && (
        <p className="text-xs text-slate-400">
          {visible.length} van {rows.length} artikelen — sorteer op slechtste score
        </p>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Kwaliteit analyseren…</span>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">
            Geen artikelen in deze categorie.
          </div>
        )}
        {!loading && !error && visible.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Artikel</th>
                <th className="text-center px-3 py-3 font-medium w-20">Score</th>
                <th className="text-center px-3 py-3 font-medium w-20">Woorden</th>
                <th className="text-center px-3 py-3 font-medium w-10" title="SEO-titel">T</th>
                <th className="text-center px-3 py-3 font-medium w-10" title="Meta-omschrijving">M</th>
                <th className="text-center px-3 py-3 font-medium w-10" title="Afbeelding">A</th>
                <th className="text-right px-3 py-3 font-medium w-16">Views</th>
                <th className="px-5 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((row) => {
                const isExpanded = expanded === row.id;
                return (
                  <>
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : row.id)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {row.source === 'kennisbank'
                            ? <BookOpen size={14} className="text-blue-400 flex-shrink-0" />
                            : <FileText size={14} className="text-purple-400 flex-shrink-0" />
                          }
                          <span className="font-medium text-slate-800 line-clamp-1">{row.title}</span>
                          {row.markdown_only && (
                            <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                              MD
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 ml-6">/{row.source}/{row.slug}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ScoreBadge score={row.score} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ReadingBadge words={row.word_count_est} />
                      </td>
                      <td className="px-3 py-3 text-center text-base">
                        {row.has_seo_title ? '✅' : '❌'}
                      </td>
                      <td className="px-3 py-3 text-center text-base">
                        {row.has_seo_description ? '✅' : '❌'}
                      </td>
                      <td className="px-3 py-3 text-center text-base">
                        {row.has_featured_image ? '✅' : '❌'}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-500 tabular-nums">
                        {row.views.toLocaleString('nl-NL')}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={row.edit_url}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-orange-600 hover:underline font-medium"
                          >
                            Bewerk
                          </Link>
                          <a
                            href={`https://weareimpact.nl/${row.source}/${row.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${row.id}-exp`} className="bg-orange-50/60">
                        <td colSpan={8} className="px-5 py-3">
                          <p className="text-xs font-semibold text-slate-600 mb-1.5">Verbeterpunten:</p>
                          <ul className="flex flex-wrap gap-2">
                            {row.issues.map((issue) => (
                              <li key={issue} className="text-xs bg-white border border-orange-200 text-orange-800 px-2.5 py-1 rounded-full">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      {!loading && !error && visible.length > 0 && (
        <div className="text-xs text-slate-400 flex flex-wrap gap-4">
          <span><BookOpen size={12} className="inline mr-1 text-blue-400" />Kennisbank</span>
          <span><FileText size={12} className="inline mr-1 text-purple-400" />Blog</span>
          <span><strong>T</strong> = SEO-titel &nbsp; <strong>M</strong> = Meta-omschrijving &nbsp; <strong>A</strong> = Afbeelding</span>
          <span>Klik op een rij voor verbeterpunten</span>
        </div>
      )}
    </div>
  );
}
