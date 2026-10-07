import { missionReason, type GameState, type MissionAction } from '../../../../engine';
import { doAct } from '../../../store/app';

const HEAD: Record<string, string> = {
  astronaut: '🚀 Space',
  intelligence_officer: '🕶️ The service',
  diplomat: '🌐 Postings',
};

/** Astronauts' flights, spies' operations, diplomats' postings: the record of a special career. */
export function MissionPanel({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const job = game.career.jobId ?? '';
  const m = game.missions;
  if (!HEAD[job]) return null;
  const btn = (label: string, a: MissionAction): React.JSX.Element => {
    const why = missionReason(game, a);
    return (
      <button
        data-testid={`mission-${a}`}
        disabled={why !== null}
        title={why ?? ''}
        onClick={() => onError(doAct({ type: 'mission', id: a }))}
      >
        {label}
      </button>
    );
  };
  const recent = [...(m?.log ?? [])].reverse().slice(0, 6);
  return (
    <section className="panel-section" data-testid="missions">
      <h3 className="section-title">{HEAD[job]}</h3>
      <div className="col small">
        {m && <div className="muted">With {m.org}.</div>}
        {job === 'astronaut' && (
          <div data-testid="space-record">
            {m?.log.length ?? 0} flights · {m?.days ?? 0} days in space · {m?.walks ?? 0} spacewalks
            {m?.moon ? ' · 🌕 walked on the Moon' : ''}
          </div>
        )}
        {job === 'intelligence_officer' && (
          <>
            <div>
              {m?.log.filter((x) => x.ok).length ?? 0} successful operations · {m?.assets ?? 0}{' '}
              sources run · heat {m?.heat ?? 0}/100
            </div>
            <div className="btn-row">
              {btn('🕶️ Request an operation', 'operation')}
              {btn('🧥 Lie low', 'lie_low')}
            </div>
          </>
        )}
        {job === 'diplomat' && (
          <>
            <div>
              {m?.post ? `Posted to ${m.post} since ${m.postSince}` : 'Awaiting a posting'} ·{' '}
              {m?.treaties ?? 0} agreements signed
            </div>
            <div className="btn-row">{btn('🖋️ Negotiate an agreement', 'negotiate')}</div>
          </>
        )}
        {recent.length > 0 && (
          <ul className="plain">
            {recent.map((x, i) => (
              <li key={`${x.year}-${i}`} className="muted">
                {x.year}: {x.what}
                {x.ok ? '' : ' ✗'}
              </li>
            ))}
          </ul>
        )}
        <p className="muted">
          {job === 'astronaut'
            ? 'Flights follow the era: capsules, the Moon (1969–72), the Shuttle, the space station, and the Moon again from 2026. Promotion comes with flights flown.'
            : job === 'intelligence_officer'
              ? 'Operations abroad build your record and your heat; too much heat and your cover is blown. Languages help.'
              : 'A new country every three years; you pick up the language as you go. Agreements signed lift your standing.'}
        </p>
      </div>
    </section>
  );
}
