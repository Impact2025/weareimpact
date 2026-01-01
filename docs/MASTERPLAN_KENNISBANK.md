# MASTERPLAN: WeAreImpact AI Kennisbank 2.0

## Van 22 FAQ's naar een Intelligente Kennishub die Klanten Aantrekt

---

## EXECUTIVE SUMMARY

Dit plan transformeert de huidige FAQ-kennisbank naar een **AI-gedreven kennisplatform** dat:
- **SEO-dominantie** bereikt op 100+ long-tail keywords
- **24/7 AI-assistent** biedt die vragen beantwoordt als Vincent
- **Leads genereert** door waarde te bieden vóór het eerste gesprek
- **Thought leadership** vestigt in sociaal ondernemen + AI

**Geschatte impact**: 500+ organische bezoekers/maand binnen 6 maanden

---

## DEEL 1: CONTENT ARCHITECTUUR

### 1.1 Van 22 naar 100+ Artikelen

De huidige 22 FAQ's worden uitgebreid naar een complete kennisstructuur:

```
KENNISBANK TAXONOMIE
├── 🏢 Sociaal Ondernemen (25 artikelen)
│   ├── Basics (5): Wat is het, waarom, voor wie
│   ├── Rechtsvormen (5): Stichting, BV, BVm, Coöperatie, Hybride
│   ├── Certificering (5): Code, B Corp, vergelijkingen
│   ├── Financiering (5): Investeerders, crowdfunding, leningen
│   └── Cases (5): Nederlandse voorbeelden
│
├── 🤖 AI voor Impact (25 artikelen)
│   ├── Basics (5): Wat kan AI, grenzen, ethiek
│   ├── Tools (5): ChatGPT, Claude, Copilot, specifieke tools
│   ├── Implementatie (5): Stappenplan, change management
│   ├── Sector-specifiek (5): Zorg, welzijn, onderwijs, overheid
│   └── Toekomst (5): AI Act, trends 2025-2030
│
├── 👥 Vrijwilligersmanagement (20 artikelen)
│   ├── Beleid (5): Opstellen, 4 B's model, templates
│   ├── Werving (5): Kanalen, doelgroepen, messaging
│   ├── Behoud (5): Motivatie, waardering, community
│   └── Praktisch (5): VOG, verzekering, juridisch
│
├── 📊 Impact Meten (15 artikelen)
│   ├── Methoden (5): Theory of Change, Social Handprint, SROI
│   ├── SDG's (5): Per SDG uitleg + toepassing
│   └── Rapportage (5): Stakeholders, visualisatie, benchmarks
│
├── 💰 Subsidie & Funding (15 artikelen)
│   ├── Aanvragen (5): Proces, templates, valkuilen
│   ├── Bronnen (5): Overzicht fondsen, deadlines
│   └── Strategie (5): Fondsenwervingsplan, mix
│
└── 🎯 LEGO Serious Play (10 artikelen)
    ├── Methode (3): Wat, waarom, hoe
    ├── Toepassingen (4): Strategie, team, innovatie, conflict
    └── Cases (3): Voorbeelden en resultaten
```

### 1.2 Artikel Structuur (SEO-Optimaal)

Elk artikel volgt deze structuur voor maximale vindbaarheid:

```markdown
# [H1: Primaire Keyword + Waarde]
Voorbeeld: "VOG Aanvragen voor Vrijwilligers: Gratis Stappenplan 2025"

## Meta (verborgen, voor SEO)
- Title: max 60 chars met keyword
- Description: max 155 chars met CTA
- Schema.org: FAQPage + Article markup
- Open Graph: Sociale preview

## Intro (150 woorden)
- Hook: Probleem of vraag benoemen
- Belofte: Wat leert de lezer
- Snippet-optimized: Beantwoord vraag direct

## Inhoudsopgave (auto-generated)
- Anchor links naar H2's
- Jump-to functionality

## Hoofdcontent (1500-2500 woorden)
- H2's met secundaire keywords
- H3's voor subsecties
- Bullet points voor scannability
- Citaten van experts (Vincent)
- Interne links naar gerelateerde artikelen

## Praktische Elementen
- ✅ Checklist (downloadbaar)
- 📥 Template (lead magnet)
- 🎥 Video embed (YouTube)
- 📊 Infographic

## FAQ Sectie (Schema markup)
- 3-5 gerelateerde vragen
- Directe antwoorden
- Rich snippet optimized

## CTA Sectie
- Gerelateerde artikelen
- AI Scanner prompt
- Contact optie

## Auteur Bio
- Vincent's foto + credentials
- Link naar About pagina
```

---

## DEEL 2: AI-INTEGRATIE

### 2.1 Kennisbank AI Assistent

Een dedicated AI die de kennisbank doorzoekbaar maakt:

