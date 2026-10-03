'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Hourglass,
  CalendarDays,
  Wallet,
  CheckCircle,
  ArrowRight,
  Loader2,
  Mail,
  Building2,
  ChevronDown,
  BarChart3,
  Lock,
  Users,
  ShieldCheck,
  Inbox,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fmtN, fmtEuro, ImpactSlider, ResultCard } from '@/components/impact-calculator/shared';
import {
  PROCESSEN,
  ORGANISATIEGROOTTES,
  REDUCTIE,
  SPRINT_PRIJS,
  WERKWEKEN_PER_JAAR,
  calculateOndernemer,
  type ProcesId,
} from '@/lib/impact-calculator/ondernemer';

function fmtUren(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString('nl-NL', { maximumFractionDigits: 1 });
}

function fmtTerugverdientijd(weken: number | null): string {
  if (weken === null) return 'niet';
  if (weken < 1) return '< 1 week';
  if (weken <= 20) return `${Math.round(weken)} ${Math.round(weken) === 1 ? 'week' : 'weken'}`;
  const maanden = Math.round(weken / 4.33);
  return `${maanden} maanden`;
}

const PROCES_CARDS = [
  {
    icon: Inbox,
    title: 'Intake en vraagtriage',
    desc: 'Mails en formulieren worden gelezen, gesorteerd en klaargezet als voorstel. Jij kijkt het na en verstuurt.',
  },
  {
    icon: FileText,
    title: 'Offertes en opvolging',
    desc: 'Gespreksnotities worden een klantdossier en een conceptofferte. Opvolging verwatert niet meer.',
  },
  {
    icon: ClipboardCheck,
    title: 'Impact en subsidies',
    desc: "Bewijs, uren en KPI's komen op één plek en worden een conceptverantwoording voor fondsen of gemeenten.",
  },
];

