import type { Metadata } from 'next';
import { getRequestView } from '@/lib/showcase/flow';
import { VraagForm } from './VraagForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Een korte vraag | WeAreImpact',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function VraagPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await getRequestView(token);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FDFBF7] px-4 py-12 sm:py-16">
      <div className="w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-10">
        {!view ? (
          <p className="text-center text-slate-600">Deze link is niet (meer) geldig. Mail me gerust op v.munster@weareimpact.nl.</p>
        ) : (
          <VraagForm view={view} />
        )}
      </div>
    </main>
  );
}
