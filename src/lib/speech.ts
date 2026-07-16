// Shared client-side speech helper for Iris.
//
// Fixes the "Iris klinkt als een man"-bug: the browser's default nl-NL voice is
// often male (e.g. Windows "Frank" / a default "Google Nederlands"). We never
// picked a specific voice, so the browser chose whatever came first. Here we
// explicitly prefer a Dutch *female* voice, with sensible fallbacks.
//
// getVoices() is frequently empty on first call — voices load asynchronously —
// so we cache and refresh on the `voiceschanged` event.

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
}

// Kick off voice loading as early as this module is imported on the client.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

// Names that are known-female Dutch voices across platforms/browsers.
// Ordered by preference (nicer voices first).
const FEMALE_NL_HINTS = [
  'fenna', // Windows NL female (Microsoft Fenna)
  'colette', // Windows NL female (Microsoft Colette)
  'lotte',
  'ellen',
  'saskia',
  'female',
  'vrouw',
];

// Male NL voices we explicitly want to avoid when a female one exists.
const MALE_NL_HINTS = ['frank', 'xander', 'male', 'man'];

/**
 * Pick the best available Dutch female voice, falling back to any Dutch voice,
 * then to null (browser default) if nothing Dutch is installed.
 */
export function pickDutchFemaleVoice(): SpeechSynthesisVoice | null {
  if (cachedVoices.length === 0) refreshVoices();

  const dutch = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith('nl'));
  if (dutch.length === 0) return null;

  // 1. Explicit female-name match, in preference order.
  for (const hint of FEMALE_NL_HINTS) {
    const match = dutch.find((v) => v.name.toLowerCase().includes(hint));
    if (match) return match;
  }

  // 2. Any Dutch voice that is NOT a known male voice.
  const notMale = dutch.find(
    (v) => !MALE_NL_HINTS.some((hint) => v.name.toLowerCase().includes(hint)),
  );
  if (notMale) return notMale;

  // 3. Last resort: first Dutch voice available.
  return dutch[0];
}

/**
 * Speak text as Iris with a consistent (female, Dutch) voice.
 * Strips basic markdown so it reads naturally.
 */
export function speakAsIris(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\n/g, '. ')
    .replace(/- /g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'nl-NL';
  utterance.rate = 1.05;
  utterance.pitch = 1.05; // Slightly higher — reads as clearly female.

  const voice = pickDutchFemaleVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}
