import {
  GENRES,
  awardSeason,
  catalogueRoyalties,
  releaseLine,
  releaseResult,
  royaltiesLine,
  tourTake,
  type Genre,
} from './music-charts';
import { luck } from './luck';
import { workTime } from './activities';
import { pickFresh } from '../fresh';
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
  // Music takes time like anything else you do with a year.
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  switch (id) {
    case 'busk':
      if (s.player.stats.fame >= 70) return 'too famous: it would cause a crush';
      return skill < 10 ? 'needs instrument or voice 10' : null;
    case 'open_mic':
      if (s.player.stats.fame >= 60) return 'too famous for open mics';
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
      return m.stage < 4
        ? 'needs a record deal'
        : s.player.age < 18
          ? 'adults only'
          : s.player.stats.fame < 25
            ? 'needs more of an audience (fame 25)'
            : null;
  }
}

/** Music path actions. Success brings fame, income, and tours. */
export function musicAction(ctx: Ctx, id: MusicActionId): void {
  const s = ctx.s;
  const why = musicReason(s, id);
  if (why) throw new EngineError(why);
  markUsed(s, `m:${id}`);
  markUsed(s, 'w:total');
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
        pickFresh(ctx, [
          `You busk outside the station and make ${formatMoney(s, pay)}, a sandwich, and one fan.`,
          `An afternoon in the shopping street: ${formatMoney(s, pay)} in the case and a dog that stays for three songs.`,
          `You busk in the underpass where the echo is kind. ${formatMoney(s, pay)}, and a child who dances the whole time.`,
          `Rain stops play after an hour. ${formatMoney(s, pay)}, damp, and one man who says you made his day.`,
        ]),
      );
      return;
    }
    case 'open_mic': {
      addSkill(s, key, 3);
      m.stage = Math.max(m.stage, 2);
      const good = ctx.roll(0.3 + skill / 150);
      ctx.log(
        'fame',
        pickFresh(
          ctx,
          good
            ? [
                'Your open-mic set gets the room to stop talking. That never happens.',
                'Someone at the back films your second song. By the chorus, three people are singing along.',
                'You play the new one for the first time and the room goes quiet in the right way.',
                'The compere asks you to do one more. There is no one more; you play the first again, better.',
                'A stranger buys you a drink and tells you the bridge made them call their sister.',
              ]
            : [
                'Your open-mic set coincides with the coffee machine. You lose.',
                'A string snaps in the first verse. You finish on five and nobody notices but you.',
                'The act before you is a nine-year-old prodigy. You follow a nine-year-old prodigy.',
                'Half the room is there for a birthday and treats your ballad as background music.',
              ],
        ),
      );
      addStat(s, 'happiness', good ? 5 : -2);
      return;
    }
    case 'gig': {
      const pay = money(s, 150 + skill * 10, 'wage');
      s.money.cash += pay;
      addSkill(s, key, 2);
      m.stage = Math.max(m.stage, 3);
      addStat(s, 'fame', skill > 70 ? 2 : 1);
      ctx.log(
        'fame',
        pickFresh(
          ctx,
          s.player.stats.fame >= 60
            ? [
                `A secret warm-up show for three hundred people who can't believe their luck: ${formatMoney(s, pay)}.`,
                `A benefit night at a theatre with your name top of the bill: ${formatMoney(s, pay)} for your trouble, and far more for the cause.`,
                `A one-off acoustic set in a church with perfect echo. ${formatMoney(s, pay)}, and silence you could hear a pin in.`,
              ]
            : [
                `A paid gig at a pub with sticky floors: ${formatMoney(s, pay)} and a regular slot.`,
                `A wedding band needs a dep at short notice. ${formatMoney(s, pay)} and more cake than anyone should eat.`,
                `A Friday night in a back room above a bar: ${formatMoney(s, pay)}, a full room, and an encore you didn't plan.`,
                `A festival's smallest stage, at noon, to forty people and a lot of mud. ${formatMoney(s, pay)}, and it counts.`,
              ],
        ),
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
      // Rushing records out hurts them: last year's release costs this one.
      const rushed = m.releases.filter((x) => x.year >= s.year - 1).length * 10;
      const quality = clampStat(
        skill * 0.55 +
          r.int(0, 45) +
          (s.player.traits.includes('creative') ? 8 : 0) +
          18 * luck(s, 'music') -
          rushed,
      );
      // Every record gets a title of its own.
      const used = new Set(m.releases.map((x) => x.title));
      let title = `${r.pick(TITLE_A)} ${r.pick(TITLE_B)}`;
      for (let i = 0; i < 30 && used.has(title); i++)
        title = `${r.pick(TITLE_A)} ${r.pick(TITLE_B)}`;
      if (used.has(title)) title = `${title} II`;
      const mum = s.npcs.some((n) => n.alive && n.roles.includes('mother'));
      if (!m.genre) m.genre = r.pick(GENRES).id;
      const run = releaseResult(ctx, quality, !!m.label);
      m.releases.push({
        year: s.year,
        title,
        quality,
        chart: run.chart,
        sales: run.sales,
        ...(run.cert ? { cert: run.cert } : {}),
      });
      const fameGain = Math.round(quality / 16) + (m.label ? 3 : 1);
      // A flop costs you: the audience drifts and the critics are unkind.
      addStat(s, 'fame', quality < 45 ? -4 : quality > 70 ? fameGain + 3 : fameGain);
      if (quality < 45) addStat(s, 'happiness', -6);
      const pay = Math.max(
        run.pay,
        money(s, quality * (m.label ? 600 : 60) * (1 + s.player.stats.fame / 25), 'wage'),
      );
      s.money.cash += pay;
      ctx.log(
        'fame',
        `You release "${title}". ${quality > 80 ? (mum ? 'Critics call it a masterpiece; your mum agrees.' : 'Critics call it a masterpiece, and for once you agree.') : quality > 55 ? 'It finds an audience and keeps it.' : quality >= 45 ? (s.player.stats.fame >= 30 ? 'The critics shrug; the fans buy it anyway, out of loyalty.' : 'It finds an audience of about forty people.') : 'It flops. A critic calls it "a bold misstep" and that is the kindest review.'} It earns ${formatMoney(s, pay)}.`,
        true,
      );
      ctx.log('fame', `${run.chart === 1 ? '🥇' : '📀'} ${releaseLine(s, run)}`, run.chart > 0);
      awardSeason(ctx, title, quality, run.chart);
      if (!m.label && quality >= 60 - 15 * luck(s, 'music') && m.stage === 3) {
        const def = EVENT_BY_ID['fame_record_deal_offer'];
        if (def) fireEvent(ctx, def, 'system');
      }
      return;
    }
    case 'tour': {
      const fame = s.player.stats.fame;
      const tired = m.lastTour !== undefined && m.lastTour >= s.year - 1;
      const take = money(s, tourTake(s, fame, m.lastTour ?? null), 'wage');
      m.lastTour = s.year;
      // A quarter of tours go wrong: cancelled dates, a voice that gives out, a van in a ditch.
      if (r.chance(0.25 * Math.max(0, 1 - luck(s, 'music')))) {
        const pay = Math.round(take * 0.35);
        s.money.cash += pay;
        addStat(s, 'health', -8);
        addStat(s, 'stress', 10);
        addStat(s, 'fame', -2);
        m.touring = true;
        m.stage = Math.max(m.stage, 5);
        ctx.log(
          'fame',
          pickFresh(ctx, [
            `Half the tour is cancelled when your voice gives out in the third city. It still pays ${formatMoney(s, pay)}, and a lot of refunds.`,
            `The tour bus breaks down twice and the drummer breaks a wrist. You limp home with ${formatMoney(s, pay)} and a lot of apologies to send.`,
            `A storm cancels the biggest date and food poisoning takes two more. ${formatMoney(s, pay)}, and a tour T-shirt that lists cities you never reached.`,
          ]),
          true,
        );
        return;
      }
      const pay = Math.round(take * (0.7 + r.next() * 0.6));
      s.money.cash += pay;
      addStat(s, 'fame', 3);
      addStat(s, 'health', -4);
      addStat(s, 'stress', 6);
      m.touring = true;
      m.stage = Math.max(m.stage, 5);
      if (fame >= 80) {
        ctx.log(
          'fame',
          pickFresh(ctx, [
            `🏟️ A world stadium tour: ${r.int(40, 90)} nights, ${r.int(1, 4)} million tickets, and your take after crew and band is ${formatMoney(s, pay)}.`,
            `🏟️ ${r.int(20, 40)} countries, a stage that takes three days to build, and a city that renames a street for the week you play. Your take: ${formatMoney(s, pay)}.`,
            `🏟️ Tickets sell out in minutes and the resale prices make the news. ${r.int(50, 120)} stadium nights later you clear ${formatMoney(s, pay)}.`,
          ]),
          true,
        );
        if (tired && ctx.rng.chance(0.35))
          ctx.log(
            'fame',
            'Back on the road a year after the last tour: some fans sit this one out.',
          );
        return;
      }
      ctx.log(
        'fame',
        pickFresh(ctx, [
          `The tour sells out in ${r.int(8, 40)} cities and pays ${formatMoney(s, pay)}. You learn to sleep on a moving bus.`,
          `${r.int(8, 40)} cities, ${r.int(30, 90)} nights, ${formatMoney(s, pay)}. In one of them a whole stadium sings the second verse back at you.`,
          `The tour pays ${formatMoney(s, pay)} and costs you every houseplant you own. You come home and sleep for a week.`,
          `A long run of shows across ${r.int(8, 40)} cities: ${formatMoney(s, pay)}, one marriage proposal in the front row, and no voice left by the end.`,
          `You tour with a band half your age who call you a legend to your face. ${formatMoney(s, pay)}, and the best crowds of your life.`,
        ]),
        true,
      );
      return;
    }
  }
}

