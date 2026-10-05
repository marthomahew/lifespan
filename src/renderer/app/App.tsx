import { useEffect } from 'react';
import { app, dismissToast, showError, useApp } from '../store/app';
import { applySettingsToDocument } from '../store/settings';
import { GameScreen } from '../screens/GameScreen';
import { HelpOverlay } from '../screens/HelpOverlay';
import { LivesScreen } from '../screens/LivesScreen';
import { NewLifeScreen } from '../screens/NewLifeScreen';
import { ObituaryScreen } from '../screens/ObituaryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StartScreen } from '../screens/StartScreen';
import { onKeyDown, toggleCheats } from './keys';
import { onMenuCommand } from './menu';
import { CheatPanel } from '../cheats/CheatPanel';
import { FamilyTree } from '../screens/FamilyTree';
import { FinancesView } from '../screens/FinancesView';
import { AchievementsView } from '../screens/AchievementsView';
import { DynastyView } from '../screens/DynastyView';
import { Timeline } from '../screens/Timeline';
import { CommandPalette } from '../screens/CommandPalette';
import { NpcPanel } from '../screens/game/NpcPanel';
import { GoalPicker } from '../screens/GoalPicker';

export function App(): React.JSX.Element {
  const screen = useApp((s) => s.screen);
  const game = useApp((s) => s.game);
  const overlay = useApp((s) => s.overlay);
  const toasts = useApp((s) => s.toasts);
  const error = useApp((s) => s.error);
  const settings = useApp((s) => s.settings);
  const cheatsOpen = useApp((s) => s.cheatsOpen);
  const npcId = useApp((s) => s.npcId);

  useEffect(() => {
    applySettingsToDocument(settings);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => applySettingsToDocument(app.get().settings);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [settings]);

  useEffect(() => window.lifespan?.onMenu((cmd) => onMenuCommand(cmd, toggleCheats)), []);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app" data-testid="app-root" data-screen={screen}>
      {screen === 'start' && <StartScreen />}
      {screen === 'new' && <NewLifeScreen />}
      {screen === 'game' && game && <GameScreen game={game} />}
      {screen === 'obituary' && game && <ObituaryScreen game={game} />}
      {screen === 'lives' && <LivesScreen />}
      {screen === 'settings' && <SettingsScreen />}
      {cheatsOpen && game && <CheatPanel game={game} />}
      {overlay === 'help' && <HelpOverlay />}
      {overlay === 'tree' && game && <FamilyTree game={game} />}
      {overlay === 'finances' && game && <FinancesView game={game} />}
      {overlay === 'achievements' && game && <AchievementsView game={game} />}
      {overlay === 'dynasty' && game && <DynastyView game={game} />}
      {overlay === 'timeline' && game && <Timeline game={game} />}
      {overlay === 'goals' && game && <GoalPicker game={game} />}
      {overlay === 'palette' && game && <CommandPalette game={game} />}
      {npcId !== null && game && !overlay && <NpcPanel game={game} npcId={npcId} />}
      {error && (
        <div className="error-banner card" role="alert" data-testid="error-banner">
          <span className="grow">{error}</span>
          <button className="ghost" aria-label="Dismiss" onClick={() => showError(null)}>
            ✕
          </button>
        </div>
      )}
      <div
        className={`toasts${screen === 'game' ? '' : ' off-game'}`}
        aria-live="polite"
        data-testid="toasts"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast card ${t.kind}`}
            data-testid="toast"
            onClick={() => dismissToast(t.id)}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
