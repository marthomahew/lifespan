import { describe, expect, it } from 'vitest';
import { newLife } from '../../src/engine';
import { playYears } from '../helpers';

describe('report cards', () => {
  it('vary their wording and mention the trend', () => {
    const lines = new Set<string>();
    let trend = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const s = playYears(
        { ...newLife({ country: 'us', birthYear: 2000 }, seed), pending: [] },
        17,
      );
      for (const e of s.log)
        if (e.text.startsWith('Your report card')) {
          lines.add(e.text);
          if (/up from|down from/.test(e.text)) trend += 1;
        }
    }
    expect(lines.size).toBeGreaterThan(12);
    expect(trend).toBeGreaterThan(5);
  });
});
