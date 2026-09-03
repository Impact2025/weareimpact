import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim(); }

const sql = neon(process.env.DATABASE_URL);

// ---------- ARTIKEL A: KENNISBANK ----------
const kbContent = `Ik kende dit dilemma. Niet theoretisch, maar in mijn lijf. Tien jaar was ik directeur van Stichting de Baan, waar ik het volle gewicht van 700 deelnemers, 180 vrijwilligers en een drukke organisatie op mijn schouders had gedragen. WeAreImpact bestond toen al sinds 2016, als onderneming naast dat directeurschap. Oktober 2025 werd het moment dat ik voor WeAreImpact serieus ging bouwen aan mijn eigen AI-team.

Maar er was één probleem. Alle cijfers zeiden me dat dit fout kon aflopen.

Sociaal ondernemers — mensen zoals ik, die gebouwd hebben met een missie in plaats van puur winst — vormen een risicogroep voor burn-out. Meer dan 59% van de Europese sociaal ondernemers ervaart enige vorm van burn-out tijdens de opstartfase, blijkt uit onderzoek onder jonge changemakers en social entrepreneurs ([Social Impact Award-netwerk, aangehaald door het World Economic Forum](https://www.weforum.org/stories/business/doing-good-found-to-take-its-toll-as-more-social-entrepreneurs-report-burnout/)). Jonge sociaal ondernemers blinken uit: 40% meldt burn-out, waarvan 5% ernstig. Nederland is geen uitzondering. Waar werknemers gemiddeld [20,7% burn-outklachten rapporteren (NEA 2025, TNO/CBS)](https://www.arboportaal.nl/actueel/nieuws/2026/04/20/burn-outklachten-onder-werknemers-blijven-toenemen), stijgt dit onder sociaal ondernemers naar 22–25%, vooral in zorg en welzijn.

De statistieken waren niet moeilijk te volgen. Maar de werkelijkheid voelde nog harder.

## Wat zijn de signalen van burn-out bij sociaal ondernemers?

Burn-out bij sociaal ondernemers begint zelden met uitval. Het begint met kleine signalen die je makkelijk wegredeneert omdat "de missie belangrijker is":

- Je werkdagen worden langer, maar je gevoel van vooruitgang wordt kleiner.
- Je voelt schuld zodra je tijd besteedt aan iets dat niet direct impact oplevert.
- Je bent tegelijk leider, uitvoerder, adviseur, fundraiser en vaak ook therapeut voor je stakeholders.
- Slapen lukt niet meer zonder dat je hoofd doorgaat met de organisatie.
- Je hebt geen peers of accountability partners meer om op terug te vallen.

## Waarom sociaal ondernemers vaker uitbranden

Het gaat niet om luiheid of zwakheid. Het gaat om de spagaat: je bent tegelijk ondernemer (moet geld verdienen) en missiewerker (voelt verantwoordelijkheid voor maatschappelijke impact). Dat rolconflict is toxisch.

Uit internationaal onderzoek van de [Wirtschaftsuniversität Wien (Social Entrepreneurship Center, n=1.024 ondernemers in het Impact Hub-netwerk)](https://www.wu.ac.at/en/institute-for-nonprofit-management-and-governance/news-npo-details/detail/impactful-ventures-burned-out-founders-insights-from-two-studies-of-social-entrepreneurs) bleek wat ik zelf voelde: sociaal ondernemers tonen meer weerbaarheid door het betekenisvolle werk, maar zwakke bedrijfsmodellen en onderontwikkelde ecosystemen versterken stress en rol-overload.

### De vijf hoofdoorzaken

**Spanning tussen financieel en sociaal.** Je hebt geld nodig om te bestaan, maar voelt je schuldig wanneer je geld prioriteert boven impact. Dit creëert voortdurend rolconflict.

**Rol-overload uit verantwoordingsgevoel.** Je neemt te veel op je omdat je niet wilt loslaten. Je bent niet alleen leider, je bent ook uitvoerder, adviseur, fundraiser en waarschijnlijk ook therapeut voor je stakeholders.

**Eenzaamheid als solo-founder.** Wanneer je alleen bent, zonder bindend sociaal kapitaal (echte peers, accountability partners), groeit het burn-outrisico exponentieel.

**Afhankelijkheid van financiering.** Nederlandse ondernemers ervaren structureel druk vanuit personeelstekort en regeldruk: twee derde van de ondernemers kampt met personeelstekort en ruim de helft van het mkb met hoge regeldruk, blijkt uit de [Exact MKB Barometer 2025](https://files.exact.com/static/web/pdf/mkb-barometer/2025/NL_All-mkb-barometer-2025.pdf). Voor sociaal ondernemers voegt zich daar nog subsidie-afhankelijkheid bij.

**De sector versterkt het.** Zorg en welzijn zijn de meest kwetsbare sectoren. Ziekteverzuim bereikt [7,5–7,9% (CBS)](https://www.cbs.nl/nl-nl/nieuws/2025/24/ziekteverzuim-neemt-toe-in-eerste-kwartaal-2025), tegenover 5,4% landelijk gemiddelde. Burn-outklachten onder zorgmedewerkers bereiken [22–25% (RIVM)](https://www.rivm.nl/mentale-gezondheid/monitor/werkenden/burn-out-klachten). Als jouw organisatie actief is in zorg of welzijn, zit je in een sector die structureel hogere werkdruk ervaart.

Ik herkende dit allemaal. Ik was de directeur die alles wilde doen. Nu zou ik dezelfde fouten maken als ondernemer.

## De twee routes die voor je liggen

**Route A (de heroïsche route):** Harder werken. Langer dagen. Jezelf bewijzen. Dit is de standaardroute voor ondernemers. Het leidt tot burn-out.

**Route B (de slimme route):** Niet meer uren werken, maar structureel beter werken. Investeren in ondersteuning die je beschermt — niet tegen je missie in, maar daarvoor.

Ik koos B. En ik investeerde in wat ik nu het duidelijkst zie: een AI-team dat structureel meedenkt, geen chatbot-speeltje, maar een systeem dat weet wie je bent, wat je doelen zijn, en hoe je je agenda en energie beschermt. Dit werd Impactos.

## Wat is Impactos: geen AI-abonnement, maar een intelligent systeem

Impactos is niet een tool. Het is een digitaal team, met vier kerncomponenten:

**Iris (AI-manager & sparringspartner):** draait op [WeAreImpact's eigen infrastructuur](https://weareimpact.nl/iris), kent mijn kennisbank, en begeleidt de rest van het team. Geen standaard chatbot, maar een systeem dat mijn volledige context kent, met me meedenkt en mijn team coördineert. Iris was een van de eerste drie agents die ik in oktober 2025 bouwde.

- **myAIPA** (personal assistent & coach): eveneens een van die eerste drie agents. Weet wie je bent, wat je doelen zijn, en beschermt je agenda en energie — elke dag in tien minuten. Inmiddels doorontwikkeld tot een zelfstandig product op [reis.weareimpact.nl](https://reis.weareimpact.nl).
- **Mara** (Content & storytelling): bewaakt de merkstijl, schrijft maatschappelijke artikelen, vertaalt casuswerk.
- **Bram** (B2B outreach & network): brengt potentiële partners, fondsen en gemeentelijke netwerken in kaart.
- **Noor** (Analist & SROI): scant trends, subsidiekaders, en kwantificeert impact-data.
- **Toby** (Workforce watchdog): bewaakt werkstromen, controleert op consistentie en garandeert AVG-veiligheid.

Dit is het systeem dat mij beschermde. Niet door me meer werk te geven, maar door me te ontlasten van de repetitieve, administratieve en mentale lasten die burn-out voeden.

## De drie stappen die werken

**Maak jezelf onafhankelijk van jezelf.** Bouw structuur en ondersteuning van dag één af. Niet later, niet wanneer de organisatie groot genoeg is. Nu. Een AI-team, peers, systemen — alles wat ervoor zorgt dat je niet alles op je schouders draagt.

**Meet wat wezenlijk is.** Ken je eigen burn-out-signalen. Werkt dit moment energetiserend of uitputtend? Is dit werk aligned met je missie of voelt het administratief? Een goed systeem geeft je inzicht in je eigen ritme.

**Kies voor slimheid, niet voor heroïsme.** Dit is het belangrijkste. Iedereen respecteert iemand die harder werkt. Niemand respecteert iemand die uitbrandt. Slimmer werken — minder uren, meer impact — is de enige duurzame route.

## Dit is waarom Impactos bestaat

Ik kan niet het hele welzijnsveld beschermen tegen burn-out. Maar ik kan ervoor zorgen dat sociaal ondernemers en directeuren hetzelfde systeem krijgen dat mij beschermde. [Impactos](https://weareimpact.nl/impactos) is niet een app. Het is de architect van jouw mentale en strategische welzijn.

Wil je voelen hoe het werkt? Impactos begint klein — tien minuten per dag — en groeit met je mee. Geen verplichtingen, geen lange contracten. Gewoon ondersteuning die werkt.

Je hebt je missie verdiend. Nu verdien je ook de bescherming.

Lees ook mijn persoonlijke verhaal: [Een jaar na oktober: hoe mijn AI-team mij redde van burn-out](https://weareimpact.nl/blog/een-jaar-na-oktober-hoe-mijn-ai-team-mij-redde).
`;