```typescript
// Architectuur
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Search Bar  │  │ Chat Widget │  │ Voice Input │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Unified Query Interface             │   │
│  └──────────────────────┬──────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 /api/kb/query                    │   │
│  │  1. Query classificatie (vraag/zoek/navigatie)  │   │
│  │  2. Intent detection                             │   │
│  │  3. Entity extraction                            │   │
│  └──────────────────────┬──────────────────────────┘   │
│                          │                              │
│         ┌────────────────┼────────────────┐            │
│         ▼                ▼                ▼            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Semantic  │  │  Keyword   │  │   Hybrid   │       │
│  │   Search   │  │   Search   │  │   Rerank   │       │
│  │ (pgvector) │  │ (Postgres) │  │  (Cohere)  │       │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │
│        │               │               │               │
│        └───────────────┼───────────────┘               │
│                        ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Context Assembly                    │   │
│  │  - Top 5 relevante artikelen                    │   │
│  │  - FAQ snippets                                  │   │
│  │  - Gerelateerde topics                          │   │
│  └──────────────────────┬──────────────────────────┘   │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │           LLM Response Generation                │   │
│  │  - Claude 3.5 Sonnet via OpenRouter             │   │
│  │  - Vincent's tone of voice                       │   │
│  │  - Bronvermelding met links                     │   │
│  │  - Follow-up suggesties                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 RAG Pipeline (Retrieval Augmented Generation)

```sql
-- Database extensie voor vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Kennisbank artikelen tabel
CREATE TABLE kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  content_html TEXT,

  -- Categorisatie
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  tags TEXT[],

  -- SEO
  seo_title VARCHAR(70),
  seo_description VARCHAR(160),
  seo_keywords TEXT[],
  canonical_url VARCHAR(255),

  -- Rich content
  featured_image VARCHAR(255),
  video_url VARCHAR(255),
  download_url VARCHAR(255), -- Lead magnet

  -- AI/Search
  embedding vector(1536), -- OpenAI embedding
  search_keywords TSVECTOR, -- Full-text search

  -- FAQ schema data
  faq_items JSONB, -- [{question, answer}]

  -- Metadata
  author VARCHAR(100) DEFAULT 'Vincent van Munster',
  reading_time INTEGER,
  difficulty VARCHAR(20), -- beginner, intermediate, advanced

  -- Analytics
  views INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zoekindex
CREATE INDEX kb_articles_embedding_idx ON kb_articles
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX kb_articles_search_idx ON kb_articles
  USING GIN (search_keywords);

-- Gerelateerde artikelen
CREATE TABLE kb_article_relations (
  article_id UUID REFERENCES kb_articles(id),
  related_id UUID REFERENCES kb_articles(id),
  relation_type VARCHAR(50), -- 'similar', 'prerequisite', 'deep-dive'
  relevance_score FLOAT,
  PRIMARY KEY (article_id, related_id)
);

-- Gebruikersvragen logging (voor content gaps)
CREATE TABLE kb_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  query_embedding vector(1536),
  results_count INTEGER,
  clicked_article_id UUID REFERENCES kb_articles(id),
  helpful BOOLEAN,
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content gaps identificatie view
CREATE VIEW kb_content_gaps AS
SELECT
  query,
  COUNT(*) as frequency,
  AVG(results_count) as avg_results,
  SUM(CASE WHEN helpful = false THEN 1 ELSE 0 END) as unhelpful_count
FROM kb_queries
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY query
HAVING AVG(results_count) < 3 OR SUM(CASE WHEN helpful = false THEN 1 ELSE 0 END) > 2
ORDER BY frequency DESC;
```

### 2.3 AI Features

| Feature | Beschrijving | Technologie |
|---------|--------------|-------------|
| **Smart Search** | Semantisch zoeken op betekenis | pgvector + embeddings |
| **Auto-Answer** | Direct antwoord op vragen | RAG + Claude |
| **Suggested Articles** | "Anderen lazen ook..." | Collaborative filtering |
| **Content Gaps** | Ontbrekende topics detecteren | Query analysis |
| **Auto-Translate** | Engels/Duits voor internationaal | GPT-4 |
| **Voice Search** | Spraakgestuurde kennisbank | Web Speech API |
| **Summarization** | TL;DR per artikel | Claude Haiku |

---

## DEEL 3: SEO STRATEGIE

### 3.1 Keyword Strategie

**Pillar-Cluster Model:**

```
                    ┌─────────────────────┐
                    │   PILLAR PAGE       │
                    │ "Sociaal Ondernemen │
                    │  in Nederland"      │
                    │  (3000+ woorden)    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ CLUSTER       │    │ CLUSTER       │    │ CLUSTER       │
