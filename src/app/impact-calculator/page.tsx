'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  TrendingUp,
  Users,
  Activity,
  CheckCircle,
  ArrowRight,
  Loader2,
  Mail,
  Building2,
  ChevronDown,
  BarChart3,
  Target,
  HeartHandshake,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- Rekenkern ---
const WERKUREN_PER_WEEK = 36;
const AI_REDUCTIEFACTOR = 0.40;
const GESPREKSDUUR_UUR = 1.5;
const WEKEN_PER_JAAR = 52;

interface CalcResults {
  weeklyHoursSaved: number;
  yearlyHoursSaved: number;
  extraContactsPerWeek: number;
  extraContactsPerMonth: number;
  grossSavingsPerYear: number;
  hoursPerFTE: number;
  burnoutRange: string;
  currentAdminHoursPerWeek: number;
  savedAdminPct: number;
}

function calculate(fte: number, adminPct: number, aiPct: number, uurloon: number): CalcResults {
  const remainingPotential = 1 - aiPct / 100;
  const currentAdminHoursPerWeek = fte * WERKUREN_PER_WEEK * (adminPct / 100);
  const weeklyHoursSaved = currentAdminHoursPerWeek * AI_REDUCTIEFACTOR * remainingPotential;
  const yearlyHoursSaved = weeklyHoursSaved * WEKEN_PER_JAAR;
  const extraContactsPerWeek = weeklyHoursSaved / GESPREKSDUUR_UUR;
  const extraContactsPerMonth = extraContactsPerWeek * (WEKEN_PER_JAAR / 12);
  const grossSavingsPerYear = yearlyHoursSaved * uurloon;
  const hoursPerFTE = fte > 0 ? weeklyHoursSaved / fte : 0;
  const burnoutRange = adminPct >= 45 ? '18–22%' : adminPct >= 35 ? '15–19%' : '12–16%';
  const totalTeamHours = fte * WERKUREN_PER_WEEK;
  const savedAdminPct = totalTeamHours > 0 ? (weeklyHoursSaved / totalTeamHours) * 100 : 0;
  return {
    weeklyHoursSaved,
    yearlyHoursSaved,
    extraContactsPerWeek,
    extraContactsPerMonth,
    grossSavingsPerYear,
    hoursPerFTE,
    burnoutRange,
    currentAdminHoursPerWeek,
    savedAdminPct,
  };
}

function fmtN(n: number): string {
  return Math.round(n).toLocaleString('nl-NL');
}

function fmtEuro(n: number): string {
  if (n >= 100000) return `€ ${Math.round(n / 1000)}k`;
  const rounded = Math.round(n / 500) * 500;
  return `€ ${rounded.toLocaleString('nl-NL')}`;
}

// --- Slider ---
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  sublabel: string;
  benchmark?: { value: number; label: string };
  onChange: (v: number) => void;
}

