import type { GameState } from '../types';
import { clampStat } from '../util';
import { COUNTRY_BY_ID } from '../../content/countries';

/** Add to a skill (0..100). Positive deltas count as practice this year. */
export function addSkill(s: GameState, id: string, delta: number): void {
  const cur = s.player.skills[id] ?? 0;
  s.player.skills[id] = clampStat(cur + delta);
  if (delta > 0) s.player.skillPractice[id] = s.year;
}

/** Skills decay slowly without practice (SPEC §5.12); foreign languages fade too. */
export function skillDecay(s: GameState): void {
  for (const [id, lvl] of Object.entries(s.player.skills)) {
    const last = s.player.skillPractice[id] ?? -100;
    if (lvl > 0 && s.year - last > 2) s.player.skills[id] = clampStat(lvl - (lvl > 60 ? 2 : 1));
  }
  const native = new Set(COUNTRY_BY_ID[s.player.country]?.languages ?? []);
  for (const [id, lvl] of Object.entries(s.player.languages)) {
    if (native.has(id) || id === COUNTRY_BY_ID[s.player.birthCountry]?.languages[0]) continue;
    const last = s.player.skillPractice[`lang:${id}`] ?? -100;
    if (lvl > 0 && s.year - last > 3) s.player.languages[id] = clampStat(lvl - 1);
  }
}
