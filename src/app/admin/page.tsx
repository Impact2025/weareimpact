'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, Brain, MessageSquare, TrendingUp, TrendingDown, Loader2, RefreshCw, BarChart3, Target, Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  visitors: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  scans: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  chats: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  posts: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changeCount: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'scan' | 'chat' | 'blog' | 'lead';
    title: string;
    description?: string;
    createdAt: string;
  }>;
  leadsOverview: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
  };
  topPages: Array<{
    path: string;
    views: number;
  }>;
  chatsBySource: {
    widget: number;
    booking: number;
    scan: number;
    kennisbank: number;
  };
  newsletterStats: {
    total_subscribers: number;
    active_campaigns: number;
    total_sent: number;
    total_opens: number;
    avg_open_rate: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('Kon dashboard data niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Zojuist';
    if (diffMins < 60) return `${diffMins} min geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    return `${diffDays} dagen geleden`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return <Brain size={18} />;
      case 'chat':
        return <MessageSquare size={18} />;
      case 'lead':
        return <Target size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'scan':
        return 'bg-orange-100 text-orange-600';
      case 'chat':
        return 'bg-green-100 text-green-600';
      case 'lead':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-purple-100 text-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Onbekende fout'}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Bezoekers',
      value: stats.visitors.total.toLocaleString('nl-NL'),
      change: stats.visitors.changePercent,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'AI Scans',
      value: stats.scans.total.toLocaleString('nl-NL'),
      change: stats.scans.changePercent,
      icon: Brain,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Chat Gesprekken',
      value: stats.chats.total.toLocaleString('nl-NL'),
      change: stats.chats.changePercent,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Blog Posts',
      value: stats.posts.total.toLocaleString('nl-NL'),
      change: stats.posts.changeCount,
      isCount: true,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welkom terug! Hier is een overzicht van je website.
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw size={16} className="mr-2" />
          Vernieuwen
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>
                  {stat.change >= 0 ? '+' : ''}{stat.change}{'isCount' in stat ? '' : '%'} deze maand
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads Overview */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Nieuwe Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.leadsOverview.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Gecontacteerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.leadsOverview.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Gekwalificeerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.leadsOverview.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Conversies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.leadsOverview.converted}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recente Activiteit</CardTitle>
            <CardDescription>Laatste acties op de website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nog geen activiteit</p>
              ) : (
                stats.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-slate-500 truncate">{activity.description}</p>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Snelle Acties</CardTitle>
            <CardDescription>Veelgebruikte taken</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Nieuwe Blog Post</p>
                <p className="text-sm text-slate-500">
                  Schrijf en publiceer een artikel
                </p>
              </div>
            </Link>
            <Link
              href="/admin/leads"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Brain size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Bekijk AI Leads</p>
                <p className="text-sm text-slate-500">
                  {stats.leadsOverview.new > 0
                    ? `${stats.leadsOverview.new} nieuwe leads wachten`
                    : 'Scan resultaten en contactgegevens'}
                </p>
              </div>
            </Link>
            <Link
              href="/admin/chats"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Chat Transcripts</p>
                <p className="text-sm text-slate-500">
                  {stats.chatsBySource.widget + stats.chatsBySource.booking + stats.chatsBySource.scan > 0
                    ? `${stats.chats.total} gesprekken totaal`
                    : 'Bekijk gesprekken met de chatbot'}
                </p>
              </div>
            </Link>
            <Link
              href="/admin/kennisbank/new"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Kennisbank Artikel</p>
                <p className="text-sm text-slate-500">
                  Maak een nieuwe gids of stappenplan
                </p>
              </div>
            </Link>
            <Link
              href="/admin/newsletter/new"
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Send size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Nieuwsbrief Campagne</p>
                <p className="text-sm text-slate-500">
                  {stats.newsletterStats.active_campaigns > 0
                    ? `${stats.newsletterStats.active_campaigns} concepten wachten`
                    : 'Nieuwe nieuwsbrief voor abonnees'}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages & Chat Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        {stats.topPages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Populaire Pagina's</CardTitle>
              <CardDescription>Meest bezochte pagina's (30 dagen)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topPages.map((page, idx) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-400 w-6">{idx + 1}.</span>
                      <span className="text-slate-900">{page.path}</span>
                    </div>
                    <span className="text-slate-500">{page.views.toLocaleString('nl-NL')} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Chats per Bron</CardTitle>
            <CardDescription>Verdeling van gesprekken</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Chat Widget</span>
                <span className="font-medium">{stats.chatsBySource.widget}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Boekingschat</span>
                <span className="font-medium">{stats.chatsBySource.booking}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">AI Scanner</span>
                <span className="font-medium">{stats.chatsBySource.scan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kennisbank</span>
                <span className="font-medium">{stats.chatsBySource.kennisbank}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
