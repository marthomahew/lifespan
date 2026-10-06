import { TRAIT_BY_ID } from '../../../../content/traits';
import type { GameState, Npc } from '../../../../engine';
import { npcLook } from '../../../../engine/look';
import { dateCandidates, type Candidate } from '../../../../engine/systems/dating';
import { Portrait } from '../../../portrait/Portrait';

/** A stand-in NPC so a candidate's card shows the face they will have. */
function asNpc(c: Candidate): Npc {
  return {
    id: -1,
    first: c.first,
    last: c.last,
    gender: c.gender,
    age: c.age,
    birthYear: 0,
    alive: true,
    roles: ['partner'],
    rel: 50,
    traits: c.traits,
    stats: { health: 80, smarts: 50, looks: 60, happiness: 70 },
    job: c.job,
    country: 'us',
    memory: [],
    flags: [],
    parentIds: [],
    lastContact: 0,
    money: 0,
    attraction: 'everyone',
    fertility: 50,
    lookSeed: c.lookSeed,
  };
}

/** Tonight's possible dates. Pick one to ask out; chemistry still decides how it goes. */
export function DatePicker({
  game,
  activity,
  onRun,
}: {
  game: GameState;
  activity: string;
  onRun: (params: Record<string, string | number>) => void;
}): React.JSX.Element {
  const people = dateCandidates(game, activity);
  return (
    <div className="date-picker">
      <p className="muted small">
        Pick someone to ask out. Chemistry still decides how the evening goes.
      </p>
      <div className="date-cards">
        {people.map((c, i) => (
          <div key={c.first} className="card pad date-card" data-testid={`date-${i}`}>
            <Portrait look={npcLook(game, asNpc(c))} age={c.age} gender={c.gender} size={72} />
            <strong>
              {c.first} {c.last}, {c.age}
            </strong>
            <span className="muted small">{c.job}</span>
            <span className="small">
              {c.traits
                .map((t) => `${TRAIT_BY_ID[t]?.emoji ?? ''} ${TRAIT_BY_ID[t]?.label ?? t}`)
                .join(' · ')}
            </span>
            <span className="small date-hook">{c.hook}</span>
            <span className="muted small">
              {c.wantsKids
                ? 'Wants children one day'
                : c.age > 45
                  ? 'Past the age for children'
                  : 'Not the parenting type'}{' '}
              · {c.wantsMarriage ? 'open to marriage' : 'not the marrying kind'}
            </span>
            <button
              className="primary"
              data-testid={`date-pick-${i}`}
              onClick={() => onRun({ pick: i })}
            >
              Ask them out
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
