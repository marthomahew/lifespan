import { FIELD_LABEL, FUNDERS, VENUES, VENUE_TIER_LABEL } from '../../../../content/science';
import {
  acceptOdds,
  activeGrants,
  citations,
  formatMoney,
  funderName,
  grantAmount,
  grantOdds,
  grantReason,
  hIndex,
  publishReason,
  RESEARCH_PIPS,
  scienceOpen,
  scienceReason,
  personalShare,
  type GameState,
} from '../../../../engine';
import { usedThisYear } from '../../../../engine/systems/usage';
import { doAct } from '../../../store/app';
import { ScienceLab } from './ScienceLab';

const pct = (p: number): string => `${Math.round(p * 100)}%`;
const cap = (x: string): string => x.charAt(0).toUpperCase() + x.slice(1);

/** Research: the project on the bench, where to publish it, who might pay, and the record so far. */
export function SciencePanel({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const sc = game.science ?? null;
  const open = scienceOpen(game);
  if (!open && !sc?.papers.length) return null;
  const p = sc?.project ?? null;
  const research = scienceReason(game, 'research');
  const talk = scienceReason(game, 'talk');
  const field = sc?.field;
  const top = [...(sc?.papers ?? [])].sort((a, b) => b.cites - a.cites).slice(0, 5);
  const funders = FUNDERS.filter((f) => funderName(game, f) !== null);
  return (
    <section className="panel-section" data-testid="science">
      <h3 className="section-title">🔬 Research</h3>
      <div className="col small">
        {sc ? (
          <div data-testid="science-record">
            <strong>{cap(sc.institution)}</strong>
            <span className="muted"> · {FIELD_LABEL[sc.field]}</span>
            <div>
              Standing {sc.rep}/100 <span className="muted">(your reputation in the field)</span> ·{' '}
              {sc.papers.length} {sc.papers.length === 1 ? 'paper' : 'papers'} ·{' '}
              {citations(sc.papers)} citations · h-index {hIndex(sc.papers)}
            </div>
          </div>
        ) : (
          <div className="muted">No research yet: start a project below.</div>
        )}
        {open && (
          <>
            <p className="muted">
              Your job moves a project along every year on its own (if research is the job).
              Research pips use work time (up to {RESEARCH_PIPS} a year) and move it faster; grant
              money behind you speeds it up again. When it’s written up, pick a journal: aim higher
              and it’s harder to get in, but far more people read and cite it. Papers keep picking
              up citations for years, and standing opens bigger grants and, one day, prizes. Public
              lectures open at standing 25.
            </p>
            {p && (
              <div data-testid="science-project">
                Project: <strong>{p.title}</strong>
                <span className="muted"> · quality {p.quality}</span>
                <span className="mini-bar thread-bar">
                  <span className="bar-fill" style={{ width: `${p.progress}%` }} />
                </span>
              </div>
            )}
            {p && p.progress >= 100 && field && (
              <div className="col" data-testid="science-venues">
                <span>Where to send it:</span>
                <div className="btn-row wrap">
                  {[0, 1, 2, 3].map((tier) => {
                    const why = publishReason(game, tier);
                    return (
                      <button
                        key={tier}
                        data-testid={`sci-publish-${tier}`}
                        disabled={why !== null}
                        title={why ?? VENUE_TIER_LABEL[tier]}
                        onClick={() => onError(doAct({ type: 'science', id: 'publish', tier }))}
                      >
                        {VENUES[field][tier]} ({why ?? pct(acceptOdds(game, tier))})
                      </button>
                    );
                  })}
                </div>
                <span className="muted">
                  Submitting takes no pips. A rejection lets you try somewhere else.
                </span>
              </div>
            )}
            <div className="btn-row">
              <button
                data-testid="sci-research"
                disabled={research !== null}
                title={research ?? 'One work-time pip'}
                onClick={() => onError(doAct({ type: 'science', id: 'research' }))}
              >
                🧪 Research ({usedThisYear(game, 'sc:research')}/{RESEARCH_PIPS})
              </button>
              <button
                data-testid="sci-talk"
                disabled={talk !== null}
                title={talk ?? 'One work-time pip: a little fame, a little standing'}
                onClick={() => onError(doAct({ type: 'science', id: 'talk' }))}
              >
                🎤 Public lecture
              </button>
            </div>
            <ScienceLab game={game} onError={onError} />
            <strong>Grants</strong>
            <p className="muted">
              A proposal takes one work pip. The answer comes on your next birthday. The money
              mostly goes to the lab: it speeds up your research and lifts your standing, and some
              grants pay you a little on top. A rejection makes your next proposal to the same
              funder stronger.
            </p>
            <ul className="plain col" data-testid="science-funders">
              {funders.map((f) => {
                const why = grantReason(game, f.id);
                const amount = grantAmount(game, f);
                const mine = personalShare(game, { funder: f.id, perYear: amount });
                return (
                  <li key={f.id} className="sci-funder">
                    <span className="grow col">
                      <span>
                        <strong>{cap(f.kind)}</strong> from {funderName(game, f)}
                      </span>
                      <span className="muted">
                        {formatMoney(game, amount * f.years)} over {f.years}{' '}
                        {f.years === 1 ? 'year' : 'years'} ·{' '}
                        {why ?? `about ${pct(grantOdds(game, f))} chance`}
                        {mine > 0 &&
                          ` · ${f.stipend ? 'paid to you' : `about ${formatMoney(game, mine)} a year to you`}`}
                      </span>
                    </span>
                    <button
                      data-testid={`sci-apply-${f.id}`}
                      disabled={why !== null}
                      title={why ?? f.blurb}
                      onClick={() => onError(doAct({ type: 'science', id: 'apply', funder: f.id }))}
                    >
                      Apply
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {sc && sc.pending.length > 0 && (
          <div className="muted" data-testid="science-pending">
            📨 Waiting to hear from {sc.pending.map((x) => x.name).join(', ')}.
          </div>
        )}
        {activeGrants(game).length > 0 && (
          <div data-testid="science-grants">
            Funded by:{' '}
            {activeGrants(game)
              .map((g) => `${g.name} (${g.kind}, ${g.from + g.years - game.year} yrs left)`)
              .join('; ')}
          </div>
        )}
        {top.length > 0 && (
          <ul className="plain" data-testid="science-papers">
            {top.map((x) => (
              <li key={`${x.year}-${x.title}`} className="muted">
                {x.breakthrough ? '🌟 ' : ''}
                {x.year}: {cap(x.title)}, in {x.venue} · {x.cites} citations
              </li>
            ))}
          </ul>
        )}
        {sc && sc.prizes.length > 0 && (
          <div data-testid="science-prizes">🏅 {sc.prizes.join(' · ')}</div>
        )}
      </div>
    </section>
  );
}
