import type { Metadata } from 'next';
import { QuoteView } from '@/components/finance/QuoteView';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getQuoteByToken } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Offerte',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function OffertePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);

  if (!quote || quote.status === 'concept') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
        <div className="max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Deze link is niet (meer) geldig</h1>
          <p className="mt-2 text-slate-600">Controleer de link in je mail of neem contact op met WeAreImpact.</p>
        </div>
      </main>
    );
  }

  const settings = await getFinanceSettings();
  const daysLeft = Math.ceil((new Date(`${quote.validUntil}T23:59:59`).getTime() - Date.now()) / 86_400_000);
  const { legalName, tradeName, kvk, btw, address, postcode, city, email, representedBy, representedRole, paymentDays } = settings;

  return (
    <QuoteView
      quote={quote}
      own={{ legalName, tradeName, kvk, btw, address, postcode, city, email, representedBy, representedRole, paymentDays }}
      daysLeft={daysLeft}
    />
  );
}
