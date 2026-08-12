'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Send, Loader2, Check, User, Mail, Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { INTAKE_GROUPS, INTAKE_QUESTION_COUNT } from '@/lib/intake/questions';

interface ChatMessage {
  id: string;
  role: 'iris' | 'user';
  content: string;
}

interface ContactData {
  name: string;
  email: string;
  organisation: string;
  phone: string;
}

// Platte lijst van alle vragen met hun groep, voor eenvoudige index-navigatie
const FLAT_QUESTIONS = INTAKE_GROUPS.flatMap((group) =>
  group.questions.map((question) => ({ group, question }))
);

type Phase = 'chat' | 'contact' | 'submitting' | 'done' | 'error';

export function IntakeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [phase, setPhase] = useState<Phase>('chat');
  const [contact, setContact] = useState<ContactData>({ name: '', email: '', organisation: '', phone: '' });
  const [honeypot, setHoneypot] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const initialisedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, phase]);

  // Herstel focus op het invoerveld na elke overgang naar een nieuwe vraag,
  // want het veld wordt tijdens de overgangsanimatie kort disabled en verliest daardoor focus.
  useEffect(() => {
    if (phase !== 'chat') return;
    textareaRef.current?.focus();
    inputRef.current?.focus();
  }, [questionIndex, phase]);

  const addMessage = (role: 'iris' | 'user', content: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content }]);
  };

  // Introduceer de eerste groep + vraag bij het laden
  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    const first = FLAT_QUESTIONS[0];
    addMessage('iris', "Hoi, ik ben Iris. Voordat we een prijsvoorstel maken, wil ik je een aantal vragen stellen zodat het onderbouwd is in plaats van geraden. Het duurt zo'n 5 tot 10 minuten.");
    addMessage('iris', first.group.intro);
    addMessage('iris', first.question.text);
  }, []);

  const currentEntry = FLAT_QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === FLAT_QUESTIONS.length - 1;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmitAnswer = () => {
    const value = inputValue.trim();
    if (!value || !currentEntry || isTransitioning) return;

    setIsTransitioning(true);
    addMessage('user', value);
    setAnswers((prev) => ({ ...prev, [currentEntry.question.id]: value }));
    setInputValue('');

    if (isLastQuestion) {
      setTimeout(() => {
        addMessage('iris', 'Dank je, dat is precies wat ik nodig heb. Laatste stap: waar mag ik het onderbouwde voorstel naartoe sturen?');
        setPhase('contact');
        setIsTransitioning(false);
      }, 300);
      return;
    }

    const nextIndex = questionIndex + 1;
    const next = FLAT_QUESTIONS[nextIndex];
    const isNewGroup = next.group.id !== currentEntry.group.id;

    setTimeout(() => {
      if (isNewGroup) {
        addMessage('iris', next.group.intro);
      }
      addMessage('iris', next.question.text);
      setQuestionIndex(nextIndex);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim()) return;

    setPhase('submitting');
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

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

      addMessage('iris', `Dank je wel, ${contact.name.trim().split(' ')[0]}. Ik ga hiermee aan de slag en Vincent neemt dit met je door voor een onderbouwd voorstel. Je hoort snel van ons.`);
      setPhase('done');
    } catch {
      setPhase('error');
    }
  };

  const progress = Math.round(
    ((phase === 'contact' || phase === 'submitting' || phase === 'done' ? INTAKE_QUESTION_COUNT : questionIndex) /
      INTAKE_QUESTION_COUNT) *
      100
  );

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

      {/* Chat area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                message.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-white text-slate-800 shadow-sm rounded-bl-md'
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Contactformulier */}
        {phase === 'contact' && (
          <form onSubmit={handleSubmitContact} className="bg-white rounded-2xl p-4 shadow-sm space-y-3 max-w-[85%]">
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
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
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={!contact.name.trim() || !contact.email.trim()}>
              <Check className="w-4 h-4 mr-2" />
              Verstuur intake
            </Button>
          </form>
        )}

        {phase === 'submitting' && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Even versturen...
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 max-w-[85%]">
            Er ging iets mis bij het versturen. Probeer het opnieuw of mail direct naar{' '}
            <a href="mailto:v.munster@weareimpact.nl" className="underline">v.munster@weareimpact.nl</a>.
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={() => setPhase('contact')}>
                Opnieuw proberen
              </Button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center max-w-[85%]">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-green-800 font-medium">Intake ontvangen</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {phase === 'chat' && (
        <div className="border-t border-slate-200 bg-white sticky bottom-0">
          <div className="max-w-2xl mx-auto px-4 py-4 flex gap-2 items-end">
            {currentEntry?.question.multiline ? (
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
                placeholder="Typ je antwoord... (Shift+Enter voor nieuwe regel)"
                rows={2}
                disabled={isTransitioning}
                className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none disabled:opacity-50"
              />
            ) : (
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Typ je antwoord..."
                disabled={isTransitioning}
                className="flex-1"
              />
            )}
            <Button onClick={handleSubmitAnswer} disabled={!inputValue.trim() || isTransitioning} size="icon" className="bg-orange-500 hover:bg-orange-600 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntakeChat;
