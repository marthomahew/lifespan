/**
 * Content validation (DONE §3, PLAN M4.5): schema, unique ids, tokens, references,
 * the adults-only rule, duplicate texts, and thresholds.
 */
import { EVENTS } from '../src/content/events';
import { TRAIT_BY_ID } from '../src/content/traits';
import { ILLNESS_BY_ID } from '../src/content/illnesses';
import { ACHIEVEMENT_BY_ID } from '../src/content/achievements';
import { SKILL_BY_ID } from '../src/content/skills';
import { COUNTRIES } from '../src/content/countries';
import { ALL_STATS, CATEGORIES, VICES } from '../src/engine/types';
import { bindingQueries, ROLES } from '../src/engine/events/select';
import { tokensIn } from '../src/engine/events/tokens';
import { PET_KINDS } from '../src/content/pets';
import { ERA_WORDS } from '../src/content/era';
import type { EventDef, Effect, OutcomeDef } from '../src/engine/events/types';
import { extraContent, type ExtraContent } from './content-extra';

export type Finding = { level: 'error'; where: string; msg: string };
export type Threshold = {
  label: string;
  value: number;
  min: number;
  max?: number;
  enforced: boolean;
};

const PLAYER_TOKENS = new Set(['first', 'last', 'age', 'city', 'country', 'countryThe', 'year']);
export const PET_TOKENS = new Set(['pet', 'pet.kind', ...PET_KINDS.map((k) => k.id)]);
/** The novel in progress (project events only). */
const PROJECT_TOKENS = new Set(['novel', 'business', 'fambiz', 'heritage']);
const NPC_FIELDS = new Set([
  'first',
  'last',
  'full',
  'they',
  'They',
  'them',
  'Them',
  'their',
  'Their',
  'rel',
  'Rel',
  'age',
  'job',
  'memory',
  'is',
  'has',
  's',
]);
const ID_RE = /^[a-z][a-z0-9_]*$/;
const STAT_SET = new Set<string>(ALL_STATS);
const VICE_SET = new Set<string>(VICES);
const CAT_SET = new Set<string>(CATEGORIES);
const ROLE_SET = new Set<string>(ROLES);

export type Stage = 'child' | 'teen' | 'young_adult' | 'adult' | 'middle_age' | 'senior';
export const STAGE_MIN: Record<Stage, number> = {
  child: 40,
  teen: 40,
  young_adult: 45,
  adult: 45,
  middle_age: 30,
  senior: 30,
};

/** DONE §3: an event counts toward the stage containing the midpoint of its ages; spans over 40 years count toward the total only. */
export function eventStage(e: EventDef): Stage | null {
  const [lo, hi] = e.ages ?? [0, 120];
  if (hi - lo > 40) return null;
  const mid = (lo + hi) / 2;
  if (mid < 13) return 'child';
  if (mid < 18) return 'teen';
  if (mid < 30) return 'young_adult';
  if (mid < 50) return 'adult';
  if (mid < 65) return 'middle_age';
  return 'senior';
}

function allOutcomes(e: EventDef): OutcomeDef[] {
  return [...(e.outcomes ?? []), ...(e.choices ?? []).flatMap((c) => c.outcomes)];
}

function effectRefs(
  e: Effect,
  where: string,
  f: Finding[],
  ctx: { events: Set<string>; extra: ExtraContent },
): void {
  const err = (msg: string): void => {
    f.push({ level: 'error', where, msg });
  };
  if ('stat' in e && !('npcStat' in e) && !STAT_SET.has(e.stat)) err(`unknown stat ${e.stat}`);
  if ('addTrait' in e && !TRAIT_BY_ID[e.addTrait]) err(`unknown trait ${e.addTrait}`);
  if ('removeTrait' in e && !TRAIT_BY_ID[e.removeTrait]) err(`unknown trait ${e.removeTrait}`);
  if ('illness' in e && !ILLNESS_BY_ID[e.illness]) err(`unknown illness ${e.illness}`);
  if ('cure' in e && !ILLNESS_BY_ID[e.cure]) err(`unknown illness ${e.cure}`);
  if ('achievement' in e && !ACHIEVEMENT_BY_ID[e.achievement])
    err(`unknown achievement ${e.achievement}`);
  if ('skill' in e && !SKILL_BY_ID[e.skill] && !e.skill.startsWith('lang:'))
    err(`unknown skill ${e.skill}`);
  if ('vice' in e && !VICE_SET.has(e.vice)) err(`unknown vice ${e.vice}`);
  if ('schedule' in e && !ctx.events.has(e.schedule)) err(`schedules unknown event ${e.schedule}`);
  if ('crime' in e && !ctx.extra.crimes.has(e.crime)) err(`unknown crime ${e.crime}`);
  if ('job' in e && e.jobId && !ctx.extra.jobs.has(e.jobId)) err(`unknown job ${e.jobId}`);
  if ('system' in e && e.system === 'hire' && e.arg && !ctx.extra.jobs.has(e.arg))
    err(`unknown job ${e.arg}`);
  if ('rel' in e && !e.memory) err(`relationship effect on ${e.rel} needs a memory line`);
  // Memories read as "{name} still thinks about …": "you" for the player, "them" for the person.
  if (
    'rel' in e &&
    e.memory &&
    /\b(I|me|my|mine|myself)\b/.test(e.memory.replace(/['"‘“][^'"’”]*['"’”]/g, ''))
  )
    err(`memory "${e.memory}" should say "them", not "I/me/my"`);
  if ('status' in e && e.role && !ROLE_SET.has(e.role)) err(`unknown role ${e.role}`);
  if ('money' in e && typeof e.money === 'number' && !Number.isFinite(e.money))
    err('money must be finite');
}

