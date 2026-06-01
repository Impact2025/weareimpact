'use client';

import Link from 'next/link';
import { useCookieConsent } from './CookieConsentProvider';

export function CookieBanner() {
  const { consent, accept, decline } = useCookieConsent();

  if (consent !== 'pending') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white mb-1">
                Wij gebruiken cookies
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Analytische cookies (Google Analytics) helpen ons de site verbeteren. Strikt noodzakelijke cookies zijn altijd actief.{' '}
                <Link href="/cookies" className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors">
                  Meer info
                </Link>
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg transition-colors whitespace-nowrap"
              >
                Alleen noodzakelijk
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Alles accepteren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