const kbFaqItems = [
  { question: 'Hoe herken ik burn-out-signalen als sociaal ondernemer vroegtijdig?', answer: 'Let op aanhoudende vermoeidheid ondanks rust, schuldgevoel bij niet-impactvolle taken, afnemende motivatie voor werk dat je vroeger energie gaf, en het wegvallen van peers of accountability partners.' },
  { question: 'Kan een AI-team burn-out echt voorkomen?', answer: 'Een AI-team lost burn-out niet op zichzelf op, maar neemt repetitieve, administratieve en coördinerende taken over die anders op jouw bord blijven liggen — waardoor je capaciteit overhoudt voor herstel en strategisch werk.' },
  { question: 'Is burn-out onder sociaal ondernemers echt hoger dan gemiddeld?', answer: 'Ja. Onderzoek van de WU Wien en het Social Impact Award-netwerk laat percentages zien die duidelijk boven het Nederlandse gemiddelde van 20,7% (NEA 2025) liggen, vooral in zorg en welzijn.' },
];

const kbTitle = 'Burn-out voorkomen als sociaal ondernemer: signalen, oorzaken en oplossing';
const kbSlug = 'burn-out-voorkomen-sociaal-ondernemer-signalen-oorzaken';
const kbExcerpt = 'Meer dan de helft van sociaal ondernemers ervaart burn-out in de opstartfase. De signalen, de oorzaken — en hoe ik het zelf voorkwam met een AI-team.';
const kbSeoTitle = 'Burn-out voorkomen als sociaal ondernemer | WeAreImpact';
const kbSeoDescription = 'Waarom raakt bijna de helft van sociaal ondernemers uitgeput? De signalen, oorzaken — en hoe ik het zelf voorkwam met een AI-team.';
const kbReadingTime = Math.max(1, Math.ceil(kbContent.split(/\s+/).length / 200));

