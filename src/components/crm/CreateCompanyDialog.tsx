'use client';

import { useState } from 'react';
import { Building2, Loader2, X } from 'lucide-react';
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
import { Company, CompanyInput } from '@/lib/crm/types';
import { industryLabels, companySizeLabels } from '@/lib/crm/labels';

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (company: Company) => void;
}

export function CreateCompanyDialog({ open, onOpenChange, onCreated }: CreateCompanyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyInput>({
    name: '',
    website: '',
    industry: '',
    size: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Bedrijfsnaam is verplicht');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/crm/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kon bedrijf niet aanmaken');
      }

      const data = await res.json();
      onCreated(data.company);
      onOpenChange(false);
      setForm({
        name: '',
        website: '',
        industry: '',
        size: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        notes: '',
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
            <Building2 size={20} className="text-orange-600" />
            Nieuw Bedrijf
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
              <Label htmlFor="name">Bedrijfsnaam *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme B.V."
                required
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="www.acme.nl"
              />
            </div>

            <div>
              <Label htmlFor="industry">Sector</Label>
              <Select
                value={form.industry}
                onValueChange={(value) => setForm({ ...form, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer sector" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(industryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="size">Grootte</Label>
              <Select
                value={form.size}
                onValueChange={(value) => setForm({ ...form, size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer grootte" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(companySizeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">Plaats</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Amsterdam"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Keizersgracht 123"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@acme.nl"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="020-1234567"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notities</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Interne notities over dit bedrijf..."
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
              Bedrijf Aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
