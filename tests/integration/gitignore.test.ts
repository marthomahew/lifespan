import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('.gitignore', () => {
  it('covers build output and reports', () => {
    const lines = readFileSync('.gitignore', 'utf8')
      .split('\n')
      .map((l) => l.trim());
    for (const p of [
      'node_modules/',
      'out/',
      'dist/',
      'dist-web/',
      'release/',
      'reports/',
      'test-results/',
      'playwright-report/',
      'coverage/',
    ]) {
      expect(lines, p).toContain(p);
    }
  });
});
