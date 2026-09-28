// Mailbeleid voor koude outreach — welk adres kiezen we, en mogen we het mailen?
//
// Geporteerd uit AgentOS prospecting/outreach.py (lessen van aug–sep 2026) en
// aangepast voor het sociaal domein: bij een stichting of welzijnsorganisatie
// ís info@ vaak de juiste ingang (klein team, secretariaat leest mee), dus
// generieke adressen zijn hier toegestaan — alleen lager gerangschikt dan een
// adres van een persoon of een relevante afdeling.
//
// Harde weigeringen (Telecommunicatiewet art. 11.7 + reputatie):
//  - adres op een ander domein dan de organisatie (platform/webbouwer)
//  - consumentendomein (gmail, ziggo…): natuurlijk persoon → geen ongevraagde mail
//  - sollicitatie-, factuur-, privacy- en systeemadressen: nooit een beslisser
//  - onze eigen domeinen (self-lead)

import { emailBelongsToDomain, emailDomain } from './domain';

const OWN_DOMAINS = new Set(['weareimpact.nl', 'bewaardvooraltijd.nl', 'daar.nl']);

const CONSUMER_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.nl', 'outlook.com', 'outlook.nl',
  'live.nl', 'live.com', 'msn.com', 'yahoo.com', 'yahoo.nl', 'icloud.com', 'me.com',
  'ziggo.nl', 'kpnmail.nl', 'kpnplanet.nl', 'planet.nl', 'hetnet.nl', 'home.nl',
  'casema.nl', 'chello.nl', 'upcmail.nl', 'quicknet.nl', 'tele2.nl', 'telfort.nl',
  'xs4all.nl', 'online.nl', 'zonnet.nl', 'solcon.nl', 'caiway.nl', 'protonmail.com', 'proton.me',
]);

// Nooit mailen: dit leest geen beslisser.
const BLOCKED_LOCAL = new Set([
  'noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster', 'abuse', 'webmaster',
  'privacy', 'avg', 'fg', 'functionarisgegevensbescherming', 'security',
  'sollicitatie', 'sollicitaties', 'solliciteren', 'vacature', 'vacatures', 'jobs', 'werkenbij',
  'recruitment', 'career', 'careers', 'hr', 'p-o', 'po',
  'factuur', 'facturen', 'facturatie', 'crediteuren', 'debiteuren', 'boekhouding',
  'webshop', 'shop', 'bestellingen', 'orders', 'klachten', 'klachtenfunctionaris',
  'pers', 'redactie', 'nieuwsbrief', 'newsletter', 'marketing', 'sales',
]);

// Generiek maar bruikbaar in het sociaal domein (lagere rang dan persoonlijk).
const GENERIC_LOCAL = new Set([
  'info', 'contact', 'algemeen', 'mail', 'post', 'office', 'secretariaat', 'receptie',
  'hallo', 'hello', 'welkom', 'administratie', 'bestuur', 'directie', 'management',
  'aanmelden', 'welzijn', 'vrijwilligers', 'vrijwilligerswerk',
]);

// Waardevolst: rollen die over innovatie/organisatie beslissen.
const DECISION_LOCAL = /^(directie|directeur|bestuur|bestuurder|management|innovatie|kwaliteit|beleid)$/;

const FILE_EXT = /\.(png|jpe?g|gif|svg|webp|css|js|woff2?)$/i;

export type EmailVerdict = { ok: true; kind: 'personal' | 'decision' | 'generic' } | { ok: false; reason: string };

export function judgeEmail(email: string, orgDomain?: string | null): EmailVerdict {
  const addr = (email || '').trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/.test(addr) || FILE_EXT.test(addr)) {
    return { ok: false, reason: 'geen geldig e-mailadres' };
  }
  const [local] = addr.split('@');
  const dom = emailDomain(addr)!;
  if (/(example|voorbeeld|domein|sentry|wixpress|w3\.org|schema\.org)/.test(dom)) {
    return { ok: false, reason: `placeholder- of systeemdomein (${dom})` };
  }
  if (OWN_DOMAINS.has(dom)) return { ok: false, reason: 'eigen domein (self-lead)' };
  if (CONSUMER_DOMAINS.has(dom)) {
    return { ok: false, reason: `consumentendomein (${dom}) — vermoedelijk een privépersoon, geen ongevraagde mail (bel of bezoek)` };
  }
  if (BLOCKED_LOCAL.has(local) || /^(no-?reply|sollicit|vacature|factu)/.test(local)) {
    return { ok: false, reason: `${local}@ leest geen beslisser` };
  }
  if (orgDomain && !emailBelongsToDomain(addr, orgDomain)) {
    return { ok: false, reason: `adres hoort bij ${dom}, niet bij de organisatie zelf` };
  }
  if (DECISION_LOCAL.test(local)) return { ok: true, kind: 'decision' };
  if (GENERIC_LOCAL.has(local)) return { ok: true, kind: 'generic' };
  return { ok: true, kind: 'personal' };
}

// Rangorde: beslisser-postbus > persoonlijk op eigen domein > generiek op eigen
// domein. Geweigerde adressen vallen eruit.
export function rankEmails(candidates: string[], orgDomain: string): string[] {
  const weight = { decision: 0, personal: 1, generic: 2 } as const;
  return [...new Set(candidates.map((c) => c.trim().toLowerCase()))]
    .map((e) => ({ e, v: judgeEmail(e, orgDomain) }))
    .filter((x): x is { e: string; v: { ok: true; kind: 'personal' | 'decision' | 'generic' } } => x.v.ok)
    .sort((a, b) => weight[a.v.kind] - weight[b.v.kind])
    .map((x) => x.e);
}
