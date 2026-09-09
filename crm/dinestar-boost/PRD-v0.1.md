# Dinestar Boost — Product Requirements Document — v0.1 (eerste concept)

September 2026 | Vertrouwelijk | Concept ter bespreking

Gebaseerd op: het eerdere PRD-document van Peter, het 2026 Executieplan Dinestar Manager,
de Positionering & GTM-strategie 2026, en klantfeedback van Hans Schluter & Maarten
(Schmesch Holding, 7 september 2026).

> Let op: dit is een eerste concept — dit document is bedoeld om samen verder aan te
> scherpen, niet als vaststaand gegeven.

## 01 Samenvatting

Dinestar Boost is de AI-laag die bovenop Dinestar Manager draait. Manager (ons label op de
WaiterAid-technologie) organiseert de operatie van een restaurant en maakt zichtbaar waar
capaciteit onbenut blijft: rustige momenten, lege tafels, gasten die wegblijven. Boost neemt die
zichtbare capaciteit en zet die automatisch en gericht weg bij de juiste gasten, zodat de
capaciteit daadwerkelijk gevuld wordt.

Boost is geen zelfstandig platform en geen los verkocht product: het is de functionaliteit die het
verschil maakt tussen Manager (organiseren en inzicht) en Podium / Podium Pro (vraag
genereren en actief sturen op groei). Boost wordt daarom uitsluitend verkocht als onderdeel van
de Podium- en Podium Pro-pakketten.

Kernbelofte: meer gasten, meer rendement, minder werk. AI is een middel om dat te
bereiken, geen verkoopargument op zich — dat principe is leidend voor elke functiebeschrijving
in dit document.

## 02 Het probleem

Restaurants die Dinestar Manager gebruiken, hebben al reserverings- en gastdata. Wat
ontbreekt, is een systeem dat die data omzet in actie. Reserveringssystemen en
kassasystemen registreren wat er gebeurt; ze grijpen niet in wanneer een dinsdagavond leeg
dreigt te blijven of wanneer een vaste gast al drie maanden niet is teruggekomen.

Dit sluit direct aan bij wat Hans Schluter en Maarten (Schmesch Holding) als restaurateurs
aangaven: hun reserveringsproces functioneert prima, maar de grootste commerciële kans ligt
in het beter vullen van rustige momenten en lege tafels — niet in het automatiseren van het
reserveringsproces zelf. Dat is precies het gat dat Boost moet dichten.

## 03 Visie

De grote droom: op termijn kan Boost alle lege tafels van een restaurant vullen — via allerlei
verschillende mechanismen, lerend van patronen over het hele Dinestar-netwerk heen, tot op
het niveau van gastsegmenten en kanalen, en zo steeds specifieker de juiste gast op de juiste
manier bereiken zonder gasten onnodig vaak te benaderen.

Voor v0.1 begint dat bij het eerste, kleinste werkende stuk daarvan: elk restaurant dat Dinestar
Manager gebruikt, kan zijn beschikbare capaciteit automatisch laten vullen door Boost —
zonder dat de eigenaar of GM daar handmatig tijd in hoeft te steken. De functies in sectie 06
groeien richting die grotere ambitie; niet alles hoeft er in de eerste versie al te zijn.

Bewust in gewone taal geformuleerd: geen "AI-native platform", geen technische claims. Boost
moet zich in elke uiting — inclusief de eigen productteksten in de interface — gedragen volgens
hetzelfde principe als de rest van de propositie: resultaat voorop, AI ondersteunend.

## 04 Doelgroep & scope

- Primair: professionele, reserveringsgedreven restaurants in de BeNeLux met een
  Google-rating van 4,0 of hoger, doorgaans vanaf circa 50 couverts — dezelfde doelgroep
  als Dinestar Manager, niet uitsluitend fine dining.
- Launchvolgorde: Haarlem (Founding Partners live vanaf september 2026), gevolgd door
  Amsterdam (oktober 2026), daarna stad-voor-stad conform het Executieplan.
