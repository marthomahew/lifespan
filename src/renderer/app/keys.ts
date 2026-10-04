import { app, doAgeUp, doChoose, go, persist, type Tab } from '../store/app';
import { currentPopup } from '../../engine';

const TAB_ORDER: Tab[] = ['occupation', 'assets', 'relationships', 'activities'];

function typing(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || el.isContentEditable) return true;
  if (tag === 'select') return true;
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type;
    return !['checkbox', 'radio', 'range', 'button'].includes(type);
  }
  return false;
}

/** Space on a focused button or link should press it, not age up. */
function pressable(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  const tag = el?.tagName?.toLowerCase();
  return (
    (tag === 'button' && el?.dataset['testid'] !== 'age-up') || tag === 'a' || tag === 'summary'
  );
}

export function toggleCheats(): void {
  const s = app.get();
  if (!s.game) return;
  app.set({ cheatsOpen: !s.cheatsOpen });
}

/** The global keyboard map (SPEC §6). */
export function onKeyDown(e: KeyboardEvent): void {
  const s = app.get();
  const mod = e.metaKey || e.ctrlKey;
  const key = e.key;

  if (mod && e.shiftKey && key.toLowerCase() === 'k') {
    e.preventDefault();
    toggleCheats();
    return;
  }
  if (key === 'Escape') {
    if (s.overlay) app.set({ overlay: null });
    else if (s.cheatsOpen) app.set({ cheatsOpen: false });
    else if (s.npcId !== null) app.set({ npcId: null });
    else if (s.screen === 'settings' || s.screen === 'lives')
      go(s.game ? (s.game.death ? 'obituary' : 'game') : 'start');
    return;
  }
  if (typing(e.target)) return;

  if (mod) {
    const n = Number(key);
    if (n >= 1 && n <= 4 && s.screen === 'game') {
      e.preventDefault();
      const tab = TAB_ORDER[n - 1];
      if (tab) app.set({ tab });
      return;
    }
    if (key.toLowerCase() === 's') {
      e.preventDefault();
      if (s.game) void persist(s.game);
      return;
    }
    if (key.toLowerCase() === 'l') {
      e.preventDefault();
      go('lives');
      return;
    }
    if (key === ',') {
      e.preventDefault();
      go('settings');
      return;
    }
    return;
  }
  if (key === '`') {
    e.preventDefault();
    toggleCheats();
    return;
  }
  if (key === '?') {
    e.preventDefault();
    app.set({ overlay: s.overlay === 'help' ? null : 'help' });
    return;
  }
  if (s.screen !== 'game' || !s.game || s.overlay) return;
  const popup = currentPopup(s.game);
  if (popup) {
    const n = Number(key);
    if (n >= 1 && n <= 4) {
      const c = popup.choices[n - 1];
      if (c?.enabled) {
        e.preventDefault();
        doChoose(c.id);
      }
    }
    if (key === ' ') e.preventDefault();
    return;
  }
  if (key === ' ' && !s.cheatsOpen && !pressable(e.target)) {
    e.preventDefault();
    doAgeUp();
  }
}
