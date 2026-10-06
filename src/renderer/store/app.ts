import {
  continueAsChild,
  act as engineAct,
  type PlayerAction,
  runCheat,
  runConsole,
  ageUp as engineAgeUp,
  choose as engineChoose,
  currentPopup,
  makeSaveFile,
  newLife,
  parseSaveFile,
  type GameState,
  type NewLifeOptions,
  type Step,
  type Toast,
} from '../../engine';
import { createSaveStore, type SaveStore } from '../platform/saveStore';
import { createStore, useStore } from './store';
import { applySettingsToDocument, loadSettings, saveSettings, type Settings } from './settings';
import { choiceResult, type ChoiceResult } from './result';
import { markCompleted } from './challenges';

export type Screen = 'start' | 'new' | 'game' | 'obituary' | 'lives' | 'settings';
export type Tab = 'occupation' | 'assets' | 'relationships' | 'activities';
export type Overlay =
  | 'help'
  | 'palette'
  | 'achievements'
  | 'dynasty'
  | 'tree'
  | 'finances'
  | 'timeline'
  | 'goals'
  | null;
export type ToastItem = Toast & { id: number };

export type AppState = {
  screen: Screen;
  /** Where Settings/Lives return to. */
  back: Screen;
  game: GameState | null;
  saveName: string;
  settings: Settings;
  tab: Tab;
  overlay: Overlay;
  cheatsOpen: boolean;
  toasts: ToastItem[];
  error: string | null;
  /** NPC whose detail panel is open. */
  npcId: number | null;
  petId: number | null;
  /** Bumped when saves change so the Lives screen reloads. */
  savesVersion: number;
  /** Debug overlay showing hidden stats. */
  hiddenStats: boolean;
  /** The result card for the choice just made, until the player continues. */
  result: ChoiceResult | null;
  /** The state just before the last Age Up, so the bar can say what this year has done so far. */
  yearStart: GameState | null;
  /** What the last action from a panel did, shown at the top of that panel this year. */
  feedback: { tab: Tab; year: number; lines: string[] } | null;
};

export const saveStore: SaveStore = createSaveStore();

export const app = createStore<AppState>({
  screen: 'start',
  back: 'start',
  game: null,
  saveName: '',
  settings: loadSettings(),
  tab: 'occupation',
  overlay: null,
  cheatsOpen: false,
  toasts: [],
  error: null,
  npcId: null,
  petId: null,
  savesVersion: 0,
  hiddenStats: false,
  feedback: null,
  result: null,
  yearStart: null,
});

export function useApp<U>(sel: (s: AppState) => U): U {
  return useStore(app, sel);
}

let toastSeq = 1;
export function pushToasts(toasts: Toast[]): void {
  if (!toasts.length) return;
  const items = toasts.map((t) => ({ ...t, id: toastSeq++ }));
  app.set((s) => ({ toasts: [...s.toasts, ...items].slice(-2) }));
  for (const it of items) setTimeout(() => dismissToast(it.id), 3000);
}

export function dismissToast(id: number): void {
  app.set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
}

export function showError(msg: string | null): void {
  app.set({ error: msg });
}

/** Save a life. If storage is full, retry with a shorter snapshot ring; report failure instead of throwing. */
export async function persist(game: GameState, name?: string): Promise<boolean> {
  const saveName = name ?? (app.get().saveName || `${game.player.first} ${game.player.last}`);
  try {
    await saveStore.write(game.lifeId, makeSaveFile(game, saveName, Date.now()));
  } catch {
    try {
      const slim = { ...game, snapshots: game.snapshots.slice(-3) };
      await saveStore.write(game.lifeId, makeSaveFile(slim, saveName, Date.now()));
    } catch (e) {
      showError(`Couldn't save: ${(e as Error).message}`);
      return false;
    }
  }
  app.set((s) => ({ savesVersion: s.savesVersion + 1 }));
  return true;
}

/** Apply an engine step: new state, toasts, obituary on death, autosave on a new year. */
export function applyStep(step: Step, opts: { autosave?: boolean } = {}): void {
  const prev = app.get().game;
  const game = step.state;
  app.set({
    game,
    screen: game.death ? 'obituary' : app.get().screen === 'obituary' ? 'game' : app.get().screen,
  });
  pushToasts(step.toasts);
  // Remember a won challenge across lives.
  if (game.challenge?.status === 'won' && prev?.challenge?.status !== 'won')
    markCompleted(game.challenge.id);
  const newYear = !prev || prev.year !== game.year || game.death !== prev.death;
  if ((opts.autosave ?? true) && app.get().settings.autosave && newYear) void persist(game);
}

