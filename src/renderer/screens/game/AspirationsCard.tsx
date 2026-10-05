import { ASPIRATION_BY_ID } from '../../../content/aspirations';
import { CHALLENGE_BY_ID } from '../../../content/challenges';
import type { GameState } from '../../../engine';
import { ASPIRATION_MIN_AGE, MAX_ACTIVE_ASPIRATIONS } from '../../../engine/systems/aspirations';
import { app, doAct } from '../../store/app';

/** The player's chosen life goals: open ones can be dropped, reached ones get a tick. */
export function AspirationsCard({ game }: { game: GameState }): React.JSX.Element | null {
  const goals = game.player.aspirations;
  const open = goals.filter((g) => g.done === null).length;
  const canChoose = game.player.age >= ASPIRATION_MIN_AGE && open < MAX_ACTIVE_ASPIRATIONS;
  const ch = game.challenge ? CHALLENGE_BY_ID[game.challenge.id] : undefined;
  if (!goals.length && !ch && game.player.age < ASPIRATION_MIN_AGE) return null;
  return (
    <section className="card pad" aria-label="Life goals" data-testid="goals-card">
      <h3 className="section-title">Life goals</h3>
      {ch && game.challenge && (
        <p className="goal-challenge" data-testid="goal-challenge" title={ch.premise}>
          {game.challenge.status === 'won'
            ? '✅'
            : game.challenge.status === 'lost'
              ? '✖️'
              : ch.emoji}{' '}
          <strong>{ch.title}</strong>
          <br />
          <span className="muted small">{ch.goal}</span>
        </p>
      )}
      <ul className="plain goals">
        {goals.map((g) => {
          const def = ASPIRATION_BY_ID[g.id];
          return (
            <li key={g.id} className={g.done !== null ? 'done' : ''} data-testid={`goal-${g.id}`}>
              <span aria-hidden="true">{g.done !== null ? '✅' : def?.emoji}</span>{' '}
              <span className="grow">{def?.label ?? g.id}</span>
              {g.done === null && (
                <button
                  className="ghost small"
                  aria-label={`Drop goal: ${def?.label ?? g.id}`}
                  data-testid={`goal-drop-${g.id}`}
                  onClick={() => doAct({ type: 'aspiration', op: 'drop', id: g.id })}
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {canChoose && (
        <button
          className="small"
          data-testid="btn-choose-goal"
          onClick={() => app.set({ overlay: 'goals' })}
        >
          {goals.length ? 'Add a goal…' : 'Choose a life goal…'}
        </button>
      )}
    </section>
  );
}
