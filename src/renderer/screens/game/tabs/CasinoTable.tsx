import { useMemo, useState } from 'react';
import { formatMoney, type GameState } from '../../../../engine';
import { money } from '../../../../engine/economy';
import {
  betOptions,
  handValue,
  MAX_HANDS,
  playSession,
  RANKS,
  shoeFor,
  SUITS,
  type Card,
  type Move,
} from '../../../../engine/systems/blackjack';

const VERDICT: Record<string, string> = {
  bust: 'Bust',
  blackjack: 'Blackjack!',
  win: 'You win',
  lose: 'House wins',
  push: 'Push',
};

function CardFace({ card, down = false }: { card: Card; down?: boolean }): React.JSX.Element {
  if (down) return <span className="bj-card down" aria-label="Face-down card" />;
  const red = card.suit === 1 || card.suit === 2;
  return (
    <span className={`bj-card${red ? ' red' : ''}`}>
      {RANKS[card.rank]}
      {SUITS[card.suit]}
    </span>
  );
}

/** Blackjack: pick a table, play up to five hands, cash out. */
export function CasinoTable({
  game,
  onRun,
}: {
  game: GameState;
  onRun: (params: Record<string, string | number>) => void;
}): React.JSX.Element {
  const shoe = useMemo(() => shoeFor(game), [game]);
  const bets = betOptions(game, (r) => money(game, r));
  const [bet, setBet] = useState<number | null>(null);
  const [plan, setPlan] = useState('');
  const session = playSession(shoe, plan);
  const hand = session.hands.at(-1);
  const add = (m: Move): void => setPlan((p) => p + m);
  if (bet === null)
    return (
      <div className="casino" data-testid="casino-table">
        <p className="muted small">
          Blackjack. Dealer stands on 17; a natural pays 3 to 2. Pick a table.
        </p>
        {bets.length === 0 && (
          <p className="error small">You cannot cover even the smallest table tonight.</p>
        )}
        <div className="row wrap">
          {bets.map((b, i) => (
            <button key={b} data-testid={`bj-bet-${i}`} onClick={() => setBet(b)}>
              {formatMoney(game, b)} a hand
            </button>
          ))}
          <button className="quiet-danger" data-testid="bj-dice" onClick={() => onRun({})}>
            Skip the cards, try the dice
          </button>
        </div>
      </div>
    );
  const playing = session.waiting && hand?.status === 'playing';
  const played = session.hands.length;
  const netMoney = Math.round(session.net * bet);
  return (
    <div className="casino" data-testid="casino-table">
      <div className="bj-row">
        <span className="small muted">Dealer</span>
        <span className="bj-cards" data-testid="bj-dealer">
          {hand?.dealer.map((c, i) => (
            <CardFace key={i} card={c} down={hand.hidden && i === 1} />
          ))}
        </span>
        {hand && !hand.hidden && <span className="small">{handValue(hand.dealer).total}</span>}
      </div>
      <div className="bj-row">
        <span className="small muted">You</span>
        <span className="bj-cards" data-testid="bj-player">
          {hand?.cards.map((c, i) => (
            <CardFace key={i} card={c} />
          ))}
        </span>
        {hand && (
          <span className="small" data-testid="bj-total">
            {handValue(hand.cards).total}
          </span>
        )}
      </div>
      <p className="bj-status" data-testid="bj-status" data-hand={hand?.status ?? 'none'}>
        {hand && hand.status !== 'playing' ? VERDICT[hand.status] : 'Your move.'}{' '}
        <span className="muted small">
          Hand {Math.max(1, played)} of {MAX_HANDS} · tonight {netMoney >= 0 ? '+' : '−'}
          {formatMoney(game, Math.abs(netMoney))}
        </span>
      </p>
      <div className="row wrap">
        {playing ? (
          <>
            <button data-testid="bj-hit" onClick={() => add('H')}>
              Hit
            </button>
            <button data-testid="bj-stand" onClick={() => add('S')}>
              Stand
            </button>
            {hand && hand.cards.length === 2 && (
              <button data-testid="bj-double" onClick={() => add('D')}>
                Double
              </button>
            )}
          </>
        ) : (
          <>
            {played < MAX_HANDS && (
              <button
                className="primary"
                data-testid="bj-next"
                onClick={() => setPlan((p) => `${p}|`)}
              >
                Deal another
              </button>
            )}
            <button data-testid="bj-cashout" onClick={() => onRun({ plan, bet })}>
              Cash out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
