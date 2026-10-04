import type { Ctx } from '../ctx';
import { addNpc, remember } from '../npc';
import type { Gender, Npc, Role } from '../types';

/** Gender of someone the player is attracted to. */
export function partnerGender(ctx: Ctx): Gender {
  const a = ctx.s.player.attraction;
  if (a === 'men') return 'male';
  if (a === 'women') return 'female';
  return ctx.rng.chance(0.5) ? 'male' : 'female';
}

export function currentPartner(ctx: Ctx): Npc | undefined {
  return ctx.s.npcs.find(
    (n) => n.alive && (n.roles.includes('spouse') || n.roles.includes('partner')),
  );
}

function setRole(n: Npc, from: Role[], to: Role): void {
  n.roles = n.roles.filter((r) => !from.includes(r));
  if (!n.roles.includes(to)) n.roles.unshift(to);
}

export function killNpc(ctx: Ctx, n: Npc, cause: string): void {
  if (!n.alive) return;
  n.alive = false;
  n.deathYear = ctx.s.year;
  n.deathCause = cause;
}

/** Relationship status changes from events. Romance is adults only. */
export function applyStatusEffect(ctx: Ctx, kind: string, npc: Npc | undefined, role?: Role): void {
  const s = ctx.s;
  const p = s.player;
  switch (kind) {
    case 'meet': {
      if (p.age < 18 || currentPartner(ctx)) return;
      const age = Math.max(18, p.age + ctx.rng.int(-5, 5));
      const n = addNpc(ctx, {
        role: 'partner',
        gender: partnerGender(ctx),
        age,
        rel: ctx.rng.int(55, 80),
      });
      n.romance = { stage: 'dating', since: s.year, prenup: false };
      remember(s, n, 'how you met', 5);
      ctx.log('romance', `You start seeing ${n.first} ${n.last}.`, true);
      return;
    }
    case 'breakup':
    case 'divorce': {
      const n = npc ?? currentPartner(ctx);
      if (!n) return;
      if (n.roles.includes('spouse')) n.flags.push('was_spouse');
      setRole(n, ['partner', 'spouse'], 'ex');
      delete n.romance;
      remember(s, n, kind === 'divorce' ? 'the divorce' : 'the breakup', -30);
      ctx.log(
        'romance',
        kind === 'divorce' ? `You and ${n.first} divorce.` : `You and ${n.first} break up.`,
        true,
      );
      return;
    }
    case 'marry': {
      const n = npc ?? currentPartner(ctx);
      if (!n || p.age < 18 || n.age < 18) return;
      setRole(n, ['partner'], 'spouse');
      n.romance = { stage: 'married', since: s.year, prenup: n.romance?.prenup ?? false };
      if (!p.flags.includes('ever_married')) p.flags.push('ever_married');
      remember(s, n, 'your wedding', 15);
      ctx.log('romance', `You marry ${n.first}.`, true);
      return;
    }
    case 'birth':
    case 'adopt': {
      if (p.age < 18) return;
      const partner = currentPartner(ctx);
      const child = addNpc(ctx, {
        role: 'child',
        age: kind === 'adopt' ? ctx.rng.int(0, 8) : 0,
        last: p.last,
        rel: ctx.rng.int(75, 95),
        parentIds: partner ? [0, partner.id] : [0],
      });
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
