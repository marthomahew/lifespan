/**
 * Repository hygiene (DONE §2.3). Every finding fails the step.
 * Run with `npm run hygiene`.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] ?? process.cwd();
const findings: string[] = [];
const IGNORE_DIRS = new Set([
  'node_modules',
  'out',
  'dist',
  'dist-web',
  'release',
  'release-final',
  'reports',
  'test-results',
  'playwright-report',
  'coverage',
  '.git',
]);
const CODE_EXT = /\.(ts|tsx|js|mjs|cjs|jsx|css|html|json)$/;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (CODE_EXT.test(name)) out.push(p);
  }
  return out;
}

const rel = (p: string): string => relative(root, p).split(sep).join('/');
const read = (p: string): string => readFileSync(p, 'utf8');

function eachLine(files: string[], fn: (file: string, line: string, n: number) => void): void {
  for (const f of files) {
    const lines = read(f).split('\n');
    lines.forEach((line, i) => fn(rel(f), line, i + 1));
  }
}

const srcFiles = walk(join(root, 'src'));
const testFiles = [...walk(join(root, 'tests')), ...walk(join(root, 'e2e'))];
const codeFiles = [
  ...srcFiles,
  ...testFiles,
  ...walk(join(root, 'scripts')),
  ...walk(join(root, 'build')),
].filter(
  (f) => /\.(ts|tsx|js|mjs|cjs|jsx)$/.test(f) && !rel(f).startsWith('scripts/check-hygiene'),
);
for (const f of readdirSync(root)) if (/\.(ts|js|mjs)$/.test(f)) codeFiles.push(join(root, f));

// 1. Focused or skipped tests.
const SKIP_RE = /\.(only|skip|todo|fixme)\(|\bxit\(|\bxdescribe\(/;
eachLine(testFiles, (f, line, n) => {
  if (SKIP_RE.test(line)) findings.push(`${f}:${n}: focused/skipped test marker`);
});

// 2. ts-ignore and ts-expect-error.
const IGNORE = '@ts-' + 'ignore';
const EXPECT = '@ts-' + 'expect-error';
let expectCount = 0;
eachLine(codeFiles, (f, line, n) => {
  if (line.includes(IGNORE)) findings.push(`${f}:${n}: ${IGNORE}`);
  const i = line.indexOf(EXPECT);
  if (i >= 0) {
    expectCount++;
    const reason = line
      .slice(i + EXPECT.length)
      .replace(/^[\s:-]+/, '')
      .trim();
    if (reason.length < 3) findings.push(`${f}:${n}: ${EXPECT} without a reason`);
  }
});
if (expectCount > 5) findings.push(`${expectCount} ${EXPECT} comments (max 5)`);

// 3. eslint-disable needs a rule name and a "-- reason".
const DISABLE_RE = /eslint-disable(?:-next-line|-line)?(.*)$/;
eachLine(codeFiles, (f, line, n) => {
  const m = DISABLE_RE.exec(line);
  if (!m) return;
  const rest = (m[1] ?? '').replace(/\*\/\s*$/, '').trim();
  const [rules, reason] = rest.split('--').map((s) => s.trim());
  if (!rules || !reason)
    findings.push(`${f}:${n}: eslint-disable without a rule name and a reason`);
});

// 4. Markers in src/.
const MARKER_RE = new RegExp(
  ['TO' + 'DO', 'FIX' + 'ME', 'X' + 'XX', 'T' + 'BD'].map((w) => `\\b${w}S?\\b`).join('|') +
    '|' +
    'lo' +
    'rem',
  'i',
);
eachLine(srcFiles, (f, line, n) => {
  if (MARKER_RE.test(line)) findings.push(`${f}:${n}: work marker or placeholder text`);
});

// 5. console.log outside the logger module.
eachLine(srcFiles, (f, line, n) => {
  if (f.endsWith('/logger.ts')) return;
  if (line.includes('console.' + 'log')) findings.push(`${f}:${n}: console.log outside the logger`);
});

// 6. Network APIs and URLs in renderer and engine.
const NET_RE = new RegExp(
  ['fetch\\(', 'XMLHttpRequest', 'WebSocket', 'http://', 'https://'].join('|'),
);
eachLine(
  srcFiles.filter((f) => /^src\/(renderer|engine)\//.test(rel(f))),
  (f, line, n) => {
    if (NET_RE.test(line)) findings.push(`${f}:${n}: network API or URL in an offline module`);
  },
);

// 7. Forbidden names in src/.
const NAME_RE = new RegExp(['bit' + 'life', 'candy' + 'writer'].join('|'), 'i');
eachLine(srcFiles, (f, line, n) => {
  if (NAME_RE.test(line)) findings.push(`${f}:${n}: forbidden name`);
});

// 8. File length.
for (const f of srcFiles) {
  if (rel(f).startsWith('src/content/')) continue;
  const lines = read(f).split('\n').length;
  if (lines > 600) findings.push(`${rel(f)}: ${lines} lines (max 600)`);
}

// 9. Every PLAN id has a features.json entry.
const plan = read(join(root, 'docs/PLAN.md'));
const features = JSON.parse(read(join(root, 'progress/features.json'))) as Record<string, unknown>;
for (const m of plan.matchAll(/^- \[(M\d+\.\d+)\]/gm)) {
  const id = m[1] as string;
  if (!(id in features)) findings.push(`progress/features.json: missing entry for ${id}`);
}

if (findings.length) {
  console.error(`hygiene: ${findings.length} finding(s)`);
  for (const f of findings) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`hygiene: OK (${srcFiles.length} src files, ${testFiles.length} test files)`);
