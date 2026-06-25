# SEO Uitrolplan — WeAreImpact (wereldklasse)

> **Doel:** Van 25/137 index naar 100+ geindexeerd in < 30 dagen.
> **Status:** Live-fixes deployed (dubbele titles, sitemap, contact metadata).
> **Auteur:** Hermes Agent | **Datum:** 25 juni 2026

---

## 0. Diagnose: waarom zijn nu maar 25 van de 137 pagina's geindexeerd?

Na onderzoek van de broncode, sitemap, robots.txt en live pagina's zijn dit de 5 hoofdoorzaken:

| # | Probleem | Impact | Bewijs |
|---|----------|--------|--------|
| 1 | **Dubbele title-tags** (nu gefixt) | Google ziet keyword stuffing → kwaliteitskorting | 10 paginas hadden `| WeAreImpact | WeAreImpact` |
| 2 | **Ontbrekende pagina's in sitemap** (nu gefixt) | Google kent de URL niet | `/vincent-van-munster` en 5 anderen misten |
| 3 | **Blog draait `force-dynamic`** | Google rendert JS, maar indexeert trager omdat dynamische content minder snel wordt opgeslagen | Blog/[slug]/page.tsx heeft `export const dynamic = 'force-dynamic'` |
| 4 | **Oude WordPress-URLs in index** | Crawl budget lekt naar 301-redirects | GSC: 137 URLs bekend, maar 67 in sitemap = 70 oude URLs |
| 5 | **Domeinautoriteit is laag** | Nieuw domein (of domein met weinig backlinks) krijgt minder crawl budget | Nog geen zichtbare backlink-strategie |

**De echte bottleneck is combinatie #3 (dynamische rendering) + #5 (lage autoriteit).** Google is terughoudend met indexeren van dynamische JS-paginas op sites met lage autoriteit.

---

## Fase 1 — Technische Quick Wins (dag 1-3)

### ✅ 1.1 Dubbele titles — GEFIXT
10 layout.tsx bestanden aangepast. Na deploy: klaar.

### ✅ 1.2 Sitemap uitgebreid — GEFIXT
6 paginas toegevoegd: `/vincent-van-munster`, `/interim-verandermanagement-ai-sociaal-domein`, `/interim`, `/privacy`, `/voorwaarden`, `/cookies`. 67 → 73 URLs.

### ✅ 1.3 Contactpagina metadata — GEFIXT
`src/app/contact/layout.tsx` aangemaakt met eigen title, description, OG.

### ⬜ 1.4 Blog: `force-dynamic` → ISR (revalidate: 3600)

**Waarom:** Blogposts zijn zelden zo actueel dat ze elke request opnieuw server-rendered moeten worden. `force-dynamic` voorkomt dat Google de HTML kan cachen.

**Actie:** In `src/app/blog/[slug]/page.tsx`, verander:
```ts
export const dynamic = 'force-dynamic';
```
naar:
```ts
export const revalidate = 3600; // hergenereer elk uur
```

**Uitzondering:** Als de view-counter (`UPDATE posts SET views = views + 1`) realtime moet zijn, splits de increment naar een aparte API-call (client-side) zodat de pagina zelf statisch kan zijn. Of verlaag naar `revalidate = 300` (5 min).

### ⬜ 1.5 ISR forceren op alle dynamische paginas

Check of `/kennisbank/[slug]/page.tsx` nog `generateStaticParams` gebruikt zonder ISR. Voeg `revalidate` toe waar het mist.

### ⬜ 1.6 GSC: handmatige indexering aanvragen

**Direct na deploy:**
1. Ga naar Google Search Console > URL Inspection
2. Submit deze URLs 1 voor 1:
   - `https://weareimpact.nl/`
   - `https://weareimpact.nl/vincent-van-munster`
   - `https://weareimpact.nl/ai-proof-checklist`
   - `https://weareimpact.nl/ai-consultant-sociaal-domein`
   - `https://weareimpact.nl/ai-strategie-consultant`
   - `https://weareimpact.nl/change-management-digitale-transformatie`
   - `https://weareimpact.nl/programmamanager-digitale-transformatie`
   - `https://weareimpact.nl/interim-verandermanagement-ai-sociaal-domein`
   - `https://weareimpact.nl/impact-calculator`
   - `https://weareimpact.nl/ai-scan`