│ "Code Sociale │    │ "BVm          │    │ "Impact       │
│ Ondernemingen"│    │ Oprichten"    │    │ Investeerders"│
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   ▼         ▼          ▼         ▼          ▼         ▼
┌─────┐  ┌─────┐    ┌─────┐  ┌─────┐    ┌─────┐  ┌─────┐
│Blog │  │Blog │    │Blog │  │Blog │    │Blog │  │Blog │
│Post │  │Post │    │Post │  │Post │    │Post │  │Post │
└─────┘  └─────┘    └─────┘  └─────┘    └─────┘  └─────┘
```

### 3.2 Target Keywords (100+)

#### Tier 1: Hoog Volume (500-2000 zoeken/maand)
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| sociaal ondernemen | 1900 | Medium | Informational |
| sociale onderneming starten | 720 | Medium | Transactional |
| vrijwilligerswerk organiseren | 590 | Low | Informational |
| impact meten | 480 | Low | Informational |
| subsidie aanvragen | 2400 | High | Transactional |

#### Tier 2: Medium Volume (100-500 zoeken/maand)
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| code sociale ondernemingen | 210 | Low | Informational |
| vog aanvragen vrijwilliger | 320 | Low | Transactional |
| theory of change maken | 170 | Low | Informational |
| ai in de zorg | 390 | Medium | Informational |
| stichting vs bv | 260 | Low | Informational |

#### Tier 3: Long-tail (10-100 zoeken/maand, hoge conversie)
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| code sociale ondernemingen aanvragen | 40 | Very Low | Transactional |
| verschil b corp en sociale onderneming | 30 | Very Low | Informational |
| vrijwilligersbeleid schrijven template | 50 | Very Low | Transactional |
| social handprint methode uitleg | 20 | Very Low | Informational |
| chatgpt gebruiken voor vrijwilligersorganisatie | 30 | Very Low | Informational |
| maatschappelijke bv oprichten 2025 | 70 | Very Low | Transactional |
| oranje fonds aanvragen tips | 40 | Very Low | Transactional |
| sdg impact rapportage template | 20 | Very Low | Transactional |

### 3.3 On-Page SEO Checklist

```markdown
□ URL Structure: /kennisbank/[category]/[slug]
□ Title Tag: Primary Keyword + Modifier + Brand (max 60 chars)
□ Meta Description: Benefit + CTA (max 155 chars)
□ H1: Exact match of title, 1 per page
□ H2-H6: Secondary keywords, logical hierarchy
□ First 100 words: Primary keyword naturally included
□ Image Alt Text: Descriptive with keywords
□ Internal Links: 3-5 per article to related content
□ External Links: 1-2 to authoritative sources
□ Schema Markup: Article, FAQPage, BreadcrumbList
□ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
□ Mobile Responsive: 100% mobile-friendly
□ Canonical URL: Self-referencing canonical
□ Hreflang: nl-NL (primary), en-US (future)
```

### 3.4 Technical SEO

```typescript
// src/app/kennisbank/[category]/[slug]/page.tsx

import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticle(params.slug);

  return {
    title: article.seo_title || `${article.title} | WeAreImpact`,
    description: article.seo_description,
    keywords: article.seo_keywords,
    authors: [{ name: 'Vincent van Munster' }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.published_at,
      authors: ['Vincent van Munster'],
      images: [article.featured_image],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featured_image],
    },
    alternates: {
      canonical: `https://weareimpact.nl/kennisbank/${params.category}/${params.slug}`,
    },
  };
}

