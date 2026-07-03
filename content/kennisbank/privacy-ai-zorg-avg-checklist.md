---
slug: privacy-ai-zorg-avg-checklist
title: "Privacy en AI in de zorg: wat mag wel en wat niet?"
subtitle: "AVG-proof werkwijze met praktische checklist voor veilig AI-gebruik"
excerpt: "AI gebruiken met cliëntgegevens - mag dat? In dit artikel leg ik uit wat wel en niet mag volgens de AVG, en geef ik een praktische checklist voor veilig AI-gebruik in zorg en welzijn."
category_slug: ai-tech
tags:
  - AI
  - privacy
  - AVG
  - GDPR
  - zorg
  - compliance
seo_title: "Privacy en AI in de Zorg | AVG Checklist voor Veilig AI-Gebruik"
seo_description: "Wat mag wel en niet met AI en persoonsgegevens in de zorg? Praktische AVG-checklist voor veilig AI-gebruik met cliëntgegevens."
seo_keywords:
  - ai privacy avg
  - ai zorg avg
  - chatgpt persoonsgegevens
  - ai compliance zorg
  - avg ai checklist
reading_time: 11
published_at: "2025-01-04"
difficulty: intermediate
lead_magnet_title: "AI Privacy Checklist (PDF)"
lead_magnet_description: "Printbare checklist voor AVG-compliant AI-gebruik in je organisatie."
lead_magnet_type: checklist
faq_items:
  - question: "Mag ik AI gebruiken met cliëntgegevens?"
    answer: "Alleen met enterprise AI-tools die een verwerkersovereenkomst bieden. Gratis tools zijn niet AVG-compliant voor persoonsgegevens."
  - question: "Wat mag wel in AI-tools?"
    answer: "Geanonimiseerde data, algemene vragen, conceptteksten zonder persoonsgegevens, en publieke informatie herschrijven."
  - question: "Hoe anonimiseer ik gegevens voor AI?"
    answer: "Vervang namen door initialen, verwijder adressen en BSN, en vermijd combinaties waarmee iemand te identificeren is."
author_name: Vincent van Munster
author_title: "AI & Privacy Expert voor Zorg/Welzijn"
---

> "Mag ik dit wel in ChatGPT typen?"

Deze vraag krijg ik dagelijks. En terecht - de regels rond AI en persoonsgegevens zijn onduidelijk en de risico's zijn reëel.

In dit artikel leg ik uit wat wel en niet mag volgens de AVG, met een praktische checklist die je direct kunt gebruiken.

**Disclaimer:** Dit artikel is informatief bedoeld, geen juridisch advies. Raadpleeg bij twijfel je Functionaris Gegevensbescherming of een privacy-jurist.

---

## Inhoudsopgave

