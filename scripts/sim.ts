/**
 * npm run sim: 300 seeded lives with the default persona (DONE §4).
 * Fails on any invariant violation; writes reports/balance-report.md.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { runLives, evaluateBands, ENFORCE_BANDS } from './sim-lib';

const t0 = performance.now();
const result = runLives({
  seeds: Array.from({ length: 300 }, (_, i) => i + 1),
  persona: 'default',
  checkpoints: 10,
});
const secs = (performance.now() - t0) / 1000;
const bands = evaluateBands(result.metrics, secs);

mkdirSync('reports', { recursive: true });
const lines = [
  '# Balance report',
  '',
  `300 lives, seeds 1–300, default persona. Runtime ${secs.toFixed(1)} s.`,
  `Band enforcement: ${ENFORCE_BANDS ? 'ON' : 'REPORT ONLY (until M10.6)'}.`,
  '',
  '| Metric | Value | Band | Result |',
  '|---|---|---|---|',
  ...bands.map((b) => `| ${b.label} | ${b.display} | ${b.band} | ${b.pass ? 'pass' : 'FAIL'} |`),
  '',
  `Invariant violations: ${result.violations.length}`,
  ...result.violations.slice(0, 50).map((v) => `- ${v}`),
  '',
  '## Most common popups',
  ...result.topEvents
    .slice(0, 15)
    .map(
      ([id, n]) =>
        `- ${id}: ${n} (${((100 * n) / Math.max(1, result.metrics.popups)).toFixed(2)}%)`,
    ),
  '',
];
writeFileSync('reports/balance-report.md', lines.join('\n'));
for (const b of bands)
  console.log(`${b.pass ? 'pass' : 'FAIL'}  ${b.label}: ${b.display} (band ${b.band})`);
console.log(
  `sim: ${result.metrics.lives} lives in ${secs.toFixed(1)}s, ${result.violations.length} invariant violations`,
);
if (result.violations.length) {
  for (const v of result.violations.slice(0, 20)) console.error(`  ${v}`);
  process.exit(1);
}
const failed = bands.filter((b) => !b.pass);
if (ENFORCE_BANDS && failed.length) {
  console.error(`sim: ${failed.length} balance band(s) failed`);
  process.exit(1);
}
