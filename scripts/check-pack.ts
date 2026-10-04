/** Validate one event pack in isolation: npx tsx scripts/check-pack.ts src/content/events/teen.ts TEEN_EVENTS */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateEvents, eventStage, countChains } from './content-lib';
import { EVENTS } from '../src/content/events';
import type { EventDef } from '../src/engine/events/types';

const [file, name] = process.argv.slice(2);
if (!file || !name) {
  console.error('usage: tsx scripts/check-pack.ts <file> <EXPORT_NAME>');
  process.exit(2);
}
const mod = (await import(pathToFileURL(resolve(file)).href)) as Record<string, EventDef[]>;
const pack = mod[name];
if (!Array.isArray(pack)) {
  console.error(`${file} has no export ${name}`);
  process.exit(2);
}
const ids = new Set(pack.map((e) => e.id));
const others = EVENTS.filter((e) => !ids.has(e.id));
// Validate the pack together with everything else so duplicate ids and texts are caught.
const findings = validateEvents([...others, ...pack]).filter((f) =>
  [...ids].some((id) => f.where.startsWith(id)),
);
const stages: Record<string, number> = {};
for (const e of pack) {
  const st = eventStage(e) ?? 'total-only';
  stages[st] = (stages[st] ?? 0) + 1;
}
const notices = pack.filter((e) => e.kind === 'notice').length;
console.log(
  `${pack.length} events (${notices} notices), chains: ${countChains(pack)}, by stage: ${JSON.stringify(stages)}`,
);
for (const f of findings) console.error(`error ${f.where}: ${f.msg}`);
process.exit(findings.length ? 1 : 0);
