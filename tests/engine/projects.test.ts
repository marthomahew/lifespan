import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';

const writer = (seed = 90): GameState => {
  let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', { age: 30 }).state;
  s = runCheat({ ...s, pending: [] }, 'skill.set', { skill: 'writing', value: 70 }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
/** Answer popups: the novel's with the given choice, the rest with the first. */
const answer = (s: GameState, pick: Record<string, string>): GameState => {
  let t = s;
  for (let i = 0; i < 10 && t.pending.length; i++) {
    const p = currentPopup(t);
    if (!p) return { ...t, pending: [] };
    const id = pick[p.eventId] ?? p.choices.find((c) => c.enabled)?.id;
    if (!id) return { ...t, pending: [] };
    t = choose(t, id).state;
  }
  return t;
};

describe('a novel over the years', () => {
  it('drafting moves a book on until there is a whole draft and a decision', () => {
    let s = writer();
    let finished = false;
    for (let y = 0; y < 8 && !finished; y++) {
      s = act(answer(s, {}), { type: 'activity', id: 'write_novel' }).state;
      finished = currentPopup(s)?.eventId === 'proj_novel_finished';
      if (!finished) s = answer(ageUp(answer(s, {})).state, {});
    }
    expect(finished).toBe(true);
    expect(s.projects?.novel?.progress).toBe(100);
    expect(currentPopup(s)?.text).toContain(s.projects?.novel?.title ?? '?');
  });

  it('sent out, it meets rejections or an offer; taking the offer publishes it, and reviews follow', () => {
    let s = writer(91);
    s = {
      ...s,
      projects: {
        novel: {
          title: 'Paper Boats',
          stage: 'querying',
          progress: 100,
          quality: 90,
          rejections: 0,
        },
      },
    };
    let published = false;
    for (let y = 0; y < 12 && !published; y++) {
      s = answer(ageUp(s).state, { proj_novel_offer: 'accept', proj_novel_rejection: 'again' });
      published = s.projects?.novel?.stage === 'published';
    }
    expect(published).toBe(true);
    expect(s.player.flags).toContain('published_novel');
    s = answer(ageUp(s).state, {});
    expect(s.projects?.novel?.reviewed).toBe(true);
    // While waiting on agents you can't start another draft.
    const waiting = {
      ...s,
      projects: {
        novel: {
          title: 'X',
          stage: 'querying' as const,
          progress: 100,
          quality: 50,
          rejections: 0,
        },
      },
    };
    // While waiting on agents, the desk is for short stories: skill grows, the book stays put.
    const stories = act(waiting, { type: 'activity', id: 'write_novel' }).state;
    expect(stories.projects?.novel?.stage).toBe('querying');
    expect(stories.log.some((l) => /short stories/.test(l.text))).toBe(true);
  });

  it('a drawer, or doing it yourself, are choices too', () => {
    const s = writer(92);
    const base = {
      ...s,
      projects: {
        novel: {
          title: 'Salt and Ash',
          stage: 'querying' as const,
          progress: 100,
          quality: 20,
          rejections: 3,
        },
      },
    };
    let t: GameState = base;
    for (let y = 0; y < 6 && t.projects?.novel?.stage !== 'published'; y++)
      t = answer(ageUp(t).state, { proj_novel_rejection: 'self', proj_novel_offer: 'accept' });
    expect(t.projects?.novel?.stage).toBe('published');
  });
});

describe('threads', () => {
  it('open storylines show up: the book, prison time, things still unfolding', async () => {
    const { openThreads } = await import('../../src/engine/threads');
    const s = writer(93);
    expect(openThreads(s).find((t) => t.id === 'novel')).toBeUndefined();
    const drafting = {
      ...s,
      projects: {
        novel: {
          title: 'Small Hours',
          stage: 'drafting' as const,
          progress: 40,
          quality: 50,
          rejections: 0,
        },
      },
    };
    expect(openThreads(drafting).find((t) => t.id === 'novel')?.detail).toBe('40% of a draft');
    const jailed = runCheat(s, 'prison.send', { years: 4 }).state;
    expect(openThreads(jailed).some((t) => t.id === 'prison')).toBe(true);
  });
});

describe('more books', () => {
  it('every book gets its own title', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { writeNovel } = await import('../../src/engine/systems/projects');
    const s = structuredClone(writer(94));
    const titles: string[] = [];
    for (let b = 0; b < 6; b++) {
      s.projects = {
        ...(s.projects ?? {}),
        novel: s.projects?.novel
          ? { ...s.projects.novel, stage: 'published', reviewed: true }
          : null,
      };
      writeNovel(new Ctx(s), 0);
      titles.push(s.projects?.novel?.title ?? '');
    }
    expect(new Set(titles).size).toBe(6);
  });
});

describe('a writing career', () => {
  it('a backlist earns every year, and a track record raises the advance', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { novelOp, projectsTick } = await import('../../src/engine/systems/projects');
    const s = structuredClone(writer(95));
    s.projects = { books: 3, novel: null };
    const cash = s.money.cash;
    projectsTick(new Ctx(s));
    expect(s.money.cash).toBeGreaterThan(cash);
    const advance = (books: number): number => {
      const t = structuredClone(writer(95));
      t.projects = {
        books,
        novel: { title: 'X', stage: 'querying', progress: 100, quality: 60, rejections: 0 },
      };
      const before = t.money.cash;
      novelOp(new Ctx(t), 'accept');
      return t.money.cash - before;
    };
    expect(advance(3)).toBeGreaterThan(advance(0) * 1.8);
  });
});

describe('one book at a time', () => {
  it('a new draft waits until the last book’s reviews are in', () => {
    const s = writer(96);
    const out = {
      ...s,
      projects: {
        books: 1,
        novel: {
          title: 'Paper Boats',
          stage: 'published' as const,
          progress: 100,
          quality: 70,
          rejections: 0,
          publishedYear: s.year,
        },
      },
    };
    const stories = act(out, { type: 'activity', id: 'write_novel' }).state;
    expect(stories.projects?.novel?.title).toBe('Paper Boats');
    expect(stories.log.some((l) => /short stories/.test(l.text))).toBe(true);
  });

  it('after eight rounds of no, nobody is left to ask: rewrite, publish, or the drawer', () => {
    let s: GameState = {
      ...writer(93),
      projects: {
        novel: {
          title: 'Small Hours',
          stage: 'querying',
          progress: 100,
          quality: 0,
          rejections: 7,
        },
      },
    };
    // Quality 0 still has a floor of a chance; find a year that brings a no.
    for (let y = 0; y < 20 && currentPopup(s)?.eventId !== 'proj_novel_rejection'; y++)
      s = ageUp(answer(s, { proj_novel_rejection: 'again', proj_novel_offer: 'accept' })).state;
    const p = currentPopup(s);
    expect(p?.eventId).toBe('proj_novel_rejection');
    expect(p?.choices.find((c) => c.id === 'again')?.enabled).toBe(false);
    const drawer = choose(s, 'drawer').state;
    expect(drawer.projects?.novel).toBeNull();
    expect(drawer.player.flags).toContain('novel_in_drawer');
    expect(() =>
      act({ ...drawer, pending: [] }, { type: 'activity', id: 'write_novel' }),
    ).not.toThrow();
  });
});
