import type { GameState } from '../../../../engine';

export function ActivitiesTab({ game }: { game: GameState }): React.JSX.Element {
  return (
    <div className="col" data-testid="activities">
      <p className="muted">{game.player.age < 3 ? 'Babies mostly nap.' : 'Nothing to do yet.'}</p>
    </div>
  );
}
