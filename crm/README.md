# CRM / Dossiers — WeAreImpact klantprojecten

Elke submap hieronder is het dossier van één klant/project (bijvoorbeeld `dinestar-boost/`).

## Kernregel: strikte isolatie tussen dossiers

**Iris (of welke assistent dan ook) werkt per sessie binnen precies één dossiermap en gebruikt,
noemt of vergelijkt nooit informatie uit een andere klantmap.** Elk dossier bevat vertrouwelijke,
bedrijfsgevoelige informatie van een specifieke klant/opdrachtgever. Dit betekent concreet:

- Geen voorbeelden, cijfers, quotes of technische details uit dossier A gebruiken in een gesprek
  over dossier B — ook niet anoniem of "ter vergelijking".
- Geen samenvattingen die meerdere klanten in één antwoord noemen.
- Bij twijfel of iets uit een ander dossier komt: niet gebruiken, en het aan de gebruiker melden.
- Deze regel geldt ook voor toekomstige automatiseringen (zoekfuncties, rapportages) die over
  meerdere dossiers heen zouden kunnen kijken — die moeten per dossier gescoped blijven, niet
  cross-dossier standaard aanzetten.

## Structuur per dossier

```
crm/<klant-project>/
  README.md              — oriëntatie: wat is dit project, status, links
  PRD-vX.md               — laatste productdocumenten
  open-vragen.md           — openstaande vragen, wie moet ze beantwoorden, status
  gespreksverslagen/       — verslagen van gesprekken (intern of met de klant)
```

## Dossiers

- [`dinestar-boost/`](dinestar-boost/README.md) — Dinestar Boost (AI-laag op Dinestar Manager / WaiterAid), klant: Schmesch Holding (Hans Schluter & Maarten) e.a.
