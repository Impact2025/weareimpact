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
  7 september 2026.

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
`open-vragen.md` hierboven, die is voor intern/WaiterAid-gebruik.

- Code: `src/app/portal/[project]/`, `src/app/api/crm/portal/[project]/questions/`,
  `src/app/api/crm/magic-link/`, `src/lib/crm/`.
- Schema: `supabase/crm-portal-schema.sql` (tabellen `crm_projects`, `crm_questions`,
  `crm_magic_links`), aangemaakt via `scripts/create-crm-portal-tables.js`.
- Klantvragen voor dit project staan geseed via `scripts/seed-crm-dinestar-boost.js` — pas dat
  bestand aan om vragen toe te voegen/wijzigen (er is nog geen admin-UI voor).
- Een link versturen: `node scripts/send-crm-magic-link.js dinestar-boost hans@schmesch.nl`
  (7 dagen geldig, single-use; na verificatie krijgt de klant een sessie van 30 dagen voor dat
  ene project).
- Isolatie: elk project heeft zijn eigen cookie en het token is cryptografisch gebonden aan de
  project-slug — een sessie voor dit project geeft geen toegang tot een ander dossier.
