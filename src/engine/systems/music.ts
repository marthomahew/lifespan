import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { fireEvent } from '../events/select';
import { addNpc } from '../npc';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { addSkill } from './skills';
import { markUsed, usedThisYear } from './usage';

/** Stages on the path (SPEC §5.5). */
export const MUSIC_STAGES = [
  'Not performing',
  'Busker',
  'Open-mic regular',
  'Local act',
  'Signed artist',
  'Touring star',
];

export const musicSkill = (s: GameState): number =>
  Math.max(s.player.skills['instrument'] ?? 0, s.player.skills['voice'] ?? 0);

export type MusicActionId =
  'busk' | 'open_mic' | 'gig' | 'form_band' | 'go_solo' | 'release' | 'tour';

const TITLE_A = [
  'Velvet',
  'Paper',
  'Static',
  'Neon',
  'Quiet',
  'Copper',
  'Midnight',
  'Salt',
  'Glass',
  'Satellite',
  'Lemon',
  'Hollow',
];
const TITLE_B = [
  'Weather',
  'Hearts',
  'Motel',
  'Radio',
  'Garden',
  'Engines',
  'Summer',
  'Ghosts',
  'Highway',
  'Lanterns',
  'Tuesday',
  'Echoes',
];

export function musicReason(s: GameState, id: MusicActionId): string | null {
  const m = s.music;
  const skill = musicSkill(s);
  if (s.player.age < 12) return 'from age 12';
  if (s.legal.prison) return 'not from prison';
  if (usedThisYear(s, `m:${id}`) >= (id === 'busk' || id === 'gig' ? 2 : 1))
    return 'done this year';
  switch (id) {
    case 'busk':
      return skill < 10 ? 'needs instrument or voice 10' : null;
    case 'open_mic':
      return skill < 20 ? 'needs instrument or voice 20' : null;
    case 'gig':
      return m.stage < 2
        ? 'play some open mics first'
        : skill < 35
          ? 'needs instrument or voice 35'
          : null;
    case 'form_band':
    case 'go_solo':
      return m.stage < 2
        ? 'play some open mics first'
        : m.act
          ? 'you already have an act'
          : s.player.age < 16
            ? 'from age 16'
            : null;
    case 'release':
      return !m.act ? 'form a band or go solo first' : m.stage < 3 ? 'play local gigs first' : null;
    case 'tour':
      return m.stage < 4 ? 'needs a record deal' : s.player.age < 18 ? 'adults only' : null;
  }
}

/** Music path actions. Success brings fame, income, and tours. */
export function musicAction(ctx: Ctx, id: MusicActionId): void {
  const s = ctx.s;
  const why = musicReason(s, id);
  if (why) throw new EngineError(why);
  markUsed(s, `m:${id}`);
  const m = s.music;
  const r = ctx.rng;
  const skill = musicSkill(s);
  const key =
    (s.player.skills['voice'] ?? 0) >= (s.player.skills['instrument'] ?? 0)
      ? 'voice'
      : 'instrument';
  m.lastWork = s.year;
  switch (id) {
    case 'busk': {
      const pay = money(s, r.int(20, 60) + skill * 3, 'wage');
      s.money.cash += pay;
      addSkill(s, key, 2);
      m.stage = Math.max(m.stage, 1);
      ctx.log(
        'fame',
        `You busk outside the station and make ${formatMoney(s, pay)}, a sandwich, and one fan.`,
      );
      return;
    }
    case 'open_mic': {
      addSkill(s, key, 3);
      m.stage = Math.max(m.stage, 2);
      const good = ctx.roll(0.3 + skill / 150);
      ctx.log(
        'fame',
        good
          ? 'Your open-mic set gets the room to stop talking. That never happens.'
          : 'Your open-mic set coincides with the coffee machine. You lose.',
      );
      addStat(s, 'happiness', good ? 5 : -2);
      return;
    }
    case 'gig': {
      const pay = money(s, 150 + skill * 10, 'wage');
      s.money.cash += pay;
      addSkill(s, key, 2);
      m.stage = Math.max(m.stage, 3);
      addStat(s, 'fame', skill > 60 ? 3 : 1);
      ctx.log(
        'fame',
        `A paid gig at a pub with sticky floors: ${formatMoney(s, pay)} and a regular slot.`,
      );
      return;
    }
    case 'form_band':
    case 'go_solo': {
      m.act = id === 'form_band' ? 'band' : 'solo';
      if (id === 'form_band') {
        for (let i = 0; i < 2; i++)
          addNpc(ctx, {
            role: 'bandmate',
            age: Math.max(16, s.player.age + r.int(-4, 4)),
            rel: r.int(50, 75),
          });
        ctx.log(
          'fame',
          'You start a band. Naming it takes longer than writing the first three songs.',
          true,
        );
      } else ctx.log('fame', 'You go solo. All the credit, all the van driving.', true);
      return;
    }
    case 'release': {
      const quality = clampStat(
        skill * 0.7 + r.int(0, 40) + (s.player.traits.includes('creative') ? 8 : 0),
      );
      const title = `${r.pick(TITLE_A)} ${r.pick(TITLE_B)}`;
      m.releases.push({ year: s.year, title, quality });
      const fameGain = Math.round(quality / 10) + (m.label ? 6 : 1);
      addStat(s, 'fame', quality > 70 ? fameGain + 6 : fameGain);
      const pay = money(s, quality * (m.label ? 600 : 60) * (1 + s.player.stats.fame / 25), 'wage');
      s.money.cash += pay;
      ctx.log(
        'fame',
        `You release "${title}". ${quality > 80 ? 'Critics call it a masterpiece; your mum agrees.' : quality > 55 ? 'It finds an audience and keeps it.' : 'It finds an audience of about forty people.'} It earns ${formatMoney(s, pay)}.`,
        true,
      );
      if (!m.label && quality >= 60 && m.stage === 3) {
        const def = EVENT_BY_ID['fame_record_deal_offer'];
        if (def) fireEvent(ctx, def, 'system');
      }
      return;
    }
    case 'tour': {
      const fame = s.player.stats.fame;
      const pay = money(s, 20000 + fame * 3000, 'wage');
      s.money.cash += pay;
      addStat(s, 'fame', 5);
      addStat(s, 'health', -4);
      addStat(s, 'stress', 6);
      m.touring = true;
      m.stage = Math.max(m.stage, 5);
      ctx.log(
        'fame',
        `The tour sells out in ${r.int(8, 40)} cities and pays ${formatMoney(s, pay)}. You learn to sleep on a moving bus.`,
        true,
      );
      return;
    }
  }
}

/** Sign with a label (from the record deal event). */
export function signRecordDeal(ctx: Ctx, label: string): void {
  ctx.s.music.label = label;
  ctx.s.music.stage = Math.max(ctx.s.music.stage, 4);
  ctx.log(
    'fame',
    `You sign with ${label}. The contract is forty pages and smells of ambition.`,
    true,
  );
}

/** Fame decays without new work; it lifts or dents happiness (SPEC §5.5). */
export function fameTick(ctx: Ctx): void {
  const s = ctx.s;
  const m = s.music;
  m.touring = false;
  const fame = s.player.stats.fame;
  if (fame > 0 && s.year - m.lastWork > 1)
    s.player.stats.fame = clampStat(fame - (fame > 50 ? 4 : 2));
  if (m.label && m.releases.length) {
    const royalties = money(
      s,
      m.releases.reduce((t, r) => t + r.quality, 0) * 15 * (1 + fame / 50),
      'wage',
    );
    s.money.cash += royalties;
  }
  if (fame > 70) addStat(s, 'stress', 2);
}
