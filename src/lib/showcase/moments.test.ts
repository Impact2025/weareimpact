import { describe, expect, it } from 'vitest';
import {
  MOMENTS,
  MOMENT_ORDER,
  cleanFollowup,
  fillName,
  isConcerning,
  isSendWindow,
  momentForAppointment,
  pickQuote,
} from './moments';

describe('momentdefinities', () => {
  it('heeft voor elk moment minstens één vraag en een eigen vervolgvraag', () => {
    for (const key of MOMENT_ORDER) {
      expect(MOMENTS[key].questions.length).toBeGreaterThan(0);
      expect(MOMENTS[key].fallbackFollowup.endsWith('?')).toBe(true);
    }
  });

  it('gebruikt geen zweverige woorden in vragen en vervolgvragen, behalve bij het gevoelsmoment', () => {
    const banned = /\b(raak\w*|voel\w*|ervaring|ervaar\w*)\b/i;
    for (const key of MOMENT_ORDER) {
      const texts = [MOMENTS[key].fallbackFollowup, ...MOMENTS[key].questions.map((q) => q.label)];
      for (const t of texts) {
        if (key === 'dag1') continue;
        expect(t, `${key}: ${t}`).not.toMatch(banned);
      }
    }
  });

  it('kiest de gekozen demovraag als vaste terugval', () => {
    expect(MOMENTS.demo.fallbackFollowup).toBe('Wat uit de demo zou je morgen al willen gebruiken?');
  });
});

describe('momentForAppointment', () => {
  it('koppelt afspraken aan het juiste vraagmoment', () => {
    expect(momentForAppointment('sparring')).toBe('intake');
    expect(momentForAppointment('intake')).toBe('intake');
    expect(momentForAppointment('demo')).toBe('demo');
    expect(momentForAppointment('tussenevaluatie')).toBe('tussen');
    expect(momentForAppointment('oplevering')).toBeNull();
  });
});

describe('isConcerning', () => {
  it('herkent lage scores en een te langzaam tempo', () => {
    expect(isConcerning('intake', { intake_score: 2 })).toBe(true);
    expect(isConcerning('intake', { intake_score: 4 })).toBe(false);
    expect(isConcerning('tussen', { tempo: 'te-langzaam' })).toBe(true);
    expect(isConcerning('tussen', { tempo: 'precies-goed', stijl: ['direct'] })).toBe(false);
    expect(isConcerning('tussen', { stijl: ['te-druk'] })).toBe(true);
    expect(isConcerning('dag1', { gevoel: '2' })).toBe(true);
    expect(isConcerning('dag14', { nps: 6 })).toBe(true);
    expect(isConcerning('dag14', { nps: 9 })).toBe(false);
  });

  it('telt een scope waar de helft nee op zegt als zorgwekkend', () => {
    expect(isConcerning('dag14', { nps: 9, scope: { a: 'nee', b: 'ja' } })).toBe(true);
    expect(isConcerning('dag14', { nps: 9, scope: { a: 'ja', b: 'deels', c: 'nee' } })).toBe(false);
  });
});

describe('cleanFollowup', () => {
  it('accepteert één korte vraag', () => {
    expect(cleanFollowup('Welk deel van het knip-en-plakwerk wil je het eerst kwijt?', 'demo')).toBe(
      'Welk deel van het knip-en-plakwerk wil je het eerst kwijt?',
    );
  });
  it('wijst af: geen vraagteken, twee vragen, te kort of te lang', () => {
    expect(cleanFollowup('Vertel meer over de demo', 'demo')).toBeNull();
    expect(cleanFollowup('Wat viel op? En wat miste je?', 'demo')).toBeNull();
    expect(cleanFollowup('Wat?', 'demo')).toBeNull();
    expect(cleanFollowup(`${'a'.repeat(230)}?`, 'demo')).toBeNull();
    expect(cleanFollowup(null, 'demo')).toBeNull();
  });
  it('wijst zweverige woorden af, behalve na livegang', () => {
    expect(cleanFollowup('Welk deel raakte je het meest in de demo?', 'demo')).toBeNull();
    expect(cleanFollowup('Hoe voelde het om het zelf te gebruiken?', 'dag1')).not.toBeNull();
  });
  it('haalt aanhalingstekens rond de hele vraag weg', () => {
    expect(cleanFollowup('"Wat zou je morgen al willen gebruiken?"', 'demo')).toBe('Wat zou je morgen al willen gebruiken?');
  });
});

describe('pickQuote en fillName', () => {
  it('pakt het eerste bruikbare tekstantwoord en kort lange antwoorden in', () => {
    expect(pickQuote({ pijn: 'Knip-en-plakwerk uit Word' })).toBe('Knip-en-plakwerk uit Word');
    expect(pickQuote({ pijn: 'x' })).toBeNull();
    expect(pickQuote({ pijn: 'a'.repeat(200) })!.length).toBeLessThanOrEqual(90);
  });
  it('vult de voornaam in of laat hem netjes weg', () => {
    expect(fillName('Hoi {voornaam}, we zijn halverwege', 'Magali')).toBe('Hoi Magali, we zijn halverwege');
    expect(fillName('Hoi {voornaam}, we zijn halverwege', null)).toBe('Hoi, we zijn halverwege');
  });
});

describe('isSendWindow', () => {
  it('verstuurt alleen op werkdagen overdag', () => {
    expect(isSendWindow({ weekday: 2, hour: 10 })).toBe(true);
    expect(isSendWindow({ weekday: 2, hour: 7 })).toBe(false);
    expect(isSendWindow({ weekday: 2, hour: 19 })).toBe(false);
    expect(isSendWindow({ weekday: 6, hour: 10 })).toBe(false);
    expect(isSendWindow({ weekday: 0, hour: 10 })).toBe(false);
  });
});
