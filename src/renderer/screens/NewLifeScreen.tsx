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
import { Templates } from './newlife/Templates';

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
    <div className="screen cl" data-testid="new-life-screen">
      <div className="cl-top">
        <button className="ghost" data-testid="btn-back" onClick={() => go('start')}>
          ← Back
        </button>
        <div className="cl-title">
          <h1>Create a life</h1>
          <p className="muted">
            Fill in as much or as little as you like. Blanks are left to fate.
          </p>
        </div>
        <div className="cl-actions">
          <button className="ghost" data-testid="btn-reset-life" onClick={() => set(() => START)}>
            Clear
          </button>
          <button
            className="ghost"
            data-testid="btn-challenges"
            onClick={() => setChallenges(true)}
          >
            🏆 Challenges
          </button>
          <button data-testid="btn-roll-all" onClick={rollAll}>
            🎲 Roll everything
          </button>
          <button data-testid="btn-random-life" onClick={() => startLife({})}>
            ⚡ Random life
          </button>
        </div>
      </div>
      <Templates d={d} onLoad={(t) => set(() => t)} />
      <form className="cl-body" onSubmit={begin} data-testid="custom-form" aria-label="Custom life">
        <Preview d={d} onSeed={(v) => set({ seed: v })}>
          <button className="primary cl-begin" type="submit" data-testid="btn-begin">
            Begin life →
          </button>
        </Preview>
        <div className="cl-sections">
          <IdentitySection d={d} set={set} />
          <LookSection d={d} set={set} />
          <OriginsSection d={d} set={set} />
          <NatureSection d={d} set={set} />
          <StatsSection d={d} set={set} />
        </div>
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