export default function SociaalOndernemerCalculatorPage() {
  const [proces, setProces] = useState<ProcesId>('intake');
  const [urenPerWeek, setUrenPerWeek] = useState(8);
  const [uurwaarde, setUurwaarde] = useState(60);
  const [toolkosten, setToolkosten] = useState(50);
  const [fte, setFte] = useState<number>(ORGANISATIEGROOTTES[1].fte);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [email, setEmail] = useState('');
  const [naam, setNaam] = useState('');
  const [organisatie, setOrganisatie] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setHasInteracted(true);
  };

  const inputs = useMemo(
    () => ({ proces, urenPerWeek, uurwaarde, toolkostenPerMaand: toolkosten, fte }),
    [proces, urenPerWeek, uurwaarde, toolkosten, fte]
  );
  const results = useMemo(() => calculateOndernemer(inputs), [inputs]);
  const gekozen = PROCESSEN.find((p) => p.id === proces)!;
  const urenNa = urenPerWeek - results.weeklyHoursSaved;
  const naPct = Math.max(100 - REDUCTIE.midden * 100, 0);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

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
          profiel: 'ondernemer',
          email,
          naam,
          organisatie,
          inputs: { ...inputs, investeringKosten: SPRINT_PRIJS },
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

  const lockedCards = [
    { icon: <Wallet className="w-4 h-4 text-emerald-600" />, label: 'Waarde', value: fmtEuro(results.grossSavingsPerYear), valueColor: 'text-emerald-600', sub: 'aan tijd per jaar' },
    { icon: <Hourglass className="w-4 h-4 text-orange-600" />, label: 'Terugverdiend', value: fmtTerugverdientijd(results.terugverdientijdWeken), valueColor: 'text-orange-600', sub: `na de Sprint van € ${fmtN(SPRINT_PRIJS)}` },
    { icon: <CalendarDays className="w-4 h-4 text-violet-600" />, label: 'Werkdagen', value: fmtUren(results.dagenPerJaar), valueColor: 'text-violet-600', sub: 'terug per jaar' },
    { icon: <BarChart3 className="w-4 h-4 text-slate-500" />, label: 'Dagdelen', value: fmtUren(results.dagdelenPerMaand), valueColor: 'text-slate-800', sub: 'vrij per maand' },
  ];

  return (
    <>
      {/* Hero */}
      <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-sm mb-8 cursor-default">
            <span className="font-bold text-slate-900">Voor ondernemers</span>
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            <span className="text-slate-600 font-medium tracking-wide uppercase text-xs">2 minuten</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Hoeveel uur per week
            <br className="hidden md:block" />
            <span className="text-gradient"> laat jouw proces liggen?</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-6 max-w-2xl mx-auto font-light leading-relaxed">
            Kies één terugkerend proces in jouw sociale of duurzame onderneming. Zie wat het jou kost aan uren en geld, en wanneer je de investering terugverdient.
          </p>
          <p className="text-sm text-slate-500 mb-10">
            Geen sectorcijfers die niet bij jou passen. Alleen jouw eigen uren en een eerlijk gemarkeerde aanname.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-all group shadow-lg shadow-orange-500/20 flex items-center gap-2"
              onClick={() => scrollTo('calculator')}
            >
              Bereken mijn tijdwinst
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-8">
            Werk je in een welzijnsorganisatie met een groter team?{' '}
            <Link href="/impact-calculator" className="text-orange-600 font-medium hover:text-orange-700 underline-offset-2 hover:underline">
              Ga naar de calculator voor welzijn
            </Link>
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </header>

      {/* Calculator */}
      <section id="calculator" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Tijdwinst Checker
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Stel jouw proces in</h2>
            <p className="text-lg text-slate-500 font-light max-w-xl mx-auto">
              Kies het proces en verschuif de sliders. De uitkomst wordt direct berekend.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Invoer */}
            <div className="bg-slate-50 rounded-3xl p-8 xl:p-10 border border-slate-100">
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Welk proces kost de meeste tijd?</p>
                <p className="text-xs text-slate-400 mb-3 leading-tight">Kies één terugkerend proces. {gekozen.hint}</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Proces">
                  {PROCESSEN.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={proces === p.id}
                      onClick={() => touch(setProces)(p.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        proces === p.id
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <ImpactSlider
                label="Uren per week"
                value={urenPerWeek}
                min={1}
                max={40}
                step={1}
                display={`${urenPerWeek} uur`}
                sublabel={`Hoeveel uur per week gaat er in totaal (met het hele team) naar ${gekozen.korteNaam}?`}
                onChange={touch(setUrenPerWeek)}
              />
              <ImpactSlider
                label="Waarde van een uur"
                value={uurwaarde}
                min={30}
                max={150}
                step={5}
                display={`€ ${uurwaarde} /uur`}
                sublabel="Je eigen uurtarief of de loonkosten per uur. Met vrijwilligers: wat een betaalde kracht zou kosten."
                onChange={touch(setUurwaarde)}
              />
              <ImpactSlider
                label="Toolkosten per maand"
                value={toolkosten}
                min={0}
                max={300}
                step={10}
                display={`€ ${toolkosten} /mnd`}
                sublabel="Abonnementen voor AI en koppelingen na de Sprint. Eigen inschatting, pas aan op wat jij verwacht."
                onChange={touch(setToolkosten)}
              />

              <div className="mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Grootte organisatie</p>
                <p className="text-xs text-slate-400 mb-3 leading-tight">Medewerkers inclusief jezelf. Dit gebruiken we alleen voor je rapport, het rekent niet mee.</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Grootte organisatie">
                  {ORGANISATIEGROOTTES.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      role="radio"
                      aria-checked={fte === g.fte}
                      onClick={() => touch(setFte)(g.fte)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        fte === g.fte
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Methode:</span> bij één afgebakend, terugkerend proces
                  neemt AI naar onze inschatting <strong className="text-orange-600">30 tot 50%</strong> van de tijd over.
                  We rekenen met <strong className="text-orange-600">40%</strong> en tonen de bandbreedte. Dit is een
                  aanname, geen gemeten resultaat, en een mens controleert elk resultaat.
                </p>
              </div>
            </div>

            {/* Resultaat */}
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
                    {fmtUren(results.weeklyHoursSaved)}
                  </p>
                  <p className="text-2xl font-medium text-orange-400 mt-1 mb-4">uur per week</p>
                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    Bandbreedte{' '}
                    <strong className="text-white font-medium">
                      {fmtUren(results.weeklyHoursSavedLaag)} tot {fmtUren(results.weeklyHoursSavedHoog)} uur
                    </strong>{' '}
                    per week bij {gekozen.korteNaam}. Tijd die je terugkrijgt voor je kernwerk, zonder extra mensen.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {lockedCards.map(({ icon, label, value, valueColor, sub }) =>
                  isSuccess ? (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span></div>
                      <p className={`text-3xl font-bold ${valueColor} tabular-nums leading-none mb-1`}>{value}</p>
                      <p className="text-xs font-medium text-slate-600">{sub}</p>
                    </div>
                  ) : (
                    <button
                      key={label}
                      onClick={() => scrollTo('rapport')}
                      className="bg-white rounded-2xl p-5 border border-slate-100 relative overflow-hidden text-left group hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="opacity-20">{icon}</span>
                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">{label}</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-200 tabular-nums leading-none mb-1 blur-sm select-none">{value}</p>
                      <p className="text-xs font-medium text-slate-200 blur-sm select-none">{sub}</p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-slate-200 shadow-sm group-hover:border-orange-300 group-hover:bg-orange-50 transition-colors">
                          <Lock className="w-3 h-3 text-slate-400 group-hover:text-orange-500" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-orange-600">Ontgrendel</span>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>

              <Button
                size="lg"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium text-base transition-all flex items-center justify-center gap-2"
                onClick={() => scrollTo('rapport')}
              >
                {isSuccess ? 'Bekijk jouw volledige rapport' : 'Ontgrendel waarde en terugverdientijd'}
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
        {!isSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FDFBF7]/75 backdrop-blur-[3px]">
            <div className="text-center max-w-sm mx-auto px-6">
              <div className="w-14 h-14 bg-white border border-orange-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Lock className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Volledig dashboard ontgrendelen</h3>
              <p className="text-slate-500 text-sm mb-6 font-light leading-relaxed">
                Waarde per jaar, terugverdientijd en de bandbreedte van jouw berekening. Gratis in je inbox.
              </p>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-3 font-medium flex items-center gap-2 mx-auto shadow-lg shadow-orange-500/25"
                onClick={() => scrollTo('rapport')}
              >
                Ontgrendel het dashboard
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
        <div className={!isSuccess ? 'blur-[2px] pointer-events-none select-none' : ''} aria-hidden={!isSuccess}>
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-14">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Jouw dashboard
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Wat dit proces jou oplevert</h2>
              <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
                Berekend voor {gekozen.korteNaam}, met {urenPerWeek} uur per week en € {uurwaarde} per uur.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <ResultCard
                label="Tijd terug"
                value={`${fmtN(results.yearlyHoursSaved)} uur`}
                sub="per jaar, gelijk aan"
                detail={`Ongeveer ${fmtUren(results.dagenPerJaar)} werkdagen of ${fmtUren(results.dagdelenPerMaand)} dagdelen per maand die je weer aan je kernwerk kunt besteden. Gerekend met ${WERKWEKEN_PER_JAAR} werkweken per jaar.`}
              />
              <ResultCard
                label="Wat het oplevert"
                value={fmtEuro(results.grossSavingsPerYear)}
                sub="aan tijd per jaar"
                detail={`Na ${fmtEuro(toolkosten * 12)} toolkosten per jaar blijft ${fmtEuro(results.nettoPerYear)} over. Dit is de waarde van de vrijgekomen tijd, geen extra omzet.`}
              />
              <ResultCard
                label="Terugverdientijd"
                value={fmtTerugverdientijd(results.terugverdientijdWeken)}
                sub={`voor de Sprint van € ${fmtN(SPRINT_PRIJS)}`}
                detail={
                  results.terugverdientijdWeken === null
                    ? 'Met deze invoer dekt de tijdwinst de toolkosten niet. Kies een proces met meer uren, of lagere toolkosten.'
                    : `Bij de voorzichtige variant (${Math.round(REDUCTIE.laag * 100)}% tijdwinst) is dat ${fmtTerugverdientijd(results.terugverdientijdWekenLaag)}. Vaste prijs excl. btw.`
                }
              />
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Dit proces per week, voor en na
              </h3>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-3">Nu: {fmtUren(urenPerWeek)} uur</p>
                  <div className="flex rounded-xl overflow-hidden h-10 mb-2">
                    <div className="bg-red-100 flex items-center justify-center text-xs font-medium text-red-600 w-full">
                      100%
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 rounded bg-red-100 inline-block" /> Handwerk
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-3">Na de Sprint: {fmtUren(urenNa)} uur</p>
                  <div className="flex rounded-xl overflow-hidden h-10 mb-2">
                    <div
                      className="bg-red-100 flex items-center justify-center text-xs font-medium text-red-600 transition-all duration-500"
                      style={{ width: `${naPct}%` }}
                    >
                      {Math.round(naPct)}%
                    </div>
                    <div
                      className="bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-700 transition-all duration-500"
                      style={{ width: `${100 - naPct}%` }}
                    >
                      {Math.round(100 - naPct)}%
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Blijft handwerk en controle</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 inline-block" /> Vrijgekomen tijd</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zo rekenen we */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Eerlijk gerekend
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Zo komt dit getal tot stand</h2>
            <p className="text-lg text-slate-500 font-light max-w-xl mx-auto">
              Geen zwarte doos. Dit zijn de aannames, zodat je zelf kunt beoordelen of ze bij jou passen.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Clock, title: 'Jouw uren, niet een sectorgemiddelde', desc: 'De uitkomst start bij wat jij invult. We zetten er geen benchmark naast die niet bij jouw onderneming past.' },
              { icon: BarChart3, title: '30 tot 50% is een aanname', desc: 'We rekenen met 40% van de tijd op één afgebakend proces en tonen de bandbreedte. Het werkelijke resultaat meten we pas in jouw situatie, na de Sprint.' },
              { icon: ShieldCheck, title: 'Een mens blijft controleren', desc: 'AI maakt het concept, jij beslist. Daarom nemen we nooit 100% van de tijd mee als besparing.' },
              { icon: Wallet, title: 'Terugverdientijd telt toolkosten mee', desc: `We trekken de maandelijkse toolkosten van de besparing af en rekenen met de vaste Sprintprijs van € ${fmtN(SPRINT_PRIJS)} excl. btw.` },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-slate-100">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processen */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Waar het meestal zit
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Drie processen die vaak tijd lekken</h2>
            <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
              In één dagdeel zet ik één van deze processen live in jouw eigen omgeving, met menselijke controle en 14 dagen nazorg.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PROCES_CARDS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section id="rapport" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-[#FDFBF7] rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
            {!hasInteracted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Stel eerst jouw proces in</h3>
                <p className="text-slate-500 font-light mb-8 max-w-sm mx-auto">
                  Pas de calculator aan op jouw situatie om een persoonlijk rapport te ontvangen.
                </p>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-4 font-medium transition-all flex items-center gap-2 mx-auto"
                  onClick={() => scrollTo('calculator')}
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
                  Je persoonlijke rapport met tijdwinst, waarde en terugverdientijd is verzonden naar{' '}
                  <strong className="font-medium">{email}</strong>.
                </p>
                <p className="text-sm text-slate-400 mb-8">Kijk ook even in je spam-map.</p>
                <div className="p-5 bg-white rounded-2xl border border-slate-100 text-left mb-6">
                  <p className="text-sm font-medium text-slate-800 mb-1">Volgende stap</p>
                  <p className="text-sm text-slate-500 font-light">
                    Plan een Fit &amp; Focus gesprek van 20 tot 30 minuten. We kiezen samen welk proces zich het beste leent voor de Sprint.
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
                    Persoonlijk rapport
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Ontvang jouw rapport</h2>
                  <p className="text-slate-500 text-base leading-relaxed font-light">
                    Jouw berekening voor {gekozen.korteNaam}:{' '}
                    <strong className="text-orange-600 font-medium">{fmtUren(results.weeklyHoursSaved)} uur per week</strong>, met
                    onderbouwing, bandbreedte en terugverdientijd, direct in je inbox.
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
                      className="pl-12 py-6 text-base rounded-xl border-slate-200 focus:border-orange-400 bg-white"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Jouw naam (optioneel)"
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      className="pl-12 py-6 text-base rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Naam onderneming (optioneel)"
                      value={organisatie}
                      onChange={(e) => setOrganisatie(e.target.value)}
                      className="pl-12 py-6 text-base rounded-xl border-slate-200 bg-white"
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
                        Stuur mijn rapport
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Je gegevens gebruik ik alleen voor dit rapport en een persoonlijke opvolging. Geen massamailing.
                  </p>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 gap-2">
                  {[
                    'Jouw berekening met alle aannames zichtbaar',
                    'Bandbreedte: voorzichtig, verwacht en optimistisch',
                    'Terugverdientijd inclusief toolkosten',
                    'Drie inzichten die bij jouw invoer horen en een voorstel voor de eerste stap',
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

      {/* CTA */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-slate-900 rounded-3xl p-10 md:p-12 text-white text-center">
            <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
              VM
            </div>
            <h3 className="text-xl font-bold mb-2">Vincent van Munster</h3>
            <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto font-light">
              Procesversneller voor sociale en duurzame ondernemers.
            </p>
            <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto font-light">
              Ik zet AI binnen een dagdeel aan het werk in jouw organisatie. Vaste prijs € {fmtN(SPRINT_PRIJS)} excl. btw, inclusief 14 dagen nazorg.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 rounded-full px-6 font-medium"
                asChild
              >
                <Link href="/doorbraak-sprint" className="flex items-center gap-2">
                  Bekijk de Doorbraak Sprint
                  <ArrowRight size={16} />
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