/** Follow-ups inherit their bindings, so a name must keep the same role across a chain. */
function chainRoleFindings(events: EventDef[]): Finding[] {
  const byId = new Map(events.map((e) => [e.id, e]));
  const out: Finding[] = [];
  for (const e of events) {
    const from = bindingQueries(e);
    for (const o of allOutcomes(e)) {
      const targets = [
        o.next?.eventId,
        ...o.effects.map((x) => ('schedule' in x ? x.schedule : undefined)),
      ].filter((x): x is string => !!x);
      for (const t of targets) {
        const next = byId.get(t);
        if (!next) continue;
        for (const [name, q] of Object.entries(bindingQueries(next))) {
          const orig = from[name];
          if (orig && orig.role !== q.role)
            out.push({
              level: 'error',
              where: `${e.id} -> ${t}`,
              msg: `binding ${name} is a ${orig.role} here but a ${q.role} in the follow-up`,
            });
        }
      }
    }
  }
  return out;
}

export function validateEvents(
  events: EventDef[],
  extra: ExtraContent = extraContent(),
): Finding[] {
  const f: Finding[] = [...chainRoleFindings(events)];
  const ids = new Set<string>();
  const texts = new Map<string, string>();
  const eventIds = new Set(events.map((e) => e.id));
  const ctx = { events: eventIds, extra };
  const seenText = (t: string, where: string): void => {
    const norm = t.toLowerCase().replace(/\s+/g, ' ').trim();
    if (norm.length < 12) return;
    const prev = texts.get(norm);
    if (prev) f.push({ level: 'error', where, msg: `duplicate text (also in ${prev}): ${t}` });
    else texts.set(norm, where);
  };

  for (const e of events) {
    const at = (s: string): string => `${e.id}${s}`;
    const err = (where: string, msg: string): void => {
      f.push({ level: 'error', where, msg });
    };
    if (!ID_RE.test(e.id)) err(e.id, 'id must be snake_case');
    if (ids.has(e.id)) err(e.id, 'duplicate id');
    ids.add(e.id);
    if (!CAT_SET.has(e.category)) err(e.id, `unknown category ${e.category}`);
    if (e.ages && (e.ages[0] > e.ages[1] || e.ages[0] < 0 || e.ages[1] > 120))
      err(e.id, `bad ages ${e.ages.join('-')}`);
    if (typeof e.weight === 'number' && (!Number.isFinite(e.weight) || e.weight < 0))
      err(e.id, 'bad weight');
    if (!e.text.trim()) err(e.id, 'empty text');
    if (e.text.length > 280) err(e.id, `text is ${e.text.length} characters (max 280)`);
    seenText(e.text, e.id);

    if (e.kind === 'choice') {
      const n = e.choices?.length ?? 0;
      if (n < 2 || n > 4) err(e.id, `choice events need 2–4 choices (has ${n})`);
      if (e.outcomes?.length) err(e.id, 'choice events carry outcomes on their choices');
      const cids = new Set<string>();
      for (const c of e.choices ?? []) {
        if (cids.has(c.id)) err(at(`.${c.id}`), 'duplicate choice id');
        cids.add(c.id);
        if (!c.label.trim()) err(at(`.${c.id}`), 'empty choice label');
        if (c.label.length > 60) err(at(`.${c.id}`), 'choice label too long (max 60)');
        if (!c.outcomes.length) err(at(`.${c.id}`), 'choice has no outcomes');
      }
    } else {
      if (e.choices?.length) err(e.id, 'notices have no choices');
      if (!e.outcomes?.length) err(e.id, 'notice has no outcomes');
    }

    // Tokens.
    const queries = bindingQueries(e);
    const tokenTexts: [string, string][] = [[e.id, e.text]];
    for (const c of e.choices ?? []) tokenTexts.push([at(`.${c.id}`), c.label]);
    allOutcomes(e).forEach((o, i) => {
      tokenTexts.push([at(`#${i}`), o.text]);
      (o.texts ?? []).forEach((v, j) => tokenTexts.push([at(`#${i}.${j}`), v]));
    });
    // Phones, apps and video calls only exist from the late 2000s.
    if (!(e.fromYear && e.fromYear >= 2005) && tokenTexts.some(([, t]) => ERA_WORDS.test(t)))
      err(e.id, 'mentions modern tech (an app, a video call...) without fromYear ≥ 2005');
    for (const [where, t] of tokenTexts) {
      // "watch{x.s}" renders "watchs": these verbs need rewording.
      const bad = /(ch|sh|ss|x|zz)\{[a-z]+\.s\}/.exec(t);
      if (bad) err(where, `"${bad[0]}" renders a verb without its -es`);
      // {x.rel} already says "your mother": "your {x.rel}" renders "your your mother".
      if (/\b[Yy]our \{[a-z]+\.[Rr]el\}/.test(t)) err(where, '"your {x.rel}" doubles the "your"');
      for (const tok of tokensIn(t)) {
        if (PLAYER_TOKENS.has(tok)) continue;
        if (/^money:\d+(\.\d+)?$/.test(tok)) continue;
        // Pet tokens; tests/content/pets-content.test.ts checks such events need a pet.
        if (PET_TOKENS.has(tok) || PROJECT_TOKENS.has(tok)) continue;
        if (
          /^money:\$[a-z_]+$/.test(tok) ||
          /^cash:\$[a-z_]+$/.test(tok) ||
          /^\$[a-z_]+$/.test(tok)
        ) {
          if (!e.chainOnly) err(where, `payload token {${tok}} outside a chain-only event`);
          continue;
        }
        const dot = tok.indexOf('.');
        if (dot > 0) {
          const name = tok.slice(0, dot);
          const field = tok.slice(dot + 1);
          if (!queries[name]) err(where, `token {${tok}} has no binding or role named ${name}`);
          if (!NPC_FIELDS.has(field)) err(where, `token {${tok}} uses unknown field ${field}`);
          if (field === 'memory' && !queries[name]?.hasMemory)
            err(where, `{${tok}} needs bind.${name}.hasMemory`);
          continue;
        }
        err(where, `unresolved token {${tok}}`);
      }
    }
    for (const q of Object.values(queries))
      if (!ROLE_SET.has(q.role)) err(e.id, `unknown role ${q.role}`);

    // Outcomes, effects, chains.
    allOutcomes(e).forEach((o, i) => {
      const where = at(`#${i}`);
      if (!o.text.trim()) err(where, 'empty outcome text');
      if (o.text.length > 280) err(where, 'outcome text over 280 characters');
      seenText(o.text, where);
      if (typeof o.chance === 'number' && (!Number.isFinite(o.chance) || o.chance < 0))
        err(where, 'bad chance');
      for (const ef of o.effects) effectRefs(ef, where, f, ctx);
      if (o.next) {
        if (!eventIds.has(o.next.eventId)) err(where, `chain to unknown event ${o.next.eventId}`);
        const lo = typeof o.next.inYears === 'number' ? o.next.inYears : o.next.inYears[0];
        if (lo < 1) err(where, 'chain steps must be at least 1 year later');
      }
      for (const ef of o.effects) {
        if ('schedule' in ef) {
          const lo = typeof ef.inYears === 'number' ? ef.inYears : ef.inYears[0];
          if (lo < 1) err(where, 'scheduled steps must be at least 1 year later');
        }
        // Romance status changes are adults-only.
        if (
          'status' in ef &&
          ['meet', 'marry', 'birth', 'breakup', 'divorce'].includes(ef.status) &&
          !isAdultsOnly(e)
        ) {
          err(where, `${ef.status} needs an adults-only event (ages 18+)`);
        }
        // Teen going-out is for peers only: a teen event, and everyone in it 14–17.
        if ('status' in ef && ef.status === 'sweetheart') {
          const [lo, hi] = e.ages ?? [0, 120];
          if (lo < 14 || hi > 17 || e.adultsOnly || e.category === 'romance')
            err(where, 'sweetheart events are teen social events (ages 14–17)');
          for (const [name, q] of Object.entries(queries))
            if ((q.minAge ?? 0) < 14 || (q.maxAge ?? 120) > 17)
              err(where, `sweetheart binding ${name} needs ages 14–17`);
        }
      }
    });

    // Adults-only rule: romance events require the player and every bound NPC to be 18+.
    if (e.category === 'romance' || e.adultsOnly) {
      if (!e.adultsOnly) err(e.id, 'romance events must set adultsOnly: true');
      if (!e.ages || e.ages[0] < 18)
        err(e.id, 'adults-only events need ages starting at 18 or later');
      for (const [name, q] of Object.entries(queries)) {
        if ((q.minAge ?? 0) < 18) err(e.id, `adults-only binding ${name} needs minAge >= 18`);
      }
    }
  }
  return f;
}

