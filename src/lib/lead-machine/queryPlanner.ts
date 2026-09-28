// Van één zin naar scherpe zoekregels.
//
// De grootste les van de v1-data: "Welzijnsorganisaties Haarlemmermeer" levert
// vooral beleidsstukken en overzichtspagina's op, geen organisaties. Zoekregels
// die op een soort organisatie + een plaats mikken ("stichting welzijn Hoofddorp",
// "vrijwilligerscentrale Haarlem") vinden de organisaties zelf. Deze planner
// schrijft die regels. (Idee uit AgentOS: describe_to_query.)

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';
import { parseLlmJson } from './json';
import type { ProfileKind } from './pipeline';

export async function suggestQueries(description: string, kind: ProfileKind = 'search'): Promise<string[]> {
  const system = kind === 'vacancy'
    ? `Je schrijft zoekregels voor een zoekmachine om VACATURES te vinden die een koopsignaal zijn: een organisatie uit de beschreven doelgroep zoekt iemand voor digitalisering, innovatie, informatiemanagement, procesverbetering of AI. Elke regel begint met "vacature", noemt een functietitel en een woord uit de doelgroep (bv. "vacature kwartiermaker digitalisering welzijnsorganisatie"). Geen aanhalingstekens of operators. 6 regels, variatie in functietitels.`
    : `Je schrijft zoekregels voor een zoekmachine om de WEBSITES van organisaties uit de beschreven doelgroep te vinden — niet artikelen, beleidsstukken of overzichten. Elke regel = soort organisatie + plaatsnaam (bv. "stichting welzijn Hoofddorp", "vrijwilligerscentrale Haarlem", "buurthuis Nieuw-Vennep"). Kies echte plaatsen in of rond de genoemde regio, en variëer het soort organisatie. Geen aanhalingstekens of operators. 8 regels.`;
  try {
    const res = await getOpenRouter().chat.completions.create({
      model: MODELS.HAIKU,
      messages: [
        { role: 'system', content: `${system}\n\nAntwoord UITSLUITEND met JSON: {"queries": ["…"]}` },
        { role: 'user', content: description.slice(0, 600) },
      ],
      max_tokens: 400,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });
    const p = parseLlmJson<{ queries?: unknown[] }>(res.choices[0]?.message?.content);
    return (p?.queries ?? [])
      .map((q) => String(q).replace(/["']/g, '').trim())
      .filter((q) => q.length > 5 && q.length < 90)
      .slice(0, 8);
  } catch (err) {
    console.error('suggestQueries error:', err);
    return [];
  }
}
