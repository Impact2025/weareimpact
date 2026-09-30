import { describe, expect, it } from 'vitest';
import { emailSignature } from './emailLayout';

describe('emailSignature', () => {
  const html = emailSignature();

  it('bevat groet, logo, slogan en naam', () => {
    expect(html).toContain('Hartelijke groet,');
    expect(html).toContain('WeAreImpact_hart.png');
    expect(html).toContain('AI &amp; Innovatie met een sociaal hart.');
    expect(html).toContain('Vincent van Munster');
  });

  it('bevat alle contactregels met werkende links', () => {
    expect(html).toContain('06 - 144 709 77');
    expect(html).toContain('mailto:v.munster@weareimpact.nl');
    expect(html).toContain('href="https://weareimpact.nl"');
    expect(html).toContain('linkedin.com/in/vincent-van-m%C3%BCnster');
  });

  it('kan zonder groet als de mail zelf al afsluit', () => {
    expect(emailSignature(false)).not.toContain('Hartelijke groet,');
    expect(emailSignature(false)).toContain('Vincent van Munster');
  });
});