export function startLife(opts: NewLifeOptions, seed?: number): void {
  const s = app.get().settings;
  const game = newLife(
    { ...opts, popupsPerYear: s.popupsPerYear },
    seed ?? Math.floor(Math.random() * 2 ** 31),
  );
  app.set({
    game,
    screen: 'game',
    result: null,
    yearStart: null,
    saveName: `${game.player.first} ${game.player.last}`,
    tab: 'occupation',
    overlay: null,
    npcId: null,
    petId: null,
  });
  if (s.autosave) void persist(game);
}

export function doAgeUp(): void {
  const g = app.get().game;
  if (!g || g.death || g.pending.length > 0 || app.get().result) return;
  const step = engineAgeUp(g);
  applyStep(step);
  app.set({ yearStart: g });
}

export function doChoose(choiceId: string): void {
  const g = app.get().game;
  if (!g || g.pending.length === 0 || app.get().result) return;
  const emoji = currentPopup(g)?.emoji ?? '🎲';
  const step = engineChoose(g, choiceId);
  applyStep(step);
  if (!step.state.death) app.set({ result: choiceResult(g, step.state, emoji) });
}

/** Dismiss the result card; the next popup (if any) shows. */
export function continueResult(): void {
  app.set({ result: null });
}

export async function loadLife(id: string): Promise<void> {
  const json = await saveStore.read(id);
  if (!json) return showError('That save could not be read.');
  try {
    const { summary, state } = parseSaveFile(json);
    app.set({
      game: state,
      result: null,
      yearStart: null,
      saveName: summary.name,
      screen: state.death ? 'obituary' : 'game',
      overlay: null,
      npcId: null,
      petId: null,
    });
  } catch (e) {
    showError(`That save is damaged: ${(e as Error).message}`);
  }
}

export function updateSettings(patch: Partial<Settings>): void {
  const settings = { ...app.get().settings, ...patch };
  saveSettings(settings);
  applySettingsToDocument(settings);
  const g = app.get().game;
  if (
    g &&
    patch.popupsPerYear !== undefined &&
    g.settings.popupsPerYear !== settings.popupsPerYear
  ) {
    app.set({ game: { ...g, settings: { ...g.settings, popupsPerYear: settings.popupsPerYear } } });
  }
  app.set({ settings });
}

export function go(screen: Screen): void {
  const cur = app.get().screen;
  app.set({
    screen,
    back: cur === 'settings' || cur === 'lives' ? app.get().back : cur,
    overlay: null,
    cheatsOpen: false,
  });
}

/** Run a cheat from the GUI or console; returns the console message. */
export function doCheat(
  id: string,
  params: Record<string, unknown>,
): { ok: boolean; message: string } {
  const g = app.get().game;
  if (!g) return { ok: false, message: 'No life is loaded' };
  try {
    const step = runCheat(g, id, params);
    applyStep(step);
    return { ok: true, message: step.message };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export function doConsole(line: string): { ok: boolean; message: string } {
  const g = app.get().game;
  if (!g) return { ok: false, message: 'No life is loaded' };
  try {
    const step = runConsole(g, line);
    if (step.state !== g) applyStep(step);
    return { ok: true, message: step.message };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** Import a save file; a life that already exists is imported as a copy rather than overwritten. */
export async function importSave(text: string): Promise<string> {
  const { summary, state } = parseSaveFile(text);
  const existing = new Set((await saveStore.list()).map((m) => m.id));
  let id = state.lifeId;
  for (let n = 2; existing.has(id); n++) id = `${state.lifeId.slice(0, 50)}-copy${n}`;
  const name = id === state.lifeId ? summary.name : `${summary.name} (copy)`;
  await saveStore.write(id, makeSaveFile({ ...state, lifeId: id }, name, Date.now()));
  app.set((s) => ({ savesVersion: s.savesVersion + 1 }));
  return id;
}

/** Run a player action (activity, interaction); returns an error message or null. */
export function doAct(action: PlayerAction): string | null {
  const g = app.get().game;
  if (!g) return 'No life is loaded';
  try {
    const step = engineAct(g, action);
    applyStep(step, { autosave: false });
    // The action's own lines, not the achievements and nudges that follow it.
    const lines = step.log
      .filter((l) => l.cat !== 'system' && !/Achievement:/.test(l.text))
      .map((l) => l.text)
      .slice(0, 2);
    app.set({
      feedback: lines.length ? { tab: app.get().tab, year: step.state.year, lines } : null,
    });
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

/** Carry the family on as one of the late player's children. */
export function continueAs(heirId: number): void {
  const g = app.get().game;
  if (!g) return;
  try {
    const next = continueAsChild(g, heirId);
    app.set({
      game: next,
      screen: 'game',
      saveName: `${next.player.first} ${next.player.last}`,
      overlay: null,
      npcId: null,
      petId: null,
      tab: 'occupation',
    });
    void persist(next);
  } catch (e) {
    showError((e as Error).message);
  }
}