1. [Begin met een schaduw-AI inventarisatie](#schaduw-ai)
2. [De kern van het probleem](#probleem)
3. [Wat zegt de AVG over AI?](#avg)
4. [De drie risicocategorieën](#categorieen)
5. [Praktische checklist](#checklist)
6. [Per tool: wat mag wel/niet](#tools)
7. [Veilig AI-gebruik: 7 principes](#principes)
8. [Verwerkersovereenkomst: wanneer nodig?](#verwerkersovereenkomst)
9. [Bronnen en actuele richtlijnen](#bronnen)

---

## Begin met een schaduw-AI inventarisatie {#schaduw-ai}

Voordat je een privacybeleid opstelt, is de eerste stap: kijk wat er al gebeurt. Medewerkers in de zorg en het welzijn gebruiken vaak al massaal gratis consumentenversies van ChatGPT en Claude, met de beste bedoelingen maar zonder dat het bewust is afgestemd op de AVG. Toen ik dit zelf bij Stichting de Baan onderzocht, ontdekte ik dat bijna elk teamlid weleens een tekstje had geanonimiseerd en in een gratis chat had geplakt — zonder te weten dat dit een risico is.

Vraag je team simpelweg: wie gebruikt welke AI-tools, waarvoor? Maak het bespreekbaar zonder verwijt — het gaat om bewustwording, niet om straf. Deze inventarisatie is de meest waardevolle 30 minuten die je aan AI-privacy kunt besteden, want pas als je weet wat er al gebeurt, weet je waar je beleid op moet aansluiten.

## De kern van het probleem {#probleem}

Wanneer je tekst in ChatGPT typt, gebeuren er twee dingen:

1. **Verwerking:** De AI verwerkt je tekst om een antwoord te genereren
2. **Opslag:** De tekst kan worden opgeslagen en gebruikt voor training

Bij persoonsgegevens is dit problematisch:
- Je bent verantwoordelijk voor die gegevens (AVG)
- Je moet weten waar ze naartoe gaan
- Je moet toestemming hebben voor de verwerking

### Het praktische dilemma

Je wilt:
- Een cliëntrapportage laten samenvatten
- Een subsidieaanvraag laten schrijven met cliëntgegevens
- Een e-mail over een specifieke situatie formuleren

Maar die tekst bevat persoonsgegevens. Wat nu?

---

## Wat zegt de AVG over AI? {#avg}

De AVG (Algemene Verordening Gegevensbescherming) gaat niet specifiek over AI, maar de principes zijn duidelijk:

### Grondslag voor verwerking

Je hebt een geldige grondslag nodig om persoonsgegevens te verwerken. De meest relevante voor AI-gebruik:

- **Toestemming:** De betrokkene heeft expliciet toestemming gegeven
- **Gerechtvaardigd belang:** Je hebt een legitiem belang dat zwaarder weegt dan privacy
- **Uitvoering overeenkomst:** Nodig voor de dienstverlening

### Doelbinding

Je mag gegevens alleen gebruiken voor het doel waarvoor ze zijn verzameld. Als je cliëntgegevens verzamelt voor hulpverlening, mag je ze niet zomaar in een AI-tool stoppen voor efficiency.

### Minimale gegevensverwerking

Gebruik niet meer gegevens dan nodig. Als je een rapportage wilt laten schrijven, heeft de AI geen NAW-gegevens nodig.

### Verwerker vs. verantwoordelijke

Als je een AI-tool gebruikt:
- **Jij** bent verantwoordelijke (je bepaalt het doel)
- **De AI-aanbieder** is verwerker (voert uit)

Dit betekent: je hebt een verwerkersovereenkomst nodig.

---

## De drie risicocategorieën {#categorieen}

Ik deel AI-toepassingen in drie risicocategorieën:

### Groen: Veilig ✅

**Geen persoonsgegevens betrokken**

Voorbeelden:
- Algemene teksten schrijven
- Beleidsdocumenten formuleren
- Social media content maken
- Onderzoek naar sectorcijfers

**Actie:** Vrij te gebruiken, ook met gratis tools.

### Oranje: Voorzichtig ⚠️

**Geanonimiseerde of niet-gevoelige gegevens**

Voorbeelden:
- Rapportages met initialen in plaats van namen
- Geaggregeerde data (geen individuen herkenbaar)
- Conceptteksten die nog geredigeerd worden

**Actie:** Mag met betaalde versies (ChatGPT Plus, Claude Pro), bij voorkeur met training uitgezet.

### Rood: Niet doen 🚫

**Identificeerbare persoonsgegevens of bijzondere gegevens**

Voorbeelden:
- Namen + medische informatie
- BSN-nummers
- Strafrechtelijke gegevens
- Religieuze of seksuele gegevens
- Alles waarmee een individu direct te identificeren is

**Actie:** Niet in publieke AI-tools. Alleen met enterprise-versies met verwerkersovereenkomst, of niet.

---

## Praktische checklist {#checklist}

Print deze checklist en gebruik hem bij twijfel:

### Voordat je gegevens invoert:

**Stap 1: Identificatie**
- [ ] Bevat de tekst namen van personen?
- [ ] Bevat de tekst andere identificerende gegevens (adres, BSN, geboortedatum)?
- [ ] Zou iemand de persoon kunnen herkennen uit de context?

→ Als ja op een van deze: ga naar stap 2

**Stap 2: Gevoeligheid**
- [ ] Betreft het gezondheidsgegevens?
- [ ] Betreft het financiële gegevens?
- [ ] Betreft het strafrechtelijke gegevens?
- [ ] Betreft het gegevens van kinderen?

→ Als ja op een van deze: **STOP - niet invoeren in publieke AI-tools**

**Stap 3: Noodzakelijkheid**
- [ ] Zijn deze gegevens echt nodig voor de AI-taak?
- [ ] Kan ik de gegevens anonimiseren?

→ Als je kunt anonimiseren: doe dat en ga door

**Stap 4: Tool-check**
- [ ] Gebruik ik een enterprise-versie met verwerkersovereenkomst?
- [ ] Is de training-optie uitgezet?

→ Als nee: niet gebruiken voor deze gegevens

---

## Per tool: wat mag wel/niet {#tools}

### ChatGPT

| Versie | Mag wel | Mag niet |
|--------|---------|----------|
| **Gratis** | Algemene teksten | Persoonsgegevens |
| **Plus (€20/mnd)** | Geanonimiseerde data | Identificeerbare gegevens |
| **Team (€25/mnd)** | Geanonimiseerde data | Identificeerbare gegevens |
| **Enterprise** | Met verwerkersovereenkomst | - |

**Training uitzetten:** Settings → Data Controls → "Improve the model for everyone" UIT

Zie [OpenAI Privacy](https://openai.com/policies/privacy-policy) voor details.

### Claude

| Versie | Mag wel | Mag niet |
|--------|---------|----------|
| **Gratis** | Algemene teksten, geanonimiseerd | Identificeerbaar |
| **Pro (€18/mnd)** | Idem | Identificeerbaar |
| **Team/Enterprise** | Met verwerkersovereenkomst | - |

Claude heeft de sterkste privacy-default: data wordt niet voor training gebruikt. Zie [Anthropic Privacy](https://www.anthropic.com/privacy).

### Microsoft Copilot

| Versie | Mag wel | Mag niet |
|--------|---------|----------|
| **Gratis (Bing)** | Algemene teksten | Persoonsgegevens |
| **Pro (€22/mnd)** | Geanonimiseerd | Identificeerbaar |
| **M365 Copilot** | Met tenant-instellingen | Afhankelijk van configuratie |

Enterprise-versies via Microsoft 365 vallen onder je bestaande Microsoft-verwerkersovereenkomst.

### Perplexity

| Versie | Mag wel | Mag niet |
|--------|---------|----------|
| **Gratis** | Onderzoek, algemeen | Persoonsgegevens |
| **Pro** | Onderzoek, algemeen | Persoonsgegevens |

Perplexity is primair voor onderzoek - gebruik het niet voor persoonsgegevens.

---

## Veilig AI-gebruik: 7 principes {#principes}

### Principe 1: Anonimiseer standaard

Maak er een gewoonte van:
- Vervang namen door [Naam] of initialen
- Verwijder adressen, geboortedata, BSN
- Gebruik functionele beschrijvingen ("de cliënt", "betrokkene")

**Voorbeeld:**
- ❌ "Jan de Vries (12-05-1948) uit Amsterdam heeft diabetes"
- ✅ "[Cliënt, man, 75+] heeft een chronische aandoening"

### Principe 2: Vraag je af: is dit nodig?

Voor veel AI-taken heb je geen persoonsgegevens nodig:
- Structuur van een rapport → geen namen nodig
- Stijl van een brief → geen details nodig
- Format van een aanvraag → geen cliëntdata nodig

### Principe 3: Minimaliseer altijd

Geef de AI niet meer dan nodig:
- Niet het hele dossier, maar de relevante passage
- Niet alle details, maar de kern

### Principe 4: Controleer de output

AI kan persoonsgegevens "onthouden" of hallucteren:
- Check of de output geen ongewenste details bevat
- Pas aan voordat je deelt

### Principe 5: Documenteer je keuzes

Leg vast:
- Welke tools je gebruikt waarvoor
- Hoe je omgaat met persoonsgegevens
- Wie verantwoordelijk is

### Principe 6: Train je team

Iedereen moet weten:
- Wat wel en niet mag
- Hoe te anonimiseren
- Waar ze terecht kunnen met vragen

### Principe 7: Blijf bij

De regels veranderen. Volg:
- [Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl/themas/algoritmes-en-ai)
- [European Data Protection Board](https://edpb.europa.eu/)
- Updates van je AI-tools

---

## Verwerkersovereenkomst: wanneer nodig? {#verwerkersovereenkomst}

### Wanneer verplicht

Een verwerkersovereenkomst is nodig wanneer:
- Een derde partij persoonsgegevens verwerkt namens jou
- Dit structureel gebeurt (niet incidenteel)

### Voor AI-tools betekent dit

| Situatie | Verwerkersovereenkomst nodig? |
|----------|------------------------------|
| Gratis ChatGPT, geen persoonsgegevens | Nee |
| ChatGPT Plus, geanonimiseerd | Nee |
| ChatGPT Enterprise, met persoonsgegevens | Ja |
| Microsoft 365 Copilot | Via bestaande M365 overeenkomst |

### Waar vind je ze?

- [OpenAI Data Processing Addendum](https://openai.com/policies/data-processing-addendum)
- [Microsoft DPA](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA)
- [Google Cloud DPA](https://cloud.google.com/terms/data-processing-addendum)

---

## Bronnen en actuele richtlijnen {#bronnen}

### Nederlandse bronnen

- **[Autoriteit Persoonsgegevens - AI](https://www.autoriteitpersoonsgegevens.nl/themas/algoritmes-en-ai)** - Actuele Nederlandse richtlijnen
- **[NEN 7510](https://www.nen.nl/nen-7510-1-2017-nl-245399)** - Informatiebeveiliging in de zorg
- **[KNMG Richtlijnen](https://www.knmg.nl/)** - Specifiek voor medische context

### Europese bronnen

- **[EU AI Act](https://artificialintelligenceact.eu/)** - De nieuwe Europese AI-wetgeving (gefaseerde invoering 2024-2027)
- **[EDPB Guidelines on AI](https://edpb.europa.eu/)** - Europese privacytoezichthouders

### Praktische hulpmiddelen

- **[DPIA tool](https://www.autoriteitpersoonsgegevens.nl/themas/beveiliging/data-protection-impact-assessment-dpia)** - Voor impact assessments
- **[Privacy Impact Assessment template](https://www.rijksoverheid.nl/)** - Rijksoverheid template

---

## De EU AI Act: wat komt eraan?

De [EU AI Act](https://artificialintelligenceact.eu/) wordt gefaseerd ingevoerd (2024-2027). Relevante punten:

### Hoog-risico AI

AI-systemen in zorg en welzijn worden waarschijnlijk als "hoog-risico" geclassificeerd. Dit betekent:
- Verplichte risicobeoordeling
- Menselijk toezicht vereist
- Transparantie-eisen

### Generatieve AI

Tools zoals ChatGPT moeten:
- Duidelijk maken dat content AI-gegenereerd is
- Copyright-bescherming respecteren
- Trainingdata documenteren

### Wat betekent dit voor jou?

Voorlopig: documenteer je AI-gebruik goed. De eisen worden strenger, niet soepeler.

---

## Praktisch: wat doe ik nu?

### Morgen

1. Check welke AI-tools je team gebruikt
2. Zet training-opties uit waar mogelijk
3. Communiceer basis-richtlijnen (niet identificeerbaar invoeren)

### Deze maand

1. Stel een kort AI-privacy-beleid op
2. Train je team op veilig gebruik
3. Identificeer waar enterprise-versies nodig zijn

### Dit kwartaal

1. Sluit verwerkersovereenkomsten waar nodig
2. Doe een mini-DPIA voor je belangrijkste AI-use cases
3. Documenteer je keuzes

---

## Tot slot

Privacy en AI hoeven niet conflicteren. Met de juiste voorzorgsmaatregelen kun je AI gebruiken én privacy respecteren.

De kernregel is simpel:

> **"Als je twijfelt of het mag, anonimiseer. Als je niet kunt anonimiseren, gebruik dan geen publieke AI-tool."**

---

## Hulp nodig?

Als privacy-bewust AI-expert help ik organisaties veilig te werken met AI. Niet door alles te verbieden, maar door werkbare richtlijnen te ontwikkelen.

Neem contact op via [WeAreImpact.nl](https://weareimpact.nl) voor advies.


---

## Gerelateerde artikelen

- [Administratieve druk verlagen met AI: 7 processen die je vandaag kunt automatiseren](/kennisbank/administratieve-druk-verlagen-ai)
- [AI implementeren in je non-profit: stappenplan van 8 weken](/kennisbank/ai-implementeren-non-profit-stappenplan)
- [25 AI-prompts die ik dagelijks gebruik voor mijn werk](/kennisbank/ai-prompts-voor-non-profits)

---

*Dit artikel is geschreven door Vincent van Munster en wordt regelmatig bijgewerkt. Laatste update: juli 2026. Dit is geen juridisch advies.*