- Secundair, na de eerste 50 restaurants: restaurantgroepen met meerdere locaties.
- Nadrukkelijk buiten scope voor v0.1: internationale markten buiten de BeNeLux, andere
  valuta dan euro. Internationale uitrol met dezelfde penetratieratio als de BeNeLux is het
  einddoel, maar dat speelt op zijn vroegst vanaf jaar 4 — de architectuur moet dat niet
  actief blokkeren, maar hoeft er voor v0.1 nog niet op ingericht te zijn.
- Verwacht aantal reserveringen dat uiteindelijk verwerkt kan worden (planning binnen 5-10
  jaar): met een gemiddelde van zo'n 40 reserveringen per restaurant per dag over de
  hele mix:
  - 2.500 restaurants × 40 = 100.000 reserveringen/dag
  - Per week: ~700.000
  - Per maand: ~3 miljoen
  - Per jaar: ~36 miljoen reserveringen/jaar

  Dit is het BeNeLux-cijfer, gelijk aan het 2035-doel uit de Positionering & GTM-strategie.
  Een wereldwijd cijfer met dezelfde penetratieratio is aanzienlijk groter, maar nog niet
  berekend — dat hangt af van de doelmarkt per land en wordt pas relevant zodra
  internationale uitrol concreet wordt (ten vroegste jaar 4).

## 05 Productpijlers

- **Pijler 1 — Zichtbaarheid.** Op basis van Manager-data wordt zichtbaar waar en wanneer
  capaciteit onbenut blijft, en welke gasten dreigen weg te blijven.
- **Pijler 2 — Gerichte actie.** Boost zet die zichtbare capaciteit om in kleine, relevante acties —
  vanuit een concrete lege tafel de meest passende gasten selecteren, niet een brede nieuwsbrief
  naar de hele gastenlijst.
- **Pijler 3 — Bewijs.** Elke actie is meetbaar en herleidbaar: welke omzet kwam waar vandaan, is
  die omzet aannemelijk incrementeel, en heeft het abonnement zich voor het restaurant
  terugverdiend.

## 06 Functionaliteiten

### 6.1 Capaciteits- en bezettingsinzicht
Visuele weergave (heatmap) van bezetting per dag en tijdslot op basis van Manager-data, met
markering van rustige momenten en herhaalpatronen. Naast actuele en historische bezetting
voorspelt Boost ook welke aankomende momenten waarschijnlijk rustig worden, op basis van
eerdere patronen (en waar beschikbaar: evenementen, schoolvakanties, weer). Dat maakt het
mogelijk om al eerder bij te sturen via 6.2, in plaats van pas te reageren als de leegte er al is.
Vormt de basisinput voor alle overige Boost-functies.

### 6.2 Micro-campagnes vanuit lege capaciteit (kern van Boost)
Vanuit een specifiek leeg tijdslot of aankomende rustige periode selecteert Boost een kleine,
relevante groep gasten (op basis van voorkeur, bezoekmoment en bestedingspatroon) en
spreekt die gericht aan, nooit als brede campagne naar de volledige gastenlijst. Welk kanaal
daarvoor wordt gebruikt, bepaalt Boost per gast op basis van wat aantoonbaar het beste werkt
(zie 6.4).

### 6.3 Gastreactivering
Signaleert gasten die langer dan gebruikelijk zijn weggebleven en genereert een kant-en-klare,
gepersonaliseerde boodschap (naam, bezoekfrequentie, laatste gelegenheid, passend aanbod),
gekoppeld aan concreet beschikbare capaciteit. De GM beoordeelt de boodschap, past aan
waar nodig en verstuurt. Welk kanaal wordt ingezet, bepaalt Boost op dezelfde manier als bij
6.2 (zie 6.4).

