import { formatMoney, heirOptions, type GameState } from '../../engine';
import { npcLook } from '../../engine/look';
import type { Npc } from '../../engine/types';
import { Portrait } from '../portrait/Portrait';
import { continueAs } from '../store/app';

/** Choose an heir and carry on (SPEC §5.15). */
export function ContinueAsChild({ game }: { game: GameState }): React.JSX.Element | null {
  const heirs = heirOptions(game);
  if (!heirs.length) return null;
  const npc = (id: number): Npc | undefined => game.npcs.find((n) => n.id === id);
  return (
    <section className="heirs" data-testid="heirs">
      <h3 className="section-title">Continue as a child</h3>
      <ul className="plain">
        {heirs.map((h, i) => (
          <li key={h.id} className="heir-row">
            <HeirFace game={game} npc={npc(h.id)} />
            <span className="grow">
              {h.name}, {h.age}
              <span className="muted small">
                {' '}
                · relationship {h.rel} · inherits {formatMoney(game, h.money)}
              </span>
            </span>
            <button
              className={i === 0 ? 'primary' : ''}
              data-testid={`heir-${h.id}`}
              onClick={() => continueAs(h.id)}
            >
              Continue as {h.name.split(' ')[0]}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HeirFace({
  game,
  npc,
}: {
  game: GameState;
  npc: Npc | undefined;
}): React.JSX.Element | null {
  if (!npc) return null;
  return <Portrait look={npcLook(game, npc)} age={npc.age} gender={npc.gender} size={40} />;
}
