/**
 * AI-scan — gedeelde config (single source of truth).
 *
 * Zowel de streaming-analyse (/api/ai-scan) als het e-mailrapport
 * (/api/ai-scan/report) gebruiken deze data. Challenges zijn sector-gescoped:
 * label, context (pijntaal) én AI-oplossing horen bij een sector+challenge
 * combinatie. De server valideert altijd tegen deze sets en gebruikt
 * uitsluitend deze teksten in de LLM-prompt — client-input komt daar nooit in.
 */

export const VALID_SECTORS = ['zorg', 'overheid', 'mkb', 'nonprofit'] as const;
export const VALID_AI_USAGE = ['nee', 'beetje', 'ja'] as const;

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

export interface ChallengeInfo {
  /** Leesbaar label (voor rapport/mail/CRM). */
  label: string;
  /** De pijn in de woorden van de bezoeker (voedt de LLM-prompt). */
  context: string;
  /** Concrete AI-kans voor dit probleem (basis voor het advies). */
  solution: string;
}

/**
 * Challenges per sector. Dezelfde value (bijv. 'subsidies') mag in meerdere
 * sectoren bestaan met eigen label/context/oplossing.
 */
export const SECTOR_CHALLENGES: Record<Sector, Record<string, ChallengeInfo>> = {
  zorg: {
    administratie: {
      label: 'Administratiedruk & Regels',
      context: 'Meer tijd kwijt aan papierwerk en verantwoording dan aan cliënten of innovatie.',
      solution: 'AI kan 40-60% van rapportagetijd besparen door slimme templates, automatische samenvattingen en spraak-naar-tekst voor cliëntnotities.',
    },
    subsidies: {
      label: 'Subsidies & Fondsenwerving',
      context: 'De ambities zijn er, maar aanvragen schrijven en middelen werven vreet tijd.',
      solution: 'AI kan subsidie-scanners inzetten, automatisch conceptaanvragen genereren en de kans op toekenning voorspellen op basis van historische data.',
    },
    roosters: {
      label: 'Waan van de dag & Roosters',
      context: 'Van crisis naar crisis. Geen ruimte om strategisch vooruit te kijken.',
      solution: 'AI kan roosters optimaliseren, no-shows voorspellen, en automatisch inspringen op acute situaties. Minder puzzelen, meer overzicht.',
    },
    personeel: {
      label: 'Vrijwilligers & Personeelsbehoud',
      context: 'Mensen vinden, binden en boeien — betaald én onbetaald — is een dagtaak.',
      solution: 'AI kan de onboarding van vrijwilligers versnellen, matching verbeteren, en signalen van uitval vroeg detecteren.',
    },
  },
  overheid: {
    bureaucratie: {
      label: 'Vergadercultuur & Bureaucratie',
      context: 'Te veel overleg, te weinig uitvoering. Besluitvorming duurt eindeloos.',
      solution: 'AI kan vergaderingen automatisch samenvatten, actiepunten extraheren, en besluitvorming versnellen door relevante informatie proactief aan te bieden.',
    },
    begroting: {
      label: 'Begrotingscycli & Verantwoording',
      context: 'Jaarlijks vechten om budget terwijl de wereld om je heen verandert.',
      solution: 'AI kan begrotingsscenario\'s doorrekenen, afwijkingen signaleren, en voorspellen waar budgetproblemen ontstaan.',
    },
    legacy: {
      label: 'Legacy-systemen & Eilandjes',
      context: 'Afdelingen die niet samenwerken, systemen die niet praten.',
      solution: 'AI kan als "vertaallaag" tussen systemen fungeren, data integreren zonder grote IT-projecten, en kennissilo\'s doorbreken.',
    },
    vergrijzing: {
      label: 'Kennisoverdracht & Vergrijzing',
      context: 'Ervaren mensen lopen de deur uit, kennis verdwijnt mee.',
      solution: 'AI kan kennisbanken bouwen uit ervaring van vertrekkende medewerkers, interactieve overdracht faciliteren, en expertise doorzoekbaar maken.',
    },
  },
  mkb: {
    brandjes: {
      label: 'Operationele brandjes',
      context: 'Hele dag bezig met "vandaag", geen tijd voor groei en innovatie.',
      solution: 'AI kan repetitieve taken automatiseren, prioriteiten voorstellen, en je agenda beschermen zodat je aan groei kunt werken.',
    },
    cashflow: {
      label: 'Cashflow & Investeringsruimte',
      context: 'Je wílt investeren in verbetering, maar het geld zit vast in de operatie.',
      solution: 'AI kan cashflowprognoses maken, factuurherinneringen automatiseren, en betalingsgedrag voorspellen.',
    },
    handmatig: {
      label: 'Handmatig werk & Inefficiëntie',
      context: 'Dezelfde dingen steeds opnieuw doen. Copy-paste is je tweede natuur.',
      solution: 'AI kan data-invoer automatiseren, documenten verwerken, en processen standaardiseren zonder dure maatwerksoftware.',
    },
    talent: {
      label: 'Goed personeel vinden',
      context: 'Het juiste talent aantrekken en behouden is een constante strijd.',
      solution: 'AI kan vacatureteksten scherper maken, cv\'s voorselecteren, sneller reageren op kandidaten en onboarding versnellen — zodat je opvalt in een krappe arbeidsmarkt.',
    },
  },
  nonprofit: {
    capaciteit: {
      label: 'Alles zelf doen',
      context: 'Kleine bezetting, grote ambities. Je bent directeur, secretaris én conciërge.',
      solution: 'AI kan als "extra teamlid" fungeren: e-mails beantwoorden, rapporten schrijven, social media beheren.',
    },
    subsidies: {
      label: 'Subsidie-afhankelijkheid',
      context: 'Elk jaar onzekerheid. Wordt de subsidie verlengd of niet?',
      solution: 'AI kan het fondsenlandschap scannen, conceptaanvragen en verantwoordingen schrijven, en helpt inkomsten te spreiden zodat je minder afhankelijk wordt van één subsidieverstrekker.',
    },
    drukte: {
      label: 'Te druk om te verbeteren',
      context: 'Je weet dat het slimmer kan, maar wanneer dan? De agenda is vol.',
      solution: 'AI kan processen analyseren en direct de grootste tijdwinsten identificeren — focus op wat écht impact heeft.',
    },
    vrijwilligers: {
      label: 'Vrijwilligerscoördinatie',
      context: 'Mensen motiveren, roosteren en behouden — zonder salaris als lokmiddel.',
      solution: 'AI kan matching verbeteren, communicatie personaliseren, en waardering automatisch inplannen op de juiste momenten.',
    },
  },
};

/** Valideert de sector+challenge combinatie en geeft de bijbehorende info. */
export function getChallenge(sector: string, challenge: string): ChallengeInfo | null {
  if (!VALID_SECTORS.includes(sector as Sector)) return null;
  return SECTOR_CHALLENGES[sector as Sector][challenge] ?? null;
}

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
