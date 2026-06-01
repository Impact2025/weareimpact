import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aanmelding bevestigd',
  robots: { index: false, follow: false },
};

export default function NewsletterBevestigdPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Aanmelding bevestigd!
        </h1>
        <p className="text-slate-600 mb-8">
          Je staat nu ingeschreven voor de WeAreImpact nieuwsbrief. Je ontvangt voortaan updates over AI, welzijn en sociale innovatie.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Terug naar de homepage
        </Link>
      </div>
    </div>
  );
}