### 6.4 Kanaal- en aanbodoptimalisatie
Boost registreert per actie (6.2, 6.3, 6.5 en 6.13) welk kanaal, moment, aanbod en type prikkel
is ingezet en of dat tot een boeking leidde. Op basis van die uitkomsten past Boost de kanaal-
en aanbodkeuze aan naar wat aantoonbaar het beste werkt — eerst op segmentniveau, per
gast zodra daar voldoende geschiedenis voor is. Bij onvoldoende data start Boost met een
vaste standaardvolgorde: eigen kanalen eerst, retargeting als aanvulling. De GM kan altijd zien
welk kanaal en aanbod is gekozen en waarom.

Op termijn leert Boost niet alleen van de geschiedenis van één restaurant, maar van
geanonimiseerde, geaggregeerde patronen over het hele Dinestar-netwerk — bijvoorbeeld welk
kanaal of aanbod bij een vergelijkbaar restaurant en gastsegment het beste werkt. Dat lost
meteen de koude-startvraag op: een nieuw restaurant profiteert direct van wat elders al is
geleerd, in plaats van bij nul te beginnen. Gastdata zelf wordt nooit gedeeld tussen restaurants
— alleen de geleerde patronen.

Boost coördineert bovendien tussen triggers (zie 08).

### 6.5 Slimme aanbiedingen voor rustige momenten
Voor de allerrustigste, moeilijkst te vullen momenten kan Boost een gerichte prikkel toevoegen
aan de uitnodiging uit 6.2 of 6.3 — bijvoorbeeld een korting, een gratis aperitief of een
vergelijkbaar voordeel — in plaats van alleen een uitnodiging zonder stimulans. Het aanbod
gaat naar dezelfde kleine, relevante groep, nooit breed. Omdat een aanbod de gerealiseerde
omzet per gast verlaagt, telt dit mee in de terugverdien-check en het attributiemodel: de
werkelijke, na-aanbod-omzet is wat telt, niet de volle prijs. De GM bepaalt vooraf de kaders
(welk type aanbod, maximale waarde); Boost past dat toe binnen die kaders.

### 6.6 No-show voorspelling & preventie
Risicoscore per boeking op basis van historische patronen, met geautomatiseerde
herinneringen 24 uur en 4 uur voor de reservering en keuze om aanbetaling aan te zetten bij
verhoogd risico.

### 6.7 Wachtlijstoptimalisatie
Bij een annulering of andere vrijgekomen tafel checkt Boost automatisch eerst de wachtlijst:
koppelt de best passende gast (op basis van gezelschapsgrootte en bestedingspatroon) aan de
vrijgekomen plek. Is er geen passende match, dan wordt de vrijgekomen capaciteit automatisch
meegenomen in de eerstvolgende micro-campagne (zie 6.2) — een annulering hoeft zo niet
vanzelf een lege plek te blijven.

Daarnaast kunnen bekende gasten zich actief aanmelden voor een "last-minute plek" op rustige
avonden, zodat Boost een grotere, vooraf geïnteresseerde groep heeft om uit te putten zodra er
capaciteit vrijkomt — in plaats van alleen te werken met wie toevallig op dat moment al op de
wachtlijst staat.

### 6.8 Terugverdien-check
Direct voortvloeiend uit de rendementsgarantie die centraal staat in de commerciële propositie:
een rekenmodule die de nulmeting, de abonnementskosten en de gerealiseerde (en als
incrementeel ingeschatte) omzet samenbrengt tot een periodiek, concreet oordeel per
restaurant: heeft het abonnement zich terugverdiend? Zonder deze functionaliteit is de garantie
niet uitvoerbaar.

### 6.9 Attributie- en incrementaliteitsmodel
Kernvereiste voor facturatie én voor eerlijke resultaatcommunicatie: elke reservering en
bijbehorende omzet wordt gelabeld als eigen kanaal, via Dinestar, of via Boost, met een
percentage per label voor facturatie. Daarnaast wordt per Boost-gerelateerde reservering een
inschatting gemaakt of deze aannemelijk incrementeel is — een Dinestar-reservering wordt
nooit automatisch als extra omzet gepresenteerd.