// JSON-LD Schema
export function generateStructuredData(article) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        author: {
          '@type': 'Person',
          name: 'Vincent van Munster',
          url: 'https://weareimpact.nl/about',
        },
        publisher: {
          '@type': 'Organization',
          name: 'WeAreImpact',
          logo: 'https://weareimpact.nl/logo.png',
        },
        datePublished: article.published_at,
        dateModified: article.updated_at,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://weareimpact.nl/kennisbank/${article.category}/${article.slug}`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: article.faq_items?.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
          { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://weareimpact.nl/kennisbank' },
          { '@type': 'ListItem', position: 3, name: article.category_name, item: `https://weareimpact.nl/kennisbank/${article.category}` },
          { '@type': 'ListItem', position: 4, name: article.title },
        ],
      },
    ],
  };
}
```

---

## DEEL 4: USER EXPERIENCE

### 4.1 Kennisbank Homepage

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔍 Zoek in 100+ artikelen over impact & AI...          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ [_______________________________________] 🎤    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  Populair: VOG aanvragen • AI tools • Subsidies         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │ 🏢 SOCIAAL       │ │ 🤖 AI VOOR       │ │ 👥 VRIJWILLIGERS ││
│  │ ONDERNEMEN       │ │ IMPACT           │ │ MANAGEMENT       ││
│  │                  │ │                  │ │                  ││
│  │ 25 artikelen     │ │ 25 artikelen     │ │ 20 artikelen     ││
│  │ → Code & Cert.   │ │ → Tools & Tips   │ │ → Beleid & VOG   ││
│  │ → Rechtsvormen   │ │ → AI Act         │ │ → Werving        ││
│  │ → Financiering   │ │ → Implementatie  │ │ → Behoud         ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
│                                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐│
│  │ 📊 IMPACT        │ │ 💰 SUBSIDIE &    │ │ 🎯 LEGO          ││
│  │ METEN            │ │ FUNDING          │ │ SERIOUS PLAY     ││
│  │                  │ │                  │ │                  ││
│  │ 15 artikelen     │ │ 15 artikelen     │ │ 10 artikelen     ││
│  │ → Methoden       │ │ → Aanvragen      │ │ → Methode        ││
│  │ → SDG's          │ │ → Fondsen        │ │ → Toepassingen   ││
│  │ → Rapportage     │ │ → Strategie      │ │ → Cases          ││
│  └──────────────────┘ └──────────────────┘ └──────────────────┘│
│                                                                 │
│  ─────────────────── MEEST GELEZEN ───────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. VOG Aanvragen voor Vrijwilligers (Gratis)    👁 2.4k │   │
│  │ 2. Code Sociale Ondernemingen: Complete Gids    👁 1.8k │   │
│  │ 3. ChatGPT voor Non-Profits: 15 Praktische Tips 👁 1.5k │   │
│  │ 4. Subsidie Aanvragen Stappenplan 2025          👁 1.2k │   │
│  │ 5. BV vs Stichting: Welke Rechtsvorm Kies Jij?  👁 980  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────── VRAAG HET VINCENT ───────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💬 Stel je vraag aan Vincent's AI-assistent            │   │
│  │                                                          │   │
│  │  "Hoe kan ik AI inzetten in mijn vrijwilligersorg?"     │   │
│  │                                                          │   │
│  │  [__________________ Stel je vraag... __________________]│   │
│  │                                                          │   │
│  │  ✨ Krijg direct antwoord op basis van 100+ artikelen   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Artikel Pagina

```
┌─────────────────────────────────────────────────────────────────┐
│  Home > Kennisbank > Vrijwilligers > VOG Aanvragen             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [FEATURED IMAGE: Vrijwilliger met certificaat]         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  # VOG Aanvragen voor Vrijwilligers: Gratis Stappenplan 2025   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 👤 Vincent van Munster  •  📅 Dec 2025  •  ⏱️ 8 min    │    │
│  │ 🏷️ Vrijwilligers, VOG, Compliance                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ INHOUDSOPGAVE ────────────────────────────────────────┐    │
│  │ 1. Wat is een VOG?                                     │    │
│  │ 2. Wanneer is een VOG verplicht? (Update 2025)        │    │
│  │ 3. Stappenplan: Gratis VOG aanvragen                   │    │
│  │ 4. Veelgemaakte fouten                                 │    │
│  │ 5. Template: VOG-beleid voor je organisatie            │    │
│  │ 6. FAQ                                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Vanaf 1 juli 2025 zijn de regels rondom VOG-aanvragen        │
│  voor vrijwilligers veranderd. In dit artikel leg ik uit...    │
│                                                                 │
│  ## 1. Wat is een VOG?                                          │
│  Een Verklaring Omtrent het Gedrag (VOG) is een verklaring...  │
│                                                                 │
│  ┌─ 📥 GRATIS DOWNLOAD ───────────────────────────────────┐    │
│  │                                                         │    │
│  │  VOG-Beleid Template voor Vrijwilligersorganisaties    │    │
│  │                                                         │    │
│  │  ✓ Kant-en-klaar beleidsdocument                       │    │
│  │  ✓ Aanvraagprocedure stap-voor-stap                    │    │
│  │  ✓ Communicatie naar vrijwilligers                      │    │
│  │                                                         │    │
│  │  [E-mail] [________________] [DOWNLOAD]                │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ## FAQ                                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ▼ Hoe lang is een VOG geldig?                          │    │
│  │   Een VOG heeft geen officiële geldigheidsduur...      │    │
│  │                                                         │    │
│  │ ▼ Wat kost een VOG voor vrijwilligers?                 │    │
│  │   Voor vrijwilligers is een VOG gratis via Justis...   │    │
│  │                                                         │    │
│  │ ▼ Kan een VOG geweigerd worden?                        │    │
│  │   Ja, als er relevante antecedenten zijn...            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ─────────────────── WAS DIT NUTTIG? ─────────────────────────  │
│  │                                                         │    │
│  │  [ 👍 Ja, dit hielp ]    [ 👎 Nee, ik mis iets ]      │    │
│  │                                                         │    │
│                                                                 │
│  ─────────────────── GERELATEERD ─────────────────────────────  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 4 B's Model  │ │ Vrijwilligers│ │ Juridische   │            │
│  │ Vrijwilligers│ │ behouden     │ │ Aspecten     │            │
│  │ beleid       │ │ Tips         │ │ Vrijwilligers│            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ─────────────────── HULP NODIG? ─────────────────────────────  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Wil je sparren over vrijwilligersbeleid?              │    │
│  │                                                         │    │
│  │  [ Gratis AI Scan ]  [ Plan een gesprek ]              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 AI Chat Widget

