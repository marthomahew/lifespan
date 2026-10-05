import { useMemo } from 'react';
import type { GameState } from '../../engine';
import { doAgeUp, useApp } from '../store/app';
import { yearChanges } from '../store/result';
import { EventModal } from './game/EventModal';
import { Header } from './game/Header';
import { LogView } from './game/LogView';
import { RightPanel } from './game/RightPanel';
import { StatsColumn } from './game/StatsColumn';

export function GameScreen({ game }: { game: GameState }): React.JSX.Element {
  const result = useApp((s) => s.result);
  const yearStart = useApp((s) => s.yearStart);
  // Everything since the last birthday: the year's drift plus every choice since.
  const lastYear = useMemo(
    () => (yearStart && yearStart.lifeId === game.lifeId ? yearChanges(yearStart, game) : null),
    [yearStart, game],
  );
  const blocked = game.pending.length > 0 || game.death !== null || result !== null;
  return (
    <div className="game" data-testid="game-screen">
      <Header game={game} />
      <StatsColumn game={game} />
      <main className="center">
        <LogView game={game} />
        <div className="ageup-bar">
          <button
            className="primary ageup"
            data-testid="age-up"
            disabled={blocked}
            onClick={doAgeUp}
            title="Age Up (Space)"
          >
            Age Up{' '}
            <span className="kbd" aria-hidden="true">
              Space
            </span>
          </button>
          {lastYear && lastYear.length > 0 && (
            <p className="last-year small" data-testid="last-year" aria-live="polite">
              <span className="muted">This year:</span>{' '}
              {lastYear.map((c) => (
                <span key={c.label} className={c.good ? 'up' : 'down'}>
                  {c.label} {c.value}
                </span>
              ))}
            </p>
          )}
        </div>
      </main>
      <RightPanel game={game} />
      <EventModal game={game} />
    </div>
  );
}
