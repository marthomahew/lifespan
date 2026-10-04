import { availableActions, type GameState, type PlayerAction } from '../../engine';
import { app, doAct, doAgeUp, go, persist, type Overlay, type Tab } from '../store/app';

export type Command = {
  id: string;
  label: string;
  group: string;
  keywords: string;
  run: () => string | null;
  enabled: boolean;
  hint?: string;
};

const nav = (
  id: string,
  label: string,
  keywords: string,
  run: () => void,
  hint?: string,
): Command => ({
  id,
  label,
  group: 'Go to',
  keywords: `${label} ${keywords}`.toLowerCase(),
  run: () => {
    run();
    return null;
  },
  enabled: true,
  ...(hint ? { hint } : {}),
});

const overlay = (o: Overlay) => () => app.set({ overlay: o });
const tab = (t: Tab) => () => app.set({ tab: t, overlay: null });

/** Everything the ⌘K palette can find: navigation plus every available action (SPEC §6). */
export function commandsFor(game: GameState): Command[] {
  const cmds: Command[] = [
    nav(
      'age-up',
      'Age Up',
      'next year',
      () => {
        app.set({ overlay: null });
        doAgeUp();
      },
      'Space',
    ),
    nav('tab-occupation', 'Occupation tab', 'job school career military', tab('occupation'), '⌘1'),
    nav('tab-assets', 'Assets tab', 'money home car', tab('assets'), '⌘2'),
    nav(
      'tab-relationships',
      'Relationships tab',
      'family friends people',
      tab('relationships'),
      '⌘3',
    ),
    nav('tab-activities', 'Activities tab', 'do something', tab('activities'), '⌘4'),
    nav('finances', 'Finances', 'money budget net worth graph', overlay('finances')),
    nav('tree', 'Family tree', 'relatives generations', overlay('tree')),
    nav('achievements', 'Achievements', 'trophies', overlay('achievements')),
    nav('dynasty', 'Dynasty', 'generations legacy', overlay('dynasty')),
    nav('timeline', 'Milestone timeline', 'history events', overlay('timeline')),
    nav('help', 'Keyboard shortcuts', 'help keys', overlay('help'), '?'),
    nav(
      'save',
      'Save',
      'store',
      () => {
        app.set({ overlay: null });
        void persist(game);
      },
      '⌘S',
    ),
    nav('lives', 'Lives', 'saves load', () => go('lives'), '⌘L'),
    nav('settings', 'Settings', 'preferences theme', () => go('settings'), '⌘,'),
    nav(
      'cheats',
      'Cheat panel',
      'console',
      () => app.set({ overlay: null, cheatsOpen: true }),
      '`',
    ),
  ];
  for (const g of availableActions(game)) {
    for (const it of g.items) {
      if (!it.enabled) continue;
      const action: PlayerAction = it.action;
      cmds.push({
        id: `${g.group}:${it.label}`,
        label: it.label,
        group: g.group,
        keywords: it.keywords,
        enabled: true,
        run: () => {
          app.set({ overlay: null });
          return doAct(action);
        },
      });
    }
  }
  return cmds;
}

export function searchCommands(cmds: Command[], q: string): Command[] {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return cmds.slice(0, 40);
  return cmds
    .filter((c) => words.every((w) => c.keywords.includes(w) || c.label.toLowerCase().includes(w)))
    .slice(0, 40);
}
