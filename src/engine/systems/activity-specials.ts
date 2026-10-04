import { LANGUAGE_BY_ID } from '../../content/skills';
import type { ActivityDef } from '../../content/types';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { addNpc } from '../npc';
import { addStat } from '../stats';
import type { GameState, ViceKey } from '../types';
import { clampStat } from '../util';
import { release } from './crime';
import { graduateHighSchool } from './education';
import { treat } from './health';
import { ILLNESS_BY_ID } from '../../content/illnesses';
import { addSkill } from './skills';
import { treatAddiction, useVice } from './vices';
import { VICES } from '../types';

/** Extra gates for special activities (drinking age, nothing to treat...). */
export function specialReason(s: GameState, def: ActivityDef): string | null {
  const sp = def.special ?? '';
  if (sp === 'vice:alcohol') {
    const min = countryOf(s).ages.drinking;
    if (s.player.age < min) return `drinking age here is ${min}`;
  }
  if (sp === 'rehab' || sp === 'support') {
    if (!VICES.some((v) => s.vices.levels[v] >= 15)) return 'nothing to recover from';
  }
  if (sp === 'prison:diploma' && s.education.degrees.some((d) => d.level === 'high_school'))
    return 'you already have a diploma';
  return null;
}

/** Behaviour on top of an activity's outcome effects. */
export function runSpecial(
  ctx: Ctx,
  def: ActivityDef,
  success: boolean,
  params: Record<string, unknown>,
): void {
  const s = ctx.s;
  const sp = def.special ?? '';
  if (sp.startsWith('vice:')) {
    useVice(ctx, sp.slice(5) as ViceKey);
    return;
  }
  switch (sp) {
    case 'doctor': {
      // The doctor treats the most serious thing they can.
      const ill = [...s.health.illnesses]
        .sort((a, b) => b.severity - a.severity)
        .find((i) => ILLNESS_BY_ID[i.id]?.treatments.doctor !== undefined);
      s.health.lastDoctor = s.year;
      // The visit fee already covers it.
      if (ill) treat(ctx, ill.id, 'doctor', { free: true });
      return;
    }
    case 'therapy': {
      const mental = s.health.illnesses.find((i) => ILLNESS_BY_ID[i.id]?.mental);
      if (mental && ctx.roll(ILLNESS_BY_ID[mental.id]?.treatments.therapy ?? 0.5)) {
        mental.severity = clampStat(mental.severity - ctx.rng.int(15, 30));
        mental.treated = s.year;
        if (mental.severity <= 5)
          s.health.illnesses = s.health.illnesses.filter((i) => i !== mental);
        ctx.log('health', 'Therapy is helping. The fog lifts a little more each month.');
      }
      return;
    }
    case 'plastic_surgery':
      s.health.surgeryCount += 1;
      return;
    case 'practice': {
      const skill = typeof params['skill'] === 'string' ? params['skill'] : 'instrument';
      const cur = s.player.skills[skill] ?? 0;
      // Diminishing returns: the better you are, the slower it goes (SPEC §5.12).
      addSkill(s, skill, Math.max(1, Math.round((100 - cur) / 12) + ctx.rng.int(0, 2)));
      return;
    }
    case 'language': {
      const lang =
        typeof params['language'] === 'string' && LANGUAGE_BY_ID[params['language']]
          ? params['language']
          : 'spanish';
      const cur = s.player.languages[lang] ?? 0;
      s.player.languages[lang] = clampStat(
        cur + Math.max(2, Math.round((100 - cur) / 8) + ctx.rng.int(0, 3)),
      );
      s.player.skillPractice[`lang:${lang}`] = s.year;
      ctx.log(
        'activity',
        `Your ${LANGUAGE_BY_ID[lang]?.label ?? lang} is now ${s.player.languages[lang]}/100.`,
      );
      return;
    }
    case 'casino': {
      useVice(ctx, 'gambling');
      const stake = money(s, 200 + Math.max(0, s.money.cash) * 0.02);
      const r = ctx.rng.next();
      const delta =
        s.cheats.forceSuccess || r > 0.62
          ? Math.round(stake * (r > 0.95 ? 8 : 1.5))
          : r > 0.45
            ? 0
            : -stake;
      s.money.cash += delta;
      if (delta)
        ctx.log(
          'money',
          delta > 0
            ? `You walk out ${formatMoney(s, delta)} up.`
            : `You leave ${formatMoney(s, -delta)} lighter.`,
        );
      return;
    }
    case 'lottery': {
      if (s.cheats.forceSuccess || ctx.rng.chance(0.0005)) {
        const prize = money(s, ctx.rng.int(250000, 5000000));
        s.money.cash += prize;
        addStat(s, 'happiness', 20);
        ctx.log(
          'money',
          `You win the lottery: ${formatMoney(s, prize)}. You read the numbers eleven times.`,
          true,
        );
      }
      return;
    }
    case 'novel': {
      const w = s.player.skills['writing'] ?? 0;
      if (w >= 40 && ctx.rng.chance(0.15 + w / 300)) {
        const advance = money(s, 2000 + w * 400, 'wage');
        s.money.cash += advance;
        addStat(s, 'fame', w > 70 ? 6 : 2);
        ctx.log(
          'fame',
          `A publisher buys your novel for ${formatMoney(s, advance)}. Your mother tells everyone at church.`,
          true,
        );
      }
      return;
    }
    case 'rehab':
    case 'support': {
      const which =
        (sp === 'rehab' && success) || sp === 'support'
          ? treatAddiction(ctx, sp === 'rehab' ? 'rehab' : 'support')
          : null;
      if (which) ctx.log('health', `${which} has less of a hold on you now.`);
      return;
    }
    case 'prison:workout':
    case 'prison:library':
      if (s.legal.prison) s.legal.prison.behaviour = clampStat(s.legal.prison.behaviour + 3);
      return;
    case 'prison:diploma':
      if (success && !s.education.degrees.some((d) => d.level === 'high_school'))
        graduateHighSchool(ctx);
      if (s.legal.prison) s.legal.prison.behaviour = clampStat(s.legal.prison.behaviour + 5);
      return;
    case 'prison:allies': {
      const ally = addNpc(ctx, {
        role: 'cellmate',
        age: Math.max(18, s.player.age + ctx.rng.int(-10, 10)),
        rel: ctx.rng.int(55, 80),
      });
      ally.roles.push('friend');
      return;
    }
    case 'prison:fight':
    case 'prison:riot':
      if (s.legal.prison) {
        s.legal.prison.behaviour = clampStat(
          s.legal.prison.behaviour - (sp === 'prison:riot' ? 25 : 12),
        );
        if (sp === 'prison:riot' && ctx.rng.chance(0.3)) {
          s.legal.prison.years += 1;
          ctx.log('crime', 'The riot adds a year to your sentence.');
        }
      }
      return;
    case 'prison:escape': {
      const p = s.legal.prison;
      if (!p) return;
      s.legal.escapes += 1;
      if (success) {
        release(ctx, false);
        s.player.flags.push('fugitive');
        addStat(s, 'notoriety', 15);
        ctx.log('crime', 'You are free, technically. Every siren is about you now.', true);
      } else {
        p.years += 2;
        p.behaviour = clampStat(p.behaviour - 30);
      }
      return;
    }
    case 'prison:appeal': {
      const p = s.legal.prison;
      if (!p) return;
      if (success) {
        const cut = Math.max(1, Math.round((p.years - p.served) / 2));
        p.years -= cut;
        ctx.log(
          'crime',
          `The appeal succeeds: ${cut} year${cut === 1 ? '' : 's'} off your sentence.`,
          true,
        );
        if (p.served >= p.years) release(ctx, false);
      }
      return;
    }
  }
}