### 6.10 Rapportage & transparantie
Elk inzicht en elke actie is uit te klappen naar een korte, begrijpelijke toelichting: wat is er
gesignaleerd, waarom, en wat is het verwachte effect. Wekelijks overzicht met de belangrijkste
inzichten en resultaten van de afgelopen week. Daarnaast een korte samenvatting vóór
aanvang van de dienst (wat is er vandaag relevant: gaten in de planning, VIP-gasten, wachtlijst)
en een korte recap na afloop (wat is er gebeurd, wat heeft het opgeleverd).

### 6.11 Multi-locatie
Geconsolideerd overzicht en vergelijking tussen locaties voor restaurantgroepen. Relevant
zodra de eerste 50 restaurants live zijn en de eerste restaurantgroepen instappen — geen
prioriteit voor de eerste release.

### 6.12 Capaciteitsadvies aan de GM
Naast het rechtstreeks benaderen van gasten signaleert Boost ook structurele patronen aan het
restaurant zelf — bijvoorbeeld: "donderdag 20:00 loopt al maanden structureel leeg, overweeg
een extra tijdslot te openen of de minimale groepsgrootte te verlagen." Boost adviseert; de
uitvoering (tafelindeling aanpassen, tijdslot openen) blijft bij Manager — zelfde grens als bij
groepsreserveringen.

### 6.13 Social media-content vanuit lege capaciteit
Naast gerichte een-op-een communicatie (6.2, 6.3) kan Boost ook contentvoorstellen genereren
voor de eigen social kanalen van het restaurant — bijvoorbeeld Instagram of Facebook —
gekoppeld aan concrete beschikbaarheid, rustige momenten, events of menu. Boost bereidt
een kant-en-klare post of story voor; de GM beoordeelt, past aan waar nodig en publiceert.

Of social wordt ingezet voor een specifiek gat in de capaciteit, bepaalt Boost via dezelfde
afweging als bij andere kanalen (zie 6.4): wat het naar verwachting oplevert tegenover hoe vaak
en hoe breed gasten of volgers worden benaderd. Social is daarmee een kanaaloptie binnen de
bestaande kanaal- en aanbodoptimalisatie, geen apart mechanisme met eigen regels.

### 6.14 Upsell vóór reservering
Vóór een bevestigde reservering stuurt Boost een automatische, gepersonaliseerde boodschap
met de mogelijkheid om alvast een menu te kiezen of de reservering te upgraden (bijvoorbeeld
een arrangement of extra's). Anders dan 6.2 en 6.3 is het doel hier niet het vullen van lege
capaciteit, maar het verhogen van de besteding per reservering die al vaststaat.

## 07 Data & integraties

- Primaire databron: Dinestar Manager (WaiterAid) — realtime reserverings-, tafel- en
  gastdata (waaronder gastprofiel, contactgegevens, bezoekfrequentie en voorkeuren). Dit
  is de basis waarop Boost draait, geen secundaire integratie naast handmatige uploads:
  zonder een werkende Manager-koppeling heeft Boost niets om mee te werken.
- Toegang & inlog: Boost wordt ontsloten binnen de Manager-omgeving — één account,
  één sessie, één navigatie, geen los in te loggen platform. Dit is een randvoorwaarde voor
  de techniek, niet alleen voor de vormgeving.
- Valuta & taal: alle bedragen, voorbeelden en berekeningen in euro's, in het Nederlands
  als primaire taal van de interface met Engels als tweede taal en het liefst Zweeds als
  derde taal.
- Gastdata blijft per restaurant en wordt nooit gedeeld met andere restaurants; alleen
  geanonimiseerde, geaggregeerde patronen (welk kanaal/aanbod werkt bij welk type
  restaurant en gastsegment) worden sectorbreed benut.

## 08 UX-principes

- Resultaatgericht, niet technologiegericht. Geen "AI-native", geen jargon, geen
  verwijzingen naar modellen of machine learning in de interface — elke functie wordt
  uitgelegd in termen van meer gasten, meer rendement of minder werk.
- Mobile-first. GM's en eigenaars gebruiken hun telefoon, niet een bureaustoel.
- Uitlegbaar. Elk inzicht en elke actie toont waarom die is gesignaleerd en wat het
  verwachte effect is (zie 6.10).
- Klein en gericht. Acties vertrekken vanuit concrete, actuele capaciteit — geen brede
  campagnes "voor de zekerheid".
- Eén systeem voor de klant. Boost is voor het restaurant geen apart product met een
  eigen inlog — het is te bereiken en te bedienen vanuit de Dinestar Manager-omgeving
  zelf, met dezelfde navigatie, uitstraling en login. De klant hoeft nooit te merken dat Boost
  technisch een aparte laag is. Dat betekent ook: één centraal overzicht van wat Boost
  signaleert en adviseert (zie 6.1, 6.10, 6.12), niet losse widgets naast elkaar.
- Niet opdringerig. Boost benadert een gast nooit vanuit meerdere mechanismen tegelijk.
  Voordat een campagne, reactivering of ander contactmoment een gast benadert,
  controleert Boost of die gast recent al via een ander mechanisme is benaderd — zodat
  gasten niet binnen korte tijd meerdere berichten van hetzelfde restaurant krijgen. Eén
  gecoördineerd contactmoment per gast, ongeacht hoeveel mechanismen er onder de
  motorkap actief zijn.

## 09 Product-KPI's

Dit zijn productgebruiks-KPI's, ter aanvulling op — niet ter vervanging van — de commerciële
en financiële KPI's uit het Executieplan (aantal live restaurants, pakketmix, subscription MRR,
take rate).

