'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Plus,
  Loader2,
  RefreshCw,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealCard, CreateDealDialog } from '@/components/crm';
import { formatCurrency, dealStageLabels, dealStageColors } from '@/lib/crm/labels';
import type { Deal, DealStage } from '@/lib/crm/types';

const STAGES: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation'];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [draggingDeal, setDraggingDeal] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/crm/deals?limit=200');
      if (!res.ok) throw new Error('Kon deals niet laden');
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter((d) => d.stage === stage);
  };

  const getStageValue = (stage: DealStage) => {
    return deals
      .filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + (d.value || 0), 0);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingDeal(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = async (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggingDeal) return;

    const deal = deals.find((d) => d.id === draggingDeal);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === draggingDeal ? { ...d, stage: newStage } : d))
    );

    try {
      const res = await fetch(`/api/admin/crm/deals/${draggingDeal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        // Revert on error
        setDeals((prev) =>
          prev.map((d) => (d.id === draggingDeal ? { ...d, stage: deal.stage } : d))
        );
      }
    } catch {
      // Revert on error
      setDeals((prev) =>
        prev.map((d) => (d.id === draggingDeal ? { ...d, stage: deal.stage } : d))
      );
    }
  };

  const handleMarkWon = async (dealId: string) => {
    try {
      await fetch(`/api/admin/crm/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'won' }),
      });
      fetchDeals();
    } catch (err) {
      console.error('Failed to mark deal as won:', err);
    }
  };

  const handleMarkLost = async (dealId: string) => {
    try {
      await fetch(`/api/admin/crm/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'lost' }),
      });
      fetchDeals();
    } catch (err) {
      console.error('Failed to mark deal as lost:', err);
    }
  };

  if (loading && deals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-slate-500">Pipeline laden...</p>
        </div>
      </div>
    );
  }

  const totalValue = deals
    .filter((d) => !['won', 'lost'].includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 mt-1">
            Totale pipeline waarde: <span className="font-semibold text-orange-600">{formatCurrency(totalValue)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeals} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Vernieuwen
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} className="mr-2" />
            Nieuwe Deal
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button onClick={fetchDeals} variant="link" className="ml-2 text-red-700">
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = getDealsByStage(stage);
          const stageValue = getStageValue(stage);
          const isDropTarget = dragOverStage === stage;

          return (
            <div
              key={stage}
              className={`rounded-lg border-2 transition-colors ${
                isDropTarget
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="p-3 border-b bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <Badge className={dealStageColors[stage]}>
                    {dealStageLabels[stage]}
                  </Badge>
                  <span className="text-sm text-slate-500">{stageDeals.length}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {formatCurrency(stageValue)}
                </p>
              </div>

              {/* Deals */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-grab active:cursor-grabbing ${
                      draggingDeal === deal.id ? 'opacity-50' : ''
                    }`}
                  >
                    <DealCard
                      deal={deal}
                      isDragging={draggingDeal === deal.id}
                    />
                    {/* Quick actions for negotiation stage */}
                    {stage === 'negotiation' && (
                      <div className="flex gap-1 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7 text-green-600 hover:bg-green-50"
                          onClick={() => handleMarkWon(deal.id)}
                        >
                          Gewonnen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7 text-red-600 hover:bg-red-50"
                          onClick={() => handleMarkLost(deal.id)}
                        >
                          Verloren
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <GripVertical size={24} className="mx-auto mb-2 opacity-50" />
                    Sleep deals hierheen
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Won/Lost Deals Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Gewonnen</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deals.filter((d) => d.stage === 'won').length > 0 ? (
              <div className="space-y-2">
                {deals
                  .filter((d) => d.stage === 'won')
                  .slice(0, 3)
                  .map((deal) => (
                    <div key={deal.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">{deal.title}</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nog geen gewonnen deals</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <Badge className="bg-red-100 text-red-700">Verloren</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deals.filter((d) => d.stage === 'lost').length > 0 ? (
              <div className="space-y-2">
                {deals
                  .filter((d) => d.stage === 'lost')
                  .slice(0, 3)
                  .map((deal) => (
                    <div key={deal.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">{deal.title}</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Geen verloren deals</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* No Deals State */}
      {deals.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-slate-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nog geen deals in je pipeline</p>
              <p className="text-sm mt-1">Maak je eerste deal aan om te beginnen</p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus size={16} className="mr-2" />
                Eerste Deal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <CreateDealDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(deal) => {
          setDeals((prev) => [...prev, deal]);
        }}
      />
    </div>
  );
}