3. Submit ook: `https://weareimpact.nl/sitemap.xml` in Sitemaps-rapport

> **Tip:** Doe dit verspreid over 48 uur (max 5-6 per dag) om rate-limiting te voorkomen.

---

## Fase 2 — Content & Interne Linkstructuur (dag 3-7)

### ⬜ 2.1 Elke dienstenpagina → link naar 3 relevante kennisbank-artikelen

Dit is de **grootste quick win** voor interne link juice. Momenteel linken dienstenpaginas niet of nauwelijks naar de kennisbank. Actie:

- Voeg onderaan elke dienstenpagina een "Verdiep je verder"-sectie toe met 3 links:
  - `/ai-consultant-sociaal-domein` → link naar 3 AI/kennisbank artikelen
  - `/ai-strategie-consultant` → link naar 3 strategie-artikelen  
  - `/change-management-digitale-transformatie` → link naar 3 LSP/verandering-artikelen
  - etc.

### ⬜ 2.2 Elke blogpost → link naar 3 kennisbank-artikelen (bestaat al, check kwaliteit)

De `getRelatedKennisbankArticles()` functie bestaat al. Check of deze **alle** blogposts covered. Geen enkele blog mag eindigen zonder interne links.

### ⬜ 2.3 Homepage-content uitbreiden

De huidige homepage is een 'client component' met Hero, Vision, ScannerSection, Pillars, Ventures, About, FAQ, Contact. Dit is **veel content**, maar het staat allemaal in TSX, niet in een database of markdown. 

**Probleem:** Google ziet uiteindelijk wel de gerenderde HTML, maar client components worden later geladen dan server components. Op een wat tragere verbinding kan het zijn dat Google niet alle content ziet.

**Actie:** Overweeg de belangrijkste contentblokken (koptekst, manifest, diensten) server-side te laten renderen. Dit is een grotere refactor, maar prioriteit is laag — huidige implementatie werkt.

### ⬜ 2.4 Breadcrumb-navigatie checken op alle pagina's

Alle dienstenpaginas hebben `<BreadcrumbJsonLd>` in de layout — goed. 
Alle kennisbankartikelen hebben `<BreadcrumbJsonLd>` — goed.
Blog heeft `<BreadcrumbJsonLd>` — goed.

**Actie:** Check of `/contact`, `/privacy`, `/cookies` en `/voorwaarden` ook breadcrumbs hebben. Zo nee: voeg toe in de layout.

### ⬜ 2.5 5 nieuwe kennisbank-artikelen schrijven

De kennisbank is de motor van de SEO. Meer artikelen = meer long-tail verkeer = meer domeinautoriteit. Prioriteit:

| # | Artikel | Doelzoekwoord | Koppelt naar |
|---|---------|---------------|-------------|
| 1 | "Hoe kies je een AI-consultant voor je welzijnsorganisatie?" | AI-consultant welzijnsorganisatie | /ai-consultant-sociaal-domein |
| 2 | "AVG-proof AI implementeren in de zorg: stappenplan 2026" | AVG AI zorg | /ai-proof-checklist |
| 3 | "LEGO Serious Play voor gemeenten: draagvlak in 1 dag" | LEGO Serious Play gemeente | /change-management-digitale-transformatie |
| 4 | "Subsidie AI implementatie welzijn: welke potjes zijn er?" | subsidie AI welzijn | /ai-scan |
| 5 | "Wat kost een interim AI-projectleider? Rekenvoorbeeld" | interim AI projectleider kosten | /vincent-van-munster |

Elk artikel: 1200-1800 woorden, met FAQ-schema, lead magnet CTA, en 3 interne links.

---

## Fase 3 — Indexering versnellen (dag 7-14)

### ⬜ 3.1 IndexNow via Bing

Bing IndexNow is de snelste manier om Google te vertellen dat er nieuwe content is (Google gebruikt IndexNow-data van Bing).

**Actie:** Na elke deploy, stuur een IndexNow-ping:
```bash
curl -s "https://www.bing.com/indexnow?url=https://weareimpact.nl/sitemap.xml&key=JOUW_KEY"
```

Of installeer de **Vercel IndexNow integratie** voor automatische pings na elke deploy.

