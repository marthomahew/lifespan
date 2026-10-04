/** npm run content:check (DONE §3). Fails on any finding or any enforced threshold. */
import { EVENTS } from '../src/content/events';
import {
  ENFORCED,
  failedThresholds,
  thresholds,
  validateActivities,
  validateCountries,
  validateEvents,
  validateInteractions,
  validateIllnesses,
} from './content-lib';
import { ILLNESSES } from '../src/content/illnesses';
import { INTERACTIONS } from '../src/content/interactions';
import { ACTIVITIES } from '../src/content/activities';

/** Thresholds enforced so far; M12.4 requires every one of them. */

const findings = [
  ...validateEvents(EVENTS),
  ...validateCountries(),
  ...validateInteractions(INTERACTIONS),
  ...validateActivities(ACTIVITIES),
  ...validateIllnesses(ILLNESSES),
];
const ts = thresholds(ENFORCED);
for (const t of ts) {
  const ok = t.value >= t.min && (t.max === undefined || t.value <= t.max);
  const band = t.max !== undefined ? `${t.min}–${t.max}` : `≥ ${t.min}`;
  console.log(
    `${ok ? 'ok  ' : t.enforced ? 'FAIL' : 'todo'}  ${t.label}: ${t.value} (${band})${t.enforced ? '' : ' [not yet enforced]'}`,
  );
}
for (const f of findings.slice(0, 100)) console.error(`error  ${f.where}: ${f.msg}`);
const failed = failedThresholds(ts).filter((t) => t.enforced);
console.log(
  `content:check: ${EVENTS.length} events, ${findings.length} findings, ${failed.length} enforced thresholds failing`,
);
if (findings.length || failed.length) process.exit(1);
