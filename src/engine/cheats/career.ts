import { GRAD_PROGRAMS, MAJORS } from '../../content/education';
import { JOB_BY_ID, JOBS } from '../../content/jobs';
import {
  BRANCHES,
  DISCHARGES,
  ENLISTED_RANKS,
  OFFICER_RANKS,
  SPECIALTIES,
} from '../../content/military';
import type { Degree } from '../types';
import { formatMoney } from '../economy';
import { clampStat } from '../util';
import { endJob, hire, promote, retire } from '../systems/careers';
import { discharge, enlist, rankTitle } from '../systems/military';
import type { CheatDef } from './types';

const LEVELS: Degree['level'][] = [
  'high_school',
  'associate',
  'bachelor',
  'master',
  'doctorate',
  'law',
  'medicine',
  'mba',
];

export const CAREER_CHEATS: CheatDef[] = [
  {
    id: 'degree.grant',
    group: 'career',
    label: 'Grant a degree',
    syntax: 'degree {level} {field}',
    help: 'Add any degree. Example: degree bachelor computer_science',
    params: [
      {
        name: 'level',
        type: 'enum',
        options: () => LEVELS.map((l) => ({ value: l, label: l.replace('_', ' ') })),
      },
      {
        name: 'field',
        type: 'enum',
        optional: true,
        options: () => [
          ...MAJORS.map((m) => ({ value: m.id, label: m.label })),
          ...GRAD_PROGRAMS.map((g) => ({ value: g.id, label: g.label })),
        ],
      },
    ],
    run: (ctx, p) => {
      const level = p['level'] as Degree['level'];
      const field = String(p['field'] ?? (level === 'high_school' ? 'general' : level));
      if (
        level !== 'high_school' &&
        !ctx.s.education.degrees.some((d) => d.level === 'high_school')
      )
        ctx.s.education.degrees.push({
          level: 'high_school',
          field: 'general',
          gpa: 3,
          year: ctx.s.year,
        });
      ctx.s.education.degrees.push({ level, field, gpa: 3.5, year: ctx.s.year });
      if (level === 'medicine') ctx.s.education.residency = 0;
      return `Granted ${level.replace('_', ' ')}${field !== level ? ` in ${field}` : ''}`;
    },
  },
  {
    id: 'job.set',
    group: 'career',
    label: 'Set job and level',
    syntax: 'job set {job} {level}',
    help: 'Start any job at any level, requirements ignored. Example: job set doctor 2',
    params: [
      {
        name: 'job',
        type: 'enum',
        options: () => JOBS.map((j) => ({ value: j.id, label: `${j.titles[0]} (${j.field})` })),
      },
      { name: 'level', type: 'int', min: 0, max: 4, optional: true },
    ],
    run: (ctx, p) => {
      const job = JOB_BY_ID[String(p['job'])];
      if (!job) return 'No such job';
      hire(ctx, job.id, true);
      if (!job.partTime) {
        ctx.s.education.residency = 0;
        const target = Math.min(job.titles.length - 1, Number(p['level'] ?? 0));
        while (ctx.s.career.level < target) promote(ctx, job);
      }
      return `You are now ${job.titles[ctx.s.career.level] ?? job.titles[0]}`;
    },
  },
  {
    id: 'job.promote',
    group: 'career',
    label: 'Promote',
    syntax: 'promote',
    help: 'Move up one level in your job.',
    params: [],
    run: (ctx) => {
      const job = ctx.s.career.jobId ? JOB_BY_ID[ctx.s.career.jobId] : undefined;
      if (!job) return 'You have no job';
      if (ctx.s.career.level >= job.titles.length - 1) return 'Already at the top';
      promote(ctx, job);
      return `Now ${job.titles[ctx.s.career.level]}`;
    },
  },
  {
    id: 'job.demote',
    group: 'career',
    label: 'Demote',
    syntax: 'demote',
    help: 'Move down one level.',
    params: [],
    run: (ctx) => {
      const c = ctx.s.career;
      const job = c.jobId ? JOB_BY_ID[c.jobId] : undefined;
      if (!job) return 'You have no job';
      if (c.level === 0) return 'Already at the bottom';
      c.level -= 1;
      c.salary = Math.round(c.salary * 0.85);
      const rec = c.history.at(-1);
      if (rec) rec.title = job.titles[c.level] ?? rec.title;
      return `Now ${job.titles[c.level]}`;
    },
  },
  {
    id: 'performance.set',
    group: 'career',
    label: 'Set performance',
    syntax: 'performance {value}',
    help: 'Set job performance 0–100.',
    params: [{ name: 'value', type: 'int', min: 0, max: 100 }],
    run: (ctx, p) => {
      ctx.s.career.performance = clampStat(Number(p['value']));
      return `Performance: ${ctx.s.career.performance}`;
    },
  },
  {
    id: 'military.set',
    group: 'career',
    label: 'Set military branch, specialty and rank',
    syntax: 'military {branch} {specialty} {rank}',
    help: 'Put yourself in uniform at any rank, counting from 0. Ranks past the nine enlisted grades are officer ranks (9 = Second Lieutenant).',
    params: [
      {
        name: 'branch',
        type: 'enum',
        options: () => BRANCHES.map((b) => ({ value: b, label: b })),
      },
      {
        name: 'specialty',
        type: 'enum',
        options: () => SPECIALTIES.map((x) => ({ value: x.id, label: x.label })),
      },
      {
        name: 'rank',
        type: 'int',
        min: 0,
        max: ENLISTED_RANKS.length + OFFICER_RANKS.length - 1,
        optional: true,
      },
    ],
    run: (ctx, p) => {
      const s = ctx.s;
      const rank = Number(p['rank'] ?? 0);
      const officer = rank >= ENLISTED_RANKS.length;
      if (!s.military?.active) {
        if (s.player.age < 16) return 'Too young to serve';
        enlist(ctx, String(p['branch']), String(p['specialty']), officer, 'cheat');
      }
      const m = s.military;
      if (!m) return 'Could not enlist';
      m.branch = String(p['branch']);
      m.specialty = String(p['specialty']);
      m.officer = officer;
      m.rank = officer ? rank - ENLISTED_RANKS.length : rank;
      return `${rankTitle(s)}, ${m.branch}`;
    },
  },
  {
    id: 'discharge.set',
    group: 'career',
    label: 'Set discharge type',
    syntax: 'discharge {type}',
    help: 'Leave the military now with any discharge type.',
    params: [
      {
        name: 'type',
        type: 'enum',
        options: () => DISCHARGES.map((d) => ({ value: d, label: d })),
      },
    ],
    run: (ctx, p) => {
      if (!ctx.s.military?.active) {
        if (!ctx.s.military) return 'You never served';
        ctx.s.military.discharge = String(p['type']);
        ctx.s.education.veteranBenefit = ['honorable', 'general'].includes(String(p['type']));
        return `Discharge changed to ${String(p['type'])}`;
      }
      discharge(ctx, String(p['type']));
      return `Discharged: ${String(p['type'])}`;
    },
  },
  {
    id: 'retire.now',
    group: 'career',
    label: 'Retire now',
    syntax: 'retire now',
    help: 'Retire today with your pension, whatever your age.',
    params: [],
    run: (ctx) => {
      if (!ctx.s.career.jobId) return 'You have no job';
      if (ctx.s.player.age < 50) {
        const age = ctx.s.player.age;
        ctx.s.player.age = 50;
        retire(ctx);
        ctx.s.player.age = age;
      } else retire(ctx);
      return `Retired on ${formatMoney(ctx.s, ctx.s.career.pension)} a year`;
    },
  },
  {
    id: 'job.quit',
    group: 'career',
    label: 'Leave your job',
    syntax: 'job quit',
    help: 'End your current job immediately.',
    params: [],
    run: (ctx) => {
      if (!ctx.s.career.jobId) return 'You have no job';
      endJob(ctx, 'quit');
      return 'You are unemployed';
    },
  },
];
