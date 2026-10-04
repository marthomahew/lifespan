import { ACHIEVEMENT_BY_ID, ACHIEVEMENTS } from '../../content/achievements';
import type { Ctx } from '../ctx';

/** Award an achievement once, with a toast and a milestone log line. */
export function awardAchievement(ctx: Ctx, id: string): void {
  const p = ctx.s.player;
  const def = ACHIEVEMENT_BY_ID[id];
  if (!def || p.achievements.includes(id)) return;
  p.achievements.push(id);
  ctx.toast({ kind: 'achievement', text: `${def.emoji} ${def.label}` });
  ctx.log('achievement', `${def.emoji} Achievement: ${def.label}. ${def.description}`, true);
}

/** Check every achievement's condition (end of each year and after actions). */
export function checkAchievements(ctx: Ctx): void {
  if (ctx.s.death) return;
  for (const a of ACHIEVEMENTS) {
    if (a.check && !ctx.s.player.achievements.includes(a.id) && a.check(ctx.s))
      awardAchievement(ctx, a.id);
  }
}