- Tijd tot eerste bruikbaar inzicht na koppeling met Dinestar Manager
- % van gesignaleerde lege capaciteit dat daadwerkelijk wordt opgevuld via Boost
- % van Boost-gerelateerde omzet die als aannemelijk incrementeel wordt ingeschat
- No-showreductie bij restaurants met de no-show-functie actief
- % restaurants met een positieve terugverdien-check binnen de garantieperiode
- Open- en boekingsconversie van gastreactiveringsberichten

## 10 Risico's & open vragen

- Welke technische stack/leverancier wordt daadwerkelijk gebruikt voor de AI-laag? Te
  bevestigen met engineering/WaiterAid — de vorige PRD-versie noemde een
  "Hercules"-platform dat nergens anders terug te vinden was en waarschijnlijk een restant
  was van een andere template.
- Toestemming werkt per kanaal anders en moet apart per gast worden vastgelegd —
  sms/WhatsApp en retargeting vragen andere consent dan e-mail, en de proactieve
  wachtlijst (6.7) vraagt een eigen opt-in. Openstaand: welke toestemming al beschikbaar is
  vanuit Manager, en welk deel Boost zelf moet vastleggen en beheren voordat een gast
  via een kanaal benaderd mag worden.
- Technische haalbaarheid van naadloze embedding in de Manager-omgeving (single
  sign-on, gedeelde navigatie) moet worden bevestigd met engineering/WaiterAid. Manager
  draait op WaiterAid's eigen technologie — hoe ver embedding kan gaan, hangt af van wat
  dat platform toelaat, en dat ligt deels buiten onze eigen controle.

## 11 Bronnen

- Toetsing PRD — Dinestar Boost (software-specificatie), 8 september 2026
- 2026 Executieplan Dinestar Manager
- Dinestar Manager — Positionering & GTM-strategie 2026
- Dinestar Manager Salespresentatie (Google Slides, "260907 Dinestar Manager
  Salespresentatie"), 7 september 2026
- Dinestar Manager Salespresentatie — abonnementen versie (Jeroen, versie 3), 7
  september 2026
- Presentatie Hans Schluter en compagnon Maarten — Potentiële Founding Partner,
  notulen 7 september 2026
- Mondelinge toelichting Stéphanie van Gerven, 8 september 2026
