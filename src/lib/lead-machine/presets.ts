// Profielsjablonen en het standaard-klantprofiel. Client-veilig (geen server-imports).

// Standaard ideaal klantprofiel voor WeAreImpact. Profielen kunnen dit overschrijven.
export const DEFAULT_SCORING_CONTEXT = `WeAreImpact (Vincent van Munster) helpt organisaties in het sociaal domein met praktische AI en procesontlasting: minder administratie, meer tijd voor mensen. Aanbod: de Doorbraak Sprint (kort traject dat één knelpunt oplost), interim-advies en AI-implementatie.

Ideale klant: Nederlandse welzijnsorganisaties, maatschappelijke dienstverleners, vrijwilligerscentrales, zorgorganisaties (wijkzorg, VVT, GGZ, gehandicaptenzorg, jeugd) en gemeentelijke teams sociaal domein, met betaalde staf en merkbare werkdruk of administratielast.`;

export interface ProfilePreset {
  id: string;
  label: string;
  description: string;
  kind: 'search' | 'vacancy';
  name: string;
  query: string;
  scoringContext?: string;
  pitch?: string;
  minScore: number;
  cadence: 'daily' | 'weekly';
}

export const PROFILE_PRESETS: ProfilePreset[] = [
  {
    id: 'welzijn-regio',
    label: 'Welzijn in de regio',
    description: 'Organisaties zelf vinden: soort organisatie + plaats, rond Haarlemmermeer.',
    kind: 'search',
    name: 'Welzijn regio Haarlemmermeer',
    query: [
      'welzijnsorganisatie Hoofddorp',
      'stichting welzijn Haarlem',
      'maatschappelijke dienstverlening Leiden',
      'vrijwilligerscentrale Zaanstad',
      'buurtwerk stichting Amstelveen',
      'welzijn ouderen Heemstede',
    ].join('\n'),
    scoringContext: `${DEFAULT_SCORING_CONTEXT}

Regio: Haarlemmermeer en omgeving (grofweg 40 km rond Nieuw-Vennep: Haarlem, Zuid-Kennemerland, Amstelland, Amsterdam, Leiden, Zaanstreek). Een organisatie die duidelijk buiten deze regio werkt, scoort maximaal 4 — ook als ze verder perfect past.`,
    minScore: 6,
    cadence: 'weekly',
  },
  {
    id: 'signaal-digitalisering',
    label: 'Koopsignaal: vacatures digitalisering',
    description: 'Organisaties die nú iemand zoeken voor digitalisering, innovatie of informatiemanagement.',
    kind: 'vacancy',
    name: 'Signaal: digitalisering in het sociaal domein',
    query: [
      'vacature kwartiermaker digitalisering welzijnsorganisatie',
      'vacature informatiemanager welzijn',
      'vacature projectleider innovatie sociaal domein',
      'vacature adviseur digitale transformatie maatschappelijke dienstverlening',
      'vacature functioneel beheerder welzijnsorganisatie',
    ].join('\n'),
    minScore: 6,
    cadence: 'weekly',
  },
  {
    id: 'notariaat-voorstel',
    label: 'Procesversneller notariaat (voorstel)',
    description: 'Commercieel spoor uit het groeiplan: kantoren van 5-25 medewerkers. Aanbod nog niet vastgesteld — pas het aan vóór gebruik.',
    kind: 'search',
    name: 'Procesversneller notariaat',
    query: [
      'notariskantoor Haarlem',
      'notariskantoor Hoofddorp',
      'notariskantoor Amsterdam Zuid',
      'notariskantoor Leiden',
      'notariskantoor Alkmaar',
      'notariskantoor Amstelveen',
    ].join('\n'),
    scoringContext: `WeAreImpact (Vincent van Munster) versnelt processen met praktische AI: dossiervorming, intake, correspondentie en planning, met menselijke controle op alles wat de deur uitgaat.

Ideale klant: Nederlandse notariskantoren met 5-25 medewerkers (meerdere notarissen of kandidaat-notarissen, eigen secretariaat), met veel repeterend dossierwerk. Solo-notarissen en landelijke ketens passen minder.`,
    pitch: `De Procesversneller: in een korte analyse breng ik samen met jullie team in kaart waar dossierwerk blijft hangen (intake, stukken opvragen, correspondentie, planning), en in een sprint zetten we daar een werkende AI-ondersteuning voor neer. Niets gaat de deur uit zonder controle door jullie eigen mensen.`,
    minScore: 6,
    cadence: 'weekly',
  },
];
