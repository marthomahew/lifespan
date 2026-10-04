import type { Ctx } from './ctx';
import { netWorthRef } from './networth';
import { lifeTitle } from './titles';
import { settleEstate } from './systems/inheritance';
import type { GameState } from './types';

/** End the life with a recorded cause (SPEC §3.5). */
export function die(ctx: Ctx, cause: string): void {
  const s = ctx.s;
  if (s.death) return;
  s.pending = [];
  const title = lifeTitle(s);
  const estate = settleEstate(s);
  s.death = { year: s.year, age: s.player.age, cause, title, estate };
  s.dynasty.push({
    first: s.player.first,
    last: s.player.last,
    birthYear: s.player.birthYear,
    deathYear: s.year,
    title,
    cause,
    netWorthRef: Math.round(netWorthRef(s)),
    achievements: s.player.achievements.length,
    fame: s.player.stats.fame,
    children: s.npcs.filter((n) => n.roles.includes('child')).length,
  });
  ctx.log('death', `You died at ${s.player.age}. Cause: ${cause}.`, true);
}

export type Obituary = {
  name: string;
  born: number;
  died: number;
  age: number;
  cause: string;
  title: string;
  stats: GameState['player']['stats'];
  netWorthRef: number;
  summary: string[];
  cheated: boolean;
  survivors: string[];
};

export function obituary(s: GameState): Obituary | null {
  if (!s.death) return null;
  const p = s.player;
  const summary: string[] = [];
  const job = s.career.history.at(-1);
  if (job)
    summary.push(
      `Worked as ${job.title}${s.career.history.length > 1 ? ` among ${s.career.history.length} jobs` : ''}.`,
    );
  const deg = s.education.degrees.filter((d) => d.level !== 'high_school');
  if (deg.length)
    summary.push(
      `Earned ${deg.length === 1 ? 'a degree' : `${deg.length} degrees`} in ${deg.map((d) => d.field).join(', ')}.`,
    );
  const spouses = s.npcs.filter(
    (n) => n.roles.includes('spouse') || n.flags.includes('was_spouse'),
  );
  if (spouses.length)
    summary.push(`Married ${spouses.length === 1 ? 'once' : `${spouses.length} times`}.`);
  const kids = s.npcs.filter((n) => n.roles.includes('child'));
  if (kids.length)
    summary.push(`Raised ${kids.length} ${kids.length === 1 ? 'child' : 'children'}.`);
  if (s.legal.record.some((r) => r.verdict === 'convicted' || r.verdict === 'plea'))
    summary.push('Had a criminal record.');
  if (p.stats.fame > 40) summary.push('Was genuinely famous for a while.');
  if (p.achievements.length) summary.push(`Earned ${p.achievements.length} achievements.`);
  if (!summary.length) summary.push('Lived quietly and left the world about how they found it.');
  const survivors = s.npcs
    .filter(
      (n) =>
        n.alive &&
        (n.roles.includes('child') || n.roles.includes('spouse') || n.roles.includes('partner')),
    )
    .map((n) => `${n.first} ${n.last}`);
  return {
    name: `${p.first} ${p.last}`,
    born: p.birthYear,
    died: s.death.year,
    age: s.death.age,
    cause: s.death.cause,
    title: s.death.title,
    stats: { ...p.stats },
    netWorthRef: Math.round(netWorthRef(s)),
    summary,
    cheated: s.cheats.used,
    survivors,
  };
}
