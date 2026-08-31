'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2, Tag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SubTag {
  id: string;
  name: string;
  color: string;
  subscriber_count?: number;
}

interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  source: string | null;
  verified_at: string | null;
  created_at: string;
  tags: SubTag[];
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  unsubscribed: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  active: 'Actief',
  pending: 'In afwachting',
  unsubscribed: 'Afgemeld',
};

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tags, setTags] = useState<SubTag[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const loadTags = useCallback(async () => {
    const res = await fetch('/api/admin/newsletter/tags');
    if (res.ok) {
      const data = await res.json();
      setTags(data.tags || []);
    }
  }, []);

  const loadSubscribers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tagFilter !== 'all') params.set('tag_id', tagFilter);
      const res = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, tagFilter]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    const timeout = setTimeout(loadSubscribers, 250);
    return () => clearTimeout(timeout);
  }, [loadSubscribers]);

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setIsCreatingTag(true);
    try {
      const res = await fetch('/api/admin/newsletter/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setNewTagName('');
        loadTags();
      } else {
        const err = await res.json();
        alert(err.error || 'Fout bij aanmaken tag');
      }
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string, name: string) => {
    if (!confirm(`Tag "${name}" verwijderen? Dit ontkoppelt hem van alle abonnees en campagnes.`)) return;
    const res = await fetch('/api/admin/newsletter/tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tagId }),
    });
    if (res.ok) {
      loadTags();
      loadSubscribers();
      if (tagFilter === tagId) setTagFilter('all');
    }
  };

  const handleAddTag = async (subscriberId: string, tagId: string) => {
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === subscriberId
          ? { ...s, tags: [...s.tags, tags.find((t) => t.id === tagId)!].filter(Boolean) }
          : s
      )
    );
    await fetch('/api/admin/newsletter/subscribers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriber_id: subscriberId, add_tag_id: tagId }),
    });
    loadTags();
  };

  const handleRemoveTag = async (subscriberId: string, tagId: string) => {
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === subscriberId ? { ...s, tags: s.tags.filter((t) => t.id !== tagId) } : s
      )
    );
    await fetch('/api/admin/newsletter/subscribers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriber_id: subscriberId, remove_tag_id: tagId }),
    });
    loadTags();
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/newsletter" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Abonnees & Segmenten</h1>
          <p className="text-slate-500 mt-1">
            Beheer tags om campagnes gericht te versturen naar een segment van je nieuwsbriefabonnees
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag size={18} className="text-orange-600" />
            Tags beheren
          </CardTitle>
          <CardDescription>
            Een campagne kan één tag als segment kiezen — alleen abonnees met die tag ontvangen hem dan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-orange-50 text-orange-700 text-sm border border-orange-200"
              >
                {tag.name}
                <span className="text-orange-400 text-xs">({tag.subscriber_count ?? 0})</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="p-0.5 hover:bg-orange-200 rounded-full transition-colors"
                  aria-label={`Verwijder tag ${tag.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-slate-500">Nog geen tags aangemaakt.</p>
            )}
          </div>
          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="Nieuwe tag, bv. 'Klanten'"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            />
            <Button type="button" onClick={handleCreateTag} disabled={isCreatingTag || !newTagName.trim()}>
              {isCreatingTag ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Zoek op e-mailadres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="Filter op tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle abonnees</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mailadres</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bron</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Aangemeld</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => {
                  const availableTags = tags.filter((t) => !s.tags.some((st) => st.id === t.id));
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium max-w-xs truncate">{s.email}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">{s.source || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs"
                            >
                              {tag.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(s.id, tag.id)}
                                className="p-0.5 hover:bg-slate-300 rounded-full transition-colors"
                                aria-label={`Verwijder tag ${tag.name}`}
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                          {availableTags.length > 0 && (
                            <Select onValueChange={(val) => handleAddTag(s.id, val)}>
                              <SelectTrigger className="h-6 w-6 p-0 border-dashed [&>svg]:hidden justify-center">
                                <Plus size={12} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTags.map((tag) => (
                                  <SelectItem key={tag.id} value={tag.id}>
                                    {tag.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">{formatDate(s.created_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {!isLoading && subscribers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">Geen abonnees gevonden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
