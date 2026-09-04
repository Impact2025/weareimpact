'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Rocket, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SprintSessionRow {
  dealId: string;
  title: string;
  stage: string;
  sprintSlug: string;
  companyName: string | null;
  contactName: string | null;
  sessionStatus: 'gepland' | 'bezig' | 'afgerond';
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  gepland: 'Gepland',
  bezig: 'Bezig op locatie',
  afgerond: 'Afgerond',
};

const STATUS_COLORS: Record<string, string> = {
  gepland: 'bg-slate-100 text-slate-700',
  bezig: 'bg-orange-100 text-orange-700',
  afgerond: 'bg-emerald-100 text-emerald-700',
};

export default function SprintSessionsPage() {
  const [sessions, setSessions] = useState<SprintSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/sprint-sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-orange-600" />
          Sprint Sessies
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Alle AI Diagnose &amp; Doorbraak Sprints — van goedgekeurde intake tot SOP-oplevering.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nog geen sprint-sessies. Deze verschijnen zodra je een Fit &amp; Focus-intake goedkeurt.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link key={s.dealId} href={`/admin/sprint/${s.dealId}`}>
              <Card className="hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{s.companyName || s.contactName || 'Onbekend'}</div>
                      <div className="text-sm text-slate-500">{s.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={STATUS_COLORS[s.sessionStatus] || STATUS_COLORS.gepland}>
                      {STATUS_LABELS[s.sessionStatus] || s.sessionStatus}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
