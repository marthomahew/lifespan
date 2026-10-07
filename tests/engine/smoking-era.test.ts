import { describe, expect, it } from 'vitest';
import { smokingEra } from '../../src/content/events/health';
import { EVENT_BY_ID } from '../../src/content/events';

describe('smoking by era', () => {
  it('cigarettes were everywhere in the sixties and rare by the twenties', () => {
    expect(smokingEra(1965)).toBeGreaterThan(1.7);
    expect(smokingEra(2000)).toBeCloseTo(1, 5);
    expect(smokingEra(2020)).toBeLessThan(0.6);
    expect(EVENT_BY_ID['hl_era_smoke_everywhere']?.toYear).toBe(1989);
    expect(EVENT_BY_ID['hl_teen_vape_offer']?.fromYear).toBe(2012);
  });
});
