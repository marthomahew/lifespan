import { escapePrison, imprison } from '../systems/crime';
import { addIllness } from '../systems/illness';
import type { ViceKey } from '../types';
import { clampStat } from '../util';
import type { CheatDef } from './types';
import { illnessOptions, viceOptions } from './options';
import { addInjury } from '../systems/injuries';
import { release } from '../systems/crime';

export const HEALTH_CHEATS: CheatDef[] = [
  {
    id: 'cure.all',
    group: 'health',
    label: 'Cure everything',
    syntax: 'cure all',
    help: 'Remove every illness and injury and top up Health.',
    params: [],
    run: (ctx) => {
      ctx.s.health.illnesses = [];
      ctx.s.health.injuries = 0;
      ctx.s.health.injuryList = [];
      ctx.s.player.stats.health = Math.max(ctx.s.player.stats.health, 90);
      return 'Cured';
    },
  },
  {
    id: 'illness.add',
    group: 'health',
    label: 'Add an illness',
    syntax: 'illness add {illness}',
    help: 'Give yourself an illness from the catalog.',
    params: [{ name: 'illness', type: 'enum', options: illnessOptions }],
    run: (ctx, p) => {
      addIllness(ctx, String(p['illness']));
      return `Added ${String(p['illness'])}`;
    },
  },
  {
    id: 'injury.add',
    group: 'health',
    label: 'Add an injury',
    syntax: 'injury add {severity}',
    help: 'Hurt yourself: 6–11 is minor, 12–19 major, 20+ serious. Example: injury add 15',
    params: [{ name: 'severity', type: 'int', min: 6, max: 40 }],
    run: (ctx, p) => {
      addInjury(ctx, Number(p['severity']));
      const i = ctx.s.health.injuryList.at(-1);
      return i ? `Added a ${i.tier} injury: ${i.kind}` : 'Added an injury';
    },
  },
  {
    id: 'addiction.set',
    group: 'health',
    label: 'Set an addiction level',
    syntax: 'addiction {vice} {value}',
    help: 'Set a vice addiction meter 0–100.',
    params: [
      { name: 'vice', type: 'enum', options: viceOptions },
      { name: 'value', type: 'int', min: 0, max: 100 },
    ],
    run: (ctx, p) => {
      const v = p['vice'] as ViceKey;
      ctx.s.vices.levels[v] = clampStat(Number(p['value']));
      return `${v} addiction: ${ctx.s.vices.levels[v]}`;
    },
  },
  {
    id: 'record.clear',
    group: 'health',
    label: 'Clear criminal record',
    syntax: 'record clear',
    help: 'Wipe your criminal record and any open case.',
    params: [],
    run: (ctx) => {
      ctx.s.legal.record = [];
      ctx.s.legal.case = null;
      ctx.s.player.stats.notoriety = 0;
      return 'Record cleared';
    },
  },
  {
    id: 'prison.release',
    group: 'health',
    label: 'Release from prison',
    syntax: 'release',
    help: 'Walk out of prison today.',
    params: [],
    run: (ctx) => {
      if (!ctx.s.legal.prison) return 'You are not in prison';
      // The real release: housing, the ex-con record, cellmates who might look you up.
      release(ctx, false);
      ctx.log('crime', '🎩 The gates open. Nobody asks questions.');
      return 'Released';
    },
  },
  {
    id: 'sentence.set',
    group: 'health',
    label: 'Set sentence',
    syntax: 'sentence {years}',
    help: 'Change the years left on your sentence (0 releases you).',
    params: [{ name: 'years', type: 'int', min: 0, max: 99 }],
    run: (ctx, p) => {
      const pr = ctx.s.legal.prison;
      if (!pr) return 'You are not in prison';
      const left = Number(p['years']);
      if (left === 0) {
        ctx.s.legal.prison = null;
        if (ctx.s.assets.housing === 'prison') ctx.s.assets.housing = 'renting';
        return 'Released';
      }
      pr.years = pr.served + left;
      return `${left} years left`;
    },
  },
  {
    id: 'prison.send',
    group: 'health',
    label: 'Go to prison',
    syntax: 'prison send {years}',
    help: 'Start a prison sentence now, no trial needed. Example: prison send 5',
    params: [{ name: 'years', type: 'int', min: 1, max: 60 }],
    run: (ctx, p) => {
      if (ctx.s.legal.prison) return 'You are already in prison';
      if (ctx.s.player.age < 10) return 'Too young for prison';
      imprison(ctx, 'burglary', Number(p['years']));
      return `Sentenced to ${Number(p['years'])} years`;
    },
  },
  {
    id: 'prison.escape',
    group: 'health',
    label: 'Escape from prison',
    syntax: 'prison escape',
    help: 'Over the fence, no plan needed. You will be on the run.',
    params: [],
    run: (ctx) => {
      if (!ctx.s.legal.prison) return 'You are not in prison';
      escapePrison(ctx);
      return 'Escaped';
    },
  },
  {
    id: 'probation.end',
    group: 'health',
    label: 'End probation',
    syntax: 'probation end',
    help: 'Finish any probation immediately.',
    params: [],
    run: (ctx) => {
      ctx.s.legal.probation = 0;
      return 'Probation over';
    },
  },
];
