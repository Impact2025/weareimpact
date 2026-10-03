import type { Metadata } from 'next';

// Inhoud van de "AI-projectmanager"-cluster: één pijlerpagina en zes
// ondersteunende pagina's met elk een eigen zoekintentie. Bewust geen
// verzonnen cijfers of bronnen: alleen bewijs dat Vincent zelf kan staven
// (Stichting de Baan, DAAR, het dossier-portaal, vaste tarieven).

export const BASE_URL = 'https://weareimpact.nl';

export interface AiPmFaq {
  question: string;
  answer: string;
}

export interface AiPmPage {
  slug: string;
  isPillar?: boolean;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  breadcrumb: string;
  eyebrow: string;
  h1a: string;
  h1b: string;
  lead: string;
  /** Direct antwoord van 40-60 woorden, bedoeld voor featured snippets en AI-antwoorden. */
  answer: { question: string; text: string };
  problemsTitle: string;
  problems: { title: string; text: string }[];
  approachTitle: string;
  approach: { title: string; text: string; result: string }[];
  faqs: AiPmFaq[];
  related: { title: string; href: string; description: string }[];
  ctaTitle: string;
  ctaText: string;
}

/** De zes fases die op de pijlerpagina staan; elders alleen verwijzing. */
export const PHASES = [
  {
    nr: '1',
    title: 'Probleem scherp',
    text: 'Eerst het knelpunt, dan pas de technologie. Ik praat met de werkvloer, meet hoeveel tijd het proces nu kost en leg vast wat "gelukt" betekent.',
  },
  {
    nr: '2',
    title: 'Randvoorwaarden',
    text: 'Eigenaar met mandaat, privacy en AVG geregeld, datakwaliteit getoetst, budget en go/no-go-criteria vooraf afgesproken.',
  },
  {
    nr: '3',
    title: 'Pilot van 4 tot 6 weken',
    text: 'Eén proces, één team, één meetbaar doel. Klein genoeg dat mislukken goedkoop is, echt genoeg dat je ervan leert.',
  },
  {
    nr: '4',
    title: 'Besluit: door, bijsturen of stoppen',
    text: 'Op basis van de nulmeting en de pilotresultaten. Stoppen is een geldige uitkomst en dat zeg ik hardop.',
  },
  {
    nr: '5',
    title: 'Opschalen naar productie',
    text: 'Beheer, monitoring, menselijke controle op de uitkomsten, scholing en documentatie, zodat het niet afhangt van één persoon.',
  },
  {
    nr: '6',
    title: 'Overdracht',
    text: 'Vanaf dag één ingebouwd: een vaste collega of team neemt het over. Ik ben pas klaar als jij mij niet meer nodig hebt.',
  },
];

const COMMON_RELATED = [
  {
    title: 'Wat doet een AI-projectmanager?',
    href: '/kennisbank/wat-doet-een-ai-projectmanager',
    description: 'De rol uitgelegd: wat hij of zij doet, en wat niet.',
  },
  {
    title: 'Wat kost een AI-projectmanager?',
    href: '/kennisbank/wat-kost-een-ai-projectmanager',
    description: 'Tarieven, uren en de verschillen tussen zzp, bureau en intern.',
  },
  {
    title: 'AI-implementatie in 6 fases',
    href: '/kennisbank/ai-implementatie-in-6-fases',
    description: 'Van knelpunt tot overdracht, met checklist per fase.',
  },
];

