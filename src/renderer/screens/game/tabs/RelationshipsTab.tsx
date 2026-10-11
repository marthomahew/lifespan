import { PET_BY_ID } from '../../../../content/pets';
import { PetPortrait } from '../../../portrait/PetPortrait';
import type { GameState, Npc } from '../../../../engine';
import { npcLook } from '../../../../engine/look';
import { Portrait } from '../../../portrait/Portrait';
import { relLabel } from '../../../../engine/npc';
import { barColour } from '../../../components/StatBar';
import { app } from '../../../store/app';

const GROUPS: { label: string; roles: string[] }[] = [
  {
    label: 'Family',
    roles: ['mother', 'father', 'stepparent', 'sibling', 'grandparent', 'aunt_uncle', 'nibling'],
  },
  { label: 'Love', roles: ['spouse', 'partner', 'sweetheart'] },
  { label: 'Children', roles: ['child', 'grandchild'] },
  { label: 'Friends', roles: ['friend', 'bandmate'] },
  { label: 'Your lab', roles: ['labmate'] },
  {
    label: 'Others',
    roles: ['classmate', 'coworker', 'boss', 'teacher', 'cellmate', 'enemy', 'ex', 'acquaintance'],
  },
];

export function groupNpcs(game: GameState): { label: string; npcs: Npc[] }[] {
  const seen = new Set<number>();
  return GROUPS.map((g) => {
    const npcs = game.npcs.filter((n) => {
      if (seen.has(n.id) || !n.roles.some((r) => g.roles.includes(r))) return false;
      if (
        !n.alive &&
        !['mother', 'father', 'sibling', 'grandparent', 'child', 'spouse'].includes(
          n.roles[0] ?? '',
        )
      )
        return false;
      seen.add(n.id);
      return true;
    });
    return { label: g.label, npcs };
  }).filter((g) => g.npcs.length > 0);
}

export function RelationshipsTab({ game }: { game: GameState }): React.JSX.Element {
  const groups = groupNpcs(game);
  return (
    <div className="col" data-testid="relationships">
      <button
        className="tree-button"
        data-testid="btn-family-tree"
        onClick={() => app.set({ overlay: 'tree' })}
      >
        🌳 Family tree
      </button>
      {game.pets.length > 0 && <PetList game={game} />}
      {groups.map((g) => (
        <section key={g.label} className="panel-section">
          <h3 className="section-title">{g.label}</h3>
          <ul className="npc-list">
            {g.npcs.map((n) => (
              <li key={n.id}>
                <button
                  className="npc-row"
                  data-testid={`npc-${n.id}`}
                  onClick={() => app.set({ npcId: n.id })}
                >
                  <Portrait
                    look={npcLook(game, n)}
                    age={n.age}
                    gender={n.gender}
                    dead={!n.alive}
                    happiness={n.stats.happiness}
                    ill={n.alive && n.stats.health < 30}
                    size={36}
                  />
                  <span className="grow npc-name">
                    <span>
                      {n.first} {n.last}
                    </span>
                    <span className="muted small">
                      {relLabel(n).replace(/^your /, '')},{' '}
                      {n.alive ? `age ${n.age}` : `died ${n.deathYear ?? ''}`}
                    </span>
                  </span>
                  {n.alive ? (
                    <>
                      <span
                        className="mini-bar"
                        aria-label={`Relationship ${n.rel}`}
                        title={`Relationship ${n.rel}/100`}
                        data-testid={`npc-${n.id}-rel`}
                      >
                        <span
                          className={`bar-fill ${barColour(n.rel)}`}
                          style={{ width: `${n.rel}%` }}
                        />
                      </span>
                      <span className="rel-num muted small">{n.rel}</span>
                    </>
                  ) : (
                    <span className="rel-num muted" aria-label="Died">
                      †
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Animals: the living first, then the ones you remember. */
function PetList({ game }: { game: GameState }): React.JSX.Element {
  const pets = [...game.pets].sort((a, b) => Number(b.alive) - Number(a.alive) || b.id - a.id);
  return (
    <section className="panel-section" data-testid="pet-list">
      <h3 className="section-title">Pets</h3>
      <ul className="npc-list">
        {pets.map((p) => (
          <li key={p.id}>
            <button
              className={`npc-row${p.alive ? '' : ' faded'}`}
              data-testid={`pet-${p.id}`}
              onClick={() => app.set({ petId: p.id })}
            >
              <PetPortrait kind={p.kind} id={p.id} size={36} gone={!p.alive} />
              <span className="grow npc-name">
                <span>{p.name}</span>
                <span className="muted small">
                  {(PET_BY_ID[p.kind]?.label ?? p.kind).toLowerCase()},{' '}
                  {p.alive ? `age ${p.age}` : `${p.fate ?? 'gone'} ${p.endYear ?? ''}`}
                </span>
              </span>
              {p.alive ? (
                <>
                  <span
                    className="mini-bar"
                    aria-label={`Bond ${p.bond}`}
                    title={`Bond ${p.bond}/100`}
                  >
                    <span
                      className={`bar-fill ${barColour(p.bond)}`}
                      style={{ width: `${p.bond}%` }}
                    />
                  </span>
                  <span className="rel-num muted small">{p.bond}</span>
                </>
              ) : (
                <span className="rel-num muted" aria-label="Gone">
                  †
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
