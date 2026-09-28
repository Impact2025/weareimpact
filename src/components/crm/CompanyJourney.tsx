'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Minus, Loader2, MessageSquareHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CompanyJourney as Journey, JourneyStep } from '@/lib/crm/journey';

const STATE_STYLES: Record<JourneyStep['state'], { dot: string; label: string }> = {
  done: { dot: 'bg-green-600 text-white border-green-600', label: 'text-slate-900' },
  current: { dot: 'bg-orange-600 text-white border-orange-600 ring-4 ring-orange-100', label: 'text-orange-700' },
  todo: { dot: 'bg-white text-slate-400 border-slate-300', label: 'text-slate-400' },
  skipped: { dot: 'bg-slate-100 text-slate-400 border-slate-200', label: 'text-slate-400' },
};

function scoreColor(score: number) {
  if (score >= 9) return 'text-green-700';
  if (score >= 7) return 'text-amber-700';
  return 'text-red-700';
}

export function CompanyJourney({
  journey,
  companyId,
  onChanged,
}: {
  journey: Journey;
  companyId: string;
  onChanged: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const { feedback } = journey;

  async function requestFeedback() {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/crm/companies/${companyId}/feedback`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Versturen mislukt');
      setMessage({ text: `Verstuurd naar ${data.email}`, tone: 'ok' });
      onChanged();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Versturen mislukt', tone: 'error' });
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <ol className="grid grid-cols-6 gap-1">
          {journey.steps.map((step, index) => {
            const style = STATE_STYLES[step.state];
            const body = (
              <div className="flex flex-col items-center text-center gap-1">
                <div className="flex items-center w-full">
                  <div className={`h-0.5 flex-1 ${index === 0 ? 'opacity-0' : step.state === 'todo' ? 'bg-slate-200' : 'bg-green-600'}`} />
                  <div className={`h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${style.dot}`}>
                    {step.state === 'done' ? <Check size={14} /> : step.state === 'skipped' ? <Minus size={14} /> : index + 1}
                  </div>
                  <div
                    className={`h-0.5 flex-1 ${
                      index === journey.steps.length - 1
                        ? 'opacity-0'
                        : journey.steps[index + 1].state === 'todo'
                          ? 'bg-slate-200'
                          : 'bg-green-600'
                    }`}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${style.label}`}>{step.label}</span>
                {step.detail && <span className="hidden sm:block text-xs text-slate-500 leading-tight">{step.detail}</span>}
              </div>
            );
            return (
              <li key={step.key}>
                {step.href ? (
                  <Link href={step.href} className="block rounded-lg py-1 hover:bg-slate-50">
                    {body}
                  </Link>
                ) : (
                  <div className="py-1">{body}</div>
                )}
              </li>
            );
          })}
        </ol>

        {(journey.delivered || feedback.latestScore != null) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <div className="flex items-start gap-2 min-w-0">
              <MessageSquareHeart size={16} className="mt-0.5 text-orange-600 shrink-0" />
              <div className="min-w-0">
                {feedback.latestScore != null ? (
                  <p>
                    <span className="text-slate-500">Tevredenheid: </span>
                    <span className={`font-semibold ${scoreColor(feedback.latestScore)}`}>{feedback.latestScore}/10</span>
                    {feedback.latestComment && (
                      <span className="text-slate-600"> — &ldquo;{feedback.latestComment}&rdquo;</span>
                    )}
                  </p>
                ) : (
                  <p className="text-slate-600">Nog geen tevredenheidsscore.</p>
                )}
                {feedback.pendingSince && (
                  <p className="text-xs text-slate-400">
                    Vraag verstuurd op {new Date(feedback.pendingSince).toLocaleDateString('nl-NL')}, nog geen antwoord
                  </p>
                )}
                {message && (
                  <p className={`text-xs ${message.tone === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>
                )}
              </div>
            </div>
            {journey.delivered &&
              (confirming ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500">Mail naar de klant?</span>
                  <Button size="sm" onClick={requestFeedback} disabled={sending}>
                    {sending && <Loader2 size={14} className="mr-1 animate-spin" />}
                    Ja, versturen
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={sending}>
                    Annuleer
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => setConfirming(true)}>
                  {feedback.pendingSince ? 'Opnieuw vragen' : 'Vraag om feedback'}
                </Button>
              ))}
          </div>
        )}

        {journey.nextAction && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-orange-50 border border-orange-200 px-4 py-2 text-sm">
            <span className="text-orange-800">
              <span className="font-medium">Volgende stap:</span> {journey.nextAction.text}
            </span>
            {journey.nextAction.href && (
              <Link href={journey.nextAction.href} className="text-orange-700 font-medium flex items-center gap-1 shrink-0 hover:underline">
                Ga naar <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
