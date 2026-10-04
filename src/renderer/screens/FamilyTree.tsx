import { familyTree, type GameState } from '../../engine';
import { Modal } from '../components/Modal';
import { app } from '../store/app';

const GEN_LABEL: Record<number, string> = {
  [-3]: 'Great-grandparents',
  [-2]: 'Grandparents',
  [-1]: 'Parents',
  0: 'Your generation',
  1: 'Children',
  2: 'Grandchildren',
  3: 'Great-grandchildren',
};

/** Three generations up and down; click anyone to open them. */
export function FamilyTree({ game }: { game: GameState }): React.JSX.Element {
  const nodes = familyTree(game);
  const gens = [-3, -2, -1, 0, 1, 2, 3].filter((g) => nodes.some((n) => n.gen === g));
  return (
    <Modal title="Family tree" testId="family-tree" onClose={() => app.set({ overlay: null })} wide>
      <div className="tree">
        {gens.map((g) => (
          <section key={g} className="tree-gen" data-testid={`tree-gen-${g}`}>
            <h3 className="section-title">{GEN_LABEL[g]}</h3>
            <div className="tree-row">
              {nodes
                .filter((n) => n.gen === g)
                .map((n) => (
                  <button
                    key={n.id}
                    className={`tree-node${n.isPlayer ? ' me' : ''}${n.alive ? '' : ' dead'}`}
                    data-testid={`tree-node-${n.id}`}
                    disabled={n.isPlayer}
                    onClick={() => app.set({ overlay: null, npcId: n.id })}
                  >
                    <span className="tree-name">{n.name}</span>
                    <span className="muted small">
                      {n.label}, {n.alive ? n.age : '✝'}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
