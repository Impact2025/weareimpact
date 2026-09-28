// Minimale, veilige opmaak voor offerteteksten: alinea's, "- " lijsten en **vet**.
// Bewust geen HTML: de uitvoer is data die React en react-pdf zelf renderen.

export interface Inline {
  text: string;
  bold: boolean;
}

export type Block = { type: 'p'; inlines: Inline[] } | { type: 'ul'; items: Inline[][] };

export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      out.push({ text: part.slice(2, -2), bold: true });
    } else {
      out.push({ text: part, bold: false });
    }
  }
  return out;
}

export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.replace(/\r/g, '').split(/\n{2,}/)) {
    const lines = chunk.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
    if (lines.length === 0) continue;
    let list: Inline[][] = [];
    let para: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ type: 'p', inlines: parseInline(para.join(' ')) });
      para = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ type: 'ul', items: list });
      list = [];
    };
    for (const line of lines) {
      if (/^\s*[-•]\s+/.test(line)) {
        flushPara();
        list.push(parseInline(line.replace(/^\s*[-•]\s+/, '')));
      } else {
        flushList();
        para.push(line.trim());
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}
