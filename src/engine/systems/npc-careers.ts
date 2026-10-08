import { PARENT_JOBS } from '../../content/family';
import type { Ctx } from '../ctx';
import { money } from '../economy';
import { netWorth } from '../networth';
import { Rng, seedRng } from '../rng';
import type { GameState, Npc } from '../types';
import { jobTier } from './npc-economy';

/**
 * Other people's working lives: leaving school for university or a job, graduating into
 * work that fits the degree, promotions, a change of job, finding work again, and retiring
 * when they can afford to.
 */
type Tier = keyof typeof PARENT_JOBS;
const TIERS: Tier[] = ['poor', 'working', 'middle', 'comfortable', 'rich'];
const PAY: Record<Tier, [number, number]> = {
  poor: [20000, 32000],
  working: [32000, 55000],
  middle: [55000, 95000],
  comfortable: [95000, 220000],
  rich: [220000, 1200000],
};

const GROWING = ['child', 'grandchild', 'sibling', 'niece', 'nephew', 'cousin'];
const CLOSE = ['mother', 'father', 'sibling', 'child', 'spouse', 'partner', 'grandchild'];

/** The tier a family's children start from: the player's for siblings, the player's own wealth for children. */
function homeTier(s: GameState, n: Npc): number {
  if (n.roles.includes('sibling')) return TIERS.indexOf(s.player.wealth);
  const net = netWorth(s);
  return net > money(s, 2_000_000)
    ? 4
    : net > money(s, 400_000)
      ? 3
      : net > money(s, 60_000)
        ? 2
        : 1;
}

function setJob(ctx: Ctx, r: Rng, n: Npc, tier: Tier, why?: string): void {
  const options = PARENT_JOBS[tier].filter((j) => j !== n.job && j !== 'Unemployed');
  n.job = r.pick(options.length ? options : PARENT_JOBS[tier]);
  const [lo, hi] = PAY[tier];
  // A new job pays at least what the old one did, and usually a little more.
  n.pay = Math.max(
    money(ctx.s, r.int(lo, Math.round((lo + hi) / 2)), 'wage'),
    Math.round((n.pay ?? 0) * 1.05),
  );
  if (why && n.roles.some((x) => CLOSE.includes(x)) && n.rel >= 30)
    ctx.log('family', why.replace('{job}', n.job.toLowerCase()));
}

/** A year in the working lives of the people you know. */
export function npcCareers(ctx: Ctx): void {
  const s = ctx.s;
  // A stream of its own (from the life's seed and the year): other people's careers never
  // shift the dice of your own life.
  const r = new Rng(seedRng(((s.seed >>> 0) ^ Math.imul(s.year + 7919, 0x9e3779b1)) >>> 0));
  for (const n of s.npcs) {
    if (!n.alive || n.age < 18) continue;
    const growing = n.roles.some((x) => GROWING.includes(x));
    const smart = n.stats.smarts;
    // Leaving school: university for the able (and the well-off), work for the rest.
    if (growing && n.age === 18 && (n.job === 'At school' || n.job === null)) {
      const home = homeTier(s, n);
      const uni = r.chance(Math.min(0.92, 0.15 + home * 0.15 + Math.max(0, smart - 40) / 100));
      if (uni) {
        n.job = 'At university';
        n.edu = 'school';
        n.pay = 0;
      } else {
        n.edu = smart < 25 && r.chance(0.5) ? 'none' : 'school';
        setJob(ctx, r, n, smart > 55 || home >= 2 ? 'working' : r.chance(0.5) ? 'poor' : 'working');
      }
      continue;
    }
    // Graduation: work that fits the degree; some stay on for a postgraduate degree.
    if (n.job === 'At university' && n.age >= 21) {
      if (!n.flags.includes('postgrad_study') && smart > 65 && r.chance(0.25)) {
        n.flags.push('postgrad_study');
        continue;
      }
      if (n.flags.includes('postgrad_study') && n.age < 24) continue;
      n.edu = n.flags.includes('postgrad_study') ? 'postgrad' : 'degree';
      const up = n.edu === 'postgrad' || (smart > 75 && r.chance(0.4));
      setJob(
        ctx,
        r,
        n,
        up ? 'comfortable' : 'middle',
        `🎓 {name} graduates and starts work as a {job}.`.replace('{name}', n.first),
      );
      continue;
    }
    if (n.job === 'At university' || n.job === 'At school') continue;
    // Retiring: from 60, likelier every year, sooner for those with savings.
    if (n.job && n.job !== 'Retired' && n.age >= 60) {
      const rich = (n.invest ?? 0) + n.money > money(s, 1_000_000);
      if (n.age >= 70 || r.chance((n.age - 58) * 0.08 + (rich ? 0.15 : 0))) {
        const wasWorking = jobTier(n.job) !== null;
        n.job = 'Retired';
        n.pay = wasWorking ? Math.round((n.pay ?? 0) * 0.45) : Math.round((n.pay ?? 0) * 0.2);
        if (n.roles.some((x) => CLOSE.includes(x)) && n.rel >= 30)
          ctx.log(
            'family',
            `🎉 ${n.first} retires. There is a cake, and a speech nobody asked for.`,
          );
        continue;
      }
    }
    if (n.age >= 60 || n.job === 'Retired') continue;
    // Out of work: most find something within a year or two.
    if (n.job === 'Unemployed' || n.job === null) {
      if (r.chance(0.4))
        setJob(ctx, r, n, n.edu === 'degree' || n.edu === 'postgrad' ? 'middle' : 'working');
      continue;
    }
    const t = jobTier(n.job);
    if (!t) continue;
    const rank = TIERS.indexOf(t);
    // Promotion to the next kind of work: the top needs a degree, and talent.
    const degree = n.edu === 'degree' || n.edu === 'postgrad';
    const ceiling = degree ? (smart > 70 ? 4 : 3) : smart > 60 ? 2 : 1;
    if (rank < ceiling && n.age >= 25 && r.chance(0.05 + Math.max(0, smart - 50) / 500)) {
      const next = TIERS[rank + 1] as Tier;
      setJob(ctx, r, n, next, `📈 ${n.first} moves up in the world: now a {job}.`);
      continue;
    }
    // Or a change of job at the same level, now and then.
    if (r.chance(0.03)) setJob(ctx, r, n, t);
  }
}
