const fs = require('fs');
const path = require('path');

const faqData = {
  '180-vrijwilligers-beheren-systeem': [
    { question: 'Hoeveel vrijwilligers kan één coördinator aansturen?', answer: 'Met een goed systeem kan één coördinator 50-80 vrijwilligers aansturen. Bij 180+ vrijwilligers heb je minimaal 2-3 coördinatoren nodig.' },
    { question: 'Welke software is geschikt voor vrijwilligersbeheer?', answer: 'Populaire opties zijn Salesforce Nonprofit, Volunteerbase, of een goed ingericht Excel/Google Sheets systeem.' },
    { question: 'Hoe voorkom je dat vrijwilligers afhaken?', answer: 'Focus op persoonlijke aandacht, duidelijke communicatie, en regelmatige waardering. De meeste vrijwilligers vertrekken door gebrek aan erkenning.' }
  ],
  'administratieve-druk-verlagen-ai': [
    { question: 'Kan AI echt administratieve taken overnemen?', answer: 'Ja, AI kan veel repetitieve taken automatiseren zoals notulen maken, rapporten structureren, en e-mails opstellen. Je bespaart gemiddeld 40-60% tijd.' },
    { question: 'Is AI veilig voor gevoelige gegevens?', answer: 'Bij gratis AI-tools niet. Gebruik enterprise versies met verwerkersovereenkomst of anonimiseer alle persoonsgegevens voordat je ze invoert.' },
    { question: 'Hoeveel kost AI-automatisering?', answer: 'Gratis tools zoals ChatGPT Free zijn al bruikbaar. ChatGPT Plus kost €20/maand. Microsoft Copilot is vaak inbegrepen in bestaande licenties.' }
  ],
  'ai-implementeren-non-profit-stappenplan': [
    { question: 'Waar begin ik met AI in mijn organisatie?', answer: 'Start klein met één concreet proces dat veel tijd kost, zoals nieuwsbrieven schrijven of notulen maken. Meet je tijdwinst en breid daarna uit.' },
    { question: 'Heb ik technische kennis nodig voor AI?', answer: 'Nee, moderne AI-tools zoals ChatGPT zijn ontworpen voor niet-technische gebruikers. Je typt gewoon wat je wilt in normale taal.' },
    { question: 'Hoe overtuig ik mijn bestuur van AI?', answer: 'Focus op concrete tijdsbesparing en kostenreductie. Een pilot van 4 weken met meetbare resultaten overtuigt beter dan abstracte beloftes.' }
  ],
  'ai-prompts-voor-non-profits': [
    { question: 'Wat is een goede AI-prompt?', answer: 'Een goede prompt bevat context (wie je bent), de taak (wat je wilt), het format (hoe het eruit moet zien), en eventuele beperkingen (toon, lengte).' },
    { question: 'Werken dezelfde prompts in verschillende AI-tools?', answer: 'Grotendeels wel. Prompts die werken in ChatGPT werken meestal ook in Claude of Copilot, al kunnen kleine aanpassingen nodig zijn.' },
    { question: 'Hoe maak ik AI-output persoonlijker?', answer: 'Geef voorbeelden van je eigen schrijfstijl, vraag om variaties, en bewerk altijd de output met je eigen stem en details.' }
  ],
  'ai-tools-vergelijking-welzijn-2025': [
    { question: 'Welke AI-tool is het beste voor non-profits?', answer: 'ChatGPT Plus biedt de beste prijs-kwaliteit. Microsoft Copilot is handig als je al Microsoft 365 gebruikt. Claude is sterk voor lange teksten.' },
    { question: 'Zijn er gratis AI-tools die goed genoeg zijn?', answer: 'Ja, ChatGPT Free en Claude Free zijn prima voor basisgebruik. Beperkingen zijn langzamere reacties en minder geavanceerde functies.' },
    { question: 'Hoe kies ik tussen ChatGPT en Claude?', answer: 'ChatGPT is beter voor creatieve taken en heeft meer integraties. Claude is beter voor lange documenten en heeft strengere privacy-standaarden.' }
  ],
  'ai-voor-warme-handen-technologie-die-mensen-verbindt': [
    { question: 'Vervangt AI menselijk contact in de zorg?', answer: 'Nee, AI vervangt administratie zodat er meer tijd overblijft voor menselijk contact. Het doel is meer warme handen, niet minder.' },
    { question: 'Is AI ethisch verantwoord in de welzijnssector?', answer: 'Mits correct ingezet wel. De sleutel is transparantie, privacy-first, en AI als hulpmiddel zien, niet als vervanging van professionals.' },
    { question: 'Hoe accepteren medewerkers AI?', answer: 'Door te beginnen met taken die ze vervelend vinden, hen te betrekken bij de keuze, en succesverhalen te delen.' }
  ],
  'chatgpt-voor-non-profits-praktische-toepassingen': [
    { question: 'Hoeveel tijd bespaar ik met ChatGPT?', answer: 'Gemiddeld 5-10 uur per week bij dagelijks gebruik. Nieuwsbrieven, social media posts en e-mails kosten 50-70% minder tijd.' },
    { question: 'Is ChatGPT betrouwbaar voor belangrijke teksten?', answer: 'ChatGPT is een startpunt, geen eindproduct. Controleer altijd feiten, cijfers en namen. Laat belangrijke teksten door een mens reviewen.' },
    { question: 'Kan ik ChatGPT teksten zomaar publiceren?', answer: 'Ja, je hebt het auteursrecht op gegenereerde content. Maar pas teksten altijd aan met je eigen stem en specifieke details.' }
  ],
  'code-sociale-ondernemingen-complete-gids': [
    { question: 'Wat is de Code Sociale Ondernemingen?', answer: 'Een keurmerk dat aantoont dat je organisatie voldoet aan criteria voor transparantie, impact en governance. Het vergroot vertrouwen bij stakeholders.' },
    { question: 'Hoelang duurt het om de Code te behalen?', answer: 'Gemiddeld 3-6 maanden voorbereiding, afhankelijk van hoe goed je governance al op orde is. De aanvraag zelf duurt 4-8 weken.' },
    { question: 'Wat kost het Code-keurmerk?', answer: 'De jaarlijkse bijdrage is inkomensafhankelijk, vanaf circa €250 voor kleine organisaties tot €2.500 voor grotere.' }
  ],
  'cultuurverandering-top-down-inside-out': [
    { question: 'Hoe lang duurt een cultuurverandering?', answer: 'Minimaal 2-3 jaar voor blijvende verandering. Snelle wins zijn mogelijk binnen 6 maanden, maar echte cultuurshift vraagt geduld.' },
    { question: 'Moet cultuurverandering van bovenaf komen?', answer: 'Het moet van beide kanten komen: leiderschap moet het voorbeeld geven, maar medewerkers moeten eigenaarschap voelen.' },
    { question: 'Waarom mislukken de meeste cultuurtrajecten?', answer: 'Door te focussen op communicatie in plaats van gedrag, geen langetermijn commitment, of systemen die oud gedrag belonen.' }
  ],
  'fondsenwerving-voor-sociale-organisaties': [
    { question: 'Hoeveel kost fondsenwerving?', answer: 'De vuistregel is maximaal 25% van de opbrengst aan wervingskosten. Nieuwe donateurs kosten meer dan behoud van bestaande.' },
    { question: 'Welke fondsen geven aan sociale organisaties?', answer: 'Grote landelijke fondsen zoals Oranjefonds en VSBfonds, lokale fondsen, en gemeentelijke subsidies. Match je aanvraag met hun prioriteiten.' },
    { question: 'Hoe schrijf ik een succesvolle subsidieaanvraag?', answer: 'Focus op concrete impact, niet op je organisatie. Gebruik cijfers, vertel verhalen, en sluit exact aan bij de criteria van het fonds.' }
  ],
  'impact-box-70000-geluksmomenten': [
    { question: 'Wat is de Impact Box methode?', answer: 'Een praktische aanpak om impact te meten via geluksmomenten - concrete, tellbare momenten waarop je doelgroep daadwerkelijk geholpen wordt.' },
    { question: 'Hoe tel je geluksmomenten?', answer: 'Definieer wat een geluksmoment is voor jouw organisatie en registreer deze consequent. Bijvoorbeeld een gesprek, maaltijd, of activiteit.' },
    { question: 'Waarom geluksmomenten in plaats van KPIs?', answer: 'Geluksmomenten zijn begrijpelijk voor iedereen en houden de focus op wat ertoe doet: mensen helpen.' }
  ],
  'impact-meten-zonder-excel-drama': [
    { question: 'Moet ik impact meten?', answer: 'Ja, maar houd het simpel. Financiers, besturen en de samenleving verwachten dat je kunt aantonen wat je bereikt met hun geld.' },
    { question: 'Welke tool gebruik ik voor impact meten?', answer: 'Start met een simpele Excel of Google Sheet. Pas later, als je meer dan 100 metingen per maand doet, kijk naar dedicated software.' },
    { question: 'Wat moet ik minimaal meten?', answer: 'Output (wat je doet), outcome (wat verandert), en één impactverhaal per kwartaal. Begin klein en bouw uit.' }
  ],
  'impact-reserve-vrijwilligers-uitlenen': [
    { question: 'Wat is een vrijwilligersreserve?', answer: 'Een pool van flexibel inzetbare vrijwilligers die je kunt uitlenen aan andere organisaties of inzetten bij piekdrukte.' },
    { question: 'Hoe voorkom je dat vrijwilligers overbelast raken?', answer: 'Duidelijke grenzen stellen, maximaal aantal uren per maand, en altijd eerst vragen of het uitkomt.' },
    { question: 'Mag je vrijwilligers uitlenen?', answer: 'Ja, mits de vrijwilliger ermee instemt en je goede afspraken maakt over verzekering en aansturing.' }
  ],
  'innovatie-geen-hype-project': [
    { question: 'Waarom mislukken innovatieprojecten?', answer: 'Door te focussen op technologie in plaats van het probleem, geen echte commitment van leiderschap, of te snel willen opschalen.' },
    { question: 'Hoe maak ik innovatie duurzaam?', answer: 'Begin met een echt probleem, betrek eindgebruikers vanaf dag één, en bouw in kleine stappen met regelmatige evaluaties.' },
    { question: 'Hoeveel budget heb ik nodig voor innovatie?', answer: 'Start met €0 - veel innovatie gaat over anders werken, niet over dure technologie. Investeer pas als je weet wat werkt.' }
  ],
  'interim-manager-kiezen-welzijn': [
    { question: 'Wanneer heb ik een interim-manager nodig?', answer: 'Bij crisissituaties, langdurige vacatures, grote verandertrajecten, of wanneer specifieke expertise ontbreekt in het vaste team.' },
    { question: 'Wat kost een interim-manager?', answer: 'Tarieven variëren van €80-150/uur, afhankelijk van ervaring en opdracht. Sommigen werken met dagdeel- of projecttarieven.' },
    { question: 'Hoe vind ik de juiste interim-manager?', answer: 'Zoek iemand met sectorervaring, vraag referenties, en let op culturele fit. Een goed eerste gesprek is vaak al veelzeggend.' }
  ],
  'lego-serious-play-uitleg-voor-beslissers': [
    { question: 'Wat is LEGO Serious Play?', answer: 'Een facilitatiemethode waarbij deelnemers met LEGO modellen bouwen om complexe vraagstukken te verkennen. Het activeert andere delen van het brein.' },
    { question: 'Is LEGO Serious Play niet kinderachtig?', answer: 'Nee, de methode is ontwikkeld door MIT en LEGO voor volwassenen. Het doorbreekt hiërarchie en stimuleert creatief denken.' },
    { question: 'Hoeveel kost een LEGO Serious Play sessie?', answer: 'Reken op €1.500-3.000 voor een dagdeel, inclusief gecertificeerd facilitator en materialen.' }
  ],
  'lego-serious-play-voor-teamontwikkeling': [
    { question: 'Hoelang duurt een LEGO Serious Play sessie?', answer: 'Minimaal 2-3 uur voor een zinvolle sessie. Een hele dag geeft ruimte voor diepgang en complexere vraagstukken.' },
    { question: 'Hoeveel deelnemers kunnen meedoen?', answer: 'Ideaal 6-12 personen per facilitator. Bij grotere groepen werk je met meerdere facilitators of split je in subgroepen.' },
    { question: 'Wat heb je nodig voor een sessie?', answer: 'Gecertificeerd facilitator, LEGO Serious Play sets, een ruimte met tafels, en een duidelijke vraagstelling.' }
  ],
  'organisatie-funding-ready-90-dagen': [
    { question: 'Wat betekent funding ready?', answer: 'Je organisatie is klaar om financiering te ontvangen: governance op orde, impactmeting opgezet, en een overtuigend verhaal.' },
    { question: 'Kan ik echt in 90 dagen funding ready zijn?', answer: 'Ja, met focus en prioritering. Het gaat niet om perfectie maar om de basis op orde hebben.' },
    { question: 'Wat zijn de belangrijkste eisen van funders?', answer: 'Transparante financiën, duidelijke governance, meetbare impact, en een overtuigend verhaal over je missie.' }
  ],
  'privacy-ai-zorg-avg-checklist': [
    { question: 'Mag ik AI gebruiken met cliëntgegevens?', answer: 'Alleen met enterprise AI-tools die een verwerkersovereenkomst bieden. Gratis tools zijn niet AVG-compliant voor persoonsgegevens.' },
    { question: 'Wat mag wel in AI-tools?', answer: 'Geanonimiseerde data, algemene vragen, conceptteksten zonder persoonsgegevens, en publieke informatie herschrijven.' },
    { question: 'Hoe anonimiseer ik gegevens voor AI?', answer: 'Vervang namen door initialen, verwijder adressen en BSN, en vermijd combinaties waarmee iemand te identificeren is.' }
  ],
  'sociaal-ondernemen-starten-checklist': [
    { question: 'Wat is sociaal ondernemen?', answer: 'Ondernemen met een maatschappelijk doel als primaire missie, waarbij winst een middel is om impact te maken, niet het einddoel.' },
    { question: 'Welke rechtsvorm kies ik als sociaal ondernemer?', answer: 'Stichting als je geen winst wilt uitkeren, BV als je investeerders wilt aantrekken, of coöperatie voor gezamenlijk eigenaarschap.' },
    { question: 'Hoe verdien ik geld als sociaal ondernemer?', answer: 'Via een mix van dienstverlening, subsidies, donaties, en social return contracten. Diversificatie is key.' }
  ],
  'social-enterprise-businessmodel-canvas': [
    { question: 'Wat is een Social Business Model Canvas?', answer: 'Een aangepaste versie van het Business Model Canvas met extra focus op impact, beneficiaries, en maatschappelijke waardepropositie.' },
    { question: 'Waarin verschilt het van een normaal Canvas?', answer: 'Het voegt vakken toe voor impact metrics en surplus use, en onderscheidt betalende klanten van degenen die je helpt.' },
    { question: 'Hoe vaak moet ik mijn canvas updaten?', answer: 'Minimaal jaarlijks, of bij grote strategische wijzigingen. Het is een levend document.' }
  ],
  'subsidie-aanvragen-zonder-bureaucratie-stappenplan': [
    { question: 'Hoeveel subsidieaanvragen worden gehonoreerd?', answer: 'Gemiddeld 15-30% bij grote fondsen. Focus op kwaliteit boven kwantiteit - een goede aanvraag bij het juiste fonds heeft meer kans.' },
    { question: 'Hoe vind ik passende subsidies?', answer: 'Via subsidiedatabases, netwerken met collega-organisaties, en door actief te zoeken op thema en regio.' },
    { question: 'Wat zijn de meest gemaakte fouten?', answer: 'Niet aansluiten bij criteria, te vage impact beschrijving, onrealistische begroting, en te laat beginnen.' }
  ],
  'team-ai-ready-maken': [
    { question: 'Hoe overwin ik weerstand tegen AI?', answer: 'Door te beginnen met problemen die medewerkers zelf frustreren, hen te betrekken bij de keuze, en succes zichtbaar te maken.' },
    { question: 'Moet iedereen AI leren gebruiken?', answer: 'Niet verplicht, maar stimuleer het wel. Begin met early adopters en laat hen ambassadeur worden.' },
    { question: 'Hoelang duurt het om een team AI-ready te maken?', answer: 'Basisvaardigheden in 2-4 weken, echte integratie in werkprocessen in 3-6 maanden.' }
  ],
  'theory-of-change-in-een-middag': [
    { question: 'Wat is een Theory of Change?', answer: 'Een visueel model dat laat zien hoe je activiteiten leiden tot impact. Van input via output naar outcome naar impact.' },
    { question: 'Waarom heb ik een Theory of Change nodig?', answer: 'Het helpt je focus houden, communiceert je verhaal naar stakeholders, en is vaak vereist voor subsidieaanvragen.' },
    { question: 'Kan ik echt in een middag een ToC maken?', answer: 'Een werkbare eerste versie wel. Het hoeft niet perfect te zijn - je verfijnt hem gaandeweg.' }
  ],
  'vier-generaties-vrijwilligers-managen': [
    { question: 'Welke generaties zijn actief als vrijwilliger?', answer: 'Babyboomers, Generatie X, Millennials, en Gen Z. Elk met eigen voorkeuren en communicatiestijlen.' },
    { question: 'Hoe spreek ik jonge vrijwilligers aan?', answer: 'Via social media, met flexibele inzet, duidelijke impact, en mogelijkheden voor persoonlijke ontwikkeling.' },
    { question: 'Werken generaties goed samen?', answer: 'Ja, mits je bewust mixt en de sterke punten van elke generatie benut. Oudere vrijwilligers mentoren vaak graag jongeren.' }
  ],
  'vog-aanvragen-vrijwilligers-stappenplan-2025': [
    { question: 'Is een VOG verplicht voor vrijwilligers?', answer: 'Niet wettelijk verplicht, maar wel sterk aanbevolen bij werken met kwetsbare groepen. Veel subsidiegevers eisen het.' },
    { question: 'Wie betaalt de VOG voor vrijwilligers?', answer: 'Voor vrijwilligers is de VOG gratis via Justis, mits aangevraagd via een erkende organisatie.' },
    { question: 'Hoe lang is een VOG geldig?', answer: 'Er is geen officiële geldigheidsduur, maar de meeste organisaties vragen om de 3-5 jaar een nieuwe aan.' }
  ],
  'vrijwilligers-werven-die-blijven': [
    { question: 'Waarom vertrekken vrijwilligers?', answer: 'Meestal door gebrek aan waardering, onduidelijke verwachtingen, of geen gevoel van betekenis. Zelden door tijdgebrek.' },
    { question: 'Hoeveel vrijwilligers haakt af in het eerste jaar?', answer: 'Gemiddeld 30%. Met goede onboarding en begeleiding breng je dit terug naar 10-15%.' },
    { question: 'Wat werkt beter: werving of behoud?', answer: 'Behoud. Elke behouden vrijwilliger bespaart je de kosten van werven en inwerken van een nieuwe.' }
  ],
  'vrijwilligersbeleid-schrijven-dat-werkt': [
    { question: 'Wat moet in een vrijwilligersbeleid staan?', answer: 'Visie op vrijwilligerswerk, rechten en plichten, begeleiding, onkostenvergoeding, verzekering, en klachtenprocedure.' },
    { question: 'Hoelang moet een vrijwilligersbeleid zijn?', answer: 'Maximaal 10-15 paginas. Het moet leesbaar en praktisch zijn, geen juridisch document.' },
    { question: 'Hoe vaak moet ik het beleid updaten?', answer: 'Minimaal elke 3 jaar, of eerder bij wijzigende regelgeving of organisatieveranderingen.' }
  ],
  'vrijwilligerscheck-talenten-matchen': [
    { question: 'Hoe ontdek ik talenten van vrijwilligers?', answer: 'Door te vragen, te observeren, en proefperiodes te bieden. Mensen onderschatten vaak hun eigen talenten.' },
    { question: 'Wat als een vrijwilliger niet past bij de functie?', answer: 'Praat erover en zoek samen naar een betere match. Dwingen leidt tot vertrek, herplaatsen behoudt de vrijwilliger.' },
    { question: 'Moet elke vrijwilliger een intakegesprek hebben?', answer: 'Ja, minimaal een kennismakingsgesprek. Het kost 30 minuten maar voorkomt maanden van mismatch.' }
  ],
  'vrijwilligersplatform-bouwen-of-kopen': [
    { question: 'Wat kost een vrijwilligersplatform?', answer: 'Van gratis (Google Sheets) tot €500+/maand voor enterprise. De meeste organisaties hebben genoeg aan €50-150/maand.' },
    { question: 'Wanneer bouw je zelf vs. kopen?', answer: 'Kopen tenzij je hele specifieke eisen hebt én technische capaciteit. Bouwen kost meer tijd dan je denkt.' },
    { question: 'Welke platformen zijn geschikt voor non-profits?', answer: 'Populair zijn Volunteerbase, Salesforce Nonprofit, en Point. Kies op basis van budget en functionaliteit.' }
  ]
};

const dir = './content/kennisbank';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const slug = file.replace('.md', '');
  const faqs = faqData[slug];

  if (faqs) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('faq_items:')) {
      let faqYaml = 'faq_items:\n';
      faqs.forEach(faq => {
        faqYaml += `  - question: "${faq.question}"\n`;
        faqYaml += `    answer: "${faq.answer}"\n`;
      });

      content = content.replace(
        /^(author_name:)/m,
        faqYaml + '$1'
      );

      fs.writeFileSync(filePath, content);
      console.log('Added FAQs to:', file);
    }
  }
});
console.log('Done adding FAQs');