export const AI_PM_PAGES: AiPmPage[] = [
  // ───────────────────────── PIJLER ─────────────────────────
  {
    slug: 'ai-projectmanager',
    isPillar: true,
    metaTitle: 'AI-projectmanager inhuren | van pilot naar werkend resultaat',
    metaDescription:
      'Ik ben AI-projectmanager voor gemeenten, zorg en welzijn: ik breng AI-projecten van idee naar productie. Zichtbaar resultaat in 90 dagen, €125-140 per uur, geen bureau ertussen.',
    keywords: [
      'AI-projectmanager',
      'AI projectmanager inhuren',
      'AI-projectleider',
      'AI implementatie projectmanager',
      'AI project begeleiden',
      'projectmanager kunstmatige intelligentie',
      'AI pilot naar productie',
      'Vincent van Munster',
      'WeAreImpact',
    ],
    breadcrumb: 'AI-projectmanager',
    eyebrow: 'AI-projectmanager',
    h1a: 'AI-projecten die niet stranden',
    h1b: 'maar echt in productie komen.',
    lead: 'Een AI-projectmanager zorgt dat een AI-idee uitkomt bij een werkend proces: met een eigenaar, een meetbaar doel, geregelde privacy en een team dat het zelf kan voortzetten. Ik doe dat voor gemeenten, zorg- en welzijnsorganisaties.',
    answer: {
      question: 'Wat is een AI-projectmanager?',
      text: 'Een AI-projectmanager leidt een AI-project van probleem tot productie. Hij of zij verbindt techniek, mensen, privacy en budget, bewaakt dat de pilot meetbaar is, neemt het go/no-go-besluit mee en draagt het resultaat over aan de organisatie. De rol bestaat omdat de meeste AI-projecten niet op techniek, maar op regie stranden.',
    },
    problemsTitle: 'Waar AI-projecten in de praktijk misgaan',
    problems: [
      {
        title: 'De tool komt vóór het probleem',
        text: 'Iemand ziet een indrukwekkende demo, de licentie wordt gekocht en pas daarna gaat men op zoek naar een toepassing. Het resultaat is een pilot zonder eigenaar en zonder meetpunt.',
      },
      {
        title: 'Pilots die nooit productie halen',
        text: 'De pilot werkt, iedereen klapt, en dan stopt het. Niemand heeft beheer, scholing of budget voor de stap daarna geregeld. Opschalen is een ander project dan pilotten.',
      },
      {
        title: 'Privacy en regels als sluitpost',
        text: 'AVG, verwerkersovereenkomsten en de AI-verordening worden achteraf bekeken, op het moment dat het project al draait. Dan kost elke correctie weken.',
      },
      {
        title: 'Weerstand die niemand benoemt',
        text: 'Medewerkers die de nieuwe werkwijze omzeilen, omdat niemand hun zorgen serieus nam. Dat is geen techniekprobleem en je lost het niet op met een handleiding.',
      },
    ],
    approachTitle: 'Wat ik als AI-projectmanager doe',
    approach: [
      {
        title: 'Regie op het hele traject',
        text: 'Ik beheer scope, planning, risico\'s en stakeholders, en zorg dat leveranciers, IT, juristen en de werkvloer op dezelfde lijn zitten. Jij hoeft niet meer te schakelen tussen vijf partijen die elk een ander verhaal vertellen.',
        result: 'Eén aanspreekpunt en één waarheid over de stand van zaken.',
      },
      {
        title: 'Meetbaar vanaf dag één',
        text: 'Vóór de pilot start meten we wat het proces nu kost in uren en fouten. Aan het eind weet je dus wat AI echt oplevert en kun je dat aan bestuur, raad of subsidieverstrekker laten zien.',
        result: 'Een besluit op basis van cijfers, niet op basis van enthousiasme.',
      },
      {
        title: 'Mensen meenemen, niet overrulen',
        text: 'Ik faciliteer sessies waarin medewerkers hun zorgen kwijt kunnen, onder andere met LEGO® Serious Play. Adoptie is de helft van het project en wordt te vaak aan het toeval overgelaten.',
        result: 'Een team dat eigenaar is van de verandering.',
      },
      {
        title: 'AI zelf inzetten om sneller te leveren',
        text: 'Ik werk met mijn eigen AI-laag (Iris en AgentOS) voor planning, rapportage en voorbereiding, met een vaste goedkeuringsstap waarin ik altijd het laatste woord houd. Daardoor heb ik minder uren nodig voor hetzelfde resultaat.',
        result: 'Meer resultaat per uur, en een klantportaal waarin je live meekijkt.',
      },
    ],
    faqs: [
      {
        question: 'Wat doet een AI-projectmanager precies?',
        answer:
          'Een AI-projectmanager neemt de regie op een AI-traject: het knelpunt scherp stellen, randvoorwaarden regelen (eigenaar, privacy, budget), de pilot opzetten en meten, het go/no-go-besluit voorbereiden, opschalen en overdragen. Hij is geen programmeur en geen leverancier; hij zorgt dat de juiste mensen het juiste doen.',
      },
      {
        question: 'Wat is het verschil met een gewone projectmanager?',
        answer:
          'Een gewone projectmanager bewaakt tijd, geld en scope. Een AI-projectmanager doet dat ook, maar kent daarnaast de eigen risico\'s van AI: onzekere uitkomsten, datakwaliteit, privacy, menselijke controle en de neiging van pilots om nooit in productie te komen. Dat vraagt andere vragen vooraf en een ander besluitmoment.',
      },
      {
        question: 'Wat kost een AI-projectmanager?',
        answer:
          'Ik werk voor €125 tot €140 per uur, bewust 16 tot 24 uur per week. Dat is hoger dan een gemiddeld zzp-tarief, omdat ik in minder uren hetzelfde resultaat haal. Een eerste kennismaking van 30 minuten is gratis; daarna maak ik een voorstel met een vaste scope.',
      },
      {
        question: 'Hoe snel zie ik resultaat?',
        answer:
          'Binnen 90 dagen heb je een werkende pilot met meetbare uitkomsten en een besluit over het vervolg. Bij haast kan het sneller: dan draaien de eerste twee fases naast elkaar. Een kleine afgebakende toepassing kan binnen enkele weken live.',
      },
      {
        question: 'Werk je ook naast onze bestaande IT-leverancier?',
        answer:
          'Ja. Ik ben geen leverancier en geen concurrent van je IT-partners. Ik ben de schakel tussen organisatie, techniek en regels, en houd de leverancier scherp op wat afgesproken is.',
      },
      {
        question: 'Waarom zou ik jou kiezen boven een groot adviesbureau?',
        answer:
          'Je krijgt mij zelf, niet een junior met een gepolijst deck. Ik was 25 jaar ondernemer en directeur in het sociaal domein, ik bouw de AI-tools die ik adviseer zelf, en je kijkt in een portaal live mee met de voortgang. Ik blijf totdat het werkt, niet totdat de uren op zijn.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'Waarom AI-projecten stranden',
        href: '/kennisbank/waarom-ai-projecten-stranden',
        description: 'De zeven patronen die ik steeds terugzie.',
      },
      {
        title: 'Van AI-pilot naar productie',
        href: '/kennisbank/ai-pilot-naar-productie',
        description: 'De stap die de meeste organisaties overslaan.',
      },
      {
        title: 'Tien vragen vóór je een AI-projectmanager inhuurt',
        href: '/kennisbank/vragen-aan-ai-projectmanager-voor-inhuur',
        description: 'Zo toets je kennis, werkwijze en eerlijkheid.',
      },
    ],
    ctaTitle: 'Een AI-project dat wel landt.',
    ctaText:
      'Vertel in 30 minuten waar jullie staan. Je krijgt een eerlijk antwoord: of ik kan helpen, wat het dan kost, en anders waar je beter terecht kunt.',
  },

  // ───────────────────────── SOCIAAL DOMEIN ─────────────────────────
  {
    slug: 'ai-projectmanager-sociaal-domein',
    metaTitle: 'AI-projectmanager sociaal domein | ervaring uit de sector',
    metaDescription:
      'AI-projectmanager met 25 jaar ervaring in het sociaal domein. Ik breng AI-projecten bij welzijn, jeugd en participatie naar productie, met oog voor cliënt, vrijwilliger en privacy.',
    keywords: [
      'AI-projectmanager sociaal domein',
      'AI project sociaal domein',
      'AI implementatie welzijn',
      'projectleider AI welzijnsorganisatie',
      'AI sociaal werk',
      'Vincent van Munster',
    ],
    breadcrumb: 'AI-projectmanager sociaal domein',
    eyebrow: 'Sociaal domein',
    h1a: 'AI-projectmanager',
    h1b: 'die het sociaal domein kent.',
    lead: 'Het sociaal domein heeft andere regels dan een bank of een webwinkel: kwetsbare cliënten, vrijwilligers, versnipperde financiering en teams die al vol zitten. Ik leid AI-projecten in die context, omdat ik er zelf 25 jaar werkte.',
    answer: {
      question: 'Waarom een AI-projectmanager met kennis van het sociaal domein?',
      text: 'In het sociaal domein draait AI op gevoelige persoonsgegevens, met mensen die al weinig tijd hebben en financiering die per project verschilt. Een projectmanager die dat kent, kiest andere toepassingen, regelt privacy eerder en voorkomt dat AI het werk van begeleiders zwaarder in plaats van lichter maakt.',
    },
    problemsTitle: 'Wat ik in het sociaal domein steeds zie',
    problems: [
      {
        title: 'Administratiedruk is de echte vijand',
        text: 'Begeleiders besteden een groot deel van hun tijd aan verslaglegging. AI-projecten die dat verlichten krijgen draagvlak; projecten die er een extra systeem bij zetten niet.',
      },
      {
        title: 'Cliëntgegevens vragen om extra zorg',
        text: 'Gratis consumentenversies van AI-tools horen niet in de buurt van cliëntdossiers. Het verschil tussen een verwerkersovereenkomst en geen verwerkersovereenkomst is het verschil tussen verantwoord en een datalek.',
      },
      {
        title: 'Vrijwilligers en professionals samen',
        text: 'AI raakt beide groepen anders. Wat voor een professional een tijdwinst is, kan voor een vrijwilliger een drempel zijn. Dat moet je ontwerpen, niet toevallig ontdekken.',
      },
      {
        title: 'Projectfinanciering zonder vervolg',
        text: 'Een subsidie dekt de pilot maar niet het beheer erna. Wie dat niet vooraf regelt, bouwt iets dat na twaalf maanden stilvalt.',
      },
    ],
    approachTitle: 'Zo pak ik het aan in welzijn en zorg',
    approach: [
      {
        title: 'Beginnen bij de werkvloer',
        text: 'Ik praat met begeleiders, coördinatoren en vrijwilligers voordat er een tool wordt gekozen. Zij weten waar het schuurt. Bij Stichting de Baan beheerde ik met 700+ deelnemers en 180 vrijwilligers hoe weinig ruimte er is voor extra werk.',
        result: 'Een toepassing die tijd teruggeeft in plaats van vraagt.',
      },
      {
        title: 'Privacy als ontwerpkeuze',
        text: 'Verwerkersovereenkomst, dataminimalisatie en menselijke controle op elke uitkomst zijn vanaf de eerste week geregeld. Voor risicovolle toepassingen volgt een gegevensbeschermingseffectbeoordeling.',
        result: 'Geen verrassingen van de functionaris gegevensbescherming achteraf.',
      },
      {
        title: 'Financiering en beheer in één plan',
        text: 'Ik zet van tevoren neer wie het beheert, wat dat kost en waar het budget vandaan komt. Zo hoeft succes niet af te hangen van de volgende subsidieronde.',
        result: 'Een pilot met een toekomst.',
      },
    ],
    faqs: [
      {
        question: 'Heb je ervaring met AI-projecten in welzijnsorganisaties?',
        answer:
          'Ja. Ik was directeur van Stichting de Baan (tot 1 oktober 2025), bouw zelf AI-tools voor de sector en begeleid organisaties bij AI-implementatie. Het bewijs staat in de kennisbank en in de projecten die ik live heb draaien, zoals DAAR voor vrijwilligersbeheer.',
      },
      {
        question: 'Mag AI wel met cliëntgegevens werken?',
        answer:
          'Onder voorwaarden. Je hebt een rechtsgrond, een verwerkersovereenkomst, dataminimalisatie en menselijke controle nodig, en bij risicovolle toepassingen een gegevensbeschermingseffectbeoordeling. Gebruik nooit een gratis consumentenversie voor cliëntdossiers. Overleg altijd met je functionaris gegevensbescherming.',
      },
      {
        question: 'Wat kan AI concreet doen in het sociaal domein?',
        answer:
          'De bekendste winst zit in administratie: verslagen samenvatten, rapportages voorbereiden, intakegesprekken uitwerken en vragen van burgers beantwoorden. Altijd met een medewerker die de uitkomst controleert. Beslissingen over mensen laat ik niet aan AI over.',
      },
      {
        question: 'Hoe lang duurt een traject?',
        answer:
          'Een afgebakende pilot duurt 4 tot 6 weken, het hele traject tot productie meestal 3 tot 6 maanden. We beginnen met een gratis gesprek om de scope vast te stellen.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'Privacy en AI in de zorg: wat mag wel en wat niet?',
        href: '/kennisbank/privacy-ai-zorg-avg-checklist',
        description: 'AVG-checklist voor zorg en welzijn.',
      },
      {
        title: 'AI-proof in 90 dagen',
        href: '/kennisbank/ai-proof-organisatie-90-dagen',
        description: 'Drie fases, met checklist.',
      },
    ],
    ctaTitle: 'Eerst begrijpen, dan bouwen.',
    ctaText:
      'Plan een gesprek van 30 minuten. Ik denk mee over waar AI in jullie organisatie tijd teruggeeft en waar het alleen extra werk zou opleveren.',
  },

  // ───────────────────────── GEMEENTE ─────────────────────────
  {
    slug: 'ai-projectmanager-gemeente',
    metaTitle: 'AI-projectmanager gemeente | AI-act, AVG en draagvlak',
    metaDescription:
      'AI-projectmanager voor gemeenten: van pilot naar productie, met aandacht voor AVG, algoritmeregister, AI-verordening en draagvlak bij medewerkers en bestuur.',
    keywords: [
      'AI-projectmanager gemeente',
      'AI implementatie gemeente',
      'projectleider AI gemeente',
      'AI project gemeente begeleiden',
      'AI-verordening gemeente',
      'algoritmeregister gemeente',
      'Vincent van Munster',
    ],
    breadcrumb: 'AI-projectmanager gemeente',
    eyebrow: 'Gemeenten',
    h1a: 'AI-projectmanager voor gemeenten:',
    h1b: 'zorgvuldig én sneller.',
    lead: 'Gemeenten moeten voorzichtig zijn met AI en willen toch vooruit. Dat vraagt om iemand die de bestuurlijke context kent, regels meeneemt in plaats van ze achteraf te repareren, en ambtenaren meeneemt in plaats van ze te overrulen.',
    answer: {
      question: 'Wat doet een AI-projectmanager bij een gemeente?',
      text: 'Hij of zij begeleidt een AI-toepassing van idee tot productie binnen de kaders van een gemeente: AVG, de Europese AI-verordening, het algoritmeregister, aanbesteding en bestuurlijke verantwoording. Daarnaast bouwt hij draagvlak bij ambtenaren, zodat het resultaat gebruikt wordt en niet in een la verdwijnt.',
    },
    problemsTitle: 'Waar gemeentelijke AI-projecten op vastlopen',
    problems: [
      {
        title: 'Afdelingen die niet op één lijn zitten',
        text: 'IT, juridische zaken, het sociaal domein en communicatie hebben elk een andere agenda. Zonder regie liggen zij elkaar in de weg en duurt alles langer dan nodig.',
      },
      {
        title: 'Verantwoording naar de raad',
        text: 'Een college wil weten wat een project oplevert en welk risico het heeft. Dat vraagt om meetbare doelen en een heldere besluitlijn, niet om technische taal.',
      },
      {
        title: 'Regels pas achteraf',
        text: 'Het algoritmeregister, de AI-verordening en de AVG worden vaak als laatste gecontroleerd. Dat is te laat: een correctie kost dan weken en vertrouwen.',
      },
      {
        title: 'Aanbesteding en leveranciersafhankelijkheid',
        text: 'Wie niet nadenkt over overdraagbaarheid en exit, zit na twee jaar vast aan één leverancier voor iets waar het eigen team geen zicht op heeft.',
      },
    ],
    approachTitle: 'Mijn aanpak bij gemeenten',
    approach: [
      {
        title: 'Regie tussen de afdelingen',
        text: 'Ik breng IT, juridisch, het inhoudelijke team en communicatie aan één tafel met één plan. Beslissingen worden vooraf geagendeerd, niet achteraf uitgezocht.',
        result: 'Minder wachttijd tussen afdelingen.',
      },
      {
        title: 'Regels in de planning, niet erna',
        text: 'Privacy, algoritmeregister en AI-verordening zijn onderdeel van fase twee. Voor elke toepassing leggen we vast wat de risicoklasse is en wie waarvoor tekent.',
        result: 'Een project dat de toetsing doorstaat.',
      },
      {
        title: 'Draagvlak via LEGO® Serious Play',
        text: 'In een dag laat ik teams hun zorgen en ideeën bouwen en bespreken. Dat geeft meer gedragen afspraken dan maanden vergaderen. Zie ook mijn aanpak voor draagvlak bij gemeenten.',
        result: 'Ambtenaren die meebouwen aan de verandering.',
      },
    ],
    faqs: [
      {
        question: 'Moet ons AI-systeem in het algoritmeregister?',
        answer:
          'Overheidsorganisaties registreren impactvolle algoritmen en hoogrisico-AI in het Algoritmeregister van de Nederlandse overheid. Of dat voor jullie toepassing geldt, hangt van de aard en het effect van het systeem af. Ik stel dat in fase twee samen met jullie juristen vast; zie ook ons artikel over het algoritmeregister.',
      },
      {
        question: 'Wat betekent de AI-verordening voor een gemeente?',
        answer:
          'De Europese AI-verordening (AI Act) werkt gefaseerd. Sinds 2 februari 2025 geldt onder meer de verplichting om te zorgen voor voldoende AI-geletterdheid bij medewerkers die met AI werken. Welke verplichtingen verder gelden hangt af van de risicoklasse van de toepassing. Toets altijd de actuele stand met je jurist.',
      },
      {
        question: 'Werk je via een raamovereenkomst of aanbesteding?',
        answer:
          'Ik ben zelfstandig en werk voor kleinere opdrachten direct. Voor grotere trajecten kijk ik graag mee naar de inkoopvorm die bij jullie past. Neem contact op om de mogelijkheden te bespreken.',
      },
      {
        question: 'Kun je ook als interim inspringen?',
        answer:
          'Ja, als interim projectmanager of programmamanager, voor 16 tot 24 uur per week. Zie de pagina over interim AI-projectmanager voor de afspraken.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'AI Act en AVG in een AI-project',
        href: '/kennisbank/ai-act-en-avg-in-een-ai-project',
        description: 'Wat je wanneer moet regelen.',
      },
      {
        title: 'Algoritmeregister: stappenplan voor gemeenten',
        href: '/kennisbank/algoritmeregister-gemeenten-ai-act-verplichting-stappenplan',
        description: 'Van inventarisatie tot registratie.',
      },
    ],
    ctaTitle: 'AI in jullie gemeente, zonder haastwerk.',
    ctaText:
      'Een gesprek van 30 minuten is gratis. Neem een casus mee; dan ga je met een eerste plan van aanpak weg.',
  },

  // ───────────────────────── ZORG & WELZIJN ─────────────────────────
  {
    slug: 'ai-projectmanager-zorg-welzijn',
    metaTitle: 'AI-projectmanager zorg en welzijn | veilig en met draagvlak',
    metaDescription:
      'AI-projectmanager voor zorg- en welzijnsorganisaties: AI die administratie verlicht, met privacy op orde en een team dat het omarmt. Vaste scope, ervaren, direct inzetbaar.',
    keywords: [
      'AI-projectmanager zorg',
      'AI-projectmanager welzijn',
      'AI implementatie zorginstelling',
      'AI administratie zorg verminderen',
      'projectleider AI zorg',
      'Vincent van Munster',
    ],
    breadcrumb: 'AI-projectmanager zorg en welzijn',
    eyebrow: 'Zorg & welzijn',
    h1a: 'AI die zorgverleners',
    h1b: 'tijd teruggeeft, geen werk erbij.',
    lead: 'In zorg en welzijn is tijd de schaarste. AI is alleen interessant als het die tijd vergroot. Ik leid AI-projecten waarin het proces, de privacy en de mensen op orde zijn voordat de tool aan gaat.',
    answer: {
      question: 'Waar helpt een AI-projectmanager in zorg en welzijn bij?',
      text: 'Bij het kiezen van een toepassing die echt tijd teruggeeft (zoals verslaglegging of rapportage), het regelen van privacy en menselijke controle, het opzetten van een meetbare pilot en het meenemen van zorgverleners. Het doel is minder administratie, niet een extra systeem.',
    },
    problemsTitle: 'Wat AI-projecten in zorg en welzijn lastig maakt',
    problems: [
      {
        title: 'Geen ruimte voor extra werk',
        text: 'Een team dat al vol zit heeft geen zin in een pilot die extra uren kost. Het project moet in de eerste week al iets verlichten, anders haakt men af.',
      },
      {
        title: 'Bijzondere persoonsgegevens',
        text: 'Gezondheidsgegevens zijn bijzondere persoonsgegevens met strengere eisen. Een verkeerde tool of instelling is geen detail maar een incident.',
      },
      {
        title: 'Terechte scepsis',
        text: 'Zorgverleners hebben vaker beloftes over digitalisering gehoord dan waargemaakt gezien. Scepsis is geen weerstand die je moet breken maar informatie die je moet gebruiken.',
      },
      {
        title: 'Wie is verantwoordelijk voor de uitkomst?',
        text: 'Als AI een samenvatting maakt, blijft de professional verantwoordelijk. Dat moet in het proces zitten, niet alleen in het beleid.',
      },
    ],
    approachTitle: 'Zo ga ik te werk',
    approach: [
      {
        title: 'Kleine winst eerst',
        text: 'We starten met een toepassing die binnen weken zichtbaar tijd scheelt, bijvoorbeeld het uitwerken van gespreksnotities of het voorbereiden van rapportages. Dat bouwt vertrouwen op voor wat daarna komt.',
        result: 'Een team dat vraagt om meer, in plaats van afhaakt.',
      },
      {
        title: 'Privacy van dag één',
        text: 'Verwerkersovereenkomst, dataminimalisatie en menselijke controle zijn onderdeel van het ontwerp. Bij risicovolle toepassingen doen we een gegevensbeschermingseffectbeoordeling met je FG.',
        result: 'Veilig werken zonder rem op het tempo.',
      },
      {
        title: 'Een professional houdt de regie',
        text: 'Elke AI-uitkomst gaat langs een medewerker voor hij gebruikt wordt. Dat is hoe ik mijn eigen systemen inricht, en hoe ik het ook voor jullie opzet.',
        result: 'Eigenaarschap en veiligheid zijn geborgd.',
      },
    ],
    faqs: [
      {
        question: 'Kan AI echt de administratie in de zorg verlichten?',
        answer:
          'Ja, op de plekken waar mensen veel schrijven en samenvatten. De winst verschilt per organisatie; daarom meten we vooraf hoeveel tijd een proces kost en na de pilot opnieuw. Zonder die nulmeting is elk percentage een gok.',
      },
      {
        question: 'Wat is het risico van AI-notulen of -verslagen?',
        answer:
          'Fouten en vergeten nuance. Daarom blijft een professional altijd eindverantwoordelijk en controleert elke uitkomst. Daarnaast hoort er een verwerkersovereenkomst en een heldere bewaartermijn bij.',
      },
      {
        question: 'Is dit geschikt voor een kleine welzijnsorganisatie?',
        answer:
          'Ja. De fases zijn hetzelfde, alleen zitten er minder mensen aan tafel. Een kleine organisatie kan vaak sneller beslissen dan een grote.',
      },
      {
        question: 'Wat kost het?',
        answer:
          'Ik werk voor €125 tot €140 per uur, vaak 16 tot 24 uur per week. Een afgebakende pilot kan ik op vaste prijs aanbieden. Het eerste gesprek is gratis.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'Administratieve druk verlagen met AI',
        href: '/kennisbank/administratieve-druk-verlagen-ai',
        description: 'Waar de winst echt zit.',
      },
      {
        title: 'Privacy en AI in de zorg',
        href: '/kennisbank/privacy-ai-zorg-avg-checklist',
        description: 'Praktische AVG-checklist.',
      },
    ],
    ctaTitle: 'Begin klein, maar met een echte uitkomst.',
    ctaText:
      'Plan een gratis gesprek. We kijken naar één proces waar jullie nu de meeste tijd aan kwijt zijn.',
  },

  // ───────────────────────── INTERIM ─────────────────────────
  {
    slug: 'interim-ai-projectmanager',
    metaTitle: 'Interim AI-projectmanager | direct inzetbaar, 16-24 uur per week',
    metaDescription:
      'Interim AI-projectmanager voor gemeenten, zorg en welzijn. Direct inzetbaar, €125-140 per uur, 16 tot 24 uur per week, met overdrachtsplan vanaf dag één.',
    keywords: [
      'interim AI-projectmanager',
      'interim AI projectleider',
      'interim programmamanager AI',
      'tijdelijke AI projectmanager',
      'AI interim sociaal domein',
      'Vincent van Munster',
    ],
    breadcrumb: 'Interim AI-projectmanager',
    eyebrow: 'Interim',
    h1a: 'Interim AI-projectmanager:',
    h1b: 'vanaf dag één in de regie.',
    lead: 'Loopt een AI-project vast, vertrekt je projectleider, of start er iets waar nog niemand de trekker van is? Dan kan ik tijdelijk de regie nemen en, net zo belangrijk, zorgen dat die regie daarna bij jullie blijft.',
    answer: {
      question: 'Wat is een interim AI-projectmanager?',
      text: 'Een tijdelijke projectmanager die een lopend of startend AI-project overneemt of trekt, voor een afgesproken periode. Het verschil met een vaste kracht is dat een overdrachtsplan vanaf dag één onderdeel is van de opdracht, zodat kennis niet vertrekt als de interim vertrekt.',
    },
    problemsTitle: 'Wanneer interim zinvol is',
    problems: [
      {
        title: 'Het project loopt vast',
        text: 'Planning schuift, leveranciers wijzen naar elkaar en niemand durft een besluit te nemen. Een nieuwe blik en een mandaat maken dan het verschil.',
      },
      {
        title: 'De projectleider vertrekt',
        text: 'Ziekte, een nieuwe baan of een reorganisatie. De overdracht is dan zelden goed en het project dreigt stil te vallen.',
      },
      {
        title: 'Er is een startopdracht, maar geen trekker',
        text: 'Een subsidie is toegekend of het bestuur heeft ja gezegd, maar niemand heeft ruimte om het te trekken. Tijdelijke capaciteit voorkomt dat het bij goede bedoelingen blijft.',
      },
      {
        title: 'De overdracht ontbreekt',
        text: 'Interim-inzet zonder overdrachtsplan verspilt geld: zodra de interim vertrekt, vertrekt de kennis mee.',
      },
    ],
    approachTitle: 'Hoe ik interim werk',
    approach: [
      {
        title: 'Eerste twee weken: in kaart',
        text: 'Ik lees het dossier, spreek de betrokkenen en lever een korte, eerlijke analyse op: wat staat er, wat ontbreekt, wat is het risico. Als blijkt dat een project beter gestopt kan worden, zeg ik dat.',
        result: 'Een gedeeld beeld en een besluit over het vervolg.',
      },
      {
        title: '16 tot 24 uur per week, bewust',
        text: 'Ik werk drie dagen per week, niet fulltime. Dat dwingt tot prioriteren en houdt de kosten beheersbaar. Mijn uurtarief is €125 tot €140 en ik haal in 16 uur wat anderen in 32 doen.',
        result: 'Resultaat per euro, geen uren om de uren.',
      },
      {
        title: 'Overdracht vanaf dag één',
        text: 'Er wordt direct een opvolger of team aangewezen dat meeloopt. In het portaal staat alles gedocumenteerd, zodat niets in mijn hoofd zit.',
        result: 'Een project dat zonder mij verder kan.',
      },
    ],
    faqs: [
      {
        question: 'Hoe snel kun je beginnen?',
        answer:
          'Dat hangt van mijn agenda af. Neem contact op voor de actuele beschikbaarheid; bij spoed kijk ik wat er mogelijk is.',
      },
      {
        question: 'Wat is de minimale of maximale duur?',
        answer:
          'Meestal tussen drie en negen maanden. Korter kan voor een afgebakende opdracht, langer vraagt om een herbeoordeling halverwege.',
      },
      {
        question: 'Werk je ook interim op andere rollen?',
        answer:
          'Ja: interim manager, programmamanager en kwartiermaker in het sociaal domein. Zie de pagina\'s over interim manager en kwartiermaker.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'Interim projectleider sociaal domein',
        href: '/kennisbank/interim-projectleider-sociaal-domein',
        description: 'Wat je kunt verwachten.',
      },
      {
        title: 'Interim manager kiezen in welzijn',
        href: '/kennisbank/interim-manager-kiezen-welzijn',
        description: 'Waar je op let.',
      },
    ],
    ctaTitle: 'Tijdelijke regie, blijvend resultaat.',
    ctaText:
      'Vertel wat er speelt. Binnen een gesprek van 30 minuten weet je of interim de juiste vorm is.',
  },

  // ───────────────────────── INHUREN ─────────────────────────
  {
    slug: 'ai-projectmanager-inhuren',
    metaTitle: 'AI-projectmanager inhuren: tarief, zzp of bureau, waar let je op',
    metaDescription:
      'AI-projectmanager inhuren: wat kost het, zzp of bureau, welke vragen stel je vooraf. Eerlijke gids van een AI-projectmanager zelf: €125-140 per uur, 16-24 uur per week.',
    keywords: [
      'AI-projectmanager inhuren',
      'AI projectmanager tarief',
      'AI projectmanager zzp',
      'AI projectmanager bureau',
      'wat kost een AI projectmanager',
      'Vincent van Munster',
    ],
    breadcrumb: 'AI-projectmanager inhuren',
    eyebrow: 'Inhuren',
    h1a: 'AI-projectmanager inhuren:',
    h1b: 'wat je moet weten voor je kiest.',
    lead: 'Een AI-projectmanager inhuren is een investering die je niet wilt overdoen. Hieronder staat eerlijk wat het kost, welke vorm bij welke situatie past en welke vragen je vooraf kunt stellen, ook als je uiteindelijk niet voor mij kiest.',
    answer: {
      question: 'Wat kost het inhuren van een AI-projectmanager?',
      text: 'Ik werk voor €125 tot €140 per uur, meestal 16 tot 24 uur per week. Bureautarieven liggen vaak hoger, interne kosten zijn moeilijk te vergelijken. Het belangrijkste is niet het uurtarief maar de uren per resultaat en of er een overdrachtsplan bij zit.',
    },
    problemsTitle: 'Zzp, bureau of intern?',
    problems: [
      {
        title: 'Zzp\'er (zoals ik)',
        text: 'Past bij een afgebakende of middellange opdracht waarin je één ervaren persoon wilt, zonder lagen ertussen. Risico: bij ziekte of einde contract valt kennis weg, tenzij de overdracht geregeld is.',
      },
      {
        title: 'Bureau',
        text: 'Past bij een groot traject met meerdere disciplines. Risico: je betaalt voor overhead en ziet vaak een andere persoon dan degene die het acquisitiegesprek voerde.',
      },
      {
        title: 'Vaste kracht',
        text: 'Past bij de fase ná het project: structureel beheer. Te vroeg aannemen, voordat helder is wat de rol inhoudt, geeft een mismatch zodra het eerste project af is.',
      },
      {
        title: 'Wat je altijd moet laten vastleggen',
        text: 'Scope, meetpunten, go/no-go-momenten, overdrachtsplan, wie wat besluit en wat er gebeurt als het project wordt gestopt.',
      },
    ],
    approachTitle: 'Zo werk ik, zodat je kunt vergelijken',
    approach: [
      {
        title: 'Gratis kennismaking van 30 minuten',
        text: 'Je vertelt je situatie, ik zeg eerlijk of ik kan helpen. Soms is het antwoord nee, of is een andere vorm beter.',
        result: 'Helderheid zonder verplichting.',
      },
      {
        title: 'Voorstel met vaste scope',
        text: 'Je krijgt een voorstel met deliverables, meetpunten en wat er niet in zit. Geen open eindjes die later duurder blijken.',
        result: 'Voorspelbare kosten.',
      },
      {
        title: 'Live meekijken',
        text: 'Je krijgt toegang tot een klantportaal met milestones, openstaande acties en opmerkingen. Je hoeft niet te vragen hoe het gaat; je ziet het.',
        result: 'Volledige transparantie over voortgang.',
      },
    ],
    faqs: [
      {
        question: 'Waarom is jouw uurtarief hoger dan gemiddeld?',
        answer:
          'Omdat ik minder uren nodig heb. Ik werk met eigen AI-hulpmiddelen en 25 jaar ervaring, dus ik kom sneller bij het eigenlijke probleem. Voor jou telt wat het totale project kost, niet wat een uur kost.',
      },
      {
        question: 'Welke vragen moet ik een AI-projectmanager stellen?',
        answer:
          'Vraag naar een project dat stopte of mislukte en wat hij of zij daarvan leerde; hoe privacy en menselijke controle worden geregeld; hoe resultaat gemeten wordt; en hoe de overdracht eruitziet. Een volledige lijst staat in het artikel met tien vragen.',
      },
      {
        question: 'Wat is het risico van een AI-projectmanager inhuren?',
        answer:
          'Dat je iemand huurt die vooral over AI praat. Controleer daarom of hij of zij ook zelf bouwt of gebruikt, of er referenties zijn en of de eerste weken een concrete deliverable opleveren.',
      },
      {
        question: 'Kan ik eerst klein beginnen?',
        answer:
          'Ja. Een Doorbraak Sprint van een dagdeel of een kort verkennend traject geeft je een eerste resultaat en een gevoel bij de samenwerking voordat je groter commit.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'Tien vragen vóór je inhuurt',
        href: '/kennisbank/vragen-aan-ai-projectmanager-voor-inhuur',
        description: 'Checklist voor het kennismakingsgesprek.',
      },
      {
        title: 'Doorbraak Sprint',
        href: '/doorbraak-sprint',
        description: 'Klein beginnen, in één dagdeel.',
      },
    ],
    ctaTitle: 'Eerst praten, dan pas beslissen.',
    ctaText:
      'Een gesprek van 30 minuten kost niets en verplicht tot niets. Je weet daarna of we een match zijn.',
  },

  // ───────────────────────── SOCIALE ONDERNEMERS ─────────────────────────
  {
    slug: 'ai-projectmanager-sociaal-ondernemers',
    metaTitle: 'AI-projectmanager voor sociaal ondernemers en stichtingen',
    metaDescription:
      'AI-projectmanager voor sociale ondernemingen en stichtingen: een eerste AI-project dat bij je budget past. Van knelpunt naar werkende pilot, door iemand die zelf ondernemer was.',
    keywords: [
      'AI-projectmanager sociaal ondernemer',
      'AI voor stichtingen',
      'AI implementatie sociale onderneming',
      'AI project klein budget',
      'AI procesversneller',
      'Vincent van Munster',
    ],
    breadcrumb: 'AI-projectmanager voor sociaal ondernemers',
    eyebrow: 'Sociaal ondernemers',
    h1a: 'Je eerste AI-project,',
    h1b: 'zonder groot budget of groot team.',
    lead: 'Sociale ondernemers en stichtingen hebben geen innovatieafdeling. Toch is daar de winst het grootst: elk uur dat niet naar administratie gaat is een uur voor je missie. Ik help met een eerste AI-project dat klein begint en echt iets oplevert.',
    answer: {
      question: 'Wat kan een AI-projectmanager doen voor een kleine organisatie?',
      text: 'Hij of zij helpt het eerste AI-project te kiezen, af te bakenen en te meten, zodat je budget niet wegvloeit in tools die niemand gebruikt. Bij een kleine organisatie is vaak één proces genoeg: één knelpunt, één pilot, één besluit.',
    },
    problemsTitle: 'Wat kleine organisaties tegenhoudt',
    problems: [
      {
        title: 'Geen tijd om uit te zoeken wat werkt',
        text: 'Er verschijnt elke week een nieuwe tool. Zonder iemand die filtert verspil je maanden aan uitproberen.',
      },
      {
        title: 'Beperkt budget',
        text: 'Je kunt je geen mislukte pilot van € 50.000 permitteren. Daarom begin je klein en meet je vroeg.',
      },
      {
        title: 'Alles hangt aan één of twee mensen',
        text: 'Als de oprichter of coördinator ziek wordt, stopt alles. AI mag die kwetsbaarheid niet vergroten.',
      },
      {
        title: 'Subsidie dekt de bouw, niet het beheer',
        text: 'Fondsen financieren graag een nieuw project maar niet de jaren erna. Dat moet je vooraf in je plan zetten.',
      },
    ],
    approachTitle: 'Hoe ik klein begin',
    approach: [
      {
        title: 'Doorbraak Sprint: één dagdeel',
        text: 'In één dagdeel pakken we één knelpunt en laten we AI er direct aan werken. Je ziet binnen een dag of het wat voor je is.',
        result: 'Eerste bewijs voor een vaste, lage prijs.',
      },
      {
        title: 'Alleen kiezen wat je kunt beheren',
        text: 'Ik adviseer tools die je team zelf kan onderhouden. Geen maatwerk dat van mij afhangt.',
        result: 'Een oplossing die blijft werken zonder mij.',
      },
      {
        title: 'Financiering meenemen',
        text: 'We kijken welke subsidies of fondsen aansluiten en hoe je het beheer na de pilot betaalt.',
        result: 'Een plan met een dekking, niet alleen een start.',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een eerste AI-project voor een stichting?',
        answer:
          'Dat hangt van de scope. Een Doorbraak Sprint is een vaste prijs voor een dagdeel; een pilot van enkele weken kost meer. In een gratis gesprek van 30 minuten maak ik dat voor jouw situatie concreet.',
      },
      {
        question: 'Hebben wij eigen IT nodig?',
        answer:
          'Nee. Voor de meeste eerste toepassingen is een bestaande, betrouwbare tool voldoende en is geen eigen IT-afdeling nodig. Wel moet iemand in je team eigenaar zijn.',
      },
      {
        question: 'Welke subsidies zijn er voor AI?',
        answer:
          'Dat verandert regelmatig. In de kennisbank staat een actueel overzicht voor AI-implementatie in welzijn. Controleer de voorwaarden altijd bij de verstrekker zelf.',
      },
    ],
    related: [
      ...COMMON_RELATED,
      {
        title: 'Subsidie voor AI-implementatie in welzijn 2026',
        href: '/kennisbank/subsidie-ai-implementatie-welzijn-2026',
        description: 'Welke fondsen en regelingen er zijn.',
      },
      {
        title: 'Doorbraak Sprint',
        href: '/doorbraak-sprint',
        description: 'Eén knelpunt, één dagdeel.',
      },
    ],
    ctaTitle: 'Klein beginnen is ook beginnen.',
    ctaText:
      'Vertel welk proces je het meeste tijd kost. In 30 minuten weten we of AI daar iets aan kan doen.',
  },
];

export function getAiPmPage(slug: string): AiPmPage {
  const page = AI_PM_PAGES.find((p) => p.slug === slug);
  if (!page) throw new Error(`AI-PM-pagina niet gevonden: ${slug}`);
  return page;
}

export function aiPmMetadata(slug: string): Metadata {
  const p = getAiPmPage(slug);
  const url = `${BASE_URL}/${p.slug}`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    keywords: p.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url,
      siteName: 'WeAreImpact',
      title: `${p.metaTitle} | WeAreImpact`,
      description: p.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: p.metaTitle,
      description: p.metaDescription,
    },
  };
}

/** Namen en paden van alle clusterpagina's, voor sitemap en footer. */
export const AI_PM_ROUTES = AI_PM_PAGES.map((p) => ({
  slug: p.slug,
  path: `/${p.slug}`,
  label: p.breadcrumb,
}));
