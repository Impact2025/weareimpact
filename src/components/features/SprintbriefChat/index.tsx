'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IntakeGroup } from '@/lib/intake/questions';

interface SprintbriefData {
  sprintSlug: string;
  sprintTitle: string;
  customerName: string;
  organisation: string | null;
  groups: IntakeGroup[];
  alreadySubmitted: boolean;
}

type Phase = 'loading' | 'error' | 'form' | 'submitting' | 'done';

export function SprintbriefChat({ token }: { token: string }) {
  const [data, setData] = useState<SprintbriefData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/sprintbrief/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((json: SprintbriefData) => {
        setData(json);
        setPhase(json.alreadySubmitted ? 'done' : 'form');
      })
      .catch(() => {
        setErrorMessage('Deze link is ongeldig of verlopen. Neem contact op met Vincent als je denkt dat dit niet klopt.');
        setPhase('error');
      });
  }, [token]);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Link niet gevonden</h1>
          <p className="text-sm text-slate-600 leading-relaxed">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
          <ClipboardCheck className="w-8 h-8 text-orange-600" />
        </div>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Bedankt{data?.customerName ? `, ${data.customerName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Je Sprintbrief is binnen. Vincent bereidt zich hiermee voor op de sprintdag — tot dan!
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const groups = data.groups;
  const currentGroup = groups[step];
  const isLastStep = step === groups.length - 1;

  const groupIsComplete = (groupIndex: number) =>
    groups[groupIndex].questions.every((q) => q.optional || (answers[q.id] ?? '').trim() !== '');

  const canProceed = groupIsComplete(step);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!canProceed) return;
    setStep((s) => Math.min(s + 1, groups.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!canProceed) return;
    setPhase('submitting');
    try {
      const response = await fetch(`/api/sprintbrief/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('failed');
      setPhase('done');
    } catch {
      setErrorMessage('Er ging iets mis bij het versturen. Probeer het opnieuw of mail naar v.munster@weareimpact.nl.');
      setPhase('form');
    }
  };

  const progress = Math.round(((step + 1) / groups.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-24">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <h1 className="font-semibold">Sprintbrief — {data.sprintTitle}</h1>
          <p className="text-xs text-slate-300">Voorbereiding voor de sprintdag op locatie</p>
        </div>
        <div className="h-1 bg-slate-700">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
            Stap {step + 1} van {groups.length}: {currentGroup.title}
          </p>
          <p className="text-sm text-slate-500 italic mb-6">{currentGroup.intro}</p>

          <div className="space-y-5">
            {currentGroup.questions.map((question) => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  {question.text}
                  {question.optional && <span className="text-slate-400 font-normal"> (optioneel)</span>}
                </label>
                {question.multiline ? (
                  <textarea
                    value={answers[question.id] ?? ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
                  />
                ) : (
                  <input
                    value={answers[question.id] ?? ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                )}
              </div>
            ))}
          </div>

          {errorMessage && phase === 'form' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0 || phase === 'submitting'}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Vorige
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600"
                disabled={!canProceed || phase === 'submitting'}
              >
                {phase === 'submitting' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Verstuur Sprintbrief
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} disabled={!canProceed} className="bg-orange-500 hover:bg-orange-600">
                Volgende <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SprintbriefChat;
