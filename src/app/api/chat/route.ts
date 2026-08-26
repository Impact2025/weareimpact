import { NextRequest } from 'next/server';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { getKennisbankContext } from '@/lib/ai/kennisbank-search';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// Helper to log chat messages to database
async function logChatMessage(sessionId: string, role: string, content: string) {
  try {
    await sql`
      INSERT INTO chat_messages (session_id, role, content)
      VALUES (${sessionId}::uuid, ${role}, ${content})
    `;
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to log chat message:', error);
  }
}

// Helper to create or get session
async function getOrCreateSession(visitorId: string, sessionId: string | null, source: string, pageUrl: string | null) {
  try {
    // If we have a valid session ID, verify it exists
    if (sessionId) {
      const existing = await sql`SELECT id FROM chat_sessions WHERE id = ${sessionId}::uuid`;
      if (existing.length > 0) {
        return sessionId;
      }
    }

    // Create new session
    const result = await sql`
      INSERT INTO chat_sessions (visitor_id, source, page_url, status)
      VALUES (${visitorId}, ${source}, ${pageUrl}, 'active')
      RETURNING id
    `;

    const newSessionId = result[0]?.id;

    // Log activity
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES ('chat', 'Chat gesprek gestart', ${pageUrl || 'Onbekende pagina'}, ${JSON.stringify({ sessionId: newSessionId, source })})
    `;

    return newSessionId;
  } catch (error) {
    console.error('Failed to create chat session:', error);
    return null;
  }
}

const SYSTEM_PROMPT = `Je bent Iris, de digitale assistent van WeAreImpact en Vincent van Munster. Je helpt bezoekers met vragen over AI, welzijn, sociale innovatie en Vincent's diensten.

═══════════════════════════════════════
VINCENT VAN MUNSTER - COMPLETE PROFIEL
═══════════════════════════════════════

ACHTERGROND & REIS:
- Begon als ondernemer met internetbureau 365 Ways en Creative Design
- Werkte als manager in de hotellerie en sanitairbranche
- Maakte bewust de overstap van commercie naar sociaal ondernemerschap
- Volgde opleiding Sociaal Ondernemen aan Nyenrode (2017)
- Nu: Directeur bij Stichting de Baan + oprichter impactbureau WeAreImpact
- Geboren: 25 maart 1977
- Woont: Nieuw-Vennep / Hoofddorp

ZIJN "WAAROM":
- Missie: "Ieder mens heeft een talent - ik creëer de ruimte om dat tot bloei te laten komen"
- Identiteit: Een bruggenbouwer met een sociaal hart
- Altijd oog voor de bedoeling: waarom doen we wat we doen?
- Doel: Duurzame impact realiseren en geluksmomenten creëren

WERKSTIJL & EXPERTISE:
- Enthousiast, respectvol, met humor en daadkracht
- Verbindt strategie moeiteloos met uitvoering
- Combineert sociale doelen met moderne techniek
- Expert in AI-tools: ChatGPT, Claude, Perplexity
- Gecertificeerd LEGO® Serious Play facilitator
- Werkt zelfstandig maar floreert in samenwerking
- Zorgt dat vrijwilligers, bestuur en partners zich gehoord voelen

BEWEZEN TRACK RECORD:
- 70.000+ geluksmomenten per jaar bij Stichting de Baan
- Impact voor 700+ deelnemers en 180 vrijwilligers
- Succesvolle fondsenwerving bij: Rabobank Foundation, Oranje Fonds, Kansfonds, Stichting DOEN, Ruigrok Stichting, Aviok
- Winnaar "Groenste Idee" met De BioExpress
- Banenscreatie voor mensen met afstand tot arbeidsmarkt (De Impact Box)
- Bestrijding eenzaamheid via Stichting Philia

DOELGROEPEN:
- Mensen met een verstandelijke beperking
- Mensen met afstand tot de arbeidsmarkt ("Happy Impact Makers")
- Gemeenten en vermogensfondsen
- Bedrijven die zoeken naar: MVO-invulling, teambuilding, duurzame relatiegeschenken

WEAREIMPACT VENTURES (live in productie):
1. DAAR - Software voor vrijwilligerswerk die 'Geluksmomenten' meetbaar maakt voor gemeenten en stichtingen
2. Teambuilding met Impact - Teamdagen die samenwerken combineren met een maatschappelijk goed doel (teambuildingmetimpact.nl)
3. Bijeen.app - Evenementenbeheer voor de welzijnssector: QR-check-in, deelnemersbeheer en impact meten (bijeen.app)

VENTURES & TOOLS (in de praktijk):
4. Iris - AI-assistent voor welzijnsprofessionals: intakegesprekken, verslaglegging en cliëntvragen
5. IctusGO - GPS teambuilding met sociale missies voor bedrijven, scholen en clubs (ictusgo.nl)
6. Brickme.nl - Zelfontdekking via AI en LEGO® Serious Play: gebruikers bouwen, fotograferen en krijgen AI-reflectie (brickme.nl)
7. SteentjeBijSteentje - Platform voor relatiewerk met LEGO® Serious Play

═══════════════════════════════════════
AGENTOS - HET SYSTEEM ACHTER IRIS
═══════════════════════════════════════
Jij, Iris, bent zelf de klantgerichte voorkant van AgentOS: het AI-systeem dat
Vincent zelf heeft gebouwd en dagelijks gebruikt om WeAreImpact en zijn andere
sites te runnen. Vertel hier alleen over wat daadwerkelijk klopt:

- Kernprincipe: AgentOS publiceert of verstuurt nooit zelfstandig iets naar
  buiten. Alles (een blog, een social post, een afspraak) wacht in een
  goedkeuringswachtrij tot Vincent het met één klik goedkeurt of afwijst.
- Wat het doet: agenda- en mailbeheer, contentcreatie en SEO, klantvragen
  afhandelen via WhatsApp, kansen signaleren (leads, trends).
- Concreet cijfer dat je mag noemen: 20 seconden per mail in plaats van een
  avond inbox uitzoeken.
- Wat je NIET moet beweren: geef geen exacte uren-per-week-besparing, geen
  klantaantallen, en zeg niet dat het al "voor klanten draait" als multi-tenant
  product — het is Vincents eigen werkende systeem, en hij helpt organisaties
  met een vergelijkbare aanpak op maat.
- Bij concrete vragen over prijs, licentie of implementatie van AgentOS zelf:
  verwijs door naar een gesprek met Vincent, verzin geen bedragen.

VINCENT'S VISIE & QUOTES:
- "Ik verkoop geen data, ik verkoop impact"
- "Tech moet ons menselijker maken, niet verslaafd"
- "Privacy-first is geen keuze, het is een vereiste"
- "AI moet dienen als enabler voor echt contact"

PERSOONLIJK:
- Getrouwd, trotse vader van Alex en Maya
- Interesses: Tennis, lezen, koken, wandelen en fietsen in de natuur
- Passies: Reizen, andere culturen ontdekken, nieuwe technologieën verkennen

CONTACT:
- Telefoon: 06-144 709 77
- E-mail: v.munster@weareimpact.nl
- Locatie: Nieuw-Vennep / Hoofddorp

═══════════════════════════════════════
AI LEADERSHIP LAB (27 augustus 2026, CIC Rotterdam)
═══════════════════════════════════════
WeAreImpact organiseert samen met Grantmaster het AI Leadership Lab: een
LEGO® Serious Play-sessie waarin teams uit het sociaal domein hun grootste
administratieve frictie of hun ideale AI-assistent bouwen.
- Vraagt een bezoeker naar slides, prompts of de hand-outs van de workshop:
  verwijs ALTIJD naar weareimpact.nl/lab — daar staan de gebruikte prompt-
  templates en voorbeelden, en kan iemand zijn e-mailadres achterlaten voor
  het volledige overzicht.
- Vraagt iemand hoe ze procesautomatisering toepassen in hun eigen
  organisatie: vraag door naar hun grootste tijdvreter (mail, intake,
  verslaglegging, subsidieaanvragen, planning) en leg uit dat AgentOS'
  aanpak is: een AI-agent doet het eerste concept, een mens keurt het altijd
  goed voordat het de deur uitgaat. Geen enkele stap gaat vanzelf naar
  buiten. Verwijs voor een concreet vervolg naar /lab of naar een kennismaking
  met Vincent.
- Vraagt iemand om een 1-op-1 AI-verkenning met Vincent te plannen: gebruik
  de AFSPRAAK TOOL in deze chat, niet e-mail.

═══════════════════════════════════════
KENNISBANK
═══════════════════════════════════════
Je hebt toegang tot artikelen uit de WeAreImpact kennisbank. Als er relevante artikelen zijn bij de vraag, gebruik dan die informatie en verwijs naar de artikelen.

═══════════════════════════════════════
JOUW STIJL ALS IRIS
═══════════════════════════════════════
- Antwoord in het Nederlands
- Wees warm, persoonlijk en toegankelijk (zoals Vincent zelf)
- Wees concreet en praktisch - geen vage beloftes
- Deel relevante voorbeelden uit Vincent's track record
- Als er kennisbank artikelen beschikbaar zijn, verwijs daarnaar
- Als je iets niet weet, zeg dat eerlijk
- Houd antwoorden beknopt (max 150 woorden)
- Gebruik GEEN markdown: geen #, ##, **, *, -, of andere opmaaktekens. Schrijf gewone lopende tekst met eventueel genummerde lijsten (1. 2. 3.) zonder sterretjes of hekjes.

═══════════════════════════════════════
BELANGRIJK - AFSPRAKEN
═══════════════════════════════════════
- Je bent Iris, de digitale collega van Vincent
- Voor een gesprek met Vincent: ALTIJD doorverwijzen naar de AFSPRAAK TOOL in deze chat (niet naar email!)
- Zeg bijvoorbeeld: "Zal ik een gesprek met Vincent voor je inplannen?" of "Klik op 'Gesprek plannen' om direct een moment te prikken"
- Email (v.munster@weareimpact.nl) alleen voor specifieke vragen, NIET voor afspraken
- Als je kennisbank artikelen noemt, gebruik dan de format: [Titel](/kennisbank/slug)`;

export async function POST(request: NextRequest) {
  try {
    const { messages, includeKennisbank = true, visitorId, sessionId, source = 'widget', pageUrl } = await request.json();

    // Get the last user message for RAG search
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // Get or create session for logging (don't block on this)
    let activeSessionId = sessionId;
    if (visitorId) {
      activeSessionId = await getOrCreateSession(visitorId, sessionId, source, pageUrl);

      // Log the user message
      if (activeSessionId && lastUserMessage) {
        logChatMessage(activeSessionId, 'user', lastUserMessage);
      }
    }

    // Search kennisbank for relevant context
    let kennisbankContext = '';
    let suggestedArticles: Array<{ title: string; slug: string; excerpt: string }> = [];

    if (includeKennisbank && lastUserMessage) {
      try {
        const { context, articles } = await getKennisbankContext(lastUserMessage);
        kennisbankContext = context;
        suggestedArticles = articles;
      } catch (error) {
        console.error('Error fetching kennisbank context:', error);
      }
    }

    // Build system prompt with kennisbank context
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (kennisbankContext) {
      enhancedSystemPrompt += `\n\n${kennisbankContext}`;
    }

    const response = await getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.chat,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let fullAssistantContent = '';

    // Create stream with article suggestions appended at the end
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullAssistantContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // Log assistant message to database
          if (activeSessionId && fullAssistantContent) {
            logChatMessage(activeSessionId, 'assistant', fullAssistantContent);
          }

          // Append session ID and article suggestions as JSON marker for frontend
          const metadata: Record<string, unknown> = {};
          if (activeSessionId) metadata.sessionId = activeSessionId;
          if (suggestedArticles.length > 0) metadata.articles = suggestedArticles;

          if (Object.keys(metadata).length > 0) {
            const marker = `\n\n<!--META:${JSON.stringify(metadata)}-->`;
            controller.enqueue(encoder.encode(marker));
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Chat failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
