import type { GameState, Npc } from '../../../../engine';
import { relLabel } from '../../../../engine/npc';
import { barColour } from '../../../components/StatBar';
import { app } from '../../../store/app';

const GROUPS: { label: string; roles: string[] }[] = [
  { label: 'Family', roles: ['mother', 'father', 'stepparent', 'sibling', 'grandparent'] },
  { label: 'Love', roles: ['spouse', 'partner'] },
  { label: 'Children', roles: ['child', 'grandchild'] },
  { label: 'Friends', roles: ['friend', 'bandmate'] },
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
                  <span className="grow npc-name">
                    <span>
                      {n.first} {n.last}
                    </span>
                    <span className="muted small">
                      {relLabel(n).replace(/^your /, '')},{' '}
                      {n.alive ? `age ${n.age}` : `died ${n.deathYear ?? ''}`}
                    </span>
                  </span>
                  {n.alive && (
                    <span
                      className="mini-bar"
                      aria-label={`Relationship ${n.rel}`}
                      data-testid={`npc-${n.id}-rel`}
                    >
                      <span
                        className={`bar-fill ${barColour(n.rel)}`}
                        style={{ width: `${n.rel}%` }}
                      />
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
