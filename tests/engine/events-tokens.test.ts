import { describe, expect, it } from 'vitest';
import { newLife, renderText, formatMoney } from '../../src/engine';
import { clone } from '../../src/engine/util';
import { money } from '../../src/engine/economy';

describe('token rendering (M4.3)', () => {
  const s = newLife(
    { first: 'Rhea', last: 'Vance', country: 'us', city: 'Tampa', birthYear: 2026 },
    3,
  );
  const mom = s.npcs.find((n) => n.roles.includes('mother'));
  const sib = s.npcs.find((n) => n.roles.includes('sibling'));
  if (!mom) throw new Error('no mother');

  it('renders player tokens', () => {
    expect(renderText(s, '{first} {last}, {age}, of {city}, {country}, in {year}')).toBe(
      `Rhea Vance, 0, of Tampa, United States, in 2026`,
    );
  });

  it('renders NPC tokens with pronouns and relation labels', () => {
    const b = { m: mom.id };
    expect(
      renderText(
        s,
        '{m.first} {m.last}: {m.they}/{m.They}/{m.them}/{m.their}/{m.Their}, {m.rel}, {m.Rel}',
        b,
      ),
    ).toBe(`${mom.first} ${mom.last}: she/She/her/her/Her, your mother, Your mother`);
    const nb = clone(s);
    const x = nb.npcs.find((n) => n.id === mom.id);
    if (x) x.gender = 'nonbinary';
    expect(renderText(nb, '{m.they} {m.is} here and {m.has} tea; {m.they} laugh{m.s}', b)).toBe(
      'they are here and have tea; they laugh',
    );
    expect(renderText(s, '{m.they} {m.is} here; {m.they} laugh{m.s}', b)).toBe(
      'she is here; she laughs',
    );
    if (sib)
      expect(renderText(s, '{x.rel}', { x: sib.id })).toMatch(/^your (brother|sister|sibling)$/);
  });

  it('brings up the strongest memory', () => {
    const m = clone(s);
    const x = m.npcs.find((n) => n.id === mom.id);
    x?.memory.push(
      { year: 2030, text: 'the hedge escape', delta: -3 },
      { year: 2031, text: 'the wedding speech', delta: 12 },
    );
    expect(renderText(m, '{m.first} still brings up {m.memory}.', { m: mom.id })).toBe(
      `${mom.first} still brings up the wedding speech.`,
    );
  });

  it('formats money for the country and year', () => {
    expect(renderText(s, '{money:3000}')).toBe('$3,000');
    const later = { ...s, inflation: 2 };
    expect(renderText(later, '{money:3000}')).toBe('$6,000');
    const jp = newLife({ country: 'jp', birthYear: 2026 }, 4);
    const yen = money(jp, 3000);
    expect(renderText(jp, '{money:3000}')).toBe(formatMoney(jp, yen));
    expect(renderText(jp, '{money:3000}')).toMatch(/^¥[\d,]+$/);
    expect(yen).toBeGreaterThan(100000);
    const ng = newLife({ country: 'ng', birthYear: 2026 }, 5);
    expect(renderText(ng, '{money:10}')).toMatch(/[\d,]+/);
  });

  it('reads chain payloads and leaves unknown tokens unresolved', () => {
    expect(
      renderText(s, 'back {money:$amount} and {$what}', {}, { amount: 3000, what: 'a hat' }),
    ).toBe('back $3,000 and a hat');
    expect(renderText(s, 'Hello {nobody.first} {mystery}')).toBe('Hello {nobody.first} {mystery}');
  });
});
