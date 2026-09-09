# Concept e-mail aan Stéphanie — vragen vóór offerte

> Concept, ter beoordeling door Vincent voordat dit verstuurd wordt. Vincent verstuurt 'm zelf.

---

Hoi Stéphanie,

Bedankt voor het fijne gesprek — ik heb er ontzettend veel zin in om samen met jou aan Dinestar
Boost te gaan werken. Precies het soort project waar ik heel graag mijn tanden in zet.

Ik heb 'm meteen besproken met Iris, mijn AI-assistent, die zoals altijd weer met een aantal
scherpe vragen kwam. Zou je die onderstaande vragen kunnen beantwoorden? Dan kan ik daarmee een
realistische offerte maken in plaats van een slag in de lucht. Sommige overlappen met wat je zelf
al noemde — laten we die dan meteen samen uitzoeken. Ik heb ze gegroepeerd zodat je ze eventueel
kunt doorzetten naar de juiste persoon bij WaiterAid.

**Technische afhankelijkheden (WaiterAid/Manager)**
1. Welke delen van dit PRD draaien al in WaiterAid/Manager (reserverings-API, gast-CRM,
   autorisatie)?
2. Hoe ziet de API van Manager eruit — realtime webhooks, of moeten we data ophalen via
   batch-pull?
3. Hoeveel flexibiliteit geeft WaiterAid voor het inbedden van Boost in de Manager-omgeving
   (iframe, native SDK, of iets anders)? Dit bepaalt in grote mate de architectuur.

**Data & privacy**
4. Hoe is toestemming (opt-in) per kanaal nu al geregeld in Manager — e-mail, sms/WhatsApp,
   retargeting? En moeten we die flows deels opnieuw bouwen voor Boost?
5. Hoeveel historische reserveringsdata is er beschikbaar per restaurant? Voor het
   incrementaliteitsmodel (6.9) hebben we voldoende geschiedenis nodig om zinvol te kunnen
   rekenen.
6. Welke AI-provider heeft de voorkeur, of is dat aan ons — OpenAI, Anthropic, of iets wat
   WaiterAid zelf al beheert?

**Commercieel**
7. Is de septemberdatum voor Haarlem (Founding Partners) haalbaar, gegeven dat de
   WaiterAid-afhankelijkheden hierboven nog niet zijn afgestemd? Ik wil die datum serieus
   nemen, maar dan moeten we deze punten wel snel boven water krijgen.
8. Wie is contractueel de opdrachtgever — bouwen wij dit vóór Dinestar/WaiterAid, of zet
   Dinestar dit intern op en huren jullie ons daarbij in?
9. Heb je een indicatie van budget-range en het gewenste model (vaste prijs, uurtarief, of
   gezien de rendementsgarantie in het PRD een deels resultaatafhankelijk model)?
10. Bij de schaalambitie uit het PRD (100.000 reserveringen/dag op termijn) lopen ook de
    AI-/API-kosten op — wie draagt die, zit dat in het abonnement of is dat apart?

**Scope**
11. Welke functies uit sectie 06 zijn voor jou het absolute minimum om in september live te
    gaan? Het PRD zegt zelf al dat we niet alles in v0.1 hoeven te hebben — ik wil weten wat voor
    jou en de Founding Partners echt het verschil maakt.

Laat me weten wat je makkelijk zelf kunt beantwoorden en wat beter rechtstreeks met iemand van
WaiterAid-engineering besproken kan worden — dan plan ik dat gesprek graag mee in.

Groet,
Vincent
