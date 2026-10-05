import { useState } from 'react';
import { LANGUAGES, SKILLS } from '../../../../content/skills';
import { avatarEmoji, type GameState } from '../../../../engine';
import { HAIR_STYLES } from '../../../../engine/avatar';
import { Modal } from '../../../components/Modal';

/** Activities that need you to pick something first. */
export const OPTION_ACTIVITIES = ['practice_skill', 'learn_language', 'new_look', 'change_name'];

const TITLE: Record<string, string> = {
  practice_skill: 'Practise which skill?',
  learn_language: 'Learn which language?',
  new_look: 'Pick a new look',
  change_name: 'Your new name',
};

/** Pick what the activity is about, right where you chose it. */
export function OptionDialog({
  game,
  activity,
  onRun,
  onClose,
}: {
  game: GameState;
  activity: string;
  onRun: (params: Record<string, string>) => void;
  onClose: () => void;
}): React.JSX.Element {
  const p = game.player;
  const [first, setFirst] = useState(p.first);
  const [last, setLast] = useState(p.last);
  return (
    <Modal title={TITLE[activity] ?? 'Choose'} testId="option-dialog" onClose={onClose}>
      {activity === 'practice_skill' && (
        <div className="option-grid">
          {SKILLS.map((k) => (
            <button
              key={k.id}
              className="option"
              data-testid={`opt-skill-${k.id}`}
              onClick={() => onRun({ skill: k.id })}
            >
              <span className="option-emoji">{k.emoji}</span>
              <span className="grow">
                {k.label}
                {p.talent === k.id && <span className="talent-star"> ★</span>}
              </span>
              <span className="muted small">{p.skills[k.id] ?? 0}</span>
            </button>
          ))}
        </div>
      )}
      {activity === 'learn_language' && (
        <div className="option-grid">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              className="option"
              data-testid={`opt-lang-${l.id}`}
              onClick={() => onRun({ language: l.id })}
            >
              <span className="grow">{l.label}</span>
              <span className="muted small">{p.languages[l.id] ?? 0}</span>
            </button>
          ))}
        </div>
      )}
      {activity === 'new_look' && (
        <div className="option-grid">
          {HAIR_STYLES.map((h) => (
            <button
              key={h.id}
              className={`option${p.hair === h.id ? ' current' : ''}`}
              data-testid={`opt-hair-${h.id}`}
              disabled={p.hair === h.id}
              onClick={() => onRun({ hair: h.id })}
            >
              <span className="option-emoji">
                {avatarEmoji(30, p.gender, p.appearance, false, h.id)}
              </span>
              <span className="grow">{h.label}</span>
              {p.hair === h.id && <span className="muted small">now</span>}
            </button>
          ))}
        </div>
      )}
      {activity === 'change_name' && (
        <form
          className="buy-form"
          onSubmit={(e) => {
            e.preventDefault();
            onRun({ first, last });
          }}
        >
          <label>
            First name
            <input
              data-testid="opt-first"
              value={first}
              maxLength={40}
              onChange={(e) => setFirst(e.target.value)}
            />
          </label>
          <label>
            Last name
            <input
              data-testid="opt-last"
              value={last}
              maxLength={40}
              onChange={(e) => setLast(e.target.value)}
            />
          </label>
          <button
            className="primary"
            type="submit"
            data-testid="opt-name-go"
            disabled={!first.trim() || !last.trim()}
          >
            Sign the form
          </button>
        </form>
      )}
    </Modal>
  );
}
