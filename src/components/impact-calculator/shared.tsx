'use client';

// Gedeelde bouwstenen van de Impact Calculator (welzijn- én ondernemersvariant).

export function fmtN(n: number): string {
  return Math.round(n).toLocaleString('nl-NL');
}

export function fmtEuro(n: number): string {
  const rounded = n >= 100000 ? Math.round(n / 1000) * 1000 : Math.round(n / 500) * 500;
  return `€ ${rounded.toLocaleString('nl-NL')}`;
}

export function fmtRatio(n: number): string {
  return n.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

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

export function ImpactSlider({ label, value, min, max, step, display, sublabel, benchmark, onChange }: SliderProps) {
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
          aria-label={label}
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

interface ResultCardProps {
  label: string;
  value: string;
  sub: string;
  detail: string;
}

export function ResultCard({ label, value, sub, detail }: ResultCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col h-full">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-4xl font-bold text-slate-900 leading-none mb-2 tabular-nums">{value}</p>
      <p className="text-sm font-medium text-slate-700 mb-3 leading-snug">{sub}</p>
      <p className="text-xs text-slate-500 leading-relaxed mt-auto">{detail}</p>
    </div>
  );
}
