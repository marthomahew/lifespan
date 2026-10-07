import { LIFESTYLE, LIFESTYLE_BY_ID, TIERS } from '../../../../content/lifestyle';
import {
  formatMoney,
  lifestyleCost,
  lifestyleOwned,
  lifestyleReason,
  lifestyleUpkeep,
  wealthTier,
  type GameState,
} from '../../../../engine';
import { FoldTitle } from '../../../components/Fold';
import { doAct } from '../../../store/app';

/** What wealth unlocks, tier by tier, and what you already have. */
export function GoodLife({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  if (game.player.age < 18) return null;
  const tier = wealthTier(game);
  const rank = tier ? TIERS.findIndex((t) => t.id === tier) : -1;
  const mine = lifestyleOwned(game);
  // Show your tier and the next one up (as something to aim for).
  const shown = TIERS.filter((_, i) => i <= rank + 1);
  return (
    <section className="panel-section" data-testid="good-life">
      <FoldTitle id="good-life" title="The good life">
        {mine.length > 0 && (
          <ul className="plain col small" data-testid="good-life-owned">
            {mine.map((x) => {
              const def = LIFESTYLE_BY_ID[x.id];
              if (!def) return null;
              return (
                <li key={x.key} className="row">
                  <span className="grow">
                    {def.emoji} {def.label}
                    <span className="muted">
                      {x.value !== undefined ? ` · worth ${formatMoney(game, x.value)}` : ''}
                      {def.upkeep
                        ? ` · ${formatMoney(game, lifestyleUpkeep(game, def))} a year`
                        : ''}
                      {x.payout ? ` · pays out (or doesn't) in ${x.payout}` : ''}
                    </span>
                  </span>
                  {!x.payout && x.id !== 'pledge' && (
                    <button
                      className="small"
                      data-testid={`gl-end-${x.id}`}
                      onClick={() => onError(doAct({ type: 'lifestyle_end', key: x.key }))}
                    >
                      {x.value !== undefined ? 'Sell' : 'Stop'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {shown.map((t, i) => (
          <div key={t.id} className="col small gl-tier" data-testid={`gl-tier-${t.id}`}>
            <strong>
              {t.label}
              <span className="muted">
                {' '}
                · net worth {formatMoney(game, Math.round(t.netWorth * game.inflation))}+
                {i > rank ? ' (not yet)' : ''}
              </span>
            </strong>
            <span className="muted">{t.blurb}</span>
            <ul className="plain col">
              {LIFESTYLE.filter((d) => d.tier === t.id).map((d) => {
                const why = lifestyleReason(game, d.id);
                if (why?.startsWith('from ')) return null;
                const cost = lifestyleCost(game, d);
                const upkeep = lifestyleUpkeep(game, d);
                return (
                  <li key={d.id} className="row">
                    <button
                      data-testid={`gl-${d.id}`}
                      disabled={why !== null}
                      title={why ?? d.description}
                      onClick={() => onError(doAct({ type: 'lifestyle', id: d.id }))}
                    >
                      {d.emoji} {d.label}
                    </button>
                    <span className="muted">
                      {cost ? formatMoney(game, cost) : ''}
                      {cost && upkeep ? ' + ' : ''}
                      {upkeep ? `${formatMoney(game, upkeep)} a year` : ''}
                      {why && !why.startsWith('needs a net worth') ? ` · ${why}` : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </FoldTitle>
    </section>
  );
}
