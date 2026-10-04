/**
 * npm run verify: every gate in order, stopping at the first failure (DONE §2.1).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

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

/** Fingerprint of everything git can see outside ignored paths: tracked diffs plus untracked files' contents. */
function gitStatus(): Set<string> {
  const out = new Set<string>();
  const diff = spawnSync('git', ['diff', 'HEAD', '--binary'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  out.add(
    `tracked-diff ${createHash('sha256')
      .update(diff.stdout ?? '')
      .digest('hex')}`,
  );
  const others = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], {
    encoding: 'utf8',
  });
  for (const f of (others.stdout ?? '').split('\n').filter(Boolean)) {
    let h = 'unreadable';
    try {
      h = createHash('sha256').update(readFileSync(f)).digest('hex');
    } catch {
      // Vanished between listing and reading.
    }
    out.add(`untracked ${f} ${h}`);
  }
  return out;
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
