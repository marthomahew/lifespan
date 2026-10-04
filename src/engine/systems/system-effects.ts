import { BRANCHES, SPECIALTIES } from '../../content/military';
import type { Ctx } from '../ctx';
import { addStat } from '../stats';
import type { ChainPayload } from '../types';
import { hire } from './careers';
import { discharge, enlist } from './military';
import { signRecordDeal } from './music';

const LABELS = [
  'Gravel Hill Records',
  'Lanternfish Music',
  'Northbound Sound',
  'Pocket Moon Records',
  'Tin Roof Recordings',
];

/** Effects that hand off to a system: hiring after an interview, conscription, record deals... */
export function applySystemEffect(
  ctx: Ctx,
  kind: string,
  arg: string | undefined,
  payload: ChainPayload,
): void {
  const s = ctx.s;
  switch (kind) {
    case 'hire': {
      const jobId = arg ?? (typeof payload['jobId'] === 'string' ? payload['jobId'] : undefined);
      if (jobId) hire(ctx, jobId);
      return;
    }
    case 'conscript': {
      const branch =
        arg && (BRANCHES as readonly string[]).includes(arg) ? arg : ctx.rng.pick(BRANCHES);
      enlist(ctx, branch, ctx.rng.pick(SPECIALTIES).id, false, 'conscript');
      return;
    }
    case 'sign_label':
      signRecordDeal(ctx, arg ?? ctx.rng.pick(LABELS));
      return;
    case 'dishonorable':
      if (s.military?.active) discharge(ctx, 'dishonorable');
      return;
    case 'injury_discharge':
      if (s.military?.active) discharge(ctx, 'honorable');
      return;
    case 'therapy':
      addStat(s, 'stress', -12);
      addStat(s, 'happiness', 5);
      return;
  }
}
