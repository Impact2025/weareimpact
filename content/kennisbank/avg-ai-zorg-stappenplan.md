---
slug: avg-ai-zorg-stappenplan
title: "AVG-proof AI implementeren in de zorg: stappenplan 2026"
subtitle: "Zo combineer je innovatie met privacy — zonder boetes"
excerpt: "AI in de zorg en AVG gaan prima samen — mals je het goed inricht. Dit stappenplan laat zien hoe je veilig en compliant AI implementeert in je zorg- of welzijnsorganisatie."
category_slug: ai-tech
tags: [AVG, AI, zorg, privacy, compliance, EU AI Act, implementatie]
seo_title: "AVG-proof AI Implementeren in de Zorg | Stappenplan 2026"
seo_description: "AVG-proof AI implementeren in de zorg: compleet stappenplan 2026. ✓ Privacy ✓ Human-in-the-loop ✓ EU AI Act ✓ Anonimisering. Direct toepasbaar."
seo_keywords: [AVG AI zorg, privacy AI zorg, AVG-proof AI implementeren, AI zorg AVG compliant, EU AI Act zorg, AI en privacy welzijn]
reading_time: 11
difficulty: intermediate
author_name: Vincent van Munster
author_title: Strategic Innovation Partner
published_at: 2026-06-25
header_type: color
header_color: slate
header_title: "AVG-proof AI in de zorg"
---

"Ja maar Vincent, mag dat wel met de AVG?" Het is de vraag die ik het vaakst hoor aan bestuurstafels in de zorg en het welzijn. En het is een goede vraag. Niemand wil een boete van de Autoriteit Persoonsgegevens of — nog erger — een datalek met cliëntgegevens.

Het goede nieuws: AI en AVG gaan prima samen. Je moet alleen weten hoe. Dit stappenplan laat je zien hoe je veilig en compliant AI implementeert.

## Stap 1: breng schaduw-AI in kaart

Voordat je begint met een mooie AI-strategie, is de eerste stap: kijk wat er al gebeurt. Uit onderzoek blijkt dat medewerkers in de zorg massaal gratis consumentenversies van ChatGPT en Claude gebruiken voor hun werk. Ze anonimiseren een tekstje en plakken het in de chat. Dat doen ze met de beste bedoelingen — maar het is een groot AVG-risico.

Alles wat in de gratis versie van ChatGPT wordt ingevoerd, kan worden gebruikt voor modeltraining. Jouw cliëntdata ligt dan op servers in de VS, zonder contractuele bescherming.

**Actie:** Doe een inventarisatie. Vraag je team: wie gebruikt welke AI-tools? Waarvoor? Maak het bespreekbaar — niemand hoeft bang te zijn voor straf, het gaat om bewustwording. Gebruik de <a href="/ai-proof-checklist">gratis AI-proof checklist</a> om te zien of jouw organisatie klaar is.

## Stap 2: kies de juiste juridische basis

Niet elk AI-gebruik in de zorg heeft dezelfde juridische basis. Voor administratieve ondersteuning (samenvatten van notulen, opstellen van rapportages) kun je een beroep doen op gerechtvaardigd belang. Voor beslissingen die directe gevolgen hebben voor cliënten, heb je toestemming of een wettelijke plicht nodig.

De EU AI Act, die per augustus 2026 volledig van kracht is, classificeert AI-systemen in de zorg vaak als 'hoog-risico'. Dat betekent strengere eisen op het gebied van transparantie, menselijk toezicht en documentatie.

**Actie:** Laat een privacy-impactanalyse (PIA) uitvoeren voordat je een nieuwe AI-tool implementeert. Dit is geen bureaucratische exercitie — het helpt je om risico's te identificeren voordat ze problemen worden.

## Stap 3: anonimiseer aan de poort

Dit is de belangrijkste technische maatregel. Zorg dat persoonsgegevens worden gefilterd voordat ze een AI-model bereiken. Een anonymization layer scant inkomende tekst op namen, BSN's, adresgegevens en geboortedata en vervangt ze door labels als [Cliënt A] of [Hulpverlener B].

Ik heb dit zelf gebouwd voor Iris, de AI-assistent voor welzijnsprofessionals. Het filter draait lokaal en zorgt dat er nooit onversleutelde persoonsgegevens het model bereiken. De context blijft behouden, de privacy is gewaarborgd.

**Actie:** Implementeer een anonimiseringsfilter voordat je AI op cliëntdata loslaat. Dit is technisch eenvoudig en juridisch essentieel.

## Stap 4: werk met enterprise-licenties

Gratis AI-tools zijn geen optie voor de zorg. Sluit altijd een zakelijke enterprise-licentie af of werk via API-koppelingen met contractuele garanties. In die overeenkomst staat zwart-op-wit dat jouw data niet wordt gebruikt voor modeltraining en dat de data in de EU (of een land met gelijkwaardig beschermingsniveau) blijft.

