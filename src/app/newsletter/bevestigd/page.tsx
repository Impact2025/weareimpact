import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aanmelding bevestigd',
  robots: { index: false, follow: false },
};

export default function NewsletterBevestigdPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const isUnsubscribed = searchParams?.unsubscribed === 'true';

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isUnsubscribed ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          <svg
            className={`w-8 h-8 ${isUnsubscribed ? 'text-blue-600' : 'text-green-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isUnsubscribed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 6L6 18M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            )}
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          {isUnsubscribed ? 'Afmelding bevestigd' : 'Aanmelding bevestigd!'}
        </h1>
        <p className="text-slate-600 mb-8">
          {isUnsubscribed
            ? 'Je bent nu uitgeschreven van de WeAreImpact nieuwsbrief. We respecteren je keuze.'
            : 'Je staat nu ingeschreven voor de WeAreImpact nieuwsbrief. Je ontvangt voortaan updates over AI, welzijn en sociale innovatie.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          {isUnsubscribed ? 'Terug naar de homepage' : 'Terug naar de homepage'}
        </Link>
      </div>
    </div>
  );
}
