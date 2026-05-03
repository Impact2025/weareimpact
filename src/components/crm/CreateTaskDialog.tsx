'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CrmTask, TaskInput, Company, Deal, TaskPriority } from '@/lib/crm/types';
import { taskPriorityLabels } from '@/lib/crm/labels';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (task: CrmTask) => void;
  preselectedCompanyId?: string;
  preselectedDealId?: string;
  preselectedContactId?: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onCreated,
  preselectedCompanyId,
  preselectedDealId,
  preselectedContactId,
}: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [form, setForm] = useState<TaskInput>({
    companyId: preselectedCompanyId || '',
    contactId: preselectedContactId || '',
    dealId: preselectedDealId || '',
    title: '',
    description: '',
    priority: 'normal',
    dueDate: '',
  });

  useEffect(() => {
    if (open && !preselectedCompanyId) {
      setLoadingData(true);
      Promise.all([
        fetch('/api/admin/crm/companies?limit=100').then((r) => r.json()),
        fetch('/api/admin/crm/deals?limit=100').then((r) => r.json()),
      ])
        .then(([companiesData, dealsData]) => {
          setCompanies(companiesData.companies || []);
          setDeals(dealsData.deals || []);
        })
        .catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [open, preselectedCompanyId]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      companyId: preselectedCompanyId || f.companyId,
      dealId: preselectedDealId || f.dealId,
      contactId: preselectedContactId || f.contactId,
    }));
  }, [preselectedCompanyId, preselectedDealId, preselectedContactId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Titel is verplicht');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kon taak niet aanmaken');
      }

      const data = await res.json();
      onCreated(data.task);
      onOpenChange(false);
      setForm({
        companyId: preselectedCompanyId || '',
        contactId: preselectedContactId || '',
        dealId: preselectedDealId || '',
        title: '',
        description: '',
        priority: 'normal',
        dueDate: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick date buttons
  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setForm({ ...form, dueDate: date.toISOString().split('T')[0] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" />
            Nieuwe Taak
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
              {error}
              <button type="button" onClick={() => setError(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Follow-up bellen"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!preselectedCompanyId && (
                <div>
                  <Label htmlFor="company">Bedrijf</Label>
                  <Select
                    value={form.companyId || '__none__'}
                    onValueChange={(value) => setForm({ ...form, companyId: value === '__none__' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? 'Laden...' : 'Selecteer'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Geen</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!preselectedDealId && (
                <div>
                  <Label htmlFor="deal">Deal</Label>
                  <Select
                    value={form.dealId || '__none__'}
                    onValueChange={(value) => setForm({ ...form, dealId: value === '__none__' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Geen</SelectItem>
                      {deals
                        .filter((d) => !form.companyId || d.companyId === form.companyId)
                        .map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Prioriteit</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setForm({ ...form, priority: value as TaskPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskPriorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Deadline</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(0)}
              >
                Vandaag
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(1)}
              >
                Morgen
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(7)}
              >
                Volgende week
              </Button>
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Details over deze taak..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Taak Aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
