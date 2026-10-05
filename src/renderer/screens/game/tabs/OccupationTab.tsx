import { useState } from 'react';
import { type GameState } from '../../../../engine';
import { occupationLabel } from '../../../../engine/occupation';
import { CareerSection } from '../occupation/CareerSection';
import { EducationSection } from '../occupation/EducationSection';
import { MilitarySection, MusicSection } from '../occupation/ServiceSection';
import { LegalSection } from '../occupation/LegalSection';

export function OccupationTab({ game }: { game: GameState }): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="col" data-testid="occupation">
      <section className="panel-section">
        <h3 className="section-title">Now</h3>
        <p data-testid="occupation-now">{occupationLabel(game)}</p>
        {game.player.age < 5 && (
          <p className="muted small empty-hint">
            School starts at 5, jobs at 14, and the rest of life after that. For now, the Activities
            and Relationships tabs are where the action is.
          </p>
        )}
      </section>
      {error && (
        <p className="error small" role="alert" data-testid="occupation-error">
          {error}
        </p>
      )}
      <EducationSection game={game} onError={setError} />
      <CareerSection game={game} onError={setError} />
      <MilitarySection game={game} onError={setError} />
      <MusicSection game={game} onError={setError} />
      <LegalSection game={game} />
    </div>
  );
}
