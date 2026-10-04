import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';

describe('e2e specs (M0.5)', () => {
  it('every web spec imports test from the console-error fixture', () => {
    const specs = readdirSync('e2e').filter((f) => f.endsWith('.spec.ts'));
    expect(specs.length).toBeGreaterThan(5);
    for (const f of specs) {
      const src = readFileSync(`e2e/${f}`, 'utf8');
      expect(src, f).toMatch(/import \{[^}]*\btest\b[^}]*\} from '\.\/fixtures'/);
      expect(src, f).not.toMatch(/import \{[^}]*\btest\b[^}]*\} from '@playwright\/test'/);
    }
  });

  it('every DONE §5 flow has its own spec', () => {
    const src = readdirSync('e2e')
      .filter((f) => f.endsWith('.spec.ts'))
      .map((f) => readFileSync(`e2e/${f}`, 'utf8'))
      .join('\n');
    for (let n = 1; n <= 15; n++) expect(src, `flow ${n}`).toMatch(new RegExp(`flow ${n}[ab]?:`));
  });
});
