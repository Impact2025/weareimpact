/**
 * AI-scan — gedeelde config (single source of truth).
 *
 * Zowel de streaming-analyse (/api/ai-scan) als het e-mailrapport
 * (/api/ai-scan/report) gebruiken deze data. Ook de server-side validatie
 * leunt op de VALID_* sets zodat gemanipuleerde requests worden geweigerd.
 */

export const VALID_SECTORS = ['zorg', 'overheid', 'mkb', 'nonprofit'] as const;
export const VALID_AI_USAGE = ['nee', 'beetje', 'ja'] as const;

export const VALID_CHALLENGES = [
  // zorg
  'administratie', 'subsidies', 'roosters', 'personeel',
  // overheid
  'bureaucratie', 'begroting', 'legacy', 'vergrijzing',
  // mkb
  'brandjes', 'cashflow', 'handmatig',
  // nonprofit
  'capaciteit', 'drukte', 'vrijwilligers',
] as const;

export type Sector = (typeof VALID_SECTORS)[number];
export type AiUsage = (typeof VALID_AI_USAGE)[number];

export const SECTOR_NAMES: Record<string, string> = {
  zorg: 'Zorg & Welzijn',
  overheid: 'Onderwijs & Overheid',
  mkb: 'MKB / Commercieel',
  nonprofit: 'Non-profit / Stichting',
};

export const AI_MATURITY_MAP: Record<string, string> = {
  nee: 'nog geen concrete AI-ervaring (beginnersniveau)',
  beetje: 'experimenteert met tools zoals ChatGPT (verkennend)',
  ja: 'actief bezig met AI-implementatie (gevorderd)',
};

/** Vincents echte, sector-specifieke autoriteit (E-E-A-T in het advies). */
export const SECTOR_EXPERTISE: Record<string, string> = {
  zorg: `
Vincent's expertise in Zorg & Welzijn:
- Directeur van Stichting de Baan (sociale werkvoorziening)
- Coördineert 180 vrijwilligers en 700 deelnemers
- Heeft succesvol fondsen geworven voor vastgoed en verduurzaming
- Begrijpt de spanning tussen administratiedruk en cliënttijd
- Weet hoe je met beperkte middelen maximale impact creëert`,

  overheid: `
Vincent's expertise in Onderwijs & Overheid:
- Ervaring met complexe stakeholder-landschappen
- Snapt de spanning tussen beleidscycli en innovatie
- LEGO Serious Play facilitator voor strategische sessies
- Weet hoe je draagvlak creëert voor verandering
- Ervaring met publiek-private samenwerkingen`,

  mkb: `
Vincent's expertise voor MKB:
- Zelf ondernemer met meerdere ventures (DAAR, DatingAssistent, Bewaardvoorjou)
- Weet wat schaalbaarheid betekent met beperkte middelen
- AI-implementatie specialist die praktisch denkt
- Focus op ROI en directe tijdsbesparing
- Snapt de balans tussen operatie en groei`,

  nonprofit: `
Vincent's expertise voor Non-profit/Stichtingen:
- Zelf directeur van een stichting
- Expert in vrijwilligersmanagement (180+ vrijwilligers)
- Succesvol in fondsenwerving en subsidie-aanvragen
- Weet hoe je met kleine teams grote impact maakt
- Combineert sociaal hart met zakelijke daadkracht`,
};

/** Concrete AI-kansen per uitdaging (met kwantificering waar mogelijk). */
export const CHALLENGE_SOLUTIONS: Record<string, string> = {
  // Zorg & Welzijn
  administratie: 'AI kan 40-60% van rapportagetijd besparen door slimme templates, automatische samenvattingen en spraak-naar-tekst voor cliëntnotities.',
  subsidies: 'AI kan subsidie-scanners inzetten, automatisch conceptaanvragen genereren en de kans op toekenning voorspellen op basis van historische data.',
  roosters: 'AI kan roosters optimaliseren, no-shows voorspellen, en automatisch inspringen op acute situaties. Minder puzzelen, meer overzicht.',
  personeel: 'AI kan de onboarding van vrijwilligers versnellen, matching verbeteren, en signalen van uitval vroeg detecteren.',

  // Onderwijs & Overheid
  bureaucratie: 'AI kan vergaderingen automatisch samenvatten, actiepunten extraheren, en besluitvorming versnellen door relevante informatie proactief aan te bieden.',
  begroting: 'AI kan begrotingsscenario\'s doorrekenen, afwijkingen signaleren, en voorspellen waar budgetproblemen ontstaan.',
  legacy: 'AI kan als "vertaallaag" tussen systemen fungeren, data integreren zonder grote IT-projecten, en kennissilo\'s doorbreken.',
  vergrijzing: 'AI kan kennisbanken bouwen uit ervaring van vertrekkende medewerkers, interactieve overdracht faciliteren, en expertise doorzoekbaar maken.',

  // MKB
  brandjes: 'AI kan repetitieve taken automatiseren, prioriteiten voorstellen, en je agenda beschermen zodat je aan groei kunt werken.',
  cashflow: 'AI kan cashflowprognoses maken, factuurherinneringen automatiseren, en betalingsgedrag voorspellen.',
  handmatig: 'AI kan data-invoer automatiseren, documenten verwerken, en processen standaardiseren zonder dure maatwerksoftware.',

  // Non-profit
  capaciteit: 'AI kan als "extra teamlid" fungeren: e-mails beantwoorden, rapporten schrijven, social media beheren.',
  drukte: 'AI kan processen analyseren en direct de grootste tijdwinsten identificeren — focus op wat écht impact heeft.',
  vrijwilligers: 'AI kan matching verbeteren, communicatie personaliseren, en waardering automatisch inplannen op de juiste momenten.',
};

/** Leesbaar label per challenge-waarde (voor rapport/mail/CRM). */
export const CHALLENGE_LABELS: Record<string, string> = {
  administratie: 'Administratiedruk & Regels',
  subsidies: 'Subsidies & Fondsenwerving',
  roosters: 'Waan van de dag & Roosters',
  personeel: 'Vrijwilligers & Personeelsbehoud',
  bureaucratie: 'Vergadercultuur & Bureaucratie',
  begroting: 'Begrotingscycli & Verantwoording',
  legacy: 'Legacy-systemen & Eilandjes',
  vergrijzing: 'Kennisoverdracht & Vergrijzing',
  brandjes: 'Operationele brandjes',
  cashflow: 'Cashflow & Investeringsruimte',
  handmatig: 'Handmatig werk & Inefficiëntie',
  capaciteit: 'Alles zelf doen',
  drukte: 'Te druk om te verbeteren',
  vrijwilligers: 'Vrijwilligerscoördinatie',
};