**Actie:** Check alle AI-tools die je gebruikt. Hebben ze een enterprise-overeenkomst? Zo niet: vervangen door een veilig alternatief.

## Stap 5: houd de mens in de loop

AVG artikel 22 verbiedt volledig automatische besluitvorming met ingrijpende gevolgen. In de zorg is dat extra belangrijk. Een AI mag nooit zelfstandig beslissen over de zorgtoewijzing van een cliënt.

De werkwijze is simpel: AI doet het voorwerk, de professional controleert en accordeert. AI schrijft concepten, structureert rapportages, analyseert trends — maar een mens zet de laatste stap.

**Actie:** Stel een protocol op waarin staat bij welke processen AI mag ondersteunen en waar de menselijke check verplicht is. Train je medewerkers hierin.

## Stap 6: documenteer alles

De EU AI Act vereist dat je kunt aantonen welke AI-systemen je gebruikt, waarvoor, en welke risicoclassificatie ze hebben. Zorg voor een AI-register waarin je dit bijhoudt. Het hoeft geen dik dossier te zijn — een helder overzicht in een spreadsheet volstaat, zls het maar actueel en compleet is.

**Actie:** Maak een AI-register aan. Noteer per tool: naam, leverancier, doel, datacategorieën, risiconiveau, verwerkingsgrondslag.

## Stap 7: train je medewerkers

AVG-compliance is geen eenmalige exercitie. Het begint bij bewustwording op de werkvloer. Medewerkers moeten weten wat ze wel en niet mogen doen met AI-tools. Geef ze veilige alternatieven voor de gratis consumententools die ze nu gebruiken.

Een goede training gaat niet alleen over wat niet mag, maar ook over wat wél kan. Laat zien hoe AI hen kan ondersteunen zonder dat ze privacy-schendingen riskeren.

## Van angst naar vertrouwen

Ik weet uit ervaring dat privacy-angst de grootste rem is op innovatie in de zorg. Toen ik als directeur van Stichting de Baan begon met AI-ondersteunde rapportages, was de eerste reactie: "Mag dat wel?" Door stap voor stap te laten zien hoe de anonimisering werkt, wie toegang heeft tot wat, en waar de menselijke check zit, veranderde angst in vertrouwen.

Het geheim? Niet beginnen bij de techniek, maar bij de mensen. Zodra je team begrijpt dat AI geen bedreiging is voor de privacy van cliënten maar een hulpmiddel om betere zorg te leveren, is de weg vrij.

<blockquote>
Wat neem je mee
- Inventariseer eerst welke AI-tools medewerkers al gebruiken (schaduw-AI)
- Anonimiseer persoonsgegevens voordat ze een AI-model bereiken
- Werk uitsluitend met enterprise-licenties of API's met contractuele waarborgen
- Houd de mens in de loop: AI adviseert, de professional beslist
- Documenteer je AI-gebruik in een register (EU AI Act-vereiste)
</blockquote>

Wil je weten of jouw organisatie AVG-proof is? <a href="/contact">Plan een vrijblijvend gesprek</a> en ik kijk met je mee. Of doe eerst de <a href="/ai-proof-checklist">gratis AI-proof checklist</a> voor een eerste indruk.

## Veelgestelde vragen

**Mag ik gratis ChatGPT gebruiken voor het samenvatten van cliëntrapportages?** Nee, beslist niet. Alles wat in de gratis consumentenversie wordt ingevoerd, kan worden gebruikt voor modeltraining. Jouw cliëntdata ligt dan zonder bescherming op Amerikaanse servers. Gebruik altijd een enterprise-licentie of een API-koppeling met contractuele garanties dat data privé blijft.

**Wat is het verschil tussen een PIA en een AI-register?** Een privacy-impactanalyse (PIA) is een eenmalige risicoanalyse die je uitvoert vóór implementatie van een nieuwe AI-tool. Een AI-register is een doorlopend overzicht van alle AI-systemen die je gebruikt, met hun doelen, risicoclassificatie en verwerkingsgrondslagen. Beide zijn verplicht onder de EU AI Act voor hoog-risico AI-systemen.

**Hoe zit het met aansprakelijkheid als AI een verkeerde conclusie trekt over een cliënt?** De eindverantwoordelijkheid ligt altijd bij de professionele zorgverlener. AI is een hulpmiddel, geen beslisser. Zolang je human-in-the-loop toepast — AI adviseert, de professional accordeert — blijf je compliant. Zonder menselijke controle overtreed je niet alleen de AVG (art. 22), maar loop je ook onnodig juridisch risico.
