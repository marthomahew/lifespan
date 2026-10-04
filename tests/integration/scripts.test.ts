import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

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

describe('no skipped steps (M12.4)', () => {
  it('no script prints SKIPPED; the only skip left is the M0.6 waiver path in verify', () => {
    for (const f of readdirSync('scripts')) {
      if (!f.endsWith('.ts') || f === 'verify.ts') continue;
      expect(readFileSync(`scripts/${f}`, 'utf8'), f).not.toMatch(/SKIPPED/);
    }
    const verify = readFileSync('scripts/verify.ts', 'utf8');
    expect(verify.match(/SKIPPED/g)?.length ?? 0).toBeLessThanOrEqual(1);
    expect(verify).toContain("l.startsWith('- M0.6:')");
    expect(readFileSync('progress/WAIVERS.md', 'utf8')).not.toMatch(/^- M0\.6:/m);
  });
});

describe('screenshots (M11.5)', () => {
  it('npm run shots covers 12+ screens in both themes at both window sizes', () => {
    const spec = readFileSync('e2e/shots/shots.spec.ts', 'utf8');
    const names = new Set([...spec.matchAll(/shot\('([^']+)'\)/g)].map((m) => m[1]));
    expect(names.size).toBeGreaterThanOrEqual(12);
    expect(spec).toContain("const THEMES = ['light', 'dark'] as const;");
    expect(spec).toContain("{ name: '1280', width: 1280, height: 820 }");
    expect(spec).toContain("{ name: '1024', width: 1024, height: 700 }");
  });
});
