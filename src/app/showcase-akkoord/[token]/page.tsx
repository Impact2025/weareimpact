import type { Metadata } from 'next';
import { getReviewView } from '@/lib/showcase/case';
import { ShowcaseArticle } from '@/components/showcase/ShowcaseArticle';
import { ReviewActions } from './ReviewActions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mag dit als voorbeeld? | WeAreImpact',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function ShowcaseReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await getReviewView(token);

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 sm:py-16">
      <div className="mx-auto mb-8 flex max-w-3xl items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/WeAreImpact_hart.png" alt="" width={36} height={36} className="h-9 w-9" />
        <span className="text-lg font-bold text-slate-900">WeAreImpact</span>
      </div>

      {!view ? (
        <div className="mx-auto max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Deze link is niet (meer) geldig</h1>
          <p className="mt-2 text-slate-600">Mail me gerust op v.munster@weareimpact.nl.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-orange-100 bg-orange-50 p-5 text-slate-800">
            <p className="font-semibold">
              {view.firstName ? `Hoi ${view.firstName}, dit` : 'Dit'} is precies wat er op de site zou komen.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Er verschijnt niets zonder jouw akkoord. Onderaan kies je: akkoord, iets laten aanpassen of liever niet meedoen.
            </p>
          </div>

          <ShowcaseArticle snapshot={view.snapshot} preview />

          <ReviewActions token={token} status={view.status} decided={view.decided} />
        </div>
      )}
    </main>
  );
}
