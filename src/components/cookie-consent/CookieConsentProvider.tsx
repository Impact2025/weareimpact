'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type ConsentValue = 'pending' | 'accepted' | 'declined';

interface CookieConsentContextType {
  consent: ConsentValue;
  accept: () => void;
  decline: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: 'pending',
  accept: () => {},
  decline: () => {},
});

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

function readConsentCookie(): ConsentValue {
  if (typeof document === 'undefined') return 'pending';
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
  const val = match?.[1];
  if (val === 'accepted' || val === 'declined') return val;
  return 'pending';
}

function writeConsentCookie(value: 'accepted' | 'declined') {
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `cookie_consent=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue>('pending');

  useEffect(() => {
    setConsent(readConsentCookie());
  }, []);

  const accept = useCallback(() => {
    writeConsentCookie('accepted');
    setConsent('accepted');
  }, []);

  const decline = useCallback(() => {
    writeConsentCookie('declined');
    setConsent('declined');
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, accept, decline }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
