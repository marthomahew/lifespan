import { formatMoney, netWorth, type GameState } from '../../../../engine';

export function AssetsTab({ game }: { game: GameState }): React.JSX.Element {
  const m = game.money;
  return (
    <div className="col" data-testid="assets">
      <section className="panel-section">
        <h3 className="section-title">Money</h3>
        <dl className="kv">
          <dt>Cash</dt>
          <dd data-testid="assets-cash">{formatMoney(game, m.cash)}</dd>
          <dt>Savings</dt>
          <dd>{formatMoney(game, m.savings)}</dd>
          <dt>Net worth</dt>
          <dd>{formatMoney(game, netWorth(game))}</dd>
        </dl>
      </section>
    </div>
  );
}