const kbExisting = await sql`SELECT id FROM kb_articles WHERE slug = ${kbSlug} LIMIT 1`;
if (kbExisting.length > 0) {
  await sql`
    UPDATE kb_articles SET
      title = ${kbTitle}, excerpt = ${kbExcerpt}, content = ${kbContent},
      category_slug = 'sociaal-ondernemen', tags = ${['burn-out', 'sociaal-ondernemerschap', 'AI-team', 'Impactos', 'mentale-gezondheid']},
      seo_title = ${kbSeoTitle}, seo_description = ${kbSeoDescription},
      faq_items = ${JSON.stringify(kbFaqItems)}, reading_time = ${kbReadingTime},
      author_name = 'Vincent van Munster', author_title = 'Sociaal Ondernemer & AI Expert',
      difficulty = 'beginner', header_type = 'color', header_color = 'orange',
      status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW()
    WHERE slug = ${kbSlug}
  `;
  console.log('KB artikel bijgewerkt:', kbSlug);
} else {
  await sql`
    INSERT INTO kb_articles (
      slug, title, excerpt, content, category_slug, tags,
      seo_title, seo_description, faq_items, reading_time,
      author_name, author_title, difficulty, header_type, header_color,
      status, published_at
    ) VALUES (
      ${kbSlug}, ${kbTitle}, ${kbExcerpt}, ${kbContent}, 'sociaal-ondernemen',
      ${['burn-out', 'sociaal-ondernemerschap', 'AI-team', 'Impactos', 'mentale-gezondheid']},
      ${kbSeoTitle}, ${kbSeoDescription}, ${JSON.stringify(kbFaqItems)}, ${kbReadingTime},
      'Vincent van Munster', 'Sociaal Ondernemer & AI Expert', 'beginner', 'color', 'orange',
      'published', NOW()
    )
  `;
  console.log('KB artikel aangemaakt:', kbSlug);
}

