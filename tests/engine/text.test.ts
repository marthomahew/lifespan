import { describe, expect, it } from 'vitest';
import { article, lowerLabel, withArticle } from '../../src/engine/text';
import { newLife, obituary } from '../../src/engine';
import { clone } from '../../src/engine/util';

describe('generated text', () => {
  it('lower-cases labels but keeps acronyms', () => {
    expect(lowerLabel('COPD')).toBe('COPD');
    expect(lowerLabel('Type 2 diabetes')).toBe('type 2 diabetes');
    expect(lowerLabel('Stroke damage')).toBe('stroke damage');
  });
  it('picks a or an', () => {
    expect(withArticle('Laborer')).toBe('a laborer');
    expect(withArticle('Upright piano')).toBe('an upright piano');
    expect(withArticle('Oil painting')).toBe('an oil painting');
    expect(withArticle('University lecturer')).toBe('a university lecturer');
    expect(withArticle('Hour-long massage')).toBe('an hour-long massage');
    expect(article('MRI')).toBe('an');
    expect(article('CEO')).toBe('a');
  });
  it('the obituary reads as English', () => {
    const s = clone(newLife({ country: 'us', birthYear: 1950 }, 5));
    s.death = { age: 80, year: s.year + 80, cause: 'Old age', title: 'Quiet', estate: [] };
    s.career.history = [
      { jobId: 'laborer', title: 'Laborer', from: 1970, to: 2015, reason: 'retired' },
    ];
    s.education.degrees = [
      { level: 'high_school', field: 'general', gpa: 3, year: 1968 },
      { level: 'bachelor', field: 'computer_science', gpa: 3.2, year: 1972 },
    ];
    const ob = obituary(s);
    expect(ob?.summary).toContain('Worked as a laborer.');
    expect(ob?.summary).toContain('Earned a degree in Computer Science.');
    s.military = {
      branch: 'Navy',
      specialty: 'medical',
      officer: false,
      rank: 3,
      since: 1990,
      deployed: false,
      deployments: 2,
      medals: ['service'],
      conduct: 70,
      discharge: 'honorable',
      active: false,
      years: 8,
    };
    expect(obituary(s)?.summary).toContain('Served 8 years in the Navy, with a medal.');
  });
});
