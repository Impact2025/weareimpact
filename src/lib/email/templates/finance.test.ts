import { describe, expect, it } from 'vitest';
import { quoteSentEmail } from './finance';

const base = {
  signerName: 'Nicole Verhoeven',
  title: 'Platform',
  reference: 'WAI-1',
  url: 'https://weareimpact.nl/offerte/x',
  validUntil: '2026-10-28',
  totalExclCents: 600000,
};

describe('quoteSentEmail', () => {
  it('begroet met de voornaam', () => {
    expect(quoteSentEmail(base).html).toContain('Hoi Nicole,');
  });

  it('noemt geen bedrag: dat staat in de offerte zelf', () => {
    const { html, text } = quoteSentEmail(base);
    expect(html).not.toContain('Investering');
    expect(html).not.toContain('excl. btw');
    expect(text).not.toContain('excl. btw');
    expect(html).toContain('Referentie:');
    expect(html).toContain('Geldig tot:');
  });

  it('zet het persoonlijke bericht vóór de standaardtekst, als alinea\'s', () => {
    const { html, text } = quoteSentEmail({ ...base, coverNote: 'Eerste alinea.\nTweede regel.\n\nNieuwe alinea.' });
    expect(html.indexOf('Eerste alinea.')).toBeLessThan(html.indexOf('Hierbij mijn offerte'));
    expect(html).toContain('Eerste alinea.<br>Tweede regel.');
    expect(html).toContain('Nieuwe alinea.');
    expect(text.indexOf('Eerste alinea.')).toBeLessThan(text.indexOf('Hierbij mijn offerte'));
  });

  it('escapet html in het persoonlijke bericht', () => {
    const { html } = quoteSentEmail({ ...base, coverNote: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('maakt een testmail herkenbaar in onderwerp en tekst', () => {
    const mail = quoteSentEmail({ ...base, test: true });
    expect(mail.subject.startsWith('[TEST] ')).toBe(true);
    expect(mail.html).toContain('Testmail.');
    expect(quoteSentEmail(base).subject.startsWith('[TEST]')).toBe(false);
  });
});