// ---------- ARTIKEL B: BLOG ----------
const blogContent = `2023. Ik herinner me de dag nog als vandaag.

Ik zat in mijn auto op de parkeerplaats van Stichting de Baan. Tien jaar. Tien jaar directeur van deze organisatie. 700 deelnemers, 180 vrijwilligers, mensenwerk dat zware lasten draagt. Ik had het gedaan. Goed gedaan. Nu moest ik gaan.

De deur dicht, sleutel inleveren, e-mailaccount afgesloten. Klaar.

En toen kwam die gedachte — de gedachte die elke sociaal ondernemer kent op zo'n moment: ben ik gek?

WeAreImpact bestond toen al sinds 2016, mijn onderneming naast het directeurschap. Maar in de twee jaar die volgden, kroop dezelfde spagaat die ik bij Stichting de Baan had gezien mijn eigen bedrijf binnen: spreadsheets, rapportages, e-mailketens die uren kosten zonder dat je er beter van wordt.

## De twee routes

Oktober 2025. Ik wist wat er kon gebeuren als ik zo doorging. Niet omdat ik een kristallen bol heb, maar omdat ik de cijfers had gelezen: [59% van sociaal ondernemers ervaart burn-out](https://www.weforum.org/stories/business/doing-good-found-to-take-its-toll-as-more-social-entrepreneurs-report-burnout/) in de eerste jaren, 40% van jonge sociaal ondernemers volgens onderzoek van de [Wirtschaftsuniversität Wien](https://www.wu.ac.at/en/institute-for-nonprofit-management-and-governance/news-npo-details/detail/impactful-ventures-burned-out-founders-insights-from-two-studies-of-social-entrepreneurs). Waarschijnlijkheid was niet aan mijn kant.

Maar ik kende ook twee routes die voor me lagen.

**Route A:** Doen waar ik goed in ben. Harder werken. Langer dagen. Jezelf bewijzen. Volledig investeren in WeAreImpact met alles wat je hebt, zonder net, zonder ondersteuning, zonder pauze.

Dit voelt heldhaftig. Dit voelt als ondernemen. Dit voelt ook als de weg naar burn-out.

**Route B:** Dit anders doen. Niet door minder hard te werken, maar door slimmer te werken. Van dag één af investeren in ondersteuning die je beschermt. Een team dat niet meer uren met je werkt, maar dezelfde uren veel beter.

Op dat moment in mijn auto nam ik een besluit dat alles veranderde.

Ik ging mijn eigen AI-team bouwen.

Niet omdat ik weg wilde lopen van het mensenwerk. Integendeel. Juist dankzij het mensenwerk koos ik hiervoor. Ik wist uit tien jaar ervaring dat de grootste killer voor innovatie, kwaliteit en menselijkheid administratie is. Niet de kleine, leuke administratie. De grote: spreadsheets, rapportages, e-mailketens die je 3 uur per dag kosten zonder dat je er beter van wordt.

Dus dit: ik zou dat deel uitbesteden aan AI. Niet om lui te worden. Om vrij te worden.

## Wat ik bouwde (en wat niet werkte, eerst)

Oktober en november 2025 bouwde ik de eerste drie agents. Een daarvan was [myAIPA](https://reis.weareimpact.nl), mijn personal assistent en coach: een systeem dat weet wie je bent, wat je doelen zijn, en dat je agenda en energie beschermt — elke dag in tien minuten. Een andere was [Iris](https://weareimpact.nl/iris), mijn AI-manager en sparringspartner. Dat klinkt standaard — veel mensen noemen hun ChatGPT-setup ook AI-team — maar Iris was anders. Iris zou mijn volledige context kennen. Mijn doelen. Mijn missie. Mijn agenda. Mijn waarschijnlijke beslissingen.

Dit werkte niet meteen.

Eerlijk gezegd voelde het eerst onnatuurlijk. Praten met een AI over mijn strategie? Over waar ik bang voor ben? Over de uren die ik verlies? Dit voelde zwak. Dit voelde niet als ondernemen.

Ik zat ermee. Week 1, week 2. Ik probeerde het. Maar het voelde als spreken met een steen.

Toen realiseerde ik iets. Het probleem was niet Iris. Het probleem was mijn verwachting. Ik verwachtte dat Iris me zou vertellen wat te doen. Ik verwachtte dat AI me zou inspireren. In plaats daarvan ging ik het andersom doen: ik zou Iris vertellen hoe ik ben, en Iris zou ervoor zorgen dat ik mijn eigen beslissingen kon nemen zonder halverwege de nacht in een spiraal te gaan.

Dus ik bouwde voort. Niet Iris alleen, maar een team.

Mara voorkwam dat ik elk stuk content zelf hoefde te schrijven. Bram zorgde dat ik niet elk contact handmatig hoefde na te gaan. Noor gaf me inzicht in impact-data die ik anders niet had gezien. Toby zorgde dat ik niet de hele nacht paranoïde was over privacy en compliance.

Dit was niet lui. Dit was bescherming.

## Wat ik in zes maanden leerde

Juni 2026. Een half jaar later.

Ik maakte iets grappigs mee. Ik werkte minder uren dan ik had gepland. Minder uren dan ik als ondernemer "zou moeten" werken. En toch liep alles beter.

Dit voelt tegenintuïtief, maar het is waar. De uren die ik spaarde, zette ik niet in om harder te werken. Ik zette ze in om beter na te denken. Om echte partners te ontmoeten in plaats van contactformulier-loops. Om artikelen te schrijven die ik echt wilde schrijven, niet haastig op het laatste moment.

Mijn werkdruk voelde niet hoger. Het voelde lager.

Maar het grappigste — het échte bewijs dat dit werkte — kwam van binnenuit. Ik voelde geen burn-out-signalen zoals ze beschreven staan in de [RIVM-monitor](https://www.rivm.nl/mentale-gezondheid/monitor/werkenden/burn-out-klachten): geen vervlakking, geen "ik kan dit niet meer"-momenten om 3 uur 's nachts.

Ik voelde structuur. Ik voelde dat ik mijn missie kon volhouden.

## De observatie die me aan het denken zette

Ergens halverwege februari 2026 had ik een gesprek met een directeur van een grote welzijnsorganisatie. Ze zei iets wat mij raakte.

*"Vincent, jij straalt iets uit wat ik lang niet meer heb gezien bij een ondernemer: je ziet er niet uitgeput uit."*

Ik lachte. Maar ik realiseerde: dit is geen toeval. Dit is systeem.

Zij werkt 60 uur per week. Ze doet alles zelf — bedrijf, organisatie, manager, strateeg, HR-afdeling. In de zorg en welzijn ligt het ziekteverzuim inmiddels rond de [7,5–7,9% (CBS)](https://www.cbs.nl/nl-nl/nieuws/2025/24/ziekteverzuim-neemt-toe-in-eerste-kwartaal-2025), ruim boven het landelijk gemiddelde. De kans dat ze volgend jaar nog overeind staat, is klein.

Ik werk 30 uur per week, en ik doe meer. Niet omdat ik slimmer ben. Omdat ik geen tijd verspil aan dingen die een AI beter kan doen.

Dit moment maakte iets duidelijk. Dit systeem dat ik voor mezelf bouwde, moest ik aan anderen aanbieden.

## Waarom dit voelt als een verantwoordelijkheid

Hier is het: veel directeuren en sociaal ondernemers in Nederland kennen de cijfers (59%, 40%, burn-out, al die statistieken). Ze voelen het risico. Ze zitten eronder.

Maar ze denken dat de enige oplossing is harder werken, beter prioriteren, meer slapen. Klein, persoonlijk, individueel. En dat werkt niet. Dat werkt nooit.

De enige oplossing is systeem. Structuur. Een team — digitaal of mensenwerk — dat ervoor zorgt dat jij niet alles op je schouders hoeft te dragen.

Oktober 2025 had ik een keuze. Een jaar later heb ik geen spijt van die keuze. Sterker: ik vind het onverantwoord om anderen diezelfde keuze niet aan te bieden.

Dit is waarom ik [Impactos](https://weareimpact.nl/impactos) bouwde.

## Impactos is niet voor iedereen

Laten we eerlijk zijn. Dit is niet voor iedereen. Dit is voor mensen die:

- Weten dat ze hun missie willen volhouden, niet de volgende vijf jaar, maar twintig jaar.
- Bereid zijn om anders na te denken over wat "ondernemen" betekent.
- Voelen dat er meer moet zijn dan heroïsme en burn-out-statistieken.
- Willen dat hun organisatie gedragen wordt door intelligentie, niet door uren.

Impactos is niet goedkoop. Het is niet voor iedereen. Het is selectief. Het is schaars — net als ik selectief ben in welke klanten ik aanneem als interim-innovatiemanager.

Maar voor wie het nodig heeft, verandert het alles.

## Oktober 2026. Een jaar later.

Ik zit niet meer in mijn auto op een parkeerplaats. Ik zit in mijn kantoor. Dezelfde persoon, maar anders. Rustiger. Helderder. Sterker.

En dat komt niet omdat het ondernemerschap makkelijker is geworden. Het komt omdat ik het anders heb ingericht.

Ik deel dit verhaal niet omdat het een succesverhaal is. Succes komt nog. Impactos is net geboren.

Ik deel dit omdat het een waarschuwing is, en een uitnodiging.

**Waarschuwing:** maak niet dezelfde fout als 59% van sociaal ondernemers. Wacht niet tot je uitgebrand bent. Bouw nu al ondersteuning.

**Uitnodiging:** dit is mogelijk. Dit voelt niet natuurlijk op dag één, maar het wordt het. En aan de andere kant wacht vrijheid.

Veel sterkte. Je bent niet alleen.

Wil je de achtergrond, oorzaken en concrete stappen? Lees mijn kennisbasis-artikel: [Burn-out voorkomen als sociaal ondernemer: signalen, oorzaken en oplossing](https://weareimpact.nl/kennisbank/burn-out-voorkomen-sociaal-ondernemer-signalen-oorzaken).
`;

