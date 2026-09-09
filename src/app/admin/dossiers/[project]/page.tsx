'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Send, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  question: string;
  status: 'open' | 'answered';
  client_answer: string | null;
  answered_at: string | null;
}

export default function DossierDetailPage() {
  const params = useParams<{ project: string }>();
  const projectSlug = params.project;

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [adding, setAdding] = useState(false);

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [linkResult, setLinkResult] = useState<{ url: string; expiresAt: string } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/admin/dossiers/${projectSlug}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions ?? []));
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
        body: JSON.stringify({ question: newQuestion.trim() }),
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

  async function sendMagicLink() {
    if (!email.trim()) return;
    setSending(true);
    setLinkError(null);
    setLinkResult(null);
    try {
      const res = await fetch(`/api/admin/dossiers/${projectSlug}/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold capitalize">{projectSlug.replace(/-/g, ' ')}</h1>
        <p className="text-sm text-muted-foreground">
          Vragen hieronder zijn wat de klant via de magic link te zien krijgt — niets anders uit
          het dossier.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="font-semibold">Magic link versturen</h2>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="klant@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={sendMagicLink} disabled={sending || !email.trim()}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="mr-1" />}
              Versturen
            </Button>
          </div>
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

      <Card>
        <CardContent className="pt-6 space-y-3">
          <h2 className="font-semibold">Nieuwe vraag toevoegen</h2>
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

      <div className="space-y-3">
        <h2 className="font-semibold">Vragen ({questions?.length ?? 0})</h2>
        {questions === null ? (
          <Loader2 className="animate-spin" />
        ) : (
          questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
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
                  <Button size="icon" variant="ghost" onClick={() => deleteQuestion(q.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
