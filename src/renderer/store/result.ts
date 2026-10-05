import { formatMoney, type GameState } from '../../engine';

/** What a choice did, for the result card after a popup (the game's feedback moment). */
export type Change = { label: string; value: string; good: boolean };
export type ChoiceResult = {
  emoji: string;
  prompt: string;
  chose: string;
  text: string;
  changes: Change[];
  /** Other things that happened as a result (hired, a new friend, an arrest...). */
  also: string[];
  /** Why it went that way, when your traits, skills or stats tipped it. */
  because: string | null;
};

const STATS = [
  ['happiness', 'Happiness', '😊'],
  ['health', 'Health', '❤️'],
  ['smarts', 'Smarts', '🧠'],
  ['looks', 'Looks', '✨'],
] as const;

const signed = (n: number): string => (n > 0 ? `+${n}` : `−${-n}`);

/** Compare the state before and after a choice. Hidden stats stay hidden. */
export function choiceResult(before: GameState, after: GameState, emoji: string): ChoiceResult {
  const fresh = after.log.slice(before.log.length);
  const outcome = fresh.find((e) => e.chose !== undefined) ?? fresh[0];
  const changes: Change[] = [];
  for (const [k, label, icon] of STATS) {
    const d = after.player.stats[k] - before.player.stats[k];
    if (d) changes.push({ label: `${icon} ${label}`, value: signed(d), good: d > 0 });
  }
  const cash = after.money.cash - before.money.cash;
  if (cash)
    changes.push({
      label: '💰 Money',
      value: `${cash > 0 ? '+' : '−'}${formatMoney(after, Math.abs(cash))}`,
      good: cash > 0,
    });
  const fame = after.player.stats.fame - before.player.stats.fame;
  if (fame && (after.player.stats.fame > 0 || before.player.stats.fame > 0))
    changes.push({ label: '🌟 Fame', value: signed(fame), good: fame > 0 });
  for (const n of after.npcs) {
    const was = before.npcs.find((x) => x.id === n.id);
    if (!was || !n.alive) continue;
    const d = n.rel - was.rel;
    if (d) changes.push({ label: `🤝 ${n.first}`, value: signed(d), good: d > 0 });
  }
  return {
    emoji,
    prompt: outcome?.prompt ?? '',
    chose: outcome?.chose ?? '',
    text: outcome?.text ?? '',
    changes,
    also: fresh
      .filter((e) => e !== outcome)
      .map((e) => e.text)
      .slice(0, 3),
    because: outcome?.because ?? null,
  };
}

/** The year just lived, in a line: visible stats and money (relationships are too many to list). */
export function yearChanges(before: GameState, after: GameState): Change[] {
  return choiceResult(before, after, '').changes.filter((c) => !c.label.startsWith('🤝'));
}
