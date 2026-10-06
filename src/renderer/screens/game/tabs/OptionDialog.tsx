import { useState } from 'react';
import { LANGUAGES, SKILLS } from '../../../../content/skills';
import type { GameState } from '../../../../engine';
import { LOOK_TABS, LookBuilder } from '../../../portrait/LookBuilder';
import { Portrait } from '../../../portrait/Portrait';
import { PetPicker } from './PetPicker';
import { Modal } from '../../../components/Modal';

/** Activities that need you to pick something first. */
export const OPTION_ACTIVITIES = [
  'practice_skill',
  'learn_language',
  'new_look',
  'change_name',
  'plastic_surgery',
  'adopt_pet',
];

/** What a salon, a razor, an optician and a shop can change. */
const MAKEOVER_TABS = LOOK_TABS.filter((t) =>
  ['hair', 'facialHair', 'glasses', 'top', 'hat', 'earrings'].includes(t.id),
);

/** What a surgeon can change (eye colour stays yours). */
const SURGERY_TABS = LOOK_TABS.filter((t) =>
  ['face', 'eyes', 'brows', 'nose', 'mouth'].includes(t.id),
).map(({ colors: _colors, ...t }) => t);

const TITLE: Record<string, string> = {
  practice_skill: 'Practise which skill?',
  learn_language: 'Learn which language?',
  new_look: 'Pick a new look',
  change_name: 'Your new name',
  plastic_surgery: 'What would you like changed?',
  adopt_pet: 'Who is coming home?',
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
  onRun: (params: Record<string, string | number>) => void;
  onClose: () => void;
}): React.JSX.Element {
  const p = game.player;
  const [first, setFirst] = useState(p.first);
  const [last, setLast] = useState(p.last);
  const [look, setLook] = useState(p.look);
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
        <div className="makeover">
          <Portrait
            look={look}
            age={p.age}
            gender={p.gender}
            size={110}
            label="Your new look"
            testId="makeover-portrait"
          />
          <LookBuilder
            look={look}
            age={p.age}
            gender={p.gender}
            tabs={MAKEOVER_TABS}
            onChange={setLook}
          />
          <button
            className="primary"
            type="button"
            data-testid="opt-look-go"
            disabled={JSON.stringify(look) === JSON.stringify(p.look)}
            onClick={() =>
              onRun({
                hair: look.hair,
                hairColor: look.hairColor,
                facialHair: look.facialHair,
                glasses: look.glasses,
                top: look.top,
                topColor: look.topColor,
                earrings: look.earrings,
                hat: look.hat,
              })
            }
          >
            Book it
          </button>
        </div>
      )}
      {activity === 'plastic_surgery' && (
        <div className="makeover">
          <Portrait
            look={look}
            age={p.age}
            gender={p.gender}
            size={110}
            label="The face you are asking for"
            testId="surgery-portrait"
          />
          <LookBuilder
            look={look}
            age={p.age}
            gender={p.gender}
            tabs={SURGERY_TABS}
            onChange={setLook}
          />
          <p className="muted small">
            Most patients get what they asked for. Some get a long nap and a bill. A few get
            complications.
          </p>
          <button
            className="primary"
            type="button"
            data-testid="opt-surgery-go"
            disabled={JSON.stringify(look) === JSON.stringify(p.look)}
            onClick={() =>
              onRun({
                face: look.face,
                eyes: look.eyes,
                brows: look.brows,
                nose: look.nose,
                mouth: look.mouth,
              })
            }
          >
            Book the operation
          </button>
        </div>
      )}
      {activity === 'adopt_pet' && <PetPicker game={game} onRun={onRun} />}
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
