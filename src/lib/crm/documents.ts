import { sql } from '@/lib/db/neon';
import type { Audience } from '@/lib/crm/portal-session';

// Boven deze lengte behandelen we een chatbericht niet als los tekstbericht
// maar als document: volledige tekst gaat naar crm_documents, de chat zelf
// houdt alleen een korte verwijzing. Voorkomt dat elk vervolgbericht in het
// gesprek de volledige tekst opnieuw moet meesturen naar het model.
export const DOCUMENT_INLINE_THRESHOLD = 3000;

export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/csv': 'csv',
};

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export async function extractTextFromFile(file: File): Promise<string> {
  const type = file.type;
  if (type === 'application/pdf') {
    const { PDFParse } = await import('pdf-parse');
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  // text/plain, text/markdown, text/csv
  return await file.text();
}

export interface StoredDocument {
  id: string;
  filename: string;
  extracted_text: string;
}

export async function saveDocument(params: {
  projectSlug: string;
  audience: Audience;
  filename: string;
  contentType: string | null;
  sizeBytes: number | null;
  blobUrl: string | null;
  extractedText: string;
  source: 'upload' | 'pasted';
}): Promise<StoredDocument> {
  const rows = await sql`
    INSERT INTO crm_documents (project_slug, audience, filename, content_type, size_bytes, blob_url, extracted_text, source)
    VALUES (${params.projectSlug}, ${params.audience}, ${params.filename}, ${params.contentType}, ${params.sizeBytes}, ${params.blobUrl}, ${params.extractedText}, ${params.source})
    RETURNING id, filename, extracted_text
  `;
  return rows[0] as StoredDocument;
}

export async function getDocument(
  id: string,
  projectSlug: string,
  audience: Audience,
): Promise<StoredDocument | null> {
  const rows = await sql`
    SELECT id, filename, extracted_text FROM crm_documents
    WHERE id = ${id} AND project_slug = ${projectSlug} AND audience = ${audience}
  `;
  return (rows[0] as StoredDocument) ?? null;
}

/** Kort, stabiel verwijzingslabel dat WEL in de blijvende chatgeschiedenis
 * komt te staan, in plaats van de volledige documenttekst. */
export function documentReferenceLabel(filename: string, charCount: number): string {
  return `[DOCUMENT GEDEELD: "${filename}" (${charCount.toLocaleString('nl-NL')} tekens) — volledige inhoud is door Iris gelezen op het moment van delen]`;
}
