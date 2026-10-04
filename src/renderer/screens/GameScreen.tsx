import type { GameState } from '../../engine';
import { doAgeUp } from '../store/app';
import { EventModal } from './game/EventModal';
import { Header } from './game/Header';
import { LogView } from './game/LogView';
import { RightPanel } from './game/RightPanel';
import { StatsColumn } from './game/StatsColumn';

export function GameScreen({ game }: { game: GameState }): React.JSX.Element {
  const blocked = game.pending.length > 0 || game.death !== null;
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
        </div>
      </main>
      <RightPanel game={game} />
      <EventModal game={game} />
    </div>
  );
}
