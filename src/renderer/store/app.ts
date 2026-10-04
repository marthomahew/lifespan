import {
  ageUp as engineAgeUp,
  choose as engineChoose,
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

export type Screen = 'start' | 'new' | 'game' | 'obituary' | 'lives' | 'settings';
export type Tab = 'occupation' | 'assets' | 'relationships' | 'activities';
export type Overlay =
  'help' | 'palette' | 'achievements' | 'dynasty' | 'tree' | 'finances' | 'timeline' | null;
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
  /** Bumped when saves change so the Lives screen reloads. */
  savesVersion: number;
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
  savesVersion: 0,
});

export function useApp<U>(sel: (s: AppState) => U): U {
  return useStore(app, sel);
}

let toastSeq = 1;
export function pushToasts(toasts: Toast[]): void {
  if (!toasts.length) return;
  const items = toasts.map((t) => ({ ...t, id: toastSeq++ }));
  app.set((s) => ({ toasts: [...s.toasts, ...items].slice(-5) }));
  for (const it of items) setTimeout(() => dismissToast(it.id), 4000);
}

export function dismissToast(id: number): void {
  app.set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
}

export function showError(msg: string | null): void {
  app.set({ error: msg });
}

export async function persist(game: GameState, name?: string): Promise<void> {
  const saveName = name ?? (app.get().saveName || `${game.player.first} ${game.player.last}`);
  await saveStore.write(game.lifeId, makeSaveFile(game, saveName, Date.now()));
  app.set((s) => ({ savesVersion: s.savesVersion + 1 }));
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
    saveName: `${game.player.first} ${game.player.last}`,
    tab: 'occupation',
    overlay: null,
    npcId: null,
  });
  if (s.autosave) void persist(game);
}

export function doAgeUp(): void {
  const g = app.get().game;
  if (!g || g.death || g.pending.length > 0) return;
  applyStep(engineAgeUp(g));
}

export function doChoose(choiceId: string): void {
  const g = app.get().game;
  if (!g || g.pending.length === 0) return;
  applyStep(engineChoose(g, choiceId));
}

export async function loadLife(id: string): Promise<void> {
  const json = await saveStore.read(id);
  if (!json) return showError('That save could not be read.');
  try {
    const { summary, state } = parseSaveFile(json);
    app.set({
      game: state,
      saveName: summary.name,
      screen: state.death ? 'obituary' : 'game',
      overlay: null,
      npcId: null,
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
