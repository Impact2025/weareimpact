'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, RefreshCw, CheckCircle, Calendar, ArrowLeft,
  Heart, Landmark, Briefcase, Users, Cpu,
  // Challenge icons
  ClipboardList, Coins, Flame, UserCheck,
  MessageSquare, PieChart, Layers, GraduationCap,
  AlertTriangle, Wallet, RotateCcw, Target,
  Theater, Dices, Clock, Handshake,
  // AI maturity icons
  Sprout, FlaskConical, Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface ScanOption {
  label: string;
  value: string;
  context: string;
  icon?: React.ReactNode;
}

interface SectorConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  challenges: ScanOption[];
  aiQuestion: string;
}

// Sector-specific configurations - "World Class" pijntaal
const SECTOR_CONFIG: Record<string, SectorConfig> = {
  zorg: {
    name: 'Zorg & Welzijn',
    icon: <Heart size={18} />,
    color: 'text-rose-400',
    aiQuestion: 'Hoe ver is jouw organisatie met AI?',
    challenges: [
      {
        label: 'Administratiedruk & Regels',
        value: 'administratie',
        context: 'Meer tijd kwijt aan papierwerk en verantwoording dan aan cliënten of innovatie.',
        icon: <ClipboardList size={20} className="text-rose-400" />,
      },
      {
        label: 'Subsidies & Fondsenwerving',
        value: 'subsidies',
        context: 'De ambities zijn er, maar aanvragen schrijven en middelen werven vreet tijd.',
        icon: <Coins size={20} className="text-rose-400" />,
      },
      {
        label: 'Waan van de dag & Roosters',
        value: 'roosters',
        context: 'Van crisis naar crisis. Geen ruimte om strategisch vooruit te kijken.',
        icon: <Flame size={20} className="text-rose-400" />,
      },
      {
        label: 'Vrijwilligers & Personeelsbehoud',
        value: 'personeel',
        context: 'Mensen vinden, binden en boeien — betaald én onbetaald — is een dagtaak.',
        icon: <UserCheck size={20} className="text-rose-400" />,
      },
    ],
  },
  overheid: {
    name: 'Onderwijs & Overheid',
    icon: <Landmark size={18} />,
    color: 'text-blue-400',
    aiQuestion: 'Hoe ver staat jullie organisatie met AI-adoptie?',
    challenges: [
      {
        label: 'Vergadercultuur & Bureaucratie',
        value: 'bureaucratie',
        context: 'Te veel overleg, te weinig uitvoering. Besluitvorming duurt eindeloos.',
        icon: <MessageSquare size={20} className="text-blue-400" />,
      },
      {
        label: 'Begrotingscycli & Verantwoording',
        value: 'begroting',
        context: 'Jaarlijks vechten om budget terwijl de wereld om je heen verandert.',
        icon: <PieChart size={20} className="text-blue-400" />,
      },
      {
        label: 'Legacy-systemen & Eilandjes',
        value: 'legacy',
        context: 'Afdelingen die niet samenwerken, systemen die niet praten.',
        icon: <Layers size={20} className="text-blue-400" />,
      },
      {
        label: 'Kennisoverdracht & Vergrijzing',
        value: 'vergrijzing',
        context: 'Ervaren mensen lopen de deur uit, kennis verdwijnt mee.',
        icon: <GraduationCap size={20} className="text-blue-400" />,
      },
    ],
  },
  mkb: {
    name: 'MKB / Commercieel',
    icon: <Briefcase size={18} />,
    color: 'text-emerald-400',
    aiQuestion: 'Waar staat jouw bedrijf qua AI?',
    challenges: [
      {
        label: 'Operationele brandjes',
        value: 'brandjes',
        context: 'Hele dag bezig met "vandaag", geen tijd voor groei en innovatie.',
        icon: <AlertTriangle size={20} className="text-emerald-400" />,
      },
      {
        label: 'Cashflow & Investeringsruimte',
        value: 'cashflow',
        context: 'Je wílt investeren in verbetering, maar het geld zit vast in de operatie.',
        icon: <Wallet size={20} className="text-emerald-400" />,
      },
      {
        label: 'Handmatig werk & Inefficiëntie',
        value: 'handmatig',
        context: 'Dezelfde dingen steeds opnieuw doen. Copy-paste is je tweede natuur.',
        icon: <RotateCcw size={20} className="text-emerald-400" />,
      },
      {
        label: 'Goed personeel vinden',
        value: 'personeel',
        context: 'Het juiste talent aantrekken en behouden is een constante strijd.',
        icon: <Target size={20} className="text-emerald-400" />,
      },
    ],
  },
  nonprofit: {
    name: 'Non-profit / Stichting',
    icon: <Users size={18} />,
    color: 'text-purple-400',
    aiQuestion: 'Gebruikt jullie organisatie al AI-tools?',
    challenges: [
      {
        label: 'Alles zelf doen',
        value: 'capaciteit',
        context: 'Kleine bezetting, grote ambities. Je bent directeur, secretaris én conciërge.',
        icon: <Theater size={20} className="text-purple-400" />,
      },
      {
        label: 'Subsidie-afhankelijkheid',
        value: 'subsidies',
        context: 'Elk jaar onzekerheid. Wordt de subsidie verlengd of niet?',
        icon: <Dices size={20} className="text-purple-400" />,
      },
      {
        label: 'Te druk om te verbeteren',
        value: 'drukte',
        context: 'Je weet dat het slimmer kan, maar wanneer dan? De agenda is vol.',
        icon: <Clock size={20} className="text-purple-400" />,
      },
      {
        label: 'Vrijwilligerscoördinatie',
        value: 'vrijwilligers',
        context: 'Mensen motiveren, roosteren en behouden — zonder salaris als lokmiddel.',
        icon: <Handshake size={20} className="text-purple-400" />,
      },
    ],
  },
};

