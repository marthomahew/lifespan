import { useState } from 'react';
import { PARTIES, PARTY_BY_ID, POLICY_AREAS, type PartyId } from '../../../../content/politics';
import {
  officeName,
  politicsReason,
  type GameState,
  type PoliticsAction,
} from '../../../../engine';
import { barColour } from '../../../components/StatBar';
import { doAct } from '../../../store/app';

/** A politician's desk: party, approval, the next election, bills, and the climb. */
export function PoliticsPanel({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const p = game.politics;
  const [area, setArea] = useState(POLICY_AREAS[0]?.id ?? 'schools');
  const [party, setParty] = useState<PartyId>('centrist');
  if (!p) {
    // Anyone can stand for the council from 21.
    if (game.player.age < 21 || game.career.jobId === 'professional_athlete') return null;
    const why = politicsReason(game, { op: 'run_again' });
    return (
      <section className="panel-section" data-testid="politics">
        <h3 className="section-title">🏛️ Politics</h3>
        <div className="row small">
          <button
            data-testid="pol-run-again"
            disabled={why !== null}
            title={why ?? 'Fame, karma and smarts win votes'}
            onClick={() => onError(doAct({ type: 'politics', action: { op: 'run_again' } }))}
          >
            🗳️ Stand for the local council
          </button>
          <span className="muted">A first step into politics. Fame, karma and smarts help.</span>
        </div>
      </section>
    );
  }
  const inOffice = game.career.jobId === 'politician';
  const run = (action: PoliticsAction): void => onError(doAct({ type: 'politics', action }));
  const btn = (label: string, action: PoliticsAction, testId: string): React.JSX.Element => {
    const why = politicsReason(game, action);
    return (
      <button
        data-testid={testId}
        disabled={why !== null}
        title={why ?? ''}
        onClick={() => run(action)}
      >
        {label}
      </button>
    );
  };
  const last = p.elections.at(-1);
  const passed = p.bills.filter((b) => b.passed);
  return (
    <section className="panel-section" data-testid="politics">
      <h3 className="section-title">🏛️ Politics</h3>
      {inOffice ? (
        <div className="col small">
          <div>
            <strong>{officeName(game, game.career.level)}</strong>
            <span className="muted">
              {' '}
              · {PARTY_BY_ID[p.party].emoji} {PARTY_BY_ID[p.party].label}
              {p.leader ? ' (leader)' : ''} · {p.inGovernment ? 'in government' : 'in opposition'}
            </span>
          </div>
          <div className="row" data-testid="approval">
            <span>Approval {p.approval}</span>
            <span className="mini-bar grow" aria-label={`Approval ${p.approval}`}>
              <span
                className={`bar-fill ${barColour(p.approval)}`}
                style={{ width: `${p.approval}%` }}
              />
            </span>
          </div>
          <div className="muted">
            Next election {p.termEnds}
            {p.target !== undefined ? `, standing for ${officeName(game, p.target)}` : ''}. General
            elections every four years decide who governs. Campaign fund: $
            {p.fund.toLocaleString('en-US')}.
            {last
              ? ` Last result: ${last.won ? 'won' : 'lost'} ${last.office}, ${last.share}%.`
              : ''}
          </div>
          <div className="btn-row">
            {btn('📣 Campaign', { op: 'campaign' }, 'pol-campaign')}
            {btn('💰 Fundraise', { op: 'fundraise' }, 'pol-fundraise')}
            {game.career.level < 2
              ? btn(
                  `🗳️ Run for ${officeName(game, game.career.level + 1)}`,
                  { op: 'run_higher' },
                  'pol-run-higher',
                )
              : btn('👑 Run for party leader', { op: 'run_leader' }, 'pol-run-leader')}
          </div>
          <div className="row">
            <select
              aria-label="Policy"
              data-testid="pol-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              {POLICY_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.emoji} {a.label}
                </option>
              ))}
            </select>
            {btn('Propose a bill', { op: 'bill', area }, 'pol-bill')}
          </div>
          {passed.length > 0 && (
            <div className="muted" data-testid="pol-bills">
              Bills passed:{' '}
              {passed
                .map(
                  (b) =>
                    `${POLICY_AREAS.find((a) => a.id === b.area)?.label ?? b.area} (${b.year})`,
                )
                .join(', ')}
            </div>
          )}
          <div className="row">
            <select
              aria-label="Party"
              data-testid="pol-party"
              value={party}
              onChange={(e) => setParty(e.target.value as PartyId)}
            >
              {PARTIES.filter((x) => x.id !== p.party).map((x) => (
                <option key={x.id} value={x.id} title={x.blurb}>
                  {x.emoji} {x.label}
                </option>
              ))}
            </select>
            {btn('Switch party', { op: 'switch_party', party }, 'pol-switch')}
            {btn('Stand down', { op: 'stand_down' }, 'pol-stand-down')}
          </div>
          <p className="muted">
            Approval follows your record, your fame and the economy. Bills your party’s voters like
            lift it; a recession hurts whoever governs. Win your seat at each election; climb from
            the council to the legislature, then lead your party to the top job.
          </p>
        </div>
      ) : (
        <div className="col small">
          <div className="muted">
            Out of office.{' '}
            {last
              ? `Last election: ${last.won ? 'won' : 'lost'} ${last.office}, ${last.share}%.`
              : ''}
          </div>
          <div className="btn-row">
            {btn('🗳️ Run for the council again', { op: 'run_again' }, 'pol-run-again')}
          </div>
        </div>
      )}
    </section>
  );
}