### ⬜ 3.2 RSS-feed aanbieden

Google leest RSS-feeds. Maak een `/feed.xml` endpoint die de laatste 20 blogposts + 20 kennisbank-artikelen bevat. Voeg de feed-URL toe in de `<head>` via `<link rel="alternate" type="application/rss+xml" title="WeAreImpact" href="/feed.xml" />`.

### ⬜ 3.3 Social signalen

Google gebruikt social signals als zwakke ranking factor, maar voor nieuwe sites telt het wel. Deel elke nieuwe blogpost op:
- LinkedIn (Vincent heeft een netwerk)
- Eventueel Twitter/X

**Actie:** Zet een cron-job die na publicatie automatisch een LinkedIn-post genereert via `/api/admin/blog/generate`. Of doe het handmatig na elke publicatie.

### ⬜ 3.4 Oude WordPress-URLs uit de index krijgen

De 70 extra URLs zijn waarschijnlijk oude WP-URLs die 301 redirecten. Versnellen: markeer ze in GSC als "removed" of wacht tot Google ze opnieuw crawlt en de 301 ziet.

**Actie:** 
1. Exporteer in GSC > Indexing > Pages de lijst van "Not indexed" URLs
2. Zet de grootste boosdoeners (404s / redirects) in een apart CSV-bestand
3. Submit via GSC > Removals > Temporary Removals om Google te vertellen dat deze weg zijn

---

## Fase 4 — Performance & Core Web Vitals (dag 14-21)

### ⬜ 4.1 Lighthouse-score checken

Draai Lighthouse op de homepage, een blogpost, en een dienstenpagina. Doel: SEO-score > 90, Performance > 80. Huidige score onbekend, maar op Vercel met Next.js zou die redelijk moeten zijn.

### ⬜ 4.2 Afbeeldingen optimaliseren

De public/ folder bevat 1MB+ PNGs:
- `Vincent van Munster WeAreImpact.png` — 1MB (veel te groot, moet <200KB)
- `vincent-van-munster.png` — 1MB (zelfde)
- `WeAreImpact_hart.png` — 136KB
- `og-*.png` — allemaal 80-260KB

**Actie:** Converteer alle PNGs naar WebP. De `next.config.ts` heeft `formats: ['image/avif', 'image/webp']` maar dat werkt alleen voor `<Image>` componenten. De OG-images in `public/` worden direct geserveerd. Converteer:

```bash
# Gebruik squoosh CLI of handmatig via Squoosh.app
# Doel: alle OG-images < 150KB, profielfoto < 200KB
```

### ⬜ 4.3 Content Delivery optimalisatie

De site draait op Vercel met edge network — dat is al goed. Check of:

- `Cache-Control` headers goed staan voor statische assets (JS/CSS)
- De `public/`-map bestanden geen verkeerde caching krijgen

---

## Fase 5 — Backlinks & Domeinautoriteit (dag 21-30)

Dit is de **belangrijkste fase voor indexering**. Google indexeert nieuwe pagina's sneller als het domein autoriteit heeft.

### ⬜ 5.1 Google Business Profile

Is weareimpact.nl gekoppeld aan een Google Business Profile? Zo ja, zorg dat de website in het profiel staat. Zo nee, maak er een aan — dit is een van de snelste manieren om Google te laten weten dat de site bestaat.

### ⬜ 5.2 LinkedIn content-engine

LinkedIn is voor B2B-diensten in Nederland het krachtigste platform. Strategie:
- 2x per week een post met link naar een kennisbank-artikel
- Niet puur linkdumpen: schrijf een echte post met de link als bron
- Tag relevante mensen/organisaties uit het sociaal domein

### ⬜ 5.3 Gastartikelen

Plaats gastartikelen op relevante vakbladen:
- **Zorg & Welzijn** (vakblad)
- **SoziO** (sociaal domein)
- **Social Enterprise NL** (blog)
- **Movisie** (kennisplatform welzijn)
- **VNG** (gemeenten, eventueel)

Doel: 3-5 gastartikelen met backlink naar weareimpact.nl.

### ⬜ 5.4 Podcasts & media

Vincent heeft al een NotebookLM podcast-input. Gebruik het LinkedIn-netwerk om uitgenodigd te worden bij:
- Welzijn & Zorg podcasts
- Social enterprise podcasts
- AI in Nederland podcasts