// Sector selection options
const SECTORS: ScanOption[] = [
  {
    label: 'Zorg & Welzijn',
    value: 'zorg',
    context: 'Ziekenhuizen, GGZ, ouderenzorg, welzijnswerk, jeugdzorg',
    icon: <Heart size={18} className="text-rose-400" />,
  },
  {
    label: 'Onderwijs & Overheid',
    value: 'overheid',
    context: 'Gemeentes, provincies, scholen, universiteiten',
    icon: <Landmark size={18} className="text-blue-400" />,
  },
  {
    label: 'MKB / Commercieel',
    value: 'mkb',
    context: 'Bedrijven van 5 tot 250 medewerkers',
    icon: <Briefcase size={18} className="text-emerald-400" />,
  },
  {
    label: 'Non-profit / Stichting',
    value: 'nonprofit',
    context: 'Goede doelen, verenigingen, sociale ondernemingen',
    icon: <Users size={18} className="text-purple-400" />,
  },
];

// AI maturity options - same for all sectors but with better copy
const AI_MATURITY: ScanOption[] = [
  {
    label: 'Nog helemaal niet',
    value: 'nee',
    context: 'We hebben het er weleens over, maar concreet nog niets gedaan.',
    icon: <Sprout size={20} className="text-orange-400" />,
  },
  {
    label: 'We experimenteren',
    value: 'beetje',
    context: 'Sommige collega\'s gebruiken ChatGPT, maar het is niet gestructureerd.',
    icon: <FlaskConical size={20} className="text-orange-400" />,
  },
  {
    label: 'Actief mee bezig',
    value: 'ja',
    context: 'We hebben pilots gedraaid of tools geïmplementeerd.',
    icon: <Rocket size={20} className="text-orange-400" />,
  },
];

