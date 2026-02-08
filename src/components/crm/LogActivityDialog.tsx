'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, X, Phone, Mail, Calendar, FileText } from 'lucide-react';
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
import { Activity, ActivityInput, ActivityType } from '@/lib/crm/types';
import { activityTypeLabels } from '@/lib/crm/labels';

const activityTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
};

interface LogActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (activity: Activity) => void;
  companyId?: string;
  contactId?: string;
  dealId?: string;
}

export function LogActivityDialog({
  open,
  onOpenChange,
  onCreated,
  companyId,
  contactId,
  dealId,
}: LogActivityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityInput>({
    companyId: companyId || '',
    contactId: contactId || '',
    dealId: dealId || '',
    type: 'note',
    subject: '',
    description: '',
    outcome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      setError('Onderwerp is verplicht');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          companyId: companyId || form.companyId,
          contactId: contactId || form.contactId,
          dealId: dealId || form.dealId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kon activiteit niet loggen');
      }

      const data = await res.json();
      onCreated(data.activity);
      onOpenChange(false);
      setForm({
        companyId: companyId || '',
        contactId: contactId || '',
        dealId: dealId || '',
        type: 'note',
        subject: '',
        description: '',
        outcome: '',
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
            <MessageSquare size={20} className="text-blue-600" />
            Activiteit Loggen
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

          {/* Activity Type Selector */}
          <div>
            <Label>Type activiteit</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(Object.keys(activityTypeLabels) as ActivityType[]).map((type) => {
                const Icon = activityTypeIcons[type];
                const isSelected = form.type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{activityTypeLabels[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Onderwerp *</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder={
                form.type === 'call'
                  ? 'Belnotitie: besproken voorstel'
                  : form.type === 'email'
                  ? 'Email: offerte verstuurd'
                  : form.type === 'meeting'
                  ? 'Afspraak: kennismaking'
                  : 'Notitie: belangrijke info'
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Wat is er besproken of gedaan?"
              rows={4}
            />
          </div>

          {(form.type === 'call' || form.type === 'meeting') && (
            <div>
              <Label htmlFor="outcome">Resultaat</Label>
              <Input
                id="outcome"
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                placeholder="Bijv: Vervolgafspraak gepland, Voorstel gevraagd, etc."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Opslaan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