function isAdultsOnly(e: EventDef): boolean {
  return e.adultsOnly === true && (e.ages?.[0] ?? 0) >= 18;
}

/** Chains: connected groups of 2+ events linked by `next`/`schedule`. */
export function countChains(events: EventDef[]): number {
  const links = new Map<string, Set<string>>();
  const add = (a: string, b: string): void => {
    if (!links.has(a)) links.set(a, new Set());
    if (!links.has(b)) links.set(b, new Set());
    links.get(a)?.add(b);
    links.get(b)?.add(a);
  };
  for (const e of events) {
    for (const o of allOutcomes(e)) {
      if (o.next) add(e.id, o.next.eventId);
      for (const ef of o.effects) if ('schedule' in ef) add(e.id, ef.schedule);
    }
  }
  const seen = new Set<string>();
  let chains = 0;
  for (const start of links.keys()) {
    if (seen.has(start)) continue;
    const stack = [start];
    let size = 0;
    while (stack.length) {
      const x = stack.pop() as string;
      if (seen.has(x)) continue;
      seen.add(x);
      size++;
      for (const y of links.get(x) ?? []) stack.push(y);
    }
    if (size >= 2) chains++;
  }
  return chains;
}

export function validateCountries(): Finding[] {
  const f: Finding[] = [];
  const ids = new Set<string>();
  for (const c of COUNTRIES) {
    const err = (msg: string): void => {
      f.push({ level: 'error', where: `country ${c.id}`, msg });
    };
    if (ids.has(c.id)) err('duplicate id');
    ids.add(c.id);
    const uniq = (xs: string[]): boolean => new Set(xs).size === xs.length;
    if (c.names.male.length < 25 || !uniq(c.names.male)) err('needs 25+ unique male names');
    if (c.names.female.length < 25 || !uniq(c.names.female)) err('needs 25+ unique female names');
    if (c.names.last.length < 30 || !uniq(c.names.last)) err('needs 30+ unique surnames');
    if (c.cities.length < 5) err('needs 5+ cities');
    if (!(c.currency.perUsd > 0) || !c.currency.code || !c.currency.symbol)
      err('incomplete currency');
    if (!(c.priceLevel > 0) || !(c.wageLevel > 0)) err('price and wage levels must be positive');
    if (c.taxBands.length < 3 || c.taxBands.length > 5 || c.taxBands.at(-1)?.upTo !== null)
      err('needs 3–5 tax bands ending uncapped');
    for (const k of [
      'drinking',
      'driving',
      'marriage',
      'voting',
      'schoolLeaving',
      'enlist',
      'retirement',
    ] as const) {
      if (!Number.isFinite(c.ages[k]) || c.ages[k] < 10 || c.ages[k] > 80) err(`bad age ${k}`);
    }
    if (!(c.sentencing > 0) || !(c.mortgageRate > 0) || !(c.pensionPerYear >= 0))
      err('incomplete law/economy data');
    if (!c.languages.length) err('needs a language');
  }
  return f;
}

