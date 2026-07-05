'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Share2, Send, Trash2, Pencil, X, CheckCircle2, Copy,
  ExternalLink, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialPost {
  id: string;
  platform: 'linkedin' | 'facebook' | 'instagram' | 'x';
  content: string;
  status: 'draft' | 'posted' | 'failed';
  error?: string;
  articleTitle: string;
  articleUrl: string;
  postedAt?: string;
  createdAt: string;
}

const PLATFORM_META: Record<string, { label: string; cls: string }> = {
  linkedin: { label: 'LinkedIn', cls: 'bg-sky-100 text-sky-800' },
  facebook: { label: 'Facebook', cls: 'bg-blue-100 text-blue-800' },
  instagram: { label: 'Instagram', cls: 'bg-pink-100 text-pink-800' },
  x: { label: 'X', cls: 'bg-slate-200 text-slate-800' },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Concept', cls: 'bg-slate-100 text-slate-700' },
  posted: { label: 'Geplaatst', cls: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Mislukt', cls: 'bg-red-100 text-red-700' },
};

const FILTERS = [
  { value: 'all', label: 'Alles' },
  { value: 'draft', label: 'Concepten' },
  { value: 'posted', label: 'Geplaatst' },
  { value: 'failed', label: 'Mislukt' },
];

export default function SocialAdminPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [counts, setCounts] = useState({ draft: 0, posted: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [postingId, setPostingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchPosts = useCallback(async (status = filter) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/social?status=${status}`);
      const d = await r.json();
      setPosts(d.posts ?? []);
      if (d.counts) setCounts(d.counts);
    } catch {
      toast.error('Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const postNow = async (id: string) => {
    setPostingId(id);
    try {
      const r = await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success('Geplaatst');
      await fetchPosts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Plaatsen mislukt');
      await fetchPosts();
    } finally {
      setPostingId(null);
    }
  };

  const saveEdit = async () => {
    if (!editId) return;
    const r = await fetch('/api/admin/social', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, content: editContent }),
    });
    if (!r.ok) { toast.error('Opslaan mislukt'); return; }
    setPosts((prev) => prev.map((p) => p.id === editId ? { ...p, content: editContent } : p));
    setEditId(null);
    toast.success('Post bijgewerkt');
  };

  const remove = async (id: string) => {
    const r = await fetch(`/api/admin/social?id=${id}`, { method: 'DELETE' });
    if (!r.ok) { toast.error('Verwijderen mislukt'); return; }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const copyText = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success('Tekst gekopieerd');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 size={22} className="text-orange-500" /> Social posts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automatisch gegenereerd bij elke publicatie. Platforms met een API-token plaatsen direct;
            de rest staat hier klaar om te plaatsen of te kopiëren.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchPosts()}><RefreshCw size={15} /></Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.value ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-sm text-slate-400 ml-2">
          {counts.draft} concept · {counts.posted} geplaatst{counts.failed > 0 ? ` · ${counts.failed} mislukt` : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Share2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nog geen social posts</p>
          <p className="text-sm mt-1">Bij de volgende automatische publicatie verschijnen ze hier.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const platform = PLATFORM_META[p.platform] ?? PLATFORM_META.linkedin;
            const status = STATUS_META[p.status] ?? STATUS_META.draft;
            const isEditing = editId === p.id;
            return (
              <div key={p.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${platform.cls}`}>{platform.label}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.cls}`}>{status.label}</span>
                      <a href={p.articleUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-orange-600 inline-flex items-center gap-1 truncate max-w-md">
                        {p.articleTitle} <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button title="Kopieer tekst" onClick={() => copyText(p.content)} className="p-1.5 text-slate-400 hover:text-slate-700">
                      <Copy size={14} />
                    </button>
                    {p.status !== 'posted' && !isEditing && (
                      <>
                        <button title="Bewerken" onClick={() => { setEditId(p.id); setEditContent(p.content); }} className="p-1.5 text-slate-400 hover:text-slate-700">
                          <Pencil size={14} />
                        </button>
                        <button title="Verwijderen" onClick={() => remove(p.id)} className="p-1.5 text-slate-300 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full text-sm rounded-md border border-slate-200 p-2.5 resize-y min-h-36 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}><CheckCircle2 size={14} className="mr-1.5" />Opslaan</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X size={14} className="mr-1.5" />Annuleren</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{p.content}</p>
                )}

                {p.error && <p className="text-xs text-red-600 mt-2">Fout: {p.error}</p>}

                {!isEditing && p.status !== 'posted' && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      size="sm" variant="outline"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      disabled={postingId === p.id}
                      onClick={() => postNow(p.id)}
                    >
                      {postingId === p.id ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Send size={14} className="mr-1.5" />}
                      Plaats nu
                    </Button>
                  </div>
                )}
                {p.status === 'posted' && p.postedAt && (
                  <p className="text-xs text-slate-400 mt-2">
                    Geplaatst op {new Date(p.postedAt).toLocaleString('nl-NL')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
