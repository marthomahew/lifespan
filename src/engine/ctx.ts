import { Rng } from './rng';
import type { Candidate } from './systems/dating';
import type { GameState, LogCategory, LogEntry, Toast } from './types';

/**
 * A working context over a private draft of the state. Public engine functions clone their
 * input, run systems against a Ctx, then return `ctx.finish()`. Inputs are never mutated.
 */
export class Ctx {
  readonly s: GameState;
  readonly rng: Rng;
  readonly newLog: LogEntry[] = [];
  readonly toasts: Toast[] = [];
  /** When set, the year's phases are recorded in order (tests). */
  trace: string[] | null = null;
  /** The person you picked to date, if any: a successful 'meet' brings them into your life. */
  meet: Candidate | null = null;

  constructor(draft: GameState) {
    this.s = draft;
    this.rng = new Rng(draft.rng);
  }

  log(
    cat: LogCategory,
    text: string,
    milestone = false,
    context?: { prompt: string; chose: string },
  ): void {
    const entry: LogEntry = { age: this.s.player.age, year: this.s.year, cat, text };
    if (milestone) entry.milestone = true;
    if (context) {
      entry.prompt = context.prompt;
      entry.chose = context.chose;
    }
    this.s.log.push(entry);
    this.newLog.push(entry);
  }

  phase(name: string): void {
    this.trace?.push(name);
  }

  toast(t: Toast): void {
    this.toasts.push(t);
  }

  /** Force-success cheat: skill checks, applications, dates, crimes. */
  roll(p: number): boolean {
    if (this.s.cheats.forceSuccess) {
      this.rng.next();
      return true;
    }
    return this.rng.chance(p);
  }

  finish(): Step {
    this.s.rng = this.rng.state;
    return { state: this.s, log: this.newLog, toasts: this.toasts };
  }
}

export type Step = { state: GameState; log: LogEntry[]; toasts: Toast[] };
