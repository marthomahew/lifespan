import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
const REQUIRED = [
  'dev:web',
  'build',
  'typecheck',
  'lint',
  'hygiene',
  'test',
  'content:check',
  'sim',
  'sim:coverage',
  'e2e',
  'electron:smoke',
  'electron:smoke:packaged',
  'shots',
  'dist:mac',
  'dist:linux',
  'verify',
];

describe('npm scripts (CLAUDE.md table)', () => {
  it('defines every required script', () => {
    for (const s of REQUIRED) expect(pkg.scripts[s], s).toBeTruthy();
  });

  it('verify runs its steps in the DONE §2.1 order and stops on failure', () => {
    const src = readFileSync('scripts/verify.ts', 'utf8');
    const m = /const STEPS = \[(.*?)\];/s.exec(src);
    const steps = (m?.[1] ?? '')
      .split(',')
      .map((x) => x.trim().replace(/'/g, ''))
      .filter(Boolean);
    expect(steps).toEqual([
      'typecheck',
      'lint',
      'hygiene',
      'test',
      'content:check',
      'sim',
      'build',
      'e2e',
      'electron:smoke',
    ]);
    expect(src).toContain('process.exit(r.status ?? 1)');
  });

  it('the web build serves on fixed ports with strictPort', () => {
    const cfg = readFileSync('vite.web.config.ts', 'utf8');
    expect(cfg).toContain('port: 5173, strictPort: true');
    expect(cfg).toContain('port: 4173, strictPort: true');
  });
});
