# Addendum I bij de verwerkersovereenkomst (Bijlage 2)

Inzake uitbreiding verwerkingsdoelen, databronnen en infrastructuur voor Spoor 3 (Dinestar AI Matching Platform)

## Partijen

**Dinestar B.V.**, gevestigd te Buitenveldertselaan 106, 1081 AB Amsterdam, ingeschreven in het Handelsregister van de Kamer van Koophandel onder nummer 34247205, ten deze rechtsgeldig vertegenwoordigd door mevrouw S.J.A. van Gerven, Head of Dinestar Manager (hierna: "Verwerkingsverantwoordelijke");

en

**WeAreImpact B.V.**, gevestigd te Planetenweg 5, 2132 HN Hoofddorp, ingeschreven in het Handelsregister van de Kamer van Koophandel onder nummer 70285888, ten deze rechtsgeldig vertegenwoordigd door de heer V. van Munster, Directeur (hierna: "Verwerker");

gezamenlijk aangeduid als "Partijen" en ieder afzonderlijk als "Partij".

## Overwegingen

A. Partijen hebben op 25 september 2026 een Overeenkomst van Opdracht gesloten inzake de ontwikkeling en het beheer van "Dinestar Boost", waarvan Bijlage 2 de Verwerkersovereenkomst conform artikel 28 AVG vormt;

B. Verwerkingsverantwoordelijke en Verwerker zijn per heden een nadere opdrachtbevestiging overeengekomen voor de bouw en inzet van het Dinestar AI Matching Platform ("Spoor 3", referentie OFF-2026-WAI-003-v2);

C. Deze werkzaamheden omvatten een uitbreiding van de verwerkingsdoelen (waaronder actieve gastreactivering vanuit historische reserveringen), de toevoeging van het V3-systeem van Verwerkingsverantwoordelijke als databron, alsmede de inzet van een dedicated VPS-infrastructuur;

D. Partijen wensen conform artikel 28 AVG en artikel 15 van de hoofdovereenkomst deze specifieke uitbreidingen, alsmede aanvullende privacywaarborgen aangaande het uitsluiten van bijzondere persoonsgegevens, schriftelijk vast te leggen in dit Addendum.

## Artikel 1. Uitbreiding doel van de verwerking

In aanvulling op artikel 2.1 van Bijlage 2 (Verwerkersovereenkomst) verwerkt Verwerker persoonsgegevens tevens voor het volgende specifieke doel:

- Het indexeren van historische reserveringsdata en het realtime identificeren van dreigende onderbezetting bij aangesloten restaurants.
- Het genereren van gepersonaliseerde 1-op-1 uitnodigingen en matchingvoorstellen gericht op het vullen van rustige shifts tijdens najaarscampagnes (waaronder Dining with the Stars).
- Het presenteren van gegenereerde matches binnen een centrale Human-in-the-Loop reviewcockpit (/queue), waarin uitsluitend geautoriseerde medewerkers van Verwerkingsverantwoordelijke matches fiatteren vóórdat communicatie aan betrokkenen wordt verzonden.

## Artikel 2. Databronnen en categorieën persoonsgegevens

**Databronnen.** In aanvulling op WaiterAid (BokaBord) wordt het V3-systeem van Verwerkingsverantwoordelijke (historische gastdata van Dinestar events, deals en reserveringscampagnes) aangewezen als geautoriseerde databron.

**Toegestane categorieën gegevens.** Verwerker verwerkt in het kader van Spoor 3 uitsluitend de volgende reguliere persoonsgegevens:

- Contactgegevens: voornaam, achternaam, e-mailadres en telefoonnummer.
- Reserveringshistorie: bezoekdata, geboekte tijdstippen/shifts, restauranttype, gezelschapsgrootte, planhorizon en historische DWTS-campagneaffiniteit.
- Afgeleide operationele labels: segmentatie naar bezoekfrequentie (zoals de VIP-kern) en responsindicatoren.

## Artikel 3. Harde uitsluiting bijzondere persoonsgegevens (art. 9 AVG)

In aanvulling op artikel 3 van Bijlage 2 verklaren Partijen uitdrukkelijk dat géén bijzondere categorieën van persoonsgegevens in de zin van artikel 9 AVG worden verwerkt, opgeslagen of geprofileerd.

- Verwerker richt een programmatische filter en blacklist in binnen de data-ingestie-pipeline. Vrije-tekstvelden en notities die medische gegevens, dieetwensen of allergieën bevatten (zoals noten-, gluten- of zwangerschapsnotities), worden voorafgaand aan indexering, clustering of modelinput direct hard uitgesloten en gewist.
- Het is Verwerker verboden om gasten te segmenteren, te profileren of te benaderen op basis van gezondheidsgegevens of allergie-informatie.

## Artikel 4. Aanvulling subverwerkers (Bijlage 2A)

Verwerkingsverantwoordelijke verleent hierbij specifieke toestemming voor het toevoegen van de volgende subverwerker aan Bijlage 2A:

| Subverwerker | Functie / doel | Locatie / land | Doorgiftewaarborg |
|---|---|---|---|
| Dedicated Cloud VPS Provider (Hetzner Online GmbH / TransIP B.V.) | Veilige Ubuntu VPS-infrastructuur, Docker containers en SQLite WAL database voor het Matching Platform | Duitsland / Nederland (EER) | Binnen EER; AVG van toepassing. Data at rest en in transit versleuteld (TLS/AES-256) |

Verwerker waarborgt dat met deze hostingpartij een verwerkersovereenkomst conform artikel 28 AVG is gesloten en dat de data te allen tijde binnen de Europese Economische Ruimte (EER) blijft.

## Artikel 5. Status en verantwoording voorafgaande data-inspectie

Partijen stellen vast dat de door Verwerker op 6 oktober 2026 uitgevoerde analyse op de dataset uitsluitend diende als een interne, technische haalbaarheidstoets. Deze toetsing was strikt beperkt tot het valideren van querysnelheden, datavolumes en stabiliteit binnen de SQLite WAL-architectuur.

Bij deze technische analyse zijn geen persoonsgegevens geëxporteerd, gemuteerd, verrijkt of gedeeld met derden.

Partijen bevestigen dat de structurele, productiematige verwerking van persoonsgegevens voor Spoor 3 pas formeel aanvangt na volledige ondertekening van dit Addendum en de offerte OFF-2026-WAI-003-v2.

## Artikel 6. Overige bepalingen en rangorde

Alle bepalingen, verplichtingen, aansprakelijkheidsclausules (artikel 11) en beveiligingsstandaarden uit de hoofdovereenkomst d.d. 25 september 2026 en Bijlage 2 blijven onverkort en ongewijzigd van kracht.

Bij eventuele tegenstrijdigheden tussen dit Addendum en de oorspronkelijke Verwerkersovereenkomst (Bijlage 2), prevaleert hetgeen in dit Addendum is bepaald ten aanzien van de werkzaamheden onder Spoor 3.

Dit Addendum treedt in werking op de datum van ondertekening door beide Partijen.

**Aldus overeengekomen en in tweevoud ondertekend te Amsterdam:**

| Namens Dinestar B.V. (Verwerkingsverantwoordelijke) | Namens WeAreImpact B.V. (Verwerker) |
|---|---|
| Naam: Stéphanie van Gerven | Naam: Vincent van Munster |
| Functie: Head of Dinestar Manager | Functie: Directeur |
| Datum: 9 oktober 2026 | Datum: 9 oktober 2026 |
| Handtekening: | Handtekening: |
