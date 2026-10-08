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
    <main className="flex min-h-screen flex-col items-center bg-[#FDFBF7] px-4 py-10 sm:py-16">
      <div className="mb-8 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/WeAreImpact_hart.png" alt="" width={36} height={36} className="h-9 w-9" />
        <span className="text-lg font-bold text-slate-900">WeAreImpact</span>
      </div>
      <div className="w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-10">
        {!view ? (
          <p className="text-center text-slate-600">Deze link is niet (meer) geldig. Mail me gerust op v.munster@weareimpact.nl.</p>
        ) : (
          <VraagForm view={view} />
        )}
      </div>
      <p className="mt-6 max-w-xl text-center text-xs text-slate-400">
        Je antwoord gaat rechtstreeks naar Vincent van Munster. We gebruiken het alleen voor ons werk voor jou, en voor een voorbeeld op de site als jij daar akkoord op geeft.
      </p>
    </main>
  );
}
