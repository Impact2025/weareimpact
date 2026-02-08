'use client';

import { useState, useEffect } from 'react';
import { User, Loader2, X } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Contact, ContactInput, Company } from '@/lib/crm/types';
import { sourceLabels } from '@/lib/crm/labels';

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (contact: Contact) => void;
  preselectedCompanyId?: string;
}

export function CreateContactDialog({
  open,
  onOpenChange,
  onCreated,
  preselectedCompanyId
}: CreateContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [form, setForm] = useState<ContactInput>({
    companyId: preselectedCompanyId || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    isPrimary: false,
    notes: '',
    source: '',
  });

  useEffect(() => {
    if (open && !preselectedCompanyId) {
      setLoadingCompanies(true);
      fetch('/api/admin/crm/companies?limit=100')
        .then((res) => res.json())
        .then((data) => setCompanies(data.companies || []))
        .catch(console.error)
        .finally(() => setLoadingCompanies(false));
    }
  }, [open, preselectedCompanyId]);

  useEffect(() => {
    if (preselectedCompanyId) {
      setForm((f) => ({ ...f, companyId: preselectedCompanyId }));
    }
  }, [preselectedCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      setError('Voornaam is verplicht');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kon contact niet aanmaken');
      }

      const data = await res.json();
      onCreated(data.contact);
      onOpenChange(false);
      setForm({
        companyId: preselectedCompanyId || '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        isPrimary: false,
        notes: '',
        source: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Nieuw Contact
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
            <div>
              <Label htmlFor="firstName">Voornaam *</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Jan"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Achternaam</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Jansen"
              />
            </div>

            {!preselectedCompanyId && (
              <div className="col-span-2">
                <Label htmlFor="company">Bedrijf</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(value) => setForm({ ...form, companyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCompanies ? 'Laden...' : 'Selecteer bedrijf'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Geen bedrijf</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jan@acme.nl"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="06-12345678"
              />
            </div>

            <div>
              <Label htmlFor="jobTitle">Functie</Label>
              <Input
                id="jobTitle"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="Directeur"
              />
            </div>

            <div>
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

            <div className="col-span-2 flex items-center gap-3">
              <Switch
                id="isPrimary"
                checked={form.isPrimary}
                onCheckedChange={(checked: boolean) =>
                  setForm({ ...form, isPrimary: checked })
                }
              />
              <Label htmlFor="isPrimary" className="font-normal cursor-pointer">
                Primair contact voor dit bedrijf
              </Label>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notities</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Interne notities over dit contact..."
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
              Contact Aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
