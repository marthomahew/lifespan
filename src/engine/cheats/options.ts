import { CATEGORIES, ALL_STATS, VICES, type GameState } from '../types';
import { TRAITS } from '../../content/traits';
import { SKILLS, LANGUAGES } from '../../content/skills';
import { SKIN_TONES } from '../../content/family';
import { EVENTS } from '../../content/events';
import { ILLNESSES } from '../../content/illnesses';
import { COUNTRIES } from '../../content/countries';

type Opt = { value: string; label: string };
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

export const statOptions = (): Opt[] => ALL_STATS.map((k) => ({ value: k, label: cap(k) }));
export const traitOptions = (): Opt[] =>
  TRAITS.map((t) => ({ value: t.id, label: `${t.emoji} ${t.label}` }));
export const ownTraitOptions = (s: GameState): Opt[] =>
  s.player.traits.map((t) => ({ value: t, label: cap(t) }));
export const skillOptions = (): Opt[] =>
  SKILLS.map((k) => ({ value: k.id, label: `${k.emoji} ${k.label}` }));
export const languageOptions = (): Opt[] => LANGUAGES.map((l) => ({ value: l.id, label: l.label }));
export const genderOptions = (): Opt[] =>
  ['male', 'female', 'nonbinary'].map((g) => ({ value: g, label: cap(g) }));
export const attractionOptions = (): Opt[] =>
  ['men', 'women', 'everyone'].map((g) => ({ value: g, label: cap(g) }));
export const toneOptions = (): Opt[] =>
  SKIN_TONES.map((t, i) => ({ value: String(i), label: `🧑${t}` }));
export const eventOptions = (): Opt[] => EVENTS.map((e) => ({ value: e.id, label: e.id }));
export const categoryOptions = (): Opt[] => CATEGORIES.map((c) => ({ value: c, label: cap(c) }));
export const viceOptions = (): Opt[] => VICES.map((v) => ({ value: v, label: cap(v) }));
export const illnessOptions = (): Opt[] =>
  ILLNESSES.map((i) => ({ value: i.id, label: `${i.emoji} ${i.label}` }));
export const countryOptions = (): Opt[] =>
  COUNTRIES.map((c) => ({ value: c.id, label: `${c.flag} ${c.name}` }));
export const npcOptions = (s: GameState): Opt[] =>
  s.npcs.map((n) => ({
    value: String(n.id),
    label: `${n.id}: ${n.first} ${n.last} (${n.roles[0] ?? '?'}${n.alive ? '' : ', dead'})`,
  }));
