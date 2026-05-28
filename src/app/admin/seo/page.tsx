'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Zap,
  Search,
  Globe,
  AlertTriangle,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Database,
  CheckCircle2,
  Settings,
} from 'lucide-react';

type GSCSite = { siteUrl: string; permissionLevel: string };

type PageRow = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type QueryRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type Suggestion = {
  title: string;
  description: string;
  rationale: string;
};

type OptimizeState = {
  loading: boolean;
  suggestions: Suggestion[] | null;
  error: string | null;
};

type ApplyState = {
  loading: boolean;
  applied: boolean;
  error: string | null;
};

type SortKey = 'impressions' | 'clicks' | 'ctr' | 'position';
type SortDir = 'asc' | 'desc';

const DAYS_OPTIONS = [
  { value: '28', label: '28 dagen' },
  { value: '90', label: '90 dagen' },
  { value: '180', label: '180 dagen' },
];

function ctrColor(ctr: number) {
  if (ctr < 0.01) return 'text-red-600 font-semibold';
  if (ctr < 0.03) return 'text-yellow-600';
  return 'text-green-600';
}

function posColor(pos: number) {
  if (pos <= 3) return 'text-green-600 font-semibold';
  if (pos <= 10) return 'text-blue-600';
  if (pos <= 20) return 'text-yellow-600';
  return 'text-red-500';
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    return u.pathname || '/';
  } catch {
    return url;
  }
}

function SeoPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'performance';

  const [sites, setSites] = useState<GSCSite[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [days, setDays] = useState('90');

  const [pageData, setPageData] = useState<PageRow[]>([]);
  const [queryData, setQueryData] = useState<QueryRow[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; ageMinutes?: number } | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('impressions');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [querySortKey, setQuerySortKey] = useState<SortKey>('impressions');
  const [querySortDir, setQuerySortDir] = useState<SortDir>('desc');

  const [optimizing, setOptimizing] = useState<Record<string, OptimizeState>>({});
  const [applying, setApplying] = useState<Record<string, ApplyState>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low-ctr' | 'quick-wins'>('all');

  // Load sites on mount
  useEffect(() => {
    fetch('/api/admin/seo/sites')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setSitesError(d.hint || d.error);
        } else {
          setSites(d.sites || []);
          if (d.sites?.length > 0) setSelectedSite(d.sites[0].siteUrl);
        }
      })
      .catch(() => setSitesError('Kon sites niet ophalen'));
  }, []);

  const fetchData = useCallback(async (bust = false) => {
    if (!selectedSite) return;
    setDataError(null);
    setCacheInfo(null);
    setLoadingPages(true);
    setLoadingQueries(true);

    const bustParam = bust ? '&bust=1' : '';

    fetch(`/api/admin/seo/performance?site=${encodeURIComponent(selectedSite)}&type=pages&days=${days}${bustParam}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setDataError(d.detail || d.error);
        else {
          setPageData(d.data || []);
          setCacheInfo({ cached: d.cached, ageMinutes: d.ageMinutes });
        }
      })
      .catch(() => setDataError('Pagina data ophalen mislukt'))
      .finally(() => setLoadingPages(false));

    fetch(`/api/admin/seo/performance?site=${encodeURIComponent(selectedSite)}&type=queries&days=${days}${bustParam}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setQueryData(d.data || []);
      })
      .catch(() => null)
      .finally(() => setLoadingQueries(false));
  }, [selectedSite, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleQuerySort = (key: SortKey) => {
    if (querySortKey === key) setQuerySortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setQuerySortKey(key); setQuerySortDir('desc'); }
  };

  const avgCtr = pageData.length > 0
    ? pageData.reduce((s, r) => s + r.ctr, 0) / pageData.length
    : 0;

  const filteredPages = pageData.filter((r) => {
    if (filter === 'low-ctr') return r.impressions >= 20 && r.ctr < Math.max(avgCtr, 0.02);
    if (filter === 'quick-wins') return r.impressions >= 10 && r.position >= 5 && r.position <= 20;
    return true;
  });

  const sortedPages = [...filteredPages].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDir === 'desc' ? -diff : diff;
  });

  const quickWinQueries = queryData.filter(
    (r) => r.impressions >= 10 && r.position >= 5 && r.position <= 20
  );

  const sortedQueries = [...quickWinQueries].sort((a, b) => {
    const diff = a[querySortKey] - b[querySortKey];
    return querySortDir === 'desc' ? -diff : diff;
  });

  const lowCtrPages = pageData.filter(
    (r) => r.impressions >= 20 && r.ctr < Math.max(avgCtr, 0.02)
  );

  const handleOptimize = async (page: PageRow) => {
    const key = page.page;
    setOptimizing((prev) => ({ ...prev, [key]: { loading: true, suggestions: null, error: null } }));

    try {
      const res = await fetch('/api/admin/seo/ctr-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: selectedSite,
          pageUrl: page.page,
          impressions: page.impressions,
          ctr: page.ctr,
          position: page.position,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setOptimizing((prev) => ({ ...prev, [key]: { loading: false, suggestions: null, error: data.error } }));
      } else {
        setOptimizing((prev) => ({ ...prev, [key]: { loading: false, suggestions: data.suggestions, error: null } }));
      }
    } catch {
      setOptimizing((prev) => ({ ...prev, [key]: { loading: false, suggestions: null, error: 'Verzoek mislukt' } }));
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleApply = async (pageUrl: string, suggestion: Suggestion, suggestionIndex: number) => {
    const key = `${pageUrl}-${suggestionIndex}`;
    setApplying((prev) => ({ ...prev, [key]: { loading: true, applied: false, error: null } }));
    try {
      const res = await fetch('/api/admin/seo/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl,
          seoTitle: suggestion.title,
          seoDescription: suggestion.description,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setApplying((prev) => ({ ...prev, [key]: { loading: false, applied: false, error: data.error } }));
      } else {
        setApplying((prev) => ({ ...prev, [key]: { loading: false, applied: true, error: null } }));
      }
    } catch {
      setApplying((prev) => ({ ...prev, [key]: { loading: false, applied: false, error: 'Verzoek mislukt' } }));
    }
  };

  const SortIcon = ({ col, current, dir }: { col: SortKey; current: SortKey; dir: SortDir }) =>
    col === current ? (
      dir === 'desc' ? <ChevronDown size={14} className="inline ml-1" /> : <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1 opacity-20" />
    );

  // Summary stats
  const totalImpressions = pageData.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = pageData.reduce((s, r) => s + r.clicks, 0);
  const overallCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = pageData.length > 0 ? pageData.reduce((s, r) => s + r.position, 0) / pageData.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO Intelligence</h1>
          <p className="text-slate-500 mt-1">Google Search Console data + AI-optimalisatie</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/seo/setup">
            <Button variant="outline" size="sm">
              <Settings size={14} className="mr-1.5" />
              Koppeling
            </Button>
          </Link>
          {cacheInfo && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Database size={12} />
              {cacheInfo.cached
                ? `Cache: ${cacheInfo.ageMinutes} min geleden`
                : 'Live data'}
            </span>
          )}
          {cacheInfo?.cached && (
            <Button
              onClick={() => fetchData(true)}
              variant="outline"
              size="sm"
              disabled={loadingPages}
              title="Cache omzeilen en verse data ophalen van Google"
            >
              <RefreshCw size={14} className={`mr-1.5 ${loadingPages ? 'animate-spin' : ''}`} />
              Vers ophalen
            </Button>
          )}
          <Button onClick={() => fetchData(false)} variant="outline" size="sm" disabled={loadingPages}>
            <RefreshCw size={16} className={`mr-2 ${loadingPages ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Site + Period selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        {sitesError ? (
          <div className="flex items-center justify-between gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{sitesError}</span>
            </div>
            <Link href="/admin/seo/setup">
              <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0">
                Koppel Google Account
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Globe size={18} className="text-slate-400 shrink-0" />
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecteer een website..." />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s.siteUrl} value={s.siteUrl}>
                    {s.siteUrl}
                    <span className="ml-2 text-xs text-slate-400">{s.permissionLevel}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      {!loadingPages && pageData.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Totaal impressies</p>
              <p className="text-2xl font-bold mt-1">{totalImpressions.toLocaleString('nl-NL')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Totaal clicks</p>
              <p className="text-2xl font-bold mt-1">{totalClicks.toLocaleString('nl-NL')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Gemiddelde CTR</p>
              <p className={`text-2xl font-bold mt-1 ${ctrColor(overallCtr)}`}>
                {(overallCtr * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Gem. positie</p>
              <p className={`text-2xl font-bold mt-1 ${posColor(avgPosition)}`}>
                {avgPosition.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {dataError && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle size={16} />
          <span>{dataError}</span>
        </div>
      )}

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={(v) => router.push(`/admin/seo?tab=${v}`)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">
            <TrendingUp size={16} className="mr-2" />
            Prestaties
            {pageData.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pageData.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ctr-booster">
            <Zap size={16} className="mr-2" />
            CTR Booster
            {lowCtrPages.length > 0 && (
              <Badge className="ml-2 bg-red-500">{lowCtrPages.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="keywords">
            <Search size={16} className="mr-2" />
            Keywords
            {quickWinQueries.length > 0 && (
              <Badge variant="secondary" className="ml-2">{quickWinQueries.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── PERFORMANCE TAB ── */}
        <TabsContent value="performance">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>Pagina prestaties</CardTitle>
                  <CardDescription>Alle pagina&apos;s gesorteerd op Google Search Console data</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    Alle
                  </Button>
                  <Button
                    variant={filter === 'low-ctr' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('low-ctr')}
                    className={filter === 'low-ctr' ? 'bg-red-500 hover:bg-red-600' : ''}
                  >
                    Lage CTR
                  </Button>
                  <Button
                    variant={filter === 'quick-wins' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('quick-wins')}
                    className={filter === 'quick-wins' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Quick wins
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-orange-500" />
                </div>
              ) : sortedPages.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  {selectedSite ? 'Geen data beschikbaar voor deze filters.' : 'Selecteer een website.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-slate-500 text-left">
                        <th className="pb-3 pr-4 font-medium">Pagina</th>
                        {(['impressions', 'clicks', 'ctr', 'position'] as SortKey[]).map((col) => (
                          <th
                            key={col}
                            className="pb-3 pr-4 font-medium text-right cursor-pointer hover:text-slate-800 select-none"
                            onClick={() => handleSort(col)}
                          >
                            {col === 'impressions' ? 'Impressies' : col === 'clicks' ? 'Clicks' : col === 'ctr' ? 'CTR' : 'Positie'}
                            <SortIcon col={col} current={sortKey} dir={sortDir} />
                          </th>
                        ))}
                        <th className="pb-3 font-medium text-right">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedPages.slice(0, 100).map((row) => (
                        <tr key={row.page} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 max-w-xs">
                            <span className="truncate block text-slate-700" title={row.page}>
                              {shortUrl(row.page)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">
                            {row.impressions.toLocaleString('nl-NL')}
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">
                            {row.clicks.toLocaleString('nl-NL')}
                          </td>
                          <td className={`py-3 pr-4 text-right ${ctrColor(row.ctr)}`}>
                            {(row.ctr * 100).toFixed(2)}%
                          </td>
                          <td className={`py-3 pr-4 text-right ${posColor(row.position)}`}>
                            {row.position.toFixed(1)}
                          </td>
                          <td className="py-3 text-right">
                            <a
                              href={row.page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sortedPages.length > 100 && (
                    <p className="text-center text-sm text-slate-400 mt-4">
                      Toont 100 van {sortedPages.length} pagina&apos;s
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CTR BOOSTER TAB ── */}
        <TabsContent value="ctr-booster">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={20} className="text-orange-500" />
                CTR Booster
              </CardTitle>
              <CardDescription>
                Pagina&apos;s met veel impressies maar lage CTR. Claude genereert betere titles + meta descriptions op basis van echte zoekdata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-orange-500" />
                </div>
              ) : lowCtrPages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  {pageData.length === 0
                    ? 'Selecteer een website om te beginnen.'
                    : 'Geen pagina\'s gevonden met lage CTR en voldoende impressies (min. 20).'}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    <TrendingDown size={16} className="text-red-500" />
                    <span>
                      {lowCtrPages.length} pagina{lowCtrPages.length !== 1 ? "'s" : ''} met ≥20 impressies en CTR onder het gemiddelde ({(Math.max(avgCtr, 0.02) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  {lowCtrPages
                    .sort((a, b) => b.impressions - a.impressions)
                    .map((page) => {
                      const state = optimizing[page.page];
                      return (
                        <div
                          key={page.page}
                          className="border border-slate-200 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={page.page}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-slate-800 hover:text-orange-600 flex items-center gap-1 break-all"
                                >
                                  {shortUrl(page.page)}
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                              <div className="flex gap-4 mt-1 text-sm">
                                <span className="text-slate-500">
                                  {page.impressions.toLocaleString('nl-NL')} impressies
                                </span>
                                <span className={ctrColor(page.ctr)}>
                                  {(page.ctr * 100).toFixed(2)}% CTR
                                </span>
                                <span className={posColor(page.position)}>
                                  positie {page.position.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleOptimize(page)}
                              disabled={state?.loading}
                              className="shrink-0 bg-orange-500 hover:bg-orange-600"
                            >
                              {state?.loading ? (
                                <><Loader2 size={14} className="animate-spin mr-1" />Bezig...</>
                              ) : (
                                <><Zap size={14} className="mr-1" />Optimaliseer</>
                              )}
                            </Button>
                          </div>

                          {state?.error && (
                            <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
                              {state.error}
                            </div>
                          )}

                          {state?.suggestions && (
                            <div className="space-y-3">
                              {state.suggestions.map((s, i) => {
                                const applyKey = `${page.page}-${i}`;
                                const applyState = applying[applyKey];
                                // Only show Apply if this is a kennisbank or blog URL on this site
                                const isOwnPage = page.page.includes('/kennisbank/') || page.page.includes('/blog/');
                                return (
                                  <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="text-xs">Optie {i + 1}</Badge>
                                          <span className="text-xs text-slate-400">{s.rationale}</span>
                                        </div>
                                        <p className="font-semibold text-slate-800 mt-1 text-sm">{s.title}</p>
                                        <p className="text-slate-600 text-sm mt-1">{s.description}</p>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyText(`Title: ${s.title}\n\nMeta: ${s.description}`, applyKey)}
                                          title="Kopieer naar klembord"
                                        >
                                          {copied === applyKey ? (
                                            <Check size={14} className="text-green-600" />
                                          ) : (
                                            <Copy size={14} />
                                          )}
                                        </Button>
                                        {isOwnPage && (
                                          <Button
                                            size="sm"
                                            variant={applyState?.applied ? 'outline' : 'default'}
                                            className={applyState?.applied ? 'border-green-500 text-green-600' : 'bg-green-600 hover:bg-green-700'}
                                            onClick={() => !applyState?.applied && handleApply(page.page, s, i)}
                                            disabled={applyState?.loading || applyState?.applied}
                                            title="Pas toe in database"
                                          >
                                            {applyState?.loading ? (
                                              <Loader2 size={13} className="animate-spin" />
                                            ) : applyState?.applied ? (
                                              <><CheckCircle2 size={13} className="mr-1" />Toegepast</>
                                            ) : (
                                              'Toepassen'
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    {applyState?.error && (
                                      <p className="text-xs text-red-500">{applyState.error}</p>
                                    )}
                                    <div className="flex gap-2 text-xs text-slate-400">
                                      <span className={s.title.length > 60 ? 'text-red-500' : 'text-green-600'}>
                                        Title: {s.title.length}/60 tekens
                                      </span>
                                      <span className={s.description.length > 155 ? 'text-red-500' : 'text-green-600'}>
                                        Meta: {s.description.length}/155 tekens
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── KEYWORDS TAB ── */}
        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={20} className="text-blue-500" />
                Keyword Opportunities
              </CardTitle>
              <CardDescription>
                Zoekwoorden op positie 5–20 met minimaal 10 impressies — laaghangend fruit dat direct op te pakken is.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQueries ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                </div>
              ) : sortedQueries.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  {selectedSite ? 'Geen keyword opportunities gevonden.' : 'Selecteer een website.'}
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                    <TrendingUp size={16} className="text-blue-500" />
                    <span>
                      {sortedQueries.length} keyword{sortedQueries.length !== 1 ? 's' : ''} op positie 5–20 met ≥10 impressies
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-slate-500 text-left">
                          <th className="pb-3 pr-4 font-medium">Zoekwoord</th>
                          <th className="pb-3 pr-4 font-medium">Pagina</th>
                          {(['impressions', 'clicks', 'position'] as SortKey[]).map((col) => (
                            <th
                              key={col}
                              className="pb-3 pr-4 font-medium text-right cursor-pointer hover:text-slate-800 select-none"
                              onClick={() => handleQuerySort(col)}
                            >
                              {col === 'impressions' ? 'Impressies' : col === 'clicks' ? 'Clicks' : 'Positie'}
                              <SortIcon col={col} current={querySortKey} dir={querySortDir} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedQueries.slice(0, 150).map((row, i) => (
                          <tr key={`${row.query}-${i}`} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 pr-4 font-medium text-slate-800 max-w-[200px]">
                              <span className="truncate block" title={row.query}>{row.query}</span>
                            </td>
                            <td className="py-3 pr-4 text-slate-500 max-w-[180px]">
                              <a
                                href={row.page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-orange-600 truncate block"
                                title={row.page}
                              >
                                {shortUrl(row.page)}
                              </a>
                            </td>
                            <td className="py-3 pr-4 text-right text-slate-600">
                              {row.impressions.toLocaleString('nl-NL')}
                            </td>
                            <td className="py-3 pr-4 text-right text-slate-600">
                              {row.clicks.toLocaleString('nl-NL')}
                            </td>
                            <td className={`py-3 pr-4 text-right ${posColor(row.position)}`}>
                              {row.position.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sortedQueries.length > 150 && (
                      <p className="text-center text-sm text-slate-400 mt-4">
                        Toont 150 van {sortedQueries.length} keywords
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SeoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    }>
      <SeoPageInner />
    </Suspense>
  );
}
