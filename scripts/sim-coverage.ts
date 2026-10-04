/**
 * npm run sim:coverage: 2,000+ lives across every bot persona. Fails below 85% of events
 * fired at least once; writes reports/coverage-report.md listing the rest with reasons.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { EVENTS } from '../src/content/events';
import { chainParents, reasonFor, runCoverage } from './coverage-lib';

const PER_PERSONA = Number(process.env['COVERAGE_LIVES'] ?? 260);
const t0 = performance.now();
const r = runCoverage(PER_PERSONA);
const secs = (performance.now() - t0) / 1000;
const parents = chainParents();
const firedIds = EVENTS.filter((e) => (r.fired.get(e.id) ?? 0) > 0);
const unfired = EVENTS.filter((e) => !r.fired.get(e.id));
const pct = (100 * firedIds.length) / EVENTS.length;

mkdirSync('reports', { recursive: true });
const lines = [
  '# Event coverage report',
  '',
  `${r.lives} lives across ${Object.keys(r.perPersona).length} personas in ${secs.toFixed(0)} s.`,
  `Events fired at least once: **${firedIds.length} of ${EVENTS.length} (${pct.toFixed(1)}%)**; target 85%.`,
  '',
  '| Persona | Lives | Median age at death |',
  '|---|---|---|',
  ...Object.entries(r.perPersona).map(([p, v]) => `| ${p} | ${v.lives} | ${v.medianAge} |`),
  '',
  `## Never fired (${unfired.length})`,
  '',
  ...unfired.map((e) => `- \`${e.id}\` (${e.kind}, ${e.category}): ${reasonFor(e, r, parents)}`),
  '',
  '## Errors',
  ...(r.errors.length ? r.errors.slice(0, 30).map((e) => `- ${e}`) : ['None.']),
  '',
];
writeFileSync('reports/coverage-report.md', lines.join('\n'));
console.log(
  `sim:coverage: ${r.lives} lives, ${firedIds.length}/${EVENTS.length} events (${pct.toFixed(1)}%), ${r.errors.length} errors, ${secs.toFixed(0)} s`,
);
for (const e of unfired.slice(0, 40)) console.log(`  never: ${e.id}: ${reasonFor(e, r, parents)}`);
if (r.errors.length || pct < 85) process.exit(1);
