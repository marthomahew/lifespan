import { skinFromTone } from '../look';
import { SKIN_TONES } from '../../content/family';
import { TRAIT_BY_ID } from '../../content/traits';
import { GIFTS } from '../../content/gifts';
import { setStat } from '../stats';
import type { Attraction, Gender, StatKey } from '../types';
import { clampStat } from '../util';
import type { CheatDef } from './types';
import {
  attractionOptions,
  genderOptions,
  languageOptions,
  ownTraitOptions,
  skillOptions,
  statOptions,
  toneOptions,
  traitOptions,
} from './options';

const stat = { name: 'stat', type: 'enum', options: statOptions } as const;
const value = { name: 'value', type: 'int', min: 0, max: 100 } as const;

function setter(id: string, key: StatKey, label: string): CheatDef {
  return {
    id,
    group: 'character',
    label,
    syntax: `${key} {value}`,
    help: `Set ${key} (0–100).`,
    params: [value],
    run: (ctx, p) => {
      setStat(ctx.s, key, Number(p['value']));
      return `${label}: ${ctx.s.player.stats[key]}`;
    },
  };
}

export const CHARACTER_CHEATS: CheatDef[] = [
  {
    id: 'stat.set',
    group: 'character',
    label: 'Set a stat',
    syntax: 'stat {stat} {value}',
    help: 'Set any stat, visible or hidden, to 0–100. Example: stat health 100',
    params: [stat, value],
    run: (ctx, p) => {
      const k = p['stat'] as StatKey;
      setStat(ctx.s, k, Number(p['value']));
      if (ctx.s.cheats.locks[k] !== undefined) ctx.s.cheats.locks[k] = ctx.s.player.stats[k];
      return `${k} is now ${ctx.s.player.stats[k]}`;
    },
  },
  {
    id: 'stat.lock',
    group: 'character',
    label: 'Lock a stat',
    syntax: 'lock {stat} {value}',
    help: 'Pin a stat at a value (default: its current value) until unlocked.',
    params: [stat, { name: 'value', type: 'int', min: 0, max: 100, optional: true }],
    run: (ctx, p) => {
      const k = p['stat'] as StatKey;
      const v = p['value'] === undefined ? ctx.s.player.stats[k] : clampStat(Number(p['value']));
      ctx.s.cheats.locks[k] = v;
      ctx.s.player.stats[k] = v;
      return `${k} locked at ${v}`;
    },
  },
  {
    id: 'stat.unlock',
    group: 'character',
    label: 'Unlock a stat',
    syntax: 'unlock {stat}',
    help: 'Release a locked stat.',
    params: [stat],
    run: (ctx, p) => {
      const k = p['stat'] as StatKey;
      delete ctx.s.cheats.locks[k];
      return `${k} unlocked`;
    },
  },
  {
    id: 'rename',
    group: 'character',
    label: 'Rename',
    syntax: 'rename {first} {last}',
    help: 'Change your first and last name. Example: rename Ada "Byron King"',
    params: [
      { name: 'first', type: 'string', maxLength: 40 },
      { name: 'last', type: 'string', maxLength: 40 },
    ],
    run: (ctx, p) => {
      ctx.s.player.first = String(p['first']);
      ctx.s.player.last = String(p['last']);
      return `You are now ${ctx.s.player.first} ${ctx.s.player.last}`;
    },
  },
  {
    id: 'gender',
    group: 'character',
    label: 'Set gender',
    syntax: 'gender {gender}',
    help: 'male, female, or nonbinary.',
    params: [{ name: 'gender', type: 'enum', options: genderOptions }],
    run: (ctx, p) => {
      ctx.s.player.gender = p['gender'] as Gender;
      return `Gender: ${ctx.s.player.gender}`;
    },
  },
  {
    id: 'attraction',
    group: 'character',
    label: 'Set attraction',
    syntax: 'attraction {attraction}',
    help: 'men, women, or everyone.',
    params: [{ name: 'attraction', type: 'enum', options: attractionOptions }],
    run: (ctx, p) => {
      ctx.s.player.attraction = p['attraction'] as Attraction;
      return `Attracted to ${ctx.s.player.attraction}`;
    },
  },
  {
    id: 'appearance',
    group: 'character',
    label: 'Set appearance',
    syntax: 'appearance {tone}',
    help: 'Skin tone 0–5 (0 keeps the portrait as it is; 1 lightest, 5 darkest).',
    params: [{ name: 'tone', type: 'enum', options: toneOptions }],
    run: (ctx, p) => {
      const tone = SKIN_TONES[Number(p['tone'])] ?? '';
      ctx.s.player.appearance = tone;
      if (tone) ctx.s.player.look = { ...ctx.s.player.look, skin: skinFromTone(tone) };
      return 'Appearance updated';
    },
  },
  {
    id: 'trait.add',
    group: 'character',
    label: 'Add a trait',
    syntax: 'trait add {trait}',
    help: 'Add a trait; conflicting traits are removed.',
    params: [{ name: 'trait', type: 'enum', options: traitOptions }],
    run: (ctx, p) => {
      const t = TRAIT_BY_ID[String(p['trait'])];
      if (!t) return 'No such trait';
      const pl = ctx.s.player;
      pl.traits = pl.traits.filter((x) => x !== t.id && !t.excludes.includes(x));
      pl.traits.push(t.id);
      return `Added ${t.label}`;
    },
  },
  {
    id: 'trait.remove',
    group: 'character',
    label: 'Remove a trait',
    syntax: 'trait remove {trait}',
    help: 'Remove one of your traits.',
    params: [{ name: 'trait', type: 'enum', options: ownTraitOptions }],
    run: (ctx, p) => {
      ctx.s.player.traits = ctx.s.player.traits.filter((x) => x !== p['trait']);
      return `Removed ${String(p['trait'])}`;
    },
  },
  {
    id: 'gift.add',
    group: 'character',
    label: 'Give yourself a gift',
    syntax: 'gift {gift}',
    help: 'Add a pick-only gift mid-life: quick study, or luck with money, work, sport, music, crime or business, or a charmed life.',
    params: [
      {
        name: 'gift',
        type: 'enum',
        options: () => GIFTS.map((g) => ({ value: g.id, label: `${g.emoji} ${g.label}` })),
      },
    ],
    run: (ctx, p) => {
      const id = String(p['gift']);
      if (!GIFTS.some((g) => g.id === id)) return 'Unknown gift';
      const g = ctx.s.player.gifts ?? [];
      if (!g.includes(id)) ctx.s.player.gifts = [...g, id];
      return `Gift: ${id}`;
    },
  },
  {
    id: 'skill.set',
    group: 'character',
    label: 'Set a skill',
    syntax: 'skill {skill} {value}',
    help: 'Set a skill to 0–100. Example: skill instrument 80',
    params: [{ name: 'skill', type: 'enum', options: skillOptions }, value],
    run: (ctx, p) => {
      const id = String(p['skill']);
      ctx.s.player.skills[id] = clampStat(Number(p['value']));
      ctx.s.player.skillPractice[id] = ctx.s.year;
      return `${id}: ${ctx.s.player.skills[id]}`;
    },
  },
  {
    id: 'chess.rating',
    group: 'character',
    label: 'Set chess rating',
    syntax: 'chess rating {rating}',
    help: 'Set your chess rating (titles follow on your next event). Example: chess rating 2700',
    params: [{ name: 'rating', type: 'int', min: 100, max: 3000 }],
    run: (ctx, p) => {
      const rating = Number(p['rating']);
      const rec = (ctx.s.chess ??= {
        rating,
        best: rating,
        title: null,
        imNorms: 0,
        gmNorms: 0,
        events: 0,
        wins: 0,
        recent: [],
      });
      rec.rating = rating;
      rec.best = Math.max(rec.best, rating);
      return `Chess rating: ${rating}`;
    },
  },
  {
    id: 'grade.set',
    group: 'character',
    label: 'Set school average',
    syntax: 'grade {value}',
    help: 'Set your school average, 0–100 (universities want 70). Example: grade 85',
    params: [value],
    run: (ctx, p) => {
      ctx.s.education.grade = clampStat(Number(p['value']));
      return `School average: ${ctx.s.education.grade}`;
    },
  },
  {
    id: 'language.set',
    group: 'character',
    label: 'Set language fluency',
    syntax: 'language {language} {value}',
    help: 'Set fluency 0–100 in a language. Example: language japanese 90',
    params: [{ name: 'language', type: 'enum', options: languageOptions }, value],
    run: (ctx, p) => {
      const id = String(p['language']);
      ctx.s.player.languages[id] = clampStat(Number(p['value']));
      return `${id} fluency: ${ctx.s.player.languages[id]}`;
    },
  },
  setter('fame.set', 'fame', 'Fame'),
  setter('notoriety.set', 'notoriety', 'Notoriety'),
  setter('karma.set', 'karma', 'Karma'),
];