### ⬜ 5.5 Lokale SEO (Google Maps/Google Local)

Als Vincent werkt vanuit Hoofddorp/Nieuw-Vennep: maak een Google Business Profile aan met de thuiswerk locatie (of postbus) en krijg vermeldingen op:
- Google Maps
- Telefoongids
- Ondernemersplein
- Lokale kamer van koophandel

---

## Fase 6 — Meten & Optimaliseren (lopend)

### ⬜ 6.1 GSC-rapportage inrichten

Het admin/seo dashboard is al gekoppeld aan GSC API. Check:
- Worden `clicks`, `impressions`, `CTR`, `position` per pagina en per query correct getoond?
- Kun je de data exporteren?
- Is er een wekelijkse notificatie bij nieuwe kansen?

### ⬜ 6.2 CTR-optimalisatie

Admin SEO dashboard heeft een `ctr-optimize` endpoint:
```ts
/api/admin/seo/ctr-optimize/route.ts
```
Dit optimaliseert titles en descriptions voor paginas met hoge impressions maar lage CTR. Gebruik dit!

**Actie:** Draai een bulk-CTR-optimalisatie-sessie voor de 10 belangrijkste pagina's.

### ⬜ 6.3 Content gap-analyse

Check in GSC welke queries "kansrijk" zijn: hoge impressions, lage positie (positie 5-15). Dat zijn zoektermen waar WeAreImpact al voor wordt gevonden maar nog niet goed scoort. Schrijf voor die queries gerichte content.

### ⬜ 6.4 Wekelijkse monitoring

Zet een hermes cron-job op die elke maandag:
1. Checkt of de sitemap correct is
2. GSC-data exporteert (clicks, impressions, positie)
3. Nieuwe content-kansen rapporteert

---

## Tijdlijn (30 dagen)

```
Week 1 (dag 1-7):   Fase 1 + Fase 2
                    ✅ Dubbele titles fix (DONE)
                    ✅ Sitemap uitbreiden (DONE)
                    ✅ Contact metadata (DONE)
                    ⬜ Blog ISR fix
                    ⬜ Handmatige indexering GSC
                    ⬜ 5 nieuwe kennisbank-artikelen
                    ⬜ Interne links versterken

Week 2 (dag 8-14):  Fase 3
                    ⬜ IndexNow implementeren
                    ⬜ RSS-feed maken
                    ⬜ Social signals: LinkedIn strategie
                    ⬜ Oude WP-URLs cleanup GSC

Week 3 (dag 15-21): Fase 4
                    ⬜ Lighthouse optimalisatie
                    ⬜ Afbeeldingen > WebP converteren
                    ⬜ Caching headers check

Week 4 (dag 22-30): Fase 5
                    ⬜ Google Business Profile
                    ⬜ LinkedIn content engine starten
                    ⬜ 3 gastartikelen pitch sturen
                    ⬜ Lokale SEO basis

Lopend:             Fase 6
                    ⬜ GSC monitoring
                    ⬜ CTR-optimalisatie
                    ⬜ Content gap-analyse
```

---

## Verwacht resultaat

| Metriek | Nu | Week 1 | Week 2 | Week 4 |
|---------|----|--------|--------|--------|
| Pagina's in index | 25 | 45-55 | 65-80 | 90-110 |
| Sitemap URLs | 73 | 73 | 78 (+5 artikelen) | 83 |
| Crawl budget (GSC) | laag | medium | medium+ | hoog |
| Domeinautoriteit (schatting) | laag | laag | laag+ | medium- |

**Kritische succesfactor:** Backlinks (Fase 5). Zonder backlinks blijft de indexering traag, zelfs met alle technische optimalisaties. Focus op LinkedIn + gastartikelen.

---

## Eerste actie (nu)

Wat ik **direct** kan doen:

1. **Blog ISR fix** — `dynamic = 'force-dynamic'` vervangen door `revalidate = 3600`
2. **Interne links** — versterken op de bestaande pagina's
3. **Nieuwe kennisbank-artikelen** — schrijven via NotebookLM of direct

Zeg je "doe het als een pro, je hoeft mij verder geen toestemming meer te geven" en ik start met #1-3.