function ImpactSlider({ label, value, min, max, step, display, sublabel, benchmark, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const benchmarkPct = benchmark ? ((benchmark.value - min) / (max - min)) * 100 : null;
  return (
    <div className="mb-7 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-2xl font-bold text-orange-600 tabular-nums leading-none">{display}</span>
      </div>
      <p className="text-xs text-slate-400 mb-3 leading-tight">{sublabel}</p>
      <div className="relative pt-1 pb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="impact-slider w-full"
          style={{ backgroundSize: `${pct}% 100%` }}
        />
        {benchmarkPct !== null && (
          <div
            className="absolute top-0 flex flex-col items-center pointer-events-none"
            style={{ left: `calc(${benchmarkPct}% - 1px)` }}
          >
            <div className="w-0.5 h-3 bg-slate-400/70 rounded-full mt-1" />
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap">
              {benchmark!.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Resultaat kaart ---
interface ResultCardProps {
  label: string;
  value: string;
  sub: string;
  detail: string;
}

function ResultCard({ label, value, sub, detail }: ResultCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col h-full">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-4xl font-bold text-slate-900 leading-none mb-2 tabular-nums">{value}</p>
      <p className="text-sm font-medium text-slate-700 mb-3 leading-snug">{sub}</p>
      <p className="text-xs text-slate-500 leading-relaxed mt-auto">{detail}</p>
    </div>
  );
}

// --- Hoofd pagina ---
export default function ImpactCalculatorPage() {
  const [fte, setFte] = useState(30);
  const [adminPct, setAdminPct] = useState(40);
  const [aiPct, setAiPct] = useState(10);
  const [uurloon, setUurloon] = useState(35);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [email, setEmail] = useState('');
  const [naam, setNaam] = useState('');
  const [organisatie, setOrganisatie] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const results = useMemo(
    () => calculate(fte, adminPct, aiPct, uurloon),
    [fte, adminPct, aiPct, uurloon]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setFormError('');
    try {
      const response = await fetch('/api/impact-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          naam,
          organisatie,
          inputs: { fte, adminPct, aiPct, uurloon },
          results: {
            weeklyHoursSaved: Math.round(results.weeklyHoursSaved),
            yearlyHoursSaved: Math.round(results.yearlyHoursSaved),
            extraContactsPerMonth: Math.round(results.extraContactsPerMonth),
            grossSavingsPerYear: Math.round(results.grossSavingsPerYear),
            hoursPerFTE: Math.round(results.hoursPerFTE * 10) / 10,
            burnoutRange: results.burnoutRange,
          },
        }),
      });
      if (!response.ok) throw new Error('failed');
      setIsSuccess(true);
    } catch {
      setFormError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8 hover:border-orange-200 transition-colors cursor-default">
            <span className="font-bold text-slate-900">Impact Calculator</span>
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            <span className="text-slate-600 font-medium tracking-wide uppercase text-xs">
              2 minuten
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Hoeveel waarde laat<br className="hidden md:block" />
            <span className="text-gradient"> jouw organisatie liggen?</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Bereken hoeveel uren, cliëntgesprekken en budgetruimte AI kan vrijmaken voor jouw welzijnsteam.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-lg shadow-orange-500/20 flex items-center gap-2"
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Bereken mijn impact
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </header>

      {/* ── Calculator + Live resultaten ── */}
      <section id="calculator" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Tijdwinst Checker
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Stel jouw situatie in
            </h2>
            <p className="text-lg text-slate-500 font-light max-w-xl mx-auto">
              Verschuif de sliders — de impact wordt direct berekend.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* ── Sliders ── */}
            <div className="bg-slate-50 rounded-3xl p-8 xl:p-10 border border-slate-100">
              <ImpactSlider
                label="Teamomvang (FTE)"
                value={fte}
                min={5}
                max={300}
                step={5}
                display={`${fte} medewerkers`}
                sublabel="Hoeveel zorgprofessionals / sociaal werkers werken er in jouw team?"
                onChange={(v) => { setFte(v); setHasInteracted(true); }}
              />
              <ImpactSlider
                label="Administratiedruk"
                value={adminPct}
                min={15}
                max={70}
                step={5}
                display={`${adminPct}% van werkdag`}
                sublabel="Welk deel van de dag gaat op aan verslaglegging en rapportages?"
                benchmark={{ value: 40, label: 'Sectorgemiddelde' }}
                onChange={(v) => { setAdminPct(v); setHasInteracted(true); }}
              />
              <ImpactSlider
                label="Huidige AI-adoptie"
                value={aiPct}
                min={0}
                max={80}
                step={5}
                display={`${aiPct}% in gebruik`}
                sublabel="Hoeveel AI-tooling zet je team nu al in voor administratieve taken?"
                benchmark={{ value: 15, label: 'Gem. welzijn 2026' }}
                onChange={(v) => { setAiPct(v); setHasInteracted(true); }}
              />
              <ImpactSlider
                label="Kosten per medewerker"
                value={uurloon}
                min={22}
                max={65}
                step={1}
                display={`€ ${uurloon} /uur`}
                sublabel="Gemiddeld all-in uurloon inclusief werkgeverslasten."
                onChange={(v) => { setUurloon(v); setHasInteracted(true); }}
              />

              <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Methode:</span> Voice-to-Report en procesautomatisering reduceren de administratielast met{' '}
                  <strong className="text-orange-600">30–50%</strong>. Deze calculator hanteert een conservatieve{' '}
                  <strong className="text-orange-600">40% reductiefactor</strong> op de niet-geautomatiseerde tijd.
                </p>
              </div>
            </div>

            {/* ── Primair resultaat ── */}
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 rounded-3xl p-8 xl:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tijdwinst per week</span>
                  </div>
                  <p className="text-7xl xl:text-8xl font-bold text-white leading-none tabular-nums">
                    {fmtN(results.weeklyHoursSaved)}
                  </p>
                  <p className="text-2xl font-medium text-orange-400 mt-1 mb-4">uur per week</p>
                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    Gemiddeld <strong className="text-white font-medium">{Math.round(results.hoursPerFTE * 10) / 10} uur per medewerker</strong> per week die vrij komt voor echt cliëntcontact — zonder extra personeel.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <HeartHandshake className="w-4 h-4 text-orange-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliëntcontact</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600 tabular-nums leading-none mb-1">
                    +{fmtN(results.extraContactsPerMonth)}
                  </p>
                  <p className="text-xs font-medium text-slate-600">extra gesprekken per maand</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financieel</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 tabular-nums leading-none mb-1">
                    {fmtEuro(results.grossSavingsPerYear)}
                  </p>
                  <p className="text-xs font-medium text-slate-600">operationele waarde per jaar</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-violet-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Werkdruk</span>
                  </div>
                  <p className="text-3xl font-bold text-violet-600 tabular-nums leading-none mb-1">
                    {results.burnoutRange}
                  </p>
                  <p className="text-xs font-medium text-slate-600">verwachte daling burn-out</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Per jaar</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-800 tabular-nums leading-none mb-1">
                    {fmtN(results.yearlyHoursSaved)}
                  </p>
                  <p className="text-xs font-medium text-slate-600">uur teruggewonnen /jaar</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium text-base transition-all flex items-center justify-center gap-2"
                onClick={() => document.getElementById('rapport')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ontvang mijn persoonlijk Impact Rapport
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Volledig resultaten dashboard ── */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Impact Dashboard
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Drie dimensies van impact
            </h2>
            <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
              Jouw {fte}-koppig team genereert deze waarde wanneer AI-ondersteunde verslaglegging volledig is ingevoerd.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ResultCard
              label="De menselijke factor"
              value={`${fmtN(results.weeklyHoursSaved)} uur`}
              sub="per week terug voor echt contact"
              detail={`Gelijk aan ${fmtN(results.extraContactsPerMonth)} extra huisbezoeken per maand — zonder de werkdruk te verhogen of extra personeel aan te trekken.`}
            />
            <ResultCard
              label="De businesscase"
              value={fmtEuro(results.grossSavingsPerYear)}
              sub="operationele optimalisatie per jaar"
              detail={`${fmtN(results.yearlyHoursSaved)} uur 'waste' per jaar die direct herbelegd kan worden in preventieve programma's, kwaliteitsverbetering of verlaging van de werkdruk.`}
            />
            <ResultCard
              label="De preventiebonus"
              value={results.burnoutRange}
              sub="verwachte daling in burn-out risico"
              detail="Door de cognitieve belasting van rapportages te verlagen verbetert de mentale belastbaarheid van medewerkers — hogere retentie van kostbaar vakpersoneel."
            />
          </div>

          {/* Progressie-balk */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Werkweekverdeling — voor vs. na AI-implementatie
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-3">Huidige situatie</p>
                <div className="flex rounded-xl overflow-hidden h-10 mb-2">
                  <div
                    className="bg-red-100 flex items-center justify-center text-xs font-medium text-red-600 transition-all duration-500"
                    style={{ width: `${adminPct}%` }}
                  >
                    {adminPct >= 15 ? `${adminPct}%` : ''}
                  </div>
                  <div
                    className="bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700 transition-all duration-500"
                    style={{ width: `${100 - adminPct}%` }}
                  >
                    {100 - adminPct >= 15 ? `${100 - adminPct}%` : ''}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Admin / rapportage</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 inline-block" /> Cliëntcontact & overig</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-3">Na AI-implementatie</p>
                <div className="flex rounded-xl overflow-hidden h-10 mb-2">
                  <div
                    className="bg-red-100 flex items-center justify-center text-xs font-medium text-red-600 transition-all duration-500"
                    style={{ width: `${Math.max(adminPct - results.savedAdminPct, 0)}%` }}
                  >
                    {adminPct - results.savedAdminPct >= 15 ? `${Math.round(adminPct - results.savedAdminPct)}%` : ''}
                  </div>
                  <div
                    className="bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-700 transition-all duration-500"
                    style={{ width: `${results.savedAdminPct}%` }}
                  >
                    {results.savedAdminPct >= 8 ? `+${Math.round(results.savedAdminPct)}%` : ''}
                  </div>
                  <div
                    className="bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700 transition-all duration-500"
                    style={{ width: `${100 - adminPct}%` }}
                  >
                    {100 - adminPct >= 15 ? `${100 - adminPct}%` : ''}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Resterende admin</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 inline-block" /> Vrijgekomen tijd</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 inline-block" /> Cliëntcontact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-24 bg-[#1e293b] text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-slate-800 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                Uit de praktijk
              </div>
              <blockquote className="text-2xl font-light leading-relaxed text-white mb-6 italic">
                &ldquo;Sinds we AI inzetten voor verslaglegging, zie ik mijn team weer{' '}
                <strong className="font-medium not-italic">met een glimlach bij cliënten</strong>{' '}
                vandaan komen. Het voelt alsof we een extra collega hebben aangenomen.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center font-bold text-lg">M</div>
                <div>
                  <p className="font-medium">Directeur Welzijnsorganisatie</p>
                  <p className="text-slate-400 text-sm">40 medewerkers, regio Utrecht</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '5,2 uur', label: 'teruggewonnen per medewerker/week', color: 'text-orange-400' },
                { value: '€ 180k', label: 'operationele waarde per jaar (team van 25)', color: 'text-emerald-400' },
                { value: '0%', label: 'extra personeel nodig', color: 'text-blue-400' },
                { value: '4–6 wk', label: 'implementatietijd', color: 'text-violet-400' },
              ].map(({ value, label, color }) => (
                <div key={label} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                  <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
                  <p className="text-xs text-slate-400 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe realiseren wij dit? ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              De aanpak
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Hoe realiseren wij dit?
            </h2>
            <p className="text-lg text-slate-500 font-light max-w-xl mx-auto">
              Drie concrete interventies die samen de tijdwinst opleveren.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            {[
              {
                step: '01',
                icon: MessageSquare,
                title: 'Voice-to-Report',
                desc: 'Medewerkers spreken hun rapportage in tijdens of direct na het gesprek. AI structureert en schrijft de notitie — review kost 2 minuten in plaats van 20.',
                gain: '60–80% minder rapportagetijd',
              },
              {
                step: '02',
                icon: Users,
                title: 'Slimme Intakeprocessen',
                desc: 'Digitale voorbereiding op basis van cliëntdata. Medewerkers komen voorbereid aan tafel in plaats van informatie tijdens het gesprek op te tekenen.',
                gain: '30% minder voorbereiding',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Automatische Signalering',
                desc: "AI detecteert patronen in cliëntdata en signaleert risico's proactief. Minder 'brandje blussen', meer preventieve begeleiding.",
                gain: '25% meer preventieve impact',
              },
            ].map(({ step, icon: Icon, title, desc, gain }) => (
              <div
                key={step}
                className="group relative bg-white rounded-3xl p-10 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                <span className="absolute -bottom-4 right-6 text-9xl font-bold text-slate-50 select-none leading-none">
                  {step}
                </span>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest">
                      {step}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{title}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 text-[0.925rem] max-w-3xl font-light">{desc}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700">
                    <CheckCircle size={15} className="text-orange-500 shrink-0" />
                    <span className="font-medium">{gain}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead capture ── */}
      <section id="rapport" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
            {!hasInteracted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Stel eerst jouw situatie in</h3>
                <p className="text-slate-500 font-light mb-8 max-w-sm mx-auto">
                  Pas de sliders aan op jouw team om een persoonlijk Impact Rapport te ontvangen.
                </p>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-4 font-medium transition-all flex items-center gap-2 mx-auto"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ga naar de calculator
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Rapport onderweg</h3>
                <p className="text-slate-600 mb-2 font-light">
                  Je persoonlijk Impact Rapport — inclusief jouw berekende tijdwinst, cliëntimpact en ROI — is verzonden naar <strong className="font-medium">{email}</strong>.
                </p>
                <p className="text-sm text-slate-400 mb-8">Kijk ook even in je spam-map.</p>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left mb-6">
                  <p className="text-sm font-medium text-slate-800 mb-1">Volgende stap</p>
                  <p className="text-sm text-slate-500 font-light">
                    Wil je weten hoe we dit specifiek voor jouw organisatie realiseren? Plan een AI Readiness Gesprek van 30 minuten.
                  </p>
                </div>
                <Button
                  className="bg-slate-900 hover:bg-orange-600 text-white rounded-full px-8 py-4 font-medium transition-all flex items-center gap-2 mx-auto"
                  onClick={() => window.dispatchEvent(new CustomEvent('openBooking'))}
                >
                  Plan een gesprek
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    Persoonlijk Rapport
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    Ontvang jouw Impact Rapport
                  </h2>
                  <p className="text-slate-500 text-base leading-relaxed font-light">
                    Een volledig PDF-rapport op maat — met jouw berekende tijdwinst van{' '}
                    <strong className="text-orange-600 font-medium">{fmtN(results.weeklyHoursSaved)} uur/week</strong>,{' '}
                    <strong className="text-orange-600 font-medium">{fmtN(results.extraContactsPerMonth)} extra gesprekken/maand</strong>{' '}
                    en <strong className="text-orange-600 font-medium">{fmtEuro(results.grossSavingsPerYear)} ROI</strong> — klaar voor je bestuur.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Je e-mailadres *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 py-6 text-base rounded-xl border-slate-200 focus:border-orange-400"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Jouw naam (optioneel)"
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      className="pl-12 py-6 text-base rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Naam organisatie (optioneel)"
                      value={organisatie}
                      onChange={(e) => setOrganisatie(e.target.value)}
                      className="pl-12 py-6 text-base rounded-xl border-slate-200"
                    />
                  </div>

                  {formError && <p className="text-red-600 text-sm">{formError}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Rapport wordt samengesteld...
                      </>
                    ) : (
                      <>
                        Stuur mijn Impact Rapport
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Jouw gegevens zijn veilig. Geen spam — wel een waardevolle follow-up over AI in welzijn.
                  </p>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 gap-2">
                  {[
                    'Gepersonaliseerd rapport met jouw exacte berekeningen',
                    'Sectorvergelijking: hoe scoor jij vs. het gemiddelde?',
                    'Concreet implementatieplan voor Voice-to-Report',
                    'Uitnodiging voor gratis AI Readiness Scan + LEGO® Serious Play®',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-500">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Diensten CTA ── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">Klaar om te starten?</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Van rekentool naar realiteit
            </h2>
            <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
              Deze cijfers zijn een indicatie. Wil je weten hoe we dit specifiek voor jouw organisatie realiseren?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Target,
                title: 'AI Readiness Scan',
                desc: 'Volledig beeld van jouw AI-volwassenheid in één sessie. Met concreet actieplan voor implementatie.',
                href: '/#scan',
                cta: 'Plan de scan',
              },
              {
                icon: BarChart3,
                title: 'LEGO® Serious Play®',
                desc: 'Draagvlak bouwen voor AI-verandering. Van bestuurstafel tot werkvloer — hands-on strategie.',
                href: '/contact',
                cta: 'Meer informatie',
              },
              {
                icon: TrendingUp,
                title: 'Interim Begeleiding',
                desc: 'Van strategie naar uitvoering. Wij begeleiden de volledige AI-implementatie van A tot Z.',
                href: '/contact',
                cta: 'Gesprek plannen',
              },
            ].map(({ icon: Icon, title, desc, href, cta }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed font-light">{desc}</p>
                <Link
                  href={href}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          {/* Vincent CTA */}
          <div className="bg-slate-900 rounded-3xl p-10 md:p-12 text-white text-center">
            <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
              VM
            </div>
            <h3 className="text-xl font-bold mb-2">Vincent van Munster</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto font-light">
              10+ jaar ervaring in de sociale sector. Directeur van een organisatie met 700+ deelnemers en 180 vrijwilligers. Nu helpt hij organisaties AI echt te laten werken.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 rounded-full px-6 font-medium"
                asChild
              >
                <Link href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-2">
                  <Mail size={16} />
                  v.munster@weareimpact.nl
                </Link>
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 font-medium flex items-center gap-2"
                onClick={() => window.dispatchEvent(new CustomEvent('openBooking'))}
              >
                Plan een gesprek
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
