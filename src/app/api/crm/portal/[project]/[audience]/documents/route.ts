import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import { isValidPortalSessionToken, portalCookieName, isAudience, type Audience } from '@/lib/crm/portal-session';
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  extractTextFromFile,
  saveDocument,
} from '@/lib/crm/documents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireProjectSession(projectSlug: string, audience: Audience): Promise<boolean> {
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug, audience))?.value;
  return isValidPortalSessionToken(token, projectSlug, audience);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string }> },
) {
  const { project: projectSlug, audience } = await params;
  if (!isAudience(audience) || !(await requireProjectSession(projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 });
  }

  if (!(file.type in ALLOWED_UPLOAD_TYPES)) {
    return NextResponse.json(
      {
        error:
          'Alleen PDF, tekst (.txt), Markdown (.md) of CSV worden ondersteund. ' +
          'Exporteer een Word-document als PDF, of plak de tekst direct in het gesprek.',
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Bestand is te groot (max 15MB).' }, { status: 400 });
  }

  let extractedText: string;
  try {
    extractedText = (await extractTextFromFile(file)).trim();
  } catch (error) {
    console.error('Document extraction error:', error);
    return NextResponse.json(
      { error: 'Kon de tekst niet uit dit bestand halen. Probeer een ander bestand.' },
      { status: 400 },
    );
  }

  if (!extractedText) {
    return NextResponse.json(
      { error: 'Dit bestand bevat geen leesbare tekst (mogelijk een gescande PDF zonder tekstlaag).' },
      { status: 400 },
    );
  }

  let blobUrl: string | null = null;
  try {
    const ext = ALLOWED_UPLOAD_TYPES[file.type];
    const path = `crm-documents/${projectSlug}/${audience}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(path, file, { access: 'public' });
    blobUrl = blob.url;
  } catch (error) {
    // Origineel bestand bewaren is nice-to-have voor Vincent; de geëxtraheerde
    // tekst (het enige wat Iris nodig heeft) is al binnen, dus falen we hier niet op.
    console.error('Blob upload error (non-fatal):', error);
  }

  const doc = await saveDocument({
    projectSlug,
    audience,
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    blobUrl,
    extractedText,
    source: 'upload',
  });

  return NextResponse.json({
    documentId: doc.id,
    filename: doc.filename,
    charCount: doc.extracted_text.length,
  });
}
