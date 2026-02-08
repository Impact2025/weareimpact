'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  CheckSquare,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreateCompanyDialog,
  CreateContactDialog,
  CreateDealDialog,
  CreateTaskDialog,
  ActivityTimeline,
  TaskItem,
} from '@/components/crm';
import { formatCurrency, dealStageLabels, dealStageColors } from '@/lib/crm/labels';
import type { Activity, CrmTask } from '@/lib/crm/types';

interface DashboardData {
  pipeline: {
    totalValue: number;
    weightedValue: number;
    dealCount: number;
    byStage: {
      stage: string;
      count: number;
      value: number;
    }[];
  };
  tasks: {
    today: number;
    pending: number;
    overdue: number;
  };
  recentWins: {
    title: string;
    value: number;
    companyName: string;
    closedAt: string;
  }[];
  recentActivities: Activity[];
  upcomingTasks: CrmTask[];
  counts: {
    companies: number;
    contacts: number;
    activeDeals: number;
  };
  wonThisWeek: {
    count: number;
    value: number;
  };
}

export default function CrmDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/crm/dashboard');
      if (!res.ok) throw new Error('Kon dashboard niet laden');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    await fetch(`/api/admin/crm/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    fetchData();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Opnieuw proberen</Button>
        </div>
      </div>
    );
  }

  const totalPipelineWidth = data?.pipeline.totalValue || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CRM Dashboard</h1>
          <p className="text-slate-500 mt-1">Overzicht van je sales pipeline en activiteiten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Vernieuwen
          </Button>
          <Button onClick={() => setShowDealDialog(true)}>
            <Plus size={16} className="mr-2" />
            Nieuwe Deal
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp size={16} />
              Pipeline Waarde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(data?.pipeline.totalValue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gewogen: {formatCurrency(data?.pipeline.weightedValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Briefcase size={16} />
              Actieve Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pipeline.dealCount || 0}</div>
            <Link href="/admin/crm/deals" className="text-xs text-orange-600 hover:underline">
              Bekijk pipeline &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckSquare size={16} />
              Taken Vandaag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.tasks.today || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data?.tasks.pending || 0} totaal open
            </p>
          </CardContent>
        </Card>

        <Card className={data?.tasks.overdue ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <AlertTriangle size={16} className={data?.tasks.overdue ? 'text-red-600' : ''} />
              Achterstallig
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data?.tasks.overdue ? 'text-red-600' : ''}`}>
              {data?.tasks.overdue || 0}
            </div>
            {(data?.tasks.overdue ?? 0) > 0 && (
              <Link href="/admin/crm/taken?filter=overdue" className="text-xs text-red-600 hover:underline">
                Bekijk achterstallige &rarr;
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pipeline per Fase</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.pipeline.byStage && data.pipeline.byStage.length > 0 ? (
            <div className="space-y-3">
              {data.pipeline.byStage.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <Badge className={dealStageColors[stage.stage as keyof typeof dealStageColors]}>
                      {dealStageLabels[stage.stage as keyof typeof dealStageLabels]}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(stage.value / totalPipelineWidth) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right flex-shrink-0">
                    <span className="font-medium">{formatCurrency(stage.value)}</span>
                    <span className="text-sm text-slate-500 ml-2">({stage.count})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
              <p>Nog geen deals in de pipeline</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowDealDialog(true)}
              >
                <Plus size={14} className="mr-2" />
                Eerste deal aanmaken
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Wins */}
      {data?.wonThisWeek && data.wonThisWeek.count > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Trophy size={20} />
              Gewonnen deze week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {data.wonThisWeek.count} deal{data.wonThisWeek.count !== 1 && 's'} - {formatCurrency(data.wonThisWeek.value)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setShowCompanyDialog(true)}
        >
          <Building2 size={24} className="text-orange-600" />
          <span>Nieuw Bedrijf</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setShowContactDialog(true)}
        >
          <Users size={24} className="text-blue-600" />
          <span>Nieuw Contact</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setShowDealDialog(true)}
        >
          <Briefcase size={24} className="text-purple-600" />
          <span>Nieuwe Deal</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setShowTaskDialog(true)}
        >
          <CheckSquare size={24} className="text-green-600" />
          <span>Nieuwe Taak</span>
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Komende Taken</CardTitle>
            <Link href="/admin/crm/taken">
              <Button variant="ghost" size="sm">
                Alle taken <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.upcomingTasks && data.upcomingTasks.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingTasks.slice(0, 5).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    showEntity={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p>Geen open taken</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recente Activiteit</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              <ActivityTimeline activities={data.recentActivities.slice(0, 5)} showEntity={true} />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nog geen activiteiten</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entity Counts Footer */}
      <div className="flex justify-center gap-8 text-sm text-slate-500 border-t pt-6">
        <Link href="/admin/crm/bedrijven" className="hover:text-orange-600">
          <span className="font-medium text-slate-900">{data?.counts.companies || 0}</span> bedrijven
        </Link>
        <Link href="/admin/crm/contacten" className="hover:text-orange-600">
          <span className="font-medium text-slate-900">{data?.counts.contacts || 0}</span> contacten
        </Link>
        <Link href="/admin/crm/deals" className="hover:text-orange-600">
          <span className="font-medium text-slate-900">{data?.counts.activeDeals || 0}</span> actieve deals
        </Link>
      </div>

      {/* Dialogs */}
      <CreateCompanyDialog
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onCreated={() => fetchData()}
      />
      <CreateContactDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        onCreated={() => fetchData()}
      />
      <CreateDealDialog
        open={showDealDialog}
        onOpenChange={setShowDealDialog}
        onCreated={() => fetchData()}
      />
      <CreateTaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onCreated={() => fetchData()}
      />
    </div>
  );
}
