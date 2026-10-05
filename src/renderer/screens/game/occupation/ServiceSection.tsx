import { useState } from 'react';
import { BRANCHES, SPECIALTIES, SPECIALTY_BY_ID } from '../../../../content/military';
import {
  enlistReason,
  MUSIC_STAGES,
  musicReason,
  rankTitle,
  type GameState,
  type MusicActionId,
} from '../../../../engine';
import { doAct } from '../../../store/app';
import { cap } from '../../../components/text';

export function MilitarySection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const [branch, setBranch] = useState<string>(BRANCHES[0]);
  const [spec, setSpec] = useState(SPECIALTIES[0]?.id ?? 'infantry');
  const [officer, setOfficer] = useState(false);
  const m = game.military;
  if (game.player.age < 16) return null;
  const reason = enlistReason(game, officer);
  return (
    <section className="panel-section" data-testid="military-section">
      <h3 className="section-title">Military</h3>
      {m?.active ? (
        <div className="col">
          <div data-testid="military-rank">
            🎖️ {rankTitle(game)}, {m.branch} · {SPECIALTY_BY_ID[m.specialty]?.label}
          </div>
          <div className="muted small">
            {game.year - m.since} years served · {m.deployments} deployments
            {m.medals.length ? ` · ${m.medals.join(', ')}` : ''}
          </div>
          <button data-testid="btn-discharge" onClick={() => onError(doAct({ type: 'discharge' }))}>
            Request discharge
          </button>
        </div>
      ) : (
        <>
          {m && (
            <p className="small" data-testid="veteran">
              Veteran of the {m.branch} · {m.discharge} discharge
            </p>
          )}
          <details className="enlist-details" data-testid="enlist-details">
            <summary data-testid="enlist-open">Join the military…</summary>
            <form
              className="enroll"
              data-testid="enlist-form"
              onSubmit={(e) => {
                e.preventDefault();
                onError(doAct({ type: 'enlist', branch, specialty: spec, officer }));
              }}
            >
              <select
                aria-label="Branch"
                data-testid="enlist-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <select
                aria-label="Specialty"
                data-testid="enlist-specialty"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
              >
                {SPECIALTIES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
              <label className="row small">
                <input
                  type="checkbox"
                  checked={officer}
                  onChange={(e) => setOfficer(e.target.checked)}
                />{' '}
                Officer
              </label>
              <button
                type="submit"
                data-testid="btn-enlist"
                disabled={reason !== null}
                title={reason ?? undefined}
              >
                Enlist
              </button>
              {reason && <span className="muted small enroll-note">{cap(reason)}</span>}
            </form>
          </details>
        </>
      )}
    </section>
  );
}

const MUSIC_ACTIONS: { id: MusicActionId; label: string }[] = [
  { id: 'busk', label: 'Busk' },
  { id: 'open_mic', label: 'Open mic' },
  { id: 'gig', label: 'Play a gig' },
  { id: 'form_band', label: 'Form a band' },
  { id: 'go_solo', label: 'Go solo' },
  { id: 'release', label: 'Release music' },
  { id: 'tour', label: 'Tour' },
];

export function MusicSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const m = game.music;
  if (game.player.age < 12) return null;
  const any = MUSIC_ACTIONS.some((a) => musicReason(game, a.id) === null) || m.stage > 0;
  if (!any) return null;
  return (
    <section className="panel-section" data-testid="music-section">
      <h3 className="section-title">Music and fame</h3>
      <div className="small">
        {MUSIC_STAGES[m.stage]}
        {m.act ? ` · ${m.act}` : ''}
        {m.label ? ` · signed to ${m.label}` : ''} · fame {game.player.stats.fame}
      </div>
      <div className="btn-row">
        {MUSIC_ACTIONS.map((a) => {
          const why = musicReason(game, a.id);
          if (why && why !== 'done this year' && !(m.stage > 0)) return null;
          return (
            <button
              key={a.id}
              data-testid={`music-${a.id}`}
              disabled={why !== null}
              title={why ?? undefined}
              onClick={() => onError(doAct({ type: 'music', id: a.id }))}
            >
              {a.label}
            </button>
          );
        })}
      </div>
      {m.releases.length > 0 && (
        <ul className="plain small" data-testid="releases">
          {m.releases.slice(-5).map((r) => (
            <li key={`${r.year}-${r.title}`}>
              💿 “{r.title}” ({r.year}) · {r.quality}/100
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
