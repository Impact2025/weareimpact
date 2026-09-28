'use client';

import { useEffect, useState } from 'react';
import { Search, Database, Mail, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import FunnelBar from '@/components/lead-machine/FunnelBar';
import SearchTab from '@/components/lead-machine/SearchTab';
import LeadsTab from '@/components/lead-machine/LeadsTab';
import OutreachTab from '@/components/lead-machine/OutreachTab';
import SearchProfilesTab from '@/components/lead-machine/SearchProfilesTab';

// Eenmalige inrichting/migratie (idempotent). Verdwijnt zodra alles klaarstaat.
function SetupCard({ onDone }: { onDone: () => void }) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/lead-machine/setup').then((r) => r.json()).then((d) => setReady(d.initialized === true)).catch(() => setReady(false));
  }, []);

  if (ready !== false) return null;

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/lead-machine/setup', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || d.error);
      setReady(true);
      toast.success('Lead Machine is bijgewerkt');
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Inrichten mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-amber-900">Database bijwerken</p>
        <p className="text-sm text-amber-700 mt-0.5">De nieuwe Lead Machine heeft extra velden nodig. Veilig en eenmalig.</p>
      </div>
      <Button onClick={run} disabled={loading} variant="outline" className="shrink-0 border-amber-400 text-amber-800 hover:bg-amber-100">
        {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Database size={14} className="mr-2" />}Bijwerken
      </Button>
    </div>
  );
}

export default function LeadMachinePage() {
  const [tab, setTab] = useState('search');
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Machine</h1>
        <p className="text-slate-500 mt-1">
          Vindt organisaties die bij je passen, leest hun eigen website, onderbouwt waarom ze passen en zet persoonlijke mails klaar.
          Er gaat niets de deur uit zonder jouw goedkeuring.
        </p>
      </div>

      <SetupCard onDone={bump} />
      <FunnelBar refreshKey={refreshKey} />

      <Tabs value={tab} onValueChange={(v) => { setTab(v); bump(); }}>
        <TabsList>
          <TabsTrigger value="search"><Search size={14} className="mr-1.5" />Zoeken</TabsTrigger>
          <TabsTrigger value="leads"><Database size={14} className="mr-1.5" />Leads</TabsTrigger>
          <TabsTrigger value="outreach"><Mail size={14} className="mr-1.5" />Outreach</TabsTrigger>
          <TabsTrigger value="profiles"><Clock size={14} className="mr-1.5" />Automatisch zoeken</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6"><SearchTab onSaved={bump} /></TabsContent>
        <TabsContent value="leads" className="mt-6"><LeadsTab key={refreshKey} /></TabsContent>
        <TabsContent value="outreach" className="mt-6"><OutreachTab onChanged={bump} /></TabsContent>
        <TabsContent value="profiles" className="mt-6"><SearchProfilesTab onRan={bump} /></TabsContent>
      </Tabs>
    </div>
  );
}
