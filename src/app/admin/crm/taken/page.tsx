'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckSquare,
  Plus,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TaskItem, CreateTaskDialog } from '@/components/crm';
import type { CrmTask } from '@/lib/crm/types';

interface TaskCounts {
  today: number;
  week: number;
  overdue: number;
  pending: number;
}

function TasksPageContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'today';

  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [counts, setCounts] = useState<TaskCounts>({ today: 0, week: 0, overdue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchTasks = useCallback(async (filter: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crm/tasks?filter=${filter}`);
      if (!res.ok) throw new Error('Kon taken niet laden');
      const data = await res.json();
      setTasks(data.tasks || []);
      setCounts(data.counts || { today: 0, week: 0, overdue: 0, pending: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab, fetchTasks]);

  const handleComplete = async (taskId: string) => {
    try {
      await fetch(`/api/admin/crm/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      // Refresh the current tab
      fetchTasks(activeTab);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleUncomplete = async (taskId: string) => {
    try {
      await fetch(`/api/admin/crm/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      fetchTasks(activeTab);
    } catch (err) {
      console.error('Failed to uncomplete task:', err);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'today':
        return <Calendar size={14} />;
      case 'week':
        return <Calendar size={14} />;
      case 'overdue':
        return <AlertTriangle size={14} />;
      case 'completed':
        return <Check size={14} />;
      default:
        return <CheckSquare size={14} />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'today':
        return 'Vandaag';
      case 'week':
        return 'Deze week';
      case 'overdue':
        return 'Achterstallig';
      case 'completed':
        return 'Afgerond';
      default:
        return tab;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'today':
        return counts.today;
      case 'week':
        return counts.week;
      case 'overdue':
        return counts.overdue;
      default:
        return null;
    }
  };

  if (loading && tasks.length === 0 && activeTab !== 'completed') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Taken laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Taken</h1>
          <p className="text-slate-500 mt-1">
            {counts.pending} open taken
            {counts.overdue > 0 && (
              <span className="text-red-600 ml-2">
                ({counts.overdue} achterstallig)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTasks(activeTab)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Vernieuwen
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} className="mr-2" />
            Nieuwe Taak
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button
            onClick={() => fetchTasks(activeTab)}
            variant="link"
            className="ml-2 text-red-700"
          >
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {['today', 'week', 'overdue', 'completed'].map((tab) => {
            const count = getTabCount(tab);
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`flex items-center gap-1 ${
                  tab === 'overdue' && counts.overdue > 0 ? 'text-red-600' : ''
                }`}
              >
                {getTabIcon(tab)}
                <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                {count !== null && count > 0 && (
                  <Badge
                    variant={tab === 'overdue' ? 'destructive' : 'secondary'}
                    className="ml-1 h-5 px-1.5"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        {['today', 'week', 'overdue', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-orange-600" />
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onUncomplete={tab === 'completed' ? handleUncomplete : undefined}
                    showEntity
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-slate-500">
                    <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      {tab === 'today' && 'Geen taken voor vandaag'}
                      {tab === 'week' && 'Geen taken deze week'}
                      {tab === 'overdue' && 'Geen achterstallige taken'}
                      {tab === 'completed' && 'Nog geen afgeronde taken'}
                    </p>
                    {tab !== 'completed' && tab !== 'overdue' && (
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus size={16} className="mr-2" />
                        Taak toevoegen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={() => fetchTasks(activeTab)}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
            <p className="text-slate-500">Taken laden...</p>
          </div>
        </div>
      }
    >
      <TasksPageContent />
    </Suspense>
  );
}
