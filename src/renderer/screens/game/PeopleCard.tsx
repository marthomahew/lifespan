import { closeness, closestPeople, npcSketch, type GameState } from '../../../engine';
import { npcLook } from '../../../engine/look';
import { relLabel } from '../../../engine/npc';
import { Portrait } from '../../portrait/Portrait';
import { app } from '../../store/app';

/** The people closest to you, always in view: their faces, who they are, and how they feel. */
export function PeopleCard({ game }: { game: GameState }): React.JSX.Element | null {
  const people = closestPeople(game);
  if (!people.length) return null;
  return (
    <section className="card pad" aria-label="Your people" data-testid="people-card">
      <h3 className="section-title">Your people</h3>
      <ul className="people">
        {people.map((n) => (
          <li key={n.id}>
            <button
              className="person"
              data-testid={`person-${n.id}`}
              title={npcSketch(n)}
              onClick={() => app.set({ npcId: n.id })}
            >
              <Portrait
                look={npcLook(game, n)}
                age={n.age}
                gender={n.gender}
                happiness={n.stats.happiness}
                ill={n.stats.health < 30}
                size={40}
              />
              <span className="grow person-text">
                <span className="person-name">{n.first}</span>
                <span className="muted small person-sketch">
                  {relLabel(n).replace(/^your /, '')} · {closeness(n)}
                </span>
              </span>
              <span className="mini-bar" aria-label={`Relationship ${n.rel}`}>
                <span
                  className={`bar-fill ${n.rel < 30 ? 'red' : n.rel < 60 ? 'amber' : 'green'}`}
                  style={{ width: `${n.rel}%` }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