/** Sign with a label (from the record deal event). */
/** Change your sound (free: it's a choice, not a chore). */
export function setGenre(ctx: Ctx, genre: Genre): void {
  if (!GENRES.some((g) => g.id === genre)) throw new EngineError('unknown genre');
  ctx.s.music.genre = genre;
  ctx.log(
    'fame',
    `🎛️ You change your sound: ${GENRES.find((g) => g.id === genre)?.label.toLowerCase()} from now on.`,
  );
}

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
  if (m.releases.length) {
    // The back catalogue pays every year: hits most, and less as they age.
    const royalties = Math.max(
      catalogueRoyalties(s),
      m.label
        ? money(s, m.releases.reduce((t, r) => t + r.quality, 0) * 15 * (1 + fame / 50), 'wage')
        : 0,
    );
    if (royalties > 0) {
      s.money.cash += royalties;
      if (royalties > money(s, 20000, 'wage') && ctx.rng.chance(0.4))
        ctx.log('fame', `💿 ${royaltiesLine(s, royalties)}`);
    }
  }
  // Fame lifts happiness up to a point, then the attention starts to press (SPEC §5.5).
  if (fame > 0)
    addStat(s, 'happiness', fame <= 60 ? Math.round(fame / 20) : -Math.round((fame - 60) / 10));
  if (fame > 70) addStat(s, 'stress', 2);
  // Endorsements and appearances pay famous people even without a release.
  if (fame >= 40 && !s.legal.prison) {
    // (Not the big deals: those are Cash in on fame. This is the trickle a name earns.)
    const deal = money(s, (fame - 30) * 3000, 'wage');
    s.money.cash += deal;
    if (ctx.rng.chance(0.25))
      ctx.log(
        'fame',
        `Merchandise, licensing and your name on things you’ve never seen: ${formatMoney(s, deal)} this year, without lifting a finger.`,
      );
  }
}
