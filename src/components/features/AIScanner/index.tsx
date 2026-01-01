'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, CheckCircle, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ScanQuestion {
  id: number;
  question: string;
  options: { label: string; value: string }[];
}

const questions: ScanQuestion[] = [
  {
    id: 1,
    question: 'In welke sector ben je actief?',
    options: [
      { label: 'Zorg & Welzijn', value: 'zorg' },
      { label: 'Onderwijs & Overheid', value: 'overheid' },
      { label: 'MKB / Commercieel', value: 'mkb' },
      { label: 'Non-profit / Stichting', value: 'nonprofit' },
    ],
  },
  {
    id: 2,
    question: 'Wat is je grootste uitdaging op dit moment?',
    options: [
      { label: 'Te weinig tijd / capaciteit', value: 'tijd' },
      { label: 'Financiering vinden', value: 'geld' },
      { label: 'Verouderde processen', value: 'tech' },
      { label: 'Teamontwikkeling', value: 'team' },
    ],
  },
  {
    id: 3,
    question: 'Gebruik je al AI in je organisatie?',
    options: [
      { label: 'Nee, nog helemaal niet', value: 'nee' },
      { label: 'Een beetje (ChatGPT)', value: 'beetje' },
      { label: 'Ja, volop geïntegreerd', value: 'ja' },
    ],
  },
];

export function AIScanner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');

  const handleOptionClick = async (value: string) => {
    const newAnswers = { ...answers, [step + 1]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // All questions answered, start AI analysis
      await startAnalysis(newAnswers);
    }
  };

  const startAnalysis = async (finalAnswers: Record<number, string>) => {
    setIsAnalyzing(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;
        setStreamingText(fullText);
      }

      setResult(fullText);
    } catch (error) {
      console.error('Analysis error:', error);
      setResult(
        'Er is iets misgegaan bij de analyse. Probeer het later opnieuw of neem direct contact op.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setStreamingText('');
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-orange-500" size={20} />
          <span className="font-bold text-white tracking-wide">
            AI IMPACT QUICK-SCAN
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono">V 2.0</div>
      </div>

      <div className="min-h-[350px] flex flex-col justify-center">
        {/* Questions */}
        {!isAnalyzing && !result && step < questions.length && (
          <div className="animate-fade-in-up">
            <div className="text-xs text-orange-400 font-bold mb-2 uppercase">
              Vraag {step + 1} van {questions.length}
            </div>
            <h3 className="text-2xl font-bold text-white mb-8">
              {questions[step].question}
            </h3>
            <div className="space-y-3">
              {questions[step].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt.value)}
                  className="w-full text-left p-4 rounded-xl bg-slate-700 hover:bg-orange-600 transition-all duration-300 border border-slate-600 hover:border-orange-500 group flex justify-between items-center"
                >
                  <span className="font-medium text-slate-200 group-hover:text-white">
                    {opt.label}
                  </span>
                  <ArrowRight
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">
              AI Analyseren...
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Strategische patronen herkennen
            </p>

            {/* Live streaming preview */}
            {streamingText && (
              <div className="text-left bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-slate-300 text-sm whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse" />
                </p>
              </div>
            )}

            <div className="mt-6 space-y-2 max-w-xs mx-auto">
              <div className="h-1 bg-slate-700 rounded-full w-full overflow-hidden">
                <div className="h-full bg-orange-500 w-2/3 animate-shimmer" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Data</span>
                <span>Impact</span>
                <span>Tech</span>
              </div>
            </div>
          </div>
        )}

        {/* Result State */}
        {result && !isAnalyzing && (
          <div className="animate-fade-in-up text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                <CheckCircle size={12} /> Analyse Compleet
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 max-h-52 overflow-y-auto">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {result}
              </p>
            </div>

            {/* Enhanced CTA Section */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-orange-300 text-sm font-medium mb-2">
                Op basis van jouw profiel heb ik 3 concrete AI-kansen klaarstaan.
              </p>
              <p className="text-slate-400 text-xs">
                Plan een vrijblijvend gesprek van 15 minuten om deze door te nemen.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                asChild
                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-semibold"
              >
                <Link href="/#contact" className="flex items-center justify-center gap-2">
                  <Cpu size={16} />
                  Bekijk mijn AI-kansen
                </Link>
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700 text-slate-400"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