Altijd zichtbaar rechtsonder op elke kennisbank pagina:

```
┌──────────────────────────────────────┐
│  💬 Vraag het Vincent           ─ ✕ │
├──────────────────────────────────────┤
│                                      │
│  Hoi! Ik ben Vincent's digitale      │
│  assistent. Stel me een vraag over:  │
│                                      │
│  • Sociaal ondernemen                │
│  • AI implementatie                  │
│  • Vrijwilligersbeleid               │
│  • Impact meten                      │
│  • Subsidies                         │
│                                      │
│  ────────────────────────────────    │
│                                      │
│  👤 Hoe begin ik met AI in mijn     │
│     welzijnsorganisatie?             │
│                                      │
│  🤖 Goeie vraag! Voor welzijns-     │
│     organisaties raad ik aan om te   │
│     starten met administratieve      │
│     taken. Denk aan:                 │
│                                      │
│     1. **Verslaglegging** - Tools    │
│        zoals Otter.ai transcriberen  │
│        gesprekken automatisch        │
│                                      │
│     2. **E-mails** - ChatGPT kan     │
│        concepten maken               │
│                                      │
│     📖 Lees meer: [AI Tools voor     │
│        Vrijwilligersorganisaties]    │
│                                      │
│  ────────────────────────────────    │
│                                      │
│  [🎤] [Typ je vraag...        ] [→] │
│                                      │
└──────────────────────────────────────┘
```

---

## DEEL 5: LEAD GENERATION

### 5.1 Lead Magnets per Categorie

| Categorie | Lead Magnet | Format | CTA |
|-----------|-------------|--------|-----|
| Sociaal Ondernemen | "Checklist: Ben jij een sociale onderneming?" | PDF | E-mail |
| AI Impact | "AI Toolkit: 20 Gratis Tools voor Non-Profits" | Notion Template | E-mail |
| Vrijwilligers | "VOG Beleid Template + Communicatieplan" | Word/PDF | E-mail |
| Impact Meten | "Theory of Change Canvas + Voorbeelden" | Miro Template | E-mail |
| Subsidie | "Subsidiekalender 2025 + Fondsendatabase" | Spreadsheet | E-mail |
| LEGO | "LEGO Serious Play Vragenlijst" | PDF | E-mail |

### 5.2 Conversion Funnel

```
┌─────────────────────────────────────────────────────────────┐
│  AWARENESS (Top of Funnel)                                  │
│  ├─ Google zoekresultaten (SEO)                            │
│  ├─ LinkedIn artikelen                                      │
│  └─ Podcast/Webinar mentions                               │
│                           ▼                                 │
├─────────────────────────────────────────────────────────────┤
│  INTEREST (Middle of Funnel)                               │
│  ├─ Kennisbank artikelen lezen                             │
│  ├─ AI Assistent vragen stellen                            │
│  └─ Lead magnet downloaden (→ E-MAIL CAPTURE)              │
│                           ▼                                 │
├─────────────────────────────────────────────────────────────┤
│  CONSIDERATION                                              │
│  ├─ AI Impact Scan invullen                                │
│  ├─ E-mail nurture sequence (5 mails)                      │
│  └─ Case studies lezen                                      │
│                           ▼                                 │
├─────────────────────────────────────────────────────────────┤
│  DECISION (Bottom of Funnel)                               │
│  ├─ Kennismakingsgesprek boeken                            │
│  ├─ Offerte aanvragen                                       │
│  └─ Workshop/Training boeken                                │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 E-mail Nurture Sequences

**Sequence 1: Na Lead Magnet Download**
```
Dag 0:  Download bevestiging + direct waarde
Dag 2:  "Heb je de [resource] al bekeken? Hier een tip..."
Dag 5:  Gerelateerd artikel uit kennisbank
Dag 8:  Case study: "Hoe [organisatie] dit aanpakte"
Dag 12: Zachte CTA: "Zullen we even sparren?"
```

**Sequence 2: Na AI Scan**
```
Dag 0:  Scan resultaten + samenvatting
Dag 1:  "Op basis van je antwoorden, deze 3 artikelen..."
Dag 4:  Diepere analyse: "Wat [uitdaging] betekent voor jouw sector"
Dag 7:  Video: Vincent legt oplossingsrichting uit
Dag 10: Directe CTA: "Plan een gratis strategiegesprek"
```

---

## DEEL 6: TECHNISCHE IMPLEMENTATIE

### 6.1 Nieuwe Routes Structuur

```
src/app/
├── kennisbank/
│   ├── page.tsx                    # Kennisbank homepage
│   ├── layout.tsx                  # Shared layout met search
│   ├── zoeken/
│   │   └── page.tsx                # Zoekresultaten pagina
│   ├── [category]/
│   │   ├── page.tsx                # Categorie overzicht
│   │   └── [slug]/
│   │       └── page.tsx            # Artikel detail
│   └── sitemap.ts                  # Dynamic sitemap

