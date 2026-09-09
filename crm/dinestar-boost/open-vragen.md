# Dinestar Boost — openstaande vragen

Status: 🔴 open · 🟡 deels beantwoord · 🟢 beantwoord

Bij het beantwoorden van een vraag: status bijwerken, antwoord + bron + datum toevoegen, en
(indien van toepassing) verwijzen naar het verslag in `gespreksverslagen/`.

## WaiterAid-integratie (blokkerend — eerst beantwoorden)

Dit bepaalt de architectuur en daarmee de doorlooptijd van het hele project.

- 🔴 Welke data-API's/webhooks biedt WaiterAid al voor Manager (reserverings-, tafel- en
  gastdata, realtime of batch)?
- 🔴 Is embedding van Boost binnen de Manager-omgeving mogelijk via SSO-federatie
  (Boost als losse backend/frontend, ingesloten via gedeelde sessie/token), of moet Boost
  functioneel binnen WaiterAid's eigen platform/codebase draaien?
- 🔴 Wie is de technische contactpersoon bij WaiterAid om dit mee door te nemen?
- 🔴 Wat was het "Hercules"-platform dat in de vorige PRD-versie werd genoemd? Lijkt een
  restant van een andere template — navragen of dit ooit een bewuste keuze was of een
  fout in het vorige document.
- 🔴 Welke SLA's/rate limits gelden er op de WaiterAid-koppeling (relevant voor de
  schaalambitie: 100.000 reserveringen/dag op termijn)?

## Consent & compliance

- 🔴 Welke toestemming (opt-in) legt Manager al vast per gast, en voor welke kanalen
  (e-mail, sms/WhatsApp, retargeting)?
- 🔴 Welk deel van de consent-registratie moet Boost zelf bijhouden en beheren, vóórdat een
  gast via een kanaal benaderd mag worden?
- 🔴 Hoe wordt de opt-in voor de proactieve wachtlijst (6.7, "last-minute plek") vastgelegd?
- 🔴 AVG-toetsing: wie is verantwoordelijk (verwerkersovereenkomst tussen WeAreImpact/
  Dinestar en WaiterAid, en tussen Dinestar en het restaurant)?

## Commercieel / attributie

- 🟡 Hoe wordt de "aannemelijke incrementaliteit" (6.9) precies gedefinieerd/berekend —
  is hier al een methodiek uit het Executieplan of moet die nog ontworpen worden?
- 🔴 Wat is de exacte nulmeting-methodiek voor de terugverdien-check (6.8) — welke periode,
  welke baseline?
- 🔴 Hoe wordt gefactureerd wanneer omzet gedeeltelijk aan meerdere labels toegerekend
  wordt (eigen kanaal / via Dinestar / via Boost)?

## Product / scope

- 🟢 Doelgroep en launchvolgorde zijn duidelijk (zie PRD sectie 04).
- 🟡 Prioriteitsvolgorde van functies 6.1–6.14 voor v0.1 — voorstel gedaan (zie gesprek
  met Vincent, nog niet met klant/WaiterAid afgestemd): 6.9 → 6.8 → 6.1 → 6.6 → 6.2/6.3 → 6.4
  → later 6.5, 6.7, 6.12, 6.13, 6.14, 6.11.
