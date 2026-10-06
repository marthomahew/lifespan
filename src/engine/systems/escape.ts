import { Rng, seedRng } from '../rng';
import type { GameState } from '../types';

/** The prison escape mini-game: a yard, guards on patrol, a gap in the fence, and dawn coming. */
export type Cell = [number, number];
export type Dir = 'U' | 'D' | 'L' | 'R' | 'W';
export type EscapeMap = {
  w: number;
  h: number;
  start: Cell;
  exit: Cell;
  walls: Cell[];
  /** Each guard walks its path forward and back, one cell a turn. */
  guards: Cell[][];
  maxTurns: number;
};
export type EscapeStatus = 'running' | 'escaped' | 'caught' | 'dawn';
export type EscapeState = {
  status: EscapeStatus;
  turn: number;
  pos: Cell;
  guards: { at: Cell; facing: Cell }[];
  /** Cells the guards can see this turn. */
  seen: Cell[];
};

const W = 9;
const H = 7;
const STEP: Record<Dir, Cell> = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0], W: [0, 0] };
const key = (c: Cell): string => `${c[0]},${c[1]}`;

/** A guard's place on turn t: back and forth along the path. */
function guardAt(path: Cell[], t: number): { at: Cell; facing: Cell } {
  const n = path.length;
  if (n === 1) return { at: path[0] as Cell, facing: [0, 0] };
  const period = 2 * (n - 1);
  const i = t % period;
  const idx = i < n ? i : period - i;
  const nextI = (t + 1) % period;
  const next = nextI < n ? nextI : period - nextI;
  const at = path[idx] as Cell;
  const to = path[next] as Cell;
  return { at, facing: [Math.sign(to[0] - at[0]), Math.sign(to[1] - at[1])] };
}

/** What a guard sees: their own cell, the cells either side, and two ahead unless a wall is in the way. */
function vision(map: EscapeMap, g: { at: Cell; facing: Cell }, walls: Set<string>): Cell[] {
  const out: Cell[] = [g.at];
  const [fx, fy] = g.facing;
  if (fx === 0 && fy === 0) return out;
  for (let d = 1; d <= 2; d++) {
    const c: Cell = [g.at[0] + fx * d, g.at[1] + fy * d];
    if (c[0] < 0 || c[1] < 0 || c[0] >= map.w || c[1] >= map.h || walls.has(key(c))) break;
    out.push(c);
  }
  return out;
}

function stateAt(map: EscapeMap, t: number, pos: Cell, status: EscapeStatus): EscapeState {
  const walls = new Set(map.walls.map(key));
  const guards = map.guards.map((p) => guardAt(p, t));
  return { status, turn: t, pos, guards, seen: guards.flatMap((g) => vision(map, g, walls)) };
}

/** Play a list of moves from the start. Moves after the end are ignored. */
export function simulate(map: EscapeMap, moves: readonly Dir[]): EscapeState {
  const walls = new Set(map.walls.map(key));
  let pos: Cell = map.start;
  let t = 0;
  for (const m of moves) {
    const [dx, dy] = STEP[m];
    const to: Cell = [pos[0] + dx, pos[1] + dy];
    const inside = to[0] >= 0 && to[1] >= 0 && to[0] < map.w && to[1] < map.h;
    const before = map.guards.map((p) => guardAt(p, t).at);
    const from = pos;
    if (inside && !walls.has(key(to))) pos = to;
    t += 1;
    if (key(pos) === key(map.exit)) return stateAt(map, t, pos, 'escaped');
    const now = stateAt(map, t, pos, 'running');
    // Caught if a guard can see you, or you and a guard swap places on the same step.
    const crossed = map.guards.some(
      (p, i) => key(guardAt(p, t).at) === key(from) && key(before[i] as Cell) === key(pos),
    );
    if (crossed || now.seen.some((c) => key(c) === key(pos))) return { ...now, status: 'caught' };
    if (t >= map.maxTurns) return { ...now, status: 'dawn' };
  }
  return stateAt(map, t, pos, 'running');
}

/** The shortest safe route, if there is one (breadth-first over position and time). */
export function solve(map: EscapeMap): Dir[] | null {
  const dirs: Dir[] = ['R', 'U', 'D', 'L', 'W'];
  type Node = { moves: Dir[] };
  let frontier: Node[] = [{ moves: [] }];
  const visited = new Set<string>();
  while (frontier.length) {
    const next: Node[] = [];
    for (const n of frontier) {
      for (const d of dirs) {
        const moves = [...n.moves, d];
        const st = simulate(map, moves);
        if (st.status === 'escaped') return moves;
        if (st.status !== 'running') continue;
        const k = `${key(st.pos)}@${st.turn}`;
        if (visited.has(k)) continue;
        visited.add(k);
        next.push({ moves });
      }
    }
    frontier = next;
  }
  return null;
}

function buildMap(r: Rng): EscapeMap {
  const start: Cell = [0, r.int(1, H - 2)];
  const exit: Cell = [W - 1, r.int(0, H - 1)];
  const taken = new Set([key(start), key(exit)]);
  const walls: Cell[] = [];
  for (let i = 0; i < 7; i++) {
    const c: Cell = [r.int(1, W - 2), r.int(0, H - 1)];
    if (taken.has(key(c))) continue;
    taken.add(key(c));
    walls.push(c);
  }
  const wallSet = new Set(walls.map(key));
  const guards: Cell[][] = [];
  for (let g = 0; g < 3; g++) {
    // Columns 2–7 so nobody stands on the start or the gap; a vertical or horizontal beat.
    const vertical = r.chance(0.6);
    const x = r.int(2, W - 2);
    const y = r.int(0, H - 1);
    const len = r.int(3, 5);
    const path: Cell[] = [];
    for (let k = 0; k < len; k++) {
      const c: Cell = vertical ? [x, Math.min(H - 1, y + k)] : [Math.min(W - 2, x + k), y];
      if (wallSet.has(key(c)) || (path.length && key(path[path.length - 1] as Cell) === key(c)))
        break;
      path.push(c);
    }
    if (path.length >= 2) guards.push(path);
  }
  return { w: W, h: H, start, exit, walls, guards, maxTurns: 30 };
}

/** This year's yard for this life: always one with a way out, though not an easy one. */
export function escapeMap(s: GameState): EscapeMap {
  const r = new Rng(seedRng((Math.imul(s.seed, 31) + s.year * 7 + s.legal.escapes) >>> 0));
  for (let i = 0; i < 40; i++) {
    const map = buildMap(r);
    if (map.guards.length < 2) continue;
    const route = solve(map);
    if (route && route.length >= 9) return map;
  }
  // A plain yard with one guard as a last resort.
  return {
    w: W,
    h: H,
    start: [0, 3],
    exit: [W - 1, 3],
    walls: [],
    guards: [
      [
        [4, 0],
        [4, 1],
        [4, 2],
      ],
    ],
    maxTurns: 30,
  };
}

export function parseMoves(raw: unknown): Dir[] | null {
  if (typeof raw !== 'string' || raw.length > 200 || !/^[UDLRW]*$/.test(raw)) return null;
  return raw.split('') as Dir[];
}
