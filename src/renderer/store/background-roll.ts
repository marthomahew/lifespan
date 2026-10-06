import { BACKGROUNDS, BACKGROUND_ODDS, type BackgroundFrequency } from '../../content/backgrounds';

/** "Follow the setting": a background rolled from the seed, as often as Settings allows. */
export const AUTO_BACKGROUND = 'auto';

export function rollBackground(seed: number, freq: BackgroundFrequency): string | undefined {
  // Derived from the seed so a replayed seed gets the same start.
  const roll = ((seed * 2654435761) >>> 0) / 2 ** 32;
  if (roll >= BACKGROUND_ODDS[freq]) return undefined;
  return BACKGROUNDS[Math.floor((roll / BACKGROUND_ODDS[freq]) * BACKGROUNDS.length)]?.id;
}