export function thresholds(
  enforce: Set<string>,
  extra: ExtraContent = extraContent(),
): Threshold[] {
  const out: Threshold[] = [];
  const t = (key: string, label: string, value: number, min: number, max?: number): void => {
    const item: Threshold = { label, value, min, enforced: enforce.has(key) };
    if (max !== undefined) item.max = max;
    out.push(item);
  };
  const random = EVENTS;
  t('events80', 'Events (first pack, M4.6)', random.length, 80);
  t('events', 'Events in total', random.length, 250);
  for (const [stage, min] of Object.entries(STAGE_MIN)) {
    t(
      'stages',
      `Events: ${stage.replace('_', ' ')}`,
      random.filter((e) => eventStage(e) === stage).length,
      min,
    );
  }
  const notices = random.filter((e) => e.kind === 'notice').length;
  t(
    'noticeShare',
    'Notice-only share of events (%)',
    random.length ? Math.round((1000 * notices) / random.length) / 10 : 0,
    0,
    25,
  );
  t('chains', 'Event chains', countChains(random), 15);
  for (const x of extra.thresholds) t(x.key, x.label, x.value, x.min);
  t('countries', 'Countries', COUNTRIES.length, 12);
  return out;
}

export function failedThresholds(ts: Threshold[]): Threshold[] {
  return ts.filter((x) => x.value < x.min || (x.max !== undefined && x.value > x.max));
}

