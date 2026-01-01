import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dGa6SXwq5IHv@ep-soft-term-aggiz0yx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

const posts = [
  {
    title: 'De toekomst van AI in de welzijnssector',
    slug: 'toekomst-ai-welzijn',
    excerpt: 'Hoe kunstmatige intelligentie de manier verandert waarop we welzijnswerk organiseren en uitvoeren. Een diepgaande analyse van trends en mogelijkheden.',
    content: `# De toekomst van AI in de welzijnssector

De welzijnssector staat aan de vooravond van een revolutie. Kunstmatige intelligentie biedt ongekende mogelijkheden om hulpverlening persoonlijker, efficiënter en toegankelijker te maken.

## De huidige uitdagingen

Welzijnsorganisaties kampen met structurele problemen:

- **Capaciteitstekort**: Er zijn simpelweg niet genoeg handen om alle hulpvragen te beantwoorden
- **Wachtlijsten**: Mensen moeten soms maanden wachten op hulp
- **Administratieve last**: Hulpverleners besteden veel tijd aan documentatie

## Hoe AI kan helpen

AI is geen vervanging voor menselijk contact, maar een versterking ervan:

### 1. Slimmere intake
AI kan helpen bij het analyseren van hulpvragen en het doorverwijzen naar de juiste hulpverlener. Dit verkort wachttijden en zorgt voor betere matches.

### 2. Administratie automatiseren
Door routinetaken te automatiseren, houden hulpverleners meer tijd over voor wat echt telt: het contact met hun cliënten.

### 3. Preventieve signalering
AI kan patronen herkennen die wijzen op opkomende problemen, waardoor eerder kan worden ingegrepen.

## Privacy als fundament

Bij WeAreImpact geloven we dat AI in de welzijnssector alleen kan werken als privacy centraal staat. Dat betekent:

- Lokale verwerking waar mogelijk
- Minimale data-verzameling
- Transparantie over wat er met gegevens gebeurt
- Controle bij de gebruiker

## De weg vooruit

De toekomst is niet AI óf mens, maar AI én mens. Door technologie slim in te zetten, kunnen we meer mensen helpen, sneller en beter.

Wil je meer weten over hoe AI jouw organisatie kan versterken? [Neem contact op](/contact) voor een vrijblijvend gesprek.`,
    category: 'ai',
    tags: ['AI', 'Welzijn', 'Technologie', 'Privacy'],
    reading_time: 8,
  },
  {
    title: 'Hoe LEGO Serious Play teams transformeert',
    slug: 'lego-serious-play-teams',
    excerpt: 'Een krachtige methode om complexe problemen op te lossen en teams te verbinden door middel van spel en creativiteit.',
    content: `# Hoe LEGO Serious Play teams transformeert

LEGO Serious Play (LSP) is meer dan bouwen met blokjes. Het is een wetenschappelijk onderbouwde methode die organisaties helpt om complexe vraagstukken aan te pakken.

## Wat is LEGO Serious Play?

LSP is een gefaciliteerde methode waarbij deelnemers met LEGO-stenen modellen bouwen die hun gedachten en ideeën vertegenwoordigen. Door te bouwen met je handen, activeer je andere delen van je brein dan bij traditioneel vergaderen.

## De wetenschap erachter

### Hand-brein verbinding
Onderzoek toont aan dat werken met je handen het creatieve denken stimuleert. De tactiele ervaring van bouwen opent nieuwe denkwegen.

### 100% participatie
In een traditionele vergadering praten vaak dezelfde mensen. Bij LSP bouwt iedereen, waardoor alle stemmen gehoord worden.

### Veilige ruimte
Omdat je praat over je model in plaats van over jezelf, voelen mensen zich vrijer om eerlijk te zijn.

## Wanneer werkt LSP het beste?

- **Teambuilding**: Nieuwe teams leren elkaar op een dieper niveau kennen
- **Strategieontwikkeling**: Complexe scenario's worden tastbaar en bespreekbaar
- **Probleemoplossing**: Onzichtbare blokkades worden zichtbaar
- **Innovatie**: Nieuwe ideeën ontstaan door speelse exploratie

## Een sessie in de praktijk

Een typische LSP-sessie duurt 3-4 uur en volgt deze structuur:

1. **Opwarmen**: Eenvoudige bouwopdrachten om te wennen aan de methode
2. **Individueel bouwen**: Elke deelnemer bouwt een antwoord op de centrale vraag
3. **Delen**: Iedereen presenteert zijn model
4. **Verbinden**: Modellen worden gecombineerd tot een gedeeld landschap
5. **Reflecteren**: Wat hebben we geleerd? Wat gaan we doen?

## Resultaten

Teams die LSP hebben ervaren rapporteren:

- Betere onderlinge communicatie
- Meer begrip voor verschillende perspectieven
- Concrete actiepunten waar iedereen achter staat
- Een versterkt gevoel van verbondenheid

Benieuwd wat LEGO Serious Play voor jouw team kan betekenen? Plan een [kennismakingsgesprek](/contact).`,
    category: 'strategie',
    tags: ['LEGO Serious Play', 'Teams', 'Facilitatie', 'Creativiteit'],
    reading_time: 6,
  },
  {
    title: 'Privacy-first technologie: waarom het belangrijk is',
    slug: 'privacy-first-technologie',
    excerpt: 'In een wereld waar data het nieuwe goud is, kiezen wij bewust voor een andere aanpak. Dit is waarom privacy-first niet alleen ethisch is, maar ook beter werkt.',
    content: `# Privacy-first technologie: waarom het belangrijk is

In een wereld waar data het nieuwe goud is, kiezen wij bewust voor een andere aanpak. Privacy-first is niet alleen ethisch, het is ook beter voor je organisatie.

## Het probleem met data-hongerige technologie

Veel tech-bedrijven bouwen hun verdienmodel op het verzamelen en verkopen van gebruikersdata. Dit leidt tot:

- **Wantrouwen**: Gebruikers worden steeds kritischer over wat er met hun data gebeurt
- **Regelgeving**: AVG en andere wetten maken data-verzameling steeds complexer
- **Risico's**: Meer data betekent meer aansprakelijkheid bij datalekken

## Wat betekent privacy-first?

Privacy-first is een ontwerpfilosofie waarbij bescherming van persoonsgegevens centraal staat:

### 1. Minimale data-verzameling
Verzamel alleen wat je echt nodig hebt. Vraag je bij elke datapunt af: is dit essentieel?

### 2. Lokale verwerking
Verwerk data waar mogelijk lokaal, op het apparaat van de gebruiker. Wat niet naar de cloud gaat, kan niet worden gehackt.

### 3. Transparantie
Wees glashelder over wat je verzamelt en waarom. Geen verborgen clausules in kleine lettertjes.

### 4. Controle bij de gebruiker
Geef mensen echte keuzes. Niet alleen een cookie-banner die je toch moet accepteren.

## Privacy als concurrentievoordeel

Organisaties die privacy serieus nemen, merken:

- **Meer vertrouwen**: Klanten en medewerkers voelen zich veiliger
- **Minder risico**: Kleinere kans op datalekken en boetes
- **Betere focus**: Je bouwt oplossingen die echt werken, niet die data verzamelen
- **Toekomstbestendig**: Je bent klaar voor strengere regelgeving

## Hoe WeAreImpact dit toepast

Bij al onze projecten hanteren we privacy-first principes:

- AI-oplossingen die lokaal kunnen draaien
- Geen tracking van bezoekers waar het niet nodig is
- Open source waar mogelijk
- Duidelijke documentatie over datastromen

## De toekomst is privacy-first

De tech-industrie verandert. Grote browsers blokkeren cookies, regelgeving wordt strenger, en consumenten worden kritischer. Organisaties die nu investeren in privacy-first technologie, zijn klaar voor deze toekomst.

Wil je weten hoe jouw organisatie privacy-first kan werken? [Neem contact op](/contact) voor een gesprek.`,
    category: 'impact',
    tags: ['Privacy', 'Technologie', 'AVG', 'Ethiek'],
    reading_time: 5,
  },
  {
    title: 'Impact meten: van goede bedoelingen naar bewezen resultaten',
    slug: 'impact-meten-resultaten',
    excerpt: 'Hoe meet je of je echt verschil maakt? Een praktische gids voor sociale organisaties die hun impact willen aantonen.',
    content: `# Impact meten: van goede bedoelingen naar bewezen resultaten

Veel sociale organisaties weten dat ze goed werk doen. Maar kunnen ze het ook bewijzen? Impact meten is essentieel geworden voor fondsenwerving, verantwoording en verbetering.

## Waarom impact meten?

### Voor fondsenwerving
Subsidiegevers en donateurs willen steeds vaker bewijs zien van effectiviteit. "We helpen mensen" is niet meer genoeg.

### Voor verbetering
Door te meten wat werkt (en wat niet), kun je je aanpak continu verbeteren.

### Voor motivatie
Teams die zien welk verschil ze maken, zijn gemotiveerder en trots op hun werk.

## De Theory of Change

De basis van goede impactmeting is een duidelijke Theory of Change:

1. **Inputs**: Wat stop je erin? (tijd, geld, mensen)
2. **Activiteiten**: Wat doe je? (trainingen, begeleiding, interventies)
3. **Outputs**: Wat lever je op? (aantal sessies, deelnemers bereikt)
4. **Outcomes**: Wat verandert er? (gedrag, kennis, situatie)
5. **Impact**: Wat is het langetermijneffect? (maatschappelijke verandering)

## Praktische tips voor beginners

### Start klein
Begin met 2-3 indicatoren die je echt kunt meten. Beter weinig goed dan veel slecht.

### Betrek je doelgroep
Vraag de mensen die je helpt wat voor hen belangrijk is. Zij weten het het beste.

### Maak het onderdeel van je werk
Impactmeting moet niet iets extra's zijn, maar verweven met je dagelijkse praktijk.

### Vertel verhalen
Cijfers alleen zijn niet genoeg. Combineer data met persoonlijke verhalen voor een compleet beeld.

## Tools en methoden

Er zijn veel tools beschikbaar voor impactmeting:

- **Vragenlijsten**: Eenvoudig en goedkoop, maar let op responsvertekening
- **Interviews**: Rijke data, maar tijdintensief
- **Observatie**: Objectief, maar vraagt training
- **Registratiesystemen**: Betrouwbaar, maar vraagt discipline

## Veelgemaakte fouten

1. **Te veel willen meten**: Focus op wat echt belangrijk is
2. **Alleen positieve data rapporteren**: Wees eerlijk over wat niet werkt
3. **Geen baseline meten**: Zonder nulmeting kun je geen verandering aantonen
4. **Vergeten te leren**: Data verzamelen is geen doel op zich

## Aan de slag

Wil je beginnen met impactmeting, maar weet je niet waar te starten? In een [strategiesessie](/contact) helpen we je op weg met een praktisch plan.`,
    category: 'impact',
    tags: ['Impact', 'Meten', 'Sociale sector', 'Effectiviteit'],
    reading_time: 7,
  },
  {
    title: 'AI-tools die nu al werken voor non-profits',
    slug: 'ai-tools-non-profits',
    excerpt: 'Concrete voorbeelden van AI-toepassingen die vandaag al ingezet worden door sociale organisaties.',
    content: `# AI-tools die nu al werken voor non-profits

AI hoeft niet futuristisch te zijn. Er zijn nu al praktische tools die sociale organisaties kunnen helpen. Hier zijn concrete voorbeelden.

## 1. ChatGPT voor communicatie

### Wat kan het?
- Nieuwsbrieven schrijven
- Social media posts genereren
- Fondsenwervingsbrieven opstellen
- FAQ's beantwoorden

### Praktijkvoorbeeld
Een vrijwilligersorganisatie gebruikt ChatGPT om maandelijkse nieuwsbrieven te schrijven. Wat eerst 3 uur kostte, is nu klaar in 30 minuten.

### Let op
Controleer altijd de output. AI kan fouten maken of ongepaste toon aanslaan.

## 2. Canva met AI-functies

### Wat kan het?
- Automatisch achtergronden verwijderen
- Tekst-naar-afbeelding generatie
- Slimme resize voor verschillende platformen
- Presentaties automatisch opmaken

### Praktijkvoorbeeld
Een welzijnsorganisatie maakt nu in minuten professionele social media afbeeldingen, waar ze eerst een designer voor nodig hadden.

## 3. Otter.ai voor notulen

### Wat kan het?
- Live transcriptie van vergaderingen
- Automatische samenvattingen
- Zoeken in gesprekken
- Integratie met Zoom

### Praktijkvoorbeeld
Een stichting met veel bestuursvergaderingen bespaart uren aan notuleren en kan zich focussen op de inhoud.

## 4. Notion AI voor documentatie

### Wat kan het?
- Teksten samenvatten
- Brainstormen over ideeën
- Actiepunten extraheren
- Teksten vertalen

### Praktijkvoorbeeld
Een internationale NGO gebruikt Notion AI om rapporten samen te vatten en te vertalen voor verschillende landenkantoren.

## 5. Grammarly voor betere teksten

### Wat kan het?
- Spelfouten corrigeren
- Stijlsuggesties geven
- Leesbaarheid verbeteren
- Tone of voice aanpassen

### Praktijkvoorbeeld
Fondsenwervers gebruiken Grammarly om overtuigender subsidieaanvragen te schrijven.

## Aan de slag

1. **Start met één tool**: Kies de tool die het meeste tijd kan besparen
2. **Experimenteer**: De beste manier om te leren is door te doen
3. **Deel kennis**: Organiseer een lunch-and-learn met collega's
4. **Evalueer**: Kijk na een maand of het echt helpt

## Gratis vs. betaald

Veel AI-tools hebben gratis versies die prima werken voor kleinere organisaties. Betaalde versies bieden vaak meer capaciteit en privacy-opties.

Wil je advies over welke AI-tools passen bij jouw organisatie? [Plan een gesprek](/contact) en we kijken samen naar de mogelijkheden.`,
    category: 'ai',
    tags: ['AI', 'Tools', 'Non-profit', 'Productiviteit'],
    reading_time: 6,
  },
];

async function seedContent() {
  console.log('🌱 Seeding blog content...\n');

  for (const post of posts) {
    try {
      // Check if post already exists
      const existing = await sql`SELECT id FROM posts WHERE slug = ${post.slug}`;

      if (existing.length > 0) {
        console.log(`⏭️  Skipping "${post.title}" (already exists)`);
        continue;
      }

      await sql`
        INSERT INTO posts (
          title, slug, excerpt, content, category, tags,
          status, reading_time, published_at
        ) VALUES (
          ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content},
          ${post.category}, ${post.tags}, 'published', ${post.reading_time}, NOW()
        )
      `;
      console.log(`✅ Added "${post.title}"`);
    } catch (error) {
      console.error(`❌ Failed to add "${post.title}":`, error.message);
    }
  }

  console.log('\n✨ Seeding complete!');

  // Show stats
  const stats = await sql`SELECT category, COUNT(*) as count FROM posts GROUP BY category`;
  console.log('\n📊 Posts by category:');
  for (const stat of stats) {
    console.log(`   - ${stat.category}: ${stat.count}`);
  }
}

seedContent();
