import { describe, expect, it } from 'vitest';
import { choose, currentPopup, newLife, runCheat } from '../../src/engine';
import { choiceResult } from '../../src/renderer/store/result';
import { clone } from '../../src/engine/util';

describe('the result card after a choice', () => {
  it('shows the outcome, the visible changes, and nothing hidden', () => {
    let s = runCheat(newLife({ country: 'us', birthYear: 1995 }, 9), 'age.set', { age: 7 }).state;
    s = runCheat({ ...s, pending: [] }, 'event.fire', {
      event: 'child_crayon_wall',
      force: true,
    }).state;
    const popup = currentPopup(s);
    const pick = popup?.choices.find((c) => c.enabled);
    if (!popup || !pick) throw new Error('no popup');
    const after = choose(s, pick.id).state;
    const r = choiceResult(s, after, popup.emoji);
    expect(r.chose).toBe(pick.label);
    expect(r.prompt).toBe(popup.text);
    expect(r.text.length).toBeGreaterThan(0);
    expect(r.changes.every((c) => !/karma|discipline|stress|notoriety/i.test(c.label))).toBe(true);
  });

  it('reports stat, money, and relationship changes with direction', () => {
    const a = clone(newLife({ country: 'us', birthYear: 1995 }, 10));
    const b = clone(a);
    b.player.stats.happiness += 5;
    b.player.stats.health -= 3;
    b.money.cash += 500;
    const n = b.npcs[0];
    if (n) n.rel = Math.max(0, n.rel - 4);
    b.player.stats.karma += 10;
    const r = choiceResult(a, b, '🎲');
    const by = Object.fromEntries(r.changes.map((c) => [c.label, c]));
    expect(by['😊 Happiness']).toEqual({ label: '😊 Happiness', value: '+5', good: true });
    expect(by['❤️ Health']?.good).toBe(false);
    expect(by['💰 Money']?.value).toBe('+$500');
    if (n && a.npcs[0] && a.npcs[0].rel >= 4) expect(by[`🤝 ${n.first}`]?.value).toBe('−4');
    expect(r.changes.some((c) => /karma/i.test(c.label))).toBe(false);
  });
});
