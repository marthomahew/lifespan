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
    expect(() => act(waiting, { type: 'activity', id: 'write_novel' })).toThrow(/agents/);
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
