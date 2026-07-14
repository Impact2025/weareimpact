import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Podcasts (.m4a) are far larger than the ~4.5MB serverless request-body limit,
// so we do a client-side direct-to-Blob upload. This route only mints a scoped
// upload token (after verifying admin auth) and validates the content type.
export const dynamic = 'force-dynamic';

const ALLOWED_AUDIO_TYPES = [
  'audio/mp4', // .m4a (canonical)
  'audio/x-m4a', // .m4a (some browsers/OS)
  'audio/aac',
  'audio/mpeg', // .mp3 fallback
  'audio/wav',
  'audio/x-wav',
];

const MAX_AUDIO_BYTES = 150 * 1024 * 1024; // 150MB — comfortably covers a long NotebookLM episode

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only authenticated admins may obtain an upload token.
        if (!(await isAdminAuthenticated())) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: ALLOWED_AUDIO_TYPES,
          maximumSizeInBytes: MAX_AUDIO_BYTES,
          addRandomSuffix: true,
        };
      },
      // Fires after the browser finishes uploading directly to Blob storage.
      // Nothing to persist here — the client stores the returned URL on the post.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
