import type { BackgroundFrequency } from '../../content/backgrounds';
export type Theme = 'system' | 'light' | 'dark';
export type TextSize = 'small' | 'medium' | 'large';

export type Settings = {
  theme: Theme;
  textSize: TextSize;
  popupsPerYear: number;
  cheatBadge: boolean;
  autosave: boolean;
  reducedMotion: boolean;
  /** A yearly budget for activities (off: do as much as you like). */
  freeTime: boolean;
  /** How many pips a year holds. */
  pace: 'relaxed' | 'standard' | 'challenging';
  /** Foreign languages fade without use. */
  languageDecay: boolean;
  /** How often a life left to chance starts with a background (family business, a twin...). */
  backgrounds: BackgroundFrequency;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  textSize: 'medium',
  popupsPerYear: 3,
  cheatBadge: true,
  autosave: true,
  reducedMotion: false,
  freeTime: true,
  pace: 'standard',
  languageDecay: true,
  backgrounds: 'off',
};

const KEY = 'lifespan.settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const v = JSON.parse(raw) as Partial<Settings>;
    const out: Settings = { ...DEFAULT_SETTINGS };
    if (v.theme === 'light' || v.theme === 'dark' || v.theme === 'system') out.theme = v.theme;
    if (v.textSize === 'small' || v.textSize === 'medium' || v.textSize === 'large')
      out.textSize = v.textSize;
    if (typeof v.popupsPerYear === 'number')
      out.popupsPerYear = Math.min(5, Math.max(1, Math.round(v.popupsPerYear)));
    if (typeof v.cheatBadge === 'boolean') out.cheatBadge = v.cheatBadge;
    if (typeof v.autosave === 'boolean') out.autosave = v.autosave;
    if (typeof v.reducedMotion === 'boolean') out.reducedMotion = v.reducedMotion;
    if (typeof v.freeTime === 'boolean') out.freeTime = v.freeTime;
    if (v.pace === 'relaxed' || v.pace === 'standard' || v.pace === 'challenging')
      out.pace = v.pace;
    if (typeof v.languageDecay === 'boolean') out.languageDecay = v.languageDecay;
    if (v.backgrounds === 'off' || v.backgrounds === 'rare' || v.backgrounds === 'common')
      out.backgrounds = v.backgrounds;
    return out;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage full or unavailable: settings stay in memory.
  }
}

/** Apply theme, text size and motion to the document root. */
export function applySettingsToDocument(s: Settings): void {
  const root = document.documentElement;
  const dark =
    s.theme === 'dark' ||
    (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset['theme'] = dark ? 'dark' : 'light';
  root.dataset['themeSetting'] = s.theme;
  root.dataset['textSize'] = s.textSize;
  root.dataset['reducedMotion'] = s.reducedMotion ? 'true' : 'false';
}