export function AIScanner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Get current sector config
  const sectorConfig = selectedSector ? SECTOR_CONFIG[selectedSector] : null;

  // Dynamic questions based on sector
  const getQuestions = () => {
    const baseQuestions = [
      {
        id: 1,
        question: 'In welke sector ben je actief?',
        subtext: 'We stemmen de analyse af op jouw specifieke context.',
        options: SECTORS,
      },
    ];

    if (selectedSector && sectorConfig) {
      baseQuestions.push({
        id: 2,
        question: 'Waar verlies je op dit moment de meeste energie?',
        subtext: 'Wees eerlijk — dit bepaalt de focus van het advies.',
        options: sectorConfig.challenges,
      });

      baseQuestions.push({
        id: 3,
        question: sectorConfig.aiQuestion,
        subtext: 'Geen goed of fout antwoord. We beginnen waar je staat.',
        options: AI_MATURITY,
      });
    }

    return baseQuestions;
  };

  const questions = getQuestions();
  const currentQuestion = questions[step];

  const handleOptionClick = async (value: string) => {
    const newAnswers = { ...answers, [step + 1]: value };
    setAnswers(newAnswers);

    // If this is the sector question, update selectedSector
    if (step === 0) {
      setSelectedSector(value);
    }

    if (step < 2) {
      setStep(step + 1);
    } else {
      // All questions answered, start AI analysis
      await startAnalysis(newAnswers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      // If going back from step 1, clear sector selection
      if (step === 1) {
        setSelectedSector(null);
      }
    }
  };

  const startAnalysis = async (finalAnswers: Record<number, string>) => {
    setIsAnalyzing(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/ai-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          sectorConfig: selectedSector ? {
            sector: selectedSector,
            sectorName: SECTOR_CONFIG[selectedSector].name,
            challengeLabel: SECTOR_CONFIG[selectedSector].challenges.find(
              c => c.value === finalAnswers[2]
            )?.label,
            challengeContext: SECTOR_CONFIG[selectedSector].challenges.find(
              c => c.value === finalAnswers[2]
            )?.context,
          } : null,
        }),
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
    setSelectedSector(null);
    setHoveredOption(null);
  };

  // Progress percentage
  const progress = ((step + 1) / 3) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Sparkles className="text-orange-500" size={20} />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide block">
              AI IMPACT SCAN
            </span>
            <span className="text-xs text-slate-500">Persoonlijk advies in 60 seconden</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedSector && sectorConfig && (
            <div className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-slate-800", sectorConfig.color)}>
              {sectorConfig.icon}
              <span>{sectorConfig.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!result && !isAnalyzing && (
        <div className="mb-6 relative z-10">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Vraag {step + 1} van 3</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="min-h-[380px] flex flex-col justify-center relative z-10">
        {/* Questions */}
        {!isAnalyzing && !result && currentQuestion && (
          <div className="animate-fade-in-up">
            {/* Back button */}
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                Vorige vraag
              </button>
            )}

            <h3 className="text-2xl font-bold text-white mb-2">
              {currentQuestion.question}
            </h3>
            <p className="text-slate-400 text-sm mb-8">
              {currentQuestion.subtext}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt.value)}
                  onMouseEnter={() => setHoveredOption(opt.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-300 border group",
                    "bg-slate-800/50 hover:bg-slate-700/80",
                    "border-slate-700/50 hover:border-orange-500/50",
                    hoveredOption === opt.value && "ring-1 ring-orange-500/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {opt.icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        {opt.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {opt.label}
                        </span>
                        <ArrowRight
                          size={18}
                          className="text-slate-600 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all flex-shrink-0"
                        />
                      </div>
                      <p className="text-sm text-slate-500 group-hover:text-slate-400 mt-1 transition-colors">
                        {opt.context}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="text-center animate-fade-in-up">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-orange-400/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Analyse wordt uitgevoerd...
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {selectedSector && sectorConfig ? (
                <>Specifieke kansen voor <span className={sectorConfig.color}>{sectorConfig.name}</span> identificeren</>
              ) : (
                'Strategische patronen herkennen'
              )}
            </p>

            {/* Live streaming preview */}
            {streamingText && (
              <div className="text-left bg-slate-900/80 rounded-xl p-5 max-h-48 overflow-y-auto border border-slate-700/50">
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {streamingText}
                  <span className="inline-block w-2 h-5 bg-orange-500 ml-1 animate-pulse rounded-sm" />
                </p>
              </div>
            )}

            {!streamingText && (
              <div className="space-y-3 max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span>Sectoranalyse laden...</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-orange-500/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span>AI-kansen identificeren...</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-orange-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span>Advies formuleren...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result State */}
        {result && !isAnalyzing && (
          <div className="animate-fade-in-up text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                <CheckCircle size={14} /> Analyse Compleet
              </div>
              {selectedSector && sectorConfig && (
                <div className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-slate-800/80", sectorConfig.color)}>
                  {sectorConfig.icon}
                  <span>{sectorConfig.name}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 rounded-xl p-6 mb-6 max-h-56 overflow-y-auto border border-slate-700/50">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {result}
              </p>
            </div>

            {/* Enhanced CTA Section */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/20 p-2 rounded-lg flex-shrink-0">
                  <Cpu className="text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-orange-200 font-medium mb-1">
                    3 concrete AI-kansen voor jouw situatie
                  </p>
                  <p className="text-slate-400 text-sm">
                    In een vrijblijvend gesprek van 15 minuten laat ik je zien hoe deze kansen
                    direct tijd of geld besparen in jouw {sectorConfig?.name.toLowerCase() || 'organisatie'}.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Open the chat widget with booking flow
                  window.dispatchEvent(new CustomEvent('openBooking'));
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg shadow-orange-500/20"
              >
                <Calendar size={16} />
                Plan een gesprek
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trust indicators */}
      {!isAnalyzing && !result && step === 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700/50 relative z-10">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              500+ scans uitgevoerd
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              100% privacy-first
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
