/**
 * npm run verify: every gate in order, stopping at the first failure (DONE §2.1).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const STEPS = [
  'typecheck',
  'lint',
  'hygiene',
  'test',
  'content:check',
  'sim',
  'build',
  'e2e',
  'electron:smoke',
];

function m06Waived(): boolean {
  if (!existsSync('progress/WAIVERS.md')) return false;
  return readFileSync('progress/WAIVERS.md', 'utf8')
    .split('\n')
    .some((l) => l.startsWith('- M0.6:'));
}

function gitStatus(): Set<string> {
  const r = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    encoding: 'utf8',
  });
  return new Set((r.stdout ?? '').split('\n').filter(Boolean));
}

const before = gitStatus();
const t0 = performance.now();
const timings: string[] = [];
for (const step of STEPS) {
  if (step === 'electron:smoke' && m06Waived()) {
    console.log('\n=== electron:smoke SKIPPED: M0.6 is waived in progress/WAIVERS.md ===');
    timings.push(`${step}: skipped (waiver)`);
    continue;
  }
  console.log(`\n=== verify: ${step} ===`);
  const s0 = performance.now();
  const r = spawnSync('npm', ['run', '--silent', step], { stdio: 'inherit', shell: false });
  const secs = ((performance.now() - s0) / 1000).toFixed(1);
  timings.push(`${step}: ${secs}s`);
  if (r.status !== 0) {
    console.error(`\nverify: FAILED at ${step} (exit ${r.status ?? r.signal})`);
    console.error(timings.join('\n'));
    process.exit(r.status ?? 1);
  }
}
// DONE §2.2 / M0.9: verify writes only to gitignored paths.
const leaked = [...gitStatus()].filter((l) => !before.has(l));
if (leaked.length) {
  console.error('verify: FAILED: steps wrote outside gitignored paths:');
  for (const l of leaked) console.error(`  ${l}`);
  process.exit(1);
}
console.log(`\nverify: all steps passed in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
console.log(timings.join('\n'));
