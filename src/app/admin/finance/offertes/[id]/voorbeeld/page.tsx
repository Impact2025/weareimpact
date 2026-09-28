import { notFound } from 'next/navigation';
import { QuoteView } from '@/components/finance/QuoteView';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getQuote } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

// Voorbeeld voor Vincent: exact de klantweergave, zonder telling en zonder akkoordknop.
export default async function QuotePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();
  const s = await getFinanceSettings();
  const daysLeft = Math.ceil((new Date(`${quote.validUntil}T23:59:59`).getTime() - Date.now()) / 86_400_000);
  return (
    <div className="-m-4 md:-m-6 lg:-m-8">
      <QuoteView
        preview
        quote={quote}
        daysLeft={daysLeft}
        own={{ legalName: s.legalName, tradeName: s.tradeName, kvk: s.kvk, btw: s.btw, address: s.address, postcode: s.postcode, city: s.city, email: s.email, representedBy: s.representedBy, representedRole: s.representedRole, paymentDays: s.paymentDays }}
      />
    </div>
  );
}
