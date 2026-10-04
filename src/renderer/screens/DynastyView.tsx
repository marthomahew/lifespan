import { formatMoney, legacyScore, type GameState } from '../../engine';
import { refToLocal } from '../../engine/economy';
import { Modal } from '../components/Modal';
import { app } from '../store/app';

/** Every generation so far, with a legacy score (SPEC §5.15). */
export function DynastyView({ game }: { game: GameState }): React.JSX.Element {
  const gens = game.dynasty;
  return (
    <Modal title="Dynasty" testId="dynasty" onClose={() => app.set({ overlay: null })} wide>
      <p data-testid="legacy-score">
        Legacy score: <strong>{legacyScore(gens)}</strong> across {gens.length} generation
        {gens.length === 1 ? '' : 's'}
        {game.death ? '' : ' (plus the life in progress)'}
      </p>
      {gens.length === 0 ? (
        <p className="muted">The first generation is still writing its story.</p>
      ) : (
        <div className="table-wrap">
          <table className="breakdown dynasty-table" data-testid="dynasty-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Years</th>
                <th scope="col">Title</th>
                <th scope="col">Net worth</th>
                <th scope="col">Cause of death</th>
              </tr>
            </thead>
            <tbody>
              {gens.map((g, i) => (
                <tr key={`${g.first}-${g.birthYear}-${i}`} data-testid="dynasty-row">
                  <th scope="row">
                    {g.first} {g.last}
                  </th>
                  <td>
                    {g.birthYear}–{g.deathYear}
                  </td>
                  <td>{g.title}</td>
                  <td>{formatMoney(game, refToLocal(game, g.netWorthRef))}</td>
                  <td>{g.cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
