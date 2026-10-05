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
import { HAIR_STYLES } from '../avatar';
import { EngineError } from '../errors';

/** Extra gates for special activities (drinking age, nothing to treat...). */
export function specialReason(s: GameState, def: ActivityDef): string | null {
  const sp = def.special ?? '';
  if (sp === 'vice:alcohol') {
    const min = countryOf(s).ages.drinking;
    if (s.player.age < min) return `drinking age here is ${min}`;
  }
  if (sp === 'vice:smoking' && s.player.age < 18) return 'from age 18';
  if (sp === 'rehab' || sp === 'support') {
    if (!VICES.some((v) => s.vices.levels[v] >= 15)) return 'nothing to recover from';
  }
  if (sp === 'prison:diploma' && s.education.degrees.some((d) => d.level === 'high_school'))
    return 'you already have a diploma';
  if (sp === 'adopt') {
    // Agencies want a stable home: a partner, or a steady income of your own.
    const partnered = s.npcs.some(
      (n) => n.alive && (n.roles.includes('spouse') || n.roles.includes('partner')),
    );
    if (!partnered && s.career.salary < money(s, 40000, 'wage'))
      return 'agencies want a partner or a steady income';
    if (s.npcs.filter((n) => n.alive && n.roles.includes('child') && n.age < 18).length >= 3)
      return 'agencies say three children at home is plenty';
  }
  return null;
}

/** Behaviour on top of an activity's outcome effects. */
export function runSpecial(
  ctx: Ctx,
  def: ActivityDef,
  success: boolean,
  params: Record<string, unknown>,
  outcomeIndex = -1,
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
    case 'bucket_list':
      s.player.flags.push('bucket_item');
      return;
    case 'plastic_surgery':
      s.health.surgeryCount += 1;
      return;
    case 'practice': {
      const skill = typeof params['skill'] === 'string' ? params['skill'] : 'instrument';
      const cur = s.player.skills[skill] ?? 0;
      // Diminishing returns: the better you are, the slower it goes (SPEC §5.12); a talent goes further.
      const gain = Math.max(1, Math.round((100 - cur) / 12) + ctx.rng.int(0, 2));
      addSkill(s, skill, s.player.talent === skill ? Math.round(gain * 1.5) : gain);
      return;
    }
    case 'new_look': {
      const hair = String(params['hair'] ?? '');
      const style = HAIR_STYLES.find((h) => h.id === hair);
      if (!style) throw new EngineError('pick a look');
      s.player.hair = style.id;
      return;
    }
    case 'change_name': {
      const first = String(params['first'] ?? '')
        .trim()
        .slice(0, 40);
      const last = String(params['last'] ?? '')
        .trim()
        .slice(0, 40);
      if (!first || !last) throw new EngineError('a name needs a first and a last part');
      const was = `${s.player.first} ${s.player.last}`;
      s.player.first = first;
      s.player.last = last;
      ctx.log('system', `You sign the form. ${was} is now officially ${first} ${last}.`, true);
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
      // The money follows the outcome the player read: a win, a loss, or breaking even. Slightly negative odds overall.
      useVice(ctx, 'gambling');
      const stake = money(s, 200) + Math.round(Math.max(0, s.money.cash) * 0.02);
      const delta = success
        ? ctx.rng.chance(0.1)
          ? stake * 3
          : stake
        : outcomeIndex === 1
          ? -stake
          : 0;
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
      // Real lottery odds: tickets lose money on average.
      if (s.cheats.forceSuccess || ctx.rng.chance(0.000001)) {
        const prize = money(s, ctx.rng.int(250000, 5000000));
        s.money.cash += prize;
        if (!s.player.flags.includes('lottery_winner')) s.player.flags.push('lottery_winner');
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
        if (!s.player.flags.includes('published_novel')) s.player.flags.push('published_novel');
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