├── api/
│   ├── kb/
│   │   ├── search/route.ts         # Hybrid search endpoint
│   │   ├── suggest/route.ts        # Autocomplete
│   │   ├── article/route.ts        # CRUD operations
│   │   ├── feedback/route.ts       # Helpful/not helpful
│   │   ├── embed/route.ts          # Generate embeddings
│   │   └── chat/route.ts           # RAG chat endpoint
│   └── leads/
│       ├── download/route.ts       # Lead magnet capture
│       └── subscribe/route.ts      # Newsletter
```

### 6.2 Componenten Structuur

```
src/components/
├── kennisbank/
│   ├── KBSearch.tsx                # Search bar + voice
│   ├── KBSearchResults.tsx         # Results display
│   ├── KBCategoryCard.tsx          # Category overview card
│   ├── KBArticleCard.tsx           # Article preview card
│   ├── KBArticle.tsx               # Full article display
│   ├── KBTableOfContents.tsx       # Sticky TOC
│   ├── KBFAQAccordion.tsx          # FAQ schema section
│   ├── KBLeadMagnet.tsx            # Download forms
│   ├── KBRelatedArticles.tsx       # Related content
│   ├── KBFeedback.tsx              # Helpful/not helpful
│   ├── KBChatWidget.tsx            # AI assistant
│   └── KBBreadcrumb.tsx            # Navigation breadcrumbs
```

### 6.3 API Endpoints Detail

```typescript
// /api/kb/search/route.ts
export async function POST(request: Request) {
  const { query, category, limit = 10 } = await request.json();

  // 1. Generate embedding voor semantic search
  const embedding = await generateEmbedding(query);

  // 2. Hybrid search: vector + full-text
  const results = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: embedding,
    match_count: limit,
    category_filter: category,
  });

  // 3. Log query voor content gap analysis
  await supabase.from('kb_queries').insert({
    query,
    query_embedding: embedding,
    results_count: results.length,
    session_id: getSessionId(request),
  });

  return Response.json({ results });
}

// /api/kb/chat/route.ts
export async function POST(request: Request) {
  const { message, history } = await request.json();

  // 1. Retrieve relevante context
  const context = await retrieveContext(message);

  // 2. Build prompt met Vincent's persona
  const systemPrompt = `
    Je bent Vincent van Munster's AI-assistent voor de WeAreImpact kennisbank.
    Beantwoord vragen op basis van de volgende artikelen:

    ${context.map(c => `---\n${c.title}\n${c.content}\n---`).join('\n')}

    Regels:
    - Verwijs altijd naar specifieke artikelen met links
    - Wees praktisch en concreet
    - Als je iets niet weet: "Dat staat niet in onze kennisbank, maar..."
    - Eindig met een relevante follow-up vraag of artikel suggestie
    - Spreek Nederlands, informeel maar professioneel
  `;

  // 3. Stream response
  const stream = await openrouter.chat({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ],
    stream: true,
  });

  return new StreamingTextResponse(stream);
}
```

### 6.4 Database Functions

```sql
-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 10,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  slug TEXT,
  category TEXT,
  similarity FLOAT,
  rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.excerpt,
    a.slug,
    a.category,
    1 - (a.embedding <=> query_embedding) as similarity,
    ts_rank(a.search_keywords, plainto_tsquery('dutch', query_text)) as rank
  FROM kb_articles a
  WHERE
    a.status = 'published'
    AND (category_filter IS NULL OR a.category = category_filter)
  ORDER BY
    (1 - (a.embedding <=> query_embedding)) * 0.7 +
    ts_rank(a.search_keywords, plainto_tsquery('dutch', query_text)) * 0.3
    DESC
  LIMIT match_count;
END;
$$;

-- Auto-generate embeddings trigger
CREATE OR REPLACE FUNCTION update_article_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Embedding wordt via API call gegenereerd
  -- Dit markeert alleen dat embedding update nodig is
  NEW.embedding = NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_content_changed
  BEFORE UPDATE OF content, title ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_article_embedding();
