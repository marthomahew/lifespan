import { useState } from 'react';
import { type GameState } from '../../../../engine';
import { occupationLabel } from '../../../../engine/occupation';
import { CareerSection } from '../occupation/CareerSection';
import { EducationSection } from '../occupation/EducationSection';
import { MilitarySection, MusicSection } from '../occupation/ServiceSection';
import { LegalSection } from '../occupation/LegalSection';
import { BusinessSection } from '../occupation/BusinessSection';
import { WorkTime } from './FreeTime';
import { PursuitsSection } from '../occupation/PursuitsSection';
import { FameSection } from '../occupation/FameSection';

export function OccupationTab({ game }: { game: GameState }): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="col" data-testid="occupation">
      <section className="panel-section">
        <h3 className="section-title">Now</h3>
        <p data-testid="occupation-now">{occupationLabel(game)}</p>
        {game.legal.fugitive && (
          <p className="muted small" data-testid="on-the-run">
            {`Out since ${game.legal.fugitive.since}, with ${game.legal.fugitive.owed} years still owed. `}
            {game.player.flags.includes('false_papers')
              ? 'Your new papers open doors, carefully.'
              : 'No papers: only cash-in-hand work, no benefits, no borders.'}{' '}
            The longer you stay out, the colder the trail. You can turn yourself in from Activities.
          </p>
        )}
        {game.player.age < 5 && (
          <p className="muted small empty-hint">
            School starts at 5, jobs at 14, and the rest of life after that. For now, the Activities
            and Relationships tabs are where the action is.
          </p>
        )}
      </section>
      {/* Career moves here have their own yearly work time, apart from free time. */}
      {game.player.age >= 6 && !game.legal.prison && game.settings.freeTime !== false && (
        <WorkTime game={game} />
      )}
      {error && (
        <p className="error small" role="alert" data-testid="occupation-error">
          {error}
        </p>
      )}
      <EducationSection game={game} onError={setError} />
      <CareerSection game={game} onError={setError} />
      <BusinessSection game={game} onError={setError} />
      <MilitarySection game={game} onError={setError} />
      <PursuitsSection game={game} onError={setError} />
      <FameSection game={game} onError={setError} />
      <MusicSection game={game} onError={setError} />
      <LegalSection game={game} />
    </div>
  );
}