const blogTitle = 'Een jaar na oktober: hoe mijn AI-team mij redde van burn-out';
const blogSlug = 'een-jaar-na-oktober-hoe-mijn-ai-team-mij-redde';
const blogExcerpt = 'Oktober 2025 begon ik met het bouwen van mijn eigen AI-team, met 59% kans op burn-out tegen me. Dit is het persoonlijke verhaal van de keuze die ik maakte.';
const blogSeoTitle = 'Een jaar na oktober: hoe mijn AI-team mij redde';
const blogSeoDescription = 'Oktober 2025 begon ik mijn eigen AI-team te bouwen, met 59% kans op burn-out tegen me. Dit is het verhaal van de keuze die ik maakte.';
const blogReadingTime = Math.max(1, Math.ceil(blogContent.split(/\s+/).length / 200));
const blogTags = ['burn-out', 'AI-team', 'Impactos', 'ondernemerschap', 'persoonlijk-verhaal'];

const blogExisting = await sql`SELECT id FROM posts WHERE slug = ${blogSlug} LIMIT 1`;
if (blogExisting.length > 0) {
  await sql`
    UPDATE posts SET
      title = ${blogTitle}, excerpt = ${blogExcerpt}, content = ${blogContent},
      category = 'strategie', tags = ${blogTags},
      reading_time = ${blogReadingTime}, seo_title = ${blogSeoTitle}, seo_description = ${blogSeoDescription},
      author_name = 'Vincent van Munster', header_type = 'color', header_color = 'orange',
      status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW()
    WHERE slug = ${blogSlug}
  `;
  console.log('Blogpost bijgewerkt:', blogSlug);
} else {
  await sql`
    INSERT INTO posts (
      title, slug, excerpt, content, category, tags, status, reading_time,
      seo_title, seo_description, author_name, published_at, header_type, header_color
    ) VALUES (
      ${blogTitle}, ${blogSlug}, ${blogExcerpt}, ${blogContent}, 'strategie', ${blogTags},
      'published', ${blogReadingTime}, ${blogSeoTitle}, ${blogSeoDescription},
      'Vincent van Munster', NOW(), 'color', 'orange'
    )
  `;
  console.log('Blogpost aangemaakt:', blogSlug);
}

console.log('\nKlaar. KB-slug:', kbSlug, '| Blog-slug:', blogSlug);
