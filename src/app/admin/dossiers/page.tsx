'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Project {
  slug: string;
  name: string;
  client_name: string | null;
  open_count: string;
  answered_count: string;
}

export default function DossiersPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/dossiers')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? []));
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, clientName: clientName || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Onbekende fout');
        return;
      }
      setDialogOpen(false);
      setSlug('');
      setName('');
      setClientName('');
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Klantdossiers</h1>
          <p className="text-sm text-muted-foreground">
            Elk dossier is strikt gescheiden — een klant ziet nooit iets van een ander project.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Nieuw dossier
        </Button>
      </div>

      {projects === null ? (
        <Loader2 className="animate-spin" />
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground">Nog geen dossiers.</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link key={p.slug} href={`/admin/dossiers/${p.slug}`}>
              <Card className="hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={18} />
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{p.open_count} open</Badge>
                    <Badge variant="secondary">{p.answered_count} beantwoord</Badge>
                  </div>
                </CardHeader>
                {p.client_name && (
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {p.client_name}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw dossier</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Slug (in de URL, bv. dinestar-boost)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="dinestar-boost" />
            </div>
            <div>
              <label className="text-sm font-medium">Naam</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dinestar Boost" />
            </div>
            <div>
              <label className="text-sm font-medium">Klantnaam (optioneel)</label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Schmesch Holding" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={createProject} disabled={saving || !slug || !name}>
              {saving ? 'Bezig…' : 'Aanmaken'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
