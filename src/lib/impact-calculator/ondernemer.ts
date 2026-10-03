// Rekenkern van de Impact Calculator voor sociale en duurzame ondernemers.
// Gedeeld door de pagina, de API-route en de rapportmail, zodat de cijfers overal gelijk zijn.
//
// Bewust geen externe sectorcijfers: er is geen verifieerde bron voor "tijdwinst bij
// ondernemers". Alle factoren hieronder zijn eigen aannames en worden zo getoond.

export const SPRINT_PRIJS = 1750;          // vaste prijs AI Diagnose & Doorbraak Sprint, excl. btw
export const WERKWEKEN_PER_JAAR = 46;      // rekenjaar zonder vakantie en feestdagen
export const UREN_PER_DAGDEEL = 4;
export const UREN_PER_WERKDAG = 8;

// Aandeel van de tijd op het gekozen proces dat AI overneemt (menselijke controle blijft).
// Eén terugkerend, afgebakend proces: 30–50%, midden 40% (gelijk aan de welzijnsvariant).
export const REDUCTIE = { laag: 0.3, midden: 0.4, hoog: 0.5 } as const;

export type ProcesId = 'intake' | 'offerte' | 'impact' | 'verslag' | 'anders';

export interface ProcesOptie {
  id: ProcesId;
  label: string;
  korteNaam: string;
  hint: string;
}

export const PROCESSEN: ProcesOptie[] = [
  {
    id: 'intake',
    label: 'Intake & vraagtriage',
    korteNaam: 'intake en vraagtriage',
    hint: 'Mails, formulieren en hulpvragen lezen, sorteren en doorzetten.',
  },
  {
    id: 'offerte',
    label: 'Offertes & opvolging',
    korteNaam: 'offertes en opvolging',
    hint: 'Gespreksnotities uitwerken, offertes schrijven, leads opvolgen.',
  },
  {
    id: 'impact',
    label: 'Impact & subsidies',
    korteNaam: 'impact- en subsidieverantwoording',
    hint: "Bewijs, uren en KPI's verzamelen voor fondsen, gemeenten en subsidiegevers.",
  },
  {
    id: 'verslag',
    label: 'Verslagen & rapportage',
    korteNaam: 'verslagen en rapportage',
    hint: 'Notulen, voortgangsverslagen en terugkerende rapportages.',
  },
  {
    id: 'anders',
    label: 'Ander terugkerend proces',
    korteNaam: 'een terugkerend werkproces',
    hint: 'Elk proces met vaste stappen dat je elke week opnieuw doet.',
  },
];

export const ORGANISATIEGROOTTES = [
  { label: '1–2', fte: 2 },
  { label: '3–9', fte: 6 },
  { label: '10–25', fte: 18 },
  { label: '25+', fte: 40 },
] as const;

export interface OndernemerInputs {
  proces: ProcesId;
  urenPerWeek: number;      // totaal door het team aan dit ene proces
  uurwaarde: number;        // wat een uur van het team waard is (€)
  toolkostenPerMaand: number;
  fte: number;              // alleen voor het rapport en de opvolging, rekent niet mee
}

export interface OndernemerResults {
  weeklyHoursSaved: number;
  weeklyHoursSavedLaag: number;
  weeklyHoursSavedHoog: number;
  yearlyHoursSaved: number;
  grossSavingsPerYear: number;
  nettoPerYear: number;
  dagenPerJaar: number;
  dagdelenPerMaand: number;
  terugverdientijdWeken: number | null;
  terugverdientijdWekenLaag: number | null;
}

function terugverdientijd(urenPerWeekBespaard: number, uurwaarde: number, toolkostenPerMaand: number): number | null {
  const nettoPerWeek = urenPerWeekBespaard * uurwaarde - (toolkostenPerMaand * 12) / WERKWEKEN_PER_JAAR;
  return nettoPerWeek > 0 ? SPRINT_PRIJS / nettoPerWeek : null;
}

export function calculateOndernemer(i: OndernemerInputs): OndernemerResults {
  const weeklyHoursSaved = i.urenPerWeek * REDUCTIE.midden;
  const yearlyHoursSaved = weeklyHoursSaved * WERKWEKEN_PER_JAAR;
  const grossSavingsPerYear = yearlyHoursSaved * i.uurwaarde;
  const nettoPerYear = grossSavingsPerYear - i.toolkostenPerMaand * 12;

  return {
    weeklyHoursSaved,
    weeklyHoursSavedLaag: i.urenPerWeek * REDUCTIE.laag,
    weeklyHoursSavedHoog: i.urenPerWeek * REDUCTIE.hoog,
    yearlyHoursSaved,
    grossSavingsPerYear,
    nettoPerYear,
    dagenPerJaar: yearlyHoursSaved / UREN_PER_WERKDAG,
    dagdelenPerMaand: yearlyHoursSaved / 12 / UREN_PER_DAGDEEL,
    terugverdientijdWeken: terugverdientijd(weeklyHoursSaved, i.uurwaarde, i.toolkostenPerMaand),
    terugverdientijdWekenLaag: terugverdientijd(i.urenPerWeek * REDUCTIE.laag, i.uurwaarde, i.toolkostenPerMaand),
  };
}

export function procesLabel(id: string | undefined): string {
  return PROCESSEN.find((p) => p.id === id)?.korteNaam ?? 'een terugkerend werkproces';
}
