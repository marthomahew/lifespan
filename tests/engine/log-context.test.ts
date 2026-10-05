import { describe, expect, it } from 'vitest';
import { choose, currentPopup, newLife, runCheat } from '../../src/engine';

describe('the log keeps the story of each choice', () => {
  it('a choice outcome records the setup and the option you picked', () => {
    let s = runCheat(newLife({ country: 'us', birthYear: 1995 }, 9), 'age.set', { age: 7 }).state;
    s = { ...s, pending: [] };
    s = runCheat(s, 'event.fire', { event: 'child_crayon_wall', force: true }).state;
    const popup = currentPopup(s);
    expect(popup).toBeTruthy();
    if (!popup) return;
    const pick = popup.choices.find((c) => c.enabled);
    if (!pick) throw new Error('no choice');
    const before = s.log.length;
    const after = choose(s, pick.id).state;
    const entry = after.log[before];
    expect(entry?.prompt).toBe(popup.text);
    expect(entry?.chose).toBe(pick.label);
    expect(entry?.text.length).toBeGreaterThan(0);
  });
});
