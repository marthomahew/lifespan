import type { Ctx } from '../ctx';
import type { GameState } from '../types';

export type CheatGroup =
  'character' | 'money' | 'relationships' | 'career' | 'health' | 'events' | 'world' | 'debug';

export const CHEAT_GROUPS: { id: CheatGroup; label: string }[] = [
  { id: 'character', label: 'Character' },
  { id: 'money', label: 'Money & assets' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'career', label: 'Career & school' },
  { id: 'health', label: 'Health & legal' },
  { id: 'events', label: 'Events' },
  { id: 'world', label: 'World & time' },
  { id: 'debug', label: 'Debug' },
];

export type ParamDef =
  | {
      name: string;
      label?: string;
      type: 'int';
      min?: number;
      max?: number;
      optional?: boolean;
      default?: number;
    }
  | {
      name: string;
      label?: string;
      type: 'number';
      min?: number;
      max?: number;
      optional?: boolean;
      default?: number;
    }
  | {
      name: string;
      label?: string;
      type: 'string';
      optional?: boolean;
      maxLength?: number;
      default?: string;
    }
  | { name: string; label?: string; type: 'bool'; optional?: boolean; default?: boolean }
  | {
      name: string;
      label?: string;
      type: 'enum';
      options: (s: GameState) => { value: string; label: string }[];
      optional?: boolean;
      default?: string;
    };

export type ParamValues = Record<string, string | number | boolean | undefined>;

export type CheatDef = {
  id: string;
  group: CheatGroup;
  label: string;
  /** Console syntax: literals and {param} placeholders, e.g. "money add {amount}". */
  syntax: string;
  help: string;
  params: ParamDef[];
  /** Pure: runs on a working draft and returns a message for the console. */
  run: (ctx: Ctx, p: ParamValues) => string;
  /** Toggles show their current state in the GUI. */
  isOn?: (s: GameState) => boolean;
  /** Only reads the state (lists, sizes): doesn't mark the life as cheated. */
  readOnly?: boolean;
};
