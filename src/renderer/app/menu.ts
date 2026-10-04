import { app, doCheat, go, importSave, persist, saveStore, showError } from '../store/app';
import { makeSaveFile } from '../../engine';

/** Commands sent by the Electron menu (SPEC §9.7). */
export function onMenuCommand(cmd: string, toggleCheats: () => void): void {
  const s = app.get();
  switch (cmd) {
    case 'cheats.toggle':
      toggleCheats();
      return;
    case 'new-life':
      go('new');
      return;
    case 'save':
      if (s.game) void persist(s.game);
      return;
    case 'lives':
      go('lives');
      return;
    case 'settings':
      go('settings');
      return;
    case 'help':
      app.set({ overlay: 'help' });
      return;
    case 'export':
      if (s.game)
        void saveStore.exportFile(
          `${s.game.player.first}-${s.game.player.last}`,
          makeSaveFile(s.game, s.saveName, Date.now()),
        );
      return;
    case 'import':
      void saveStore.importFile().then(async (text) => {
        if (!text) return;
        try {
          await importSave(text);
          go('lives');
        } catch (e) {
          showError(`Import failed: ${(e as Error).message}`);
        }
      });
      return;
  }
  if (cmd.startsWith('cheat:') && s.game) {
    const r = doCheat(cmd.slice(6), {});
    if (!r.ok) showError(r.message);
  }
}
