import { botStep, newBotMemory } from '../bot/persona';
import { Rng, seedRng } from '../rng';
import { deserialize, serialize } from '../save';
import type { CheatDef } from './types';

export const DEBUG_CHEATS: CheatDef[] = [
  {
    id: 'state.replace',
    group: 'debug',
    label: 'Replace the state (validated JSON)',
    syntax: 'state replace {json}',
    help: 'Replace the whole state with edited JSON. It is validated first; invalid JSON is refused.',
    params: [{ name: 'json', type: 'string', maxLength: 50_000_000 }],
    run: (ctx, p) => {
      const next = deserialize(String(p['json']));
      const draft = ctx.s as unknown as Record<string, unknown>;
      for (const k of Object.keys(draft)) delete draft[k];
      Object.assign(draft, next);
      ctx.rng.state = [...next.rng];
      return 'State replaced';
    },
  },
  {
    id: 'state.size',
    readOnly: true,
    group: 'debug',
    label: 'State size',
    syntax: 'state size',
    help: 'How big the current save is.',
    params: [],
    run: (ctx) =>
      `${(serialize(ctx.s).length / 1024).toFixed(1)} KB, ${ctx.s.npcs.length} NPCs, ${ctx.s.log.length} log lines`,
  },
  {
    id: 'deathbot',
    group: 'debug',
    label: 'Fast-forward to death (sim bot)',
    syntax: 'deathbot',
    help: 'Let the default sim bot play the rest of this life.',
    params: [],
    run: (ctx) => {
      const bot = new Rng(seedRng(ctx.s.seed + ctx.s.year));
      let s = { ...ctx.s, rng: ctx.rng.state };
      const immortal = s.cheats.immortal;
      if (immortal) s = { ...s, cheats: { ...s.cheats, immortal: false } };
      const mem = newBotMemory();
      for (let i = 0; i < 10000 && !s.death; i++) s = botStep(s, 'default', bot, mem);
      if (immortal) s = { ...s, cheats: { ...s.cheats, immortal: true } };
      const draft = ctx.s as unknown as Record<string, unknown>;
      for (const k of Object.keys(draft)) delete draft[k];
      Object.assign(draft, s);
      ctx.rng.state = [...s.rng];
      return s.death ? `Died at ${s.death.age}: ${s.death.cause}` : 'Still alive';
    },
  },
];
