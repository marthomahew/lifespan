import { type GameState } from '../../../../engine';
import { occupationLabel } from '../../../../engine/occupation';

export function OccupationTab({ game }: { game: GameState }): React.JSX.Element {
  return (
    <div className="col" data-testid="occupation">
      <section className="panel-section">
        <h3 className="section-title">Now</h3>
        <p data-testid="occupation-now">{occupationLabel(game)}</p>
      </section>
    </div>
  );
}