```

---

## DEEL 7: CONTENT PRODUCTIE

### 7.1 AI-Assisted Content Creation

```typescript
// Content generatie workflow
async function generateArticle(topic: string, outline: string) {
  // 1. Research fase
  const research = await openrouter.chat({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{
      role: 'user',
      content: `
        Research dit onderwerp voor een Nederlandse kennisbank artikel:
        Topic: ${topic}

        Geef:
        1. Key facts en statistieken (met bronnen)
        2. Veelgestelde vragen
        3. Praktische tips
        4. Nederlandse context en wetgeving
        5. Relevante organisaties/bronnen
      `
    }]
  });

  // 2. Artikel schrijven
  const article = await openrouter.chat({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{
      role: 'user',
      content: `
        Schrijf een SEO-geoptimaliseerd kennisbank artikel.

        Topic: ${topic}
        Outline: ${outline}
        Research: ${research}

        Vereisten:
        - 1500-2500 woorden
        - H1/H2/H3 structuur
        - Primaire keyword in eerste 100 woorden
        - FAQ sectie met 5 vragen
        - Praktische checklist
        - Vincent van Munster's tone of voice (praktisch, warm, eerlijk)
        - Nederlandse context

        Output format: Markdown
      `
    }]
  });

  // 3. SEO optimalisatie
  const seo = await openrouter.chat({
    model: 'anthropic/claude-3-haiku',
    messages: [{
      role: 'user',
      content: `
        Genereer SEO metadata voor dit artikel:

        ${article}

        Output JSON:
        {
          "title": "max 60 chars",
          "description": "max 155 chars",
          "keywords": ["keyword1", "keyword2"],
          "slug": "url-friendly-slug"
        }
      `
    }]
  });

  return { article, seo, research };
}
```

### 7.2 Content Kalender

**Maand 1-2: Foundation**
- Week 1-2: 10 pillar pages schrijven (1 per categorie)
- Week 3-4: 20 cluster artikelen (2 per pillar)
- Week 5-6: Lead magnets ontwikkelen (6 stuks)
- Week 7-8: AI chat + search implementeren

**Maand 3-4: Expansion**
- 40 nieuwe artikelen (10/week)
- E-mail sequences opzetten
- Analytics + feedback loops

**Maand 5-6: Optimization**
- Content gaps vullen (op basis van queries)
- Underperforming artikelen herschrijven
- Link building + PR

### 7.3 Quality Checklist

```markdown
## Pre-Publish Checklist

### Content
□ Minimaal 1500 woorden
□ Unieke invalshoek/waarde
□ Factcheck: alle claims verifieerbaar
□ Vincent's stem: praktisch, warm, eerlijk
□ Nederlandse context en voorbeelden
□ Actuele informatie (2025)

### SEO
□ Primary keyword in H1, first 100 words, URL
□ Secondary keywords in H2's
□ Meta title < 60 chars, bevat keyword
□ Meta description < 155 chars, bevat CTA
□ Alt text op alle afbeeldingen
□ Interne links (3-5)
□ Externe link naar autoriteit (1-2)

### Structure
□ H1 > H2 > H3 hiërarchie correct
□ Inhoudsopgave aanwezig
□ FAQ sectie (3-5 vragen)
□ Praktische elementen (checklist/template/video)
□ CTA sectie onderaan

### Technical
□ Schema markup correct
□ Canonical URL ingesteld
□ Open Graph tags
□ Mobile preview getest
□ Core Web Vitals check
```

---

## DEEL 8: ANALYTICS & ITERATIE

### 8.1 KPI Dashboard

| KPI | Target M1 | Target M3 | Target M6 |
|-----|-----------|-----------|-----------|
| Organisch verkeer | 200/maand | 1000/maand | 3000/maand |
| Kennisbank pageviews | 500/maand | 3000/maand | 10000/maand |
| AI chat sessies | 50/maand | 300/maand | 1000/maand |
| Lead magnet downloads | 20/maand | 100/maand | 300/maand |
| E-mail subscribers | 50 | 250 | 750 |
| Avg. time on page | 2:00 | 3:00 | 4:00 |
| Bounce rate | <70% | <60% | <50% |
| Helpful votes % | >70% | >80% | >85% |

### 8.2 Tracking Events

```typescript
// Analytics events
const trackingEvents = {
  // Pageviews
  'kb_article_view': { article_id, category, source },
  'kb_search': { query, results_count },

  // Engagement
  'kb_toc_click': { article_id, section },
  'kb_internal_link': { from_article, to_article },
  'kb_external_link': { article_id, url },
  'kb_scroll_depth': { article_id, depth_percent },

  // AI Chat
  'kb_chat_start': { source_article },
  'kb_chat_message': { message_length, response_time },
  'kb_chat_article_click': { suggested_article },

  // Conversions
  'kb_lead_magnet_view': { magnet_type },
  'kb_lead_magnet_submit': { magnet_type, email_domain },
  'kb_feedback_submit': { article_id, helpful },
  'kb_cta_click': { article_id, cta_type },
};
```

### 8.3 Content Improvement Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    WEEKLY REVIEW                            │
├─────────────────────────────────────────────────────────────┤
│  1. Query Analysis                                          │
│     - Welke zoekopdrachten → 0 resultaten?                 │
│     - Welke queries → bounce?                               │
│     → Nieuwe artikelen plannen                              │
│                                                             │
│  2. Performance Review                                      │
│     - Top 10 artikelen → what's working?                   │
│     - Bottom 10 artikelen → herschrijven/verwijderen       │
│     → Content optimalisatie                                 │
│                                                             │
│  3. Feedback Analysis                                       │
│     - Artikelen met lage helpful score                     │
│     - Chat queries die niet goed beantwoord werden         │
│     → Content gaps vullen                                   │
│                                                             │
│  4. Competitor Check                                        │
│     - Nieuwe content van concurrenten                      │
│     - Ranking veranderingen                                 │
│     → Strategie aanpassen                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## DEEL 9: IMPLEMENTATIE ROADMAP

### Fase 1: Foundation (Week 1-4)

```
□ Database setup
  □ Supabase tables aanmaken (kb_articles, kb_queries, etc.)
  □ pgvector extensie activeren
  □ Full-text search index
  □ Database functions

