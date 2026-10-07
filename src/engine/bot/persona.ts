import { tournamentReason } from '../systems/chess';
import { ACTIVITY_BY_ID } from '../../content/activities';
import { act } from '../actions';
import { ageUp } from '../age';
import { choose, currentPopup } from '../events/choose';
import type { Rng } from '../rng';
import { activitiesFor } from '../systems/activities';
import { interactionsFor } from '../systems/interactions';
import { partnerOf } from '../systems/partners';
import type { GameState } from '../types';
import { botCareer } from './career-bot';
import { careerist, chaos, criminal, emigrant, family, military, musician } from './personas';

export type PersonaId =
  'default' | 'careerist' | 'criminal' | 'family' | 'military' | 'musician' | 'emigrant' | 'chaos';
export const PERSONAS: PersonaId[] = [
  'default',
  'careerist',
  'criminal',
  'family',
  'military',
  'musician',
  'emigrant',
  'chaos',
];

/** The bot's own memory between calls (which year it has already planned). Not part of the game. */
export type BotMemory = { plannedYear: number };
export const newBotMemory = (): BotMemory => ({ plannedYear: -1 });

const VICE_OR_CRIME = new Set(['crime']);
/** Prison activities that are themselves offences. */
const PRISON_CRIMES = new Set(['prison_fight', 'prison_riot', 'prison_escape']);
/** Vices are off the menu for the default persona (DONE §4); casinos count as gambling. */
const isVice = (special: string | undefined): boolean =>
  !!special && (special.startsWith('vice:') || special === 'casino');

function tryAct(s: GameState, a: Parameters<typeof act>[1]): GameState {
  try {
    return act(s, a).state;
  } catch {
    return s;
  }
}

/** Romantic progress (propose, wedding, baby), each accepted with 50% probability (DONE §4). */
function romance(s: GameState, rng: Rng): GameState {
  const p = partnerOf(s);
  if (!p) return s;
  let cur = s;
  for (const view of interactionsFor(cur, p)) {
    if (!view.enabled) continue;
    if (!['propose', 'plan_wedding', 'try_for_baby'].includes(view.id)) continue;
    if (!rng.chance(0.5)) continue;
    const params =
      view.id === 'plan_wedding' ? { size: 'small' as const, prenup: rng.chance(0.2) } : undefined;
    cur = tryAct(cur, {
      type: 'interact',
      npcId: p.id,
      id: view.id,
      ...(params ? { params } : {}),
    });
  }
  return cur;
}

const PLANS: Partial<Record<PersonaId, (s: GameState, rng: Rng, t: typeof tryAct) => GameState>> = {
  careerist,
  criminal,
  family,
  military,
  musician,
  emigrant,
  chaos,
};

/** One year's worth of a persona's own choices; the default persona follows DONE §4. */
function planYear(s: GameState, persona: PersonaId, rng: Rng): GameState {
  const plan = PLANS[persona];
  if (plan) return chessSeason(plan(s, rng, tryAct), rng);
  let cur = chessSeason(s, rng);
  if (rng.chance(0.5)) {
    const n = rng.int(0, 2);
    for (let i = 0; i < n; i++) {
      const options = activitiesFor(cur).filter(
        (a) =>
          a.enabled &&
          !VICE_OR_CRIME.has(ACTIVITY_BY_ID[a.id]?.group ?? '') &&
          !isVice(ACTIVITY_BY_ID[a.id]?.special) &&
          !PRISON_CRIMES.has(a.id),
      );
      if (!options.length) break;
      cur = tryAct(cur, { type: 'activity', id: rng.pick(options).id });
    }
  }
  cur = botCareer(cur, persona, rng, tryAct);
  cur = romance(cur, rng);
  return cur;
}

/**
 * A bot makes the player's decisions with its own RNG (player input, not game randomness).
 * Each call answers one popup, plans the year once, or ages up.
 */
export function botStep(
  s: GameState,
  persona: PersonaId,
  rng: Rng,
  mem: BotMemory = newBotMemory(),
): GameState {
  const popup = currentPopup(s);
  if (popup) {
    const enabled = popup.choices.filter((c) => c.enabled);
    if (!enabled.length) throw new Error(`popup ${popup.eventId} has no selectable choice`);
    return choose(s, rng.pick(enabled).id).state;
  }
  if (mem.plannedYear !== s.year) {
    mem.plannedYear = s.year;
    return planYear(s, persona, rng);
  }
  return ageUp(s).state;
}

/** Anyone who plays chess well enough enters a tournament or two, at the best level open to them. */
function chessSeason(s: GameState, rng: Rng): GameState {
  if ((s.player.skills['chess'] ?? 0) < 30 || !rng.chance(0.6)) return s;
  let cur = s;
  for (let i = 0; i < 2; i++) {
    const tier = ['elite', 'international', 'national', 'local'].find(
      (x) => tournamentReason(cur, x) === null,
    );
    if (!tier) break;
    cur = tryAct(cur, { type: 'chess', tier });
  }
  return cur;
}
