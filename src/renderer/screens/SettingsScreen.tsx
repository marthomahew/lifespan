import { app, go, updateSettings, useApp } from '../store/app';
import type { TextSize, Theme } from '../store/settings';

export function SettingsScreen(): React.JSX.Element {
  const s = useApp((x) => x.settings);
  const back = useApp((x) => x.back);
  const game = useApp((x) => x.game);
  return (
    <div className="screen" data-testid="settings-screen">
      <div className="screen-head">
        <button
          className="ghost"
          data-testid="btn-back"
          onClick={() => go(game && (back === 'game' || back === 'obituary') ? back : 'start')}
        >
          ← Back
        </button>
        <h1>Settings</h1>
      </div>
      <form
        className="card pad settings"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Settings"
      >
        <label className="setting">
          <span>Theme</span>
          <select
            data-testid="set-theme"
            value={s.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as Theme })}
          >
            <option value="system">Match the system</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="setting">
          <span>Text size</span>
          <select
            data-testid="set-text-size"
            value={s.textSize}
            onChange={(e) => updateSettings({ textSize: e.target.value as TextSize })}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label className="setting">
          <span>Popups per year</span>
          <input
            type="number"
            min={1}
            max={5}
            data-testid="set-popups"
            value={s.popupsPerYear}
            onChange={(e) =>
              updateSettings({
                popupsPerYear: Math.min(5, Math.max(1, Number(e.target.value) || 3)),
              })
            }
          />
        </label>
        <label className="setting check">
          <input
            type="checkbox"
            data-testid="set-free-time"
            checked={s.freeTime}
            onChange={(e) => updateSettings({ freeTime: e.target.checked })}
          />
          <span>Free time: a year only holds so many activities</span>
        </label>
        <label className="setting check">
          <input
            type="checkbox"
            data-testid="set-cheat-badge"
            checked={s.cheatBadge}
            onChange={(e) => updateSettings({ cheatBadge: e.target.checked })}
          />
          <span>Show the cheat badge on lives that used cheats</span>
        </label>
        <label className="setting check">
          <input
            type="checkbox"
            data-testid="set-autosave"
            checked={s.autosave}
            onChange={(e) => updateSettings({ autosave: e.target.checked })}
          />
          <span>Autosave every year</span>
        </label>
        <label className="setting check">
          <input
            type="checkbox"
            data-testid="set-reduced-motion"
            checked={s.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
          />
          <span>Reduce motion</span>
        </label>
        <button
          type="button"
          className="settings-help"
          data-testid="btn-open-help"
          onClick={() => app.set({ overlay: 'help' })}
        >
          ⌨️ Keyboard shortcuts
        </button>
      </form>
    </div>
  );
}
