import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {},
  Menu: { buildFromTemplate: (t: unknown) => t, setApplicationMenu: () => undefined },
  BrowserWindow: { getFocusedWindow: () => null, getAllWindows: () => [] },
}));
const { menuTemplate } = await import('../../src/main/menu');

type Item = { label?: string; role?: string; id?: string; submenu?: Item[] };
const flat = (items: Item[]): Item[] => items.flatMap((i) => [i, ...flat(i.submenu ?? [])]);

describe('Electron menu (M12.1, SPEC §9.7)', () => {
  it('has App, File, Edit, View, Cheats, Window and Help with the specified items', () => {
    const t = menuTemplate(false, true) as Item[];
    expect(t.map((m) => m.label ?? m.role)).toEqual([
      'Lifespan',
      'File',
      'editMenu',
      'View',
      'Cheats',
      'windowMenu',
      'help',
    ]);
    const all = flat(t);
    const roles = all.map((i) => i.role);
    const ids = all.map((i) => i.id);
    for (const r of ['about', 'quit', 'zoomIn', 'zoomOut', 'resetZoom', 'togglefullscreen'])
      expect(roles).toContain(r);
    for (const id of [
      'settings',
      'new-life',
      'save',
      'lives',
      'export',
      'import',
      'cheats-toggle',
      'cheat-immortal',
      'cheat-forcesuccess',
      'cheat-nobadevents',
      'cheat-infinite',
      'shortcuts',
    ])
      expect(ids).toContain(id);
  });

  it('shows dev tools only in development builds', () => {
    expect(flat(menuTemplate(false) as Item[]).some((i) => i.role === 'toggleDevTools')).toBe(
      false,
    );
    expect(flat(menuTemplate(true) as Item[]).some((i) => i.role === 'toggleDevTools')).toBe(true);
  });
});
