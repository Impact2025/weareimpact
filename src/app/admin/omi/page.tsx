'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, Loader2, RefreshCw, Check, X, Link2, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OmiActionItem {
  description?: string;
  completed?: boolean;
}

interface OmiMemory {
  id: string;
  title: string;
  overview: string;
  category: string | null;
  transcript: string;
  action_items: OmiActionItem[];
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  status: 'new' | 'linked' | 'ignored';
  linked_type: string | null;
  linked_label: string | null;
  suggested_type: 'company' | 'contact' | 'deal' | 'project' | null;
  suggested_id: string | null;
  suggested_label: string | null;
}

type LinkType = 'company' | 'contact' | 'deal' | 'project';

interface Option {
  id: string;
  label: string;
}

const TYPE_LABELS: Record<LinkType, string> = {
  company: 'Bedrijf',
  contact: 'Contact',
  deal: 'Deal',
  project: 'Klantdossier',
};

export default function OmiInboxPage() {
  const [memories, setMemories] = useState<OmiMemory[]>([]);
  const [status, setStatus] = useState<'new' | 'linked' | 'ignored'>('new');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [linkDialogFor, setLinkDialogFor] = useState<OmiMemory | null>(null);
  const [linkType, setLinkType] = useState<LinkType>('company');
  const [options, setOptions] = useState<Option[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchMemories = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/omi?status=${s}`);
      const data = await res.json();
      setMemories(data.memories || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories(status);
  }, [status, fetchMemories]);

  const loadOptions = useCallback(async (type: LinkType) => {
    setOptionsLoading(true);
    setOptions([]);
    setSelectedTargetId('');
    try {
      if (type === 'company') {
        const res = await fetch('/api/admin/crm/companies');
        const data = await res.json();
        setOptions((data.companies || []).map((c: { id: string; name: string }) => ({ id: c.id, label: c.name })));
      } else if (type === 'contact') {
        const res = await fetch('/api/admin/crm/contacts');
        const data = await res.json();
        setOptions(
          (data.contacts || []).map((c: { id: string; firstName: string; lastName?: string }) => ({
            id: c.id,
            label: `${c.firstName} ${c.lastName || ''}`.trim(),
          })),
        );
      } else if (type === 'deal') {
        const res = await fetch('/api/admin/crm/deals');
        const data = await res.json();
        setOptions((data.deals || []).map((d: { id: string; title: string }) => ({ id: d.id, label: d.title })));
      } else {
        const res = await fetch('/api/admin/dossiers');
        const data = await res.json();
        setOptions((data.projects || []).map((p: { slug: string; name: string }) => ({ id: p.slug, label: p.name })));
      }
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const openLinkDialog = (memory: OmiMemory, initialType: LinkType) => {
    setLinkDialogFor(memory);
    setLinkType(initialType);
    loadOptions(initialType);
  };

  const confirmSuggestion = async (memory: OmiMemory) => {
    if (!memory.suggested_type || !memory.suggested_id) return;
    setBusyId(memory.id);
    try {
      await fetch(`/api/admin/omi/${memory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link',
          type: memory.suggested_type,
          targetId: memory.suggested_id,
          label: memory.suggested_label,
        }),
      });
      await fetchMemories(status);
    } finally {
      setBusyId(null);
    }
  };

  const submitLink = async () => {
    if (!linkDialogFor || !selectedTargetId) return;
    setBusyId(linkDialogFor.id);
    try {
      await fetch(`/api/admin/omi/${linkDialogFor.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link',
          type: linkType,
          targetId: selectedTargetId,
          label: options.find((o) => o.id === selectedTargetId)?.label,
        }),
      });
      setLinkDialogFor(null);
      await fetchMemories(status);
    } finally {
      setBusyId(null);
    }
  };

  const ignore = async (memory: OmiMemory) => {
    setBusyId(memory.id);
    try {
      await fetch(`/api/admin/omi/${memory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ignore' }),
      });
      await fetchMemories(status);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Omi Inbox</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchMemories(status)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {(['new', 'linked', 'ignored'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? 'default' : 'outline'}
            onClick={() => setStatus(s)}
          >
            {s === 'new' ? 'Nieuw' : s === 'linked' ? 'Gekoppeld' : 'Genegeerd'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : memories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Geen gesprekken in deze lijst. Zorg dat de Omi-app op je telefoon de webhook-URL heeft ingesteld.
        </p>
      ) : (
        <div className="space-y-3">
          {memories.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.started_at ? new Date(m.started_at).toLocaleString('nl-NL') : new Date(m.created_at).toLocaleString('nl-NL')}
                      {m.category ? ` · ${m.category}` : ''}
                    </p>
                  </div>
                  {m.status === 'linked' && m.linked_label && (
                    <Badge variant="secondary">
                      {TYPE_LABELS[m.linked_type as LinkType]}: {m.linked_label}
                    </Badge>
                  )}
                </div>

                {m.overview && <p className="text-sm text-muted-foreground">{m.overview}</p>}

                {m.action_items?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ListTodo className="w-3.5 h-3.5" />
                    {m.action_items.filter((a) => !a.completed).length} actiepunt(en)
                  </div>
                )}

                <button
                  className="text-xs text-purple-600 hover:underline"
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                >
                  {expanded === m.id ? 'Verberg transcript' : 'Toon transcript'}
                </button>
                {expanded === m.id && (
                  <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded max-h-64 overflow-y-auto">
                    {m.transcript || 'Geen transcript beschikbaar.'}
                  </pre>
                )}

                {m.status === 'new' && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {m.suggested_type && m.suggested_label && (
                      <Button size="sm" disabled={busyId === m.id} onClick={() => confirmSuggestion(m)}>
                        {busyId === m.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                        Koppel aan {TYPE_LABELS[m.suggested_type]}: {m.suggested_label}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === m.id}
                      onClick={() => openLinkDialog(m, m.suggested_type || 'company')}
                    >
                      <Link2 className="w-4 h-4 mr-1" />
                      Anders koppelen
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busyId === m.id} onClick={() => ignore(m)}>
                      <X className="w-4 h-4 mr-1" />
                      Negeer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!linkDialogFor} onOpenChange={(open) => !open && setLinkDialogFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Koppel Omi-gesprek</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select
              value={linkType}
              onValueChange={(v) => {
                setLinkType(v as LinkType);
                loadOptions(v as LinkType);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Bedrijf</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="deal">Deal</SelectItem>
                <SelectItem value="project">Klantdossier</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTargetId} onValueChange={setSelectedTargetId} disabled={optionsLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={optionsLoading ? 'Laden...' : 'Kies...'} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogFor(null)}>
              Annuleren
            </Button>
            <Button onClick={submitLink} disabled={!selectedTargetId || busyId === linkDialogFor?.id}>
              {busyId === linkDialogFor?.id && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Koppel & log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