const ROMANCE_SPECIALS = new Set(['propose', 'wedding', 'therapy', 'baby', 'breakup', 'divorce']);

/** DONE §3: interactions are token-checked, de-duplicated, and romance ones need everyone 18+. */
export function validateInteractions(
  list: import('../src/content/types').InteractionDef[],
): Finding[] {
  const f: Finding[] = [];
  const seen = new Map<string, string>();
  for (const d of list) {
    const err = (msg: string): void => {
      f.push({ level: 'error', where: `interaction ${d.id}`, msg });
    };
    const romance =
      (d.special && ROMANCE_SPECIALS.has(d.special)) ||
      ['partner', 'spouse', 'engaged'].includes(d.target);
    if (romance && (!d.adultsOnly || d.minPlayerAge < 18 || d.minNpcAge < 18))
      err('romance interactions need adultsOnly with player and NPC 18+');
    for (const t of [...d.success.texts, ...d.failure.texts]) {
      for (const tok of tokensIn(t)) {
        const dot = tok.indexOf('.');
        if (dot < 0 || tok.slice(0, dot) !== 'npc' || !NPC_FIELDS.has(tok.slice(dot + 1)))
          err(`unresolved token {${tok}}`);
      }
      const norm = t.toLowerCase().trim();
      const prev = seen.get(norm);
      if (prev) err(`duplicate text (also in ${prev})`);
      seen.set(norm, d.id);
    }
    if (!d.success.memory || !d.failure.memory) err('needs memory lines');
  }
  return f;
}

/** Activities: 3+ outcome texts, tokens, duplicates, and the adults-only rule for love and meeting people. */
export function validateActivities(
  list: import('../src/content/types').ActivityDef[],
  extra: ExtraContent = extraContent(),
): Finding[] {
  const f: Finding[] = [];
  const seen = new Map<string, string>();
  const ctx = { events: new Set(EVENTS.map((e) => e.id)), extra };
  for (const a of list) {
    const err = (msg: string): void => {
      f.push({ level: 'error', where: `activity ${a.id}`, msg });
    };
    if (a.outcomes.length < 3) err('needs at least 3 outcome texts');
    const meets = a.outcomes.some((o) =>
      o.effects.some(
        (e) => 'status' in e && ['meet', 'marry', 'birth', 'adopt'].includes(e.status),
      ),
    );
    const romance = a.group === 'love' || meets || ['fertility', 'adopt'].includes(a.special ?? '');
    if (romance && (!a.adultsOnly || a.ages[0] < 18))
      err('love activities need adultsOnly and ages from 18');
    for (const o of a.outcomes) {
      for (const tok of tokensIn(o.text))
        if (!PLAYER_TOKENS.has(tok) && !/^money:\d+$/.test(tok)) err(`unresolved token {${tok}}`);
      const norm = o.text.toLowerCase().trim();
      const prev = seen.get(norm);
      if (prev) err(`duplicate text (also in ${prev})`);
      seen.set(norm, a.id);
      for (const e of o.effects) effectRefs(e, `activity ${a.id}`, f, ctx);
    }
  }
  return f;
}

/** Every DONE §3 threshold is enforced. */
export const ENFORCED = new Set([
  'events80',
  'events',
  'stages',
  'noticeShare',
  'chains',
  'countries',
  'jobs',
  'majors',
  'military',
  'interactions',
  'activities',
  'illnesses',
  'traits',
  'achievements',
  'crimes',
  'assets',
  'cheats',
]);

/** SPEC §5.8: mental illness is treated respectfully and is never a cause of death. */
export function validateIllnesses(list: import('../src/content/types').IllnessDef[]): Finding[] {
  return list
    .filter((i) => i.mental && i.deathFactor !== 0)
    .map((i) => ({
      level: 'error' as const,
      where: `illness ${i.id}`,
      msg: 'mental illnesses must have deathFactor 0',
    }));
}
