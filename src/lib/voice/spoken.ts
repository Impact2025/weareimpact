// Tijden en data zo opgeschreven dat een TTS-stem ze goed uitspreekt.

const HOURS = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];

/** Gesproken tijd, bv. "tien uur dertig" — voorkomt dat de stem "10:30" voorleest. */
export function spokenTime(d: Date): string {
  const p = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(d);
  const h = Number(p.find((x) => x.type === 'hour')!.value);
  const m = Number(p.find((x) => x.type === 'minute')!.value);
  const word = (hour: number) => HOURS[hour % 12];
  // Kantoortijden zijn 9-17: het dagdeel erbij maakt "half twee" ondubbelzinnig.
  const part = h < 6 ? " 's nachts" : h < 12 ? " 's ochtends" : h < 18 ? " 's middags" : " 's avonds";
  if (m === 0) return `${word(h)} uur${part}`;
  if (m === 30) return `half ${word(h + 1)}${part}`;
  if (m === 15) return `kwart over ${word(h)}${part}`;
  if (m === 45) return `kwart voor ${word(h + 1)}${part}`;
  return `${word(h)} uur ${m}${part}`;
}

export function spokenDate(d: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}
