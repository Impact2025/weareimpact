// Testgevallen voor de auteursdetectie van de publicatie-guard.
// Gebaseerd op echte teksten uit de blog en kennisbank.
const patterns = [
  /(?:[Dd]it (?:artikel|gastbericht) is )?[Gg]eschreven door\s+([A-Z][\wÀ-ÿ'’-]*(?:\s+(?:(?:van|de|der|den|het|ter|te)\s+)*[A-Z][\wÀ-ÿ'’-]*){0,3})/,
  /[Aa]uteur:\s*([A-Z][\wÀ-ÿ'’-]*(?:\s+(?:(?:van|de|der|den|het|ter|te)\s+)*[A-Z][\wÀ-ÿ'’-]*){0,3})/,
];
const allowed = ['vincent van munster', 'weareimpact'];

const cases = [
  // Moeten worden gevangen: verzonnen personen.
  ['Dit gastbericht is geschreven door Marije van Dijk, programmaleider data-ethiek', 'Marije van Dijk'],
  ['Dit artikel is geschreven door Jeroen van der Meer, senior AI-adviseur', 'Jeroen van der Meer'],
  ['Auteur: Redactie WeAreImpact | Publicatiedatum', 'Redactie WeAreImpact'],
  // Mogen NIET worden gevangen: toegestane auteurs, ook als er tekst achteraan komt.
  ['Dit artikel is geschreven door Vincent van Munster en wordt periodiek bijgewerkt', null],
  ['geschreven door WeAreImpact. Wil je weten wat wij doen?', null],
  ['is geschreven door WeAreImpact. We gebruiken uitsluitend eigen data', null],
  ['Auteur: Vincent van Munster | Publicatiedatum: 1 juni', null],
  // Naam loopt door in de kop die erop volgt; mag geen melding geven.
  ['Auteur: Vincent van Munster Hoe maak je impactmeting een gewoonte?', null],
  ['Dit artikel is geschreven door WeAreImpact Nieuwe inzichten', null],
];

let fails = 0;
for (const [text, expected] of cases) {
  let found = null;
  for (const p of patterns) {
    const m = text.match(p);
    if (!m) continue;
    const lower = m[1].trim().toLowerCase();
    const ok = allowed.some((a) => lower === a || lower.startsWith(a + ' '));
    if (!ok) { found = m[1].trim(); break; }
  }
  const ok = found === expected;
  if (!ok) fails++;
  console.log(`${ok ? 'OK  ' : 'FOUT'}  verwacht=${JSON.stringify(expected)} kreeg=${JSON.stringify(found)}`);
}
console.log(fails === 0 ? '\nAlle gevallen kloppen.' : `\n${fails} fout.`);
process.exit(fails === 0 ? 0 : 1);
