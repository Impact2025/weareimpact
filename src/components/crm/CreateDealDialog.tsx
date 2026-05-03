'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Loader2, X } from 'lucide-react';
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
import { Deal, DealInput, Company, Contact, DealStage } from '@/lib/crm/types';
import { dealStageLabels, sourceLabels, dealStageProbabilities } from '@/lib/crm/labels';

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (deal: Deal) => void;
  preselectedCompanyId?: string;
  preselectedContactId?: string;
}

export function CreateDealDialog({
  open,
  onOpenChange,
  onCreated,
  preselectedCompanyId,
  preselectedContactId,
}: CreateDealDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [form, setForm] = useState<DealInput>({
    companyId: preselectedCompanyId || '',
    contactId: preselectedContactId || '',
    title: '',
    value: undefined,
    stage: 'lead',
    probability: 10,
    expectedCloseDate: '',
    description: '',
    source: '',
  });

  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.all([
        fetch('/api/admin/crm/companies?limit=100').then((r) => r.json()),
        fetch('/api/admin/crm/contacts?limit=100').then((r) => r.json()),
      ])
        .then(([companiesData, contactsData]) => {
          setCompanies(companiesData.companies || []);
          setContacts(contactsData.contacts || []);
        })
        .catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [open]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      companyId: preselectedCompanyId || f.companyId,
      contactId: preselectedContactId || f.contactId,
    }));
  }, [preselectedCompanyId, preselectedContactId]);

  const handleStageChange = (stage: DealStage) => {
    setForm({
      ...form,
      stage,
      probability: dealStageProbabilities[stage],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Titel is verplicht');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: form.value ? Number(form.value) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kon deal niet aanmaken');
      }

      const data = await res.json();
      onCreated(data.deal);
      onOpenChange(false);
      setForm({
        companyId: preselectedCompanyId || '',
        contactId: preselectedContactId || '',
        title: '',
        value: undefined,
        stage: 'lead',
        probability: 10,
        expectedCloseDate: '',
        description: '',
        source: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = form.companyId
    ? contacts.filter((c) => c.companyId === form.companyId)
    : contacts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase size={20} className="text-purple-600" />
            Nieuwe Deal
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

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="AI Workshop bij Acme"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Bedrijf</Label>
              <Select
                value={form.companyId || '__none__'}
                onValueChange={(value) => setForm({ ...form, companyId: value === '__none__' ? '' : value, contactId: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? 'Laden...' : 'Selecteer bedrijf'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Geen bedrijf</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Select
                value={form.contactId || '__none__'}
                onValueChange={(value) => setForm({ ...form, contactId: value === '__none__' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Geen contact</SelectItem>
                  {filteredContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                      {contact.companyName && !form.companyId && ` (${contact.companyName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Waarde (&euro;)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="100"
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="5000"
              />
            </div>

            <div>
              <Label htmlFor="stage">Fase</Label>
              <Select
                value={form.stage}
                onValueChange={(value) => handleStageChange(value as DealStage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dealStageLabels)
                    .filter(([key]) => key !== 'won' && key !== 'lost')
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="probability">Kans (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={form.probability}
                onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="expectedCloseDate">Verwachte sluiting</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={form.expectedCloseDate}
                onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="source">Bron</Label>
              <Select
                value={form.source}
                onValueChange={(value) => setForm({ ...form, source: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer bron" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Details over deze deal..."
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
              Deal Aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
