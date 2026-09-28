import type { Metadata } from 'next';
import { getFeedbackByToken } from '@/lib/crm/aftercare';
import { FeedbackForm } from './FeedbackForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hoe bevalt het? | WeAreImpact',
  robots: { index: false, follow: false },
};

export default async function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const request = await getFeedbackByToken(token);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FDFBF7]">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-orange-100 shadow-sm p-6 sm:p-10">
        {!request ? (
          <p className="text-slate-600 text-center">Deze link is niet (meer) geldig.</p>
        ) : request.answered ? (
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Dank je wel!</h1>
            <p className="text-slate-600">Je antwoord is al binnen.</p>
          </div>
        ) : (
          <FeedbackForm token={token} firstName={request.firstName} subjectName={request.subjectName} />
        )}
      </div>
    </main>
  );
}
