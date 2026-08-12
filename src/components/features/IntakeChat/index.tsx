'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, User, Mail, Building, Phone, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { INTAKE_GROUPS } from '@/lib/intake/questions';

interface ContactData {
  name: string;
  email: string;
  organisation: string;
  phone: string;
}

// De contactgegevens vormen de laatste stap, na de inhoudelijke vragengroepen.
const STEP_TITLES = [...INTAKE_GROUPS.map((group) => group.title), 'Contact'];
const CONTACT_STEP = INTAKE_GROUPS.length;

type Phase = 'form' | 'submitting' | 'done' | 'error';

export function IntakeChat() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>('form');
  const [contact, setContact] = useState<ContactData>({ name: '', email: '', organisation: '', phone: '' });
  const [honeypot, setHoneypot] = useState('');
  const [startTime] = useState(() => Date.now());

  const currentGroup = step < CONTACT_STEP ? INTAKE_GROUPS[step] : null;
  const isContactStep = step === CONTACT_STEP;

  const groupIsComplete = (groupIndex: number) =>
    INTAKE_GROUPS[groupIndex].questions.every((q) => q.optional || (answers[q.id] ?? '').trim() !== '');

  const canProceed = currentGroup ? groupIsComplete(step) : contact.name.trim() !== '' && contact.email.trim() !== '';

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToStep = (target: number) => {
    // Alleen terug naar een al voltooide stap, of naar de eerstvolgende stap springen.
    if (target < step) setStep(target);
  };

  const handleNext = () => {
    if (!canProceed) return;
    setStep((s) => Math.min(s + 1, CONTACT_STEP));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;

    setPhase('submitting');
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contact.name.trim(),
          email: contact.email.trim(),
          organisation: contact.organisation.trim() || undefined,
          phone: contact.phone.trim() || undefined,
          answers,
          durationSeconds,
          honeypot,
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      setPhase('done');
    } catch {
      setPhase('error');
    }
  };

  const progress = Math.round((step / CONTACT_STEP) * 100);

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4">
        <div className="w-16 h-16 rounded-full overflow-hidden relative shrink-0 mb-6 ring-4 ring-white shadow-lg">
          <Image src="/iris-avatar.webp" alt="Iris" fill className="object-cover" />
        </div>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Bedankt voor je aanvraag{contact.name.trim() ? `, ${contact.name.trim().split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ik heb je antwoorden ontvangen en geef ze door aan Vincent. Hij neemt ze met je door en komt terug met een
            onderbouwd voorstel, geen geraden prijs.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-3">
            Je hoort binnen enkele werkdagen van ons op <span className="font-medium text-slate-800">{contact.email}</span>.
          </p>
          <a href="https://weareimpact.nl" className="inline-block mt-6">
            <Button variant="outline">Terug naar WeAreImpact.nl</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden relative shrink-0 bg-orange-500">
            <Image src="/iris-avatar.webp" alt="Iris" fill className="object-cover" />
          </div>
          <div>
            <h1 className="font-semibold">Intake met Iris</h1>
            <p className="text-xs text-slate-300">Voor een onderbouwd voorstel van AgentOS &amp; Iris</p>
          </div>
        </div>
        <div className="h-1 bg-slate-700">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      {/* Stappen */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-1 min-w-max">
          {STEP_TITLES.map((title, index) => {
            const isDone = index < step;
            const isCurrent = index === step;
            const clickable = index < step;
            return (
              <div key={title} className="flex items-center">
                {index > 0 && <div className={cn('w-6 h-px mx-1', isDone || isCurrent ? 'bg-orange-400' : 'bg-slate-200')} />}
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!clickable}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                    isCurrent && 'bg-orange-50 text-orange-700',
                    isDone && 'text-slate-500 hover:text-slate-700 cursor-pointer',
                    !isDone && !isCurrent && 'text-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0',
                      isCurrent && 'bg-orange-500 text-white',
                      isDone && 'bg-slate-200 text-slate-600',
                      !isDone && !isCurrent && 'bg-slate-100 text-slate-300'
                    )}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : index + 1}
                  </span>
                  {title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inhoud */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {currentGroup && (
            <>
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
                        rows={3}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
                      />
                    ) : (
                      <Input value={answers[question.id] ?? ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {isContactStep && (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-slate-500 italic mb-6">
                Laatste stap: waar mag ik het onderbouwde voorstel naartoe sturen?
              </p>
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <User className="w-4 h-4" /> Naam *
                  </label>
                  <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Je naam" required />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <Mail className="w-4 h-4" /> E-mail *
                  </label>
                  <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="je@organisatie.nl" required />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <Building className="w-4 h-4" /> Organisatie
                  </label>
                  <Input value={contact.organisation} onChange={(e) => setContact({ ...contact, organisation: e.target.value })} placeholder="Optioneel" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    <Phone className="w-4 h-4" /> Telefoon
                  </label>
                  <Input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Optioneel" />
                </div>
              </div>

              {phase === 'error' && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  Er ging iets mis bij het versturen. Probeer het opnieuw of mail direct naar{' '}
                  <a href="mailto:v.munster@weareimpact.nl" className="underline">v.munster@weareimpact.nl</a>.
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack} disabled={phase === 'submitting'}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Vorige
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={!canProceed || phase === 'submitting'}>
                  {phase === 'submitting' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Verstuur intake
                </Button>
              </div>
            </form>
          )}

          {currentGroup && (
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Vorige
              </Button>
              <Button type="button" onClick={handleNext} disabled={!canProceed} className="bg-orange-500 hover:bg-orange-600">
                Volgende <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntakeChat;
