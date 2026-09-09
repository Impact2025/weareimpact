'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Send, Loader2, Copy, Check, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Audience = 'klant' | 'opdrachtgever';

const AUDIENCE_LABELS: Record<Audience, string> = {
  klant: 'Klant',
  opdrachtgever: 'Opdrachtgever',
};

interface Question {
  id: string;
  question: string;
  status: 'open' | 'answered';
  client_answer: string | null;
  answered_at: string | null;
  origin: 'admin' | 'iris';
  audience: Audience;
  sort_order: number;
}

interface ChatSummary {
  id: string;
  summary: string;
  next_steps: string | null;
  created_at: string;
  audience: Audience;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  prd_section: string | null;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  client_visible: boolean;
}

interface Agreement {
  id: string;
  title: string;
  description: string | null;
  decided_at: string;
  client_visible: boolean;
}

interface Action {
  id: string;
  title: string;
  owner: 'vincent' | 'klant' | 'waiterAid';
  status: 'open' | 'done';
  due_date: string | null;
  source: 'manual' | 'chat_summary';
  client_visible: boolean;
}

const MILESTONE_STATUS_LABELS: Record<Milestone['status'], string> = {
  todo: 'Te doen',
  in_progress: 'Bezig',
  done: 'Klaar',
};

export default function DossierDetailPage() {
  const params = useParams<{ project: string }>();
  const projectSlug = params.project;

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [adding, setAdding] = useState(false);
  const [summaries, setSummaries] = useState<ChatSummary[] | null>(null);
  const [audienceFilter, setAudienceFilter] = useState<Audience>('klant');
  const [magicLinkAudience, setMagicLinkAudience] = useState<Audience>('klant');

  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [newMilestone, setNewMilestone] = useState('');
  const [agreements, setAgreements] = useState<Agreement[] | null>(null);
  const [newAgreement, setNewAgreement] = useState('');
  const [actions, setActions] = useState<Action[] | null>(null);
  const [newAction, setNewAction] = useState('');
  const [newActionOwner, setNewActionOwner] = useState<Action['owner']>('vincent');

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [linkResult, setLinkResult] = useState<{ url: string; expiresAt: string } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [intakeNotes, setIntakeNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/admin/dossiers/${projectSlug}`)
      .then((res) => res.json())
      .then((data) => setIntakeNotes(data.project?.intake_notes ?? ''));
    fetch(`/api/admin/dossiers/${projectSlug}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions ?? []));
    fetch(`/api/admin/dossiers/${projectSlug}/summaries`)
      .then((res) => res.json())
      .then((data) => setSummaries(data.summaries ?? []));
    fetch(`/api/admin/dossiers/${projectSlug}/milestones`)
      .then((res) => res.json())
      .then((data) => setMilestones(data.milestones ?? []));
    fetch(`/api/admin/dossiers/${projectSlug}/agreements`)
      .then((res) => res.json())
      .then((data) => setAgreements(data.agreements ?? []));
    fetch(`/api/admin/dossiers/${projectSlug}/actions`)
      .then((res) => res.json())
      .then((data) => setActions(data.actions ?? []));
  }, [projectSlug]);

  useEffect(() => {
    load();
  }, [load]);

  async function addQuestion() {
    if (!newQuestion.trim()) return;
    setAdding(true);
    try {
      await fetch(`/api/admin/dossiers/${projectSlug}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim(), audience: audienceFilter }),
      });
      setNewQuestion('');
      load();
    } finally {
      setAdding(false);
    }
  }

  async function deleteQuestion(id: string) {
    await fetch(`/api/admin/dossiers/${projectSlug}/questions/${id}`, { method: 'DELETE' });
    load();
  }

  async function moveQuestion(list: Question[], index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const current = list[index];
    const target = list[targetIndex];

    await Promise.all([
      fetch(`/api/admin/dossiers/${projectSlug}/questions/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: target.sort_order }),
      }),
      fetch(`/api/admin/dossiers/${projectSlug}/questions/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: current.sort_order }),
      }),
    ]);
    load();
  }

  async function saveIntakeNotes() {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      await fetch(`/api/admin/dossiers/${projectSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeNotes }),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setSavingNotes(false);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) return;
    setSending(true);
    setLinkError(null);
    setLinkResult(null);
    try {
      const res = await fetch(`/api/admin/dossiers/${projectSlug}/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), audience: magicLinkAudience }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLinkError(data.error ?? 'Onbekende fout');
        return;
      }
      setLinkResult({ url: data.url, expiresAt: data.expiresAt });
    } finally {
      setSending(false);
    }
  }

  function copyLink() {
    if (!linkResult) return;
    navigator.clipboard.writeText(linkResult.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function addMilestone() {
    if (!newMilestone.trim()) return;
    await fetch(`/api/admin/dossiers/${projectSlug}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newMilestone.trim() }),
    });
    setNewMilestone('');
    load();
  }

  async function cycleMilestoneStatus(m: Milestone) {
    const next: Record<Milestone['status'], Milestone['status']> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    await fetch(`/api/admin/dossiers/${projectSlug}/milestones/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next[m.status] }),
    });
    load();
  }

  async function toggleMilestoneVisible(m: Milestone) {
    await fetch(`/api/admin/dossiers/${projectSlug}/milestones/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientVisible: !m.client_visible }),
    });
    load();
  }

  async function deleteMilestone(id: string) {
    await fetch(`/api/admin/dossiers/${projectSlug}/milestones/${id}`, { method: 'DELETE' });
    load();
  }

  async function addAgreement() {
    if (!newAgreement.trim()) return;
    await fetch(`/api/admin/dossiers/${projectSlug}/agreements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newAgreement.trim() }),
    });
    setNewAgreement('');
    load();
  }

  async function toggleAgreementVisible(a: Agreement) {
    await fetch(`/api/admin/dossiers/${projectSlug}/agreements/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientVisible: !a.client_visible }),
    });
    load();
  }

  async function deleteAgreement(id: string) {
    await fetch(`/api/admin/dossiers/${projectSlug}/agreements/${id}`, { method: 'DELETE' });
    load();
  }

  async function addAction() {
    if (!newAction.trim()) return;
    await fetch(`/api/admin/dossiers/${projectSlug}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newAction.trim(), owner: newActionOwner }),
    });
    setNewAction('');
    load();
  }

  async function toggleActionDone(a: Action) {
    await fetch(`/api/admin/dossiers/${projectSlug}/actions/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: a.status === 'done' ? 'open' : 'done' }),
    });
    load();
  }

  async function toggleActionVisible(a: Action) {
    await fetch(`/api/admin/dossiers/${projectSlug}/actions/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientVisible: !a.client_visible }),
    });
    load();
  }

  async function deleteAction(id: string) {
    await fetch(`/api/admin/dossiers/${projectSlug}/actions/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold capitalize">{projectSlug.replace(/-/g, ' ')}</h1>
        <p className="text-sm text-muted-foreground">
          Het oogje-icoon bepaalt per item of de klant het in het portal te zien krijgt. Standaard
          intern (verborgen) — jij kiest wat gedeeld wordt.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="font-semibold">Briefing (verslag intakegesprek)</h2>
          <p className="text-sm text-muted-foreground">
            Wat je hier zet, gebruikt Iris als achtergrond in het klantgesprek — ze ziet zo wat al
            bekend is en weet waar ze zelf gericht op door moet vragen, naast de vaste vragenlijst.
          </p>
          <Textarea
            placeholder="Samenvatting van je eigen gesprek met de klant…"
            value={intakeNotes}
            onChange={(e) => setIntakeNotes(e.target.value)}
            rows={5}
          />
          <div className="flex items-center gap-2">
            <Button onClick={saveIntakeNotes} disabled={savingNotes}>
              {savingNotes ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
              Opslaan
            </Button>
            {notesSaved && <span className="text-sm text-green-700">Opgeslagen</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="font-semibold">Magic link versturen</h2>
          <div className="flex gap-2">
            <Select value={magicLinkAudience} onValueChange={(v) => setMagicLinkAudience(v as Audience)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="klant">Klant</SelectItem>
                <SelectItem value="opdrachtgever">Opdrachtgever</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="email"
              placeholder="e-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={sendMagicLink} disabled={sending || !email.trim()}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="mr-1" />}
              Versturen
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Kies de doelgroep vóórdat je verstuurt — dit bepaalt welke vragenlijst en welk gesprek
            met Iris de ontvanger via de link te zien krijgt.
          </p>
          {linkError && <p className="text-sm text-red-600">{linkError}</p>}
          {linkResult && (
            <div className="text-sm bg-green-50 border border-green-200 rounded p-3 flex items-center justify-between gap-2">
              <span className="truncate">
                Verstuurd. Link (7 dagen geldig): <code className="text-xs">{linkResult.url}</code>
              </span>
              <Button size="sm" variant="outline" onClick={copyLink}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overzicht">
        <TabsList>
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
          <TabsTrigger value="vragen">Vragen ({questions?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="gesprekken">Gesprekken ({summaries?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overzicht" className="space-y-6 mt-4">
          <div className="space-y-3">
            <h2 className="font-semibold">Tijdlijn / mijlpalen</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Nieuwe mijlpaal…"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
              />
              <Button onClick={addMilestone} disabled={!newMilestone.trim()}>
                <Plus size={16} />
              </Button>
            </div>
            {milestones?.map((m) => (
              <Card key={m.id}>
                <CardContent className="pt-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <button
                      onClick={() => cycleMilestoneStatus(m)}
                      className="text-left"
                      title="Klik om status te wijzigen"
                    >
                      <Badge
                        variant={m.status === 'done' ? 'secondary' : 'outline'}
                        className="mr-2"
                      >
                        {MILESTONE_STATUS_LABELS[m.status]}
                      </Badge>
                      <span className={m.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                        {m.title}
                      </span>
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleMilestoneVisible(m)}>
                      {m.client_visible ? <Eye size={16} /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMilestone(m.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold">Afspraken &amp; beslissingen</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Nieuwe afspraak…"
                value={newAgreement}
                onChange={(e) => setNewAgreement(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAgreement()}
              />
              <Button onClick={addAgreement} disabled={!newAgreement.trim()}>
                <Plus size={16} />
              </Button>
            </div>
            {agreements?.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p>{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.decided_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleAgreementVisible(a)}>
                      {a.client_visible ? <Eye size={16} /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteAgreement(a.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold">Actiepunten</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Nieuw actiepunt…"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAction()}
              />
              <Select value={newActionOwner} onValueChange={(v) => setNewActionOwner(v as Action['owner'])}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vincent">Vincent</SelectItem>
                  <SelectItem value="klant">Klant</SelectItem>
                  <SelectItem value="waiterAid">WaiterAid</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addAction} disabled={!newAction.trim()}>
                <Plus size={16} />
              </Button>
            </div>
            {actions?.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4 flex items-center justify-between gap-3">
                  <div className="flex-1 flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={a.status === 'done'}
                      onChange={() => toggleActionDone(a)}
                      className="mt-1"
                    />
                    <div>
                      <p className={a.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                        {a.title}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {a.owner}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleActionVisible(a)}>
                      {a.client_visible ? <Eye size={16} /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteAction(a.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vragen" className="space-y-4 mt-4">
          <AudienceToggle value={audienceFilter} onChange={setAudienceFilter} />

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h2 className="font-semibold">Nieuwe vraag toevoegen ({AUDIENCE_LABELS[audienceFilter]})</h2>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Vraag voor de klant…"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={2}
                />
                <Button onClick={addQuestion} disabled={adding || !newQuestion.trim()}>
                  <Plus size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {questions === null ? (
            <Loader2 className="animate-spin" />
          ) : (
            (() => {
              const filtered = questions.filter((q) => q.audience === audienceFilter);
              return filtered.map((q, i) => (
                <Card key={q.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">
                          {q.question}
                          {q.origin === 'iris' && (
                            <Badge variant="secondary" className="ml-2 align-middle text-xs">
                              door Iris gesteld
                            </Badge>
                          )}
                        </p>
                        {q.status === 'answered' ? (
                          <div className="mt-2 text-sm bg-green-50 border border-green-200 rounded p-2">
                            {q.client_answer}
                          </div>
                        ) : (
                          <Badge variant="outline" className="mt-2">
                            open
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={i === 0}
                            onClick={() => moveQuestion(filtered, i, -1)}
                          >
                            <ChevronUp size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={i === filtered.length - 1}
                            onClick={() => moveQuestion(filtered, i, 1)}
                          >
                            <ChevronDown size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteQuestion(q.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ));
            })()
          )}
        </TabsContent>

        <TabsContent value="gesprekken" className="space-y-3 mt-4">
          <AudienceToggle value={audienceFilter} onChange={setAudienceFilter} />

          {summaries && summaries.filter((s) => s.audience === audienceFilter).length > 0 ? (
            summaries.filter((s) => s.audience === audienceFilter).map((s) => (
              <Card key={s.id} className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString('nl-NL')}
                  </p>
                  <p className="text-sm">{s.summary}</p>
                  {s.next_steps && (
                    <div className="text-sm">
                      <span className="font-semibold">Voorgestelde vervolgstappen: </span>
                      {s.next_steps}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nog geen afgeronde gesprekken.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AudienceToggle({ value, onChange }: { value: Audience; onChange: (a: Audience) => void }) {
  return (
    <div className="flex gap-2">
      {(['klant', 'opdrachtgever'] as const).map((a) => (
        <Button key={a} size="sm" variant={value === a ? 'default' : 'outline'} onClick={() => onChange(a)}>
          {AUDIENCE_LABELS[a]}
        </Button>
      ))}
    </div>
  );
}
