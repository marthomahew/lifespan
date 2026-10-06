import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { fireEvent } from '../events/select';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';

/** A novel over the years: drafting, sending it out, and what the world makes of it. */
export type NovelProject = {
  title: string;
  stage: 'drafting' | 'querying' | 'published';
  /** Draft progress, 0..100. */
  progress: number;
  /** How good it is, 0..100: grows with skill and revision. */
  quality: number;
  rejections: number;
  /** Year it came out (for the reviews). */
  publishedYear?: number;
  reviewed?: boolean;
};
export type Projects = { novel?: NovelProject | null; books?: number; titles?: string[] };

export type NovelOp =
  'revise' | 'submit' | 'shelve' | 'accept' | 'holdout' | 'selfpub' | 'keep_trying' | 'revive';

const TITLES = [
  'The Lighthouse at Low Tide',
  'A Field Guide to Leaving',
  'Small Hours',
  'The Orchard Keeper’s Daughter',
  'Everything We Didn’t Say',
  'Salt and Ash',
  'The Year of the Long Winter',
  'Paper Boats',
  'A House With Nine Doors',
  'The Last Good Summer',
];

export const novelOf = (s: GameState): NovelProject | null => s.projects?.novel ?? null;

/** Why you can't sit down to write right now, or null. */
export function novelReason(s: GameState): string | null {
  const n = novelOf(s);
  if (n?.stage === 'querying') return 'waiting to hear back from agents';
  return null;
}

/** A year at the desk: start a book, or move the draft on. */
export function writeNovel(ctx: Ctx, outcomeIndex: number): void {
  const s = ctx.s;
  const w = s.player.skills['writing'] ?? 0;
  const p: Projects = (s.projects ??= {});
  let n = p.novel ?? null;
  if (!n || n.stage === 'published') {
    // Every book gets its own title.
    const used = new Set([n?.title, ...(p.titles ?? [])]);
    const free = TITLES.filter((t) => !used.has(t));
    const title = free.length
      ? ctx.rng.pick(free)
      : `${ctx.rng.pick(TITLES)}, Part ${(p.books ?? 0) + 1}`;
    p.titles = [...(p.titles ?? []), title];
    n = { title, stage: 'drafting', progress: 0, quality: clampStat(w * 0.6), rejections: 0 };
    p.novel = n;
    ctx.log('fame', `📖 You start a new novel. Working title: ${title}.`, true);
  }
  // 0: a good year, 1: block, 2: a breakthrough.
  const gain = outcomeIndex === 1 ? 8 : outcomeIndex === 2 ? 45 : 28;
  n.progress = Math.min(100, n.progress + gain + Math.round(w / 8));
  n.quality = clampStat(n.quality + (w - n.quality) * 0.3 + ctx.rng.int(0, 4));
  if (n.progress >= 100) fire(ctx, 'proj_novel_finished');
  else ctx.log('fame', `${n.title}: about ${n.progress}% of a first draft.`);
}

/** The year's news for a book out in the world. */
export function projectsTick(ctx: Ctx): void {
  const s = ctx.s;
  const n = novelOf(s);
  if (!n || s.death) return;
  if (n.stage === 'querying') {
    const fame = s.player.stats.fame;
    const odds = Math.min(0.85, 0.12 + n.quality / 160 + fame / 300 - n.rejections * 0.02);
    fire(ctx, ctx.rng.chance(odds) ? 'proj_novel_offer' : 'proj_novel_rejection');
  } else if (
    n.stage === 'published' &&
    !n.reviewed &&
    n.publishedYear !== undefined &&
    s.year > n.publishedYear
  ) {
    n.reviewed = true;
    fire(ctx, n.quality >= 60 ? 'proj_novel_reviews_good' : 'proj_novel_reviews_mixed');
  }
}

function fire(ctx: Ctx, id: string): void {
  const def = EVENT_BY_ID[id];
  if (def) fireEvent(ctx, def, 'system');
}

/** Choices about the book, from its events. */
export function novelOp(ctx: Ctx, op: NovelOp): void {
  const s = ctx.s;
  if (op === 'revive') {
    // The book from the drawer, back on the desk: most of a draft, better than you remembered.
    const p: Projects = (s.projects ??= {});
    if (p.novel) return;
    const w = s.player.skills['writing'] ?? 0;
    p.novel = {
      title: 'The Drawer Book',
      stage: 'drafting',
      progress: 70,
      quality: clampStat(w * 0.7 + 10),
      rejections: 0,
    };
    s.player.flags = s.player.flags.filter((f) => f !== 'novel_in_drawer');
    return;
  }
  const n = novelOf(s);
  if (!n) return;
  const p = s.projects as Projects;
  switch (op) {
    case 'revise':
      n.stage = 'drafting';
      n.progress = 70;
      n.quality = clampStat(n.quality + 10);
      return;
    case 'submit':
      n.stage = 'querying';
      return;
    case 'keep_trying':
      n.rejections += 1;
      return;
    case 'shelve':
      p.novel = null;
      if (!s.player.flags.includes('novel_in_drawer')) s.player.flags.push('novel_in_drawer');
      return;
    case 'holdout':
    case 'accept': {
      // Holding out for more is a gamble: sometimes the offer simply goes away.
      if (op === 'holdout' && ctx.rng.chance(0.4)) {
        n.rejections += 1;
        ctx.log(
          'fame',
          `The publisher moves on to someone else’s book. ${n.title} goes back on the pile.`,
        );
        return;
      }
      const w = s.player.skills['writing'] ?? 0;
      const base = 3000 + n.quality * 400 + w * 100;
      const advance = money(s, op === 'holdout' ? base * 1.8 : base, 'wage');
      publish(ctx, n, advance, `a publisher, for ${formatMoney(s, advance)}`);
      return;
    }
    case 'selfpub':
      publish(ctx, n, money(s, 200 + n.quality * 20, 'wage'), 'yourself, one print run at a time');
      return;
  }
}

function publish(ctx: Ctx, n: NovelProject, advance: number, how: string): void {
  const s = ctx.s;
  const p = s.projects as Projects;
  n.stage = 'published';
  n.publishedYear = s.year;
  p.books = (p.books ?? 0) + 1;
  s.money.cash += advance;
  if (!s.player.flags.includes('published_novel')) s.player.flags.push('published_novel');
  addStat(s, 'fame', n.quality >= 60 ? 5 : 2);
  ctx.log('fame', `📚 ${n.title} is published by ${how}.`, true);
}
