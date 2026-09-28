// De server (Vercel) draait in UTC, maar alle afspraken, kantooruren en
// tijden in mails zijn Nederlandse tijd. Gebruik deze helpers in server-code
// in plaats van setHours/getHours/getDay of toLocale* zonder timeZone —
// die rekenen in de tijdzone van de server en zitten er dan 1-2 uur naast.

export const TIME_ZONE = 'Europe/Amsterdam';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

export type AmsterdamParts = {
  year: number;
  month: number; // 0-11, zoals Date
  day: number;
  weekday: number; // 0=zondag..6=zaterdag, zoals Date.getDay()
  hour: number;
  minute: number;
};

/** De kalenderdag en kloktijd van een moment, zoals een klok in Amsterdam die toont. */
export function amsterdamParts(date: Date): AmsterdamParts {
  const parts = partsFormatter.formatToParts(date);
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const year = pick('year');
  const month = pick('month') - 1;
  const day = pick('day');
  return {
    year,
    month,
    day,
    weekday: new Date(Date.UTC(year, month, day)).getUTCDay(),
    hour: pick('hour'),
    minute: pick('minute'),
  };
}

// Verschil tussen Amsterdamse kloktijd en UTC op dat moment, in ms (+1u of +2u).
function offsetMs(date: Date): number {
  const p = amsterdamParts(date);
  const asUtc = Date.UTC(p.year, p.month, p.day, p.hour, p.minute);
  return asUtc - Math.floor(date.getTime() / 60000) * 60000;
}

/**
 * Het moment waarop het in Amsterdam `year-month-day hour:minute` is.
 * `month` is 0-11; dag/maand mogen overlopen (dag 32 = volgende maand), net als Date.UTC.
 */
export function amsterdamDateTime(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const wallAsUtc = Date.UTC(year, month, day, hour, minute);
  let result = wallAsUtc - offsetMs(new Date(wallAsUtc));
  // Rond de zomertijdwissel kan de eerste schatting een uur verkeerd zitten.
  const corrected = wallAsUtc - offsetMs(new Date(result));
  if (corrected !== result) result = corrected;
  return new Date(result);
}

/** Middernacht (Amsterdam) van de dag waarin `date` valt, plus `addDays` dagen. */
export function amsterdamStartOfDay(date: Date, addDays = 0): Date {
  const p = amsterdamParts(date);
  return amsterdamDateTime(p.year, p.month, p.day + addDays);
}

/** YYYY-MM-DD van de Amsterdamse kalenderdag waarin `date` valt. */
export function amsterdamDateString(date: Date): string {
  const p = amsterdamParts(date);
  return `${p.year}-${String(p.month + 1).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