□ Backend API's
  □ /api/kb/search - hybrid search
  □ /api/kb/article - CRUD
  □ /api/kb/embed - embedding generation
  □ /api/kb/chat - RAG endpoint

□ Frontend basis
  □ /kennisbank route structure
  □ KBSearch component
  □ KBArticle component
  □ KBChatWidget component

□ Content import
  □ 22 bestaande FAQ's migreren
  □ Embeddings genereren
  □ Categorieën structureren
```

### Fase 2: Content & SEO (Week 5-8)

```
□ Content productie
  □ 10 pillar pages schrijven
  □ 30 cluster artikelen
  □ FAQ schema's toevoegen
  □ Lead magnets ontwikkelen

□ SEO implementatie
  □ Schema.org markup
  □ Dynamic sitemap
  □ Meta tag templates
  □ Internal linking structure

□ UX polish
  □ Zoekresultaten pagina
  □ Categorie pagina's
  □ Related articles
  □ Breadcrumbs
```

### Fase 3: AI & Conversion (Week 9-12)

```
□ AI features
  □ Chat widget verfijnen
  □ Voice search integratie
  □ Auto-suggest
  □ Content gap detection

□ Lead generation
  □ Lead magnet forms
  □ E-mail capture flows
  □ Newsletter integratie
  □ CTA's optimaliseren

□ Analytics
  □ Event tracking
  □ Dashboard bouwen
  □ A/B testing setup
  □ Feedback loops
```

### Fase 4: Scale & Optimize (Ongoing)

```
□ Content velocity
  □ 10 artikelen/week productie
  □ AI-assisted writing workflow
  □ Guest content programma

□ SEO growth
  □ Link building
  □ PR/mentions
  □ Social amplification

□ Conversion optimization
  □ A/B tests op CTA's
  □ Lead magnet performance
  □ E-mail sequence optimization
```

---

## DEEL 10: BUDGET & RESOURCES

### Technologie Kosten (Maandelijks)

| Service | Kosten | Notitie |
|---------|--------|---------|
| Supabase Pro | €25/maand | Database + auth |
| OpenRouter API | €50-100/maand | AI calls (chat, embeddings) |
| Vercel Pro | €20/maand | Hosting + edge |
| E-mail (Resend) | €20/maand | Transactional + newsletters |
| **Totaal** | **~€115-165/maand** | |

### Content Productie

| Optie | Kosten | Output |
|-------|--------|--------|
| DIY + AI | €0 + tijd | 5-10 artikelen/week |
| Freelance writer | €150-300/artikel | Kwaliteitscontrole nodig |
| Agency | €2000-5000/maand | Full service |

### Aanbeveling

Start met **DIY + AI** voor de eerste 50 artikelen. Dit:
- Houdt kosten laag
- Behoudt Vincent's authentieke stem
- Bouwt interne expertise
- Kan later opgeschaald worden

---

## QUICK WINS (Direct te implementeren)

1. **Bestaande FAQ's publiceren** → Direct 22 geïndexeerde pagina's
2. **Schema markup toevoegen** → FAQ rich snippets in Google
3. **AI chat activeren** → Kennisbank doorzoekbaar maken
4. **Lead magnet voor VOG** → Hoogste zoekvolume topic
5. **Sitemap + robots.txt** → Snellere indexering

---

## CONCLUSIE

Dit plan transformeert WeAreImpact van een informatieve website naar een **AI-gedreven kennisplatform** dat:

✅ **SEO-dominantie** bereikt op 100+ relevante keywords
✅ **24/7 beschikbaar** is via AI-assistent
✅ **Leads genereert** door waarde eerst te bieden
✅ **Schaalt** met AI-assisted content productie
✅ **Leert** van gebruikersgedrag en verbetert continu

De combinatie van hoogwaardige content, slimme AI-integratie, en strategische SEO maakt dit een **unieke propositie** in de Nederlandse markt voor sociaal ondernemerschap.

---

*"Innovatie met een sociaal hart - nu ook in je zoekresultaten"*

**Volgende stap**: Goedkeuring plan → Start Fase 1 implementatie
