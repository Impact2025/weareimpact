import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bevestiging mislukt',
  robots: { index: false, follow: false },
};

const REASONS: Record<string, string> = {
  missing_token: 'De verificatielink is onvolledig.',
  invalid_token: 'De verificatielink is niet geldig. Mogelijk heb je al via een eerdere link bevestigd.',
  expired_token: 'De verificatielink is verlopen (geldig voor 24 uur). Meld je opnieuw aan om een nieuwe link te ontvangen.',
  server_error: 'Er is een technische fout opgetreden. Probeer het later opnieuw of neem contact op.',
};

export default function NewsletterErrorPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const reason = typeof searchParams?.reason === 'string' ? searchParams.reason : 'server_error';
  const message = REASONS[reason] ?? REASONS.server_error;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Bevestiging mislukt
        </h1>
        <p className="text-slate-600 mb-8">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/kennisbank"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Opnieuw aanmelden
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
