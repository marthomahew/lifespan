import {
  CREW_JOBS,
  RANKS,
  formatMoney,
  jobReason,
  joinReason,
  type GameState,
  type UnderworldAction,
} from '../../../../engine';
import { FoldTitle } from '../../../components/Fold';
import { doAct } from '../../../store/app';

/** Organised crime: join a crew, take jobs, rise through the ranks (or get out). */
export function UnderworldSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const u = game.underworld;
  if (game.player.age < 18 || game.legal.prison) return null;
  const run = (action: UnderworldAction): void => onError(doAct({ type: 'underworld', action }));
  const join = joinReason(game);
  if (!u || u.informant) {
    if (join && !u) return null;
    return (
      <section className="panel-section" data-testid="underworld">
        <FoldTitle id="underworld" title="The underworld">
          <p className="muted small">
            {u?.informant
              ? 'You turned informant. That life is closed to you now.'
              : 'Your record has been noticed. A crew is interested.'}
          </p>
          {!u && (
            <button data-testid="uw-join" onClick={() => run({ op: 'join' })}>
              🕴️ Join a crew
            </button>
          )}
        </FoldTitle>
      </section>
    );
  }
  const last = u.jobs.at(-1);
  return (
    <section className="panel-section" data-testid="underworld">
      <FoldTitle id="underworld" title="The underworld">
        <div className="col small">
          <div>
            <strong>{RANKS[u.rank]}</strong>
            <span className="muted">
              {' '}
              · {u.crew} · respect {u.respect} · heat {u.heat}/100
            </span>
          </div>
          {last && (
            <div className="muted">
              Last job: {last.job} ({last.year}) ·{' '}
              {last.ok ? formatMoney(game, last.take) : 'went wrong'}
            </div>
          )}
          <ul className="plain col">
            {CREW_JOBS.map((j) => {
              const why = jobReason(game, j.id);
              return (
                <li key={j.id} className="row">
                  <button
                    data-testid={`uw-job-${j.id}`}
                    disabled={why !== null}
                    title={why ?? ''}
                    onClick={() => run({ op: 'job', id: j.id })}
                  >
                    {j.emoji} {j.label}
                  </button>
                  {why && <span className="muted">{why}</span>}
                </li>
              );
            })}
          </ul>
          <div className="btn-row">
            <button data-testid="uw-lie-low" onClick={() => run({ op: 'lie_low' })}>
              🕶️ Lie low
            </button>
            <button
              className="quiet-danger"
              data-testid="uw-inform"
              onClick={() => run({ op: 'inform' })}
            >
              🛡️ Turn informant
            </button>
          </div>
          <p className="muted">
            Jobs pay and build respect; respect brings rank, and lieutenants and bosses collect a
            share every year. Heat brings detectives. Turning informant ends it, with a new name.
          </p>
        </div>
      </FoldTitle>
    </section>
  );
}
