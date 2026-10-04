import { useState } from 'react';
import type { GameState } from '../../../../engine';
import { relLabel } from '../../../../engine/npc';
import { Modal } from '../../../components/Modal';
import { doAct } from '../../../store/app';

/** Write a will: choose heirs and their shares. */
export function WillEditor({
  game,
  onClose,
}: {
  game: GameState;
  onClose: () => void;
}): React.JSX.Element {
  const candidates = game.npcs.filter(
    (n) =>
      n.alive &&
      n.roles.some((r) =>
        [
          'spouse',
          'partner',
          'child',
          'grandchild',
          'sibling',
          'mother',
          'father',
          'friend',
        ].includes(r),
      ),
  );
  const current = new Map(game.will.heirs.map((h) => [h.npcId, h.share]));
  const [shares, setShares] = useState<Record<number, number>>(() =>
    Object.fromEntries(candidates.map((n) => [n.id, current.get(n.id) ?? 0])),
  );
  const [error, setError] = useState<string | null>(null);
  const total = Object.values(shares).reduce((a, b) => a + b, 0);
  const save = (): void => {
    const heirs = Object.entries(shares)
      .filter(([, v]) => v > 0)
      .map(([id, share]) => ({ npcId: Number(id), share }));
    const err = doAct({ type: 'activity', id: 'write_will', params: { heirs } });
    if (err) setError(err);
    else onClose();
  };
  return (
    <Modal title="Your will" testId="will-editor" onClose={onClose}>
      <p className="muted small">
        Shares are relative; they're turned into percentages. Leave everyone at 0 to split between
        spouse and children.
      </p>
      <ul className="will-list">
        {candidates.map((n) => (
          <li key={n.id} className="row">
            <label className="grow" htmlFor={`will-${n.id}`}>
              {n.first} {n.last}{' '}
              <span className="muted small">{relLabel(n).replace(/^your /, '')}</span>
            </label>
            <input
              id={`will-${n.id}`}
              data-testid={`will-share-${n.id}`}
              type="number"
              min={0}
              max={100}
              value={shares[n.id] ?? 0}
              onChange={(e) =>
                setShares((s) => ({
                  ...s,
                  [n.id]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                }))
              }
            />
            <span className="muted small will-pct">
              {total > 0 ? `${Math.round(((shares[n.id] ?? 0) * 100) / total)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
      {error && <p className="error small">{error}</p>}
      <div className="row">
        <button className="primary" data-testid="will-save" onClick={save}>
          Sign the will
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
