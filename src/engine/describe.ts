import { TRAIT_BY_ID } from '../content/traits';
import type { SkillDef, Trait } from '../content/types';

const STAT_LABEL: Record<string, string> = {
  happiness: 'Happiness',
  health: 'Health',
  smarts: 'Smarts',
  looks: 'Looks',
  karma: 'Karma',
  discipline: 'Discipline',
  fertility: 'Fertility',
  stress: 'Stress',
  fame: 'Fame',
  notoriety: 'Notoriety',
};
const ODDS_LABEL: Record<string, string> = {
  social: 'social',
  romance: 'romance',
  work: 'work',
  study: 'study',
  crime: 'crime',
  creative: 'creative',
  athletic: 'athletic',
  money: 'money',
};

const signed = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

/** The explicit modifiers a trait applies, as tooltip lines (SPEC §2 visible mechanics). */
export function traitModifiers(t: Trait): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(t.drift))
    if (v) out.push(`${STAT_LABEL[k] ?? k} drift ${signed(v)} a year`);
  for (const [k, v] of Object.entries(t.eventWeight))
    if (v && v !== 1) out.push(`${k[0]?.toUpperCase()}${k.slice(1)} events ×${v}`);
  for (const [k, v] of Object.entries(t.odds))
    if (v) out.push(`${ODDS_LABEL[k] ?? k} success ${signed(Math.round(v * 100))}%`);
  if (t.excludes.length)
    out.push(
      `Can't be combined with: ${t.excludes.map((x) => TRAIT_BY_ID[x]?.label ?? x).join(', ')}`,
    );
  return out;
}

/** What a skill does at its current level (SPEC §2 visible mechanics, §5.12). */
export function skillModifiers(k: SkillDef, level: number): string[] {
  const out: string[] = [];
  for (const [d, v] of Object.entries(k.odds)) {
    if (!v) continue;
    const label = ODDS_LABEL[d] ?? d;
    const cap = Math.round(v * 100);
    out.push(
      `${label[0]?.toUpperCase()}${label.slice(1)} success ${signed(Math.round(v * level))}% (up to ${signed(cap)}% at 100)`,
    );
  }
  out.push('Practice gains shrink as you improve; it fades after two years without practice.');
  return out;
}

export function statLabel(k: string): string {
  return STAT_LABEL[k] ?? k;
}
