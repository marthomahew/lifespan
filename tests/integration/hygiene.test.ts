import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const script = resolve('scripts/check-hygiene.ts');
const tsx = resolve('node_modules/.bin/tsx');

function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'hygiene-'));
  const base: Record<string, string> = {
    'docs/PLAN.md': '- [M0.1] one\n- [M0.2] two\n',
    'progress/features.json': JSON.stringify({ 'M0.1': {}, 'M0.2': {} }),
    'src/engine/ok.ts': 'export const ok = 1;\n',
  };
  for (const [p, body] of Object.entries({ ...base, ...files })) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), body);
  }
  return dir;
}

function run(dir: string): { code: number; out: string } {
  try {
    const out = execFileSync(tsx, [script, dir], { encoding: 'utf8', stdio: 'pipe' });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { code: err.status, out: err.stdout + err.stderr };
  }
}

const j = (...parts: string[]): string => parts.join('');

describe('hygiene', () => {
  it('passes a clean tree', () => {
    expect(run(fixture({})).code).toBe(0);
  });

  const cases: [string, Record<string, string>, string][] = [
    [
      'focused test',
      { 'tests/a.test.ts': j('it', '.only', '("x", () => {});') },
      'focused/skipped',
    ],
    [
      'skipped test',
      { 'tests/a.test.ts': j('describe', '.skip', '("x", () => {});') },
      'focused/skipped',
    ],
    ['todo test', { 'tests/a.test.ts': j('it', '.todo', '("x");') }, 'focused/skipped'],
    ['fixme test', { 'e2e/a.spec.ts': j('test', '.fixme', '("x", () => {});') }, 'focused/skipped'],
    ['xit', { 'tests/a.test.ts': j('x', 'it("x", () => {});') }, 'focused/skipped'],
    ['xdescribe', { 'tests/a.test.ts': j('x', 'describe("x", () => {});') }, 'focused/skipped'],
    ['ts-ignore', { 'src/engine/a.ts': j('// @ts-', 'ignore\n') }, 'ts-ignore'],
    [
      'expect-error without reason',
      { 'src/engine/a.ts': j('// @ts-', 'expect-error\n') },
      'without a reason',
    ],
    [
      'too many expect-error',
      {
        'src/engine/a.ts': Array.from({ length: 6 }, () =>
          j('// @ts-', 'expect-error because reasons\n'),
        ).join(''),
      },
      'max 5',
    ],
    [
      'bare lint disable',
      { 'src/engine/a.ts': j('// eslint', '-dis', 'able-next-line\n') },
      'without a rule name',
    ],
    [
      'lint disable without reason',
      { 'src/engine/a.ts': j('// eslint', '-dis', 'able-next-line no-console\n') },
      'without a rule name',
    ],
    ['marker', { 'src/engine/a.ts': j('// TO', 'DO later\n') }, 'work marker'],
    ['plural marker', { 'src/engine/a.ts': j('// two TO', 'DOs here\n') }, 'work marker'],
    [
      'placeholder',
      { 'src/content/a.ts': j('export const t = "Lo', 'rem ipsum";\n') },
      'work marker',
    ],
    ['console.log', { 'src/renderer/a.ts': j('console', '.log(1);\n') }, 'console.log'],
    ['fetch', { 'src/renderer/a.ts': j('fet', 'ch("/x");\n') }, 'network'],
    ['url', { 'src/engine/a.ts': j('const u = "htt', 'ps://example.com";\n') }, 'network'],
    ['forbidden name', { 'src/content/a.ts': j('const n = "Bit', 'Life";\n') }, 'forbidden name'],
    ['long file', { 'src/engine/a.ts': 'export const x = 1;\n'.repeat(601) }, 'max 600'],
    [
      'missing plan id',
      { 'docs/PLAN.md': '- [M0.1] one\n- [M0.3] three\n' },
      'missing entry for M0.3',
    ],
  ];

  for (const [name, files, expected] of cases) {
    it(`flags ${name}`, () => {
      const r = run(fixture(files));
      expect(r.code).toBe(1);
      expect(r.out).toContain(expected);
    });
  }

  it('allows long content files and a reasoned lint disable', () => {
    const r = run(
      fixture({
        'src/content/big.ts': 'export const x = 1;\n'.repeat(700),
        'src/engine/a.ts': j(
          '// eslint',
          '-dis',
          'able-next-line no-console -- needed for the demo\n',
        ),
      }),
    );
    expect(r.code).toBe(0);
  });
});
