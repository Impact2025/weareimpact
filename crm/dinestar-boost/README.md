# Dinestar Boost — dossier

> **Isolatie:** dit dossier bevat vertrouwelijke informatie over Dinestar Boost / Schmesch Holding.
> Gebruik, noem of vergelijk nooit informatie hieruit in een gesprek over een ander klantdossier,
> en andersom. Zie [`../README.md`](../README.md) voor de volledige regel.

## Wat is dit

Dinestar Boost is de AI-laag die bovenop Dinestar Manager (WaiterAid-technologie) draait: het
zet zichtbare, onbenutte restaurantcapaciteit automatisch en gericht om in geboekte gasten.
Boost wordt uitsluitend verkocht als onderdeel van de Podium- en Podium Pro-pakketten van
Dinestar Manager — geen los product, geen los platform.

## Status

- **v0.1 (concept, september 2026)** — eerste PRD-concept, ter bespreking. Zie
  [`PRD-v0.1.md`](PRD-v0.1.md).
- Launchvolgorde: Haarlem (Founding Partners, vanaf sept 2026) → Amsterdam (okt 2026) → stad
  voor stad.
- Belangrijkste klantcontact tot nu toe: Hans Schluter & Maarten (Schmesch Holding), gesprek
  7 september 2026. Dagelijks aanspreekpunt/PRD-eigenaar aan klantzijde: Stéphanie van Gerven.
- Huidige fase: **scoping/offerte**, geen bouwfase — PRD v0.1 is binnen, vragen aan klant en
  aan WaiterAid staan open, offerte volgt zodra die antwoorden er zijn. Zie "Projectoverzicht"
  hieronder voor de actuele status; niet zelf aannemen dat development al gestart is.

## Belangrijkste openstaande vraag

De technische haalbaarheid van naadloze embedding in de Manager-omgeving (SSO, gedeelde
navigatie, data-API-toegang) is **nog niet bevestigd met WaiterAid-engineering** — dit bepaalt
de architectuur en daarmee de doorlooptijd van het hele project. Zie
[`open-vragen.md`](open-vragen.md), sectie "WaiterAid-integratie" — dit is de vraag die het eerst
beantwoord moet worden, vóór er productcode geschreven wordt.

## Bestanden

- [`PRD-v0.1.md`](PRD-v0.1.md) — het volledige PRD-concept (september 2026)
- [`open-vragen.md`](open-vragen.md) — **interne/technische** openstaande vragen (WaiterAid-integratie,
  consent, attributie) — niet klant-facing, blijven hier als bestand.
- [`gespreksverslagen/`](gespreksverslagen/) — verslagen van gesprekken over dit project

## Klantportal (magic link)

Een klein, apart onderdeel in de bestaande `weareimpact`-app geeft de klant (Schmesch Holding)
via een persoonlijke, tijdelijke link toegang tot een **gecureerde** vragenlijst — nooit de ruwe
`open-vragen.md` hierboven, die is voor intern/WaiterAid-gebruik. De klant beantwoordt de vragen
in gesprek met Iris (chat): Iris stelt de vragen één voor één, vraagt door (max. 2 keer per
onderwerp) bij een vaag antwoord, en rondt af met een samenvatting + voorgestelde
vervolgstappen die je terugziet op `/admin/dossiers/dinestar-boost`.

- Code: `src/app/portal/[project]/` (chat-UI), `src/app/api/crm/portal/[project]/chat/`
  (gespreks-API + tool-calling), `src/lib/crm/chat.ts` (systeemprompt + tools),
  `src/app/api/crm/magic-link/`, `src/lib/crm/`.
- Schema: `supabase/crm-portal-schema.sql` (tabellen `crm_projects`, `crm_questions`,
  `crm_magic_links`), aangemaakt via `scripts/create-crm-portal-tables.js`.
- Vragen, mijlpalen, afspraken en actiepunten beheer je in `/admin/dossiers/dinestar-boost`
  (tabblad Overzicht/Vragen/Gesprekken) — `scripts/seed-crm-dinestar-boost.js` is alleen nog de
  initiële seed, niet de manier om dagelijks te muteren.
- Een link versturen: via de knop op `/admin/dossiers/dinestar-boost`, of
  `node scripts/send-crm-magic-link.js dinestar-boost hans@schmesch.nl` (7 dagen geldig,
  single-use; na verificatie krijgt de klant een sessie van 30 dagen voor dat ene project).
- Isolatie: elk project heeft zijn eigen cookie en het token is cryptografisch gebonden aan de
  project-slug — een sessie voor dit project geeft geen toegang tot een ander dossier.

## Projectoverzicht (mijlpalen, afspraken, actiepunten)

Naast de vragenlijst houdt het dossier nu ook een gedeeld projectoverzicht bij, zodat er één
plek is waar de status van het project staat — niet alleen in e-mails of iemands hoofd:

- **Mijlpalen** (tijdlijn): status todo/bezig/klaar, bv. "PRD ontvangen" → "Antwoorden klant
  verzameld" → "Offerte verstuurd".
- **Afspraken/beslissingen**: een log van wat is vastgesteld, bv. dat PRD v0.1 het uitgangspunt
  is voor de offerte.
- **Actiepunten**: wie moet wat doen (Vincent, klant, of WaiterAid), met status.

Elk item heeft een `client_visible`-vlag (standaard uit). Alleen wat jij expliciet aanzet, ziet de
klant terug in het tabblad "Voortgang" op zijn eigen portal-pagina — dezelfde isolatie-logica als
bij de vragenlijst: de klant ziet nooit meer dan wat jij bewust deelt.

Iris' gespreksafronding (`finish_conversation`) zet haar voorgestelde vervolgstap ook automatisch
als (intern) actiepunt neer, zodat gespreksuitkomsten niet los in tekst blijven staan maar
meteen op het dashboard belanden.
