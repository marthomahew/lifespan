import { useState } from 'react';
import { npcLook } from '../../../engine/look';
import { Portrait } from '../../portrait/Portrait';
import { formatMoney, interactionsFor, money, type GameState } from '../../../engine';
import { WEDDING_COST } from '../../../engine/systems/romance';
import { relLabel } from '../../../engine/npc';
import { TRAIT_BY_ID } from '../../../content/traits';
import { Modal } from '../../components/Modal';
import { barColour } from '../../components/StatBar';
import { app, doAct } from '../../store/app';
import { GiftForm } from './GiftForm';
import type { GiftParams } from '../../../engine/systems/gifts';

/** Someone in your life: who they are, what they remember, and what you can do together. */
export function NpcPanel({
  game,
  npcId,
}: {
  game: GameState;
  npcId: number;
}): React.JSX.Element | null {
  const n = game.npcs.find((x) => x.id === npcId);
  const [error, setError] = useState<string | null>(null);
  const [wedding, setWedding] = useState(false);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small');
  const [prenup, setPrenup] = useState(false);
  const [gifting, setGifting] = useState(false);
  const [openedAt] = useState(game.log.length);
  if (!n) return null;
  const close = (): void => app.set({ npcId: null });
  const views = interactionsFor(game, n);
  const run = (id: string, gift?: GiftParams): void => {
    if (id === 'plan_wedding' && !wedding) {
      setWedding(true);
      return;
    }
    if (id === 'gift' && !gifting) {
      setGifting(true);
      return;
    }
    const err = doAct({
      type: 'interact',
      npcId: n.id,
      id,
      ...(id === 'plan_wedding' ? { params: { size, prenup } } : {}),
      ...(id === 'gift' && gift ? { params: { gift } } : {}),
    });
    setError(err);
    setWedding(false);
    setGifting(false);
  };
  // Only what happened while this panel was open, not whatever the log said before.
  const lastLog = game.log.length > openedAt ? game.log.at(-1) : undefined;
  return (
    <Modal title={`${n.first} ${n.last}`} testId="npc-panel" onClose={close} wide>
      <div className="npc-panel">
        <div className="npc-head">
          <Portrait
            look={npcLook(game, n)}
            age={n.age}
            gender={n.gender}
            dead={!n.alive}
            size={72}
            testId="npc-portrait"
          />
          <div className="grow">
            <div className="muted">
              {relLabel(n).replace(/^your /, '')} ·{' '}
              {n.alive
                ? `age ${n.age}`
                : `died ${n.deathYear ?? ''}${n.deathCause ? `, ${n.deathCause}` : ''}`}
              {n.job ? ` · ${n.job}` : ''}
              {game.family.custodyLost.includes(n.id) ? ' · lives with your ex' : ''}
            </div>
            <div className="chips">
              {n.traits.map((t) => (
                <span key={t} className="chip">
                  {TRAIT_BY_ID[t]?.emoji} {TRAIT_BY_ID[t]?.label ?? t}
                </span>
              ))}
            </div>
          </div>
          {n.alive && (
            <div className="npc-rel">
              <span className="muted small">Relationship</span>
              <div
                className="bar"
                role="meter"
                aria-label="Relationship"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={n.rel}
                data-testid="npc-rel-bar"
                data-value={n.rel}
              >
                <div className={`bar-fill ${barColour(n.rel)}`} style={{ width: `${n.rel}%` }} />
              </div>
              <span className="stat-value" data-testid="npc-rel-value">
                {n.rel}
              </span>
            </div>
          )}
        </div>
        <div className="npc-cols">
          <section>
            <h3 className="section-title">Things to do</h3>
            {n.alive ? (
              <div className="interactions" data-testid="interactions">
                {views
                  .filter(
                    (v) =>
                      v.enabled || v.reason === 'done this year' || v.reason.startsWith('costs'),
                  )
                  .map((v) => (
                    <button
                      key={v.id}
                      className="interaction"
                      data-testid={`int-${v.id}`}
                      disabled={!v.enabled}
                      title={v.reason || undefined}
                      onClick={() => run(v.id)}
                    >
                      <span aria-hidden="true">{v.emoji}</span> {v.label}
                      {v.reason && <span className="muted small"> · {v.reason}</span>}
                    </button>
                  ))}
              </div>
            ) : (
              <p className="muted">Gone, but remembered.</p>
            )}
            {gifting && <GiftForm game={game} onGive={(g) => run('gift', g)} />}
            {wedding && (
              <form
                className="card pad wedding"
                data-testid="wedding-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  run('plan_wedding');
                }}
              >
                <label>
                  Size
                  <select
                    data-testid="wedding-size"
                    value={size}
                    onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}
                  >
                    <option value="small">
                      Small · {formatMoney(game, money(game, WEDDING_COST.small))}
                    </option>
                    <option value="medium">
                      Medium · {formatMoney(game, money(game, WEDDING_COST.medium))}
                    </option>
                    <option value="large">
                      Large · {formatMoney(game, money(game, WEDDING_COST.large))}
                    </option>
                  </select>
                </label>
                <label className="row">
                  <input
                    type="checkbox"
                    data-testid="wedding-prenup"
                    checked={prenup}
                    onChange={(e) => setPrenup(e.target.checked)}
                  />{' '}
                  Sign a prenup
                </label>
                <button className="primary" type="submit" data-testid="wedding-go">
                  Get married
                </button>
              </form>
            )}
            {error && (
              <p className="error small" role="alert" data-testid="npc-error">
                {error}
              </p>
            )}
            {lastLog && (
              <p className="npc-last" data-testid="npc-last-log">
                {lastLog.text}
              </p>
            )}
          </section>
          <section>
            <h3 className="section-title">{n.first} remembers</h3>
            <ul className="memories" data-testid="memories">
              {[...n.memory].reverse().map((m, i) => (
                <li key={`${m.year}-${i}`} data-testid="memory-line">
                  <span className="muted small">{m.year}</span> {m.text}
                  <span className={`delta ${m.delta >= 0 ? 'up' : 'down'}`}>
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </span>
                </li>
              ))}
              {!n.memory.length && <li className="muted">Nothing yet.</li>}
            </ul>
          </section>
        </div>
      </div>
    </Modal>
  );
}
