'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Mic,
  MicOff,
  Search,
  Wrench,
  ClipboardCheck,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SpeechRecognitionEvent {
  results: {
    [index: number]: { [index: number]: { transcript: string }; isFinal: boolean };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type PhaseKey = 'diagnose' | 'doorbraak' | 'borging';

interface SessionData {
  deal: {
    id: string;
    title: string;
    companyName: string | null;
    contactName: string | null;
    contactEmail: string | null;
  };
  sprintSlug: string;
  sprintTitle: string;
  sprintbrief: Record<string, string> | null;
  session: {
    status: string;
    diagnoseNotes: string;
    doorbraakNotes: string;
    borgingNotes: string;
    sopDraft: string;
  };
}

const PHASES: { key: PhaseKey; label: string; hint: string; icon: typeof Search }[] = [
  { key: 'diagnose', label: 'Diagnose', hint: 'Trigger, invoer, beslisregels, actie, menselijke controle', icon: Search },
  { key: 'doorbraak', label: 'Doorbraak', hint: 'De flow live ingericht, human-in-the-loop, stresstest 5 scenario\'s', icon: Wrench },
  { key: 'borging', label: 'Borging', hint: 'Proceseigenaar voert zelf 1 case uit, wat te doen bij twijfel', icon: ClipboardCheck },
];

function useSpeechToText(onFinalChunk: (text: string) => void) {
  const [listening, setListening] = useState(false);
  // False tijdens SSR/eerste render (window bestaat niet), pas na mount
  // gezet — zelfde patroon als IrisVoiceButton, voorkomt een hydration-mismatch.
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only feature detection, geen SSR-equivalent
    if (SpeechRecognition) setSupported(true);
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition() as SpeechRecognitionInstance;
    recognition.lang = 'nl-NL';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onFinalChunk(result[0].transcript.trim());
        }
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onFinalChunk]);

  return { listening, supported, toggle };
}

function PhaseNotesCard({
  phase,
  value,
  onChange,
  onSaved,
}: {
  phase: (typeof PHASES)[number];
  value: string;
  onChange: (v: string) => void;
  onSaved: () => void;
}) {
  const appendChunk = useCallback(
    (text: string) => {
      if (!text) return;
      onChange(value ? `${value} ${text}` : text);
    },
    [value, onChange]
  );
  const { listening, supported, toggle } = useSpeechToText(appendChunk);

  // Debounced autosave, 1.2s na de laatste wijziging.
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => onSaved(), 1200);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const Icon = phase.icon;

  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-slate-900">{phase.label}</h3>
          </div>
          {supported && (
            <button
              type="button"
              onClick={toggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                listening ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {listening ? 'Stop opname' : 'Dicteer notities'}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-3">{phase.hint}</p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder="Typ of dicteer je notities voor deze fase..."
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
        />
      </CardContent>
    </Card>
  );
}

export default function SprintSessionPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = use(params);
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<PhaseKey, string>>({ diagnose: '', doorbraak: '', borging: '' });
  const [generating, setGenerating] = useState(false);
  const [sopDraft, setSopDraft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/sprint-sessions/${dealId}`)
      .then((res) => res.json())
      .then((json: SessionData) => {
        setData(json);
        setNotes({
          diagnose: json.session.diagnoseNotes,
          doorbraak: json.session.doorbraakNotes,
          borging: json.session.borgingNotes,
        });
        setSopDraft(json.session.sopDraft);
      })
      .finally(() => setLoading(false));
  }, [dealId]);

  const saveNotes = useCallback(
    (phase: PhaseKey, value: string) => {
      fetch(`/api/admin/sprint-sessions/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, notes: value }),
      }).catch(() => {});
    },
    [dealId]
  );

  const handleGenerateSop = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/sprint-sessions/${dealId}/generate-sop`, { method: 'POST' });
      const json = await res.json();
      if (json.sopDraft) setSopDraft(json.sopDraft);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sopDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-slate-500">Sprint-sessie niet gevonden.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/sprint" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Alle sprint-sessies
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{data.deal.companyName || data.deal.contactName}</h1>
        <p className="text-sm text-slate-500 mt-1">{data.sprintTitle}</p>
        {data.deal.contactEmail && <p className="text-sm text-slate-400 mt-0.5">{data.deal.contactName} · {data.deal.contactEmail}</p>}
      </div>

      {data.sprintbrief && (
        <Card className="mb-6 border-orange-100 bg-orange-50/40">
          <CardContent className="py-5">
            <h3 className="font-semibold text-slate-900 mb-3">Sprintbrief-antwoorden</h3>
            <dl className="space-y-3">
              {Object.entries(data.sprintbrief).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</dt>
                  <dd className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
      {!data.sprintbrief && (
        <Card className="mb-6">
          <CardContent className="py-4 text-sm text-slate-500">
            De klant heeft de Sprintbrief nog niet ingevuld.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {PHASES.map((phase) => (
          <PhaseNotesCard
            key={phase.key}
            phase={phase}
            value={notes[phase.key]}
            onChange={(v) => setNotes((prev) => ({ ...prev, [phase.key]: v }))}
            onSaved={() => saveNotes(phase.key, notes[phase.key])}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={handleGenerateSop} disabled={generating} className="bg-slate-900 hover:bg-slate-800">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Genereer SOP-concept
        </Button>
      </div>

      {sopDraft && (
        <Card className="mt-6">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Concept 1-A4 Team-SOP</h3>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Gekopieerd' : 'Kopieer'}
              </button>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{sopDraft}</div>
            <p className="text-xs text-slate-400 mt-4">
              Concept — check dit altijd zelf voordat je het met de klant deelt. Iris genereert nooit rechtstreeks naar buiten.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
