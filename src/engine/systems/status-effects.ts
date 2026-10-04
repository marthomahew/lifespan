import type { Ctx } from '../ctx';
import { addNpc, remember } from '../npc';
import type { Npc, Role } from '../types';
import { currentPartner, fitsAttraction, killNpc, partnerGender } from './partners';
import { addChild, breakUp, divorce, marry } from './romance';

export { currentPartner, killNpc, partnerGender, partnerOf } from './partners';

/** Relationship status changes from events. Romance is adults only. */
export function applyStatusEffect(ctx: Ctx, kind: string, npc: Npc | undefined, role?: Role): void {
  const s = ctx.s;
  const p = s.player;
  switch (kind) {
    case 'meet': {
      if (p.age < 18 || currentPartner(ctx)) return;
      // Someone you already know (a coworker, a friend) becomes more than that.
      if (npc && npc.alive && npc.age >= 18 && fitsAttraction(p.attraction, npc.gender)) {
        if (!npc.roles.includes('partner')) npc.roles.push('partner');
        npc.romance = { stage: 'dating', since: s.year, prenup: false };
        if (ctx.rng.chance(0.4)) npc.flags.push('no_kids');
        if (ctx.rng.chance(0.2)) npc.flags.push('no_marriage');
        remember(s, npc, 'how it all started', 5);
        ctx.log('romance', `You start seeing ${npc.first} ${npc.last}.`, true);
        return;
      }
      const age = Math.max(18, p.age + ctx.rng.int(-5, 5));
      const n = addNpc(ctx, {
        role: 'partner',
        gender: partnerGender(ctx),
        age,
        rel: ctx.rng.int(55, 80),
      });
      n.romance = { stage: 'dating', since: s.year, prenup: false };
      // Not everyone wants children.
      if (ctx.rng.chance(0.4)) n.flags.push('no_kids');
      if (ctx.rng.chance(0.2)) n.flags.push('no_marriage');
      remember(s, n, 'how you met', 5);
      ctx.log('romance', `You start seeing ${n.first} ${n.last}.`, true);
      return;
    }
    case 'breakup': {
      const n = npc ?? currentPartner(ctx);
      if (!n) return;
      if (n.roles.includes('spouse')) {
        divorce(ctx, n);
        return;
      }
      breakUp(ctx, n);
      remember(s, n, 'the breakup', -30);
      ctx.log('romance', `You and ${n.first} break up.`, true);
      return;
    }
    case 'divorce': {
      const n = npc ?? s.npcs.find((x) => x.alive && x.roles.includes('spouse'));
      if (!n || !n.roles.includes('spouse')) return;
      divorce(ctx, n);
      return;
    }
    case 'marry': {
      const n = npc ?? currentPartner(ctx);
      if (!n || p.age < 18 || n.age < 18) return;
      marry(ctx, n, n.romance?.prenup ?? false);
      remember(s, n, 'your wedding', 15);
      ctx.log('romance', `You marry ${n.first}.`, true);
      return;
    }
    case 'birth':
    case 'adopt': {
      if (p.age < 18) return;
      const child = addChild(
        ctx,
        currentPartner(ctx),
        kind === 'adopt',
        kind === 'adopt' ? ctx.rng.int(0, 8) : 0,
      );
      ctx.log(
        'family',
        kind === 'adopt' ? `You adopt ${child.first}.` : `${child.first} is born.`,
        true,
      );
      return;
    }
    case 'friend':
    case 'enemy': {
      const near = Math.max(5, p.age + ctx.rng.int(-3, 3));
      const n = addNpc(ctx, {
        role: role ?? (kind === 'friend' ? 'friend' : 'enemy'),
        age: near,
        rel: kind === 'friend' ? ctx.rng.int(55, 75) : ctx.rng.int(5, 25),
      });
      ctx.log(
        'social',
        kind === 'friend' ? `${n.first} becomes a friend.` : `${n.first} has it in for you now.`,
      );
      return;
    }
    case 'npc_dies': {
      if (npc) {
        killNpc(ctx, npc, 'an accident');
        ctx.log('family', `${npc.first} dies.`, true);
      }
      return;
    }
  }
}
