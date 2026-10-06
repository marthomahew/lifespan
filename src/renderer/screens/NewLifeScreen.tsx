import { go, startLife } from '../store/app';
import { Preview } from './newlife/Preview';
import {
  IdentitySection,
  LookSection,
  NatureSection,
  OriginsSection,
  StatsSection,
} from './newlife/Sections';
import { DICE, START, toOptions, useNewLife } from './newlife/useNewLife';
import { useState } from 'react';
import { ChallengePicker } from './ChallengePicker';

/** Random in one click, or built piece by piece with a live preview of who you'll be. */
export function NewLifeScreen(): React.JSX.Element {
  const [d, set] = useNewLife();
  const [challenges, setChallenges] = useState(false);
  const begin = (e?: React.FormEvent): void => {
    e?.preventDefault();
    const { opts, seed } = toOptions(d);
    startLife(opts, seed);
  };
  const rollAll = (): void =>
    set((cur) => Object.values(DICE).reduce((acc, roll) => roll(acc), { ...cur }));
  return (
    <div className="screen" data-testid="new-life-screen">
      <div className="screen-head">
        <button className="ghost" data-testid="btn-back" onClick={() => go('start')}>
          ← Back
        </button>
        <h1>New Life</h1>
        <span className="grow" />
        <button className="ghost" data-testid="btn-reset-life" onClick={() => set(() => START)}>
          Clear
        </button>
        <button className="ghost" data-testid="btn-challenges" onClick={() => setChallenges(true)}>
          🏆 Challenges
        </button>
        <button className="ghost" data-testid="btn-roll-all" onClick={rollAll}>
          🎲 Roll everything
        </button>
        <button data-testid="btn-random-life" onClick={() => startLife({})}>
          🎲 Random life
        </button>
      </div>
      <form className="newlife" onSubmit={begin} data-testid="custom-form" aria-label="Custom life">
        <div className="nl-sections">
          <IdentitySection d={d} set={set} />
          <LookSection d={d} set={set} />
          <OriginsSection d={d} set={set} />
          <NatureSection d={d} set={set} />
          <StatsSection d={d} set={set} />
        </div>
        <Preview d={d} onSeed={(v) => set({ seed: v })}>
          <button className="primary big" type="submit" data-testid="btn-begin">
            Begin life
          </button>
        </Preview>
      </form>
      {challenges && (
        <ChallengePicker
          own={toOptions(d).opts}
          {...(toOptions(d).seed !== undefined ? { seed: toOptions(d).seed } : {})}
          onClose={() => setChallenges(false)}
        />
      )}
    </div>
  );
}
